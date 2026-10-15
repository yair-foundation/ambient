# Harness results: ClientOps on Ambient UI

One practical demonstration with one reuse run. It is evidence, not statistical proof, and it does not show that the
design is better.

## Verdict

**Success on the central question, with narrow limits.** A fresh agent, given only the product brief and the normal
repository, discovered the approved shared pattern through the repository's own documents, used the shared
implementation instead of building its own, respected its documented contract, and shipped a feature that behaved
correctly in a real browser. All six criteria are met on the evidence below. The limits (one run, optional fit, shared
filesystem, same model family) are in "What this does not show".

| # | Criterion | Status | Evidence |
|---|---|---|---|
| S1 | Foundation | **PASS** | Official `@ambient-ui/cli` install (`doctor`, `begin`, `install`, `verify`: 12 checks pass on the production build). Data layer `src/lib/foundation/tokens.ts` with a propagation check; component layer `src/ds/catalog.ts` rendered at `/ds` with a registry-coverage test; agent layer `CLAUDE.md` plus three adapted skills |
| S2 | Consistency | **PASS** | Lead triage and renewals share one Foundation and the same components. `npm run audit:ds` (colour literals, arbitrary values, inline styles, icon imports, motion literals, hand-rolled dialogs, assistant stubs) passes on both; no competing design system or CSS |
| S3 | Governance | **PASS** | A person explicitly approved Direction A (B rejected), the destructive contrast fix, and `UndoNotice` revision 2, each logged in `docs/DECISION-LOG.md`. A review (three skills invoked) preceded the promotion and changed it |
| S4 | Promotion | **PASS** | `src/components/shared/undo-notice.tsx`: implemented, documented (registry entry, `/ds` demo that really changes and restores a record, decision-log row), tested (17 tests), and discoverable (S5 trail). Lead triage uses it |
| S5 | Reuse | **PASS** (outcome A, pre-registered) | See "Phase 5". One run |
| S6 | Integrity | **PASS** (automated and browser evidence only) | Both features pass: 59 tests, `audit:ds`, axe, browser flows. No known material failure remains; listed non-material issues below. No human or screen-reader testing |

## Approved changes
1. **Direction A (queue workspace)** is the product at `/triage`. Direction B is archived inert in `docs/rejected/`.
2. **Destructive contrast fix** (Badge, Button, Alert): outlined with `text-destructive` on the plain surface. Measured
   with axe: Badge and Button were 3.85:1 light and 4.36:1 dark, Alert description 4.49:1 light. After: 4.6 to 4.77:1
   light and 6.1 to 6.4:1 dark at rest, hover and focus. One deviation from the prepared patch: its grey hover fill
   measured 4.35:1, so hover is a border emphasis. No Foundation token changed.
3. **`UndoNotice` revision 2**: `onUndo` returns `boolean | Promise<boolean>` (only `true` is success; `false` is a failed
   reversal; a rejection is "could not confirm"); failure wording admits uncertainty; Undo is final after success;
   state resets per action (`message` or `actionId`). The governance review found the cross-action stale-state defect
   in revision 1 before it shipped.

## Verification
- Gate (typecheck, lint, `audit:ds`, tests, build): green, 59 tests.
- axe: 0 violations over 24 route/state combinations (triage and `/ds`), all three `/ds` tabs, and 28 renewals states
  (both viewports, both themes, loading, empty, error, open account, validation errors, after save).
- Contrast of destructive variants at rest, hover, focus: measured above. Disabled keeps 50% opacity.
- Renewals, in a browser: 23 of 23 checks (`docs/evidence/phase5/verification/behavior-results.txt`).

## Phase 5: independent reuse
Setup: brief SHA-256 verified against the Phase 1 commit twice; evaluation rubric and my fit judgement committed
before the run (`docs/governance/phase5-protocol.md`); history-free workspace without the experiment documents; the
prompt held the verbatim brief and a neutral instruction (no pattern, no experiment). Agent: one fresh subagent, 19
tool calls, about 5.6 minutes.

