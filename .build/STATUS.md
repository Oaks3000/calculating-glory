---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Phase 8 — Polish"
progress: 99
lastUpdated: "2026-04-03"
lastTouched: "2026-04-03"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Phase 8 — Polish (99% complete)
**Last Updated:** 2026-04-03

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

**Phase 6 Educational Depth — COMPLETE (PRs #72–#76)**
- Two-axis decoupling: football division vs curriculum level fully independent
- Year group picker, 60-question bank, adaptive curriculum advancement

**Phase 7 — Practice Mode + Owner's Box + Financial Alerts — COMPLETE (PRs #77–#79)**
- Practice HubTile, Owner's Box commentary, Val financial threshold messages

**Phase 8 — Polish (PRs #80, #82, #88–#94)**

*PR #80 — Morale & Groundskeeper (merged):*
- Morale news ticker milestone messages
- Groundskeeper's Drill: geometry challenges from Stadium View

*PR #82/88 — Polish batch 1+2 (merged):*
- Intro spotlight system with per-NPC section reveals
- Club identity: naming flow, stadium name, [TEAM] placeholders
- Transfer market drama: negotiation friction, formation boxes
- Season arc: memorable moments, club identity system
- News ticker slowdown, potential rating fix

*PR #89 — Owner's Box polish (merged):*
- Physics-based message animations (bump, goal bump, opponent bump)
- No-duplicate commentary lines
- Dani facility observations during match

*PR #93 — UX fixes (merged):*
- Contract label simplified: "Contract: Xw left" with tooltip
- Negotiations auto-close 2.5s after result
- Budget flash animation with +/- delta badge

*PR #94 — NPC depth + Stadium tour (merged):*
- Dani intro stadium tour: 6 steps with facility highlight pulse
- NPC match reactions: 30+ templates, 3 NPCs × 7 scenarios

*#65 — Match pitch visualisation (committed, awaiting PR):*
- Top-down SVG pitch with 22 blips in Owner's Box
- Beat-driven blip state machine (IDLE/BUILD_UP/CHANCE/CELEBRATE/RESET)
- Goal celebration: radial pulse + blip convergence + scoreboard bounce
- Crowd atmosphere glow, prefers-reduced-motion support

*PRs #95–100 (merged 2026-04–03):*
- NPC message system: Kev/Val/Marcus messages wired into Command Centre inbox (PR #96)
- Inbox overflow partial fix: pending decisions capped at 2 in InboxCard preview (PR #97)
- Post-match report screen after Owner's Box (PR #98)
- Phone-screen UI polish for Owner's Box (PR #99)
- Commercial facilities open Val's operations panel from Stadium View (PR #100)

## What's In Progress

- #86 Math challenge difficulty scaling — progressive session difficulty gating
- Balance pass — passive, during play-testing

## What's Next

- #80 Sponsor negotiation — Val presents deals, negotiate via math challenge
- #92 Inbox overflow — fully resolve multi-event stacking (partial fix in PR #97)
- #87 Stadium view — remaining isometric facility panels (commercial done in PR #100)

## Blockers

- None

## Notes

- Target device: Chromebook 1366×768 (keyboard + trackpad)
- **Live URL**: https://oaks3000.github.io/calculating-glory/ — auto-deploys on push to main
- Dev server: `npm run dev --workspace=@calculating-glory/frontend`
- Domain tests: `cd packages/domain && npm test` (478 tests)
- **Design principle**: two-axis model — football division vs curriculum level fully independent
