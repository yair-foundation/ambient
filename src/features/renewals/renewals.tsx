/**
 * Renewal risk review. Product decision supported: "Which renewing accounts are at risk, why, and what will I do
 * before the renewal date?" Reuses the approved queue-workspace pattern (list beside the selected record, a
 * Sheet on phones) from lead triage; it is built locally in this feature, not promoted (see the decision log).
 */
import * as React from "react"

import { UndoNotice } from "@/components/shared/undo-notice"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import type { RenewalAccount } from "@/data/renewals"
import { cn } from "@/lib/utils"

import { money } from "../triage/format"
import { AccountDetail } from "./account-detail"
import { RiskBadge } from "./parts"
import { OUTCOME_LABEL, compareByUrgency, fmtDay, renewsIn, summarize } from "./rules"
import { useRenewals, type PlanLogEntry, type RenewalStore } from "./store"

type Filter = "all" | "needs_plan" | "planned"
const FILTER_LABEL: Record<Filter, string> = { all: "All renewing", needs_plan: "Needs a plan", planned: "Planned" }

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}

export default function Renewals({ store: injected }: { store?: RenewalStore } = {}) {
  const { load, error, accounts, plans, store } = useRenewals(injected)
  const isMobile = useIsMobile()
  const [filter, setFilter] = React.useState<Filter>("all")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [banner, setBanner] = React.useState<PlanLogEntry | null>(null)

  const ordered = React.useMemo(() => [...accounts].sort(compareByUrgency), [accounts])
  const visible = ordered.filter((a) => filter === "all" || (filter === "planned") === !!plans[a.id])
  const s = summarize(accounts, plans)
  const counts: Record<Filter, number> = { all: s.total, needs_plan: s.withoutPlan, planned: s.withPlan }
  const selected: RenewalAccount | undefined = visible.find((a) => a.id === selectedId) ?? (isMobile ? undefined : (accounts.find((a) => a.id === selectedId) ?? visible[0]))

  function onSaved(entry: PlanLogEntry) {
    setBanner(entry)
    if (isMobile) setSelectedId(null) // close the sheet so the confirmation and Undo are in view
  }
  async function undo(entry: PlanLogEntry): Promise<boolean> {
    const ok = await store.undo(entry.id)
    if (ok) {
      setBanner(null)
      setSelectedId(entry.accountId)
    }
    return ok
  }

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-semibold">Renewal risk review</h1>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {load === "ready" ? `${s.total} accounts renewing in the next 90 days, ${s.withoutPlan} without a plan` : load === "loading" ? "Loading…" : ""}
        </p>
      </div>

      {banner && (
        <UndoNotice
          actionId={banner.id}
          message={banner.message}
          detail={`${s.withPlan} of ${s.total} accounts have a plan. ${money(s.arrAtRisk)} ARR at risk.`}
          onUndo={() => undo(banner)}
        />
      )}

      {load === "error" ? (
        <Alert variant="destructive">
          <Icon name="alert" />
          <AlertTitle>Couldn't load renewals</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => void store.load({ retry: true })}>
              Retry
            </Button>
          </AlertAction>
        </Alert>
      ) : load === "loading" ? (
        <div className="grid gap-3" aria-busy="true">
          <p className="sr-only" role="status">Loading renewals</p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-hidden>
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-5" aria-hidden>
            <div className="grid content-start gap-2 lg:col-span-2">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
            <Skeleton className="hidden h-96 w-full lg:col-span-3 lg:block" />
          </div>
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="font-medium">No renewals in the next 90 days</p>
            <p className="text-sm text-muted-foreground">Accounts appear here when their contract renews within 90 days.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <section aria-label="Portfolio summary">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <Stat label="ARR renewing" value={money(s.arrRenewing)} note={`${s.total} accounts`} />
              <Stat label="ARR at risk" value={money(s.arrAtRisk)} note={`${s.accountsAtRisk} accounts`} />
              <Stat label="With a plan" value={String(s.withPlan)} note={`of ${s.total} accounts`} />
              <Stat label="Without a plan" value={String(s.withoutPlan)} note={s.withoutPlan ? "still to plan" : "all planned"} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Revenue is annual recurring revenue in US dollars. An account counts as at risk when its plan says at risk or expected to churn; until it has a plan, when its assessed risk is high.
            </p>
          </section>

          <div className="grid gap-4 lg:grid-cols-5">
            <section aria-label="Renewing accounts" className="grid content-start gap-3 lg:col-span-2">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList className="group-data-horizontal/tabs:h-auto grid w-full grid-cols-3 gap-1 sm:inline-flex sm:w-fit">
                  {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => (
                    <TabsTrigger key={f} value={f} className="h-9">
                      {FILTER_LABEL[f]} <span className="ml-1">{counts[f]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              {visible.length === 0 ? (
                <p className="rounded-md border p-4 text-sm text-muted-foreground">
                  {filter === "needs_plan" ? "Every renewing account has a plan." : "No plans yet. Accounts you plan appear here."}
                </p>
              ) : (
                <ul className="grid gap-1" aria-label={`${FILTER_LABEL[filter]} accounts`}>
                  {visible.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        aria-current={selected?.id === a.id ? "true" : undefined}
                        onClick={() => setSelectedId(a.id)}
                        className={cn(
                          "grid w-full gap-1 rounded-md border p-3 text-left outline-none transition-colors hover:border-foreground/40 focus-visible:ring-3 focus-visible:ring-ring/50",
                          selected?.id === a.id && "border-primary ring-1 ring-primary"
                        )}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="font-medium">{a.name}</span>
                          <RiskBadge account={a} />
                        </span>
                        <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{renewsIn(a)} · {fmtDay(a.renewalDate)}</span>
                          <span>{money(a.arr)}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{plans[a.id] ? `Plan: ${OUTCOME_LABEL[plans[a.id].outcome]}` : "No plan yet"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">
                Ordered by risk, weighted up as the renewal date gets closer. Ties go to the sooner renewal, then the larger ARR.
              </p>
            </section>

            {!isMobile && (
              <section aria-label="Account detail" className="lg:col-span-3">
                {selected ? (
                  <AccountDetail key={selected.id + (plans[selected.id]?.revision ?? 0)} account={selected} plan={plans[selected.id]} store={store} onSaved={onSaved} />
                ) : (
                  <p className="rounded-md border p-6 text-sm text-muted-foreground">Select an account to review it.</p>
                )}
              </section>
            )}
          </div>
        </>
      )}

      {isMobile && (
        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{selected?.name}</SheetTitle>
              <SheetDescription>Review the evidence, then record a plan.</SheetDescription>
            </SheetHeader>
            {selected && (
              <div className="px-4 pb-4">
                <AccountDetail key={selected.id + (plans[selected.id]?.revision ?? 0)} account={selected} plan={plans[selected.id]} store={store} onSaved={onSaved} />
              </div>
            )}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
