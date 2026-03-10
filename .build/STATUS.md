---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Stadium View & Integration"
progress: 55
lastUpdated: "2026-03-10"
lastTouched: "2026-03-10"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Stadium View & Integration (55% — PRs 1–3 merged, navigation wiring next)
**Last Updated:** 2026-03-10

## What's Done

- Full TypeScript monorepo workspace (domain + frontend packages)
- Domain package: clean build, 245 tests passing across 14 suites
- Event sourcing architecture: all event types, reducers, command handlers
- Deterministic match simulation (Poisson, seeded RNG, attack/defence split)
- Season fixtures: circle method round-robin, 24 teams, 46 weeks
- Game initialization: 24 real League Two teams, populated league table
- Weekly club events system: 15 templates, branching chains, pending resolution
- Business acumen tracking: rolling averages, star ratings
- Curriculum progression system (5 levels, feature gating)
- Design tokens: 4 token files + component inventory + MVP scope doc
- Frontend scaffolded: React + Vite + Tailwind, all components built
- Command Centre hub (12-column grid, data tiles, league table, squad audit)
- Social Feed slide-over (chat bubbles, negotiation keyboard, math challenges)
- News ticker, pending event cards, week advance button
- InboxCard overhaul (result cards, dismissal, preview cap)
- InboxHistory full slide-over (scrollable results + news, dismiss all)
- Seeded deterministic news generator (transfer/injury/league copy, splitmix32 PRNG)
- Reputation tile flash animation (green/red keyframe glow, useRepFlash hook)
- Backroom Team slide-over (5 staff roles, star ratings, hire CTA, wage summary)
- Star player name injection into player-unhappy event
- Learning Progress slide-over (5-level pip track, 5 readiness criteria, topic chips, teacher level selector)
- Business Acumen tile clickable → opens Learning Progress slide-over
- generateChallenge difficulty cap by curriculum level
- **Stadium View architectural plan complete** (MECE coverage, grid layout, hit regions, sub-unit progression)
- **9 facility types** (added FAN_ZONE, GROUNDS_SECURITY, CLUB_OFFICE, CLUB_COMMERCIAL, FOOD_AND_BEVERAGE)
- **FACILITY_CONFIG** as single source of truth for all facility metadata
- **Weekly revenue system** (CLUB_COMMERCIAL + FOOD_AND_BEVERAGE generate income per week)
- **Persistent ViewToggle** top bar (Command Centre / Stadium View toggle + week advance)
- **StadiumView** full-screen facility management with 2-col card grid (PR #23 ✅)
- **Isometric SVG renderer** — real 20×14 grid, 9 core units, coloured blocks scale with level, hover tooltip (PR #24 ✅)
  - `isometric-utils.ts` — grid math (gridToScreen, footprintVertices, blockPaths)
  - `stadium-layout.ts` — CoreUnitDef for all 9 facilities, STADIUM_LAYOUT_SORTED
  - `CoreUnit.tsx` — flat diamond at level 0, isometric block at 1–5, hover highlight
  - `IsometricBlueprint.tsx` — SVG canvas with HTML tooltip (stale-closure fix via useRef)

## What's In Progress

- PR #24 open — awaiting review/merge
- PR 4: Navigation wiring — core unit clicks open correct slide-overs/views

## Blockers

- None

## Notes

- Target device: Chromebook 1366x768 (keyboard + trackpad)
- MVP scope: 3-week mid-season loop starting week 20 — not full season
- Dev server: `cd packages/frontend && npx vite`
- Domain tests: `cd packages/domain && npm test`
- 10 core units map to 9 facility types (Pitch + Stands share STADIUM)
- PR 5 (Weekly Training Focus) planned as decision density quick win
- PR 6 (Geometry Challenges) planned for stadium-themed maths
- Sub-unit art (individual buildings per level) deferred beyond PR 4
