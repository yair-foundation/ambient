import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { SEED_RENEWALS } from "@/data/renewals"
import Renewals from "./renewals"
import { createRenewalStore } from "./store"

const setup = (opts = {}, seed = SEED_RENEWALS) => {
  const store = createRenewalStore(seed, { latencyMs: 0, ...opts })
  render(<Renewals store={store} />)
  return { store, user: userEvent.setup() }
}
const detail = () => screen.getByRole("region", { name: "Account detail" })
const pick = async (user: ReturnType<typeof userEvent.setup>, name: RegExp) =>
  user.click(within(screen.getByRole("list", { name: "All renewing accounts" })).getByRole("button", { name }))
const choose = async (user: ReturnType<typeof userEvent.setup>, outcome: string) => {
  await user.click(within(detail()).getByRole("button", { name: /Expected outcome/ }))
  await user.click(await screen.findByRole("menuitemradio", { name: outcome }))
}

describe("Renewals page", () => {
  it("loads, then shows the summary and the most urgent account first", async () => {
    setup()
    expect(screen.getByText("Loading renewals")).toBeInTheDocument()
    expect(await screen.findByText(/14 accounts renewing in the next 90 days, 14 without a plan/)).toBeVisible()
    const rows = within(screen.getByRole("list", { name: "All renewing accounts" })).getAllByRole("button")
    expect(rows).toHaveLength(14)
    expect(rows[0]).toHaveTextContent("Brightwell Logistics")
    expect(within(detail()).getByRole("heading", { level: 2, name: /Brightwell Logistics/ })).toBeVisible()
    expect(within(detail()).getByText("Overdue invoice")).toBeVisible()
  })

  it("shows empty and error states, and recovers with Retry", async () => {
    const { user } = setup({ mode: "error" })
    expect(await screen.findByText("Couldn't load renewals")).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Retry" }))
    expect(await screen.findByText(/14 accounts renewing/)).toBeVisible()
  })

  it("shows the empty state", async () => {
    setup({ mode: "empty" })
    expect(await screen.findByText("No renewals in the next 90 days")).toBeVisible()
  })

  it("requires a next step and date for at risk, then records the plan and updates the summary", async () => {
    const { user } = setup()
    await screen.findByText(/14 accounts renewing/)
    await pick(user, /Cobalt Freight/)
    await choose(user, "At risk, needs intervention")
    await user.click(within(detail()).getByRole("button", { name: "Save plan" }))
    expect(await within(detail()).findByText(/Name the next step/)).toBeVisible()
    expect(within(detail()).getByText("Choose a date for the next step.")).toBeVisible()
    await user.type(within(detail()).getByLabelText(/Next step/), "Executive call")
    await user.type(within(detail()).getByLabelText(/Date for the next step/), "2026-10-30")
    await user.click(within(detail()).getByRole("button", { name: "Save plan" }))
    expect(await screen.findByText(/Plan recorded for Cobalt Freight/)).toBeVisible()
    expect(screen.getByText(/1 of 14 accounts have a plan/)).toBeVisible()
    expect(screen.getByText(/13 without a plan/)).toBeVisible()
    await user.click(screen.getByRole("button", { name: "Undo" }))
    await waitFor(() => expect(screen.getByText(/14 without a plan/)).toBeVisible())
  })

  it("blocks renew as is with an open P1 until acknowledged, and a plan can be revised", async () => {
    const { user } = setup()
    await screen.findByText(/14 accounts renewing/)
    await pick(user, /Meridian Legal/)
    await choose(user, "Renew as is")
    await user.click(within(detail()).getByRole("button", { name: "Save plan" }))
    expect(await within(detail()).findByText(/Acknowledge the open priority-one escalation/)).toBeVisible()
    await user.click(within(detail()).getByRole("checkbox"))
    await user.click(within(detail()).getByRole("button", { name: "Save plan" }))
    expect(await screen.findByText(/Plan recorded for Meridian Legal: renew as is/)).toBeVisible()
    await choose(user, "Expected to churn")
    await user.type(within(detail()).getByLabelText(/Next step/), "Exit interview")
    await user.type(within(detail()).getByLabelText(/Date for the next step/), "2026-11-20")
    await user.click(within(detail()).getByRole("button", { name: "Save revision" }))
    expect(await screen.findByText(/Plan revised for Meridian Legal: expected to churn/)).toBeVisible()
  })

  it("keeps the form and says so when a save fails", async () => {
    const { user } = setup({ failSave: true })
    await screen.findByText(/14 accounts renewing/)
    await pick(user, /Cobalt Freight/)
    await choose(user, "Renew as is")
    await user.click(within(detail()).getByRole("button", { name: "Save plan" }))
    expect(await within(detail()).findByText(/The plan wasn't saved/)).toBeVisible()
    await user.click(within(detail()).getByRole("button", { name: "Save plan" }))
    expect(await screen.findByText(/Plan recorded for Cobalt Freight/)).toBeVisible()
  })
})
