---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Phase 5 — Full Season Flow"
progress: 99
lastUpdated: "2026-03-20"
lastTouched: "2026-03-20"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Phase 5 — Full Season Flow (100% complete — all 5.1–5.8 merged)
**Last Updated:** 2026-03-20

## What's Done

- Full TypeScript monorepo workspace (domain + frontend packages)
- Event sourcing architecture: all event types, reducers, command handlers
- 320 domain tests passing across 19 suites
- Deterministic match simulation (Poisson, seeded RNG, attack/defence split)
- Season fixtures: circle method round-robin, 24 teams, 46 weeks
- Weekly club events: 15 templates, branching chains, pending resolution
- Business acumen tracking, curriculum progression (5 levels, feature gating)
- Full Command Centre hub + Stadium View (isometric SVG renderer, 10 facility types)
- Navigation wiring — all core units route to correct slide-overs
- Weekly Training Focus (`SET_TRAINING_FOCUS` command, training drill challenges)
- **Phase 5.1–5.3** — pre-season flow, transfer window, match sim rewrite (PRs #33 #37 #38 #39 #42 ✅)
- **Phase 5.4 — NPC poaching** (PR #43 ✅) — mid-season bid events, 4 response options, teamwork cascade
- **Phase 5.5 — Manager hire & impact** (PR #44 ✅) — Manager type, 3-tier pool, tactical/motivation/experience wired
- **Phase 5.6 — Club-owned transfers** (PR #45 ✅) — `SELL_PLAYER_TO_NPC` command, fee calculation, news ticker
- **Phase 5.7 — Season end screen** (PR #46 ✅) — outcome banner, stats grid, final table, `BEGIN_NEXT_SEASON` → `PRE_SEASON_STARTED`
- **Scout Network facility** (PR #47 ✅) — `SCOUT_NETWORK` facility; `getScoutedPotential` with ±15 noise at level 0 → exact at level 5; ~POT/≈POT/POT UI in TransferMarket + SquadAuditTable; isometric renderer unit
- **Morale system** (PR #48 ✅) — result deltas (charisma-shaped), contract anxiety, threshold events (unrest/losing faith/unsettled player), contagion, manager change gravitational pull, unsettled debuff in match sim, poach weighting
- **Scout missions** (PR #49 ✅) — `START_SCOUT_MISSION`, `PLACE_SCOUT_BID`, `CANCEL_SCOUT_MISSION` commands; SEARCHING → TARGET_FOUND → BID_PENDING/REJECTED state machine; scout fee, math challenge gate, transfer window completion; ScoutNetworkSlideOver
- **Phase 5.8 — Owner forced out** (PR #50 ✅) — bottom-3 + broke trigger at week 30+; `OWNER_FORCED_OUT` / `ACCEPT_TAKEOVER` / `TAKEOVER_ACCEPTED` events; ForcedOutScreen two-step UI; Business Acumen carry-over; 374 domain tests

## What's In Progress

- Nothing — Phase 5 complete

## Blockers

- None

## Open Issues

| # | Title | Priority |
|---|-------|----------|
| #34 | Owner forced out + cascade re-entry mechanic | ✅ Done (PR #50) |
| #30 | Player attributes → charisma revenue + overallRating derivation | Medium |
| #27 | Hub tile action flags rerouting | Medium |
| #28 | Construction lag time + staged build visuals | Low |

## Notes

- Target device: Chromebook 1366×768 (keyboard + trackpad)
- Dev server: `npm run dev --workspace=@calculating-glory/frontend`
- Domain tests: `cd packages/domain && npm test`
- Domain dist is a symlink to main project — always rebuild from `/packages/domain && npm run build`
- Active worktrees: none — all pruned after #49 and #50 merged
