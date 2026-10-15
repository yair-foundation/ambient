# Harness results: ClientOps on Ambient UI

Status as of the **Govern checkpoint** (nothing has been promoted to the shared system yet).
One practical demonstration, not statistical proof of better design.

| # | Criterion | Status | Evidence so far |
|---|---|---|---|
| S1 | Foundation | **PASS** | Installed with the official `@ambient-ui/cli` flow (doctor, begin, install, verify). `ambientui verify` passes 12 checks against the production build (hotkey, theme, mobile orb, no console errors). Data layer: `src/lib/foundation/tokens.ts`, controls and propagation sample at `/ds`. Component layer: `src/ds/catalog.ts` rendered at `/ds` → Components, with a coverage test. Agent layer: `CLAUDE.md`, `.claude/ambientui/CLAUDE.md`, `ds-manager`, `product-design-manager`, `product-copy`. Propagation check: accent, gray, radius, spacing and scaling each moved exactly the expected computed styles. Assistant stub audit passes for every page. |
| S2 | Consistency | **PASS** | Two directions share data, rules, store, Foundation and components. Grep over product code: 0 hex/rgb/oklch literals, 0 arbitrary Tailwind values, 0 direct icon-library imports, no CSS beyond the shipped files. One inline style (progress-bar width, a data value). |
| S3 | Governance | NOT TESTED | Awaiting a person's choice of direction and of any promotion. |
| S4 | Promotion | NOT TESTED | No shared change made yet, by design. |
| S5 | Reuse | NOT TESTED | Second task frozen (hash in `docs/governance/second-task.sha256.md`); fresh-agent run not started. |
| S6 | Integrity | NOT TESTED (interim: open findings) | 35 automated tests pass; both directions pass axe in 32 page states; browser flows verified. Open: two shared-component contrast defects (below). The second feature does not exist yet. |

## Findings to date

1. **Shared `Badge variant="destructive"`** measures 4.49:1 at text-xs (AA needs 4.5:1). Product code avoids it; the
   `/ds` propagation sample still shows it and axe flags it. Documented as a known issue in `src/ds/catalog.ts`.
2. **Shared `Alert variant="destructive"`** description is `text-destructive/90`, also 4.49:1. Product code avoids it.
3. The upstream web guide (`ambientui.ai/start.md`) and the installed skill differ: the installed one drives the
   install through `@ambient-ui/cli`. I followed the installed one and the CLI's plan.
4. Environment notes: `verify` hotkey probe failed on the Vite dev server (cold-start) and passed 5/5 on the
   production build. The CLI's runtime probe needed Chrome at `/opt/google/chrome/chrome` (a symlink to the
   pre-installed Chromium, outside the repo).
5. One vendored file was edited (`src/components/ambient/responder.ts`, constructor parameter properties rewritten
   as explicit fields because the Vite template enables `erasableSyntaxOnly`). Recorded in `AMBIENTUI-NOTES.md`.

## Limits of this experiment (stated up front)

- The agent that built both directions also wrote the frozen second-task brief, so it knows the brief. The brief
  was written before any direction existed and its SHA-256 is committed; the text is outside the repository.
- No human design review has happened yet.
