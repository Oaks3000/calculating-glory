---
project: "Calculating Glory"
type: "build"
createdAt: "2026-03-03"
lastUpdated: "2026-03-31"
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

### Phase 8: Polish ✅ (PRs #80, #82, #88–#94)
- Intro spotlight system, club identity/naming, stadium name
- Transfer market drama, formation view, season arc moments
- Owner's Box physics animations, no-duplicate commentary
- Dani facility observations, NPC match reactions (Kev/Val/Marcus)
- Dani intro stadium tour with facility highlight pulse
- Contract label UX, auto-exit negotiations, budget flash animation
- Match pitch visualisation: 22-blip SVG, beat-driven state machine, goal celebrations
- Morale news ticker milestones, Groundskeeper's Drill (geometry)

---

## Current Work

### Remaining Polish
- **#91** Season-end experience — final table, awards, promotion/relegation moment
- **#92** Inbox overflow — multiple events stacking on same week
- **#87** Stadium view — isometric facility panels with upgrade action
- **#86** Math challenge difficulty scaling
- **#80** Sponsor negotiation — Val presents deals, maths challenge

### Phase 7 Visual Upgrade (SC2K)
- **#66** Construction animations — hazard dashes, jostle, dust particles
- **#65** Match pitch done ✅; remaining: seeded blip movement, crowd-flash on Stands, isometric migration
- 3-tone SC2K tile shading, per-facility micro-animations
- See BACKLOG.md Phase 7 section for full spec

---

## Future Phases

### Gameplay Depth
- #70 Formation tactics — player chooses formation and style
- #71 Transfer windows — summer/January with deadline-day drama
- #72 Dynamic sponsors — scale with league position and reputation
- #73 Local derbies — special atmosphere and crowd boost
- #74 Rival managers — named AI personalities
- #75 Board objectives — start-of-season targets
- #76 Morale system expansion
- #77 Youth academy — promote youth players
- #78 Player development — training affects individual growth
- #79 Scout report deep-dive — profile cards with strengths/weaknesses

### Technical & Accessibility
- #67 Chromebook performance audit (target 60fps, <500KB bundle)
- #68 Accessibility audit — keyboard nav, screen reader, reduced-motion
- #69 Save/load system — multiple save slots

### Educational
- Adaptive difficulty wired to live evidence (not just curriculum level)
- Hint system with curriculum-appropriate scaffolding
- Teacher dashboard — class view of student progress

## Out of Scope (for now)

- Real-time multiplayer
- Custom team/player creation
- Save/load to server (localStorage only)
