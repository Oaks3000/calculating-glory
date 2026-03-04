---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-03"
---

# Calculating Glory - Backlog & Ideas

## Features / Functionality

- [ ] Player database/market — pool of purchasable players with real(ish) names and stats
- [ ] Transfer window UI — browse market, make offers, negotiate
- [ ] Full isometric rendering — pixel art stadium/facilities, 64x32px tiles
- [ ] Tutorial/onboarding flow — first-time player guidance
- [ ] Pre-season flow — squad building before the season starts
- [ ] Season end screen — promotion/relegation celebration/commiseration
- [ ] Multiplayer sync — async turn-based between friends
- [ ] Save/load to server (beyond localStorage)

## Improvements / Optimisations

- [ ] Clean up `any` types in internal command handler signatures
- [ ] Add frontend test suite (component tests)
- [ ] AI team evolution — form/results affect strength over the season
- [ ] Morale system — explicit morale stat rather than folded into randomness
- [ ] Match events beyond goals — injuries, red cards, suspensions
- [ ] Business acumen UI — star rating display, per-topic breakdown

## Educational / Curriculum

- [ ] Wire curriculum progression system to UI (level gates, difficulty scaling)
- [ ] Adaptive difficulty based on rolling business acumen scores
- [ ] Hint system — curriculum-appropriate scaffolding for math challenges
- [ ] All branching club event chains — 15 templates, 4 branching follow-ups fully written
- [ ] Teacher dashboard — class view of student progress

## Research / Exploration

- [ ] Chromebook performance profiling — ensure smooth at 1366x768
- [ ] Accessibility audit — keyboard nav, colour contrast for school use
- [ ] Offline capability — service worker for no-internet classrooms

## Future Phases

- [ ] Second season — promotion/relegation to different league
- [ ] Multiple leagues (League One, Championship)
- [ ] Custom club creation (name, colours, badge)

## Captured Thoughts

- The "NASA for Football" aesthetic is the north star for Command Centre — data-dense but legible
- Club events are the main creative differentiator — invest time in the writing
- Branching path dependency (past decisions unlock/block future events) creates replay value
- Star ratings for business acumen should feel rewarding, not punishing
- Integer pence arithmetic was the right call — no floating-point issues anywhere
