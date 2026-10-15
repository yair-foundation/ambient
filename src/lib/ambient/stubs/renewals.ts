import { SEED_RENEWALS } from "@/data/renewals"
import { compareByUrgency, daysUntil, evidenceFor, hasOpenP1, riskLevel, summarize } from "@/features/renewals/rules"
import { renewalStore } from "@/features/renewals/store"
import { money } from "@/features/triage/format"

import { page } from "./pairs"

const accounts = () => {
  const a = renewalStore.getSnapshot().accounts
  return a.length ? a : SEED_RENEWALS
}
const plans = () => renewalStore.getSnapshot().plans

export const renewals = page([
  {
    ask: "Which renewing account needs me most?",
    match: /most|first|urgent|priorit|next/i,
    answer: () => {
      const a = [...accounts()].sort(compareByUrgency)[0]
      return {
        text: `${a.name} (${money(a.arr)}, renews in ${daysUntil(a.renewalDate)} days). ${evidenceFor(a).filter((e) => e.tone === "negative").map((e) => e.label.toLowerCase()).join(", ") || "No warning signs, but the renewal is close"}.`,
        refs: [],
        followUps: ["How much revenue is at risk?", "Which accounts have no plan?"],
      }
    },
  },
  {
    ask: "How much revenue is at risk?",
    match: /revenue|arr|risk/i,
    answer: () => {
      const s = summarize(accounts(), plans())
      return {
        text: `${money(s.arrAtRisk)} of ${money(s.arrRenewing)} ARR renewing is at risk, across ${s.accountsAtRisk} accounts. Once an account has a plan, its planned outcome decides; until then, high assessed risk does.`,
        refs: [],
        followUps: ["Which accounts have no plan?"],
      }
    },
  },
  {
    ask: "Which accounts have no plan?",
    match: /plan|missing|without/i,
    answer: () => {
      const open = [...accounts()].filter((a) => !plans()[a.id]).sort(compareByUrgency)
      return {
        text: open.length ? `${open.length} accounts still need a plan. Most urgent: ${open.slice(0, 3).map((a) => a.name).join(", ")}.` : "Every renewing account has a plan.",
        refs: [],
        followUps: ["Which accounts have an open priority-one escalation?"],
      }
    },
  },
  {
    ask: "Which accounts have an open priority-one escalation?",
    match: /escalat|p1|priority/i,
    answer: () => {
      const p1 = accounts().filter(hasOpenP1)
      return {
        text: p1.length ? `${p1.map((a) => a.name).join(", ")}. These cannot be planned as renew as is until the plan acknowledges the escalation.` : "No renewing account has an open priority-one escalation.",
        refs: [],
      }
    },
  },
  {
    ask: "Which accounts are high risk?",
    match: /high|worst|danger/i,
    answer: () => {
      const hi = accounts().filter((a) => riskLevel(a) === "high").sort(compareByUrgency)
      return { text: hi.length ? hi.map((a) => `${a.name} (${money(a.arr)})`).join("; ") + "." : "No renewing account is assessed as high risk.", refs: [] }
    },
  },
])
