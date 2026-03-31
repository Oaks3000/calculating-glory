# Session Progress - 2026-03-31

## Session Goals
- Verify Dani facility observation cards fire correctly in browser
- Remove green styling from Owner's Box messages; replace with physics bump animations
- Fix duplicate consecutive commentary lines in Owner's Box

## Completed Work

### 1. Dani facility observations — verified ✅
- `generateDaniFacilityObservationEvents()` wired into `handleSimulateWeek` in `handlers.ts`
- Fires roughly every 6–8 weeks with an inbox card observing a rival club's facility investment
- Verified at Week 6: card appeared with correct amber "Dani Lopes · Operations" badge, proper Dani voice, "Noted. I'll keep an eye on it" single choice, "No financial impact" label

### 2. Owner's Box physics animations ✅
- Removed goal-green styling (`bg-pitch-green/10`, `text-pitch-green`, border, avatar ring)
- Three-tier animation system using both `beatType` and `mood`:
  - Normal messages → `animate-fade-in`
  - CHANCE / NEAR_MISS beats → `animate-msg-bump origin-left` (springy single bump)
  - Player GOAL reaction (`mood: 'elated'`) → `animate-msg-goal-bump origin-left` (quadruple flash, 1.4s)
  - Player GOAL buildup (`mood: 'excited'`) → `animate-msg-bump origin-left` (single bump)
  - Opposition GOAL reaction (`mood: 'frustrated'`) → `animate-msg-goal-bump-oppo origin-left` (double bump, 0.9s)
- Three new tailwind keyframes added: `msgBump`, `msgGoalBump`, `msgGoalBumpOppo`
- `origin-left` keeps scale anchored to the bubble's left edge

### 3. No-duplicate commentary ✅
- `pick()` in `commentary.ts` now tracks `lastPicked`; re-rolls once if same value would appear back-to-back
- Preserves seeded determinism (at most one extra RNG draw, not a loop)
- Verified: no consecutive identical messages across full Week 13 match

### 4. Text polish (em-dash → period/comma) ✅
- Replaced em-dashes throughout NPC dialogue: intro screen, events, club-events, social feed, facility card, commentary templates

## Architecture Notes

- Animation discriminant: `mood` field on `PhoneMessage` is used to distinguish player vs opposition goals; player buildup is `'excited'`, player reaction is `'elated'`, opposition is `'frustrated'`
- `lastPicked` is closure-scoped inside `generateMatchTimeline()` — resets per match; no cross-match state leakage

## Current Status

### ✅ Working
- All features browser-verified across Week 12 + Week 13 matches
- PR #89 open: https://github.com/Oaks3000/calculating-glory/pull/89

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
- `packages/domain/src/simulation/commentary.ts` — pick() duplicate fix + Dani event integration
- `packages/domain/src/simulation/events.ts` — generateDaniFacilityObservationEvents()
- `packages/domain/src/commands/handlers.ts` — Dani events wired into handleSimulateWeek
- `packages/frontend/src/components/owner-box/OwnerBox.tsx` — KevBubble animation tiers
- `packages/frontend/tailwind.config.js` — msgBump, msgGoalBump, msgGoalBumpOppo keyframes

## Next Session Goals

1. Merge PR #89
2. Balance pass — full L2 → L1 play-through
3. Pick next polish issue from #81/#82/#83/#85/#86

---

**Status**: Owner's Box polish + Dani observations shipped. PR #89 open and browser-verified. Ready to merge.
