# Phase 2: two lead-triage directions

Mission: help an account manager triage incoming leads and decide what to do next.
Both directions run on the **same data** (`src/data/clientops.ts`, 12 fictional leads), the **same rules**
(`src/features/triage/rules.ts`), the **same store** (`src/features/triage/store.ts`) and the **same Foundation and
components**. Only the shape of the experience differs.

| | A. Queue workspace | B. Guided review |
|---|---|---|
| URL | `/triage/a` | `/triage/b` |
| Code | `src/features/triage-a/` | `src/features/triage-b/` |
| Decision it supports | Which lead needs me most, and where does everything stand? | What should I do with this lead, right now? |
| Main interaction | The queue stays on screen beside the selected lead. Filter by readiness, move with arrows or j/k, review, decide. On phones the lead opens in a sheet. | One lead at a time, most urgent first. A recommendation, a checklist to resolve in place, one decision, then the next lead appears. |
| Moving between records | Direct: click or arrow to any lead | Sequential: decide or skip; two "up next" previews |
| Moving from review to action | Action bar at the foot of the detail; recommendation shown as the highlighted button | Decision is the last step of the card; the recommendation is the default choice |
| Feedback after an action | Banner above the panes: what changed, how many are left, Undo. Selection moves to the next lead and keyboard focus stays in the queue | Banner above the card with the same facts and Undo; the next lead takes focus. A "Queue clear" summary lists every decision with its own Undo |

## Advantages and trade-offs

**A. Queue workspace**
- Advantages: full situational awareness (counts by readiness, overdue total); jump to any lead; fast for people who
  already know which lead they want; reads well as a working surface for a long queue; keyboard queue navigation.
- Trade-offs: more on screen at once; the recommendation competes with the rest of the page; nothing nudges the
  person toward the order the rules suggest; on phones it becomes list, then sheet, so the queue is out of sight
  while deciding.

**B. Guided review**
- Advantages: lowest cognitive load; the recommended action and the reason are the first thing after the facts;
  one primary path; works the same on phone and desktop; the progress bar and "Queue clear" end state reward finishing.
- Trade-offs: little overview (only the next two leads); an unusual lead can only be reached by skipping to it, in
  order; harder to compare two leads; a person who disagrees with the queue order has no way to change it.

No winner is declared here. That is a product call for you.

## Shared product rules (both directions enforce them)

- A lead cannot be qualified while it is missing team size, budget or timeline, has an unresolved possible duplicate
  account, or is in an unsupported region. The reason is stated next to the action.
- Nurture needs a revisit date; disqualify needs a reason; request-info is only offered when something is missing.
- Queue order: overdue leads first, highest value first among them, then soonest first-response deadline.
- Every decision is recorded and reversible, and counts and lists always match what was just done.
- A failed save leaves the lead where it was, says so, and can be retried.

## States and review switches

Add to either URL: `?state=loading`, `?state=empty`, `?state=error` (Retry recovers), `?fail=save` (the first save fails).

## Accessibility and responsiveness checks run

- axe-core (WCAG 2 A/AA rules) over `/`, both directions, and their empty and error states, at 1280 and 390 px, in
  light and dark: 32 page states. Both directions: 0 violations (after fixing three defects found by the audit).
  `/ds` has 1 violation, from the shared destructive Badge (see HARNESS_RESULTS.md).
- Keyboard: queue arrows and j/k; focus moves to the next row (A) or next heading (B) after a decision.
- No horizontal overflow at 390 px; `?state=` views checked visually.
- Screenshots: `docs/evidence/phase2-desktop-A-vs-B.png`, `docs/evidence/phase2-mobile-A-sheet-B.png`.
