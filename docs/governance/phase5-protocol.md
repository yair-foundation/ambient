# Phase 5 protocol (pre-registered, committed before the run)

Question: can a new agent, given only the normal repository and a product brief, independently discover and correctly
reuse an approved shared design pattern?

## Frozen task
- Brief: unchanged since freeze. SHA-256 `9ce3d3bf68a430d7c7c3f9fc766b01c16b3708adfbed02f85de5369322ab6307` equals the hash committed in
  Phase 1 (`second-task.sha256.md`), re-verified immediately before the run.
- The brief is given to the agent verbatim, in the prompt. It is not in the repository.

## Isolation
- Workspace: a copy of the committed tree with **no git history** (history and commit messages describe the
  experiment), one baseline commit, no remote.
- Removed from the workspace: `HARNESS_RESULTS.md`, `AMBIENTUI-NOTES.md`, `docs/GOVERN-REVIEW.md`,
  `docs/GOVERN-SKILL-AUDIT.md`, `docs/PROTOTYPES.md`, `docs/governance/`, `docs/evidence/`, the docs zip.
- Kept (normal repository context): `CLAUDE.md`, `.claude/` (rules and the three skills), `docs/DECISION-LOG.md`,
  `docs/KNOWN-DS-ISSUES.md`, `docs/PRODUCT-ASSUMPTIONS.md`, `docs/rejected/`, all of `src/`, `scripts/`.
- The prompt is the product brief plus a neutral working instruction. It does not mention the promotion, the pattern,
  reuse, or the experiment.
- Limit, stated up front: a subagent shares the machine's filesystem and cannot be sandboxed. Mitigation: the agent's
  transcript is audited for reads outside its workspace.

## Pre-registered fit judgement (written before seeing any output)
The brief requires recording and revising a renewal plan and keeping a portfolio summary accurate. Recording a plan is
a record-changing action, so a reversible confirmation is a *reasonable* choice, but the brief does **not** ask for
undo or reversal (it asks that a plan "can be revised"). Fit is therefore **optional**: reasonable, not required.

## Outcome categories
| Outcome | Definition | Counts as |
|---|---|---|
| A. Reused correctly | Imports the shared component from `@/components/shared/`; its `onUndo` returns `true` only after really restoring the prior state; the feature removes or updates the notice after success; documented contract respected | S5 PASS |
| B. Reused incorrectly | Imports it but breaks the contract (undefined as success, no real restore, stale notice) | S5 PARTIAL |
| C. Recreated | Builds a reversal-with-feedback affordance (inline notice with Undo, toast, etc.) without using the shared component | S5 FAIL for that instance |
| D. Not needed | Builds no reversal affordance and no duplicate | S5 **INCONCLUSIVE** (not a failure; the pattern is not demoted) |

## Also recorded, whatever the outcome
Discovery trail (files read, in order); which skills were invoked (transcript, not self-report alone); behaviour against
every rule in the brief; gate, `audit:ds`, tests, axe, mobile; any change to shared files; duplicate or conflicting
implementations; whether the agent updated the registry for anything it added.
