# Promotion proposal: `UndoNotice`: NOT applied, awaiting approval

## The problem it solves
After an action that changes a record, a person needs to know exactly what changed, what is now true on screen, and
how to take it back. While prototyping lead triage this was built four times (two notices, a list, a button), each
with its own gaps: no failure handling on Undo, no protection against a double click.

## Why the existing system does not already solve it
The look is `Alert` + `AlertAction` (existing). The behavior is not covered: Ambient UI's only undo logic is inside
the assistant's `ToolApproval`; shadcn's `sonner` toast is transient and adds two dependencies. See
`docs/GOVERN-REVIEW.md` section 3.

## The smallest change
One component and its documentation. **Not** a toast, **not** a store, **not** a hook.

| File | Change |
|---|---|
| `src/components/shared/undo-notice.tsx` (new, 58 lines) | `UndoNotice({ message, detail?, onUndo })`. Composes Alert and Button. `role=status`, never auto-dismisses, Undo disabled while in flight, shows "Couldn't undo. Nothing changed; try again." when `onUndo` rejects or resolves `false` |
| `src/components/shared/undo-notice.test.tsx` (new, 5 tests) | announcement; single call and disabled while pending; failure by rejection and by `false`; no false failure after success |
| `src/ds/catalog.ts` | `Layer` gains `"shared"`; new `undo-notice` entry (behavior, when to use, when not to) |
| `src/ds/demos.tsx` | live demo, so it appears at `/ds` → Components |
| `src/ds/catalog.test.ts` | the coverage check ignores `*.test.tsx` (otherwise it flags test files as undocumented components) |
| `src/features/triage-queue/triage-queue.tsx` | the decision banner now uses `UndoNotice`; behavior unchanged |
| `src/lib/ambient/stubs/ds.ts` | assistant answer to "Which shared patterns has a person approved?" |
| `docs/DECISION-LOG.md` | one dated row: what, why, approved by a person |

Layer that owns it: **shared components** (`src/components/shared/`), above `components/ui` (shadcn primitives) and
below features. It needs no Foundation change and no new token.

**Why not smaller:** a docs-only recipe would not change implementation behavior, and the failure and double-fire
handling is the part agents would skip. **Why not larger:** undo state and restore logic differ per feature and stay
there; a toast or a generic "reversible action" hook would be speculative.

## How a fresh agent discovers it (normal channels only)
1. Root `CLAUDE.md`, "Before you build any UI" (already says so): read the registry (`src/ds/catalog.ts`), read
   `docs/DECISION-LOG.md` for approved patterns, and **look in `src/components/shared/`**. All three now contain it.
2. `/ds` → Components: the entry, the live demo, and when-to-use / when-not-to.
3. The assistant, on the design-system page: "Which shared patterns has a person approved?" returns it with its path.
4. `npm test` fails if any shared component lacks a registry entry, so it cannot be silently undocumented.

**Deliberately not added:** a line in `CLAUDE.md` that names `UndoNotice` or says "use an undo notice". That would tell
the fresh agent what to reuse and weaken the test. The patch file itself is removed from `docs/proposals/` when it is
applied, so the agent finds only the promoted code.

## How its behavior is tested
- Unit tests above (34 tests pass in the isolated build: 29 existing + 5 new).
- Lead triage's existing integration tests (banner text, count, Undo restores) pass unchanged on the refactor.
- Browser: banner text, count and Undo identical; axe clean on the banner state; `/ds` entry renders.
- Reuse (Phase 5): a fresh agent is judged on whether it imports `@/components/shared/undo-notice` for a
  record-changing action instead of hand-building Alert + Undo, and preserves the contract.

## Risks, stated plainly
- Thin: 58 lines. One live use today. If it never recurs it is small and removable.
- It sits next to an unfixed shared defect: it uses default `Alert` and outline `Button`, so it is unaffected by the
  destructive-variant contrast bug.
- The registry summary says "Approved shared pattern"; that wording is only true once a person approves.

Verified in an isolated worktree: typecheck, lint (existing warnings only), 34 tests, browser check, `git apply --check`
on main. **Not applied.** Patch: `docs/proposals/undo-notice.patch`.
