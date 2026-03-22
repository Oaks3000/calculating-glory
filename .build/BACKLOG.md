---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-22"
---

# Calculating Glory - Backlog & Ideas

## Features / Functionality

- [x] Isometric SVG renderer — 20×14 grid, 9 core units, level-scaled coloured blocks, hover tooltip ✅ (PR #24)
- [ ] Navigation wiring — core unit clicks open slide-overs, BuildPanel for upgrades (#21 PR 4)
- [ ] Weekly Training Focus — SET_TRAINING_FOCUS command, training drill challenges (#21 PR 5)
- [ ] Geometry challenges — 4 new MathTopics, stadium-themed templates (#21 PR 6)
- [ ] Player database/market — pool of purchasable players with real(ish) names and stats
- [ ] Transfer window UI — browse market, make offers, negotiate
- [ ] Tutorial/onboarding flow — first-time player guidance
- [ ] Pre-season flow — squad building before the season starts
- [ ] Season end screen — promotion/relegation celebration/commiseration
- [ ] localStorage persistence — serialise event log on every command, rehydrate on load; prevents progress loss on browser close (no infrastructure needed)
- [ ] Multiplayer sync — async turn-based between friends
- [ ] Save/load to server (beyond localStorage)
- [x] Stadium View plan — MECE coverage, grid layout, hit regions, sub-unit progression ✅
- [x] Domain foundation — 9 facility types, FACILITY_CONFIG, weekly revenue ✅
- [x] App shell — ViewToggle, StadiumView card grid, shared FacilityCard ✅
- [x] InboxCard overhaul — result cards, dismissal, preview cap ✅
- [x] InboxHistory full slide-over ✅
- [x] Seeded news generator (transfer/injury/league) ✅
- [x] Backroom Team slide-over ✅
- [x] Reputation flash animation ✅
- [x] Learning Progress slide-over ✅

## Improvements / Optimisations

- [ ] Clean up `any` types in internal command handler signatures
- [x] Frontend test suite — FacilityCard + InboxCard component tests; 91 tests total across 6 suites ✅ (PR #66)
- [ ] AI team evolution — form/results affect strength over the season
- [ ] Morale system — explicit morale stat rather than folded into randomness
- [ ] Match events beyond goals — injuries, red cards, suspensions
- [ ] Practice mode — Marcus Webb free math drills for business acumen improvement
- [ ] Decision density overhaul — squad selection, transfers, contracts, sponsorship (separate issue)
- [x] Business acumen tile clickable → Learning Progress slide-over ✅
- [x] Challenge difficulty capped by curriculum level ✅
- [x] Star player name injected into wage-demand event ✅

## Educational / Curriculum

- [ ] Adaptive difficulty fully wired to curriculum assessment (currently gated by level, not by live evidence)
- [ ] Hint system — curriculum-appropriate scaffolding for math challenges
- [ ] All branching club event chains — 15 templates, 4 branching follow-ups fully written
- [ ] Teacher dashboard — class view of student progress
- [ ] Geometry/shape challenges from Stadium View (AREA_AND_PERIMETER, ANGLES, SCALE_AND_PROPORTION, PROPERTIES_OF_SHAPES)
- [ ] "Groundskeeper" NPC for geometry practice from Stadium View
- [x] Learning Progress slide-over (5-level pip track, readiness criteria, topic chips) ✅
- [x] Curriculum difficulty cap in challenge generator ✅

## Research / Exploration

- [ ] Chromebook performance profiling — ensure smooth at 1366x768
- [ ] Accessibility audit — keyboard nav, colour contrast for school use
- [ ] Offline capability — service worker for no-internet classrooms
- [x] Stadium View MECE analysis — every game system mapped to exactly one core unit ✅

## Future Phases

- [x] Second season — league table reset, reputation/board confidence deltas, contextual outcome text ✅ (PR #53)
- [ ] Multiple leagues (League One, Championship)
- [ ] Custom club creation (name, colours, badge)

### Phase 7: Isometric Stadium — SC2K Visual Overhaul

Full rework of the stadium renderer to give it a SimCity 2000 "living machine" feel. Three-tone shading, per-facility micro-animations, and a match day overlay with moving player blips.

**SC2KTile component (3-tone shading)**
- [ ] Replace flat-colour tiles with proper 3-face geometry: top / left / right
- [ ] 2:1 tile ratio (tileW 64, tileH 32), unitH 12px per level — buildings grow vertically with upgrade level
- [ ] Three-tone rule: `topFace = color`, `leftFace = shadeColor(color, -15)`, `rightFace = shadeColor(color, -30)`
- [ ] Cast ground shadow (black, 15% opacity) offset at 135° to anchor buildings to the grid — prevents "floating" during animations
- [ ] `shadeColor()` utility — lighten/darken hex by percentage

**Construction state**
- [x] Construction lag — FACILITY_UPGRADE_STARTED / FACILITY_CONSTRUCTION_COMPLETED events; 2–6 week timers; amber dashes + 🏗 icon in isometric view ✅ (PR #66)
- [ ] `hazard-slide` CSS keyframe — animated yellow dashed stroke (`stroke-dashoffset` 0→12, 0.5s linear infinite) on tile base while `isBuilding` (static dashes currently in place)
- [ ] `construction-jostle` keyframe — 2px vertical translateY oscillation (2s ease-in-out infinite) on the building body
- [ ] Dust particles — emit small SVG `<circle>` elements at tile base while upgrading (CSS fade-out, seeded positions)

**Per-facility micro-animations (ambient, always-on when active)**
- [ ] Scout Network — small 2D radar dish on roof, CSS 360° rotation loop
- [ ] Medical Centre — Red Cross neon flicker (opacity 0.7↔1.0 oscillation)
- [ ] Fan Zone — SVG flag paths flutter via `skewX` animation
- [ ] (Remaining 7 facilities to be designed — one looping animation each)

**Match day overlay**
- [ ] `MatchDayOverlay` component renders on top of the Pitch unit during match sim
- [ ] 22 `<rect>` blips (2×2px): 11 home colour, 11 white (away)
- [ ] Default jitter: ±2px random movement every 500ms within positional zones (defence / midfield / attack)
- [ ] Surge state: attacking team blips shift mean x-position toward opponent goal when attack event fires
- [ ] Goal celebration: scoring team blips converge on centre circle for 3 seconds
- [ ] Blip movement must be deterministic (seeded by gameWeek + playerId) — not `Math.random()` — so replays are consistent
- [ ] `crowd-flash` keyframe on Stands tiles — staggered brightness spikes (2.5× and 3× peaks) per stand section; `animation-delay` varies by section to avoid global strobe

**Visual connectivity**
- [ ] Auto-path tiles between adjacent facilities — "concrete" texture rendered between neighbours
- [ ] All path tiles respect Painter's Algorithm (gc+gr sort order) — blips and dust must not appear behind foreground buildings

**Technical constraints**
- [ ] All animations CSS-based or `requestAnimationFrame` — no JS `setInterval` for visual updates (Chromebook perf)
- [ ] `prefers-reduced-motion` media query disables all keyframe animations (accessibility — school use)
- [ ] Z-indexing: animated overlay elements always respect Painter's Algorithm sort order
- [ ] `isMatchDay` boolean on `gameState` is the trigger for crowd-flash and blip overlay; no animation outside match context

**Match director — advisory (verify against game wiring when Phase 7 begins)**

> ⚠️ The current match sim is deterministic and runs synchronously — there are no streaming `matchEvent` emissions mid-simulation. This spec assumes a real-time event feed that doesn't currently exist. Treat as design intent; implementation approach needs to be worked out against actual game architecture.

Blip state machine (5 states):
- `IDLE` — default jitter around home coordinate based on position role (Def / Mid / Atk)
- `BUILD_UP` — blips drift toward opposition half; speed tied to `teamwork` attribute
- `CHANCE` — high-intensity jitter near opponent goal area
- `CELEBRATE` — scoring team's blips converge on pitch centre / corner flag (3 seconds)
- `RESET` — blips glide back to starting isometric coordinates

`PitchDirector` component concept:
- Sits inside the Pitch core unit `<g>` on the 20×14 grid
- Receives `matchEvent` (goal scored / attack attempt) and drives phase transitions
- Player blips receive `phase`, `speed` (from `teamwork / 10`), `aggression` (from `attack`)
- Renders only while `isMatchDay` — single `<svg>` or `<g>`, not 22 individual React subtrees

Goal reaction cascade:
- Trigger `crowd-flash` simultaneously on all Stands units (the "Flash Mob")
- Fire existing Reputation flash animation on home goal — immediate positive reinforcement
- Scoreboard / Fan Zone tile briefly shifts to bright neon white ("Jumbotron effect")

Performance notes for Chromebooks:
- Use `transition: transform 0.5s ease-in-out` on blips — GPU-handled, not JS-calculated per frame
- Blip engine renders only during match context (`isMatchDay`) — zero overhead outside match
- 22 blips as `<rect>` elements inside one `<g>` is cheap; avoid mounting as individual React components with their own state/intervals

## Balance / Tuning

- [ ] Balance pass — observe growth/decline rates, retirement frequency (~1–2/season), and whether promotion to L1 feels meaningfully harder; run passively during normal play-throughs rather than as a dedicated task

## Captured Thoughts

- Isometric SVG: right vertex of tile (c,r) = top vertex of tile (c+1,r) — this identity makes multi-tile footprint math clean and composable
- Painter's algorithm in SVG is just document order — sort by gc+gr ascending, render first = draws under
- React stale closure trap: mousemove handler captures state at render time; useRef is the correct escape hatch, not useCallback alone
- Domain dist freshness is a hidden worktree gotcha — new worktrees branch from main but inherit stale `dist/`; always `npm run build` in domain first
- The "NASA for Football" aesthetic is the north star for Command Centre — data-dense but legible
- Club events are the main creative differentiator — invest time in the writing
- Branching path dependency (past decisions unlock/block future events) creates replay value
- Star ratings for business acumen should feel rewarding, not punishing
- Integer pence arithmetic was the right call — no floating-point issues anywhere
- FACILITY_CONFIG is single source of truth — domain, reducers, and frontend all read from it
- Pitch and Stands are two visual core units backed by one STADIUM facility
- Two-tier grid principle: Core units = navigation anchors (clickable); Sub-units = visual/stat effects only (pointer-events: none)
- Grounds & Security directly impacts attendance rate — natural math hook for percentages
- Food & Beverage ties into existing "Hot Dog Hygiene" club events — narrative hooks built in
- Fan Zone + Grounds & Security were late additions that improve decision density and visual variety
- ~2.8 mandatory decisions/week is too thin — Weekly Training Focus (PR 5) is the quick win
