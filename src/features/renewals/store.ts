/**
 * The renewals store: accounts and the renewal plans recorded on them.
 * Like the triage store it behaves like a network client (latency, failure) so loading, empty and
 * error are real states. Review switches (URL query): ?state=loading | empty | error  and  ?fail=save
 */
import * as React from "react"

import { SEED_RENEWALS, type RenewalAccount, type RenewalPlan } from "@/data/renewals"
import { buildPlan, validatePlan, OUTCOME_LABEL, type PlanInput } from "./rules"

export interface PlanLogEntry {
  id: string
  accountId: string
  message: string
  /** The plan as it stood before this save (undefined: there was none), for undo. */
  before?: RenewalPlan
}

export type LoadState = "loading" | "error" | "ready"
export interface RenewalSnapshot {
  load: LoadState
  error?: string
  accounts: RenewalAccount[]
  plans: Record<string, RenewalPlan>
  log: PlanLogEntry[]
}
export interface StoreOptions {
  latencyMs?: number
  mode?: "normal" | "loading" | "empty" | "error"
  failSave?: boolean
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function createRenewalStore(seed: RenewalAccount[] = SEED_RENEWALS, opts: StoreOptions = {}) {
  const latency = opts.latencyMs ?? 450
  let saveFailures = opts.failSave ? 1 : 0
  let snap: RenewalSnapshot = { load: "loading", accounts: [], plans: {}, log: [] }
  let seq = 0
  const listeners = new Set<() => void>()
  const set = (next: Partial<RenewalSnapshot>) => {
    snap = { ...snap, ...next }
    listeners.forEach((l) => l())
  }
  let inflight: Promise<void> | null = null

  /** In review mode "error" every automatic load fails and only an explicit retry succeeds. */
  function load(options: { retry?: boolean } = {}): Promise<void> {
    if (inflight && !options.retry) return inflight
    inflight = (async () => {
      set({ load: "loading", error: undefined })
      if (opts.mode === "loading") return new Promise<void>(() => {})
      await wait(latency)
      if (opts.mode === "error" && !options.retry) {
        set({ load: "error", error: "We couldn't load your renewals. Check your connection and try again." })
        return
      }
      set({ load: "ready", accounts: opts.mode === "empty" ? [] : seed.map((a) => ({ ...a })) })
    })().finally(() => {
      inflight = null
    })
    return inflight
  }

  /** Record a plan, or revise the one already there. The rules are enforced here, not only in the form. */
  async function savePlan(accountId: string, input: PlanInput): Promise<{ ok: true; entry: PlanLogEntry } | { ok: false; error: string }> {
    await wait(latency)
    if (saveFailures > 0) {
      saveFailures -= 1
      return { ok: false, error: "The plan wasn't saved. Nothing changed; try again." }
    }
    const account = snap.accounts.find((a) => a.id === accountId)
    if (!account) return { ok: false, error: "That account is no longer in your renewals." }
    const errors = validatePlan(account, input)
    const first = Object.values(errors)[0]
    if (first) return { ok: false, error: first }
    const before = snap.plans[accountId]
    const plan = buildPlan(account, input, before)
    const entry: PlanLogEntry = {
      id: `P-${++seq}`,
      accountId,
      before,
      message: `${before ? "Plan revised" : "Plan recorded"} for ${account.name}: ${OUTCOME_LABEL[plan.outcome].toLowerCase()}.`,
    }
    set({ plans: { ...snap.plans, [accountId]: plan }, log: [entry, ...snap.log] })
    return { ok: true, entry }
  }

  async function undo(entryId: string): Promise<boolean> {
    const entry = snap.log.find((e) => e.id === entryId)
    if (!entry) return false
    await wait(latency / 2)
    const plans = { ...snap.plans }
    if (entry.before) plans[entry.accountId] = entry.before
    else delete plans[entry.accountId]
    set({ plans, log: snap.log.filter((e) => e.id !== entryId) })
    return true
  }

  return {
    load,
    savePlan,
    undo,
    getSnapshot: () => snap,
    subscribe: (l: () => void) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
  }
}

export type RenewalStore = ReturnType<typeof createRenewalStore>

const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search)
const stateParam = params.get("state")

/** The app's store. Review switches are read once from the URL. */
export const renewalStore = createRenewalStore(SEED_RENEWALS, {
  mode: stateParam === "loading" || stateParam === "empty" || stateParam === "error" ? stateParam : "normal",
  failSave: params.get("fail") === "save",
})

export function useRenewals(store: RenewalStore = renewalStore) {
  const snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
  React.useEffect(() => {
    if (store.getSnapshot().load === "loading" && store.getSnapshot().accounts.length === 0) void store.load()
  }, [store])
  return { ...snapshot, store }
}
