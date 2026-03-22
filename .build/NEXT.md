---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-23"
---

# Calculating Glory - Next Steps

## Immediate (Next Session)

1. **Multiple leagues** — League One NPC team data, division-aware match sim, promotion/relegation opponent pool swap. Division tracking is already on GameState.

## Short Term (Next 2–4 Weeks)

1. **resetGame() UI** — `useGameState` exposes `resetGame()` but there's no "New Game" button anywhere in the UI yet.
2. **NPC strength evolution** — use previousLeagueTable finish position to modestly adjust NPC AI strength each season (top 4 +2, bottom 4 −2, clamped 30–70). Complements the league persistence work.
3. **Morale event surfacing** — news ticker milestone messages ("Squad spirits high after 3-match run") as passive flavour.

## Questions / Unknowns

- **Second season balance** — growth/retirement numbers are untested in play; may need tuning after a real play-through.
- **resetGame() UI** — no "New Game" button surfaced anywhere yet.
