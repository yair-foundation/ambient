# ClientOps — governed design system (rules from ambientui)

The source of truth for design decisions is [DESIGN.md](../skills/ambientui-start/DESIGN.md). Read it before
any UI work — it defines the tokens, the two vocabularies, the ambient layer
contract, and the governance flow. Then read [docs/DECISION-LOG.md](../../docs/DECISION-LOG.md)
in full before changing the system: DESIGN.md holds the rules, the log holds
the reasoning behind them (DESIGN.md §12 says why that matters). **You (the
AI) work inside that governance layer: you select from the system, you do not
invent outside it.** That is the product's thesis applied to its own
construction.

## Commands

- `npm run dev` — the app (`/`, `/triage`, `/ds`).
- `npm run gate` — typecheck, lint, tests and build. Run it before every commit.
- `npm test` — rules, the registry coverage check and the assistant stub audit.
- Review switches on a triage URL: `?state=loading|empty|error`, `?fail=save`.

## Hard rules (non-negotiable)

**The primary rule: a reference is a request for a CONFIGURATION.** A target
look ("make it feel like X", a screenshot) is answered by selecting
Foundation values — accent hue, gray family, radius step, spacing unit,
scaling, appearance — and saving. Never by styling components toward the
reference. If the config cannot reach the look, extend the system through
governance. (DESIGN.md §2, with the Linear precedent.)

1. **Tokens only — and the scales of record are Tailwind's.** Colors: the
   Tailwind palette, consumed through semantic roles (`--primary`,
   `--muted-foreground`, …) — never a hex or raw `--color-*` step in
   component code. Spacing: Tailwind utilities (`p-4`, `gap-2`) — never
   arbitrary values. Type: Tailwind's text scale. Radius via `--radius`
   steps. If a needed token doesn't exist, that's a governance event.
2. **Saving the theme must restyle every component — propagation is a rule.**
   Every dimension resolves from a foundation-driven variable: the spacing
   grid drives Tailwind's `--spacing` (so `p-4`/`h-9` re-densify), radius
   flows from `--radius`, type from rem × the scaling base, color from
   semantic tokens. Hardcoded px in components are propagation leaks —
   grandfathered only in the assistant's stance-era code, fix on touch, never
   add new ones. (DESIGN.md §2.)
3. **A stated pixel or colour is a request for a TOKEN, not a literal.** "16px
   padding" means `p-4`. No exact step → nearest legal step, and say which
   you picked. Full procedure: DESIGN.md §2.
4. **Sanctioned components only.** Product UI composes `src/components/ui` components;
   ambient UI composes the assistant's parts. Known gaps are documented in the
   `/ds` registry (`GAPS` in `src/ds/catalog.ts`: no Select, Switch, Dialog or
   Table — use the documented substitutes). Never re-implement a near-miss of an existing component. A
   genuinely missing primitive is added through the **shadcn CLI**, then
   documented in `src/ds/catalog.ts` before it is used.
5. **Foundation is the single source of theme truth.** Theme changes flow through
   `src/components/foundation-provider.tsx` and `src/lib/foundation/tokens.ts`
   (one injected style tag, Save-to-persist). Never set theme variables ad hoc. New `--ambient-*` tokens
   must default to values derived from the base theme.
6. **Icons via `<Icon name="…">`** (`src/components/ui/icon.tsx`) — semantic names,
   drawn by the Foundation's configured library (Lucide/Tabler/HugeIcons/
   Phosphor/Remix). No direct icon-library imports in components, no ad-hoc
   SVGs; the assistant's direct HugeIcons usages are grandfathered, fix on
   touch. New names must be mapped in every library.
7. **Motion is a Foundation dimension — components consume MOTION ROLES,
   never literal timings.** Four roles (`--motion-micro/control/surface/
   page`); the configured character + pace decide the feel product-wide
   (DESIGN.md §5). CSS: `transition-*` utilities default to the micro
   role; explicit sites use `duration-(--motion-{role})`. Framer:
   `useMotionTransition(role)` / `useMotionSpring()`. CSS first;
   `framer-motion` (the one sanctioned library) for interruptible/
   gestural/layout/presence motion. No other animation libraries, no
   one-off keyframes in component files, no raw durations or springs.
