---
project: "Calculating Glory"
type: "build"
createdAt: "2026-03-03"
lastUpdated: "2026-03-03"
---

# Calculating Glory - Roadmap

An educational football club management game for Year 7 maths, built on event-sourced domain logic with deterministic simulation. Players manage a League Two club through a season, making decisions that require mathematical problem-solving.

## Current Phase: MVP Build

- 2.1 React + Tailwind CSS frontend scaffolded ✅
- 2.2 `useGameState()` hook — wraps domain `buildState(events)` ✅
- 2.3 Command Centre hub layout (12-column grid) ✅
- 2.4 League table component ✅
- 2.5 Data tiles (budget, board confidence, week, position) ✅
- 2.6 News ticker (partial headlines) ✅
- 2.7 Social Feed slide-over (chat bubble UI, WhatsApp-style) ✅
- 2.8 Math challenge card + hint system ✅
- 2.9 Week advance button (disabled until events resolved) ✅
- 2.10 Isometric Blueprint placeholder tiles (card-based) ✅
- 2.11 First playable: 3-week mid-season loop (week 20 onward) — in progress
- 2.12 End-to-end integration (full loop: start → events → math → advance → results)
- 2.13 UI polish pass (responsiveness, error states, loading)

## Completed Phase: Domain Logic

- 1.1 Event sourcing architecture ✅
- 1.2 Deterministic match simulation (Poisson, seeded RNG) ✅
- 1.3 Season fixtures (circle method round-robin, 24 teams, 46 weeks) ✅
- 1.4 Command handlers + validation ✅
- 1.5 Club events system (15 templates, branching chains) ✅
- 1.6 Business acumen tracking ✅
- 1.7 Curriculum progression system ✅
- 1.8 245 tests passing across 14 suites ✅

## Future Phases

### Phase 3: Full Season Flow
- Pre-season, transfer windows, season end
- Player database/market (pool of purchasable players)
- Tutorial/onboarding system
- Full isometric rendering (upgrade from card placeholders to pixel art)

### Phase 4: Educational Depth
- Full curriculum progression system wired to UI
- Adaptive difficulty based on business acumen scores
- All branching club event chains (15 templates, 4 branching follow-ups)
- Hint system with curriculum-appropriate scaffolding

### Phase 5: Polish & Multiplayer Prep
- AI team evolution (form/results affect strength over season)
- Morale system
- Match events beyond goals (injuries, red cards, suspensions)
- Multiplayer sync architecture (async, turn-based)

## Out of Scope (for now)

- Real-time multiplayer
- Mobile/touch optimisation (Chromebook keyboard+trackpad is primary)
- Custom team/player creation
- Multiple leagues
- Save/load to server (localStorage only for MVP)
