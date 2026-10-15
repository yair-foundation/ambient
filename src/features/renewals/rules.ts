/**
 * Renewal risk rules. Every product assumption about risk, order, the summary and plan validity lives here
 * and is covered by rules.test.ts. See docs/PRODUCT-ASSUMPTIONS.md (renewal risk review).
 */
import { NOW } from "@/data/clientops"
import type { OutcomeId, RenewalAccount, RenewalPlan } from "@/data/renewals"

export type RiskLevel = "high" | "medium" | "low"
export interface Evidence {
  id: string
  tone: "negative" | "positive" | "neutral"
  label: string
  detail: string
  /** Contribution to the risk score; positive raises risk. */
  points: number
}

export const OUTCOME_LABEL: Record<OutcomeId, string> = {
  renew_as_is: "Renew as is",
  renew_expand: "Renew with expansion",
  at_risk: "At risk, needs intervention",
  churn: "Expected to churn",
}
export const OUTCOMES = Object.keys(OUTCOME_LABEL) as OutcomeId[]
/** Outcomes that need a next step and a date. */
export const NEEDS_FOLLOW_UP: OutcomeId[] = ["at_risk", "churn"]
export const RISK_LABEL: Record<RiskLevel, string> = { high: "High risk", medium: "Medium risk", low: "Low risk" }

const DAY = 86_400_000
export const today = () => new Date(NOW).toISOString().slice(0, 10)
export const daysUntil = (isoDay: string) => Math.round((Date.parse(`${isoDay}T00:00:00Z`) - Date.parse(`${today()}T00:00:00Z`)) / DAY)

