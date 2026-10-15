import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NOW, type Lead } from "@/data/clientops"

import { ago } from "../triage/format"
import { BlockerList, GapEditor, LeadFacts, ReadinessBadge, Sla, Warnings } from "../triage/parts"
import { ACTION_LABEL, DISQUALIFY_REASONS, assess, type ActionId } from "../triage/rules"
import type { LogEntry, TriageStore } from "../triage/store"
import { useDecision } from "../triage/use-decision"

const ORDER: ActionId[] = ["qualify", "request_info", "nurture", "disqualify"]
const defaultRevisit = () => new Date(NOW + 30 * 86_400_000).toISOString().slice(0, 10)
const today = () => new Date(NOW).toISOString().slice(0, 10)

function impact(lead: Lead, id: ActionId, gaps: string[]): string {
  switch (id) {
    case "qualify":
      return `Assigns ${lead.company} to you and moves it into your qualified pipeline.`
    case "request_info":
      return `Asks ${lead.contact.name} for ${gaps.join(", ") || "the missing details"}. The lead leaves your queue until they reply.`
    case "nurture":
      return `Keeps ${lead.company} warm and brings it back to you on the date you choose.`
    case "disqualify":
      return `Closes ${lead.company} with a reason you can review later.`
  }
}

export function ReviewCard({
  lead,
  store,
  canSkip,
  onSkip,
  onDecided,
}: {
  lead: Lead
  store: TriageStore
  canSkip: boolean
  onSkip: () => void
  onDecided: (entry: LogEntry) => void
}) {
  const a = assess(lead)
  const { pending, error, run, patch } = useDecision(store)
  const [choice, setChoice] = React.useState<ActionId>(a.recommended)
  const [revisitOn, setRevisitOn] = React.useState(defaultRevisit)
  const [reason, setReason] = React.useState<string>(
    a.blockers.some((b) => b.kind === "region") ? "Region not supported" : lead.duplicateOf && !lead.duplicateResolved ? "Duplicate of existing account" : ""
  )
  const heading = React.useRef<HTMLHeadingElement>(null)
  React.useEffect(() => {
    heading.current?.focus({ preventScroll: false })
  }, [])

  const issues = a.gaps.length + a.blockers.length
  const gapLabels = a.gaps.map((g) => g.label.toLowerCase())
  const canConfirm = a.allowed[choice].ok && (choice !== "nurture" || !!revisitOn) && (choice !== "disqualify" || !!reason)

  async function confirm() {
    const entry = await run({ leadId: lead.id, action: choice, reason: choice === "disqualify" ? reason : undefined, revisitOn: choice === "nurture" ? revisitOn : undefined })
    if (entry) onDecided(entry)
  }

  return (
    <Card>
      <CardHeader className="gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold outline-none">
            {lead.company}
          </h2>
          <ReadinessBadge lead={lead} />
          <Sla lead={lead} />
        </div>
        <p className="text-sm text-muted-foreground">
          {lead.contact.name}, {lead.contact.role} · {lead.source}, {ago(lead.receivedAt)}
        </p>
      </CardHeader>
      <CardContent className="grid gap-5">
        <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground">“{lead.message}”</blockquote>
        <LeadFacts lead={lead} />

        <section aria-label="Recommendation" className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="flex items-start gap-2">
            <Icon name="sparkles" size={14} className="mt-0.5 shrink-0" />
            <span>
              <span className="font-medium">Recommended: {ACTION_LABEL[a.recommended]}.</span>{" "}
              <span className="text-muted-foreground">{a.recommendedWhy}</span>
            </span>
          </p>
        </section>

        <section aria-label="Checks" className="grid gap-3">
          <h3 className="text-sm font-medium">
            {issues ? `${issues} thing${issues > 1 ? "s" : ""} to resolve` : "Nothing to resolve"}
          </h3>
          <ul className="grid gap-1 text-sm">
            {[
              { ok: lead.teamSize !== undefined, label: "Team size" },
              { ok: lead.budget !== undefined, label: "Budget range" },
              { ok: lead.timeline !== undefined, label: "Buying timeline" },
              { ok: !a.blockers.some((b) => b.kind === "region"), label: "Region supported" },
              { ok: !a.blockers.some((b) => b.kind === "duplicate"), label: "No duplicate account" },
            ].map((c) => (
              <li key={c.label} className="flex items-center gap-2">
                <Icon name={c.ok ? "check" : "alert"} size={14} className={c.ok ? "text-muted-foreground" : "text-destructive"} />
                <span className={c.ok ? "text-muted-foreground" : "font-medium"}>{c.label}</span>
                <span className="sr-only">{c.ok ? "complete" : "needs attention"}</span>
              </li>
            ))}
          </ul>
          {a.blockers.length > 0 && <BlockerList lead={lead} blockers={a.blockers} onPatch={(c) => void patch(lead, c)} disabled={pending} />}
          {a.gaps.length > 0 && <GapEditor lead={lead} gaps={a.gaps} onPatch={(c) => void patch(lead, c)} disabled={pending} />}
          <Warnings warnings={a.warnings} />
        </section>

        <section aria-label="Decide" className="grid gap-3 border-t pt-4">
          <h3 className="text-sm font-medium">Your decision</h3>
          <Tabs value={choice} onValueChange={(v) => setChoice(v as ActionId)}>
            <TabsList className="h-auto flex-wrap justify-start">
              {ORDER.map((id) => (
                <TabsTrigger key={id} value={id}>
                  {ACTION_LABEL[id]}
                  {id === a.recommended && <span className="ml-1 text-xs text-muted-foreground">(recommended)</span>}
                </TabsTrigger>
              ))}
            </TabsList>
            {ORDER.map((id) => (
              <TabsContent key={id} value={id} className="grid gap-3 pt-3 text-sm">
                <p>{impact(lead, id, gapLabels)}</p>
                {!a.allowed[id].ok && <p className="text-muted-foreground">Unavailable. {a.allowed[id].why}</p>}
                {id === "nurture" && (
                  <label className="grid max-w-xs gap-1">
                    Revisit on
                    <Input type="date" min={today()} value={revisitOn} onChange={(e) => setRevisitOn(e.target.value)} required />
                  </label>
                )}
                {id === "disqualify" && (
                  <div className="grid max-w-xs gap-1">
                    Reason
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button type="button" variant="outline" className="justify-between" />}>
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
                )}
              </TabsContent>
            ))}
          </Tabs>
          {error && (
            <Alert>
          <Icon name="alert" className="text-destructive" />
              <AlertTitle className="text-destructive">Not saved</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            {canSkip ? (
              <Button variant="ghost" onClick={onSkip} disabled={pending}>
                Skip for now
              </Button>
            ) : (
              <span />
            )}
            <Button
              variant={choice === "disqualify" ? "destructive" : "default"}
              className="w-full sm:w-auto"
              disabled={pending || !canConfirm}
              onClick={() => void confirm()}
            >
              {pending ? "Saving…" : `${ACTION_LABEL[choice]} and next`}
            </Button>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
