---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-09"
---

# Calculating Glory - Backlog & Ideas

## Features / Functionality

- [ ] Stadium View — dual home screen with MECE core/sub-unit grid (#21 — needs planning session first)
- [ ] Player database/market — pool of purchasable players with real(ish) names and stats
- [ ] Transfer window UI — browse market, make offers, negotiate
- [ ] Full isometric rendering — pixel art stadium/facilities, 64x32px tiles
- [ ] Tutorial/onboarding flow — first-time player guidance
- [ ] Pre-season flow — squad building before the season starts
- [ ] Season end screen — promotion/relegation celebration/commiseration
- [ ] Multiplayer sync — async turn-based between friends
- [ ] Save/load to server (beyond localStorage)
- [x] InboxCard overhaul — result cards, dismissal, preview cap ✅
- [x] InboxHistory full slide-over ✅
- [x] Seeded news generator (transfer/injury/league) ✅
- [x] Backroom Team slide-over ✅
- [x] Reputation flash animation ✅
- [x] Learning Progress slide-over ✅

## Improvements / Optimisations

- [ ] Clean up `any` types in internal command handler signatures
- [ ] Add frontend test suite (component tests)
- [ ] AI team evolution — form/results affect strength over the season
- [ ] Morale system — explicit morale stat rather than folded into randomness
- [ ] Match events beyond goals — injuries, red cards, suspensions
- [ ] Practice mode — Marcus Webb free math drills for business acumen improvement
- [x] Business acumen tile clickable → Learning Progress slide-over ✅
- [x] Challenge difficulty capped by curriculum level ✅
- [x] Star player name injected into wage-demand event ✅

## Educational / Curriculum

- [ ] Adaptive difficulty fully wired to curriculum assessment (currently gated by level, not by live evidence)
- [ ] Hint system — curriculum-appropriate scaffolding for math challenges
- [ ] All branching club event chains — 15 templates, 4 branching follow-ups fully written
- [ ] Teacher dashboard — class view of student progress
- [x] Learning Progress slide-over (5-level pip track, readiness criteria, topic chips) ✅
- [x] Curriculum difficulty cap in challenge generator ✅

## Research / Exploration

- [ ] Chromebook performance profiling — ensure smooth at 1366x768
- [ ] Accessibility audit — keyboard nav, colour contrast for school use
- [ ] Offline capability — service worker for no-internet classrooms
- [ ] Stadium View MECE analysis — map every playable game aspect to a unit/sub-unit

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
- Stadium View needs MECE coverage: every playable aspect of the game should map to exactly one core unit, no gaps, no overlaps
- `CLUB_COMMERCIAL_CENTRE` concept: kit shop, sponsorship deals, TV rights — likely a Phase 5 sub-unit under a Commercial core unit
- Two-tier grid principle: Core units = navigation anchors (clickable); Sub-units = visual/stat effects only (pointer-events: none)
