---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Phase 8 — Polish"
progress: 97
lastUpdated: "2026-03-31"
lastTouched: "2026-03-31"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Phase 8 — Polish (97% complete)
**Last Updated:** 2026-03-31

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

**Phase 7 — Practice Mode + Owner's Box + Financial Alerts — COMPLETE (PRs #77–#79)**
- 🎯 Practice HubTile with Marcus Webb drill flow, all 6 topics
- Owner's Box: real-time Kev commentary over ~75 real seconds, 8 crowd states, 60+ templates
- Val financial threshold inbox messages: amber/red/critical/recovery bands

**Phase 8 — Polish (PRs #80, #88, #89 — all merged)**

*PR #80 — Morale & Groundskeeper (merged):*
- Morale news ticker milestone messages: W3, W5, L3, L5 streaks + morale high/low thresholds
- `MORALE_TICKER_EVENT` fires once per crossing; `lastFormMilestone` on GameState
- Groundskeeper's Drill: geometry challenges from Stadium View plot clicks
- `AREA_AND_PERIMETER` + `ANGLES` questions tagged `bankTopic: 'geometry'`
- Architecture futureproofing for CIRCLES + VOLUME_AND_SURFACE_AREA (GCSE Higher)
- `DiagramLibrary` + `diagram?` field threaded through QuestionTemplate → MathChallenge

*Also merged in #80: Intro spotlight, single-message intro, club identity ([TEAM] in commentary), club + stadium naming flow*

*PR #89 — Owner's Box polish + Dani observations (merged 2026-03-31):*
- **Owner's Box animations**: removed goal-green styling; physics bump system (fade-in / single bump / quadruple flash for player goals / double bump for opposition goals); tailwind keyframes `msg-bump`, `msg-goal-bump`, `msg-goal-bump-oppo`
- **No-duplicate commentary**: `pick()` tracks `lastPicked`, re-rolls once to prevent identical back-to-back lines
- **Dani facility observations**: wired into weekly sim — rival club observation inbox card every ~6–8 weeks
- **Text polish**: em-dashes → periods/commas throughout NPC dialogue

## What's In Progress

- #85 — NPC cast (Val/Marcus/Kev feel like a real cast)
- #86 — mobile/touch feel
- Balance pass — passive, during play-testing

## Blockers

- None

## Notes

- Target device: Chromebook 1366×768 (keyboard + trackpad)
- **Live URL**: https://oaks3000.github.io/calculating-glory/ — auto-deploys on push to main
- Dev server: `npm run dev --workspace=@calculating-glory/frontend`
- Domain tests: `cd packages/domain && npm test`
- **Design principle**: two-axis model — football division vs curriculum level fully independent
- **Worktree rule**: always rebuild domain in worktree, then `cp -r dist/ /main/packages/domain/dist/`
