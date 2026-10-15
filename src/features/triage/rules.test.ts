import { describe, expect, it } from "vitest"

import { SEED_LEADS, type Lead } from "@/data/clientops"
import { applyDecision, assess, compareByUrgency } from "./rules"

const lead = (id: string) => SEED_LEADS.find((l) => l.id === id) as Lead

describe("assess", () => {
  it("marks a complete, unblocked lead ready and recommends qualify", () => {
    const a = assess(lead("L-2041"))
    expect(a.readiness).toBe("ready")
    expect(a.recommended).toBe("qualify")
    expect(a.allowed.qualify.ok).toBe(true)
  })

  it("lists missing qualification fields and forbids qualify", () => {
    const a = assess(lead("L-2046"))
    expect(a.readiness).toBe("needs_info")
    expect(a.gaps.map((g) => g.field)).toEqual(["teamSize", "budget", "timeline"])
    expect(a.allowed.qualify.ok).toBe(false)
    expect(a.recommended).toBe("request_info")
  })

  it("blocks an unresolved duplicate, and unblocks it once resolved", () => {
    expect(assess(lead("L-2043")).readiness).toBe("blocked")
    expect(assess({ ...lead("L-2043"), duplicateResolved: true }).readiness).toBe("ready")
  })

  it("never lets an unsupported region qualify", () => {
    const a = assess(lead("L-2044"))
    expect(a.readiness).toBe("blocked")
    expect(a.blockers[0].resolvable).toBe(false)
    expect(a.allowed.qualify.ok).toBe(false)
    expect(a.recommended).toBe("nurture")
  })

  it("recommends nurture for a ready lead with a sub-minimum budget", () => {
    expect(assess(lead("L-2045")).recommended).toBe("nurture")
  })

  it("orders overdue leads before leads with time left", () => {
    const sorted = [lead("L-2041"), lead("L-2046")].sort(compareByUrgency)
    expect(sorted[0].id).toBe("L-2046")
  })

  it("orders overdue leads by value, so a late reply to a big opportunity comes first", () => {
    // Quillbox ($15k, 46h overdue) must not outrank Fernhill ($120k, 5h overdue)
    const sorted = [lead("L-2050"), lead("L-2046")].sort(compareByUrgency)
    expect(sorted.map((l) => l.id)).toEqual(["L-2046", "L-2050"])
  })

  it("orders leads inside their target by the soonest deadline", () => {
    const sorted = [lead("L-2051"), lead("L-2049")].sort(compareByUrgency) // Tidewater due in 2h, Meridian due in 1h
    expect(sorted[0].id).toBe("L-2049")
  })
})

describe("applyDecision", () => {
  it("qualifies and assigns the current user", () => {
    const r = applyDecision(lead("L-2041"), { leadId: "L-2041", action: "qualify" })
    expect(r.ok && r.lead.status).toBe("qualified")
    expect(r.ok && r.lead.owner).toBe("Sam Rivera")
  })

  it("refuses to qualify a blocked lead", () => {
    const r = applyDecision(lead("L-2044"), { leadId: "L-2044", action: "qualify" })
    expect(r.ok).toBe(false)
  })

  it("requires a revisit date to nurture and a reason to disqualify", () => {
    expect(applyDecision(lead("L-2045"), { leadId: "L-2045", action: "nurture" }).ok).toBe(false)
    expect(applyDecision(lead("L-2045"), { leadId: "L-2045", action: "disqualify" }).ok).toBe(false)
    expect(applyDecision(lead("L-2045"), { leadId: "L-2045", action: "nurture", revisitOn: "2026-11-15" }).ok).toBe(true)
    expect(applyDecision(lead("L-2045"), { leadId: "L-2045", action: "disqualify", reason: "No budget" }).ok).toBe(true)
  })

  it("only allows request_info when something is missing", () => {
    expect(applyDecision(lead("L-2041"), { leadId: "L-2041", action: "request_info" }).ok).toBe(false)
    expect(applyDecision(lead("L-2042"), { leadId: "L-2042", action: "request_info" }).ok).toBe(true)
  })
})
