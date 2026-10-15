/**
 * Atoms both triage directions use. They carry no layout opinion: each
 * direction decides where they go and how much of them to show.
 */
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import type { Budget, Lead, Timeline } from "@/data/clientops"
import { cn } from "@/lib/utils"

import { READINESS_LABEL, STATUS_LABEL, money, slaText } from "./format"
import { assess, type Assessment } from "./rules"

export function ReadinessBadge({ lead }: { lead: Lead }) {
  if (lead.status !== "new") return <Badge variant="outline">{STATUS_LABEL[lead.status]}</Badge>
  const r = assess(lead).readiness
  // "Blocked" uses outline + the destructive text role, not variant="destructive": that variant's
  // red-on-red-tint fails AA contrast at this size (a finding for the design system, see HARNESS_RESULTS.md).
  return r === "blocked" ? (
    <Badge variant="outline" className="border-destructive/40 text-destructive">
      <Icon name="alert" size={12} />
      {READINESS_LABEL[r]}
    </Badge>
  ) : (
    <Badge variant={r === "ready" ? "default" : "secondary"}>{READINESS_LABEL[r]}</Badge>
  )
}

export function Sla({ lead, className }: { lead: Lead; className?: string }) {
  if (lead.status !== "new") return null
  const s = slaText(lead)
  return (
    <span className={cn("text-xs", s.overdue ? "font-medium text-destructive" : "text-muted-foreground", className)}>
      {s.overdue && <Icon name="alert" size={12} className="mr-1 inline" />}
      {s.text}
    </span>
  )
}

export function LeadFacts({ lead }: { lead: Lead }) {
  const rows: [string, React.ReactNode][] = [
    ["Role", lead.contact.role],
    ["Industry", lead.industry],
    ["Region", lead.region],
    ["Team size", lead.teamSize ?? <Missing key="m1" />],
    ["Budget", lead.budget ?? <Missing key="m2" />],
    ["Timeline", lead.timeline ?? <Missing key="m3" />],
    ["Est. annual value", money(lead.estValue)],
  ]
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs text-muted-foreground">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Missing() {
  return <span className="text-muted-foreground">Not provided</span>
}

const BUDGETS: Budget[] = ["<$10k", "$10–50k", "$50k+"]
const TIMELINES: Timeline[] = ["This quarter", "Next quarter", "Exploring"]

/** Fill in missing qualification facts; each change is saved as it is made. */
export function GapEditor({
  lead,
  gaps,
  onPatch,
  disabled,
}: {
  lead: Lead
  gaps: Assessment["gaps"]
  onPatch: (changes: Partial<Lead>) => void
  disabled?: boolean
}) {
  const [size, setSize] = React.useState("")
  const sizeId = React.useId()
  return (
    <div className="grid gap-3">
      {gaps.map((g) => (
        <div key={g.field} className="grid gap-1">
          {g.field === "teamSize" ? (
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const n = Number(size)
                if (Number.isInteger(n) && n > 0) onPatch({ teamSize: n })
              }}
            >
              <label htmlFor={sizeId} className="grid gap-1 text-sm">
                {g.label} (from {lead.contact.name})
                <Input id={sizeId} type="number" min={1} inputMode="numeric" value={size} onChange={(e) => setSize(e.target.value)} className="w-32" disabled={disabled} />
              </label>
              <Button type="submit" variant="outline" size="sm" disabled={disabled || !(Number(size) > 0)}>
                Save team size
              </Button>
            </form>
          ) : (
            <div role="group" aria-label={g.label} className="grid gap-1">
              <span className="text-sm">{g.label}</span>
              <div className="flex flex-wrap gap-1">
                {(g.field === "budget" ? BUDGETS : TIMELINES).map((o) => (
                  <Button
                    key={o}
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => onPatch(g.field === "budget" ? { budget: o as Budget } : { timeline: o as Timeline })}
                  >
                    {o}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** Blockers with the one action the account manager can take on each. */
export function BlockerList({
  lead,
  blockers,
  onPatch,
  disabled,
}: {
  lead: Lead
  blockers: Assessment["blockers"]
  onPatch: (changes: Partial<Lead>) => void
  disabled?: boolean
}) {
  return (
    <ul className="grid gap-2">
      {blockers.map((b) => (
        <li key={b.kind} className="rounded-md border border-destructive/30 p-3 text-sm">
          <p className="font-medium">{b.label}</p>
          <p className="text-muted-foreground">{b.detail}</p>
          {b.kind === "duplicate" && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" disabled={disabled} onClick={() => onPatch({ duplicateResolved: true })}>
                It's a different company
              </Button>
              <span className="text-xs text-muted-foreground">
                If it is the same company, disqualify as a duplicate of {lead.duplicateOf?.name}.
              </span>
            </div>
          )}
          {!b.resolvable && <p className="mt-1 text-xs text-muted-foreground">This cannot be cleared from the lead.</p>}
        </li>
      ))}
    </ul>
  )
}

export function Warnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null
  return (
    <ul className="grid gap-1 text-sm text-muted-foreground">
      {warnings.map((w) => (
        <li key={w} className="flex items-start gap-2">
          <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
          {w}
        </li>
      ))}
    </ul>
  )
}
