---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-23"
---

# Calculating Glory - Next Steps

## Immediate (Next Session)

1. **Division-aware match difficulty** — League One NPC AI team strengths are higher (55–78 vs L2's 35–65) but `generateAITeam()` still uses a fixed ±10 noise from baseStrength. Consider a division-aware strength floor or multiplier so promoted teams face genuinely harder match sims.
2. **resetGame() UI** — no "New Game" button surfaced anywhere yet.

## Short Term (Next 2–4 Weeks)

1. **resetGame() UI** — `useGameState` exposes `resetGame()` but there's no "New Game" button anywhere in the UI yet.
2. **NPC strength evolution** — use previousLeagueTable finish position to modestly adjust NPC AI strength each season (top 4 +2, bottom 4 −2, clamped 30–70). Complements the league persistence work.
3. **Morale event surfacing** — news ticker milestone messages ("Squad spirits high after 3-match run") as passive flavour.

## Questions / Unknowns

- **Second season balance** — growth/retirement numbers are untested in play; may need tuning after a real play-through.
- **resetGame() UI** — no "New Game" button surfaced anywhere yet.
