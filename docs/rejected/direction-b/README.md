# Direction B (guided review): rejected alternative

**Status: not approved. Not a standard. Do not copy from here into the product.**
These files are inert (`.txt`) and outside the build so nothing can import them.

One lead at a time, most urgent first, with a recommendation, a readiness checklist resolved in place, a decision, and
then the next lead. It was built and verified (8 tests, axe clean) on the same data, rules and store as the chosen
direction. A person chose Direction A (queue workspace) on 2026-10-15.

## Why it was not chosen

- Little overview: only the next two leads are visible; counts by readiness and the overdue total are absent.
- Sequential only: reaching a specific lead means skipping through the queue; the queue order cannot be changed.
- Harder to compare leads, and harder for people who already know which lead they want.

## What it taught (findings kept)

| Finding | What happened to it |
|---|---|
| State the consequence of an action in the person's terms ("Asks Maya for team size... the lead leaves your queue") | Adopted into A as `actionImpact()` under the primary action |
| One obvious primary action, with the reason | Adopted into A: the recommendation is the single filled button; the rest are subordinate |
| Move focus to the next lead after a decision | Adopted into A as focus on the next queue row |
| "N things to resolve" summary above the checklist | Not adopted; A shows blockers and missing items in "Before you decide" |
| Progress bar ("3 of 12 reviewed") | Not adopted; A shows "N left to triage" |
| Skip to the back of the queue | Rejected: hides work instead of deciding it |
| Tabs used as a four-way decision selector | Rejected: Tabs are for peer views, not choosing an action; do not make this a pattern |
| "Queue clear" end state with a per-decision Undo list | Not adopted; A's undo lives in the feedback notice and on the decided lead |
| Icon plus text checklist for pass/fail | Kept local to B; not generalised |

Files: `triage-b.tsx.txt`, `review-card.tsx.txt`, `triage-b.test.tsx.txt`.
