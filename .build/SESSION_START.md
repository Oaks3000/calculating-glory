# Session Handover — 2026-03-20

## What Was Done This Session

### 1. Scout Missions — PR #49 ✅

Full targeted-scouting flow on top of the existing Scout Network facility:

- `START_SCOUT_MISSION` — position picker, attribute priority, budget ceiling, upfront £1,000 scout fee deducted
- `PLACE_SCOUT_BID` — math challenge gate; on pass → `BID_PENDING`; on fail → `BID_REJECTED` (can retry)
- `CANCEL_SCOUT_MISSION` — refunds nothing, clears state
- State machine: `SEARCHING` → `SCOUT_TARGET_FOUND` (next week tick) → `TARGET_FOUND` → `BID_PENDING` / `BID_REJECTED`
- Transfer completes automatically when window opens (`isTransferWindowOpen`) while `BID_PENDING`
- `ScoutNetworkSlideOver.tsx` — full 4-state UI (no mission, searching, target found with inline math challenge, bid submitted)
- `scout-target-generator.ts` — seeded NPC target generation (position, attributes, asking price from NPC club)
- 329 scout-mission tests + `reducer-match.test.ts` updated

### 2. Phase 5.8 — Owner Forced Out — PR #50 ✅

Full forced-out mechanic closing issue #34:

- **Trigger**: position > 21 (bottom 3 of 24) + `transferBudget < £10,000` + `week >= 30`
- `OWNER_FORCED_OUT` event fires from `handleSimulateWeek`, short-circuits before `SEASON_ENDED`
- Takeover target = lowest-ranked NPC club in current league table
- `ACCEPT_TAKEOVER` command → `TAKEOVER_ACCEPTED` event
- On takeover: new club id/name, £50k budget, £20k/wk wages, fresh (weak) squad, reset facilities, boardConfidence = 20
- Business Acumen carries over unchanged — "the one thing they can't take away"
- `ForcedOutScreen.tsx` — two-step UI: ousted screen (position/week/budget stats) → offer screen (win condition, carry-over callout, Accept CTA)
- `App.tsx` — `FORCED_OUT` phase gate before main game UI
- 29 new forced-out tests; 374 total domain tests green

### 3. Merge / rebase / prune

- Rebased `objective-chaum` onto updated main (resolved 4 conflicts + duplicate morale export)
- Merged PR #49 (squash)
- Rebased `gifted-dijkstra` onto post-#49 main (resolved 6 conflicts)
- Merged PR #50 (squash)
- Both worktrees pruned
- Domain dist rebuilt from final main

---

## Current State

### ✅ Working
- Main is clean at `afdee60` — all Phase 5 features shipped (5.1–5.8 + Scout Missions)
- 374 domain tests green across 21 suites
- No open worktrees
- Full season flow: PRE_SEASON → EARLY/MID/LATE_SEASON → SEASON_END → PRE_SEASON (next season) or FORCED_OUT → takeover
- Scout Network facility + scout mission bid flow end-to-end
- Business Acumen curriculum gating across all 5 levels

### 🟡 In Progress
- Nothing

### 🔴 Blocked
- Nothing

---

## Phase 5 — Complete Feature List

| PR | Feature |
|----|---------|
| #33 #37–#39 #42 | Pre-season, transfers, match sim rewrite (5.1–5.3) |
| #43 | NPC poaching — 4 response options, teamwork cascade (5.4) |
| #44 | Manager hire & impact — 3-tier pool, tactical/motivation/experience (5.5) |
| #45 | Club-owned transfers — SELL_PLAYER_TO_NPC, fee calc, news ticker (5.6) |
| #46 | Season end screen — outcome banner, stats grid, BEGIN_NEXT_SEASON (5.7) |
| #47 | Scout Network facility — truePotential visibility by level |
| #48 | Morale system — result deltas, contract anxiety, threshold events |
| #49 | Scout missions — targeted scouting, math challenge bid gate |
| #50 | Owner forced out — FORCED_OUT phase, takeover flow (5.8) |

---

## What's Next

**Recommended: #30 Player attribute wiring**
- Wire `charisma` into weekly revenue formula
- Confirm `attack`/`defence`/`teamwork` weighting in match sim is balanced post-morale
- Decide `overallRating` derivation: computed from attributes (weighted by position) vs stored independently

Other candidates:
- **Frontend test suite** — zero component-level coverage currently
- **#27 Hub tile action flags** — stale routing on Command Centre tiles
- **Second season loop** — promotion to League One / relegation tuning

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
    match.ts                — Full match sim (attack/defence/teamwork/morale/facilities wired)
    morale.ts               — Morale deltas, contract anxiety, threshold events, contagion
  commands/
    handlers.ts             — All command handlers incl. scout missions + forced-out
  types/
    player.ts               — Player, PlayerAttributes (attack/defence/teamwork/charisma/potential)
    game-state-updated.ts   — GameState, ScoutMission, ForcedOutState, SeasonPhase
  data/
    scout-target-generator.ts — Seeded NPC scouting targets
    league-two-teams.ts     — 24 Pro-Evo analogue clubs

packages/frontend/src/components/
  forced-out/
    ForcedOutScreen.tsx     — Two-step ousted → takeover UI
  stadium-view/
    ScoutNetworkSlideOver.tsx — 4-state scout mission UI
  pre-season/
    PreSeasonScreen.tsx     — Entry flow
```

---

**Status**: Main clean. Phase 5 fully shipped (PRs #33–#50). 374 domain tests. No open worktrees. Next: #30 player attribute wiring.
