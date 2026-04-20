---
project: "Calculating Glory"
type: "build"
createdAt: "2026-03-03"
lastUpdated: "2026-04-20"
---

# Calculating Glory - Roadmap

An educational football club management game for Year 7 maths, built on event-sourced domain logic with deterministic simulation. Players manage a League Two club through a season, making decisions that require mathematical problem-solving.

## Completed Phases

### Phase 2: Frontend Foundation ✅
- React + Tailwind frontend, `useGameState()` hook, Command Centre hub, league table, data tiles, news ticker, Social Feed slide-over, math challenge card, week advance button, first playable 3-week loop

### Phase 3: UI Polish & Feature Completion ✅
- InboxCard overhaul, InboxHistory slide-over, seeded news generator, reputation flash animation, Backroom Team slide-over, star player name injection, Learning Progress slide-over, curriculum progression UI

### Phase 4: Stadium View ✅
- 9 facility types, FACILITY_CONFIG, weekly revenue, isometric SVG renderer (20×14 grid, 9 core units, level-scaled blocks), navigation wiring, Weekly Training Focus

### Phase 5: Gameplay Systems ✅ (PRs #33–#48)
- Pre-season flow, transfer market, match sim rewrite, NPC poaching, manager hire
- Club-owned transfers, season end screen, scout network, morale system
- Owner forced-out cascade + parachute re-entry

### Phase 6: Educational Depth ✅ (PRs #72–#76)
- Two-axis decoupling: football division vs curriculum level fully independent
- Year group picker, 60-question bank across 6 topics, adaptive curriculum advancement
- `bankTopic` on events, adaptive mastery checks

### Phase 7: Practice Mode + Owner's Box ✅ (PRs #77–#79)
- Practice HubTile with Marcus Webb drill flow
- Owner's Box: real-time Kev commentary, 22-beat timeline, 8 crowd states, 60+ templates
- Val financial threshold inbox messages

### Phase 8: Polish ✅ (PRs #80, #82, #88–#94, #102)
- Intro spotlight system, club identity/naming, stadium name
- Transfer market drama, formation view, season arc moments
- Owner's Box physics animations, no-duplicate commentary
- Dani facility observations, NPC match reactions (Kev/Val/Marcus)
- Dani intro stadium tour with facility highlight pulse
- Contract label UX, auto-exit negotiations, budget flash animation
- Match pitch visualisation: 22-blip SVG, beat-driven state machine, goal celebrations
- Morale news ticker milestones, Groundskeeper's Drill (geometry)

### Phase 9: Financial Model ✅ (PR #123)
- Three-pool budget: Transfer Fund (50%), Infrastructure Fund (20%), Wage Reserve (30%)
- Real weekly wage deduction from Wage Reserve; revenue flows in
- Board bailout at 10% penalty when Wage Reserve goes negative
- Budget allocation slider UI (linked sliders, transfer-window locked)
- Runway-based validation (8-week minimum for signings/hiring)
- Backroom staff visibility: manager display, match impact bar
- Name audit: all fictional names reviewed and approved

### Phase 10: Transfer Loop UX ✅ (PR #125)
- Formation pitch grid in transfer market — players arranged in positional boxes
- Squad selection screen rethink — formation-first view
- Sell-with-jeopardy — listing + incoming offer + negotiation, not instant sale

### Phase 11: Facilities ✅ (PR #66)
- Construction lag time — upgrades take 2–6 weeks; `FACILITY_UPGRADE_STARTED` / `FACILITY_CONSTRUCTION_COMPLETED` event pair
- Isometric scaffold state during construction (amber dashes, 🏗 icon, countdown)
- NPC league persistence — previous season table with pill toggle from season 2+
- Frontend test suite — 23 tests across FacilityCard and InboxCard

