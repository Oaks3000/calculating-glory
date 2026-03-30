---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Phase 8 — Polish"
progress: 96
lastUpdated: "2026-03-30"
lastTouched: "2026-03-30"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Phase 8 — Polish (96% complete)
**Last Updated:** 2026-03-30

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

**Phase 8 — Polish (PR #80 + nifty-ride worktree)**

*PR #80 — Morale & Groundskeeper (merged):*
- Morale news ticker milestone messages: W3, W5, L3, L5 streaks + morale high/low thresholds
- `MORALE_TICKER_EVENT` fires once per crossing; `lastFormMilestone` on GameState
- Groundskeeper's Drill: geometry challenges from Stadium View plot clicks
- `AREA_AND_PERIMETER` + `ANGLES` questions tagged `bankTopic: 'geometry'`
- Architecture futureproofing for CIRCLES + VOLUME_AND_SURFACE_AREA (GCSE Higher)
- `DiagramLibrary` + `diagram?` field threaded through QuestionTemplate → MathChallenge

*pensive-kapitsa worktree — issue #81 (open, not yet PR'd):*
- **Pre-match screen**: full-screen overlay between "Advance to Week" and Owner's Box; shows home/away team cards with league position + last-5 form strip; "Kick Off" CTA
- **Post-match screen**: result banner (Victory/Draw/Defeat) with colour treatment (green/amber/red); final score; morale milestone if one fired that week; NPC reaction (Val on wins+losses, Marcus on draws)
- **Three-phase matchday flow**: `MatchdayState` in App.tsx tracks `pre-match → live → post-match`; Owner's Box `onComplete` now transitions to post-match instead of dismissing directly
- New components: `PreMatchScreen.tsx`, `PostMatchScreen.tsx` in `components/matchday/`

*nifty-ride worktree (open, not yet PR'd):*
- **Intro spotlight**: each NPC beat reveals its corresponding CC section at full brightness; all others dimmed via per-section overlay divs (CSS opacity transition, not global filter)
- **Single-message intro**: one card at a time, bottom-anchored — never covers the spotlighted section
- **Club identity**: `[TEAM]` placeholder in Kev commentary (kickoff, goal reaction/aftermath, full-time win)
- **Stadium name**: derived from club name at game start; `GameStartedEvent.stadiumName?` optional for backward compat
- **Club + stadium naming flow**: "Name your club" step in new game setup; stadium auto-suggests, fully editable; names thread through to all NPCs and commentary

## What's In Progress

- nifty-ride worktree — polish batch 1, ready to PR
- pensive-kapitsa worktree — issue #81 (matchday event flow), ready to PR
- Open polish issues: #82 (transfers), #83 (season arc), #85 (NPC cast), #86 (mobile)
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
