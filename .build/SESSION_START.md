# Session Progress - 2026-03-22

## Session Goals
- Ship #28 construction lag + staged build visuals
- Add frontend component test suite
- Fix NPC league table staleness between seasons

## Completed Work

### 1. Construction lag — #28 (PR #66) ✅
- **Domain** — `UPGRADE_FACILITY` now emits `FACILITY_UPGRADE_STARTED` instead of instant `FACILITY_UPGRADED`; new `FACILITY_CONSTRUCTION_COMPLETED` event fires when `constructionWeeksRemaining` hits 1 during `SIMULATE_WEEK`; `WEEK_ADVANCED` reducer decrements timers; validation blocks double-upgrades during construction
- **Duration formula** — `targetLevel + 1` weeks (L0→L1 = 2 wks, L4→L5 = 6 wks)
- **Backward compat** — old `FACILITY_UPGRADED` event + reducer untouched; existing saves work
- **Frontend** — FacilityCard shows "🏗 Under Construction — X weeks remaining"; CoreUnit renders amber dashed outline + 🏗 icon; tooltip shows weeks remaining; HubTiles/CommandCentre badge logic excludes in-construction facilities

### 2. Frontend test suite (PR #66) ✅
- **FacilityCard** — 13 tests: rendering, level labels, MAX badge, upgrade button (affordable / broke / max), all three construction lag states (building / complete / undefined)
- **InboxCard** — 10 tests: empty state, unresolved-only decisions, badge count, match section visibility, dismiss handler, +N more overflow, onViewAll
- PendingEventCard mocked to isolate InboxCard logic
- **Total**: 91 frontend tests across 6 suites (up from 68)

### 3. NPC league table persistence (PR #66) ✅
- `previousLeagueTable?: LeagueTable` added to `GameState`
- `handlePreSeasonStarted` snapshots `state.league` before zeroing — season 1 = undefined, season 2+ = full final standings with all stats + form
- `LeagueTable` component gains "This Season / Last Season" pill toggle — only visible from season 2 onwards

## Architecture Notes

- **Worktree domain build**: worktree `node_modules/@calculating-glory/domain` symlinks to the worktree's own `packages/domain` (not the main project) — always rebuild from the worktree: `cd packages/domain && npm run build`
- **Construction event ordering**: `FACILITY_CONSTRUCTION_COMPLETED` must fire before `WEEK_ADVANCED` in the same tick so the reducer can safely decrement remaining counters without double-processing the completing facility
- **Save compat pattern**: new events sit alongside old ones; old events remain handled by their original reducers — no migration needed

## Current Status

### ✅ Working
- All three features shipped and merged (PR #66)
- 441 domain tests + 91 frontend tests — all green
- TypeScript clean (pre-existing inboxUtils test fixture issue only — unrelated to session work)
- Dev server renders without errors

### 🟡 In Progress
- Nothing — main is clean

### 🔴 Blocked
- Nothing

## Build Commands / Key Files

```bash
# Dev server
npm run dev --workspace=@calculating-glory/frontend

# Domain tests (from worktree)
cd packages/domain && npm test

# Frontend tests
cd packages/frontend && npx vitest run

# Domain dist rebuild (must be from worktree, not main project)
cd packages/domain && npm run build
```

Key files touched this session:
- `packages/domain/src/types/facility.ts` — Facility type + constructionDuration()
- `packages/domain/src/events/types.ts` — FacilityUpgradeStartedEvent, FacilityConstructionCompletedEvent
- `packages/domain/src/commands/handlers.ts` — UPGRADE_FACILITY + SIMULATE_WEEK
- `packages/domain/src/reducers/index.ts` — new event cases + WEEK_ADVANCED decrement + previousLeagueTable snapshot
- `packages/domain/src/types/game-state-updated.ts` — previousLeagueTable on GameState
- `packages/frontend/src/components/shared/FacilityCard.tsx` — construction state UI
- `packages/frontend/src/components/isometric/CoreUnit.tsx` — construction visual
- `packages/frontend/src/components/isometric/IsometricBlueprint.tsx` — pass construction data through
- `packages/frontend/src/components/command-centre/LeagueTable.tsx` — Last Season tab
- `packages/frontend/src/components/shared/__tests__/FacilityCard.test.tsx` — 13 tests
- `packages/frontend/src/components/command-centre/__tests__/InboxCard.test.tsx` — 10 tests

## Next Session Goals

1. **#30 publicPotential semantics** — noisy read of truePotential via Scout Network level
2. **Multiple leagues** — League One NPC data, division-aware match sim, promotion/relegation pool swap

---

**Status**: Three issues shipped in one session — PR #66 merged cleanly. 441 domain + 91 frontend tests green. Next: #30 publicPotential or multiple leagues.
