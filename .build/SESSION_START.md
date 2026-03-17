# Session Handover — 2026-03-17

## What Was Done This Session

### 1. Merged all outstanding PRs

Closed out the `cool-kalam` worktree. Merged in order:
- **PR #33** — Phase 5.1: pre-season screen, formation picker, inherited squad of 16
- **PR #37** — Phase 5.2: transfer market, all 5 player attributes, free agent pool, sign/release with contract fee logic
- **PR #38** — combined Phase 5.1 + 5.2 squash onto main
- **PR #39** — Phase 5.3 prep: formation gap panel + NPC season-start transfers (already existed in branch)
- **PR #42** — Phase 5.3: match sim full rewrite

### 2. Match sim redesign (PR #42)

Proposal written to `.build/MATCH_SIM_PROPOSAL.md`, reviewed and edited by user on GitHub, then built from the agreed spec.

**Key changes to `packages/domain/src/simulation/match.ts`:**

| Area | Before | After |
|------|--------|-------|
| Strength calc | `overallRating` × old weights | `attributes.attack` / `attributes.defence` × position weights |
| Attack weights | FWD 3×, MID 1× (others 0) | FWD 3×, MID 2×, DEF 1×, GK 0× |
| Defence weights | GK/DEF 3×, MID 1× | FWD 1×, MID 2×, DEF 3×, GK 3.5× |
| Facilities | avg all 9 facilities → +0.15 | TRAINING_GROUND only → +0.50 |
| Teamwork | not wired | avg squad teamwork → +0.08 |
| Morale | not wired | avg squad morale → ±0.05 centred at 50 |
| Staff | +0.15 max | +0.12 max |
| Reputation | +0.10 max | +0.08 max |
| Fan Zone | blended into facilities avg | separate `fanZoneBonus` — home only |
| Training focus | stored, unused in sim | ATTACKING ×1.05 atk, DEFENSIVE ×1.05 def, FITNESS +0.03 modifier, SET_PIECES ×1.03 atk, YOUTH_INTEGRATION no match effect |

269/269 tests green. TypeScript clean.

### 3. Issues filed

| # | Title |
|---|-------|
| #41 | Review: team and player name analogues (24 clubs tabulated for manual review) |

Issues closed this session: #30 (attribute wiring done in match sim), #35 (NPC season-start transfers already built).

### 4. Phase 5.3 items — all already present in branch

- Formation recruitment gap panel: already in `TransferMarketSlideOver.tsx`
- Pro-Evo analogue team names: already in `league-two-teams.ts`
- NPC season-start transfers: already in `handleStartSeason()` in `commands/handlers.ts`

---

## Current State

### ✅ Working
- Main is clean — all Phase 5.1/5.2/5.3 merged
- 269 domain tests green
- Match sim: all inputs wired (attributes, facilities, staff, morale, training focus, fan zone)
- Pre-season → transfer market → enter season flow complete
- NPC clubs consume free agents before player browses

### 🟡 Stale worktrees (prune when convenient)
```bash
git -C /Users/oakleywalters/Projects/calculating-glory worktree remove --force \
  .claude/worktrees/cool-kalam \
  .claude/worktrees/phase5-transfers \
  .claude/worktrees/thirsty-archimedes
# zealous-sutherland path uses lowercase 'projects' — check before removing
```

### 🔴 Blocked
- Nothing

---

## Phase 5.4 — What's Next

Three candidates (in recommended order):

1. **#36 NPC poaching** — highest immediate gameplay tension; NPCs approach your players, 4 response options, teamwork cascade
2. **#29 Manager creation** — manager attributes; how well directives translate into match results
3. **#31 Scout facility** — YOUTH_ACADEMY/scouting level controls truePotential visibility (±15 noise → exact at max level)

---

## Build Commands

```bash
# Dev server
cd /Users/oakleywalters/Projects/calculating-glory/packages/frontend && npx vite

# ALWAYS rebuild domain dist in MAIN project after domain source changes
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# Tests
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm test

# TypeScript check (frontend)
cd /Users/oakleywalters/Projects/calculating-glory/packages/frontend && npx tsc --noEmit
```

## How to Start Next Session

```bash
# 1. Pull main (should already be current)
git -C /Users/oakleywalters/Projects/calculating-glory pull origin main

# 2. Rebuild domain dist
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# 3. Create new worktree for Phase 5.4
git -C /Users/oakleywalters/Projects/calculating-glory worktree add \
  .claude/worktrees/<name> -b feat/phase5-4 origin/main

# 4. TypeScript check before writing code
cd /Users/oakleywalters/Projects/calculating-glory/.claude/worktrees/<name>/packages/frontend \
  && npx tsc --noEmit
```

## Key Files (Phase 5.4 context)

```
packages/domain/src/
  simulation/
    match.ts                — Full match sim (all inputs wired, well-commented)
  commands/
    handlers.ts             — handleStartSeason() NPC transfer logic; handleSimulateWeek()
  types/
    player.ts               — Player, PlayerAttributes, truePotential, morale
    club.ts                 — Club (preferredFormation, trainingFocus, squad, wageBudget)
    facility.ts             — FacilityType, FACILITY_CONFIG, TrainingFocus
  data/
    league-two-teams.ts     — 24 Pro-Evo analogue clubs (see #41 for name review)
    free-agent-generator.ts — 60 seeded free agents
    squad-generator.ts      — 16 inherited weak players

packages/frontend/src/components/
  transfer-market/
    TransferMarketSlideOver.tsx — FormationGapPanel + sign/release flows
  pre-season/
    PreSeasonScreen.tsx     — Entry flow
```

---

**Status**: Main clean. Phase 5.1/5.2/5.3 shipped. Match sim fully wired. Ready for Phase 5.4 — recommended first pick is #36 (NPC poaching).
