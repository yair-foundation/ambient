import { page } from "./pairs"

export const home = page([
  {
    ask: "What is in this prototype?",
    match: /what|prototype|here/i,
    answer: () => ({
      text: "ClientOps is a small fictional CRM. It holds one product mission so far: triaging incoming leads. The queue stays beside the selected lead so you can scan, review and decide without losing your place.",
      refs: [],
      followUps: ["How is the lead queue ordered?"],
    }),
  },
  {
    ask: "How is the lead queue ordered?",
    match: /order|sort|priorit/i,
    answer: () => ({
      text: "Leads past their first-response target come first, highest value first among them. Leads still inside their target follow, soonest deadline first.",
      refs: [],
      followUps: ["Where do I see the design system?"],
    }),
  },
  {
    ask: "Where do I see the design system?",
    match: /design system|ds\b|foundation/i,
    answer: () => ({
      text: "Open Design system in the header. It holds the Foundation controls, the component registry and the governance roles.",
      refs: [],
    }),
  },
])
