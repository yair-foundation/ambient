import { describe, expect, it } from "vitest"

import { SEED_RENEWALS } from "@/data/renewals"
import { compareByUrgency, evidenceFor, hasOpenP1, riskLevel, summarize, validatePlan, buildPlan, today } from "./rules"

const acct = (name: string) => SEED_RENEWALS.find((a) => a.name === name)!
const base = { outcome: "renew_as_is" as const, nextStep: "", owner: "Sam Rivera", dueOn: "", escalationAcknowledged: false }

describe("renewal rules", () => {
  it("has 14 accounts renewing within 90 days", () => {
    expect(SEED_RENEWALS).toHaveLength(14)
    for (const a of SEED_RENEWALS) {
      const d = (Date.parse(a.renewalDate) - Date.parse(today())) / 86_400_000
      expect(d).toBeGreaterThan(0)
      expect(d).toBeLessThanOrEqual(90)
    }
  })

  it("orders by risk weighted by closeness, then renewal date, then ARR", () => {
    const order = [...SEED_RENEWALS].sort(compareByUrgency).map((a) => a.name)
    expect(order[0]).toBe("Brightwell Logistics")
    expect(order.indexOf("Meridian Legal")).toBeLessThan(order.indexOf("Cobalt Freight"))
    expect(order.indexOf("Sable Hospitality")).toBeGreaterThan(order.indexOf("Ardent Biotech")) // renews soonest but nothing wrong
    expect(order.indexOf("Sable Hospitality")).toBeLessThan(order.indexOf("Cobalt Freight")) // ties go to the sooner renewal
  })

  it("explains risk with evidence, positives lowering it", () => {
    expect(evidenceFor(acct("Brightwell Logistics")).map((e) => e.id)).toEqual(expect.arrayContaining(["usage", "escalation", "champion", "invoice"]))
    expect(riskLevel(acct("Brightwell Logistics"))).toBe("high")
    expect(riskLevel(acct("Northgate Energy"))).toBe("low")
  })

  it("blocks renew as is with an open P1 until acknowledged", () => {
    const a = acct("Meridian Legal")
    expect(hasOpenP1(a)).toBe(true)
    expect(validatePlan(a, base).escalationAcknowledged).toBeTruthy()
    expect(validatePlan(a, { ...base, escalationAcknowledged: true })).toEqual({})
    expect(validatePlan(a, { ...base, outcome: "renew_expand" })).toEqual({})
    expect(validatePlan(acct("Cobalt Freight"), base)).toEqual({})
  })

  it("requires a next step and a date for at risk and churn only", () => {
    const a = acct("Cobalt Freight")
    for (const outcome of ["at_risk", "churn"] as const) {
      const e = validatePlan(a, { ...base, outcome })
      expect(e.nextStep).toBeTruthy()
      expect(e.dueOn).toBeTruthy()
    }
    expect(validatePlan(a, { ...base, outcome: "at_risk", nextStep: "Call", dueOn: "2026-10-20" })).toEqual({})
    expect(validatePlan(a, { ...base, outcome: "renew_expand" })).toEqual({})
  })

  it("rejects dates in the past or after the renewal", () => {
    const a = acct("Cobalt Freight")
    expect(validatePlan(a, { ...base, dueOn: "2026-10-01" }).dueOn).toBeTruthy()
    expect(validatePlan(a, { ...base, dueOn: "2027-02-01" }).dueOn).toBeTruthy()
  })

  it("keeps the summary accurate as plans change", () => {
    const none = summarize(SEED_RENEWALS, {})
    expect(none.total).toBe(14)
    expect(none.withPlan).toBe(0)
    expect(none.arrRenewing).toBe(SEED_RENEWALS.reduce((s, a) => s + a.arr, 0))
    const cobalt = acct("Cobalt Freight")
    const atRisk = buildPlan(cobalt, { ...base, outcome: "churn", nextStep: "x", dueOn: "2026-10-20" })
    const s1 = summarize(SEED_RENEWALS, { [cobalt.id]: atRisk })
    expect(s1.withPlan).toBe(1)
    expect(s1.withoutPlan).toBe(13)
    expect(s1.arrAtRisk).toBe(none.arrAtRisk + cobalt.arr)
    // a plan can take a high-risk account out of "at risk"
    const meridian = acct("Meridian Legal")
    const ok = buildPlan(meridian, { ...base, outcome: "renew_expand", owner: "Sam Rivera" })
    expect(summarize(SEED_RENEWALS, { [meridian.id]: ok }).arrAtRisk).toBe(none.arrAtRisk - meridian.arr)
    expect(buildPlan(meridian, base, ok).revision).toBe(2)
  })
})
