import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { DEMOS } from "./demos"

const UndoNoticeDemo = () => <>{DEMOS["undo-notice"]()}</>

const statusBadge = () => screen.getByLabelText(/^Status:/)

describe("UndoNotice demo (/ds)", () => {
  it("changes a record, then genuinely restores it and removes the notice", async () => {
    const user = userEvent.setup()
    render(<UndoNoticeDemo />)
    expect(statusBadge()).toHaveTextContent("New")
    await user.click(screen.getByRole("button", { name: "Qualify lead" }))
    expect(statusBadge()).toHaveTextContent("Qualified")
    await user.click(screen.getByRole("button", { name: "Undo" }))
    await waitFor(() => expect(statusBadge()).toHaveTextContent("New"))
    expect(screen.queryByRole("status")).toBeNull() // the owner removed the notice
    expect(screen.getByRole("button", { name: "Qualify lead" })).toBeEnabled()
  })

  it("keeps the change and says so when Undo returns false, then restores on a successful retry", async () => {
    const user = userEvent.setup()
    render(<UndoNoticeDemo />)
    await user.click(screen.getByRole("checkbox", { name: /Undo fails/ }))
    await user.click(screen.getByRole("button", { name: "Qualify lead" }))
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(await screen.findByText("Couldn't undo. Try again.")).toBeVisible()
    expect(statusBadge()).toHaveTextContent("Qualified")
    await user.click(screen.getByRole("checkbox", { name: /Undo fails/ }))
    await user.click(screen.getByRole("button", { name: "Undo" }))
    await waitFor(() => expect(statusBadge()).toHaveTextContent("New"))
  })

  it("admits uncertainty when Undo rejects", async () => {
    const user = userEvent.setup()
    render(<UndoNoticeDemo />)
    await user.click(screen.getByRole("checkbox", { name: /cannot be confirmed/ }))
    await user.click(screen.getByRole("button", { name: "Qualify lead" }))
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(await screen.findByText(/Couldn't confirm Undo\. Check the current state before trying again\./)).toBeVisible()
    expect(statusBadge()).toHaveTextContent("Qualified")
  })
})
