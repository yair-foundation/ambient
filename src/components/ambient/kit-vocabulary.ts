export type OrbState = "still" | "listening" | "thinking" | "answer"

export const ORB_STATES: OrbState[] = [
  "still",
  "listening",
  "thinking",
  "answer",
]

/** The designed cadence of each state — overridable via the speeds prop. */
export const DEFAULT_STATE_SPEEDS: Record<OrbState, number> = {
  still: 1,
  listening: 0.8,
  thinking: 2.8,
  answer: 0.5,
}

export const REASONING_EFFORTS = ["low", "medium", "high", "max"] as const
export type ReasoningEffortLevel = (typeof REASONING_EFFORTS)[number]

export const FEEDBACK_REASONS = [
  "Not factual",
  "Didn't follow instructions",
  "Too long",
  "Unsafe",
] as const