### Phase 12: Consequence Layer + Club Identity + Poaching ✅ (PR #128)
- Four forced-out triggers: financial ruin, reputation collapse, relegation spiral, board ultimatum (#34)
- Board ultimatum blocking modal with deadline enforcement
- NPC poaching overhaul: teamwork-weighted targeting, strength-based club selection, maths-gated negotiate choice, offer-contract retention (#36)
- Club identity (NPC dialogue layer): Kev references records, crowd atmosphere reactions, ticker history headlines (#84)

### Phase 13: Owner's Office — Three-Zone Layout ✅ (PR #131)
- **#124** ✅ Owner's Office — three-zone fixed layout (Decisions & News / Pitch & League / People & Time) replacing sidebar-nav architecture
- CompactLeague: top 3 + player club ±1 with gap separator, full table modal
- Staff panel: Val / Kev / Marcus / Dani with live status dots and chat/practice shortcuts
- Agenda panel: next fixture, transfer window, board ultimatum, construction, contract expiries
- Intro spotlight system remapped to new zone IDs
- **#130** Mobile layout brief raised — candidate approaches defined (tabbed zones, stacked, priority-first fold)

### Phase 14: New-Player Ramp ✅ (PR #140)
- **#111** (partial) ✅ Ambition-first intro cold-open — Kev opens with stakes (promotion/cups/fans); Val reframes money as the enabler. Intro cut from 23 steps to 10; stadium tour and per-NPC introductions dropped
- ✅ NPC colour coding — shared `lib/npcs.ts` (Val emerald, Kev sky, Marcus amber, Dani violet); `NpcMessage` left-border accent + avatar ring + name tint
- ✅ Skip-intro mode — "Meet the team / Skip intro" picker after club setup, persisted in `cg-onboarding-mode-v1`; existing saves default to skip
- ✅ `GuidedTaskCard` on Command Centre — 4 tasks (sponsor / manager / signing / facility upgrade) derived from existing event log; no new domain state
- ✅ Hybrid jargon explainers — `TermInfo` component: first tap opens NPC-voiced full explainer with "goes up when / goes down when" rows, subsequent taps show compact popup. 5 terms wired (Runway, Burn/wk, Budget, Board, Wage reserve); seen state per-term in `cg-glossary-seen-v1`

**Deferred from the ramp plan (follow-ups, tracked in NEXT.md):**
- Progressive disclosure on `OverviewSection` while guided tasks are outstanding
- Gating "Begin Season" on guided task completion (blocked on current pre-season flow not exposing transfers/facilities)
- Extending glossary to Position, Morale, Formation, Free agent, Reputation

---

## Current Work

### Owner's Office Depth
- **#130** Mobile layout — implement mobile-first layout for Owner's Office (tabbed zones or priority-first fold)
- **#111** (remainder) Progressive disclosure + task-gated "Begin Season" — blocked on pre-season flow rework
- **#119** Chat area rethink — negotiate panel becomes NPC conversation hub; inbox reverts to read-only updates

### Gameplay Systems
- **#29** Manager creation, hiring, and impact on club performance
- **#32** Scout facility — `truePotential` reveal accuracy beyond `publicPotential` baseline

### NPC & Conversation Layer
- **#113** Freeform NPC chat — LLM-backed conversations with Val/Marcus/Kev/Dani
- **#112** Kev squad review chat — guided squad analysis at season start
- **#109** NPC manager shell personas — distinct personalities managers can inhabit

### Visual & Match Immersion
- **#65** Phase 7 match immersion — stadium atmosphere, animated play, CM-style goal moments
- **#127** Visual club identity — badge and colour customisation

---

## Backlog

### Squad & Transfer Depth
- Transfer windows — summer/January with deadline-day drama
- Dynamic sponsors — scale with league position and reputation
- Local derbies — special atmosphere and crowd boost
- Board objectives — start-of-season targets set at pre-season
- Youth academy — promote youth players
- Player development — individual training affects growth

### Manager & NPC Depth
- **#109** NPC manager shells — 5–8 named archetypes (The Philosopher, The Sergeant, etc.) with distinct inbox voices
- **#112** Kev squad review chat — scripted week-1 walkthrough of squad gaps and recruitment priorities
- **#29** Manager creation and impact — formation affinity, man-management, fan approval, sacking costs

### Freeform NPC Chat
- **#113** LLM-backed NPC conversations — Claude Haiku with game-state context per NPC; Kev as first rollout; scripted fallback for school networks

### Match & Stadium Immersion
- **#65** Phase 7 match immersion — stadium atmosphere, animated blip movement, CM-style goal moments; SC2K tile shading and micro-animations

### Technical & Accessibility
- Chromebook performance audit (target 60fps, <500KB bundle)
- Accessibility audit — keyboard nav, screen reader, reduced-motion
- Save/load system — multiple save slots

### Educational
- Adaptive difficulty wired to live evidence (not just curriculum level)
- Hint system with curriculum-appropriate scaffolding
- Teacher dashboard — class view of student progress

---

## Out of Scope (for now)

- Real-time multiplayer
- Custom team/player creation
- Save/load to server (localStorage only)
