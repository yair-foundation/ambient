import * as React from "react"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"

export interface UndoNoticeProps {
  /** What changed, in the person's terms: "Fernhill Capital qualified and assigned to you." */
  message: string
  /** The consequence worth knowing now, e.g. "11 left to triage." Keep it true to the data on screen. */
  detail?: React.ReactNode
  /**
   * Reverse the action. The result is a contract:
   * - `true`: the prior state was successfully restored.
   * - `false`: the reversal did not succeed.
   * - a rejected promise: the outcome could not be confirmed.
   * Anything other than `true` (including `undefined`) is NOT success.
   * The owning feature removes or updates the notice after `true`.
   */
  onUndo: () => boolean | Promise<boolean>
  /**
   * Identifies the action this notice is about. A notice resets when `message` or `actionId` changes, so a
   * failure from one action never shows on the next. Pass it when two different actions can produce the same message.
   */
  actionId?: string | number
  className?: string
}

type Phase = "idle" | "pending" | "undone" | "failed" | "unconfirmed"

const FAILURE_TEXT = {
  failed: "Couldn't undo. Try again.",
  unconfirmed: "Couldn't confirm Undo. Check the current state before trying again.",
} as const

/**
 * Confirms that an action changed a record and lets the person reverse it.
 * Announced politely (role=status) and never auto-dismisses. Undo cannot run twice at once, and after a
 * successful Undo it cannot run again. It manages no record state: restoring it is the caller's job.
 */
export function UndoNotice(props: UndoNoticeProps) {
  // remount per action: state (a failure, a finished undo, a lock) belongs to one action, never the next
  return <UndoNoticeForAction key={`${props.actionId ?? ""}|${props.message}`} {...props} />
}

function UndoNoticeForAction({ message, detail, onUndo, className }: UndoNoticeProps) {
  const [phase, setPhase] = React.useState<Phase>("idle")
  // a ref, not state: a second click in the same tick must not start a second reversal
  const locked = React.useRef(false)

  async function undo() {
    if (locked.current) return
    locked.current = true
    setPhase("pending")
    try {
      const restored = await onUndo()
      if (restored === true) {
        setPhase("undone") // stays locked: a successful Undo is final
        return
      }
      setPhase("failed")
    } catch {
      setPhase("unconfirmed")
    }
    locked.current = false
  }

  const failure = phase === "failed" || phase === "unconfirmed" ? FAILURE_TEXT[phase] : null
  return (
    <Alert role="status" className={className}>
      <Icon name="check" />
      <AlertTitle>{message}</AlertTitle>
      {(failure || detail) && (
        <AlertDescription>
          {detail && <span className="block">{detail}</span>}
          {failure && <span className="block">{failure}</span>}
        </AlertDescription>
      )}
      <AlertAction>
        <Button size="sm" variant="outline" disabled={phase === "pending" || phase === "undone"} onClick={() => void undo()}>
          {phase === "pending" ? "Undoing…" : phase === "undone" ? "Undone" : "Undo"}
        </Button>
      </AlertAction>
    </Alert>
  )
}
