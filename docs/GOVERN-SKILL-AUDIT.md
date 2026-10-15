# Governance skills audit: do `ds-manager`, `product-design-manager` and `product-copy` work in practice?

Test subject: the pending `UndoNotice` proposal. Nothing was promoted and no shared component was changed.
Originals: re-fetched from `registry.ambientui.ai/r/governance.json` (the attached originals were not visible to me).

## 1. Adaptation to ClientOps

| Check | Result |
|---|---|
| Frontmatter `name` matches the originals (how the harness resolves a skill) | 3 of 3 |
| Rules preserved | Yes. Removed lines are repo plumbing (paths, Figma sync, the library's own three-pane frame, inspect rail). Promote / keep-local / reject criteria, the 7-point compliance audit, heuristics and microcopy rules are intact |
| Stale references found | **2 fixed**: `ds-manager` still said "outside foundation-context"; `product-design-manager` still said "canvas → spotlight → panel → dock" and "applied to ambientui". **1 fixed**: the rules file pointed at `docs/chat-stacks.md`, which is not installed |
| Paths and links in governance files that do not resolve | 4 reported. `docs/chat-stacks.md` fixed. `src/components/shared` is intentionally absent until a first shared component is approved (the pointer in `CLAUDE.md` is forward-looking; noted as a discoverability gap) |
| Left alone | `ambientui-start/SKILL.md` (upstream, installed) still says "Update/create the DS on Figma". It contradicts this project's no-Figma rule. Not one of the three skills; not edited |
| Terminology | `product-copy` register had no entry for Undo. Added (success, failure, unknown-outcome wording) |

## 2. Discoverable

- The harness lists all three as available skills (they appear in this session's skill list), resolved from `.claude/skills/`.
- `CLAUDE.md` and `.claude/ambientui/CLAUDE.md` name them; `/ds` → Governance lists them with paths.
- `CLAUDE.md` now says to **invoke** them with the Skill tool and records where outcomes go.

## 3. Actually invoked (not inferred from file existence)

- **Before this audit: not invoked once.** Earlier in this session I wrote reviews "in the voice of" the skills without
  calling them. File existence and a mention in `CLAUDE.md` proved nothing.
- **During this audit:** three Skill-tool calls (`ds-manager`, `product-design-manager`, `product-copy`), each returned
  "Launching skill" and injected the adapted instructions into the review.
- **What is still unproven:** that a *fresh* agent chooses to invoke them unprompted. No hook forces it. Phase 5 can show it.
- **What is now enforced without relying on judgement:** `npm run audit:ds` (in `npm run gate`) automates the mechanical
  part of the `ds-manager` audit. Verified it fails (exit 1) on seeded violations of each rule and passes the clean tree
  and the proposal.

## 4. Governance applied to the `UndoNotice` proposal

| Skill and rule applied | Evidence | Outcome |
|---|---|---|
| `ds-manager` audit 1, tokens | grep: no hex, arbitrary value, inline style, raw px | Pass |
| audit 2, components | imports only `Alert`, `Button`, `Icon`; no raw interactive elements | Pass |
| audit 4 and 5, icons and motion | semantic `Icon name="check"`; no timings or keyframes | Pass |
| audit 7, docs | registry entry has summary, 8 behavior lines, when / when-not, source; coverage test | Pass |
| `ds-manager` promote test: two or more plausible surfaces | Real uses today: the triage decision banner. A second undo affordance exists in the same feature (`lead-detail.tsx`, "Undo decision") but is a different shape and does not use the component. Rejected Direction B built the same notice twice. ClientOps' scope (leads, accounts, activities) implies more record-changing actions | **Met by plausibility, thin on evidence** |
| `ds-manager` promote test: existing tokens; one-line usage rule | Yes ("right after an action that changes a record the person might take back") | Met |
| `ds-manager` reject test: existing pattern solves it? | Alert covers the look; nothing in Alert, Ambient UI or shadcn covers the behavior contract | Not rejected |
| `product-design-manager`: every state designed, accurate feedback | **Found a defect.** A failed Undo on one action leaked its failure text into the notice for the *next* action and hid the new action's detail. `/triage` renders the banner exactly that way. No earlier test could see it (the store's undo never fails). Reproduced with a failing test | **Fixed in the proposal (v2)** |
| `product-design-manager`: accurate feedback | After a failed Undo the notice replaced the consequence ("11 left") with the error, though the change was still in place | **Fixed in v2** (both lines shown) |
| `product-copy`: errors name the fix, no false claims | The false and rejected outcomes use distinct honest wording; no "nothing changed" claim | Pass |
| `product-copy`: consistency | "Undo" is capitalised as a noun-phrase mid-sentence in one string ("Couldn't confirm Undo"), lower case in the other. Wording was suggested by the product owner, so kept; optional nit: "Couldn't confirm the undo." | Nit, not blocking |

Revision 2 (`docs/proposals/undo-notice.patch`): state resets per action (`message` or `actionId`), consequence stays
visible beside a failure, demo extracted to its own file, lint clean. Verified: 46 tests (29 existing + 17), typecheck,
lint, `audit:ds`, browser check (record genuinely changes and restores; false and rejected rehearsals; `/triage` banner
identical and axe-clean), `git apply --check`.

## 5. Recommendation: **Promote, conditional**

Promote revision 2. It passes every mechanical rule, meets the skill's own wording ("two or more *plausible* surfaces")
and has a one-line usage rule. Conditions:
1. Ship revision 2, not the first version (the stale-state defect is real).
2. State the evidence honestly: one real surface today. **Under a strict reading (two existing surfaces) the verdict is
   Keep Local on the watchlist.** The promotion rests on plausibility, which is exactly what the reuse test measures.
3. Review trigger: if no second real use appears by the next feature, demote it.

## 6. Findings not fixed (outside scope or not mine to change)

- `lead-detail.tsx` "Undo decision" ignores a failed undo and uses a different label from the notice. A product follow-up.
- Native `<button>` queue rows in `/triage` (flagged by `audit:ds`): a selectable list-row pattern, added to the watchlist.
- Earlier "`/ds` is clean" covered only the Foundation tab. The Components tab had a `heading-order` defect in my own
  page; fixed here. All three tabs are now axe-clean.
- Unresolved design-system issues: `docs/KNOWN-DS-ISSUES.md`.
