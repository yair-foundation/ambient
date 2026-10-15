# Known design-system issues (unresolved)

Open defects and limitations in the shared system. Product code works around them locally. None changes a Foundation
token here; each needs a Design System decision.

## 1. `--muted-foreground` on `--muted` is below AA with the slate gray
Secondary text on the quiet fill measures **4.34:1** (#62748e on #f1f5f9) at small sizes. It is the Foundation's own
"Secondary text" on "Quiet fill" role pair, so it affects every component that puts muted text on a muted fill (tab
strips, hovered rows, selected states). In lead triage it caused two failures (selected queue row, tab counts), both
avoided locally by not placing muted text on a muted fill. A real fix is a Foundation role-map decision (darker
secondary text step or a lighter quiet fill), not a class change.

## 2. `TabsList` cannot wrap
`TabsList` hard-codes `group-data-horizontal/tabs:h-8`, so a plain `h-auto` is ignored and wrapped tabs overflow the
bar. Override with the same variant prefix: `group-data-horizontal/tabs:h-auto` (see the triage filter strip). Tab
triggers are about 28 to 32 px tall at 95% scaling.

## 3. Touch targets
Button `sm` and Tabs triggers are 28 to 32 px at 95% scaling: above WCAG 2.2 AA's 24 px minimum, below the 44 px ideal.

## 4. DropdownMenu popup and landmarks
While open, the DropdownMenu popup trips axe's best-practice rule "content not contained by landmarks". Not a WCAG A/AA
failure.

## Resolved
- Destructive Badge, Button and Alert contrast (red text on a red tint: Badge and Button 3.85:1 light and 4.36:1 dark,
  Alert description 4.49:1 light). Fixed 2026-10-15 with an approved change; see `docs/DECISION-LOG.md`.