export function fmtDay(isoDay: string): string {
  return new Date(`${isoDay}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
}

export function renewsIn(a: RenewalAccount): string {
  const d = daysUntil(a.renewalDate)
  return d === 0 ? "Renews today" : d === 1 ? "Renews tomorrow" : `Renews in ${d} days`
}

/** The evidence behind an account's risk, strongest first. */
export function evidenceFor(a: RenewalAccount): Evidence[] {
  const out: Evidence[] = []
  const u = a.usageChangePct
  if (u <= -30) out.push({ id: "usage", tone: "negative", label: "Product usage falling sharply", detail: `Usage is down ${Math.abs(u)}% over the last 90 days.`, points: 30 })
  else if (u <= -15) out.push({ id: "usage", tone: "negative", label: "Product usage falling", detail: `Usage is down ${Math.abs(u)}% over the last 90 days.`, points: 15 })
  else if (u >= 10) out.push({ id: "usage", tone: "positive", label: "Product usage growing", detail: `Usage is up ${u}% over the last 90 days.`, points: -10 })
  else out.push({ id: "usage", tone: "neutral", label: "Product usage steady", detail: `Usage changed ${u > 0 ? "+" : u < 0 ? "-" : ""}${Math.abs(u)}% over the last 90 days.`, points: 0 })

  const e = a.escalation
  if (e && e.status === "open" && e.priority <= 2)
    out.push({ id: "escalation", tone: "negative", label: `Open priority-${e.priority === 1 ? "one" : "two"} support escalation`, detail: `${e.title}. Opened ${fmtDay(e.openedOn)}.`, points: e.priority === 1 ? 35 : 15 })

  if (a.champion.status === "left")
    out.push({ id: "champion", tone: "negative", label: "Champion has left", detail: `${a.champion.name}, ${a.champion.role}, left${a.champion.leftOn ? ` on ${fmtDay(a.champion.leftOn)}` : ""}.`, points: 25 })

  const inv = a.overdueInvoice
  if (inv)
    out.push({ id: "invoice", tone: "negative", label: "Overdue invoice", detail: `${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(inv.amount)} is ${inv.daysOverdue} days overdue.`, points: inv.daysOverdue > 30 ? 20 : 10 })

  a.positives.forEach((p, i) => out.push({ id: `positive-${i}`, tone: "positive", label: "Recent positive signal", detail: `${p.text}. ${fmtDay(p.on)}.`, points: -10 }))

  return out.sort((x, y) => Math.abs(y.points) - Math.abs(x.points))
}

export function riskScore(a: RenewalAccount): number {
  return Math.max(0, Math.min(100, evidenceFor(a).reduce((s, e) => s + e.points, 0)))
}
export const riskLevel = (a: RenewalAccount): RiskLevel => {
  const s = riskScore(a)
  return s >= 50 ? "high" : s >= 25 ? "medium" : "low"
}

/** Risk, weighted up the closer the renewal date is. */
export function urgency(a: RenewalAccount): number {
  const d = daysUntil(a.renewalDate)
  return riskScore(a) * (d <= 14 ? 1.5 : d <= 30 ? 1.3 : d <= 60 ? 1.15 : 1)
}
/** Most urgent first; then the sooner renewal; then the larger ARR. */
export function compareByUrgency(a: RenewalAccount, b: RenewalAccount): number {
  return urgency(b) - urgency(a) || daysUntil(a.renewalDate) - daysUntil(b.renewalDate) || b.arr - a.arr
}

export const hasOpenP1 = (a: RenewalAccount) => !!a.escalation && a.escalation.status === "open" && a.escalation.priority === 1

/** Is this account's ARR counted as at risk? The plan wins over the assessment once there is one. */
export function isAtRisk(a: RenewalAccount, plan?: RenewalPlan): boolean {
  if (plan) return plan.outcome === "at_risk" || plan.outcome === "churn"
  return riskLevel(a) === "high"
}

export interface Summary {
  total: number
  arrRenewing: number
  arrAtRisk: number
  accountsAtRisk: number
  withPlan: number
  withoutPlan: number
}
export function summarize(accounts: RenewalAccount[], plans: Record<string, RenewalPlan>): Summary {
  const risky = accounts.filter((a) => isAtRisk(a, plans[a.id]))
  const withPlan = accounts.filter((a) => plans[a.id]).length
  return {
    total: accounts.length,
    arrRenewing: accounts.reduce((s, a) => s + a.arr, 0),
    arrAtRisk: risky.reduce((s, a) => s + a.arr, 0),
    accountsAtRisk: risky.length,
    withPlan,
    withoutPlan: accounts.length - withPlan,
  }
}

export interface PlanInput {
  outcome: OutcomeId | ""
  nextStep: string
  owner: string
  dueOn: string
  escalationAcknowledged: boolean
}
export type PlanErrors = Partial<Record<"outcome" | "nextStep" | "owner" | "dueOn" | "escalationAcknowledged", string>>

export function validatePlan(a: RenewalAccount, p: PlanInput): PlanErrors {
  const err: PlanErrors = {}
  if (!p.outcome) err.outcome = "Choose the expected outcome."
  if (!p.owner) err.owner = "Choose who owns the next step."
  if (p.outcome && NEEDS_FOLLOW_UP.includes(p.outcome)) {
    if (!p.nextStep.trim()) err.nextStep = `Name the next step. A plan marked "${OUTCOME_LABEL[p.outcome].toLowerCase()}" needs one.`
    if (!p.dueOn) err.dueOn = "Choose a date for the next step."
  }
  if (p.dueOn) {
    if (p.dueOn < today()) err.dueOn = "Choose today or a later date."
    else if (p.dueOn > a.renewalDate) err.dueOn = `Choose a date on or before the renewal on ${fmtDay(a.renewalDate)}.`
  }
  if (p.outcome === "renew_as_is" && hasOpenP1(a) && !p.escalationAcknowledged)
    err.escalationAcknowledged = "Acknowledge the open priority-one escalation to plan this as renew as is."
  return err
}

export function buildPlan(a: RenewalAccount, p: PlanInput, prev?: RenewalPlan): RenewalPlan {
  return {
    accountId: a.id,
    outcome: p.outcome as OutcomeId,
    nextStep: p.nextStep.trim(),
    owner: p.owner,
    dueOn: p.dueOn,
    escalationAcknowledged: hasOpenP1(a) && p.escalationAcknowledged,
    revision: (prev?.revision ?? 0) + 1,
    updatedAt: new Date(NOW).toISOString(),
  }
}
