import { triageStore } from "@/features/triage/store"
import { assess, compareByUrgency, isOpen } from "@/features/triage/rules"
import { slaText } from "@/features/triage/format"

import { page } from "./pairs"

const open = () => triageStore.getSnapshot().leads.filter(isOpen)

export const triage = page([
  {
    ask: "Which leads are overdue for a first response?",
    match: /overdue|sla|late/i,
    answer: () => {
      const late = open().filter((l) => slaText(l).overdue).sort(compareByUrgency)
      return {
        text: late.length
          ? `${late.length} open leads are past their first-response target. ${late[0].company} is the most overdue (${slaText(late[0]).text.toLowerCase()}).`
          : "No open lead is past its first-response target.",
        refs: [],
        evidence: [{ kind: "reasoning", steps: [{ title: "Compared each open lead's received time with its first-response target", detail: "4 hours for demo requests, 24 hours otherwise." }], seconds: 1 }],
        followUps: ["Which leads are blocked?", "What should I do first?"],
      }
    },
  },
  {
    ask: "Which leads are blocked, and why?",
    match: /block/i,
    answer: () => {
      const blocked = open().filter((l) => assess(l).readiness === "blocked")
      return {
        text: blocked.length
          ? blocked.map((l) => `${l.company}: ${assess(l).blockers.map((b) => b.label.toLowerCase()).join(", ")}`).join(". ") + "."
          : "No open lead is blocked.",
        refs: [],
        followUps: ["Which leads are missing information?", "What should I do first?"],
      }
    },
  },
  {
    ask: "Which leads are missing information?",
    match: /missing|info/i,
    answer: () => {
      const gaps = open().filter((l) => assess(l).gaps.length)
      return {
        text: gaps.length
          ? gaps.map((l) => `${l.company} (${assess(l).gaps.map((g) => g.label.toLowerCase()).join(", ")})`).join("; ") + "."
          : "Every open lead has team size, budget and timeline.",
        refs: [],
        followUps: ["Which leads are overdue for a first response?"],
      }
    },
  },
  {
    ask: "What should I do first?",
    match: /first|next|priorit/i,
    answer: () => {
      const next = [...open()].sort(compareByUrgency)[0]
      return next
        ? {
            text: `Start with ${next.company}: ${slaText(next).text.toLowerCase()}. Recommended action: ${assess(next).recommended.replace("_", " ")}. ${assess(next).recommendedWhy}`,
            refs: [],
            followUps: ["Which leads are blocked?"],
          }
        : { text: "The queue is clear. Every lead has a decision.", refs: [] }
    },
  },
])
