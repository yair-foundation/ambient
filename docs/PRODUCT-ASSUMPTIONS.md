# Product assumptions (lead triage)

These are product decisions made without customer research. They are written down so they can be challenged.
Each is enforced in `src/features/triage/rules.ts` and covered by `rules.test.ts`.

## Queue prioritization rule

**Overdue leads first, highest estimated value first among them; then leads still inside their first-response
target, soonest deadline first.** The rule is shown on screen under the filters.

- First-response target: 4 hours for demo requests, 24 hours for every other source. "Now" is fixed at
  2026-10-15 09:00 UTC in the prototype so the clock is stable for review.
- Why value first among overdue: a late reply costs most where the opportunity is largest. Ordering overdue leads by
  how late they are put a $15k webinar lead (46 h late) ahead of a $120k demo request (5 h late), which an account
  manager would not accept.
- Known weakness to validate: with value-first, a low-value lead can stay overdue indefinitely while bigger leads keep
  arriving (starvation). Not mitigated yet. Options if real usage shows it: cap how long any lead can wait, or weight
  lateness into the score.
- "Estimated annual value" is the sales estimate on the lead, not committed revenue.

## Other assumptions

- Qualifying needs team size, budget and timeline. A possible duplicate account or an unsupported region blocks it.
- Unsupported regions: anything outside the US, Canada, the UK and EU (so APAC and LATAM here).
- A budget under $10k, or a timeline of "Exploring", recommends nurture rather than qualify.
- Nurture defaults to a revisit date 30 days out and requires a date; disqualify requires a reason.
- The recommended action is advice computed from these rules; the person can always choose another allowed action.
- Every decision is reversible from the confirmation and from the lead itself until the page is reloaded (the
  prototype keeps decisions in memory; there is no backend).

## Mobile

- The filter strip is a 3-column grid on phones (two rows, no horizontal scroll) with 32 px targets, which meets
  WCAG 2.2 AA (24 px minimum) but not the 44 px ideal. Open question: raise to 44 px.
