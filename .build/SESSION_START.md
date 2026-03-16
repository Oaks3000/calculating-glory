# Session Progress - 2026-03-10

## Session Goals
- Complete Stadium View architectural planning (issue #21)
- Implement PR 1: Domain foundation (new facility types, revenue, config)
- Implement PR 2: App shell + Stadium View (view toggle, facility card grid)

## Completed Work

### 1. Stadium View Architectural Plan
- **MECE Coverage** ✅
  - Mapped all 15+ game systems to exactly 10 core units, no orphans
  - Core units: Pitch, Stands, Training, Medical, Youth, Office, Commercial, Food & Beverage, Fan Zone, Grounds & Security
  - Key decisions: Pitch = cosmetic only (driven by STADIUM level), Stands = gameplay progression
  - Week advance moved to persistent top bar (accessible from both views)
- **Grid Layout** ✅
  - 20x14 isometric grid at 64x32px tiles, fits 1366x720 viewport
  - All 10 core units positioned with concrete grid coordinates
  - ~25% grid utilisation — room for growth
- **Hit Region Model** ✅
  - SVG `<g>` with transparent rect overlay (not Canvas)
  - React-managed HTML tooltip over SVG
- **Sub-Unit Progression** ✅
  - 5-level visual progression tables for all 10 core units
  - Stands: South L1, North L2, East L3, West L4, Floodlights+Roofs L5
- **Geometry Challenges** ✅
  - 4 new MathTopics planned: AREA_AND_PERIMETER, ANGLES, SCALE_AND_PROPORTION, PROPERTIES_OF_SHAPES
  - Stadium-themed challenge templates for each core unit
- **Decision Density** ✅
  - Analysed ~2.8 mandatory decisions/week (too thin)
  - Weekly Training Focus (PR 5) adds ~2 more decisions/week
  - Separate issue planned for full density overhaul

### 2. PR 1: Domain Foundation
- **facility.ts** ✅
  - 9 facility types (added CLUB_OFFICE, CLUB_COMMERCIAL, FOOD_AND_BEVERAGE, FAN_ZONE, GROUNDS_SECURITY)
  - 7 benefit types (added board_confidence, reputation, attendance)
  - FACILITY_CONFIG as single source of truth with upgrade costs
  - getDefaultFacilities() driven by FACILITY_CONFIG
- **reducers/index.ts** ✅
  - handleGameStarted initialises facilities via getDefaultFacilities()
  - handleWeekAdvanced calculates weekly revenue from CLUB_COMMERCIAL + FOOD_AND_BEVERAGE
  - handleFacilityUpgraded recalculates upgradeCost from FACILITY_CONFIG
- **Verification** ✅
  - 245 domain tests passing, TypeScript compiles cleanly

### 3. PR 2: App Shell + Stadium View
- **ViewToggle.tsx** (new) ✅
  - Persistent top bar: club info (left), Command Centre/Stadium View toggle (centre), week advance (right)
- **FacilityCard.tsx** (new shared) ✅
  - Extracted from IsometricBlueprint, reusable across views
- **StadiumView.tsx** (new) ✅
  - Full-screen facility management: stadium header, budget banner, 2-col card grid
  - All 9 facility types render with upgrade buttons
- **App.tsx** ✅
  - activeView state, ViewToggle + conditional CommandCentre/StadiumView render
  - Error toast + loading overlay moved from CommandCentre to App
- **CommandCentre.tsx** ✅
  - Removed header (moved to ViewToggle), removed isometric slide-over
  - HubTile "Stadium & Facilities" navigates to Stadium View via onNavigateToStadium prop
- **Verification** ✅
  - Dev server: both views render, toggle works, no console errors
  - All 9 facilities visible in Stadium View

## Architecture Notes

- FACILITY_CONFIG is now the single source of truth — domain, reducers, and frontend all read from it
- Pitch and Stands share the STADIUM facility type but are separate visual core units
- View toggle is `useState<'command' | 'stadium'>` in App.tsx — no router needed
- IsometricBlueprint.tsx retained as slide-over component but now uses shared FacilityCard

## Current Status

### ✅ Working
- Domain package (245 tests, 9 facility types, weekly revenue)
- View toggle between Command Centre and Stadium View
- Stadium View with all 9 facility cards
- All existing Command Centre functionality intact

### 🟡 Ready for Next PR
- PR 3: Isometric SVG renderer (grid, core units, sub-unit art)
- PR 4: Navigation wiring (core unit clicks open slide-overs)

### 🔴 Blocked
- Nothing blocked

## Build Commands / Key Files

```bash
# Build domain
cd packages/domain && npm run build

# Type check frontend
cd packages/frontend && npx tsc --noEmit

# Run domain tests
cd packages/domain && npm test

# Start dev server
npm run dev --workspace=@calculating-glory/frontend
```

## Key Files Modified This Session

- `packages/domain/src/types/facility.ts` — 9 facility types, FACILITY_CONFIG
- `packages/domain/src/reducers/index.ts` — facility init, weekly revenue, upgrade cost
- `packages/frontend/src/App.tsx` — view toggle, conditional rendering
- `packages/frontend/src/components/shared/ViewToggle.tsx` — persistent top bar (new)
- `packages/frontend/src/components/shared/FacilityCard.tsx` — shared facility card (new)
- `packages/frontend/src/components/stadium-view/StadiumView.tsx` — stadium view (new)
- `packages/frontend/src/components/command-centre/CommandCentre.tsx` — removed header/isometric
- `packages/frontend/src/components/isometric/IsometricBlueprint.tsx` — uses shared FacilityCard

## Next Session Goals

- PR 3: Isometric SVG renderer (stadium-layout.ts, isometric-utils.ts, CoreUnit.tsx, sub-unit art)
- PR 4: Navigation wiring (core unit clicks open correct slide-overs)
- Consider PR 5: Weekly Training Focus (decision density quick win)

---

**Status**: Stadium View plan complete, domain foundation + app shell implemented. Ready for isometric SVG renderer (PR 3).

---

# Session Progress - 2026-03-10 (Session 2 — Isometric Renderer)

## Session Goals
- Merge PR #23 after test plan verification
- Implement PR 3: Isometric SVG renderer (real grid, 9 core units, hover tooltip)
- Open PR #24 and update .build files

## Completed Work

### 1. PR #23 Merge
- **Test plan** ✅
  - 245 domain tests passing; `tsc --noEmit` clean
  - Dev server verified: Command Centre, Stadium View, all 9 facility cards, ViewToggle, weekly revenue
- Squash-merged to main; PR #23 closed

### 2. PR 3 — Isometric SVG Renderer (PR #24)
- **`isometric-utils.ts`** ✅ (new)
  - Pure math for 20×14 grid (TILE_W=64, TILE_H=32), SVG 1088×640
  - `gridToScreen`, `footprintVertices`, `footprintPath`, `blockPaths`, `topFaceCenter`, `groundCenter`
  - Key insight: right vertex of tile (c,r) = top vertex of tile (c+1,r) → clean multi-tile footprint via `gridToScreen(gc+cols, gr)`
- **`stadium-layout.ts`** ✅ (new)
  - `CoreUnitDef` with grid position (gc,gr), dimensions (cols,rows), per-level blockHeights[6], colours
  - 9 units: Pitch(6×5 green), Training(3×2 amber), Medical(2×2), Youth(3×2 teal), Office(2×2 blue), Commercial(2×2 gold), Food(2×2 orange), FanZone(3×2 purple), Security(3×2 grey)
  - `STADIUM_LAYOUT_SORTED` by gc+gr ascending for painter's algorithm
- **`CoreUnit.tsx`** ✅ (new)
  - Level 0: flat dashed diamond + emoji; Level 1–5: coloured isometric block + pip dots + hover tint
  - Transparent hit region at top of SVG group for reliable pointer events
- **`IsometricBlueprint.tsx`** ✅ (rewritten from placeholder)
  - Dark blue SVG background, all 9 CoreUnits back-to-front
  - HTML tooltip: name, level label, description, "Click to upgrade →" (level 0 only)
  - Stale closure fix: `hoveredIdRef = useRef` updated in `handleHover`; `handleMouseMove` reads ref not state
  - `onCoreUnitClick` prop accepted (wired in PR 4)
- **`StadiumView.tsx`** modified: `IsometricBlueprint` embedded above card grid

### 3. .build Files Updated
- STATUS.md (progress 30→55%), ROADMAP.md (4.4 ✅), NEXT.md (PR 4 routing map), BACKLOG.md, SESSION_START.md

## Architecture Notes

- **Painter's algorithm via SVG doc order**: sort gc+gr ascending; later elements render on top; no z-index needed
- **React stale closure trap**: `mousemove` fires before state update propagates → `useRef` mirroring state is the correct fix
- **Domain dist freshness in worktrees**: new worktrees have stale `dist/`; run `npm run build` in domain before first `tsc --noEmit` in frontend
- **`preview_start` CWD gotcha**: tool uses session CWD, not worktree path; ran Vite via Bash with explicit path

## Current Status

### ✅ Working
- All 9 core units render as interactive SVG buttons (verified with Playwright)
- Hover tooltip correct: level label, description, upgrade CTA at level 0 only
- Club Office renders at Level 1 (correct initial state)
- 245 domain tests green; TypeScript clean

### 🟡 In Progress
- PR #24 open — awaiting merge
- PR 4: Navigation wiring (next)

### 🔴 Blocked
- None

## Build Commands / Key Files

```bash
cd packages/domain && npm run build   # rebuild domain dist after domain changes
cd packages/domain && npm test        # 245 tests
cd packages/frontend && npx tsc --noEmit
cd packages/frontend && npx vite --port 3001  # from pr3 worktree
```

## Next Session Goals

1. Merge PR #24 (test plan → squash merge → new worktree from main)
2. PR 4: Wire `onCoreUnitClick` in `App.tsx`/`StadiumView.tsx` per full routing map in NEXT.md

---

**Status**: PR #24 open — isometric SVG renderer complete, 245 tests green, tsc clean. PR 4 navigation wiring is next.

---

# Session Handover — 2026-03-12

## What Was Done This Session

### 1. Local main synced
- Local `main` was 6 commits behind `origin/main` — some uncommitted changes were already in origin/main (formatMoney decimals + WeekAdvanceButton currentWeek+1 fix). Discarded duplicates, pulled forward.

### 2. PR #24 + PR #25 merged
- PR #24 (Isometric SVG renderer) — merged ✅
- PR #25 (Navigation wiring) — merged ✅; `handleCoreUnitClick(facilityType)` now routes all 9 core units to correct slide-overs

### 3. CLAUDE.md — Section 8 added
- Documented npm workspace symlink gotcha: `node_modules/@calculating-glory/domain` always points to main project's `dist/`, never the worktree's. Rule: rebuild domain at `/calculating-glory/packages/domain/` always.
- New-worktree 3-step checklist added
- Local main sync pattern documented

### 4. Stadium visual design spec — Gemini output
- Wrote a higher-level art direction brief (aesthetic-first, XXXXX placeholders for style choices)
- Brief sent to Gemini; Gemini produced a full visual design spec:
  - **3-tone lighting**: Top 100%, SW face 70% (30% black overlay), SE face 45% (55% black overlay)
  - **1px highlight line** on every top edge (white, 20% opacity)
  - **SVG pattern library** defined: `pat-grass-pro`, `pat-seats`, `pat-concrete`, `pat-corrugated`
  - **Level progression**: L0 = scrub/construction tape → L5 = cantilevered roof, ribbed underside
  - **"Living world" animations**: crowd stipple wave, swimming pool glint, flags, birds (matchday only)
  - Reference aesthetic: SimCity 2000 — charming, textured, solid-feeling without being photorealistic

### 5. Housekeeping
- Removed 5 stale worktrees (agitated-austin, confident-colden, dreamy-bell, pr3-isometric-renderer, pr4-navigation)
- Committed CLAUDE.md, stadium-mockup.html, TASKS.md, package-lock.json to main
- .build files updated

## Current Status

### ✅ Done
- PR #23 Stadium View foundation
- PR #24 Isometric SVG renderer
- PR #25 Navigation wiring
- Visual design spec (Gemini) — ready to implement
- Worktrees clean; main branch up to date

### 🟡 Next
- Validate visual design spec in `stadium-mockup.html` (30 min proof of concept)
- PR 5: Weekly Training Focus

### 🔴 Blocked
- Club colours not decided — needed for seating banding in visual design spec

## Key Files

```
/calculating-glory/stadium-mockup.html          — standalone SVG proof-of-concept
/calculating-glory/CLAUDE.md                    — Section 8: worktree gotchas
/calculating-glory/packages/frontend/src/components/isometric/
  IsometricBlueprint.tsx                        — SVG canvas, tooltip, onCoreUnitClick
  CoreUnit.tsx                                  — per-unit renderer (level 0 diamond / 1-5 block)
  stadium-layout.ts                             — 9 CoreUnitDef with grid coords, heights, colours
  isometric-utils.ts                            — gridToScreen, blockPaths, footprintVertices
```

## How to Start Next Session

```bash
# 1. Sync main (in case PRs have merged)
git -C /Users/oakleywalters/Projects/calculating-glory pull origin main

# 2. Rebuild domain
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# 3. Create worktree for PR 5
git worktree add .claude/worktrees/<name> -b feat/pr5-training-focus origin/main

# 4. TypeScript check before writing code
cd /Users/oakleywalters/Projects/calculating-glory/.claude/worktrees/<name>/packages/frontend && npx tsc --noEmit
```

## Visual Design Spec Summary (for implementation)

The spec is in the conversation history. Key rules to implement in `IsometricBlueprint.tsx` / `CoreUnit.tsx`:

1. **Face shading**: top = base colour, SW face = base + `rgba(0,0,0,0.3)` overlay, SE face = base + `rgba(0,0,0,0.55)` overlay
2. **Highlight line**: 1px white stroke at 20% opacity on top edge of each block
3. **Grass pattern**: alternating green stripes via `<pattern>` in `<defs>` (Level 3+)
4. **Seat pattern**: 2px horizontal bands in club colour, 1px dark separator, 1px drop shadow under each row
5. **Concrete**: 1px dot stipple pattern at ~10% opacity over warm grey (#A8A8A8)
6. **Validate in `stadium-mockup.html` before touching production renderer**

---

**Status**: PRs 23–25 merged, visual design spec in hand, worktrees clean. Next: validate spec in mockup, then PR 5 (Weekly Training Focus).
