import { page } from "./pairs"

export const ds = page([
  {
    ask: "How do I change the look of the product?",
    match: /change|theme|look|accent/i,
    answer: () => ({
      text: "Use the Foundation controls on this page: accent, gray, radius, spacing, scaling and motion. Every component follows. Press Save to keep the change.",
      refs: [],
      followUps: ["Where do I find a component's usage rules?"],
    }),
  },
  {
    ask: "Where do I find a component's usage rules?",
    match: /component|usage|when to use/i,
    answer: () => ({
      text: "The Components section lists each component with its purpose, states, when to use it and when not to. The same registry is in src/ds/catalog.ts for agents.",
      refs: [],
      followUps: ["Who reviews changes to the system?"],
    }),
  },
  {
    ask: "Which shared patterns has a person approved?",
    match: /approved|shared (pattern|component)|promot/i,
    answer: () => ({
      text: "UndoNotice (src/components/shared/undo-notice.tsx) confirms that an action changed a record and lets the person reverse it. See its entry in the Components tab and docs/DECISION-LOG.md.",
      refs: [],
      followUps: ["Who reviews changes to the system?"],
    }),
  },
  {
    ask: "Who reviews changes to the system?",
    match: /review|govern|approve|role/i,
    answer: () => ({
      text: "Three roles: the design system manager checks system rules, the product design manager guards flows and surfaces, and product copy guards words. A new shared pattern needs a person's approval first.",
      refs: [],
    }),
  },
])
