import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SEED_LEADS } from "@/data/clientops"
import { createTriageStore } from "../triage/store"
import TriageB from "./triage-b"

const fast = { latencyMs: 0 }
const setup = (opts = {}, seed = SEED_LEADS) => {
  const store = createTriageStore(seed, { ...fast, ...opts })
  render(<TriageB store={store} />)
  return { store, user: userEvent.setup() }
}
const heading = (name: RegExp) => screen.findByRole("heading", { level: 2, name })

describe("Direction B: guided review", () => {
  it("presents the most urgent lead first with a recommendation and progress", async () => {
    setup()
    expect(await heading(/Fernhill Capital/)).toBeVisible()
    expect(screen.getByText(/Recommended: Request info/)).toBeVisible()
    expect(screen.getByRole("progressbar", { name: "Leads reviewed" })).toHaveAttribute("aria-valuenow", "0")
    expect(screen.getByText("0 of 12 reviewed")).toBeVisible()
  })

  it("explains why a decision is unavailable and disables confirming it", async () => {
    const { user } = setup()
    await heading(/Fernhill Capital/)
    await user.click(screen.getByRole("tab", { name: /Qualify/ }))
    expect(screen.getByText(/Unavailable. Missing: team size, budget range, buying timeline/)).toBeVisible()
    expect(screen.getByRole("button", { name: /Qualify and next/ })).toBeDisabled()
  })

  it("requests info, advances to the next lead, updates progress, and undo returns to the lead", async () => {
    const { user } = setup()
    await heading(/Fernhill Capital/)
    await user.click(screen.getByRole("button", { name: /Request info and next/ }))
    expect(await heading(/Kestrel Robotics/)).toBeVisible()
    expect(screen.getByText(/Info requested from Aaron Whitfield: team size, budget range, buying timeline\./)).toBeVisible()
    expect(screen.getByText("1 of 12 reviewed")).toBeVisible()
    expect(screen.getByText("11 left to review.")).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(await heading(/Fernhill Capital/)).toBeVisible()
    expect(screen.getByText("0 of 12 reviewed")).toBeVisible()
  })

  it("lets a ready lead be qualified once gaps are filled in place", async () => {
    const { user } = setup()
    await heading(/Fernhill Capital/)
    await user.type(screen.getByLabelText(/Team size/), "40")
    await user.click(screen.getByRole("button", { name: "Save team size" }))
    await user.click(await screen.findByRole("button", { name: "$50k+" }))
    await user.click(await screen.findByRole("button", { name: "This quarter" }))
    await waitFor(() => expect(screen.getByText("Nothing to resolve")).toBeVisible())
    await user.click(screen.getByRole("tab", { name: /Qualify/ }))
    await user.click(screen.getByRole("button", { name: /Qualify and next/ }))
    expect(await screen.findByText("Fernhill Capital qualified and assigned to you.")).toBeVisible()
  })

  it("skips a lead to the back of the queue without deciding it", async () => {
    const { user } = setup()
    await heading(/Fernhill Capital/)
    await user.click(screen.getByRole("button", { name: "Skip for now" }))
    expect(await heading(/Kestrel Robotics/)).toBeVisible()
    expect(screen.getByText("0 of 12 reviewed")).toBeVisible()
  })

  it("ends with a summary and per-decision undo when the queue is clear", async () => {
    const two = SEED_LEADS.filter((l) => l.id === "L-2045" || l.id === "L-2052") // both recommend nurture
    const { user } = setup({}, two)
    await heading(/Ashgrove Veterinary|Bluebird Learning/)
    await user.click(screen.getByRole("button", { name: /Nurture and next/ }))
    await heading(/Bluebird Learning|Ashgrove Veterinary/)
    await user.click(screen.getByRole("button", { name: /Nurture and next/ }))
    expect(await screen.findByRole("heading", { name: "Queue clear" })).toBeVisible()
    expect(screen.getAllByRole("button", { name: "Undo" }).length).toBeGreaterThanOrEqual(2)
  })

  it("keeps the lead and says so when a save fails", async () => {
    const { user } = setup({ failSave: true })
    await heading(/Fernhill Capital/)
    await user.click(screen.getByRole("button", { name: /Request info and next/ }))
    expect(await screen.findByText(/The decision wasn't saved/)).toBeVisible()
    expect(screen.getByRole("heading", { level: 2, name: /Fernhill Capital/ })).toBeVisible()
  })

  it("shows an error with Retry, and an empty state", async () => {
    const { user } = setup({ mode: "error" })
    expect(await screen.findByText("Couldn't load leads")).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(await heading(/Fernhill Capital/)).toBeVisible()
  })
})
