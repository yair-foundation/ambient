import { page } from "./pairs"

export const home = page([
  {
    ask: "What is in this prototype?",
    match: /what|prototype|here/i,
    answer: () => ({
      text: "ClientOps is a small fictional CRM. It holds one product mission, triaging incoming leads, explored as two different directions on the same data and rules: a queue workspace and a guided review.",
      refs: [],
      followUps: ["How do the two directions differ?"],
    }),
  },
  {
    ask: "How do the two directions differ?",
    match: /differ|compare|difference/i,
    answer: () => ({
      text: "Direction A shows the whole queue beside the selected lead, so you can scan and jump. Direction B shows one lead at a time with a recommended next action, so you decide and move on.",
      refs: [],
      followUps: ["What is in this prototype?"],
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
