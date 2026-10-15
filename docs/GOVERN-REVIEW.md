# Govern review: Direction A (queue workspace)

Decision (a person, 2026-10-15): **Direction A approved. Direction B rejected** (kept inert in `docs/rejected/`).
**Nothing in the shared system has been changed.** Two proposals await approval: `docs/proposals/`.

## 1. Evaluation of A

| Criterion | Assessment | Evidence |
|---|---|---|
| Product usefulness | Strong for the mission: urgency order, counts by readiness, blockers and gaps visible before deciding | `rules.ts` + 29 tests; queue rule on screen |
| Interaction clarity | One primary action (the recommendation) with its consequence; others subordinate; unavailable actions say why | hierarchy test; screenshot |
| Information hierarchy | Queue, then facts, then "Before you decide", then "Next step" | `lead-detail.tsx` |
| Ease of completing the task | Ready lead: 1 click to qualify. Needs info: fill gaps in place, then 1 click. Keyboard: arrows or j/k, focus stays in the queue | browser flows |
| Visual and behavioral consistency | Foundation tokens only; no hex, no arbitrary values, no icon-library imports | grep check |
| Accessibility | axe 0 violations over the queue, all form states, decision banner and decided lead, at 1280 and 390 px, light and dark | `axe2` runs; informational menu-landmark note only |
| Mobile | Detail opens in a sheet; filters are an aligned grid with 32 px targets; no overflow at 390 and 320 px | measured |
| Reuse opportunities | See section 3 | |

Refinements made this round: single primary action with impact copy; `Disqualify` ghost and last; filter strip fixed
for phones (the earlier wrap fix had no effect because `TabsList` hard-codes `h-8`); queue rule shown on screen and
written up in `docs/PRODUCT-ASSUMPTIONS.md`; tab-count contrast fixed.

## 2. Classification of findings

### Existing pattern (reuse, no duplicate)
Card, Badge, Tabs (filters), Sheet (mobile detail), Alert + AlertAction (errors, and the shell of the decision
feedback), Skeleton (loading), DropdownMenu radio items (disqualify reason), Input, Button, Icon, `setPageChip` and
stubs for the assistant, Foundation tokens. All composed as documented.

### Feature-specific decision (keep local)
Queue ordering rule; readiness rules, SLA clock and recommended-action logic (`rules.ts`); GapEditor and BlockerList
(domain forms); master-detail arrangement with a sheet on phones; j/k keyboard navigation and focus-after-decision;
primary-action hierarchy; the in-memory store with latency and failure switches (prototype tooling).
The master-detail layout and keyboard navigation are on the **watchlist**: one surface so far.

### Reusable improvement (candidates)
| # | Candidate | Verdict |
|---|---|---|
| R1 | **Decision feedback with Undo** | Reusable behavior, thin component. **Recommended**: `UndoNotice` (section 4) |
| R2 | Loading, empty and error states (skeleton, message, Retry) | Watchlist. One surface; the three states differ in shape per feature, so a wrapper would be thin or leaky |
| R3 | Master-detail list pane with a sheet on phones | Watchlist. One surface |

### Rejected direction
From B (not turned into standards): skip-to-back, Tabs as an action selector, progress bar, per-decision undo list,
sequential-only review. See `docs/rejected/direction-b/README.md`.

### Design System bug fixes (not patterns): `docs/proposals/ds-bug-fixes.md`
Shared destructive Badge, Button and Alert fail contrast; plus related notes (muted text on quiet fill, Tabs fixed
height, menu landmark, touch target size).

## 3. Is Decision Feedback with Undo already covered by Ambient UI?

Checked: the ambient layer, the full `registry.ambientui.ai` item list, shadcn, and this project.

| Source | What exists | Covers it? |
|---|---|---|
| Ambient UI, assistant vocabulary | `ToolApproval` rolls a choice back if its request fails (`tool-kit.tsx`); `MessageActions`, `ErrorState`, `ToolFailure`, `ReviewableDiff` | No. Those act on assistant transcript turns, not on a product record the person just changed |
| Ambient UI registry (59 items) | No undo, toast or notification component | No |
| shadcn `sonner` (not installed) | Transient toast that can carry an action; needs the `sonner` and `next-themes` packages | Partly: a different pattern. Auto-dismissing, transient feedback is a weak home for an Undo that must be announced and stay reachable; it would also add two dependencies |
| This project | `Alert` + `AlertAction` | Covers the **look**. Does not cover the behavior |

**Verdict: genuinely reusable, but only in its behavior.** The look is an existing pattern (Alert). What is not
covered, and what repeated while prototyping (a banner in A, another in B, a list in B, a button on the decided lead):

1. Say exactly what changed and the consequence now true on screen.
2. Announce it politely and keep it until replaced (no auto-dismiss).
3. Offer Undo that restores the exact prior state, cannot fire twice, and reports failure honestly.

The undo state and restore logic remain feature-specific (`store.undo`). Honest caveat: today there is one surface in
this repository. The case for promotion rests on the pattern recurring for any record-changing action, which is
exactly what the reuse test checks. If it never recurs, it would be a small, harmless component and a reasonable
thing to remove.
