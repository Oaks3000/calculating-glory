---
project: "Calculating Glory"
type: "build"
createdAt: "2026-03-03"
lastUpdated: "2026-03-10"

---

# Calculating Glory - Roadmap

An educational football club management game for Year 7 maths, built on event-sourced domain logic with deterministic simulation. Players manage a League Two club through a season, making decisions that require mathematical problem-solving.

## Completed Phases

### Phase 2: Frontend Foundation ✅
- 2.1 React + Tailwind CSS frontend scaffolded ✅ (#1)
- 2.2 `useGameState()` hook — wraps domain `buildState(events)` ✅ (#2)
- 2.3 Command Centre hub layout (12-column grid) ✅ (#3)
- 2.4 League table component ✅ (#4)
- 2.5 Data tiles (budget, board confidence, week, position) ✅ (#5)
- 2.6 News ticker (partial headlines) ✅ (#6)
- 2.7 Social Feed slide-over (chat bubble UI, WhatsApp-style) ✅ (#7)
- 2.8 Math challenge card + hint system ✅ (#8)
- 2.9 Week advance button (disabled until events resolved) ✅ (#9)
- 2.10 Isometric Blueprint placeholder tiles (card-based) ✅ (#10)
- 2.11 First playable: 3-week mid-season loop (week 20 onward) ✅ (#11)

### Phase 3: UI Polish & Feature Completion ✅
- 3.1–3.4 InboxCard overhaul, InboxHistory slide-over, Command Centre restructure ✅ (#14, #19)
- 3.5 Seeded deterministic news generator (transfer/injury/league copy) ✅ (#15)
- 3.6 Reputation tile flash animation (green/red keyframe glow) ✅ (#16)
- 3.7 Backroom Team slide-over (5 roles, hire CTA, wage summary) ✅ (#17)
- 3.8 Star player name injected into wage-demand club event ✅ (#18)
- 3.9 Learning Progress slide-over + Business Acumen tile click ✅ (#20)
- 3.10 Challenge difficulty capped by curriculum level ✅ (#20)
- 3.11 Curriculum progression UI ✅ (#22)

## Current Phase: Stadium View & Integration

### Phase 4: Stadium View (#21)
- 4.1 Stadium View planning — MECE core/sub-unit grid, architectural decisions ✅
- 4.2 Domain foundation — 9 facility types, FACILITY_CONFIG, weekly revenue, getDefaultFacilities() ✅
- 4.3 App shell — ViewToggle, StadiumView card grid, shared FacilityCard ✅
- 4.4 Isometric SVG renderer — 20×14 grid, 9 core units, level-scaled blocks, hover tooltip ✅ (PR #24)
- 4.5 Navigation wiring — core unit clicks open slide-overs, BuildPanel
- 4.6 Weekly Training Focus — SET_TRAINING_FOCUS command, training drill challenges
- 4.7 Geometry challenges — 4 new MathTopics, stadium-themed templates
- 4.8 End-to-end integration test pass (#12)
- 4.9 UI polish for Chromebook 1366x768 (#13)

## Future Phases

### Phase 5: Full Season Flow
- Pre-season flow — squad building before season starts
- Transfer window UI — browse market, make offers, negotiate
- Player database/market — pool of purchasable players
- Tutorial/onboarding system
- Season end screen — promotion/relegation

### Phase 6: Educational Depth
- Adaptive difficulty fully wired to curriculum progression UI
- All 15 club event chains with full branching follow-ups
- Practice mode (Marcus Webb free drills)
- Teacher dashboard — class view of student progress
- Hint system with curriculum-appropriate scaffolding

### Phase 7: Polish & Multiplayer Prep
- AI team evolution (form/results affect strength over season)
- Morale system
- Match events beyond goals (injuries, red cards, suspensions)
- Decision density overhaul (squad selection, transfers, contracts, sponsorship)
- Multiplayer sync architecture (async, turn-based)

## Out of Scope (for now)

- Real-time multiplayer
- Mobile/touch optimisation (Chromebook keyboard+trackpad is primary)
- Custom team/player creation
- Multiple leagues
- Save/load to server (localStorage only for MVP)
