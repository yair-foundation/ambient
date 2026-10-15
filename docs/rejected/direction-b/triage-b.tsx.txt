/**
 * DIRECTION B — GUIDED REVIEW.
 * Product decision supported: "What should I do with this lead, right now?"
 * One lead at a time, most urgent first, with a recommended next action. Resolve what is missing in
 * place, decide, and the next lead takes its place. Built for working a queue to zero.
 */
import * as React from "react"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "@/components/ui/icon"
import { Skeleton } from "@/components/ui/skeleton"

import { isOpen, compareByUrgency } from "../triage/rules"
import { useTriage, type LogEntry, type TriageStore } from "../triage/store"
import { slaText } from "../triage/format"
import { ReviewCard } from "./review-card"

export default function TriageB({ store: injected }: { store?: TriageStore } = {}) {
  const { load, error, leads, log, store } = useTriage(injected)
  const [skipped, setSkipped] = React.useState<string[]>([])
  const [pinnedId, setPinnedId] = React.useState<string | null>(null)
  const [banner, setBanner] = React.useState<LogEntry | null>(null)

  const open = leads.filter(isOpen).sort(compareByUrgency)
  const ordered = [...open.filter((l) => !skipped.includes(l.id)), ...open.filter((l) => skipped.includes(l.id))]
  const pinned = pinnedId ? open.find((l) => l.id === pinnedId) : undefined
  const current = pinned ?? ordered[0]
  const upNext = ordered.filter((l) => l.id !== current?.id).slice(0, 2)
  const done = leads.length - open.length

  async function undo(entry: LogEntry) {
    await store.undo(entry.id)
    setBanner(null)
    setSkipped((s) => s.filter((id) => id !== entry.before.id))
    setPinnedId(entry.before.id)
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <div>
        <h1 className="text-xl font-semibold">Lead triage</h1>
        {load === "ready" && leads.length > 0 && (
          <div className="mt-1 grid gap-1">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {done} of {leads.length} reviewed
            </p>
            <div
              role="progressbar"
              aria-label="Leads reviewed"
              aria-valuemin={0}
              aria-valuemax={leads.length}
              aria-valuenow={done}
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            >
              <div className="h-full bg-primary transition-all" style={{ width: `${(done / leads.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {banner && (
        <Alert role="status">
          <Icon name="check" />
          <AlertTitle>{banner.message}</AlertTitle>
          <AlertDescription>{open.length ? `${open.length} left to review.` : "That was the last one."}</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => void undo(banner)}>
              Undo
            </Button>
          </AlertAction>
        </Alert>
      )}

      {load === "error" ? (
        <Alert>
          <Icon name="alert" className="text-destructive" />
          <AlertTitle className="text-destructive">Couldn't load leads</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => void store.load({ retry: true })}>
              Retry
            </Button>
          </AlertAction>
        </Alert>
      ) : load === "loading" ? (
        <div className="grid gap-2" aria-busy="true">
          <p className="sr-only" role="status">Loading leads</p>
          <Skeleton className="h-8 w-2/3" aria-hidden />
          <Skeleton className="h-64 w-full" aria-hidden />
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="font-medium">No leads need triage</p>
            <p className="text-sm text-muted-foreground">New leads appear here as they arrive.</p>
          </CardContent>
        </Card>
      ) : !current ? (
        <Card>
          <CardContent className="grid gap-3 py-6">
            <div>
              <h2 className="text-lg font-semibold">Queue clear</h2>
              <p className="text-sm text-muted-foreground">Every lead has a decision. Here is what you did:</p>
            </div>
            <ul className="grid gap-2">
              {log.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                  <span>{e.message}</span>
                  <Button size="sm" variant="outline" onClick={() => void undo(e)}>
                    Undo
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <>
          <ReviewCard
            key={current.id}
            lead={current}
            store={store}
            canSkip={open.length > 1}
            onSkip={() => {
              setPinnedId(null)
              setSkipped((s) => [...s.filter((id) => id !== current.id), current.id])
            }}
            onDecided={(entry) => {
              setBanner(entry)
              setPinnedId(null)
            }}
          />
          {upNext.length > 0 && (
            <section aria-label="Up next" className="text-sm text-muted-foreground">
              <h2 className="mb-1 text-xs font-medium">Up next</h2>
              <ul className="grid gap-1">
                {upNext.map((l) => (
                  <li key={l.id} className="flex justify-between gap-2 rounded-md border px-3 py-2">
                    <span className="text-foreground">{l.company}</span>
                    <span>{slaText(l).text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
