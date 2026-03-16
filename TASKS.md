# Calculating Glory — Project Task List

> Living document. Update status as work progresses.
> **Legend:** ✅ Done · 🔄 In Progress · ⬜ To Do · 🚫 Out of V1 Scope

---

## Phase 0 — Foundation (Complete)

- ✅ Domain layer: event-sourced game logic (245/245 tests, 92% coverage)
- ✅ Match simulation (deterministic, seed-based)
- ✅ League table engine (24 teams, promotion/relegation zones)
- ✅ Pending club events system (11 events + 4 branching follow-ups)
- ✅ Business Acumen tracking via `RECORD_MATH_ATTEMPT`
- ✅ Curriculum progression (topic tracking, difficulty levels)
- ✅ React + Vite + Tailwind frontend scaffold
- ✅ Week simulation loop (`SIMULATE_WEEK` command)

---

## Phase 1 — Command Centre MVP (Complete)

- ✅ Command Centre hub layout (squad, data tiles, league table, news ticker)
- ✅ Squad Audit Table (sorted by position/OVR, morale bars)
- ✅ League Table (24 teams, promotion/relegation colouring, form badges)
- ✅ Data Tiles (8 stats with trend arrows)
- ✅ News Ticker (match results + transfer/facility headlines)
- ✅ Week Advance Button (blocked until decisions resolved)
- ✅ Pending Decisions section (renamed from Events, with full cost/benefit pills)
- ✅ Social Feed slide-over (NPC chat + math challenge + keyboard)
- ✅ Isometric Blueprint slide-over (facility card placeholder)
- ✅ Hub tiles for Social + Blueprint

---

## Phase 2 — Social Feed & Math Quality (In Progress)

### Completed
- ✅ **2.1** Context-linked challenge opener — `context` field on each challenge used as the NPC intro message, replacing generic openers
- ✅ **2.2** Expanded 15-question challenge bank, difficulty 1–3 (wage %, win rate, OVR average, PPG, upgrade ROI, sponsor markup, catch-the-leaders, etc.)
- ✅ **2.3** Consequence messaging — correct answers show businessAcumen consequence; wrong after 3 hints shows "study the working" feedback
- ✅ **2.4** Layout rearranged per sketch — ticker at top, squad + data tiles (2-col grid) in top section, 4-column bottom strip (league table · pending decisions · blueprint · social)

### To Do
- ✅ **2.5** **Link math challenges to `requiresMath` pending decisions**
  - ✅ 2.5.1 On SocialFeed open, detect the highest-priority unresolved pending event with a `requiresMath` choice (major events first)
  - ✅ 2.5.2 Generate an event-specific challenge via `generateEventChallenge.ts` — percentage saving (cost scenarios) or percentage increase (income scenarios) using the actual financial stakes
  - ✅ 2.5.3 On correct answer, dispatch `RESOLVE_CLUB_EVENT` with the math choice and show a specific budget consequence banner (e.g. "Budget −£3,000 (best available deal)")
  - ✅ 2.5.4 On 3 failed attempts, show worked solution then offer non-math fallback choices inline in the chat with their effects; footer prompts "↑ Choose an option above"
  - ✅ 2.5.5 After resolution (correct or fallback), revert to the standard challenge bank for subsequent questions

- ✅ **2.6** **Adaptive topic selection** — weight the challenge pool toward weaker areas
  - ✅ 2.6.1 `generateChallenge` accepts an optional `TopicPerformance` parameter (exported type)
  - ✅ 2.6.2 When no performance data exists (all zeros), falls back to plain index cycling — no change to first-session behaviour
  - ✅ 2.6.3 With data: weight = `max(20, 100 − accuracy)` — weaker topics surface more often; min weight of 20 keeps all topics reachable
  - ✅ 2.6.4 Mastered topics (≥ 80%): D2/D3 variants get ×1.5 weight, D1 gets ×0.3 — harder questions served automatically
  - ✅ 2.6.5 Struggling topics (> 0 attempts, < 40%): D1 gets ×1.5, D3 gets ×0.5 — scaffolds difficulty downward
  - ✅ 2.6.6 `SocialFeed` passes `state.businessAcumen.recentPerformance` to both `generateChallenge` call sites (mount + next challenge)

- ⬜ **2.7** **Progressive difficulty gating** — unlock harder tiers through demonstrated mastery
  - 2.7.1 Session starts at D1 only; SocialFeed tracks a local `unlockedDifficulty` state (1, 2, or 3)
  - 2.7.2 D2 unlocks after 3 correct D1 answers in the current session
  - 2.7.3 D3 unlocks after 3 correct D2 answers in the current session
  - 2.7.4 Show a brief unlock moment in the chat: "The board are impressed — tougher challenges incoming" with a difficulty badge update

