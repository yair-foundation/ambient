import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SEED_LEADS } from "@/data/clientops"
import { createTriageStore } from "../triage/store"
import TriageA from "./triage-a"

const fast = { latencyMs: 0 }
const setup = (opts = {}, seed = SEED_LEADS) => {
  const store = createTriageStore(seed, { ...fast, ...opts })
  render(<TriageA store={store} />)
  return { store, user: userEvent.setup() }
}
const detail = () => screen.getByRole("region", { name: "Lead detail" })

describe("Direction A: queue workspace", () => {
  it("shows a loading state, then the queue ordered by urgency with the most urgent lead open", async () => {
    setup()
    expect(screen.getByText("Loading leads")).toBeInTheDocument()
    expect(await screen.findByText(/12 to triage/)).toBeVisible()
    const rows = within(screen.getByRole("list", { name: "All open leads" })).getAllByRole("button")
    expect(rows[0]).toHaveTextContent("Fernhill Capital") // $120k, overdue
    expect(within(detail()).getByRole("heading", { level: 2, name: /Fernhill Capital/ })).toBeVisible()
  })

  it("does not let an incomplete lead be qualified, and says why", async () => {
    setup()
    await screen.findByText(/12 to triage/)
    expect(within(detail()).getByRole("button", { name: "Qualify" })).toBeDisabled()
    expect(within(detail()).getByText(/Qualify unavailable. Missing: team size, budget range, buying timeline/)).toBeVisible()
  })

  it("lets the user fill the gaps, then qualify, with accurate feedback and undo", async () => {
    const { user } = setup()
    await screen.findByText(/12 to triage/)
    await user.type(within(detail()).getByLabelText(/Team size/), "40")
    await user.click(within(detail()).getByRole("button", { name: "Save team size" }))
    await user.click(await within(detail()).findByRole("button", { name: "$50k+" }))
    await user.click(await within(detail()).findByRole("button", { name: "This quarter" }))
    const qualify = await within(detail()).findByRole("button", { name: "Qualify" })
    await waitFor(() => expect(qualify).toBeEnabled())
    await user.click(qualify)
    expect(await screen.findByText("Fernhill Capital qualified and assigned to you.")).toBeVisible()
    expect(screen.getByText("11 left to triage.")).toBeVisible()
    expect(screen.getByText(/11 to triage/)).toBeVisible()
    // selection moved on to the next lead
    expect(within(detail()).getByRole("heading", { level: 2, name: /Kestrel Robotics/ })).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Undo" }))
    await waitFor(() => expect(screen.getByText(/12 to triage/)).toBeVisible())
  })

  it("blocks an unsupported region from qualification and recommends nurture", async () => {
    const { user } = setup()
    await screen.findByText(/12 to triage/)
    await user.click(within(screen.getByRole("list", { name: "All open leads" })).getByRole("button", { name: /Kestrel Robotics/ }))
    expect(within(detail()).getByText("Region not supported")).toBeVisible()
    expect(within(detail()).getByRole("button", { name: "Qualify" })).toBeDisabled()
    expect(within(detail()).getByText(/Recommended: Nurture/)).toBeVisible()
  })

  it("requires a duplicate to be resolved before qualifying", async () => {
    const { user } = setup()
    await screen.findByText(/12 to triage/)
    await user.click(within(screen.getByRole("list", { name: "All open leads" })).getByRole("button", { name: /Orchard & Vale/ }))
    expect(within(detail()).getByRole("button", { name: "Qualify" })).toBeDisabled()
    await user.click(within(detail()).getByRole("button", { name: "It's a different company" }))
    await waitFor(() => expect(within(detail()).getByRole("button", { name: "Qualify" })).toBeEnabled())
  })

  it("requires a revisit date to nurture", async () => {
    const { user } = setup()
    await screen.findByText(/12 to triage/)
    await user.click(within(detail()).getByRole("button", { name: "Nurture" }))
    const date = within(detail()).getByLabelText("Revisit on")
    await user.clear(date)
    expect(within(detail()).getByRole("button", { name: "Move to nurture" })).toBeDisabled()
  })

  it("keeps the lead and says so when a save fails, and succeeds on retry", async () => {
    const { user } = setup({ failSave: true })
    await screen.findByText(/12 to triage/)
    await user.click(within(screen.getByRole("list", { name: "All open leads" })).getByRole("button", { name: /Tidewater/ }))
    // Tidewater has an unconfirmed decision maker (a warning, not a blocker)
    await user.click(within(detail()).getByRole("button", { name: "Qualify" }))
    expect(await within(detail()).findByText(/The decision wasn't saved/)).toBeVisible()
    expect(screen.getByText(/12 to triage/)).toBeVisible()
    await user.click(within(detail()).getByRole("button", { name: "Qualify" }))
    expect(await screen.findByText("Tidewater Credit Union qualified and assigned to you.")).toBeVisible()
  })

  it("shows an error with Retry, and recovers", async () => {
    const { user } = setup({ mode: "error" })
    expect(await screen.findByText("Couldn't load leads")).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(await screen.findByText(/12 to triage/)).toBeVisible()
  })

  it("shows an empty state when there are no leads", async () => {
    setup({ mode: "empty" })
    expect(await screen.findByText("No leads need triage")).toBeVisible()
  })

  it("filters the queue by readiness and keeps counts honest", async () => {
    const { user } = setup()
    await screen.findByText(/12 to triage/)
    await user.click(screen.getByRole("tab", { name: /Blocked/ }))
    const rows = within(screen.getByRole("list", { name: "Blocked leads" })).getAllByRole("button")
    expect(rows).toHaveLength(3) // Orchard & Vale (duplicate), Kestrel and Quillbox (region)
  })
})
