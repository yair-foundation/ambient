/**
 * DIRECTION A — QUEUE WORKSPACE.
 * Product decision supported: "Which lead needs me most, and where does everything stand?"
 * The whole queue stays on screen next to the selected lead (a master-detail pane on desktop,
 * a bottom sheet on phones). Scan, filter, jump between leads, decide without losing the queue.
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
import type { Lead } from "@/data/clientops"
import { cn } from "@/lib/utils"

import { money } from "../triage/format"
import { ReadinessBadge, Sla } from "../triage/parts"
import { assess, compareByUrgency, isOpen } from "../triage/rules"
import { useTriage, type LogEntry, type TriageStore } from "../triage/store"
import { LeadDetail } from "./lead-detail"

type Filter = "open" | "ready" | "needs_info" | "blocked" | "decided"

const FILTER_LABEL: Record<Filter, string> = {
  open: "All open",
  ready: "Ready",
  needs_info: "Needs info",
  blocked: "Blocked",
  decided: "Decided",
}

function inFilter(l: Lead, f: Filter) {
  if (f === "decided") return !isOpen(l)
  if (!isOpen(l)) return false
  return f === "open" || assess(l).readiness === f
}

export default function TriageQueue({ store: injected }: { store?: TriageStore } = {}) {
  const { load, error, leads, log, store } = useTriage(injected)
  const isMobile = useIsMobile()
  const [filter, setFilter] = React.useState<Filter>("open")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [banner, setBanner] = React.useState<LogEntry | null>(null)
  const rowRefs = React.useRef(new Map<string, HTMLButtonElement>())
  // After a decision the decided lead's controls disappear; keep keyboard focus in the queue.
  const focusAfter = React.useRef<string | null>(null)
  React.useEffect(() => {
    if (focusAfter.current) {
      rowRefs.current.get(focusAfter.current)?.focus()
      focusAfter.current = null
    }
  })

  const open = leads.filter(isOpen)
  const visible = [...leads.filter((l) => inFilter(l, filter))].sort((a, b) => (isOpen(a) && isOpen(b) ? compareByUrgency(a, b) : 0))
  const overdue = open.filter((l) => assess(l).slaHoursLeft < 0).length
  const counts: Record<Filter, number> = {
    open: open.length,
    ready: leads.filter((l) => inFilter(l, "ready")).length,
    needs_info: leads.filter((l) => inFilter(l, "needs_info")).length,
    blocked: leads.filter((l) => inFilter(l, "blocked")).length,
    decided: leads.filter((l) => inFilter(l, "decided")).length,
  }

  // On desktop something is always selected (the most urgent lead); on a phone nothing is until tapped.
  const selected =
    visible.find((l) => l.id === selectedId) ?? (isMobile ? undefined : selectedId && leads.find((l) => l.id === selectedId) ? leads.find((l) => l.id === selectedId) : visible[0])

  function afterDecision(entry: LogEntry, decidedId: string) {
    setBanner(entry)
    const idx = visible.findIndex((l) => l.id === decidedId)
    const next = visible.filter((l) => l.id !== decidedId)[Math.max(0, idx)]
    setSelectedId(isMobile ? null : (next?.id ?? null))
    if (!isMobile) focusAfter.current = next?.id ?? null
  }

  async function undo(entry: LogEntry): Promise<boolean> {
    const restored = await store.undo(entry.id)
    if (!restored) return false
    setBanner(null) // the owning feature removes the notice once the prior state is back
    setSelectedId(entry.before.id)
    setFilter("open")
    return true
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    const dir = e.key === "ArrowDown" || e.key === "j" ? 1 : e.key === "ArrowUp" || e.key === "k" ? -1 : 0
    if (!dir || !selected) return
    e.preventDefault()
    const i = visible.findIndex((l) => l.id === selected.id)
    const next = visible[Math.min(visible.length - 1, Math.max(0, i + dir))]
    if (next) {
      setSelectedId(next.id)
      rowRefs.current.get(next.id)?.focus()
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Lead triage</h1>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {load === "ready" ? `${open.length} to triage${overdue ? `, ${overdue} overdue` : ""}` : load === "loading" ? "Loading…" : ""}
          </p>
        </div>
      </div>

      {banner && (
        <UndoNotice
          actionId={banner.id}
          message={banner.message}
          detail={open.length ? `${open.length} left to triage.` : "The queue is clear."}
          onUndo={() => undo(banner)}
        />
      )}

      {load === "error" ? (
        <Alert variant="destructive">
          <Icon name="alert" />
          <AlertTitle>Couldn't load leads</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => void store.load({ retry: true })}>
              Retry
            </Button>
          </AlertAction>
        </Alert>
      ) : load === "loading" ? (
        <div className="grid gap-3 lg:grid-cols-5" aria-busy="true">
          <p className="sr-only" role="status">Loading leads</p>
          <div className="grid content-start gap-2 lg:col-span-2" aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          <div className="hidden lg:col-span-3 lg:block" aria-hidden>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="font-medium">No leads need triage</p>
            <p className="text-sm text-muted-foreground">New leads appear here as they arrive.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <section aria-label="Lead queue" className="grid content-start gap-3 lg:col-span-2">
            <div>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList className="group-data-horizontal/tabs:h-auto grid w-full grid-cols-3 gap-1 sm:inline-flex sm:w-fit">
                  {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => (
                    <TabsTrigger key={f} value={f} className="h-9">
                      {FILTER_LABEL[f]} <span className="ml-1">{counts[f]}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            {visible.length === 0 ? (
              <p className="rounded-md border p-4 text-sm text-muted-foreground">
                {filter === "decided" ? "No decisions yet. Decided leads appear here." : `No ${FILTER_LABEL[filter].toLowerCase()} leads right now.`}
              </p>
            ) : (
              <ul className="grid gap-1" onKeyDown={onListKeyDown} aria-label={`${FILTER_LABEL[filter]} leads`}>
                {visible.map((l) => (
                  <li key={l.id}>
                    <button
                      ref={(el) => {
                        if (el) rowRefs.current.set(l.id, el)
                        else rowRefs.current.delete(l.id)
                      }}
                      type="button"
                      aria-current={selected?.id === l.id ? "true" : undefined}
                      onClick={() => setSelectedId(l.id)}
                      className={cn(
                        "grid w-full gap-1 rounded-md border p-3 text-left outline-none transition-colors hover:border-foreground/40 focus-visible:ring-3 focus-visible:ring-ring/50",
                        selected?.id === l.id && "border-primary ring-1 ring-primary"
                      )}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-medium">{l.company}</span>
                        <ReadinessBadge lead={l} />
                      </span>
                      <span className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{l.contact.name} · {l.source}</span>
                        <span>{money(l.estValue)}</span>
                      </span>
                      <Sla lead={l} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">
              Ordered by urgency: overdue first, highest value first; then soonest deadline.
            </p>
            <p className="hidden text-xs text-muted-foreground lg:block">
              <kbd className="rounded-sm border px-1">↑</kbd> <kbd className="rounded-sm border px-1">↓</kbd> or <kbd className="rounded-sm border px-1">j</kbd>/<kbd className="rounded-sm border px-1">k</kbd> to move through the queue.
            </p>
          </section>

          {!isMobile && (
            <section aria-label="Lead detail" className="lg:col-span-3">
              {selected ? (
                <LeadDetail key={selected.id} lead={selected} store={store} log={log} onDecided={afterDecision} />
              ) : (
                <p className="rounded-md border p-6 text-sm text-muted-foreground">Select a lead to review it.</p>
              )}
            </section>
          )}
        </div>
      )}

      {isMobile && (
        <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{selected?.company}</SheetTitle>
              <SheetDescription>Review the lead, then decide.</SheetDescription>
            </SheetHeader>
            {selected && <LeadDetail key={selected.id} lead={selected} store={store} log={log} onDecided={afterDecision} compact />}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

