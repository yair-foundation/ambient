# Decision log

Every change to the shared system adds a dated row: what was decided and why. Read it before changing the system.
Rejected directions are recorded so they are not rebuilt as standards.

| Date | Decision | Why |
|---|---|---|
| 2026-10-15 | Installed Ambient UI (start, foundation, ambient-layer, foundation-ambient-bridge, governance doors) into a new Vite + React + TypeScript + Tailwind v4 + shadcn project. | Official install path via `@ambient-ui/cli`. |
| 2026-10-15 | Foundation defaults: accent indigo, gray slate, radius 6px, spacing Default 4px, scaling 95%, motion Productive, icons Lucide. | No visual reference supplied. A calm, dense working tool: slate ground, accent only on actions, slightly tight corners, compact type. These are Foundation values, not component styling. |
| 2026-10-15 | Added shadcn primitives: badge, card, tabs, checkbox, textarea, alert, dropdown-menu. | Needed for the lead-triage prototypes. Textarea fills a gap the upstream docs list; documented in `src/ds/catalog.ts`. |
| 2026-10-15 | **Direction A (queue workspace) approved** as the lead-triage experience at `/triage`. Direction B (guided review) rejected and kept inert in `docs/rejected/direction-b/`. | A person's decision after reviewing both working directions. A gives overview, direct jumping and keyboard speed; B hid the queue and could not be reordered. Findings from B were kept or rejected explicitly (see its README). |
| 2026-10-15 | Queue order is a product assumption: overdue first, highest value first among them, then soonest deadline. | See `docs/PRODUCT-ASSUMPTIONS.md`, including the starvation risk to validate. |
| 2026-10-15 | Two proposals are **pending approval** and not applied: `docs/proposals/ds-bug-fixes.md` (destructive contrast) and `docs/proposals/promotion-undo-notice.md` (`UndoNotice`). | The Design System rule: nothing is promoted without a person's explicit approval. |

## Watchlist

Patterns spotted but not yet ruled on. Triage through the pattern watchlist protocol.

- Master-detail list pane with a sheet on phones, and j/k queue keyboard navigation (lead triage; one surface).
- Loading, empty and error states with Retry (lead triage; one surface).
- Tabs cannot wrap on phones without an `h-auto` override (note for the registry).
