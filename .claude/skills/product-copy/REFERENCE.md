# product-copy — reference

Context the skill points at. **Placeholders below are unfilled** — treat an
unfilled entry as "not available", never as licence to invent the answer.

## Role and company context

| | |
|---|---|
| Product | ClientOps — a small fictional B2B CRM that helps account managers manage incoming leads, existing accounts and follow-up activities |
| Primary user | An account manager handling many customer records a day who must see what needs attention and act without losing context |
| Primary surfaces | The triage directions (`/triage/a`, `/triage/b`), the design system reference (`/ds`), the assistant (Cmd-K) |
| Voice | Calm, direct, specific. Plain language, active voice, no exclamation marks. Default to DESIGN.md §1 where this file is silent |
| Reading level | Business users who know what a lead and an account are; no design-system jargon in product UI |

## Connected tools

| Tool | Status |
|---|---|
| Brand voice or tone document | *(placeholder — none supplied)* |
| String catalogue / glossary | *(placeholder — none exists; the register in SKILL.md is the glossary)* |
| Localisation | *(placeholder — unknown; the product is English only for now)* |

## In-repo sources of truth

- `.claude/skills/ambientui-start/DESIGN.md` — principles and the ambient layer contract
- `src/ds/catalog.ts` — the vocabulary docs (AI-facing copy of record)
- `src/features/triage/rules.ts` — the product rules the copy must describe accurately (action labels, blockers, gaps)
- `src/lib/ambient/stubs/` — the assistant's sample answers

## Open questions

1. Is there a brand voice-and-tone document for ClientOps? Nothing supplied.
2. Does the assistant have a name of its own? Currently it is "the assistant" and the product name is ClientOps.
