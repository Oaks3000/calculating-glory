# Session Handover — 2026-03-21

## What Was Done This Session

### PR #53 — Second Season Loop: League Reset + Season-End Consequences ✅

**Problem being solved:**
The game was mechanically broken past season 1. `handlePreSeasonStarted` never zeroed league entry stats, so season 2 accumulated results on top of season 1 standings. `handleSeasonEnded` received `promoted`/`relegated`/`finalPosition` flags but ignored them entirely — no consequences for finishing position.

**What was built:**

- **`handlePreSeasonStarted`** — now zeroes all league entry stats (played, won, drawn, lost, GF, GA, GD, points, form) for every club at the start of each new season
- **`handleSeasonEnded`** — now applies reputation and board confidence deltas based on `finalPosition` and promotion/relegation outcome:

| Outcome | Rep | Board confidence |
|---|---|---|
| Promoted (top 3) | +10 | +20 |
| Playoff finish (4–7) | +3 | +10 |
| Mid-table (8–20) | 0 | 0 |
| Near-relegated (21–22) | −2 | −10 |
| Relegated (23–24) | −8 | −20 |

Both values clamped 0–100.

- **`SeasonEndScreen`** — contextual outcome text replaces hardcoded "in League Two" string (e.g. "Earning promotion to League One", "A narrow escape from relegation", "A season of consolidation")
- **12 new tests** — league reset × 5, reputation/confidence deltas × 7; 421 total across 22 suites

**Key design decision locked in:**
Promotion/relegation does **not** affect player stats. Ability follows `PlayerCurve` only. Promotion means competing in a harder league — not a stat boost. Players shouldn't necessarily improve just because they've been promoted.

---

## Current State

### ✅ Working

- PR #53 open at https://github.com/Oaks3000/calculating-glory/pull/53 — ready to merge
- 421 domain tests green across 22 suites
- Full season loop is now mechanically sound: league resets, consequences fire, two seasons are playable
- Players grow/decline each season via PlayerCurve; some retire with flavour text
- `computeOverallRating()` is a pure function — no stored field

### 🟡 In Progress

- PR #53 awaiting merge
- Balance not yet tested — growth/retirement rates are theoretical; need a two-season play-through to verify feel

### 🔴 Blocked

- Nothing

---

## Architecture Notes

### Second season loop design
- League reset happens in `PRE_SEASON_STARTED` reducer (not `SEASON_ENDED`) — clean separation: season-end handles consequences, pre-season handles fresh-slate setup
- Reputation/board confidence deltas are clamped in the reducer; no domain logic depends on them being unclamped
- `finalPosition` (1-indexed) is already on `SeasonEndedPayload` — no new events needed

### Player stats / promotion clarification
- `PlayerCurve` is the single source of truth for how a player's attack/defence changes over time
- The division a player competes in has zero effect on their curve tick
- Promotion difficulty comes from the NPC clubs being stronger (higher-attribute squads), not from player stat inflation

### Worktree: nostalgic-carson
- Branch: `claude/nostalgic-carson`
- Commit: `4eb01be`
- Worktree path: `.claude/worktrees/nostalgic-carson`

---

## Open Issues

| # | Title | Priority |
|---|-------|----------|
| #30 | `publicPotential` ↔ `truePotential` Scout Network semantic update (remaining) | Low |
| #27 | Hub tile action flags rerouting | Medium |
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
cd /Users/oakleywalters/Projects/calculating-glory/packages/frontend && npx tsc --noEmit
```

## Deployment

**Live URL**: https://oaks3000.github.io/calculating-glory/

Auto-deploys on every push to main via `.github/workflows/deploy.yml`.

---

## How to Start Next Session

```bash
# 1. Merge PR #53 via GitHub, then pull main
git -C /Users/oakleywalters/Projects/calculating-glory pull origin main

# 2. Prune merged worktree
git -C /Users/oakleywalters/Projects/calculating-glory worktree remove .claude/worktrees/nostalgic-carson

# 3. Rebuild domain dist
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# 4. Create worktree for next feature
git -C /Users/oakleywalters/Projects/calculating-glory worktree add \
  .claude/worktrees/<name> -b feat/<name> origin/main
```

## Key Files (next session context)

```
packages/domain/src/
  commands/
    handlers.ts             — handlePreSeasonStarted (league reset), handleSeasonEnded (rep/confidence deltas)
  reducers/
    game-reducer.ts         — PRE_SEASON_STARTED reducer zeroes all league entry stats
  simulation/
    progression.ts          — Curve math, applySeasonProgression, shouldRetire, getRetirementFlavour
    revenue.ts              — playerCharismaRevenue, squadCharismaRevenue
  types/
    player.ts               — Player, PlayerAttributes, PlayerCurve, CurveShape, computeOverallRating()

packages/frontend/src/components/
  season-end/
    SeasonEndScreen.tsx     — Contextual outcome text, season stats, league table
```

---

**Status**: PR #53 open (`4eb01be`). 421 domain tests. Second season loop mechanically complete. Merge and do a balance play-through next.
