---
project: "Calculating Glory"
type: "build"
createdAt: "2026-03-03"
lastUpdated: "2026-04-12"
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

### Phase 10: Transfer Loop + Consequence Layer ✅ (PRs #125, this session)
- Formation pitch grid in transfer market (#57)
- Sell-with-jeopardy flow — list + offer + negotiation (#58)
- Squad selection screen rethink (#56)
- Player attributes fully wired into match sim, revenue, and morale (#30) — closed
- Three new forced-out triggers: reputation collapse, relegation spiral, board ultimatum (#34)
- Board ultimatum blocking modal with deadline enforcement

---

## Current Work

### Command Centre & Navigation
- **#124** Command Centre UX/UI overhaul — navigation, discoverability, and playability
- **#111** Command Centre information density — progressive disclosure pattern

### NPC & Conversation Layer
- **#119** Chat area rethink — negotiate panel becomes NPC hub, inbox reverts to static updates
- **#113** Freeform NPC chat — LLM-backed conversations with Val/Marcus/Kev/Dani
- **#112** Kev squad review chat — guided squad analysis at season start
- **#109** NPC manager shell personas — distinct personalities managers can inhabit

### Gameplay Systems
- **#29** Manager creation, hiring, and impact on club performance
- **#32** Scout facility — `truePotential` reveal accuracy beyond `publicPotential` baseline
- **#36** NPC poaching — NPC clubs approach players in your squad (depends on #29)
- **#28** Construction lag time + staged build visuals for facility upgrades

### Visual & Match Immersion
- **#65** Phase 7 match immersion — stadium atmosphere, animated play, CM-style goal moments
- **#86** Mobile/touch feel — game must work on phones and tablets

### Polish
- **#84** Club identity — it should feel like YOUR club

---

## Future Phases

### Gameplay Depth
- Transfer windows — summer/January with deadline-day drama
- Dynamic sponsors — scale with league position and reputation
- Local derbies — special atmosphere and crowd boost
- Board objectives — start-of-season targets set at pre-season
- Youth academy — promote youth players
- Player development — individual training affects growth
- Scout report deep-dive — profile cards with strengths/weaknesses

### Technical & Accessibility
- Chromebook performance audit (target 60fps, <500KB bundle)
- Accessibility audit — keyboard nav, screen reader, reduced-motion
- Save/load system — multiple save slots

### Educational
- Adaptive difficulty wired to live evidence (not just curriculum level)
- Hint system with curriculum-appropriate scaffolding
- Teacher dashboard — class view of student progress

## Out of Scope (for now)

- Real-time multiplayer
- Custom team/player creation
- Save/load to server (localStorage only)
