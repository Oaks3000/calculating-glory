---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Stadium View & Integration"
progress: 30
lastUpdated: "2026-03-10"
lastTouched: "2026-03-10"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Stadium View & Integration (30% — planning complete, domain + app shell coded)
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
- **StadiumView** full-screen facility management with 2-col card grid

## What's In Progress

- PR 3: Isometric SVG renderer (grid, core units, sub-unit art) — next up
- PR 4: Navigation wiring (core unit clicks open correct slide-overs)

## Blockers

- None

## Notes

- Target device: Chromebook 1366x768 (keyboard + trackpad)
- MVP scope: 3-week mid-season loop starting week 20 — not full season
- Dev server: `npm run dev --workspace=@calculating-glory/frontend`
- Domain tests: `cd packages/domain && npm test`
- Plan file: `.claude/plans/iterative-tinkering-snowglobe.md`
- 10 core units map to 9 facility types (Pitch + Stands share STADIUM)
- PR 5 (Weekly Training Focus) planned as decision density quick win
- PR 6 (Geometry Challenges) planned for stadium-themed maths
