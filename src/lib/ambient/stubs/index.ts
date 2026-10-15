// lib/ambient/stubs/index.ts — SAMPLE ANSWERS, not a backend.
// Turned off by VITE_AMBIENT_STUBS=false (see lib/ambient/api.ts).
import type { AmbientApiHandlers } from "@/components/ambient/responder"

import { FALLBACK } from "./fallback"
import { ds } from "./ds"
import { home } from "./home"
import { triage } from "./triage"

const PAGES = { home, "triage-a": triage, "triage-b": triage, ds } // keyed by each page's setPageChip id
const LATENCY_MS = 400

const settle = <T,>(value: T, signal: AbortSignal) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => resolve(value), LATENCY_MS)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })

export const stubs: AmbientApiHandlers = {
  ask: async ({ question, pageChip }, { signal }) => {
    if (/simulate (an )?error/i.test(question)) {
      await settle(null, signal)
      throw new Error("The assistant is unreachable right now.")
    }
    const page = PAGES[pageChip?.id as keyof typeof PAGES]
    return settle(page?.answer(question) ?? FALLBACK, signal)
  },
  suggestions: async ({ pageChip }, { signal }) =>
    settle(PAGES[pageChip?.id as keyof typeof PAGES]?.asks ?? [], signal),
}
