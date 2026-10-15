import * as React from "react"

import { UndoNotice } from "@/components/shared/undo-notice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

type DemoStatus = "New" | "Qualified"

/**
 * A self-contained demonstration of UndoNotice. It owns a tiny record, changes it, and genuinely restores it:
 * the component under demo knows nothing about this state. The demo plays the "owning feature": it removes the
 * notice once Undo reports success.
 */
export function UndoNoticeDemo() {
  const [status, setStatus] = React.useState<DemoStatus>("New")
  const [notice, setNotice] = React.useState<{ id: number; previous: DemoStatus } | null>(null)
  const [failUndo, setFailUndo] = React.useState(false)
  const [rejectUndo, setRejectUndo] = React.useState(false)
  const seq = React.useRef(0)
  // the simulation switches, read at the moment Undo runs (refs updated from the handlers, not during render)
  const sim = React.useRef({ failUndo: false, rejectUndo: false })

  async function undo(previous: DemoStatus): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 400)) // behaves like a network call
    if (sim.current.rejectUndo) throw new Error("connection lost")
    if (sim.current.failUndo) return false
    setStatus(previous) // genuinely restores the record
    setNotice(null) // the owning feature removes the notice after success
    return true
  }

  return (
    <div className="grid max-w-md gap-3">
      <div className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm">
        <span>
          <span className="font-medium">Northwind Freight</span>
          <span className="block text-xs text-muted-foreground">Demo request</span>
        </span>
        <Badge variant={status === "Qualified" ? "default" : "secondary"} aria-label={`Status: ${status}`}>
          {status}
        </Badge>
      </div>
      {notice ? (
        <UndoNotice
          actionId={notice.id}
          message={`Northwind Freight qualified and assigned to you.`}
          detail="11 left to triage."
          onUndo={() => undo(notice.previous)}
        />
      ) : (
        <div>
          <Button
            variant="outline"
            disabled={status === "Qualified"}
            onClick={() => {
              setNotice({ id: ++seq.current, previous: status })
              setStatus("Qualified")
            }}
          >
            Qualify lead
          </Button>
        </div>
      )}
      <fieldset className="grid gap-1 text-xs text-muted-foreground">
        <legend className="mb-1">Rehearse the outcomes of Undo</legend>
        <label className="flex items-center gap-2">
          <Checkbox checked={failUndo} onCheckedChange={(v) => { sim.current.failUndo = v === true; setFailUndo(v === true) }} /> Undo fails (returns false)
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={rejectUndo} onCheckedChange={(v) => { sim.current.rejectUndo = v === true; setRejectUndo(v === true) }} /> Undo cannot be confirmed (rejects)
        </label>
      </fieldset>
    </div>
  )
}

