import type { AmbientAnswer } from "@/components/ambient/response-kit"

export type Pair = { ask: string; match?: RegExp; answer: () => AmbientAnswer }

/** A page's stubs: each question kept next to its answer, exact match first, loose second. */
export function page(pairs: Pair[]) {
  return {
    asks: pairs.map((p) => p.ask),
    answer(question: string): AmbientAnswer | undefined {
      const q = question.trim().toLowerCase()
      const hit =
        pairs.find((p) => p.ask.toLowerCase() === q) ?? pairs.find((p) => p.match?.test(question))
      return hit?.answer()
    },
  }
}
