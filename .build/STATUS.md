---
project: "Calculating Glory"
type: "build"
priority: 2
phase: "Phase 13 — Command Centre UX Overhaul"
progress: 30
lastUpdated: "2026-04-12"
lastTouched: "2026-04-12"
status: "in-progress"
---

# Calculating Glory - Current Status

**Phase:** Phase 13 — Command Centre UX Overhaul (30% complete)
**Last Updated:** 2026-04-12

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

*PRs #95–100 (merged 2026-04-03):*
- NPC message system: Kev/Val/Marcus messages wired into Command Centre inbox (PR #96)
- Inbox overflow partial fix: pending decisions capped at 2 in InboxCard preview (PR #97)
- Post-match report screen after Owner's Box (PR #98)
- Phone-screen UI polish for Owner's Box (PR #99)
- Commercial facilities open Val's operations panel from Stadium View (PR #100)

*PR #102 — Polish batch 3 (merged 2026-04-03):*
- #86 Progressive session difficulty: D1→D2→D3 unlock gating + D{n} card label
- #85 NPC cast depth: Kev streak/zone reactions, Marcus commercial obs, 5 new template pools
- #84 Club identity: `[CLUB]`/`[STADIUM]` across all NPC template pools; TS6 tsconfig fix
- #83 Season arc ticker headlines: streaks, unbeaten runs, zone banners; leagueEntries bug fix
- #82 Transfer friction: "hold firm" rejection risk (0/1/2+ rivals), transfer rumours in ticker
- #36 NPC poaching frontend: player snapshot in event metadata, morale pills, BREAKING ticker
- #28 Construction lag visuals: interpolated block height, amber progress bars, ticker events

**PR #123 — Three-pool budget model + housekeeping (merged 2026-04-12):**
- #40/#41 Name audit: all 93 team names and 190+ player names reviewed; `Kevin De Bruyne` → `Kelvin De Bryne`; sutbourne ambiguity resolved → Sutton United
- #59 News ticker speed: confirmed already fixed in PR #88 (147s→206s), closed
- #120 Backroom staff visibility: DataTiles bug fix (showed squad count not staff count), manager section + match impact bar in Backroom Team slide-over
- #61/#110 Three-pool budget model: replaced `transferBudget` + soft `wageBudget` with Transfer Fund (50%), Infrastructure Fund (20%), Wage Reserve (30%)
  - Weekly wages now deducted from Wage Reserve each week; revenue flows in
  - Board bailout: covers shortfall at 10% penalty from Transfer/Infra funds
  - `SET_BUDGET_ALLOCATION` command: redistribute pools during transfer windows only
  - Runway-based validation: 8-week minimum for signings/hiring
  - Budget allocation slider UI: three linked sliders in slide-over, opened from Financial Health Bar
  - Facility upgrades deduct from Infrastructure Fund, not Transfer Fund

**PR #124 — Command Centre UX Overhaul (merged 2026-04-12, PR #129):**
- Persistent sidebar (lg+): Overview / Inbox / Squad / Transfers / Finances / Backroom + Stadium
- Fixed bottom tab bar (mobile) with unresolved-events badge on Inbox
- HeadlineStats strip: Position / Board Confidence / Transfer Budget always above fold
- OverviewSection: inbox-first stack order on mobile, then HeadlineStats → DataTiles → HubTiles → tables
- InboxSection, TransferSection, BackroomSection, SquadSection: full-page wrappers
- FinancesSection: FinancialHealthBar + budget allocation sliders with live ≈Nw runway counter
- CommandCentre refactored: 7 slide-over booleans → 3 (Negotiations, Practice, Learning Progress)
- App.tsx: activeSection state, flex sidebar layout, pb-16 lg:pb-0 for mobile safe area

## What's In Progress

- #111 Progressive disclosure — priority ordering, collapsible sections, new-player ramp
- #119 Chat area rethink — negotiate panel as NPC conversation hub
- #86 Mobile/touch feel

## What's Next

- #80 Sponsor negotiation — Val presents deals, negotiate via maths challenge
- #92 Inbox overflow — fully resolve multi-event stacking (partial fix in PR #97)
- #87 Stadium view — remaining isometric facility panels (Training, Medical, Scout, Youth Academy)

## Blockers

- None

## Notes

- Target device: Chromebook 1366×768 (keyboard + trackpad)
- **Live URL**: https://oaks3000.github.io/calculating-glory/ — auto-deploys on push to main
- Dev server: `npm run dev --workspace=@calculating-glory/frontend`
- Domain tests: `cd packages/domain && npm test` (478 tests)
- **Financial model**: Three budget pools (Transfer 50% / Infrastructure 20% / Wages 30%), real weekly wage deduction, board bailout at 10% penalty, budget allocation locked outside transfer windows
- **Design principle**: two-axis model — football division vs curriculum level fully independent
