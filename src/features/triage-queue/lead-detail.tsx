import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { NOW, type Lead } from "@/data/clientops"
import { cn } from "@/lib/utils"

import { ago, STATUS_LABEL } from "../triage/format"
import { BlockerList, GapEditor, LeadFacts, ReadinessBadge, Sla, Warnings } from "../triage/parts"
import { ACTION_LABEL, DISQUALIFY_REASONS, actionImpact, assess, fmtDate, type ActionId } from "../triage/rules"
import { useDecision } from "../triage/use-decision"
import type { LogEntry, TriageStore } from "../triage/store"

const defaultRevisit = () => new Date(NOW + 30 * 86_400_000).toISOString().slice(0, 10)
const today = () => new Date(NOW).toISOString().slice(0, 10)
const ORDER: ActionId[] = ["qualify", "request_info", "nurture", "disqualify"]
/** The other actions, in a fixed order with the quiet, irreversible-feeling one (disqualify) last. */
const OTHERS = (recommended: ActionId) => ORDER.filter((id) => id !== recommended)

export function LeadDetail({
  lead,
  store,
  log,
  onDecided,
  compact,
}: {
  lead: Lead
  store: TriageStore
  log: LogEntry[]
  onDecided: (entry: LogEntry, leadId: string) => void
  compact?: boolean
}) {
  const a = assess(lead)
  const { pending, error, run, patch } = useDecision(store)
  const [mode, setMode] = React.useState<"nurture" | "disqualify" | null>(null)
  const [revisitOn, setRevisitOn] = React.useState(defaultRevisit)
  const [reason, setReason] = React.useState<string>(
    a.blockers.some((b) => b.kind === "region") ? "Region not supported" : lead.duplicateOf && !lead.duplicateResolved ? "Duplicate of existing account" : ""
  )

  const open = lead.status === "new"
  const lastEntry = log.find((e) => e.before.id === lead.id)

  async function decide(action: ActionId) {
    const entry = await run({ leadId: lead.id, action, reason: action === "disqualify" ? reason : undefined, revisitOn: action === "nurture" ? revisitOn : undefined })
    if (entry) onDecided(entry, lead.id)
  }

  function choose(action: ActionId) {
    if (action === "nurture" || action === "disqualify") setMode(mode === action ? null : action)
    else void decide(action)
  }

  return (
    <article className="grid gap-4 rounded-lg border p-4" aria-labelledby={`h-${lead.id}`}>
      <header className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={`h-${lead.id}`} className="text-lg font-semibold">
            {lead.company}
          </h2>
          <ReadinessBadge lead={lead} />
          <Sla lead={lead} />
        </div>
        <p className="text-sm text-muted-foreground">
          {lead.contact.name} · {lead.contact.email}
        </p>
      </header>

      <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground">
        “{lead.message}”<span className="mt-1 block text-xs">Received {ago(lead.receivedAt)} via {lead.source}</span>
      </blockquote>

      <LeadFacts lead={lead} />

      {open && (a.blockers.length > 0 || a.gaps.length > 0 || a.warnings.length > 0) && (
        <section aria-label="Before you decide" className="grid gap-3">
          <h3 className="text-sm font-medium">Before you decide</h3>
          {a.blockers.length > 0 && <BlockerList lead={lead} blockers={a.blockers} onPatch={(c) => void patch(lead, c)} disabled={pending} />}
          {a.gaps.length > 0 && (
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                Missing: {a.gaps.map((g) => g.label.toLowerCase()).join(", ")}. Fill in what you know, or request it from {lead.contact.name}.
              </p>
              <GapEditor lead={lead} gaps={a.gaps} onPatch={(c) => void patch(lead, c)} disabled={pending} />
            </div>
          )}
          <Warnings warnings={a.warnings} />
        </section>
      )}

      {open ? (
        <section aria-label="Decide" className="grid gap-3 border-t pt-4">
          <h3 className="text-sm font-medium">Next step</h3>
          <div className="grid gap-1 text-sm">
            <p>
              <span className="font-medium">Recommended: {ACTION_LABEL[a.recommended]}.</span>{" "}
              <span className="text-muted-foreground">{a.recommendedWhy}</span>
            </p>
            <p className="text-muted-foreground">{actionImpact(lead, a.recommended)}</p>
          </div>
          <div className={cn("grid gap-2", compact && "sticky bottom-0 bg-background py-2")}>
            <div>
              <Button
                className="w-full sm:w-auto"
                disabled={pending}
                aria-expanded={a.recommended === "nurture" || a.recommended === "disqualify" ? mode === a.recommended : undefined}
                onClick={() => choose(a.recommended)}
              >
                {ACTION_LABEL[a.recommended]}
              </Button>
            </div>
            <div role="group" aria-label="Other actions" className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Or</span>
              {OTHERS(a.recommended).map((id) => (
                <Button
                  key={id}
                  size="sm"
                  variant={id === "disqualify" ? "ghost" : "outline"}
                  disabled={pending || !a.allowed[id].ok}
                  aria-expanded={id === "nurture" || id === "disqualify" ? mode === id : undefined}
                  onClick={() => choose(id)}
                >
                  {ACTION_LABEL[id]}
                </Button>
              ))}
              {pending && <span role="status" className="text-sm text-muted-foreground">Saving…</span>}
            </div>
          </div>
          <ul className="grid gap-0.5 text-xs text-muted-foreground">
            {ORDER.filter((id) => !a.allowed[id].ok).map((id) => (
              <li key={id}>{ACTION_LABEL[id]} unavailable. {a.allowed[id].why}</li>
            ))}
          </ul>

          {mode === "nurture" && (
            <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); void decide("nurture") }}>
              <label className="grid gap-1 text-sm">
                Revisit on
                <Input type="date" min={today()} value={revisitOn} onChange={(e) => setRevisitOn(e.target.value)} required />
              </label>
              <Button type="submit" disabled={pending || !revisitOn}>Move to nurture</Button>
            </form>
          )}
          {mode === "disqualify" && (
            <form className="flex flex-wrap items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (reason) void decide("disqualify") }}>
              <div className="grid gap-1 text-sm">
                Reason
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button type="button" variant="outline" />}>
                    {reason || "Choose a reason"} <Icon name="chevron-down" size={14} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuRadioGroup value={reason} onValueChange={(v) => setReason(String(v))}>
                      {DISQUALIFY_REASONS.map((r) => (
                        <DropdownMenuRadioItem key={r} value={r}>{r}</DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* not variant="destructive": its red-on-red-tint recipe measures 3.85:1 (see docs/proposals/ds-bug-fixes.md) */}
              <Button type="submit" variant="outline" className="border-destructive/40 text-destructive" disabled={pending || !reason}>Disqualify</Button>
            </form>
          )}
          {error && (
            <Alert>
          <Icon name="alert" className="text-destructive" />
              <AlertTitle className="text-destructive">Not saved</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </section>
      ) : (
        <section aria-label="Decision" className="grid gap-2 border-t pt-4 text-sm">
          <p>
            <span className="font-medium">{STATUS_LABEL[lead.status]}</span>
            {lead.owner ? `, assigned to ${lead.owner}` : ""}
            {lead.revisitOn ? `, revisit on ${fmtDate(lead.revisitOn)}` : ""}
            {lead.reason ? `: ${lead.reason.toLowerCase()}` : ""}
          </p>
          {lastEntry && (
            <div>
              <Button variant="outline" size="sm" disabled={pending} onClick={() => void store.undo(lastEntry.id)}>
                Undo decision
              </Button>
            </div>
          )}
        </section>
      )}
    </article>
  )
}
