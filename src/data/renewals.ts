/**
 * ClientOps fictional renewal data. Every name, company and number here is invented.
 * Revenue is annual recurring revenue (ARR) in US dollars. "Now" is NOW from ./clientops.
 */

export type OutcomeId = "renew_as_is" | "renew_expand" | "at_risk" | "churn"

export interface Escalation {
  /** 1 is the highest priority. */
  priority: 1 | 2 | 3
  title: string
  openedOn: string
  status: "open" | "resolved"
}

export interface RenewalAccount {
  id: string
  name: string
  industry: string
  /** Annual recurring revenue, US dollars. */
  arr: number
  /** ISO day the contract renews. */
  renewalDate: string
  /** Change in product usage over the last 90 days, in percent. */
  usageChangePct: number
  escalation?: Escalation
  champion: { name: string; role: string; status: "active" | "left"; leftOn?: string }
  /** Set when an invoice is past due. */
  overdueInvoice?: { amount: number; daysOverdue: number }
  /** Recent positive signals, newest first. */
  positives: { text: string; on: string }[]
}

export interface RenewalPlan {
  accountId: string
  outcome: OutcomeId
  nextStep: string
  owner: string
  /** ISO day the next step is due. Empty when not set. */
  dueOn: string
  /** The person confirmed they know about the open priority-one escalation. */
  escalationAcknowledged: boolean
  revision: number
  updatedAt: string
}

export const OWNERS = ["Sam Rivera", "Priya Nair", "Tomás Ortega", "Dana Whitfield"] as const

export const SEED_RENEWALS: RenewalAccount[] = [
  {
    id: "R-101", name: "Brightwell Logistics", industry: "Logistics", arr: 184000, renewalDate: "2026-10-29", usageChangePct: -38,
    escalation: { priority: 1, title: "Dispatch API outages recur weekly", openedOn: "2026-09-30", status: "open" },
    champion: { name: "Marcus Hale", role: "VP Operations", status: "left", leftOn: "2026-09-12" },
    overdueInvoice: { amount: 18400, daysOverdue: 42 },
    positives: [],
  },
  {
    id: "R-102", name: "Harborline Health", industry: "Healthcare", arr: 242000, renewalDate: "2026-11-06", usageChangePct: -22,
    escalation: { priority: 2, title: "Appointment sync delays in two clinics", openedOn: "2026-10-02", status: "open" },
    champion: { name: "Elena Voss", role: "Director of IT", status: "active" },
    positives: [],
  },
  {
    id: "R-103", name: "Quillon Foods", industry: "Food and beverage", arr: 96000, renewalDate: "2026-11-12", usageChangePct: -12,
    champion: { name: "Tobias Reiner", role: "Head of Supply Chain", status: "left", leftOn: "2026-08-28" },
    positives: [],
  },
  {
    id: "R-104", name: "Northgate Energy", industry: "Energy", arr: 310000, renewalDate: "2026-11-19", usageChangePct: 14,
    champion: { name: "Ife Adeyemi", role: "COO", status: "active" },
    positives: [{ text: "Executive sponsor asked for pricing to add two more sites", on: "2026-10-08" }],
  },
  {
    id: "R-105", name: "Tallow & Pine", industry: "Retail", arr: 58000, renewalDate: "2026-11-24", usageChangePct: -17,
    champion: { name: "Grace Lindqvist", role: "Operations Manager", status: "active" },
    overdueInvoice: { amount: 4850, daysOverdue: 12 },
    positives: [],
  },
  {
    id: "R-106", name: "Meridian Legal", industry: "Professional services", arr: 128000, renewalDate: "2026-12-01", usageChangePct: -41,
    escalation: { priority: 1, title: "Document search returns stale results", openedOn: "2026-10-06", status: "open" },
    champion: { name: "Aaron Feld", role: "Managing Partner", status: "active" },
    positives: [],
  },
  {
    id: "R-107", name: "Cobalt Freight", industry: "Logistics", arr: 72000, renewalDate: "2026-12-03", usageChangePct: 2,
    champion: { name: "Rosa Mendes", role: "Fleet Director", status: "active" },
    positives: [],
  },
  {
    id: "R-108", name: "Oakmere Schools", industry: "Education", arr: 45000, renewalDate: "2026-12-09", usageChangePct: -31,
    champion: { name: "Dennis Ambrose", role: "District CIO", status: "left", leftOn: "2026-10-01" },
    positives: [],
  },
  {
    id: "R-109", name: "Lumen Analytics", industry: "Software", arr: 210000, renewalDate: "2026-12-14", usageChangePct: 21,
    champion: { name: "Hana Ito", role: "VP Product", status: "active" },
    positives: [{ text: "Rolled the pilot team's workspace out to all 400 staff", on: "2026-09-29" }],
  },
  {
    id: "R-110", name: "Fieldstone Builders", industry: "Construction", arr: 88000, renewalDate: "2026-12-18", usageChangePct: -6,
    escalation: { priority: 2, title: "Mobile app crashes on older tablets", openedOn: "2026-09-25", status: "open" },
    champion: { name: "Colm Brannigan", role: "Project Director", status: "active" },
    overdueInvoice: { amount: 7300, daysOverdue: 35 },
    positives: [],
  },
  {
    id: "R-111", name: "Ardent Biotech", industry: "Life sciences", arr: 356000, renewalDate: "2027-01-05", usageChangePct: -4,
    escalation: { priority: 1, title: "Audit export fails for datasets over 2 GB", openedOn: "2026-10-09", status: "open" },
    champion: { name: "Dr. Mira Castellanos", role: "Head of Research Ops", status: "active" },
    positives: [{ text: "New VP of Quality joined the quarterly review and asked for a roadmap session", on: "2026-10-03" }],
  },
  {
    id: "R-112", name: "Kite Mobility", industry: "Transportation", arr: 64000, renewalDate: "2027-01-08", usageChangePct: -27,
    champion: { name: "Jonas Wirth", role: "Product Lead", status: "left", leftOn: "2026-09-19" },
    overdueInvoice: { amount: 5300, daysOverdue: 61 },
    positives: [],
  },
  {
    id: "R-113", name: "Sable Hospitality", industry: "Hospitality", arr: 112000, renewalDate: "2026-10-22", usageChangePct: -5,
    champion: { name: "Priscilla Okafor", role: "Revenue Director", status: "active" },
    positives: [],
  },
  {
    id: "R-114", name: "Willowbrook Credit Union", industry: "Financial services", arr: 150000, renewalDate: "2027-01-12", usageChangePct: 3,
    champion: { name: "Nathan Ibarra", role: "Chief Risk Officer", status: "active" },
    positives: [{ text: "Passed the annual security review with no findings", on: "2026-10-11" }],
  },
]
