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
