---
project: "Calculating Glory"
type: "build"
createdAt: "2026-03-03"
lastUpdated: "2026-03-18"
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

### Phase 5.4: NPC Poaching ✅ (PR #43)
- NPCs approach your players mid-season with bid events
- 4 response options: accept / reject / counter / ignore
- Teamwork cascade on unhappy ignored player → squad performance hit → forced sale

### Phase 5.5: Manager Hire & Impact ✅ (PR #44)
- Manager type: tactical, motivation, experience attributes
- 8-manager seeded pool in 3 tiers (elite/mid/budget)
- HIRE_MANAGER / SACK_MANAGER commands with budget guards + sack compensation
- Tactical amplifier on training focus; experience feeds team modifier; motivation = weekly morale nudge
- Pre-season 3-step flow: Formation → Appoint Manager → Your Squad

---

### Phase 5.6: Club-Owned Transfers ✅ (PR #45)
- `SELL_PLAYER_TO_NPC` command — sell squad players to NPC clubs for a fee
- Fee: `transferValue` if set, else `OVR² × 500` (min £100)
- News ticker: "{name} joins {club} for £X"

### Phase 5.7: Season End Screen ✅ (PR #46)
- `SeasonEndScreen` — outcome banner, season stats grid, club snapshot, final league table
- `BEGIN_NEXT_SEASON` command → `PRE_SEASON_STARTED` event; resets to pre-season, increments season

### Scout Network Facility ✅ (PR #47)
- `SCOUT_NETWORK` facility (10th type) — upgrades 0→5, £15k–£600k
- `getScoutedPotential(player, scoutLevel)` — truePotential ± seeded noise (±15 at level 0, exact at level 5)
- `~POT` / `≈POT` / `POT` confidence prefix in TransferMarketSlideOver and SquadAuditTable
- Isometric stadium unit at grid (1,7), deep blue, between Medical Centre and Youth Academy

### Morale System ✅ (PR #48)
- `simulation/morale.ts` — pure morale helpers (charismaFactor, applyResultMoraleDelta, applyContractAnxiety, applyContagion, applyManagerChangeMorale, isUnsettled)
- Layer 1: result delta per player (W+3/D+1/L−4, ×1.5 upset/shock, ±streak bonus, charisma-shaped)
- Layer 2: contract anxiety drain (−1/wk <8 weeks, −2/wk <4 weeks)
- Layer 3: threshold events — "Unsettled player" (<20), "Dressing Room Unrest" (<30 avg), "Losing Faith" (<40 × 3wks); 6-week cooldowns
- Layer 4: contagion — morale-0 players drain position group −1/wk
- Manager change: gravitational pull toward 55 on HIRE_MANAGER (charisma-shaped)
- Match sim: unsettled players contribute 85% attributes; poach targeting weights unsettled 3×
- SquadAuditTable: red ! badge on morale bar for unsettled players

## Current Phase: Phase 5.8 — Owner Forced Out + Cascade Re-entry (#34)

- Your club collapses → bottom NPC club also fails → you parachute in mid-season
- Trigger: bottom 3 AND budget < £10,000 AND week ≥ 30
- Always the last-place NPC club; inherit their current squad + budget exactly
- Business Acumen score persists across the transition; reputation malus applied
- Win condition: survive (finish outside relegation zone by week 46)

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
