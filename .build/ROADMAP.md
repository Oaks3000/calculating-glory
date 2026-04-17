---
project: "Calculating Glory"
type: "build"
createdAt: "2026-03-03"
lastUpdated: "2026-04-17"
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

### Phase 14: NPC Depth & Transfer Market ✅ (PRs #135–#139)
- **#109** ✅ NPC manager archetype shells — 5 named personas (The Philosopher, The Sergeant, The Youth Developer, The Pragmatist, The Firefighter) with distinct inbox voice and confidence arc (PR #135)
- **#132** ✅ Kev commentary keyed to actual match state — score, momentum and key events drive tone and lines (PR #136)
- **#112** ✅ Kev squad review — structured season-start inbox sequence walking through squad gaps and recruitment priorities (PR #137)
- **#65** ✅ Match pitch visualisation — 22-blip SVG, beat-driven state machine, goal celebrations, crowd atmosphere glow (committed earlier, included here for completeness)
- **Paid transfer market** — NPC-listed players with asking prices; free-agent pool rebalanced to bimodal distribution; full bid/counter/accept flow both ways (PRs #138/#139)

---

## Current Work

### Owner's Office Depth
- **#130** Mobile layout — implement mobile-first layout for Owner's Office (tabbed zones or priority-first fold)
- **#111** Progressive disclosure — priority ordering, collapsible sections, new-player ramp
- **#119** Chat area rethink — negotiate panel becomes NPC conversation hub; inbox reverts to read-only updates
- **#133** State toggle buttons too small (stadium vs dash) — UI discoverability fix

### Gameplay Systems
- **#29** Manager creation, hiring, and impact on club performance (archetype personas shipped in #135; hiring flow + impact mechanics remain)
- **#32** Scout facility — `truePotential` reveal accuracy beyond `publicPotential` baseline

### NPC & Conversation Layer
- **#113** Freeform NPC chat — LLM-backed conversations with Val/Marcus/Kev/Dani (blocked on #119)
- **#134** Management team meetings — NPCs argue, player mediates; design-first

### Visual & Club Identity
- **#127** Visual club identity — badge and colour customisation (now unblocked — #124 shipped)

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
- **#29** Manager creation and impact — formation affinity, man-management, fan approval, sacking costs
- **#134** Management team meetings with mediation

### Freeform NPC Chat
- **#113** LLM-backed NPC conversations — Claude Haiku with game-state context per NPC; Kev as first rollout; scripted fallback for school networks

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
