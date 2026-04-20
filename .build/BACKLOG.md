---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-04-20"
---

# Calculating Glory - Backlog & Ideas

## Features / Functionality

- [x] Isometric SVG renderer — 20×14 grid, 9 core units, level-scaled coloured blocks, hover tooltip ✅ (PR #24)
- [ ] Navigation wiring — core unit clicks open slide-overs, BuildPanel for upgrades (#21 PR 4)
- [ ] Weekly Training Focus — SET_TRAINING_FOCUS command, training drill challenges (#21 PR 5)
- [ ] Geometry challenges — 4 new MathTopics, stadium-themed templates (#21 PR 6)
- [ ] Player database/market — pool of purchasable players with real(ish) names and stats
- [ ] Transfer window UI — browse market, make offers, negotiate
- [x] Tutorial/onboarding flow — Dani intro stadium tour with facility walkthrough ✅ (PR #94; stadium tour later retired in PR #140 in favour of guided-task card)
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
- [x] Backroom Team visibility: manager display, match impact bar, staff count fix ✅ (PR #123)
- [x] Three-pool budget model: Transfer/Infrastructure/Wages with real wage deduction ✅ (PR #123)
- [x] Budget allocation slider UI (linked sliders, transfer-window locked) ✅ (PR #123)
- [x] Board bailout mechanic (10% penalty on wage shortfall) ✅ (PR #123)
- [x] Runway-based validation (8-week minimum for signings/hiring) ✅ (PR #123)
- [x] Name audit: all fictional team/player names reviewed ✅ (PR #123)
- [x] Reputation flash animation ✅
- [x] Learning Progress slide-over ✅
- [x] Command Centre nav overhaul: persistent sidebar (lg+) + bottom tab bar (mobile) ✅ (PR #129)
- [x] Section pages: Inbox, Transfers, Finances, Backroom, Squad replace slide-overs ✅ (PR #129)
- [x] HeadlineStats strip: Position / Confidence / Budget above fold ✅ (PR #129)
- [x] FinancesSection live runway counter alongside wage reserve slider ✅ (PR #129)
- [x] Ambition-first intro cold-open — Kev opens with promotion/cups/fans, Val reframes money as enabler; cut from 23 steps to 10 ✅ (PR #140)
- [x] NPC colour coding — shared `lib/npcs.ts` (Val emerald, Kev sky, Marcus amber, Dani violet); `NpcMessage` colour prop ✅ (PR #140)
- [x] Skip-intro mode — onboarding mode picker after club setup, persisted in `cg-onboarding-mode-v1` ✅ (PR #140)
- [x] Guided task card — 4 pre-season tasks (sponsor / manager / signing / facility) derived from event log ✅ (PR #140)
- [x] Hybrid jargon explainers — `TermInfo` component, first-view NPC modal + short popup after; 5 terms wired (Runway, Burn/wk, Budget, Board, Wage reserve) ✅ (PR #140)

## Improvements / Optimisations

- [ ] Clean up `any` types in internal command handler signatures
- [x] Frontend test suite — FacilityCard + InboxCard component tests; 91 tests total across 6 suites ✅ (PR #66)
- [ ] AI team evolution — form/results affect strength over the season
- [ ] Morale system — explicit morale stat rather than folded into randomness
- [ ] Match events beyond goals — injuries, red cards, suspensions
- [x] Practice mode — Marcus Webb free math drills for business acumen improvement ✅
- [x] NPC match reactions — Kev, Val, Marcus respond to results with distinct voices ✅ (PR #94)
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
- [x] `MatchPitch` component renders in Owner's Box during match — top-down SVG pitch with 22 blips ✅ (#65)
- [x] 22 circle blips: 11 home colour, 11 away in 4-4-2 formation zones ✅ (#65)
- [x] Default jitter: CSS `blipJitter` keyframe (±1.5px) within formation zones ✅ (#65)
- [x] Surge state: BUILD_UP → CHANCE — blips shift toward opponent goal on attack beats ✅ (#65)
- [x] Goal celebration: scoring team blips converge on pitch centre + pulse animation ✅ (#65)
- [x] Goal radial pulse from goal area + scoreboard bounce animation ✅ (#65)
- [x] Crowd atmosphere glow on pitch border (ROAR/CELEBRATION/HOSTILE) ✅ (#65)
- [x] `prefers-reduced-motion` disables all match animations ✅ (#65)
- [ ] Blip movement deterministic (seeded by gameWeek + playerId) — currently CSS-only, not seeded
- [ ] `crowd-flash` keyframe on Stands tiles — staggered brightness spikes; Stands not yet rendered
- [ ] Migrate from Owner's Box top-down pitch to isometric Pitch unit overlay (Phase 7 visual upgrade)

**Visual connectivity**
- [ ] Auto-path tiles between adjacent facilities — "concrete" texture rendered between neighbours
- [ ] All path tiles respect Painter's Algorithm (gc+gr sort order) — blips and dust must not appear behind foreground buildings

**Technical constraints**
- [x] All animations CSS-based — no JS `setInterval` (Chromebook perf) ✅ (#65)
- [x] `prefers-reduced-motion` media query disables all keyframe animations ✅ (#65)
- [ ] Z-indexing: animated overlay elements always respect Painter's Algorithm sort order
- [ ] `isMatchDay` boolean on `gameState` as trigger — currently beat-driven from OwnerBox timeline

**Match director — IMPLEMENTED (#65)**

> ✅ Solved without streaming events. The existing `MatchTimeline` beat sequence (22 beats with real-time offsets) drives the blip state machine directly. OwnerBox maps `BeatType` → `BlipState` transitions via timeouts, piggybacking on the same timeline that drives Kev's commentary.

Blip state machine (6 states) — implemented in `MatchPitch.tsx`:
- `IDLE` — CSS `blipJitter` animation (±1.5px) around formation coordinates ✅
- `BUILD_UP` — blips shift toward opposition half (per-role offset) ✅
- `CHANCE` — high-intensity `blipTense` jitter (±2px) near opponent goal ✅
- `CELEBRATE_HOME` / `CELEBRATE_AWAY` — scoring team converges on pitch centre (3s) ✅
- `RESET` — smooth CSS transition back to formation coordinates ✅

Beat → BlipState mapping (in `OwnerBox.tsx`):
- `GOAL` beat → `CELEBRATE_HOME`/`CELEBRATE_AWAY` (3s) → `RESET` (1s) → `IDLE`
- `CHANCE` beat → `BUILD_UP` (0.4s) → `CHANCE` (2.1s) → `IDLE`
- `NEAR_MISS` beat → `CHANCE` (1.8s) → `IDLE`
- `HALF_TIME` / `FULL_TIME` → `IDLE`

Future: migrate to isometric `PitchDirector` when Stands rendering lands.

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
