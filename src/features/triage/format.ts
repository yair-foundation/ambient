import { NOW, type Lead } from "@/data/clientops"
import { assess } from "./rules"

export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

export function ago(iso: string): string {
  const hrs = (NOW - Date.parse(iso)) / 3_600_000
  if (hrs < 1) return `${Math.max(1, Math.round(hrs * 60))}m ago`
  if (hrs < 24) return `${Math.round(hrs)}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

/** "Due in 3h" / "Overdue by 2h" — the first-response clock. */
export function slaText(lead: Lead): { text: string; overdue: boolean } {
  const left = assess(lead).slaHoursLeft
  const abs = Math.abs(left)
  const span = abs < 1 ? `${Math.max(1, Math.round(abs * 60))}m` : `${Math.round(abs)}h`
  return left < 0 ? { text: `Overdue by ${span}`, overdue: true } : { text: `Due in ${span}`, overdue: false }
}

export const READINESS_LABEL = {
  ready: "Ready",
  needs_info: "Needs info",
  blocked: "Blocked",
} as const

export const STATUS_LABEL: Record<Lead["status"], string> = {
  new: "New",
  info_requested: "Info requested",
  qualified: "Qualified",
  nurture: "Nurture",
  disqualified: "Disqualified",
}
