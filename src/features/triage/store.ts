/**
 * The triage store: one source of lead state for both directions.
 * It behaves like a network client (latency, failure) so loading, empty and
 * error states are real states of the product, not decorations.
 *
 * Review switches (URL query): ?state=loading | empty | error  and  ?fail=save
 */
import * as React from "react"

import { SEED_LEADS, type Lead } from "@/data/clientops"
import { applyDecision, type Decision } from "./rules"

export interface LogEntry {
  id: string
  at: number
  decision: Decision
  message: string
  /** The lead as it stood before the decision, for undo. */
  before: Lead
}

export type LoadState = "loading" | "error" | "ready"

export interface TriageSnapshot {
  load: LoadState
  error?: string
  leads: Lead[]
  log: LogEntry[]
}

export interface StoreOptions {
  latencyMs?: number
  mode?: "normal" | "loading" | "empty" | "error"
  failSave?: boolean
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function createTriageStore(seed: Lead[] = SEED_LEADS, opts: StoreOptions = {}) {
  const latency = opts.latencyMs ?? 450
  let saveFailures = opts.failSave ? 1 : 0
  let snap: TriageSnapshot = { load: "loading", leads: [], log: [] }
  let seq = 0
  const listeners = new Set<() => void>()
  const set = (next: Partial<TriageSnapshot>) => {
    snap = { ...snap, ...next }
    listeners.forEach((l) => l())
  }

  let inflight: Promise<void> | null = null

  /**
   * Load the leads. In review mode "error" every automatic load fails and only an explicit retry
   * (the Retry button) succeeds, so the error state is stable to look at and recoverable.
   */
  function load(options: { retry?: boolean } = {}): Promise<void> {
    if (inflight && !options.retry) return inflight
    inflight = (async () => {
      set({ load: "loading", error: undefined })
      if (opts.mode === "loading") return new Promise<void>(() => {}) // stays loading for review
      await wait(latency)
      if (opts.mode === "error" && !options.retry) {
        set({ load: "error", error: "We couldn't load your leads. Check your connection and try again." })
        return
      }
      set({ load: "ready", leads: opts.mode === "empty" ? [] : seed.map((l) => ({ ...l })) })
    })().finally(() => {
      inflight = null
    })
    return inflight
  }

  /** Edits to facts about a lead (filling a gap, confirming a duplicate). */
  async function patch(leadId: string, changes: Partial<Lead>): Promise<{ ok: true } | { ok: false; error: string }> {
    await wait(latency / 2)
    set({ leads: snap.leads.map((l) => (l.id === leadId ? { ...l, ...changes } : l)) })
    return { ok: true }
  }

  async function decide(d: Decision): Promise<{ ok: true; entry: LogEntry } | { ok: false; error: string }> {
    await wait(latency)
    if (saveFailures > 0) {
      saveFailures -= 1
      return { ok: false, error: "The decision wasn't saved. Nothing changed; try again." }
    }
    const lead = snap.leads.find((l) => l.id === d.leadId)
    if (!lead) return { ok: false, error: "That lead no longer exists." }
    const res = applyDecision(lead, d)
    if (!res.ok) return res
    const entry: LogEntry = { id: `D-${++seq}`, at: Date.now(), decision: d, message: res.message, before: lead }
    set({
      leads: snap.leads.map((l) => (l.id === lead.id ? res.lead : l)),
      log: [entry, ...snap.log],
    })
    return { ok: true, entry }
  }

  async function undo(entryId: string): Promise<boolean> {
    const entry = snap.log.find((e) => e.id === entryId)
    if (!entry) return false
    await wait(latency / 2)
    set({
      leads: snap.leads.map((l) => (l.id === entry.before.id ? entry.before : l)),
      log: snap.log.filter((e) => e.id !== entryId),
    })
    return true
  }

  return {
    load,
    patch,
    decide,
    undo,
    getSnapshot: () => snap,
    subscribe: (l: () => void) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
  }
}

export type TriageStore = ReturnType<typeof createTriageStore>

const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search)
const stateParam = params.get("state")

/** The app's store. Review switches are read once from the URL. */
export const triageStore = createTriageStore(SEED_LEADS, {
  mode: stateParam === "loading" || stateParam === "empty" || stateParam === "error" ? stateParam : "normal",
  failSave: params.get("fail") === "save",
})

export function useTriage(store: TriageStore = triageStore) {
  const snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
  React.useEffect(() => {
    if (store.getSnapshot().load === "loading" && store.getSnapshot().leads.length === 0) void store.load()
  }, [store])
  return { ...snapshot, store }
}
