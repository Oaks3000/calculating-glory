---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Phase 6 — Live Season Depth"
progress: 45
lastUpdated: "2026-03-22"
lastTouched: "2026-03-22"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Phase 6 — Live Season Depth (in progress)
**Last Updated:** 2026-03-22

## What's Done

- Full TypeScript monorepo workspace (domain + frontend packages)
- Event sourcing architecture: all event types, reducers, command handlers
- 441 domain tests passing across 23 suites
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
- **Facility revenue tier scaling** (PR #54 ✅) — Division type tracked on GameState; TIER_REVENUE_MULTIPLIER (1×→2×→4×→10× across L2/L1/Champ/PL); facilityRevenue() extracted to revenue.ts; 20 new tests
- **localStorage persistence** (PR #54 ✅) — event log serialised to `cg-events-v1` on every dispatch; rehydrates on page load; resetGame() exposed for future New Game UI
- **Hub tile routing fix** (PR #55 ✅) — Stadium tile badge now fires only on first-time facility unlocks (level 0 → affordable), not routine level-ups; Chats tile badge already targeted to math-challenge negotiations only
- **Construction lag + frontend tests + NPC league persistence** (PR #66 ✅) — facility upgrades take 2–6 weeks; amber dashes + 🏗 icon in isometric view; 23 new component tests (FacilityCard + InboxCard); previousLeagueTable snapshotted at season reset with "Last Season" tab in UI

## What's In Progress

- Nothing — main is clean at PR #66 merge

## Blockers

- None

## Open Issues

| # | Title | Priority |
|---|-------|----------|
| #30 | `publicPotential` ↔ `truePotential` Scout Network semantic update | Low |

## Notes

- Target device: Chromebook 1366×768 (keyboard + trackpad)
- **Live URL**: https://oaks3000.github.io/calculating-glory/ — auto-deploys on every push to main via GitHub Actions
- Repo is **public** (required for GitHub Pages free tier); plan to migrate to Railway or similar when multiplayer/auth is needed
- Dev server: `npm run dev --workspace=@calculating-glory/frontend`
- Domain tests: `cd packages/domain && npm test` (run from worktree domain, not main project)
- Frontend tests: `cd packages/frontend && npx vitest run`
- Domain dist: worktree node_modules symlinks to worktree's own packages/domain — rebuild from worktree: `packages/domain && npm run build`
- **Design principle confirmed**: promotion/relegation does NOT affect player stats — ability follows PlayerCurve only; promotion means competing in a harder league, not a stat boost
- **Balance pass deferred** — punted to back of queue; observe passively during normal play-throughs
