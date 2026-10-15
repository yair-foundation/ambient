import * as React from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { CURRENT_USER } from "@/data/clientops"
import { OWNERS, type OutcomeId, type RenewalAccount, type RenewalPlan } from "@/data/renewals"
import { money } from "../triage/format"
import { EvidenceList, RiskBadge } from "./parts"
import {
  NEEDS_FOLLOW_UP,
  OUTCOMES,
  OUTCOME_LABEL,
  fmtDay,
  hasOpenP1,
  renewsIn,
  riskScore,
  today,
  validatePlan,
  type PlanErrors,
} from "./rules"
import type { PlanLogEntry, RenewalStore } from "./store"

export function AccountDetail({
  account,
  plan,
  store,
  onSaved,
}: {
  account: RenewalAccount
  plan?: RenewalPlan
  store: RenewalStore
  onSaved: (entry: PlanLogEntry) => void
}) {
  const p1 = hasOpenP1(account)
  const needsFollowUp = (o: OutcomeId | "") => !!o && NEEDS_FOLLOW_UP.includes(o)
  const [outcome, setOutcome] = React.useState<OutcomeId | "">(plan?.outcome ?? "")
  const [nextStep, setNextStep] = React.useState(plan?.nextStep ?? "")
  const [owner, setOwner] = React.useState<string>(plan?.owner ?? CURRENT_USER.name)
  const [dueOn, setDueOn] = React.useState(plan?.dueOn ?? "")
  const [ack, setAck] = React.useState(plan?.escalationAcknowledged ?? false)
  const [tried, setTried] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const id = React.useId()

  const input = { outcome, nextStep, owner, dueOn, escalationAcknowledged: ack }
  const errors: PlanErrors = tried ? validatePlan(account, input) : {}
  const errorCount = Object.keys(errors).length

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setTried(true)
    setSaveError(null)
    if (Object.keys(validatePlan(account, input)).length) return
    setPending(true)
    const res = await store.savePlan(account.id, input)
    setPending(false)
    if (!res.ok) return setSaveError(res.error)
    setTried(false)
    onSaved(res.entry)
  }

  const err = (k: keyof PlanErrors) =>
    errors[k] ? (
      <p id={`${id}-${k}`} className="text-sm text-destructive">
        {errors[k]}
      </p>
    ) : null
  const describe = (k: keyof PlanErrors) => (errors[k] ? `${id}-${k}` : undefined)

  return (
    <article className="grid gap-4 rounded-lg border p-4" aria-labelledby={`h-${account.id}`}>
      <header className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={`h-${account.id}`} className="text-lg font-semibold">
            {account.name}
          </h2>
          <RiskBadge account={account} />
          {plan && <Badge variant="outline">Plan: {OUTCOME_LABEL[plan.outcome]}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">
          {account.industry} · {money(account.arr)} ARR · renews {fmtDay(account.renewalDate)} ({renewsIn(account).replace("Renews ", "")})
        </p>
      </header>

      <section aria-label="Why this account is at this risk" className="grid gap-2">
        <h3 className="text-sm font-medium">
          Evidence <span className="font-normal text-muted-foreground">(risk score {riskScore(account)} of 100)</span>
        </h3>
        <EvidenceList account={account} />
      </section>

      <section aria-label="Renewal plan" className="grid gap-3 border-t pt-4">
        <h3 className="text-sm font-medium">{plan ? "Revise the renewal plan" : "Record a renewal plan"}</h3>
        {plan && (
          <p className="text-sm text-muted-foreground">
            Revision {plan.revision}, saved {fmtDay(plan.updatedAt.slice(0, 10))}. {plan.nextStep ? `Next step: ${plan.nextStep}` : "No next step set."}
            {plan.dueOn ? ` Due ${fmtDay(plan.dueOn)}.` : ""} Owner: {plan.owner}.
          </p>
        )}
        <form className="grid gap-3" onSubmit={submit} noValidate>
          <div className="grid gap-1 text-sm">
            <span id={`${id}-outcome-label`}>Expected outcome</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button type="button" variant="outline" className="w-full justify-between sm:w-72" aria-labelledby={`${id}-outcome-label ${id}-outcome-value`} aria-invalid={!!errors.outcome} aria-describedby={describe("outcome")} />}
              >
                <span id={`${id}-outcome-value`}>{outcome ? OUTCOME_LABEL[outcome] : "Choose an outcome"}</span> <Icon name="chevron-down" size={14} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup value={outcome} onValueChange={(v) => setOutcome(v as OutcomeId)}>
                  {OUTCOMES.map((o) => (
                    <DropdownMenuRadioItem key={o} value={o}>
                      {OUTCOME_LABEL[o]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {err("outcome")}
          </div>

          {p1 && (
            <div className="grid gap-1 rounded-md border border-destructive/30 p-3 text-sm">
              <p className="font-medium">
                <Icon name="alert" size={14} className="mr-1 inline" />
                Open priority-one escalation: {account.escalation?.title}
              </p>
              <label className="flex items-start gap-2">
                <Checkbox checked={ack} onCheckedChange={(c) => setAck(c === true)} aria-invalid={!!errors.escalationAcknowledged} aria-describedby={describe("escalationAcknowledged")} className="mt-0.5" />
                <span>I acknowledge this escalation is still open. Required to plan this account as "{OUTCOME_LABEL.renew_as_is.toLowerCase()}".</span>
              </label>
              {err("escalationAcknowledged")}
            </div>
          )}

          <label className="grid gap-1 text-sm">
            <span>
              Next step{" "}
              <span className="text-muted-foreground">{needsFollowUp(outcome) ? "(required)" : "(optional)"}</span>
            </span>
            <Input value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="For example: Executive call with the new sponsor" aria-invalid={!!errors.nextStep} aria-describedby={describe("nextStep")} />
            {err("nextStep")}
          </label>

          <div className="flex flex-wrap items-start gap-3">
            <label className="grid gap-1 text-sm">
              <span>
                Date for the next step <span className="text-muted-foreground">{needsFollowUp(outcome) ? "(required)" : "(optional)"}</span>
              </span>
              <Input type="date" min={today()} max={account.renewalDate} value={dueOn} onChange={(e) => setDueOn(e.target.value)} aria-invalid={!!errors.dueOn} aria-describedby={describe("dueOn")} />
              {err("dueOn")}
            </label>
            <div className="grid gap-1 text-sm">
              <span id={`${id}-owner-label`}>Owner</span>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button type="button" variant="outline" aria-labelledby={`${id}-owner-label ${id}-owner-value`} />}>
                  <span id={`${id}-owner-value`}>{owner}</span> <Icon name="chevron-down" size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup value={owner} onValueChange={(v) => setOwner(String(v))}>
                    {OWNERS.map((o) => (
                      <DropdownMenuRadioItem key={o} value={o}>
                        {o}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {errorCount > 0 && (
            <Alert variant="destructive">
              <Icon name="alert" />
              <AlertTitle>Plan not saved</AlertTitle>
              <AlertDescription>Fix the {errorCount === 1 ? "field" : `${errorCount} fields`} marked above, then save again.</AlertDescription>
            </Alert>
          )}
          {saveError && (
            <Alert variant="destructive">
              <Icon name="alert" />
              <AlertTitle>Plan not saved</AlertTitle>
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Saving…" : plan ? "Save revision" : "Save plan"}
            </Button>
            {pending && (
              <span role="status" className="text-sm text-muted-foreground">
                Saving the plan…
              </span>
            )}
          </div>
        </form>
      </section>
    </article>
  )
}
