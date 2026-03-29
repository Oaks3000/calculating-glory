---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Phase 7 — Practice Mode & Polish"
progress: 82
lastUpdated: "2026-03-29"
lastTouched: "2026-03-29"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Phase 6 complete → Phase 7 in progress
**Last Updated:** 2026-03-29

## What's Done

- Full TypeScript monorepo workspace (domain + frontend packages)
- Event sourcing architecture: all event types, reducers, command handlers
- Deterministic match simulation (Poisson, seeded RNG, attack/defence split)
- Season fixtures: circle method round-robin, 24 teams, 46 weeks
- Weekly club events: 15 templates, branching chains, pending resolution
- Business acumen tracking, curriculum progression (5 levels)
- Full Command Centre hub + Stadium View (isometric SVG renderer, 10 facility types)
- Weekly Training Focus, morale system, scout missions, player progression + retirement
- Second season loop, facility construction lag, localStorage persistence
- NPC teams across all 4 divisions (League Two through Premier League)
- NPC strength evolution using previous season table finish
- Menu screen, Financial Health Bar, How-to-Play intro journey
- Owner forced-out cascade + parachute re-entry flow
- Morale event system, inbox cards, morale news ticker

**Phase 6 Educational Depth — COMPLETE (PRs #72, #74, #75, #76)**
- Two-axis decoupling: football division vs curriculum level fully independent
- Year group picker in New Game flow (5 levels)
- 60-question bank across 6 topics; `generateChallenge.ts` rewritten as bank adapter
- `bankTopic` on events — 4 events wired to specific curriculum topics
- Adaptive curriculum advancement: `checkMastery()` → Val Webb gold nudge card → `UPGRADE_CURRICULUM`

**Phase 7 — Practice Mode (PR #77)**
- 🎯 Practice HubTile — dedicated entry point in Command Centre (2×2 grid)
- "Chats" renamed "Negotiations" for clarity
- Practice slide-over: all 6 topics, weakest 3 badged "Recommended", Marcus Webb drill flow

## What's In Progress

- Balance pass — first real play-through (passive observation)

## Blockers

- None

## Notes

- Target device: Chromebook 1366×768 (keyboard + trackpad)
- **Live URL**: https://oaks3000.github.io/calculating-glory/ — auto-deploys on push to main
- Dev server: `npm run dev --workspace=@calculating-glory/frontend`
- Domain tests: `cd packages/domain && npm test`
- **Design principle**: two-axis model — football progression (division) never gates maths level; maths progression (curriculum) never gates football.
