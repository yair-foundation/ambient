# ambientui in this project

The ambient layer was installed into ClientOps by an AI agent following ambientui's setup guide. This file is the record of what it decided and why. It was committed with the install, so `npx -y @ambient-ui/cli uninstall` removes it along with everything else.

**Status: installed, with judgement calls.** Read the sections below before relying on it.

## What was installed

- **Path:** the full design architecture (the Foundation and the ambient layer)
- **Doors:** `start`, `foundation`, `ambient-layer`, `foundation-ambient-bridge`, `governance`
- **Hotkey:** `mod+k`
- **Adapted:** strip-use-client — vite is not a React Server Components app, so the layer's "use client" directives only print a bundler warning per file

## Decisions made for you

Nothing was asked during the install. Each choice below is the best case the project survey supported. To choose differently, uninstall, then reinstall with the option set (the command is given for each).

- **path: full** — the full design architecture: the Foundation also governs tokens, spacing, radius and motion
  - Why: A new project: nothing to preserve, so the whole system goes in.
  - Other options: `layer` (the ambient layer only: the assistant above the product's screens, which stay exactly as they are)
  - To choose one: `npx -y @ambient-ui/cli plan --path <option>` before reinstalling
- **look: reference** — express a reference (a screenshot, a link, a few words)
  - Why: A new project: the look comes from whatever the person described in their request, else the Foundation's defaults.
  - Other options: `current` (keep the product's current look)
  - To choose one: `npx -y @ambient-ui/cli plan --look <option>` before reinstalling

## Where the agent corrected the survey

The survey is heuristic. The agent checked it against the code and changed these parts of the plan:

- `provider.productName` → `"ClientOps"` — The product is the fictional B2B CRM ClientOps

## Judgement calls

- verify's hotkey probe failed against the Vite dev server (first Ctrl+K after a cold load is dropped; later presses open in ~200ms) and passed 5/5 against the production build served by vite preview. Treated as a dev-server cold-start artefact; verified against the build.

## Done by hand

- Vendored src/components/ambient/responder.ts: AmbientApiError used constructor parameter properties, rejected by the Vite template's erasableSyntaxOnly; rewrote as explicit fields (same behavior)

## Not available here, and what was done instead

- No visual reference supplied; using the Foundation defaults per the brief (no taste question asked)
- host-screens check skipped: new project, so there were no pre-existing screens to baseline.

## What verify could not prove

- *skipped* host-screens: no .ambientui/baseline/styles.json (run `ambientui doctor --url <url>` before installing)

## Before you rely on it

This install left the happy path in the places listed above, to show you ambientui working in your product. **We recommend you try it, then uninstall it** (`npx -y @ambient-ui/cli uninstall`) **and reinstall with the right options chosen on purpose**, resolving the judgement calls above in your codebase's own terms rather than the agent's.

The assistant answers from stubs until a backend exists; see the stub flag in the plan (`.ambientui/plan.json`, `envFlag`).
