---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "MVP Build"
progress: 90
lastUpdated: "2026-03-09"
lastTouched: "2026-03-09"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** MVP Build (90% complete — 20 issues closed)
**Last Updated:** 2026-03-09

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
- InboxCard overhaul (result cards, dismissal, preview cap)
- InboxHistory full slide-over (scrollable results + news, dismiss all)
- Seeded deterministic news generator (transfer/injury/league copy, splitmix32 PRNG)
- Reputation tile flash animation (green/red keyframe glow, useRepFlash hook)
- Backroom Team slide-over (5 staff roles, star ratings, hire CTA, wage summary)
- Star player name injection into player-unhappy event
- Learning Progress slide-over (5-level pip track, 5 readiness criteria, topic chips, teacher level selector)
- Business Acumen tile clickable → opens Learning Progress slide-over
- generateChallenge difficulty cap by curriculum level (Year 7 → d1 only, Year 8 → d1-2, Year 9+ → all)

## What's In Progress

- End-to-end playable loop fully wired (events → resolve → advance → results)
- UI polish pass for Chromebook target (1366x768)
- Stadium View planning (issue #21 — full MECE planning session required before build)

## Blockers

- Stadium View (#21) needs a dedicated planning session to map core/sub-unit grid before any implementation

## Notes

- Target device: Chromebook 1366x768 (keyboard + trackpad)
- MVP scope: 3-week mid-season loop starting week 20 — not full season
- Dev server: `npm run dev --workspace=@calculating-glory/frontend` (reads PORT env var via vite.config.ts)
- Domain tests: `npm test --workspace=@calculating-glory/domain`
- All changes in confident-colden worktree; pending merge to main
