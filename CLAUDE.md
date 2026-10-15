# ClientOps

A small fictional B2B CRM built to demonstrate a governed design system (Ambient UI). Mission of the first
feature: help an account manager triage incoming leads and decide what to do next.

## Before you build any UI

1. Read `.claude/ambientui/CLAUDE.md`: the hard rules (tokens only, sanctioned components only, propagation,
   the pattern watchlist protocol). They apply to every change here.
2. Read the component registry, `src/ds/catalog.ts` (also rendered at `/ds` → Components): what each component is
   for, its states, when to use it and when not to. Compose from it. Check `GAPS` for what does not exist.
3. Read `docs/DECISION-LOG.md`: design decisions a person has approved, and the shared patterns they added. Prefer an
   approved pattern over building a new one. Look in `src/components/shared/` for approved shared components.
4. The token and propagation rules live in `.claude/skills/ambientui-start/DESIGN.md`.

Review UI work by **invoking** the skills `ds-manager`, `product-design-manager` and `product-copy` (`.claude/skills/`) with the Skill tool, not by reading them. `npm run gate` runs `audit:ds`, the mechanical part of the `ds-manager` compliance audit (tokens, icons, motion, near-miss components, assistant page stubs). Record the outcome of any pattern review in `docs/DECISION-LOG.md`.

## Rules that need a person

- `docs/rejected/` and `docs/proposals/` are not approved patterns. Do not copy from them.
- Never promote a new pattern into the shared system (`src/components/ui`, `src/components/shared`, the Foundation,
  the registry) without a person's explicit approval. Build it locally and ask.
- Do not deploy, and do not push without approval.
- No Figma. All foundations, components and docs live in code.

## Commands

- `npm run dev`: the app. Routes: `/`, `/triage`, `/ds`.
- `npm run gate`: typecheck, lint, tests, build. Run it before committing.

## Page checklist (every new page)

- Announce the page to the assistant with `setPageChip` (see `PageContext` in `src/App.tsx`) and add 3-5 sample
  answers for it in `src/lib/ambient/stubs/`.
- Design every state: loading, empty, error with Retry, success. Check at phone width.
- Accessible by default: labelled controls, visible focus, keyboard operable, status changes announced.
