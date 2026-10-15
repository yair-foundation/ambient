# Decision log

Every change to the shared system adds a dated row: what was decided and why. Read it before changing the system.
Rejected directions are recorded so they are not rebuilt as standards.

| Date | Decision | Why |
|---|---|---|
| 2026-10-15 | Installed Ambient UI (start, foundation, ambient-layer, foundation-ambient-bridge, governance doors) into a new Vite + React + TypeScript + Tailwind v4 + shadcn project. | Official install path via `@ambient-ui/cli`. |
| 2026-10-15 | Foundation defaults: accent indigo, gray slate, radius 6px, spacing Default 4px, scaling 95%, motion Productive, icons Lucide. | No visual reference supplied. A calm, dense working tool: slate ground, accent only on actions, slightly tight corners, compact type. These are Foundation values, not component styling. |
| 2026-10-15 | Added shadcn primitives: badge, card, tabs, checkbox, textarea, alert, dropdown-menu. | Needed for the lead-triage prototypes. Textarea fills a gap the upstream docs list; documented in `src/ds/catalog.ts`. |

## Watchlist

Patterns spotted but not yet ruled on. Triage through the pattern watchlist protocol.

(none yet)
