# Session Handover — 2026-03-22

## What Was Done This Session

### PR #53 — Second Season Loop (already merged, picked up from last session)
- Merged at session start; main pulled to `823567e`

### PR #54 — Facility Revenue Tier Scaling + localStorage Persistence ✅

**Facility revenue tier scaling:**
- Added `Division` type (`LEAGUE_TWO | LEAGUE_ONE | CHAMPIONSHIP | PREMIER_LEAGUE`) to `GameState`
- `SEASON_ENDED` now calls `stepDivision()` — promotion bumps up, relegation drops down, clamped at both ends
- `facilityRevenue(facilities, division)` extracted to `revenue.ts` with `TIER_REVENUE_MULTIPLIER` table (1×→2×→4×→10×)
- `handleWeekAdvanced` uses new function — facility income scales with division
- Max facility output: £4k/wk (L2) → £8k (L1) → £16k (Champ) → £40k (PL)
- 20 new tests; 441 total across 23 suites

**localStorage persistence:**
- `src/lib/persistence.ts` — `saveEvents` / `loadEvents` / `clearSave`
- `initialGame.ts` — `loadOrCreateGameState()` checks storage first, falls back to fresh game
- `useGameState` — saves after every successful dispatch; exposes `resetGame()`
- Key: `cg-events-v1` (versioned for future migration)
- Verified: formation selection survives full page reload

### PR #55 — Hub Tile Routing Fix (#27) ✅

**Problem:** Stadium tile fired "Action needed" badge whenever any affordable upgrade existed — essentially always. Chats tile had previously fired for all pending events (not just math-challenge ones).

**Fix (in `CommandCentre.tsx`):**
- Stadium tile `hasEvent` now uses `canUnlockNew` (level-0 facility affordable = first build) not `canUpgrade` (any level-up)
- Subtitle: "New facility available" / "Upgrade available" / "Facilities Lv{n}"
- Chats tile `hasEvent` was already correctly scoped to `requiresMath` events — left untouched
- `HubTiles.tsx` wrapper also updated (same logic) though it is not currently rendered

Verified in browser: Stadium shows "New facility available" + badge on game start (all facilities at L0, £500k budget). Chats and Transfers quiet.

---

## Current State

### ✅ Working

- Main at `5fb24a4` — all PRs merged, CI green
- 441 domain tests green across 23 suites
- Full season loop: league resets, consequences fire, two seasons playable
- localStorage saves/rehydrates correctly on page reload
- Hub tile badges are meaningful signals, not noise
- Facility revenue scales with division tier — prereq for multi-league work done
- `Division` field on `GameState` ready for multiple leagues

### 🟡 In Progress

- Balance pass not yet done — growth/retirement rates theoretical

### 🔴 Blocked

- Nothing

---

## Architecture Notes

### Division tracking
- `division: Division` field on `GameState`, defaults to `LEAGUE_TWO`
- `stepDivision()` in reducer — called on `SEASON_ENDED`, clamped at both ends
- `TIER_REVENUE_MULTIPLIER` in `revenue.ts` is the single source of truth for tier scaling

### localStorage persistence
- Only the event log is persisted — state is always re-derived via `buildState(events)`
- Save happens in `dispatch()` inside `useGameState` after every successful command
- `GAME_STARTED` event is included in the first save (when player picks formation)
- Falls back to fresh game if `cg-events-v1` is absent or corrupt

### Hub tile logic
- Stadium tile badge: `canUnlockNew = f.level === 0 && f.upgradeCost <= budget` — new facility affordable
- Chats tile badge: `unresolvedEvents.some(e => e.choices.some(c => c.requiresMath))` — math negotiation waiting
- Logic lives in **`CommandCentre.tsx`** (inline), NOT in `HubTiles.tsx` wrapper

---

## Open Issues

| # | Title | Priority |
|---|-------|----------|
| #30 | `publicPotential` ↔ `truePotential` Scout Network semantic update | Low |
| #28 | Construction lag time + staged build visuals | Low |

---

## Build Commands

```bash
# Dev server
npm run dev --workspace=@calculating-glory/frontend

# ALWAYS rebuild domain dist in MAIN project after domain source changes
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# Tests
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm test

# TypeScript check
cd /Users/oakleywalters/Projects/calculating-glory/.claude/worktrees/<name>/packages/frontend && npx tsc --noEmit
```

## Deployment

**Live URL**: https://oaks3000.github.io/calculating-glory/

Auto-deploys on every push to main via `.github/workflows/deploy.yml`.

---

## How to Start Next Session

```bash
# 1. Pull main
git -C /Users/oakleywalters/Projects/calculating-glory pull origin main

# 2. Rebuild domain dist
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# 3. Create worktree for next feature
git -C /Users/oakleywalters/Projects/calculating-glory worktree add \
  .claude/worktrees/<name> -b feat/<name> origin/main
```

## Key Files (next session context)

```
packages/domain/src/
  simulation/
    revenue.ts              — facilityRevenue(), TIER_REVENUE_MULTIPLIER, squadCharismaRevenue()
  types/
    game-state-updated.ts   — Division type + division field on GameState

packages/frontend/src/
  lib/
    persistence.ts          — saveEvents, loadEvents, clearSave
    initialGame.ts          — loadOrCreateGameState()
  hooks/
    useGameState.ts         — saves on dispatch, exposes resetGame()
  components/command-centre/
    CommandCentre.tsx       — hub tile hasEvent logic (canUnlockNew, canUpgrade)
```

---

**Status**: Main at `5fb24a4`. 441 domain tests. Three PRs shipped this session (#53 merged on pickup, #54 facility tier revenue + persistence, #55 hub tile routing). Balance pass is the next manual task.
