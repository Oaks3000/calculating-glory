# Session Handover — 2026-03-20

## What Was Done This Session

### 1. PR #51 — Computed overallRating + Charisma → Commercial Revenue ✅

Closed issue #30 (first half):

- Removed stored `overallRating` field from `Player` — replaced with pure `computeOverallRating(player)` function: `round((attack + defence + teamwork) / 3)`
- Charisma excluded from OVR intentionally — it's a commercial attribute, not on-pitch
- New `simulation/revenue.ts` — `playerCharismaRevenue(player)` uses a cubic curve: `t³ × 75,000p × (OVR × 0.1)` where `t = (charisma - 60) / 40`; zero below charisma 60. Self-calibrating: League Two players (low OVR + low charisma) produce near-zero; PL superstars (c=92/OVR=90) → ~£5,500/wk
- `squadCharismaRevenue()` aggregates and wires into `handleWeekAdvanced()` weekly revenue
- All domain + frontend read sites updated to use `computeOverallRating()` (7 frontend files, 4 domain files)
- BACKLOG updated: facility revenue scaling noted as prerequisite for multi-league work

### 2. PR #52 — Seasonal Player Attribute Progression + Retirement System ✅

- **`PlayerCurve` type** — 4 shapes (SHALLOW_BELL, STEEP_BELL, FRONT_WEIGHTED, BACK_WEIGHTED) + peak-height modifier (1–5, controlling total stat gain: +10 to +42pts)
- **Self-consistency guarantee** — curve back-calculates `baseAttack`/`baseDefence` so `computeStatsAtAge(curve, currentAge)` always returns the player's current stats at generation; no stat-jump on first tick
- **`progression.ts`** — pure module: `computeStatsAtAge`, `computeTruePotential`, `generatePlayerCurve`, `applySeasonProgression`, `shouldRetire`, `getRetirementFlavour`
- **Seasonal tick** — `BEGIN_NEXT_SEASON` command computes retiring players with seeded flavour text; `PRE_SEASON_STARTED` reducer ages all squad members, updates attack/defence from curve, removes retirees
- **Attack + defence only** — teamwork and charisma unchanged; 70:30 position weighting (FWD: 70% attack, GK/DEF: 70% defence, MID: 50/50)
- **Retirement age** — approximate Gaussian centred ~35 (SD ~3.5), clamped 28–42; always ≥ currentAge + 1
- **Retirement flavour** — 75% absurd (competitive ferret training, snail-racing syndicate jackpot), 25% mundane (injury)
- **`truePotential` redefined** — career-arc position cursor anchored to assumed ceiling of **age 42** (not actual retirementAge). Player retiring at 35 finishes at ~71; retiring at 28 finishes at ~42. Gap to 100 = unrealised career. Updated each season.
- **33 new progression tests** — curve shapes, position weighting, floor enforcement, self-consistency, retirement boundaries, flavour determinism; 409 total, all green

---

## Current State

### ✅ Working

- Main is clean at `91e16f3` — PRs #51 + #52 both squash-merged
- 409 domain tests green across 22 suites
- No open worktrees
- Full season flow: PRE_SEASON → EARLY/MID/LATE_SEASON → SEASON_END → PRE_SEASON (next season) or FORCED_OUT → takeover
- Players now grow and decline each season; some retire with flavour text
- `computeOverallRating()` is a pure function — no stored field
- Charisma contributes to weekly commercial revenue (cubic curve, OVR-amplified)

### 🟡 In Progress
- Nothing

### 🔴 Blocked
- Nothing

---

## Architecture Notes

### PlayerCurve design
- `startAge` = player's current age at generation (curve is relative, not absolute career history)
- Back-calculation: `baseAttack = currentAttack - curveValue(currentT) * gain * attackWeight`
- Self-consistency: `computeStatsAtAge(curve, startAge)` always equals the player's stats at generation
- Curve shapes: `sin(π/2 * x) ^ sharpness` for both ascent and descent phases; exponent determines steepness

### truePotential semantics (new)
- 0 = career start; 100 = played until age 42 (assumed ceiling)
- `POTENTIAL_CEILING_AGE = 42` exported constant
- `publicPotential` in `PlayerAttributes` now represents the noisy visible read of this; the gap between them is what scouting reveals

### Facility revenue ceiling
- Current: level × £500/wk commercial, capping at ~£4k/wk total
- Will not scale to Championship/PL — logged in BACKLOG.md as prerequisite for multi-league work
- Fix deferred; next season work may expose this

---

## Open Issues

| # | Title | Priority |
|---|-------|----------|
| #30 | Charisma revenue ✅ + overallRating computed ✅ — remaining: `publicPotential` ↔ `truePotential` Scout Network semantic update | Low |
| #27 | Hub tile action flags rerouting | Medium |
| #28 | Construction lag time + staged build visuals | Low |

---

## What's Next

**Recommended: Second season loop**
- Progression and retirement are now live — the second season is where they become visible and meaningful
- Promotion to League One / relegation; does the revenue formula hold? Do players at a higher level look noticeably better?
- Likely to surface balance issues (growth rate too slow/fast? retirements too frequent?)

Other candidates:
- **Frontend test suite** — zero component-level coverage
- **#27 Hub tile action flags** — stale routing on Command Centre tiles (quick fix)

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
- Builds domain (`tsc`), then frontend (`tsc && vite build --base=/calculating-glory/`)
- Repo is public (GitHub Pages free tier requirement)
- Future: migrate to Railway or similar when multiplayer/auth is needed

## How to Start Next Session

```bash
# 1. Pull main
git -C /Users/oakleywalters/Projects/calculating-glory pull origin main

# 2. Rebuild domain dist
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# 3. Create worktree for next feature
git -C /Users/oakleywalters/Projects/calculating-glory worktree add \
  .claude/worktrees/<name> -b feat/<name> origin/main

# 4. TypeScript check before writing code
cd /Users/oakleywalters/Projects/calculating-glory/.claude/worktrees/<name>/packages/frontend \
  && npx tsc --noEmit
```

## Key Files (next session context)

```
packages/domain/src/
  simulation/
    progression.ts          — Curve math, applySeasonProgression, shouldRetire, getRetirementFlavour
    revenue.ts              — playerCharismaRevenue, squadCharismaRevenue
    match.ts                — Full match sim (attack/defence/teamwork/morale/facilities wired)
    morale.ts               — Morale deltas, contract anxiety, threshold events, contagion
  commands/
    handlers.ts             — All command handlers (BEGIN_NEXT_SEASON now computes retirements)
  types/
    player.ts               — Player, PlayerAttributes, PlayerCurve, CurveShape, computeOverallRating()
    game-state-updated.ts   — GameState, ScoutMission, ForcedOutState, SeasonPhase
  data/
    scout-target-generator.ts — Seeded NPC scouting targets (now includes PlayerCurve)
    league-two-teams.ts       — 24 Pro-Evo analogue clubs

packages/frontend/src/components/
  forced-out/
    ForcedOutScreen.tsx     — Two-step ousted → takeover UI
  stadium-view/
    ScoutNetworkSlideOver.tsx — 4-state scout mission UI
  pre-season/
    PreSeasonScreen.tsx     — Entry flow
```

---

**Status**: Main clean at `91e16f3`. PRs #51 + #52 merged. 409 domain tests. No open worktrees. Next: second season loop.