- ⬜ **2.8** **Challenge card visual polish**
  - 2.8.1 Add a difficulty badge (D1 / D2 / D3) and topic label (e.g. "Percentages") to `MathChallengeCard`
  - 2.8.2 Hint accordion: collapse resolved hints so only the latest is fully expanded
  - 2.8.3 Animate the answer zone on submit (brief green flash on correct, red shake on wrong)
  - 2.8.4 Show the correct answer clearly after 3 failed attempts (currently only shown in explanation text)

- ⬜ **2.9** **Active challenge glow** (per design spec)
  - 2.9.1 When `awaitingAnswer` is true, apply a `neon-data` / `data-blue` glow ring to the `NegotiationKeyboard` input area
  - 2.9.2 Remove glow once answer is submitted

- ⬜ **2.10** **Keyboard / input UX improvements**
  - 2.10.1 Support decimal point input (some answers require 1–2 dp)
  - 2.10.2 Show the expected unit (e.g. `%`, `pts`, `m`) as a fixed suffix label next to the input display
  - 2.10.3 Prevent leading zeros (e.g. "007" → "7") and cap input length at 8 characters
  - 2.10.4 "Clear" button to reset input without backspacing character by character

- ⬜ **2.11** **Business Acumen star animation**
  - 2.11.1 After a correct answer, if a star threshold is crossed in `businessAcumen`, show a brief star-fill animation on the relevant stat tile in the Command Centre
  - 2.11.2 Add a small "★ improved" toast to the Social Feed consequence message when a star level actually increases

- ⬜ **2.12** **NPC personality & variety**
  - 2.12.1 Expand NPC opener pool to 8+ variants with different tones (urgent, casual, proud, under-pressure)
  - 2.12.2 Add a "pre-check offer" prompt before first submit: "Want me to double-check your working before you commit?" — if accepted, reveals hint 1 for free but marks the attempt as "assisted" in acumen tracking
  - 2.12.3 After a session of 3+ challenges, NPC comments on the player's session performance ("That's three in a row — the board will be delighted")

---

## Phase 3 — Transfer Market UI

The biggest missing gameplay pillar. Currently there is no way for the player to browse
available players or initiate signings beyond what the domain supports.

- ⬜ **Transfer Market slide-over / screen** — browsable list of available (non-squad) players
     with position filter, OVR, age, wage, transfer value columns
- ⬜ **Player comparison view** — side-by-side stats for 2–3 players to aid decision-making
- ⬜ **Make Offer flow** — math challenge gates the negotiation (calculate total cost:
     transfer fee + agent fee + wage commitment over contract); correct answer = best deal,
     wrong = overpay
- ⬜ **Player Sale flow** — sell squad players, calculate profit/loss percentage (math challenge)
- ⬜ **January Transfer Window trigger** — domain already supports it; UI needs to surface
     a "Transfer Window Open" banner/state and redirect player to the market

---

## Phase 4 — Staff Hiring UI

- ⬜ **Staff roster screen** — show current staff (roles, salaries, effect on performance)
- ⬜ **Available staff list** — coaches, physio, youth scout options with stats/cost
- ⬜ **Hire flow** — math challenge: compare cost vs performance uplift, calculate annual salary
     commitment (`HIRE_STAFF` command already exists in domain)
- ⬜ **Release staff** — calculate redundancy/savings

---

## Phase 5 — Pre-Season Flow

Currently the game boots directly to Week 20. A full V1 needs a start-of-season entry point.

