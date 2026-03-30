# Session Progress - 2026-03-30

## Session Goals
- Morale news ticker milestone messages (domain event, fires once per streak crossing)
- Geometry challenges in Stadium View (Groundskeeper's Drill panel)

## Completed Work

### 1. Morale news ticker milestone messages ✅
- New domain event `MORALE_TICKER_EVENT` fires exactly once per form-streak milestone crossing (W3, W5, L3, L5)
- `detectFormMilestone()` + `FORM_MILESTONE_HEADLINES` added to `simulation/morale.ts`
- `lastFormMilestone` field on `GameState` tracks last known milestone so re-fires don't happen
- `handleSimulateWeek` in `handlers.ts` detects crossing by comparing prospective form to `state.lastFormMilestone`
- `WEEK_ADVANCED` reducer resets `lastFormMilestone` to current form state (naturally returns `null` when no streak)
- `NewsTicker.tsx` now reads `MORALE_TICKER_EVENT` from `state.events[]` instead of computing from live form — eliminates the "always showing" bug

### 2. Geometry challenges — Groundskeeper's Drill ✅
- New `angles.ts` question bank: 8 questions (5 × D1 Year 8, 3 × D2 Year 9) — angles on a line, vertically opposite, triangle rules, polygon interior/exterior, parallel lines
- Registered in `bank.ts` (`...anglesBank`)
- `GeometryDrillCard` gains `onAttempt` callback; first submission dispatches `RECORD_MATH_ATTEMPT`
- `StadiumView` below-fold: "📐 Groundskeeper's Drill" panel renders when `stadiumLevel >= 1`
- `generateChallenge` called with topic override `'geometry'` (maps to AREA_AND_PERIMETER + ANGLES + SCALE_AND_PROPORTION + PROPERTIES_OF_SHAPES)
- Verified in browser: panel appears after upgrading Stadium to Level 1; question + hints + submit all working

## Architecture Notes

- Domain events pattern: both features follow the `FINANCIAL_THRESHOLD_EVENT` precedent — fire once on crossing, store "last known" band in state
- Worktree dist sync: domain changes always need `npm run build` in worktree dist then `cp -r dist/ /main/packages/domain/dist/`
- `stadiumLevel >= 1` gate: Groundskeeper only appears once the stadium has been built (level 0 = derelict = no Kev on site)

## Current Status

### ✅ Working
- Both features shipped and browser-verified
- Domain dist synced
- TypeScript clean

### 🟡 In Progress
- Nothing

### 🔴 Blocked
- Nothing

## Build Commands / Key Files

```bash
# Domain dist rebuild (worktree + sync to main)
cd packages/domain && npm run build
cp -r dist/ /Users/oakleywalters/Projects/calculating-glory/packages/domain/dist/

# Dev server
npm run dev --workspace=@calculating-glory/frontend
```

Key files:
- `packages/domain/src/events/types.ts` — MoraleTickerEvent
- `packages/domain/src/simulation/morale.ts` — detectFormMilestone, FORM_MILESTONE_HEADLINES
- `packages/domain/src/commands/handlers.ts` — morale event emission
- `packages/domain/src/reducers/index.ts` — MORALE_TICKER_EVENT case + lastFormMilestone reset
- `packages/domain/src/content/questions/angles.ts` — new angles bank
- `packages/domain/src/content/questions/bank.ts` — anglesBank registration
- `packages/frontend/src/components/stadium-view/GeometryDrillCard.tsx` — onAttempt callback
- `packages/frontend/src/components/stadium-view/StadiumView.tsx` — Kev's Drill panel

## Next Session Goals

1. **Commit this branch** and open PR against main
2. **Balance pass** — full L2 → L1 play-through; observe growth/retirement, question difficulty progression
3. **Multiple leagues** — League One NPC team data, division-aware match sim, promotion/relegation

---

**Status**: Morale ticker milestones + Groundskeeper's Drill both shipped. Browser verified. Ready to commit.