| Question | Finding | How I know |
|---|---|---|
| Discovered the pattern through normal context? | **Yes** | Transcript: read `CLAUDE.md`, then the decision log and `ls src/components/shared` (call 2), the registry (call 3), the triage code (call 4). It never opened `undo-notice.tsx`; it worked from the registry entry and the triage usage |
| Governance skills actually invoked? | **Yes, all three** | Three `Skill` tool calls (calls 7 to 9), after reading and before writing code (`agent-tool-call-audit.txt`). Applying them is evidenced by a watchlist entry (second master-detail surface, built locally, not promoted), documented assumptions, and `audit:ds` passing. Causation is not provable |
| Used the shared implementation? | **Yes** | `renewals.tsx` imports `UndoNotice` from `@/components/shared/undo-notice`; no hand-built undo, notice or toast anywhere in the feature; no shared file changed |
| Respected the contract? | **Yes** | `onUndo` returns a boolean that is `true` only after the store really restores the prior plan (or removes it); the owner removes the notice and reselects the account; `actionId` passed; `detail` shows live portfolio numbers. Browser: Undo restored the plan and the summary ($479k back to $237k, plans 2 back to 1); revision undo restored the earlier outcome |
| Behaved correctly against the brief? | **Yes** | 14 accounts; ARR $2,115,000 and $421,000 at risk match the data; priority-one escalation blocks "renew as is" until acknowledged; at-risk and churn require next step and date; date must fall between today and the renewal; failed save keeps the form; loading, empty, error with Retry; sheet on phones; summary correct after record, revise, undo. Keyboard: reach, choose, save and Undo with keys only |
| Duplicate or conflicting implementations? | **None of the approved pattern.** One class of local duplication | It rebuilt the list-beside-record layout, a native-button row, and a store with latency, failure switches and undo log, mirroring triage. These are unpromoted patterns, which it flagged for a person's decision. This is now two surfaces for master-detail |

Pre-registered outcome: **A (reused correctly)**. The fit was pre-registered as optional (the brief asks that a plan
"can be revised", not for undo), so non-reuse would have been inconclusive, not a failure. It chose reuse.

## What this does not show
- **One run, one task, optional fit.** It shows reuse is *possible and correct* when an agent chooses it. It does not
  show how often, or that reuse would happen when the fit is weaker.
- **Not independent of the builder in the strong sense.** The same model family built the system and ran the test, I wrote
  the brief, and a subagent shares the machine's filesystem. Mitigation: no outside reads (the one outside path was
  the harness's overflow file of its own command output).
- **Discovery had several channels.** `CLAUDE.md` points to `src/components/shared/`, the decision log names the
  component, and `/triage` is a live example. I cannot say which one caused reuse, or whether it would reuse without
  the example.
- **Skill invocation followed an explicit repo instruction.** `CLAUDE.md` now says to invoke the skills. That shows
  the instruction works, not that agents invoke skills unprompted.
- **Possible priming:** a decision-log row mentions the skills being "invoked, not just read", and the brief says
  "change their mind". Both stayed in the test.
- **Not tested:** a human or screen-reader pass on either feature; keyboard entry into the segmented date field (my
  automation could not set it, though the app's validation behaved correctly); the Undo failure path in the renewals
  browser flow (the stores never return false; covered by the component's unit tests); whether the pattern
  improves design quality or speed.

## Unresolved issues (none material to S1 to S6)
- Design system: `--muted-foreground` on `--muted` is 4.34:1 with slate (avoided in product code); `TabsList` cannot
  wrap without an `h-auto` override; 28 to 32 px touch targets; DropdownMenu popup trips a best-practice landmark
  rule; a radio menu stays open after choosing. Details: `docs/KNOWN-DS-ISSUES.md`.
- Product: lead detail's "Undo decision" ignores a failed undo (the store never fails today).
- Upstream: the installed `ambientui-start` skill still mentions Figma.
- Governance: master-detail and the selectable row now have two surfaces; per the watchlist protocol a person should
  decide whether to extract them. Nothing was promoted or demoted automatically.

## Records
`docs/DECISION-LOG.md` (approvals), `docs/GOVERN-SKILL-AUDIT.md` (skills audit), `docs/governance/phase5-protocol.md`
(pre-registered rubric), `docs/evidence/phase5/` (agent output patch, tool-call audit, verification results and scripts,
screenshot).
