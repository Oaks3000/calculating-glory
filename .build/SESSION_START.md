# Session Handover — 2026-03-16

## What Was Done This Session

### 1. PR #26 — Phase 4 completion (PRs 5, 6, 7) — merged ✅

**PR 5 — Weekly Training Focus**
- Domain: `TrainingFocus` union type + `TRAINING_FOCUS_CONFIG` (5 options: ATTACKING, DEFENSIVE, FITNESS, SET_PIECES, YOUTH_INTEGRATION) in `facility.ts`
- `trainingFocus: TrainingFocus | null` added to `Club` type
- `SET_TRAINING_FOCUS` command → `TRAINING_FOCUS_SET` event → reducer sets `club.trainingFocus`
- Frontend: `TrainingFocusSlideOver.tsx` — context bar (level + current focus), 5 selectable focus cards, dispatches command, highlights active selection

**PR 6 — Visual design spec**
- `stadium-layout.ts`: `CoreUnitColors` refactored — removed pre-baked `top/left/right` hex values; replaced with `base` (single hue) + optional `topPattern` + `swPattern`; 3-tone shading now done with rgba overlays at render time
- `CoreUnit.tsx`: SW face = base + `rgba(0,0,0,0.30)` overlay; SE face = base + `rgba(0,0,0,0.55)`; top face = base + optional pattern; 1px `rgba(255,255,255,0.20)` highlight on front top edge, 0.10 on back edge
- `IsometricBlueprint.tsx`: `<defs>` pattern library — `pat-grass` (stripe, iso-rotated), `pat-concrete` (dot stipple), `pat-ground` (organic ellipses for background)
- Background changed from flat dark blue → `url(#pat-ground)` organic grassland texture (darker/lighter green ellipses, 48×32 tile)

**PR 7 — Geometry Challenges**
- Domain: 4 new `MathTopic` values added to curriculum config across all levels (AREA_AND_PERIMETER, ANGLES, SCALE_AND_PROPORTION, PROPERTIES_OF_SHAPES); `geometry: number` added to `BusinessAcumen.recentPerformance`
- Frontend: `generateChallenge.ts` — `'geometry'` added to `ChallengeTopic`, `TopicPerformance`; 8 stadium-themed question templates (pitch area 105×68=7140m², perimeter, interior angles, penalty area compound, scale 1:500, isosceles apex, 40% of 24000, Pythagoras √(60²+45²)=75m)
- `GeometryDrillCard.tsx` (new) — interactive card: answer input, submit/retry, progressive hints (up to 3), correct/wrong feedback, explanation on completion, "Next drill →" cycling
- `TrainingFocusSlideOver.tsx` — Groundskeeper's Drill section added at bottom, shown when `groundLevel >= 1`; cycles via `drillIndex` state

### 2. Two issues filed for future work
- **#27** — UX: Reroute hub tile action flags (Stadium/Chats "Action needed" mismatch with Inbox)
- **#28** — feat: Construction lag time + staged build visuals for facility upgrades

### 3. Naming convention decision
- All teams and players use a **Pro Evolution Soccer c.2005** approach: slightly ridiculous but obviously recognisable fictional analogues (e.g. "Manchestar Cited", "Lional Messy"). Sidesteps licensing. Existing real League Two team names will need replacing when the player database is built. Saved to memory.

---

## Current State

### ✅ Done (Phase 4 complete)
- PR #23 Stadium View foundation
- PR #24 Isometric SVG renderer
- PR #25 Navigation wiring
- PR #26 Training Focus + Visual design spec + Geometry Challenges
- 250 domain tests green; TypeScript clean; merged to main

### 🟡 Next — Phase 5.1: Pre-season Squad Building
The game currently drops players into mid-season week 19 with no squad. Phase 5 starts with:

1. **Pre-season flow** — new game start screen before week 1
2. **Player database** — auto-generated starting squad with Pro-Evo fictional names; basic attributes (position, skill, wage, value)
3. **Transfer window** — browse/offer/negotiate (follows pre-season)

**Questions to confirm with user before building:**
- What does the player do in pre-season? (formation, starting XI, spend budget?)
- Auto-generate starting squad or build from scratch?
- Is week 19 start intentional (testing) or to be replaced?

### Open Issues
- **#27** — Hub tile action flag rerouting (low urgency)
- **#28** — Construction lag time + staged visuals (medium priority)
- **#21** — Stadium View as living navigation hub (partially addressed)

---

## Worktree Status

- Worktree `zealous-sutherland` on branch `claude/zealous-sutherland` — PR #26 merged, branch stale, safe to delete
- Main project at `6125da1` — up to date with origin/main

---

## Build Commands

```bash
# ALWAYS rebuild domain dist in MAIN project after domain source changes (not worktree)
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# If worktree domain diverges from main, build worktree first then copy dist:
cd .claude/worktrees/<name>/packages/domain && npm run build
cp -r .claude/worktrees/<name>/packages/domain/dist/* \
  /Users/oakleywalters/Projects/calculating-glory/packages/domain/dist/

# Type check frontend
cd .claude/worktrees/<name>/packages/frontend && npx tsc --noEmit

# Tests
cd .claude/worktrees/<name>/packages/domain && npm test
```

## How to Start Next Session

```bash
# 1. Sync main
git -C /Users/oakleywalters/Projects/calculating-glory pull origin main

# 2. Rebuild domain dist
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# 3. Create new worktree for Phase 5
git -C /Users/oakleywalters/Projects/calculating-glory worktree add \
  .claude/worktrees/<name> -b feat/phase5-preseason origin/main

# 4. TypeScript check before writing any code
cd /Users/oakleywalters/Projects/calculating-glory/.claude/worktrees/<name>/packages/frontend \
  && npx tsc --noEmit
```

## Key Files (for Phase 5 context)

```
packages/domain/src/types/
  facility.ts             — TrainingFocus, TRAINING_FOCUS_CONFIG, FacilityType, FACILITY_CONFIG
  club.ts                 — Club type (trainingFocus, facilities, transferBudget, wages)
  game-state-updated.ts   — GameState, BusinessAcumen (recentPerformance incl. geometry)

packages/frontend/src/components/
  isometric/
    IsometricBlueprint.tsx     — SVG canvas, <defs> patterns, pat-ground background
    CoreUnit.tsx               — 3-tone shading, highlight lines, level pips
    stadium-layout.ts          — 9 CoreUnitDef (grid coords, blockHeights, colours)
  stadium-view/
    TrainingFocusSlideOver.tsx — Weekly focus picker + Groundskeeper's Drill
    GeometryDrillCard.tsx      — Interactive geometry challenge card
  social-feed/
    generateChallenge.ts       — ChallengeTopic (incl. 'geometry'), 8 geo templates
  command-centre/
    HubTiles.tsx               — Hub tile action flag logic (see issue #27)
```

---

**Status**: Phase 4 complete and merged (#26). Phase 5 pre-season flow is next — confirm scope with user before building.
