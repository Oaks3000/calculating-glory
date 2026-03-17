---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Phase 5 — Full Season Flow"
progress: 78
lastUpdated: "2026-03-17"
lastTouched: "2026-03-17"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Phase 5 — Full Season Flow (78% — 5.1 + 5.2 + 5.3 all merged to main)
**Last Updated:** 2026-03-17

## What's Done

- Full TypeScript monorepo workspace (domain + frontend packages)
- Event sourcing architecture: all event types, reducers, command handlers
- 269 domain tests passing across 16 suites
- Deterministic match simulation (Poisson, seeded RNG, attack/defence split)
- Season fixtures: circle method round-robin, 24 teams, 46 weeks
- Weekly club events: 15 templates, branching chains, pending resolution
- Business acumen tracking, curriculum progression (5 levels, feature gating)
- Full Command Centre hub + Stadium View (isometric SVG renderer, 9 facility types)
- Navigation wiring — all 9 core units route to correct slide-overs
- Weekly Training Focus (`SET_TRAINING_FOCUS` command, training drill challenges)
- **Phase 5.1 — Pre-season flow** (PR #33 + #38 ✅)
  - Pre-season screen: narrative intro → formation picker → inherited squad → enter season
  - `SET_PREFERRED_FORMATION` command + reducer; `FORMATION_CONFIG` with `slots` + `recruitmentPriority`
  - `formationCoverage()` helper; `InheritedSquad.tsx` position-grouped grid with contract badges
  - 16 auto-generated inherited players (weak, ~45–55 OVR, Pro-Evo names, varied contracts)
- **Phase 5.2 — Transfer window** (PR #37 ✅)
  - All 5 player attributes wired: `attack`, `defence`, `teamwork`, `charisma`, `publicPotential` (visible); `truePotential` (hidden)
  - Free agent pool: 60 seeded players, attribute variance by position tier
  - `TransferMarketSlideOver.tsx`: 2 tabs (Free Agents / My Squad), position filter, sort by rating/attack/defence/wage
  - Sign + release flows with wage budget guard, 24-slot cap, contract fee logic
  - Formation recruitment gap panel — position-by-position target vs. actual, red/amber/green
- **Phase 5.3 — Match sim + NPC transfers** (PRs #39 + #42 ✅)
  - Match sim rewritten: player attributes (not overallRating) weighted by position
    - Attack: FWD 3× · MID 2× · DEF 1× · GK 0×
    - Defence: FWD 1× · MID 2× · DEF 3× · GK 3.5×
  - Team modifier fully wired: teamwork (+0.08), TRAINING_GROUND (+0.50), staff (+0.12), reputation (+0.08), form (±0.02 each), morale (±0.05)
  - FAN_ZONE extracted as home-only atmosphere bonus (not blended with other facilities)
  - Training focus applied post-strength-calc (ATTACKING ×1.05 atk, DEFENSIVE ×1.05 def, FITNESS +0.03 modifier, SET_PIECES ×1.03 atk)
  - NPC season-start transfers: strongest clubs pick first, tier-based wage limits, 30% skip chance for small clubs
  - Pro-Evo analogue team names in `league-two-teams.ts` (24 clubs, #41 filed for review)

## What's In Progress

- Nothing — main is clean, no open PRs

## Blockers

- None

## Open Issues (Phase 5.4+)

| # | Title | Priority |
|---|-------|----------|
| #29 | Manager creation — strengths, weaknesses, man-management | High |
| #31 | Scout facility — unlocks truePotential visibility | Medium |
| #32 | Club-owned players in transfer market (v2 transfers) | Medium |
| #34 | Owner forced out + cascade re-entry mechanic | Medium |
| #36 | NPC clubs poaching players from player's squad | Medium |
| #41 | Review team and player name analogues | Non-critical |

Closed this session: #30 (attribute wiring), #35 (NPC season-start transfers)

## Notes

- Target device: Chromebook 1366×768 (keyboard + trackpad)
- Dev server: `cd packages/frontend && npx vite`
- Domain tests: `cd packages/domain && npm test`
- Domain dist is a symlink to main project — always rebuild from `/packages/domain && npm run build`
- Stale worktrees still registered: `cool-kalam`, `phase5-transfers`, `thirsty-archimedes`, `zealous-sutherland` — safe to prune
