import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { UndoNotice } from "./undo-notice"

const UNDO = { name: "Undo" }

describe("UndoNotice", () => {
  it("announces what changed and its consequence politely", () => {
    render(<UndoNotice message="Fernhill Capital qualified." detail="11 left to triage." onUndo={() => true} />)
    const status = screen.getByRole("status")
    expect(status).toHaveTextContent("Fernhill Capital qualified.")
    expect(status).toHaveTextContent("11 left to triage.")
  })

  it("runs a single reversal while in flight: disabled, and a second click does nothing", async () => {
    let finish!: (ok: boolean) => void
    const onUndo = vi.fn(() => new Promise<boolean>((r) => (finish = r)))
    const user = userEvent.setup()
    render(<UndoNotice message="Done." onUndo={onUndo} />)
    await user.click(screen.getByRole("button", UNDO))
    const busy = screen.getByRole("button", { name: "Undoing…" })
    expect(busy).toBeDisabled()
    await user.click(busy)
    expect(onUndo).toHaveBeenCalledTimes(1)
    finish(true)
    await screen.findByRole("button", { name: "Undone" })
  })

  it("treats only true as success, then cannot be triggered again", async () => {
    const onUndo = vi.fn(() => Promise.resolve(true))
    const user = userEvent.setup()
    render(<UndoNotice message="Done." detail="2 left." onUndo={onUndo} />)
    await user.click(screen.getByRole("button", UNDO))
    const done = await screen.findByRole("button", { name: "Undone" })
    expect(done).toBeDisabled()
    await user.click(done)
    expect(onUndo).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/Couldn't/)).toBeNull()
  })

  it("accepts a synchronous true", async () => {
    const user = userEvent.setup()
    render(<UndoNotice message="Done." onUndo={() => true} />)
    await user.click(screen.getByRole("button", UNDO))
    expect(await screen.findByRole("button", { name: "Undone" })).toBeDisabled()
  })

  it("reports a failed reversal (false) without claiming anything about the state, and allows a retry", async () => {
    const onUndo = vi.fn(() => Promise.resolve(false))
    const user = userEvent.setup()
    render(<UndoNotice message="Done." detail="2 left." onUndo={onUndo} />)
    await user.click(screen.getByRole("button", UNDO))
    expect(await screen.findByText("Couldn't undo. Try again.")).toBeVisible()
    expect(screen.queryByText(/Nothing changed/)).toBeNull()
    await user.click(screen.getByRole("button", UNDO))
    expect(onUndo).toHaveBeenCalledTimes(2)
  })

  it("admits uncertainty when the reversal rejects, and allows a retry", async () => {
    const onUndo = vi.fn(() => Promise.reject(new Error("network")))
    const user = userEvent.setup()
    render(<UndoNotice message="Done." onUndo={onUndo} />)
    await user.click(screen.getByRole("button", UNDO))
    expect(await screen.findByText("Couldn't confirm Undo. Check the current state before trying again.")).toBeVisible()
    expect(screen.queryByText(/Nothing changed/)).toBeNull()
    await waitFor(() => expect(screen.getByRole("button", UNDO)).toBeEnabled())
  })

  it.each([[undefined], [null], ["yes"], [1]])("does not treat %p as success", async (value) => {
    const user = userEvent.setup()
    render(<UndoNotice message="Done." onUndo={(() => value) as unknown as () => boolean} />)
    await user.click(screen.getByRole("button", UNDO))
    expect(await screen.findByText("Couldn't undo. Try again.")).toBeVisible()
    expect(screen.queryByRole("button", { name: "Undone" })).toBeNull()
  })

  it("keeps the consequence visible next to a failure, since the change is still in place", async () => {
    const user = userEvent.setup()
    render(<UndoNotice message="Done." detail="11 left to triage." onUndo={() => Promise.resolve(false)} />)
    await user.click(screen.getByRole("button", UNDO))
    expect(await screen.findByText("Couldn't undo. Try again.")).toBeVisible()
    expect(screen.getByText("11 left to triage.")).toBeVisible()
  })

  it("does not leak one action's failure into the notice for the next action", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<UndoNotice message="Fernhill Capital qualified." onUndo={() => Promise.resolve(false)} />)
    await user.click(screen.getByRole("button", UNDO))
    expect(await screen.findByText("Couldn't undo. Try again.")).toBeVisible()
    rerender(<UndoNotice message="Kestrel Robotics moved to nurture." detail="10 left to triage." onUndo={() => true} />)
    expect(screen.queryByText(/Couldn't/)).toBeNull()
    expect(screen.getByText("10 left to triage.")).toBeVisible()
    expect(screen.getByRole("button", UNDO)).toBeEnabled()
  })

  it("resets for a different action even when the message is identical, if actionId differs", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<UndoNotice actionId={1} message="Saved." onUndo={() => Promise.resolve(false)} />)
    await user.click(screen.getByRole("button", UNDO))
    expect(await screen.findByText("Couldn't undo. Try again.")).toBeVisible()
    rerender(<UndoNotice actionId={2} message="Saved." onUndo={() => true} />)
    expect(screen.queryByText(/Couldn't/)).toBeNull()
  })

  it("a successful undo stays final for that action, and a new action gets a fresh, working Undo", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<UndoNotice actionId={1} message="Saved." onUndo={() => true} />)
    await user.click(screen.getByRole("button", UNDO))
    expect(await screen.findByRole("button", { name: "Undone" })).toBeDisabled()
    rerender(<UndoNotice actionId={2} message="Saved again." onUndo={() => true} />)
    expect(screen.getByRole("button", UNDO)).toBeEnabled()
  })
})