8. **The ambient layer contract (DESIGN.md §8) must not drift**: five modes
   (line · panel · dock · spotlight · history),
   drag-as-mode-switch, page context via `setPageChip` (and what the page
   knows via `setPageIntel`), and the response kit (v0, `response-kit.tsx`)
   fills the `send()` seam with composed answer objects — answers come from
   the host's Ambient API (`responder.ts` is the contract: zod-checked
   `ask`/`suggestions`/`recents`, passed to `<AssistantProvider api>`). The
   layer makes no requests and never knows whether it is talking to a
   server or stubs; that is the host's API layer's call, and a model
   replaces the host's stubs, never the objects. On a product that runs a
   chat stack (Vercel AI SDK, assistant-ui, CopilotKit) the layer is the
   surface and the stack stays the engine, connected through an adapter
   (`stack-*.ts`, upstream `docs/chat-stacks.md`, not installed here; ClientOps has no chat stack); the product's own tool components
   render inside the layer's frame, and approvals are asked in the
   transcript. **One character per surface**: the
   orb/OrbCharacter mark belongs in the row where the user speaks to the
   assistant (composer mark, quick-ask pill) and in the resting orb — never
   in headers, footers, navigation or product chrome. **An answer arrives in order**:
   thinking, then each evidence block, then the prose, then artifacts —
   enforced by the stage queue inside `useStagedReveal`, never by a block
   scheduling itself. **Nothing inside an ambient surface is opaque** — every
   mode wears the glass and the heat field, and a pane within one uses the
   layer's wash, never a product ground. The beam glow was removed — do not
   reintroduce glows.
9. **Any Inspect-rail change raises the save reminder.** The rail has one
   commit affordance and nothing in it changes silently. This is enforced in
   the primitives — `ControlRow` and `ChoiceControl` call the Foundation's
   `touch()` — never in individual playgrounds, so a new playground inherits
   the rule instead of remembering it. The `action` prop on `ControlRow` is
   the only exemption, and only for a row that fires a one-shot action and
   sets no value. Discard remounts rail state (`generation`), so throwing
   away edits works for playground props too.
10. **Every vocabulary component is documented** in
   `src/ds/catalog.ts` (summary, behavior, when to use, when not to) with a
   live demo in `src/ds/demos.tsx`, keyed by the same id. Undocumented
   components don't exist as far as the AI vocabulary is concerned, and
   `npm test` fails on a component under `src/components/ui` or
   `src/components/shared` with no entry.

## Pattern watchlist protocol (always on)

When a request produces UI that doesn't match existing patterns — a new component
shape, a new layout structure, a divergent interaction — STOP and ask the user:
*"This looks like a new pattern — should it become part of the design system?"*
On yes: implement in the proper vocabulary, document in the registry
(`src/ds/catalog.ts`) and add a row to the decision log
([docs/DECISION-LOG.md](../../docs/DECISION-LOG.md)). On no: rebuild with existing
patterns. Use the `ds-manager` skill for system impact and
`product-design-manager` for UX judgment. **Nothing is promoted to the shared
system without a person's explicit approval.**

## Skills

- **`ds-manager`** — system impact: token/component/layout compliance,
  promote-or-reject, blast radius of token changes.
- **`product-design-manager`** — UX judgment: right surface for the use case
  (page vs sheet vs spotlight vs panel), flow consistency.
- **`product-copy`** — UI copy, microcopy, errors, empty states, voice. Its
  `REFERENCE.md` records what context is and isn't available; unfilled
  placeholders mean "not available", not "invent it".

## Where things live

- Foundation (Data layer): `src/lib/foundation/tokens.ts` (values), `src/components/foundation-provider.tsx` (engine), `src/styles/foundation.css` (propagation bridge, do not hand-edit).
- Component layer: `src/components/ui` (product vocabulary, via the shadcn CLI), `src/components/ambient` (assistant), `src/ds/catalog.ts` + `src/ds/demos.tsx` (registry), rendered at `/ds`.
- Agent layer: this file, `.claude/skills/{ds-manager,product-design-manager,product-copy}`, `docs/DECISION-LOG.md`.
- Product: `src/data` (fictional data), `src/features/*` (screens), `src/lib/ambient` (assistant API and stubs).
- There is no Figma file and no Figma sync in this project.
