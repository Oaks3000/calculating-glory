---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-22"
---

# Calculating Glory - Next Steps

## Immediate (Next Session)

1. **Balance pass — play through two seasons** — machinery is solid; observe: are growth/decline rates perceptible? Are ~1–2 retirements per season landing? Does promotion to League One feel meaningfully harder with the new tier revenue multipliers?
2. **Frontend test suite** — zero component-level coverage; good hygiene before the game grows further. Start with core hooks (`useGameState`) and key components (`InboxCard`, `HubTile`).
3. **#28 Construction lag time + staged build visuals** — low priority but adds texture to facility upgrades.

## Short Term (Next 2–4 Weeks)

1. **NPC league table persistence between seasons** — NPCs don't carry stats between seasons; second season NPC standings always start fresh. Not a bug now, but will become jarring with multiple seasons.
2. **#30 publicPotential semantics** — now that `truePotential` is a career-arc cursor, `publicPotential` should be a noisy read of that. Low-priority Scout Network update.
3. **Multiple leagues** — League One NPC team data, division-aware match sim, promotion/relegation opponent pool swap. Enabled by Division tracking already in place.

## Questions / Unknowns

- **Second season balance** — growth/retirement numbers are untested in play; may need tuning after the balance pass.
- **Morale event surfacing** — morale events fire correctly; question remains whether the news ticker should log milestones ("Squad spirits high after 3-match winning run") as passive flavour.
- **NPC league table staleness** — NPCs don't carry stats between seasons; will become jarring once multiple seasons are in play.
- **resetGame() UI** — `useGameState` now exposes `resetGame()` but there's no "New Game" button surfaced anywhere in the UI yet.
