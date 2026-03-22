---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-21"
---

# Calculating Glory - Next Steps

## Immediate (Next Session)

1. **Merge PR #53** — second season loop is complete; review and squash-merge to main.
2. **Balance pass — play through two seasons** — now the machinery is solid, observe: are growth/decline rates perceptible? Are ~1–2 retirements per season landing? Does promotion to League One feel meaningfully harder?
3. **Facility revenue scaling by league tier** — formula caps at ~£4k/wk; will break down once promoted clubs have higher-charisma squads. Prerequisite for multi-league work.

## Short Term (Next 2–4 Weeks)

1. **Frontend test suite** — zero component-level coverage; good hygiene before the game grows further.
2. **#27 Hub tile action flags** — stale routing on Command Centre tiles (quick fix).
3. **localStorage persistence** — serialise event log on every command, rehydrate on load; prevents progress loss on browser close, no infrastructure needed.

## Questions / Unknowns

- **Second season balance** — growth/retirement numbers are untested in play; may need tuning after the balance pass.
- **publicPotential semantics** — now that `truePotential` is a career-arc cursor, `publicPotential` should be a noisy read of that. Low-priority Scout Network update to close #30 fully.
- **Morale event surfacing** — morale events fire correctly; question remains whether the news ticker should log milestones ("Squad spirits high after 3-match winning run") as passive flavour.
- **NPC league tables** — NPCs don't carry stats between seasons; second season NPC standings always start fresh. Not a bug right now, but will become jarring once multiple seasons are in play.
