# Session Progress — 2026-03-31

## Session Goals
- Update priorities based on current project state
- Implement #63, #64 (UX polish — contract labels, auto-exit, budget flash)
- Implement #90 (Dani intro stadium tour)
- Implement #85 (NPC match reactions)
- Implement #65 (match pitch visualisation)
- Update .build docs

## Completed Work

### 1. UX Polish — #63 + #64 ✅ (PR #93, merged)
- Contract label: "Contract: Xw left" with tooltip for full expiry week
- Runway label: "Xw runway" (was "X wks")
- Negotiations auto-close 2.5s after correct answer
- Budget flash: useRef tracks previous value, shows +/- delta badge with bouncing animation for 2s

### 2. Dani Intro Stadium Tour — #90 ✅ (PR #94, merged)
- 6 new intro steps with stadium backdrop (Training Ground, Medical, Scout, Stadium)
- `BackdropMode` type: 'command' | 'stadium' — IntroScreen switches dynamically
- `highlightFacility` prop on IsometricBlueprint → `isHighlighted` on CoreUnit
- Pulsing blue SVG overlay (intro-highlight keyframe)
- Dani's voice: practical, dry — trade-off framing

### 3. NPC Match Reactions — #85 ✅ (PR #94, merged)
- 30+ templates across 3 NPCs × 7 scenarios (big_win, win, draw, loss, bad_loss, winning_streak, losing_streak)
- `generateNpcMatchReactionEvents()` in simulation/events.ts
- Wired into SIMULATE_WEEK handler after match results
- Deterministic (seeded RNG), non-stacking, Kev double-weighted, 40% chance on ordinary results

### 4. Match Pitch Visualisation — #65 ✅ (committed, awaiting PR)
- `MatchPitch.tsx`: top-down SVG pitch (280×180), 22 blips in 4-4-2 formation
- `BlipState` machine: IDLE → BUILD_UP → CHANCE → CELEBRATE_HOME/AWAY → RESET
- Beat-driven: OwnerBox maps BeatType → BlipState transitions via timeouts
- Goal celebration: radial pulse (goalPulse keyframe) + blip convergence + scoreboard bounce (scoreBounce)
- Crowd glow on pitch border (crowdGlow keyframe) for ROAR/CELEBRATION/HOSTILE
- 7 new Tailwind keyframes + 3 CSS keyframes for SVG animations
- prefers-reduced-motion disables all match animations

### 5. .build Docs Updated ✅
- NEXT.md: complete rewrite with priority queue
- BACKLOG.md: Phase 7d items marked done, match director documented
- STATUS.md: refreshed to 98% Phase 8
- ROADMAP.md: all phases through 8 marked complete

## Architecture Notes

- Match pitch piggybacks on existing MatchTimeline beats — no streaming events needed
- Beat → BlipState mapping: GOAL→CELEBRATE (3s), CHANCE→BUILD_UP→CHANCE (2.5s), NEAR_MISS→CHANCE (1.8s)
- All CSS keyframes, no setInterval — Chromebook-safe
- OwnerBox layout: top bar → scoreboard (with bounce) → pitch → crowd label → commentary → post-match

## Current Status

### ✅ Working
- All features shipped, tests pass (478 domain tests)
- Zero new TypeScript errors (149 total = all pre-existing module resolution)

### 🟡 Pending
- PR for #65 match pitch (on branch, pushed)

### 🔴 Blocked
- Nothing

## Key Files Modified

- `packages/frontend/src/components/owner-box/MatchPitch.tsx` — NEW: pitch SVG + blips
- `packages/frontend/src/components/owner-box/OwnerBox.tsx` — blip state, goal flash, scoreboard bounce
- `packages/frontend/tailwind.config.js` — 7 new animation keyframes
- `packages/frontend/src/index.css` — 3 SVG keyframes + reduced-motion rules
- `packages/frontend/src/components/intro/IntroScreen.tsx` — backdrop switching, Dani tour
- `packages/frontend/src/components/isometric/CoreUnit.tsx` — isHighlighted prop
- `packages/frontend/src/components/isometric/IsometricBlueprint.tsx` — highlightFacility prop
- `packages/domain/src/simulation/events.ts` — NPC match reaction templates + generator
- `packages/domain/src/commands/handlers.ts` — wire NPC reactions into SIMULATE_WEEK
- `packages/frontend/src/components/shared/FinancialHealthBar.tsx` — budget flash
- `packages/frontend/src/components/social-feed/SocialFeed.tsx` — auto-exit callback
- `packages/frontend/src/components/transfer-market/TransferMarketSlideOver.tsx` — contract labels
