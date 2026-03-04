---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "MVP Build"
progress: 77
lastUpdated: "2026-03-04"
lastTouched: "2026-03-04"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** MVP Build (77% complete — 10/13 issues closed)
**Last Updated:** 2026-03-04

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
- Isometric Blueprint placeholder (card-based facility upgrades)
- News ticker, pending event cards, week advance button

## What's In Progress

- End-to-end playable loop (start → resolve events → advance week → see results)
- UI polish and responsiveness for Chromebook target (1366x768)

## Blockers

- None

## Notes

- Target device: Chromebook 1366x768 (keyboard + trackpad)
- MVP scope: 3-week mid-season loop starting week 20 — not full season
- Dev server runs on http://localhost:3000/ via `npx vite` in packages/frontend
- Root workspace scripts need fixing (workspace name mismatch for `frontend`)
- Domain tests: `npm run build --workspace=@calculating-glory/domain && npm test --workspace=@calculating-glory/domain`
