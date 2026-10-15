# Design System bug fixes (not new patterns): proposal, NOT applied

Shared components that fail WCAG 2 AA contrast. Measured with axe-core on the live `/ds` Components page.

| Component | Variant | Light | Dark | Needed |
|---|---|---|---|---|
| Badge | `destructive` | 3.85:1 | 4.36:1 | 4.5:1 |
| Button | `destructive` | 3.85:1 | 4.36:1 | 4.5:1 |
| Alert | `destructive` (description text) | 4.49:1 | passes | 4.5:1 |

Root cause (one): the "destructive" recipe is red text on a red tint (`bg-destructive/10 text-destructive`), and the
Alert description is further faded (`/90`). `text-destructive` on the plain surface already measures 4.77:1.

Correction to earlier notes: the Badge figure was first reported as 4.49:1 in `HARNESS_RESULTS.md`; that was the
Alert's number applied to the Badge without measuring. The Badge and Button are worse (3.85 / 4.36). Also, my own
Disqualify confirm used `Button variant="destructive"` and was missed by the first audit because axe skips disabled
controls; it is fixed in product code.

## Proposed change (`ds-bug-fixes.patch`, 3 class strings, no new tokens, no API change)

- Button and Badge `destructive`: outline style with the destructive text role (`border-destructive/40
  text-destructive`, plain surface), keeping the variant names so no caller changes.
- Alert `destructive`: description at full `text-destructive`.

Verified in an isolated worktree: axe color-contrast on the whole Components page, light and dark: **0 violations**
(before: 5 nodes). Typecheck and all 29 tests pass. `git apply --check` succeeds on main. **Not applied.**
Cost: destructive controls lose their pink fill; they read as outlined red. A visual call for the Design System
manager and a person.

## Related notes (not fixed, for the Design System manager)

1. **Foundation role pair**: `--muted-foreground` on `--muted` measures 4.34:1 with the slate gray (#62748e on
   #f1f5f9) at small sizes. It caused two failures in product code (selected row, filter counts), both avoided
   locally. Fixing it is a Foundation role-map decision, not a class change.
2. **Tabs**: `TabsList` hard-codes `group-data-horizontal/tabs:h-8`, so tabs cannot wrap. Override with the same
   variant prefix (`group-data-horizontal/tabs:h-auto`). Proposed as a one-line note in the catalog entry.
3. **DropdownMenu** popup trips axe's best-practice "content not in a landmark" rule while open (not an A/AA failure).
4. **Touch targets**: Button `sm` and Tabs triggers are about 28 to 32 px at 95% scaling. Meets WCAG 2.2 AA (24 px);
   below the 44 px ideal.