- ⬜ **Club introduction screen** — club name, stadium, board expectations, starting budget
- ⬜ **Pre-season squad audit walkthrough** — guided analysis of the starting 20-player squad;
     highlights positional gaps using maths (e.g. "defence concedes 2.1/game vs avg 1.6 — how
     many extra goals over 46 games?")
- ⬜ **Pre-season transfer window** (5–7 challenges) — integrated with Transfer Market UI above
- ⬜ **Staff & facilities setup** — select starting coaching staff and note facility levels
- ⬜ **Season kickoff** — transitions to Week 1 and the main season loop

---

## Phase 6 — End-of-Season Review

- ⬜ **Final day drama screen** — live updates of simultaneous results as final week simulates
- ⬜ **Season summary screen**: final league position, financial P&L (income vs spend),
     player-of-the-season, top scorer, board verdict
- ⬜ **"What if" analysis** — show 1–2 key decisions and what the outcome would have been with
     a correct/different answer (reinforces maths learning)
- ⬜ **Business Acumen report** — show stars per topic, improvement over the season,
     areas to work on next time
- ⬜ **Replay / New Season prompt** — restart option (V1 = single season, so restart from scratch)

---

## Phase 7 — Onboarding & Tutorial System

> **Note:** Until pre-season onboarding (Phase 5) exists, the game cold-starts at Week 20
> with no context. A player parachuting in has no idea what the Command Centre panels mean,
> why the Social Feed matters, or what they're trying to achieve. The cold-start overlay
> (7.1) is a quick patch for this; the full fix is Phase 5.

- ⬜ **7.1 Cold-start context overlay** — on first visit, a dismissable one-screen overlay
     that briefly labels the three pillars ("Your squad · League table · Pending decisions")
     and states the season goal ("Finish in the top 7 to reach the play-offs"). Skip-able,
     never shown again once dismissed. No code-path changes required — purely presentational.
- ⬜ **7.2 First-launch walkthrough** — brief animated tour of the three pillars (Command
     Centre → Social Feed → Blueprint) with skip option; fires after the cold-start overlay
- ⬜ **7.3 Contextual tutorial cards** — triggered when a player struggles with a concept 2+
     times; brief interactive worked example then immediate practice opportunity
- ⬜ **7.4 Mandatory story-beat tutorials** (per design doc):
     - First contract negotiation → teaches percentage with agent fees
     - Stadium upgrade → capacity, revenue, break-even calculation
     - Sponsorship deal → comparing flat rate vs performance-based deal structures
     - Season financial review → data interpretation from P&L table

---

## Phase 8 — Persistence

- ⬜ **localStorage save/load** — serialise event log to `localStorage` on every dispatch;
     auto-restore on next page load (domain is already event-sourced, so this is
     "save the event array, replay on load")
- ⬜ **New game / reset** — clear localStorage and restart pre-season flow
- ⬜ **Save slot indicator** — show "Auto-saved" confirmation after each week advance

---

## Phase 9 — Polish & Immersion

- ⬜ **Club identity** — club colours, badge placeholder, stadium name surfaced in UI
- ⬜ **Match commentary** — short 2–3 line text summary of the player's own match result
     (goal scorers, key moments) shown after each week advance
- ⬜ **Narrative NPC voices** — Agent Rodriguez, board chairman, club captain — each with a
     distinct tone in pending events and social feed
- ⬜ **Business Acumen unlock system** — mastering a topic (e.g. percentages ≥ 80% accuracy)
     unlocks a visible in-game capability badge ("Advanced Contract Negotiations unlocked")
- ⬜ **Fan sentiment indicator** — simple fans-happy/unhappy state shown in Command Centre
     based on recent results + board confidence

---

## Phase 10 — Viewport & Accessibility

- ⬜ **Chromebook 1366×768 test pass** — verify layout at target device resolution; adjust
     font sizes, tile widths, table columns to fit without horizontal scroll
- ⬜ **Keyboard navigation** — ensure all interactive elements are reachable and operable
     via Tab + Enter (Chromebook users)
- ⬜ **aria-labels on data tables** — Squad Audit Table and League Table need screen-reader
     labels per design spec
- ⬜ **Reduced-motion support** — ticker and pulse-glow animations should respect
     `prefers-reduced-motion`

---

## Phase 11 — Teacher Dashboard

- ⬜ **Class overview page** — list of students, each showing: current week, league position,
     Business Acumen stars per topic, total challenges attempted/correct
- ⬜ **Per-student drill-down** — timeline of decisions made, math attempts, topics struggling
- ⬜ **Export / print report** — PDF or CSV summary for a student or whole class
- ⬜ **Session code / class grouping** — teacher creates a class, students join by code
     (requires minimal backend or localStorage-based class key)

---

## Phase 12 — Isometric Blueprint (Full Visual)

Currently a placeholder (facility cards). The design spec calls for a proper isometric view.

- ⬜ **Isometric tile grid** — 64×32px tile-based stadium layout rendered with CSS transforms
     or Canvas
- ⬜ **Building sprites** — Training Ground, Medical Centre, Youth Academy, Stadium (4 tiers each)
- ⬜ **Click-to-upgrade interaction** — clicking a building opens Blueprint Slide-over with
     ROI math challenge; correct = upgrade confirmed, wrong = overpay warning
- ⬜ **Visual upgrade progression** — buildings visually change as levels increase

---

## Out of V1 Scope

- 🚫 Multiplayer / shared leagues
- 🚫 Multi-season campaign (carry-over progress)
- 🚫 Real club names / licenses
- 🚫 Tactical formations or detailed player attributes
- 🚫 Complex tactical systems

---

## Notes

- All money values in **integer pence** throughout; use `formatMoney()` from domain for display
- Domain is the source of truth — never mutate state directly, always dispatch commands
- Chromebook is the primary target device (1366×768, keyboard + trackpad)
- Design philosophy: **maths is integral to decisions, not bolted on**; wrong answers create
  suboptimal outcomes, not game-over states
