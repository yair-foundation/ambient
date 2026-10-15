import { describe, expect, it } from "vitest"

import { auditAmbientApi } from "@/components/ambient/stub-audit"
import { createTriageStore } from "@/features/triage/store"
import { triageStore } from "@/features/triage/store"

import { renewalStore } from "@/features/renewals/store"

import { stubs } from "./index"

describe("assistant stubs", () => {
  it("answers every suggested question on every page, falls back honestly, and can fail on request", async () => {
    // the triage stubs read live store data, so give the app store its leads first
    const seeded = createTriageStore(undefined, { latencyMs: 0 })
    await seeded.load()
    await triageStore.load()
    await renewalStore.load()
    const problems = await auditAmbientApi(stubs, [
      { id: "home", label: "Overview" },
      { id: "triage", label: "Lead triage" },
      { id: "renewals", label: "Renewals" },
      { id: "ds", label: "Design system" },
    ])
    expect(problems).toEqual([])
  }, 60_000)
})
