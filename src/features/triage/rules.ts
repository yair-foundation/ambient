/**
 * Lead-triage product rules. Pure functions, no UI. Both directions call
 * `assess` and `applyDecision`; neither re-derives readiness on its own.
 */
import {
  CURRENT_USER,
  NOW,
  REGIONS_SUPPORTED_PREFIXES,
  type Lead,
} from "@/data/clientops"

export type ActionId =
  | "qualify"
  | "request_info"
  | "nurture"
  | "disqualify"

export type GapField = "teamSize" | "budget" | "timeline"

export interface Gap {
  field: GapField
  label: string
}

export type BlockerKind = "duplicate" | "region"

export interface Blocker {
  kind: BlockerKind
  label: string
  detail: string
  /** Whether the account manager can clear it from the lead itself. */
  resolvable: boolean
}

export interface Assessment {
  gaps: Gap[]
  blockers: Blocker[]
  warnings: string[]
  readiness: "ready" | "needs_info" | "blocked"
  /** What the account manager may do right now, with why not for the rest. */
  allowed: Record<ActionId, { ok: boolean; why?: string }>
  recommended: ActionId
  recommendedWhy: string
  /** Hours until (positive) or since (negative) the first-response target. */
  slaHoursLeft: number
}

export const ACTION_LABEL: Record<ActionId, string> = {
  qualify: "Qualify",
  request_info: "Request info",
  nurture: "Nurture",
  disqualify: "Disqualify",
}

export const DISQUALIFY_REASONS = [
  "No budget",
  "Not a fit for the product",
  "Region not supported",
  "Duplicate of existing account",
  "No response after follow-up",
] as const

const GAP_LABEL: Record<GapField, string> = {
  teamSize: "Team size",
  budget: "Budget range",
  timeline: "Buying timeline",
}

/** Hours allowed for a first response, by how the lead arrived. */
export function slaTargetHours(lead: Lead): number {
  return lead.source === "Demo request" ? 4 : 24
}

export function regionSupported(region: string): boolean {
  return REGIONS_SUPPORTED_PREFIXES.some((p) => region.startsWith(p))
}

const FREE_MAIL = /@(gmail|yahoo|outlook|hotmail)\./i

export function assess(lead: Lead): Assessment {
  const gaps: Gap[] = (["teamSize", "budget", "timeline"] as GapField[])
    .filter((f) => lead[f] === undefined)
    .map((f) => ({ field: f, label: GAP_LABEL[f] }))

  const blockers: Blocker[] = []
  if (lead.duplicateOf && !lead.duplicateResolved) {
    blockers.push({
      kind: "duplicate",
      label: "Possible duplicate account",
      detail: `Matches ${lead.duplicateOf.name} (${lead.duplicateOf.accountId}), owned by ${lead.duplicateOf.owner}.`,
      resolvable: true,
    })
  }
  if (!regionSupported(lead.region)) {
    blockers.push({
      kind: "region",
      label: "Region not supported",
      detail: `ClientOps cannot host data in ${lead.region} yet.`,
      resolvable: false,
    })
  }

  const warnings: string[] = []
  if (FREE_MAIL.test(lead.contact.email)) warnings.push("Personal email domain: confirm the company.")
  if (lead.decisionMakerConfirmed === false) warnings.push("Decision maker not confirmed.")

  const readiness = blockers.length ? "blocked" : gaps.length ? "needs_info" : "ready"

  const allowed: Assessment["allowed"] = {
    qualify:
      readiness === "ready"
        ? { ok: true }
        : { ok: false, why: blockers.length ? `Resolve first: ${blockers[0].label.toLowerCase()}.` : `Missing: ${gaps.map((g) => g.label.toLowerCase()).join(", ")}.` },
    request_info: gaps.length
      ? { ok: true }
      : { ok: false, why: "Nothing is missing." },
    nurture: { ok: true },
    disqualify: { ok: true },
  }

  let recommended: ActionId
  let recommendedWhy: string
  if (blockers.some((b) => b.kind === "region")) {
    recommended = "nurture"
    recommendedWhy = "Revisit when the region is supported; qualifying now would promise what we cannot deliver."
  } else if (blockers.length) {
    recommended = "nurture"
    recommendedWhy = "Confirm the existing account first; until then, keep the lead warm without creating a duplicate."
  } else if (gaps.length) {
    recommended = "request_info"
    recommendedWhy = `Missing ${gaps.map((g) => g.label.toLowerCase()).join(", ")}; qualification needs all three.`
  } else if (lead.timeline === "Exploring" || lead.budget === "<$10k") {
    recommended = "nurture"
    recommendedWhy = lead.budget === "<$10k" ? "Budget is below the smallest plan." : "Buying timeline is only exploratory."
  } else {
    recommended = "qualify"
    recommendedWhy = "Fit, budget and timeline are all confirmed."
  }

  const dueAt = Date.parse(lead.receivedAt) + slaTargetHours(lead) * 3_600_000
  return {
    gaps,
    blockers,
    warnings,
    readiness,
    allowed,
    recommended,
    recommendedWhy,
    slaHoursLeft: (dueAt - NOW) / 3_600_000,
  }
}

export interface Decision {
  leadId: string
  action: ActionId
  reason?: string
  revisitOn?: string
}

export type DecisionResult =
  | { ok: true; lead: Lead; message: string }
  | { ok: false; error: string }

/** Validates and applies a decision. Returns the next lead state, never mutates. */
export function applyDecision(lead: Lead, d: Decision): DecisionResult {
  const a = assess(lead)
  if (!a.allowed[d.action].ok) return { ok: false, error: a.allowed[d.action].why ?? "Not allowed." }
  switch (d.action) {
    case "qualify":
      return {
        ok: true,
        lead: { ...lead, status: "qualified", owner: CURRENT_USER.name },
        message: `${lead.company} qualified and assigned to you.`,
      }
    case "request_info":
      return {
        ok: true,
        lead: { ...lead, status: "info_requested" },
        message: `Info requested from ${lead.contact.name}: ${a.gaps.map((g) => g.label.toLowerCase()).join(", ")}.`,
      }
    case "nurture":
      if (!d.revisitOn) return { ok: false, error: "Choose a revisit date." }
      return {
        ok: true,
        lead: { ...lead, status: "nurture", revisitOn: d.revisitOn },
        message: `${lead.company} moved to nurture until ${d.revisitOn}.`,
      }
    case "disqualify":
      if (!d.reason) return { ok: false, error: "Choose a reason." }
      return {
        ok: true,
        lead: { ...lead, status: "disqualified", reason: d.reason },
        message: `${lead.company} disqualified: ${d.reason.toLowerCase()}.`,
      }
  }
}

/** Queue order: untriaged leads first, soonest first-response deadline first. */
export function compareByUrgency(a: Lead, b: Lead): number {
  return assess(a).slaHoursLeft - assess(b).slaHoursLeft
}

export const isOpen = (l: Lead) => l.status === "new"
