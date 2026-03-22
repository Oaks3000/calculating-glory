---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Phase 6 — Live Season Depth"
progress: 15
lastUpdated: "2026-03-21"
lastTouched: "2026-03-21"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Phase 6 — Live Season Depth (in progress)
**Last Updated:** 2026-03-21

## What's Done

- Full TypeScript monorepo workspace (domain + frontend packages)
- Event sourcing architecture: all event types, reducers, command handlers
- 421 domain tests passing across 22 suites
- Deterministic match simulation (Poisson, seeded RNG, attack/defence split)
- Season fixtures: circle method round-robin, 24 teams, 46 weeks
- Weekly club events: 15 templates, branching chains, pending resolution
- Business acumen tracking, curriculum progression (5 levels, feature gating)
- Full Command Centre hub + Stadium View (isometric SVG renderer, 10 facility types)
- Navigation wiring — all core units route to correct slide-overs
- Weekly Training Focus (`SET_TRAINING_FOCUS` command, training drill challenges)
- **Phase 5.1–5.8** — full season flow: pre-season, transfers, match sim, NPC poaching, manager system, club-owned transfers, season end screen, owner forced out (PRs #33–#50 ✅)
- **Scout Network facility** (PR #47 ✅) — truePotential visibility by facility level
- **Morale system** (PR #48 ✅) — result deltas, contract anxiety, threshold events, contagion
- **Scout missions** (PR #49 ✅) — targeted scouting, math challenge bid gate
- **Computed overallRating** (PR #51 ✅) — pure function replacing stored field; charisma → commercial revenue (cubic curve, OVR-amplified)
- **Player attribute progression + retirement** (PR #52 ✅) — 4 curve shapes, peak-height modifier 1–5, seasonal tick on PRE_SEASON_STARTED, truePotential redefined as career-arc cursor anchored to age 42
- **Second season loop** (PR #53 ✅) — league table reset on PRE_SEASON_STARTED; reputation + board confidence deltas on season end; contextual SeasonEndScreen outcome text

## What's In Progress

- Nothing — PR #53 open, awaiting merge

## Blockers

- None

## Open Issues

| # | Title | Priority |
|---|-------|----------|
| #30 | `publicPotential` ↔ `truePotential` Scout Network semantic update (remaining) | Low |
| #27 | Hub tile action flags rerouting | Medium |
| #28 | Construction lag time + staged build visuals | Low |

## Notes

- Target device: Chromebook 1366×768 (keyboard + trackpad)
- **Live URL**: https://oaks3000.github.io/calculating-glory/ — auto-deploys on every push to main via GitHub Actions
- Repo is **public** (required for GitHub Pages free tier); plan to migrate to Railway or similar when multiplayer/auth is needed
- Dev server: `npm run dev --workspace=@calculating-glory/frontend`
- Domain tests: `cd packages/domain && npm test`
- Domain dist is a symlink to main project — always rebuild from `/packages/domain && npm run build`
- Active worktrees: `nostalgic-carson` (PR #53)
- Facility revenue ceiling: current max ~£4k/wk total will not scale to Championship/PL — needs league-tier coefficient before multi-league work
- **Design principle confirmed**: promotion/relegation does NOT affect player stats — ability follows PlayerCurve only; promotion means competing in a harder league, not a stat boost
