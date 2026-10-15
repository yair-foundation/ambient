# Harness results: ClientOps on Ambient UI

Status as of the **second Govern checkpoint**: Direction A approved, B rejected. **Nothing has been promoted to the shared system yet**; two proposals await approval.
One practical demonstration, not statistical proof of better design.

| # | Criterion | Status | Evidence so far |
|---|---|---|---|
| S1 | Foundation | **PASS** | Installed with the official `@ambient-ui/cli` flow (doctor, begin, install, verify). `ambientui verify` passes 12 checks against the production build (hotkey, theme, mobile orb, no console errors). Data layer: `src/lib/foundation/tokens.ts`, controls and propagation sample at `/ds`. Component layer: `src/ds/catalog.ts` rendered at `/ds` → Components, with a coverage test. Agent layer: `CLAUDE.md`, `.claude/ambientui/CLAUDE.md`, `ds-manager`, `product-design-manager`, `product-copy`. Propagation check: accent, gray, radius, spacing and scaling each moved exactly the expected computed styles. Assistant stub audit passes for every page. |
| S2 | Consistency | **PASS** | Two directions share data, rules, store, Foundation and components. Grep over product code: 0 hex/rgb/oklch literals, 0 arbitrary Tailwind values, 0 direct icon-library imports, no CSS beyond the shipped files. One inline style (progress-bar width, a data value). |
| S3 | Governance | **PARTIAL** | A person explicitly approved Direction A and rejected B (logged in `docs/DECISION-LOG.md`). Approval of a shared-system promotion is still pending (`docs/proposals/`). |
| S4 | Promotion | NOT TESTED | No shared change made yet, by design. Candidate `UndoNotice` is built and verified in an isolated worktree, not applied. |
| S5 | Reuse | NOT TESTED | Second task frozen (hash in `docs/governance/second-task.sha256.md`); fresh-agent run not started. |
| S6 | Integrity | NOT TESTED (interim: open findings) | 29 automated tests pass; lead triage passes axe in the queue, every form state, the decision banner and the decided lead, at 1280 and 390 px in light and dark; browser flows verified. Open: the shared destructive-variant contrast defects (the `/ds` page still shows them). The second feature does not exist yet. |

## Findings to date

1. **Shared destructive recipe fails contrast (one root cause, three components):** Badge and Button `destructive`
   measure 3.85:1 light / 4.36:1 dark; Alert `destructive` description 4.49:1 light (AA needs 4.5:1). Correction: an
   earlier version of this file said the Badge was 4.49:1; that was the Alert's number, not measured for the Badge.
   Product code avoids all three. A verified fix (3 class strings, 0 violations) is proposed, not applied:
   `docs/proposals/ds-bug-fixes.md`.
2. **Foundation role pair** `--muted-foreground` on `--muted` is 4.34:1 with slate. Avoided locally; needs a Foundation decision.
3. **Process catches worth knowing:** the keyboard-focus bug, the unusable queue ordering, a "wrap" fix that never took
   effect (Tabs height is hard-coded), an error state that could not render under StrictMode, and a disabled-button
   contrast failure that axe skips. All were found by running the product, not by reading it.
4. The upstream web guide (`ambientui.ai/start.md`) and the installed skill differ; I followed the installed skill and
   the CLI's plan.
5. Environment: `verify` hotkey probe failed on the Vite dev server (cold start) and passed 5/5 on the production
   build; the CLI's runtime probe needed Chrome at `/opt/google/chrome/chrome` (a symlink to the pre-installed
   Chromium, outside the repo).
6. One vendored file was edited (`src/components/ambient/responder.ts`, constructor parameter properties rewritten
   because the Vite template enables `erasableSyntaxOnly`). Recorded in `AMBIENTUI-NOTES.md`.

## Limits of this experiment (stated up front)

- The agent that built both directions also wrote the frozen second-task brief, so it knows the brief. The brief
  was written before any direction existed and its SHA-256 is committed; the text is outside the repository.
- No human design review has happened yet.
