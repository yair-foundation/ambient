import * as React from "react"

import type { Lead } from "@/data/clientops"
import { type Decision } from "./rules"
import { type LogEntry, type TriageStore } from "./store"

/**
 * Runs a decision against the store and tracks pending/error, so both
 * directions report the same truth about a save in flight or a failed save.
 */
export function useDecision(store: TriageStore) {
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const run = React.useCallback(
    async (d: Decision): Promise<LogEntry | null> => {
      setPending(true)
      setError(null)
      const res = await store.decide(d)
      setPending(false)
      if (!res.ok) {
        setError(res.error)
        return null
      }
      return res.entry
    },
    [store]
  )

  const patch = React.useCallback(
    async (lead: Lead, changes: Partial<Lead>) => {
      setError(null)
      await store.patch(lead.id, changes)
    },
    [store]
  )

  return { pending, error, run, patch, clearError: () => setError(null) }
}
