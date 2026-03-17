---
project: "Calculating Glory"
type: "build"
createdAt: "2026-03-03"
lastUpdated: "2026-03-17"
---

# Calculating Glory - Roadmap

An educational football club management game for Year 7 maths, built on event-sourced domain logic with deterministic simulation. Players manage a League Two club through a season, making decisions that require mathematical problem-solving.

## Completed Phases

### Phase 2: Frontend Foundation ✅
- React + Tailwind frontend, `useGameState()` hook, Command Centre hub, league table, data tiles, news ticker, Social Feed slide-over, math challenge card, week advance button, first playable 3-week loop

### Phase 3: UI Polish & Feature Completion ✅
- InboxCard overhaul, InboxHistory slide-over, seeded news generator, reputation flash animation, Backroom Team slide-over, star player name injection, Learning Progress slide-over, curriculum progression UI

### Phase 4: Stadium View ✅
- 9 facility types, FACILITY_CONFIG, weekly revenue, isometric SVG renderer (20×14 grid, 9 core units, level-scaled blocks), navigation wiring (all core units → slide-overs), Weekly Training Focus command + UI

### Phase 5.1: Pre-season Flow ✅ (PRs #33, #38)
- Pre-season screen: narrative → formation picker → inherited squad → enter season
- `SET_PREFERRED_FORMATION` command, `FORMATION_CONFIG` with slots + recruitmentPriority + `formationCoverage()`
- 16 auto-generated inherited players (Pro-Evo names, weak, varied contracts)
- `club.squadCapacity = 24`

### Phase 5.2: Transfer Window ✅ (PR #37)
- All 5 player attributes: attack, defence, teamwork, charisma, publicPotential (visible); truePotential (hidden)
- Free agent pool: 60 seeded players with position-tier attribute variance
- TransferMarketSlideOver: 2 tabs, position filter, sort, sign + release flows with fee logic
- Formation recruitment gap panel in transfer market

### Phase 5.3: Match Sim Rewrite + NPC Transfers ✅ (PRs #39, #42)
- Player attributes (not overallRating) weighted by position for attack/defence strengths
- Team modifier fully wired: teamwork, TRAINING_GROUND, staff, reputation, form, morale
- FAN_ZONE as home-only atmosphere bonus
- Training focus applied post-strength-calc
- NPC season-start transfers: tier-based, strongest clubs pick first
- Pro-Evo analogue team names (24 clubs)

---

## Current Phase: Phase 5.4 — Squad Dynamics

### Phase 5.4 candidates (pick one to start)
- 5.4a NPC poaching (#36) — NPCs approach your players; response options; teamwork/morale cascade
- 5.4b Manager creation (#29) — manager attributes translate owner directives into results
- 5.4c Scout facility (#31) — truePotential visibility unlocked by facility level

### Phase 5.5 (follows 5.4)
- Club-owned player transfers (#32) — sell to NPCs for transfer fee
- Owner forced out + cascade re-entry (#34)
- Revenue system — charisma → matchday/commercial revenue
- Season end screen — promotion/relegation handling

---

## Future Phases

### Phase 6: Educational Depth
- Adaptive difficulty fully wired to curriculum progression UI
- All 15 club event chains with full branching follow-ups
- Practice mode (Marcus Webb free drills)
- Teacher dashboard — class view of student progress
- Hint system with curriculum-appropriate scaffolding
- Player development / aging using truePotential

### Phase 7: Polish & Multiplayer Prep
- AI team evolution (form/results affect NPC strength over season)
- Match events beyond goals (injuries, red cards, suspensions)
- Decision density overhaul (squad selection, transfers, contracts, sponsorship)
- Multiplayer sync architecture (async, turn-based)
- Visual design spec applied to isometric renderer (3-tone shading, SVG patterns)

## Out of Scope (for now)

- Real-time multiplayer
- Mobile/touch optimisation (Chromebook keyboard+trackpad is primary)
- Custom team/player creation
- Multiple leagues
- Save/load to server (localStorage only for MVP)
