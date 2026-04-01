# Club Event Chains — Core Specification

This document covers design principles, the maths answer entry mechanic, the chain overview, curriculum coverage, implementation notes, and scaling architecture. Individual chain specs live in sibling files (`chain-01-*.md` through `chain-10-*.md`).

---

## Design Principles

### 1. Maths is the language of decisions, not a discount coupon
The old model: three options where option C is "do maths, get a better deal." The new model: every significant decision requires mathematical reasoning to make well. The maths isn't a gate to a reward — it's how the player understands what's happening. NPCs give you numbers; you have to do the working to know what they mean.

### 2. Answer entry is mandatory
Players must enter numerical answers at maths integration points. They can't just pick the "wise-looking" option. This serves two purposes:
- **Accountability:** The player actually does the maths, not just pattern-matches to the best-sounding choice.
- **Consequence of weak maths:** Wrong answers don't block progress — they degrade the quality of the decision. You proceed, but with incomplete information or a worse deal. The game doesn't punish wrong maths with a fail screen; it punishes it with a worse outcome that the player feels in their budget and runway.

### 3. Every chain routes through NPCs
No event is narrated by the system. Every piece of information, every warning, every opportunity comes from Val, Marcus, Dani, or Kev. The player hears voices, not notifications.

### 4. Chains cast shadows
Every chain creates consequences that ripple forward — into future weeks, into match day, into the Financial Health Bar, into board meetings. The player should be able to trace back from "why is my budget red?" to a decision they made weeks ago.

### 5. Curriculum breadth across chains
Different chains exercise different areas of Year 7 maths. The system is designed so that across a full season, the player encounters arithmetic, percentages, ratio, probability, basic algebra, and data interpretation. The architecture supports swapping in harder variants for Years 8-11 without changing the narrative structure.

---

## Maths Answer Entry — Mechanic

When a maths integration point fires within an event, the flow is:

1. **NPC presents the situation** with numbers embedded in the narrative
2. **A maths challenge card appears** with a specific question and an answer input field
3. **The player enters their answer** (numerical, typed)
4. **The game evaluates the answer:**
   - **Correct (or within tolerance):** Full information unlocked. The player sees the complete picture and can make the best decision. NPC reacts positively ("That's what I got too" — Val; "See, the numbers work!" — Marcus).
   - **Close but wrong:** Partial information. The player gets a hint ("Not quite — you're in the right area. Try thinking about it as a percentage." — Val). One retry offered.
   - **Wrong:** The player proceeds but with degraded information. They make the decision without fully understanding the numbers. The NPC signals this ("I'm not sure about that, but it's your call" — Val). The consequence of the bad maths plays out over subsequent hops — e.g., they think the deal is profitable but it actually isn't, and this surfaces 2-3 weeks later.

**No fail state.** The player always continues. The maths quality affects the *outcome quality*, not whether you can play. This is critical for engagement — kids who struggle with maths shouldn't hit a wall; they should experience the consequence of guessing (worse deals, unexpected costs) which motivates them to improve.

**Difficulty scaling:** The same narrative node can present different maths depending on the player's curriculum level. The question changes; the story doesn't. Architecture must support this from day one even if only Year 7 variants are authored initially.

---

## Chain Overview

All 10 chains are Season 1 / League Two content.

| # | Chain name | Depth | Primary NPC | Domain | Key maths topics |
|---|-----------|-------|-------------|--------|-----------------|
| 1 | The Catering Crisis | 5 hops | Dani | Facility / commercial | Percentages, unit costs, break-even, profit margins |
| 2 | The Sponsor Saga | 5 hops | Marcus | Commercial / financial | Revenue projection, percentages, compound effects, ratio |
| 3 | The Infrastructure Gamble | 5 hops | Dani / Val | Facility / financial | Area & perimeter, cost estimation, probability, scheduling |
| 4 | The Investor | 4 hops | Marcus / Val | Financial / governance | Large number arithmetic, percentages, proportion, negotiation |
| 5 | The Wage Rebellion | 3 hops | Val / Kev | Staff / financial | Percentage increase, budget modelling, averages |
| 6 | The Youth Prospect | 3 hops | Kev | Player / development | Probability, data interpretation, ratio |
| 7 | The Poaching War | 3 hops | Kev / Val | Player / financial | Valuation, comparison, percentage |
| 8 | The Storm | 2 hops | Dani / Val | Operational / financial | Percentage decrease, estimation, data interpretation |
| 9 | The Tax Puzzle | 2 hops | Val | Financial | Multi-step arithmetic, percentages, fractions |
| 10 | The Community Pitch | 2 hops | Marcus / Dani | Opportunity / operational | Area, ratio, revenue projection |

**Total chain hops:** 34 nodes across 10 chains. Each node requires NPC dialogue, a decision point, and (for most) a maths integration point. Plus the maths variants for difficulty scaling.

---

## Curriculum Coverage Map

| Maths topic | Chains that exercise it |
|-------------|------------------------|
| Basic arithmetic (×, ÷, +, −) | All chains |
| Percentages | 1, 2, 4, 5, 7, 8, 9 |
| Ratio & proportion | 2, 6, 10 |
| Probability & expected value | 3, 6, 7 |
| Area & perimeter | 3, 10 |
| Data interpretation (tables/charts) | 2, 5, 6 |
| Break-even analysis | 1, 2, 3 |
| Multi-step problems | 1, 3, 4, 8, 9 |
| Fractions & decimals | 8, 9 |
| Estimation & rounding | 3, 8 |
| Cost modelling / budgeting | All chains |
| Compound effects | 5 |

**Year 7 gaps to fill in future iterations:** Algebra (expressions, solving equations), geometry beyond area (angles, properties of shapes, transformations), statistics (mean/median/mode applied to player/team data), and sequences/patterns. These can be woven into existing chains at higher difficulty tiers or into new chains for Years 8-11.

---

## Implementation Notes

### Event system architecture changes
The current `ClubEventTemplate` structure needs extending to support:
- **`npc` field** — which NPC delivers the event
- **`mathsChallenge` field** — structured maths challenge with question, expected answer, tolerance, hints, and difficulty tier
- **`conditionalMessages`** — NPC messages that only fire if certain game state conditions are met (facility level, sponsor deals, Financial Health Bar state)
- **`chainId` + `hopNumber`** — explicit chain tracking for multi-hop events
- **`delayWeeks`** — configurable delay between hops (currently hardcoded in prerequisite logic)
- **`outcomeModifiers`** — how maths accuracy affects the outcome (correct = full information, wrong = degraded information)

### Template authoring
Each hop needs:
1. NPC dialogue (primary + supporting NPCs)
2. Maths challenge (question, answer, tolerance, hint text, difficulty variants)
3. Choice definitions (with budget/reputation/performance effects that vary based on maths accuracy)
4. Conditional content (what changes based on game state)

This is a significant content authoring task — estimated 34 nodes × ~500 words of NPC dialogue each + maths challenge definitions. Worth treating as a dedicated writing sprint.

### Triggering and pacing
With 10 chains of varying depth, the event scheduler needs to manage:
- **No more than 2 active chains simultaneously** (to avoid overwhelming the player)
- **At least 1 chain active at all times after week 5** (to avoid dead stretches)
- **Chain hops respect minimum gap** (2-3 weeks between hops to let consequences breathe)
- **Chain triggers respect game state** (The Investor doesn't fire if budget is red; The Storm doesn't fire in summer)
- **Flagship chains (5-hop) start in the first third of the season** to ensure they can complete before season end

---

## Scaling Architecture — Multi-Season & Multi-League

The 10 chains above are **Season 1, League Two content.** The system must support expansion across multiple seasons and league tiers without architectural changes.

### 1. Chain Tiers (by league)

Each league has its own chain pool. When the player promotes, new chains unlock and existing chains scale up.

| League | Chain pool | Scale | Maths difficulty |
|--------|-----------|-------|-----------------|
| League Two | 10 base chains (this doc) | Local businesses, small budgets, thousands of pounds | Year 7 |
| League One | 10 base + 6 new chains | Regional brands, tens of thousands, more complex deals | Year 8 |
| Championship | 10 base + 6 + 6 new chains | National sponsors, hundreds of thousands, multi-party negotiations | Year 9–10 |
| Premier League | 10 base + 6 + 6 + 8 new chains | Global brands, millions, regulatory/media complexity | Year 10–11 |

**Base chains scale, not duplicate.** The Sponsor Saga in League Two is a local car dealership at £800/month. In League One, the same chain skeleton fires but with a regional brand at £5,000/month, performance clauses, and media rights considerations. The NPC voices stay the same; the narrative specifics and numbers change. This is implemented via a `leagueTier` field on the chain content — the engine picks the tier-appropriate variant at trigger time.

**New chains per tier are league-specific narratives.** Things that only make sense at higher levels: media rights negotiations (Championship+), UEFA coefficient considerations (PL), academy recruitment compliance (League One+), FFP constraints (Championship+).

### 2. Seasonal Variants

Each chain has **3 seasonal variants** — different specific circumstances, NPCs, numbers, and maths challenges wrapped around the same structural skeleton.

Example — The Storm (Chain 8):
- **Variant A:** Winter storm, attendance drop, pitch damage.
- **Variant B:** Summer heatwave, pitch unplayable, rescheduling decision.
- **Variant C:** Flooding, car park underwater, access route blocked — operational logistics chain.

With 3 variants × 10 chains = **30 distinct chain experiences in League Two alone.** Across a typical 3-season League Two career before promotion, the player might see 18-24 chain instances — very unlikely to repeat.

### 3. History-Dependent Chains

Some chains should only fire once the player has history — decisions from previous seasons creating new narrative opportunities.

**Season 2+ triggers:**
- **The Returning Hero:** A player you sold in a previous season wants to come back. Valuation maths based on how they've developed away. (Requires: player sale in a prior season.)
- **The Legacy Sponsor:** A sponsor from a previous deal approaches with a bigger, multi-season proposal. The terms reference your previous relationship. (Requires: completed Sponsor Saga in a prior season.)
- **The Expansion Question:** The board asks whether to invest in expanding the stadium or improving what you have. A strategic fork that shapes the next 2 seasons. (Requires: season 2+, facilities above a threshold.)
- **The Rival's Collapse:** A league rival goes into administration. Their players are available cheaply, but there are ethical questions and salary cap implications. (Requires: season 2+.)

These are narratively richer because they reference the player's own story. "Remember when you sold Martinez? He's back, and he's better."

### 4. Curriculum Tier Integration

| Year group | Target league tier | New maths topics introduced |
|-----------|-------------------|---------------------------|
| Year 7 | League Two | Arithmetic, percentages, area/perimeter, basic probability, ratio, data reading |
| Year 8 | League One | Algebra (expressions, solving), sequences, better statistics (mean/median), scale/proportion |
| Year 9 | Championship | Compound interest, simultaneous considerations, trigonometry hooks (stadium geometry), probability trees |
| Year 10–11 | Premier League | Algebraic modelling, statistical analysis, financial maths (depreciation, amortisation), optimisation |

The chain narrative skeleton stays the same across tiers. The maths challenge at each hop swaps out for the age-appropriate variant. This is why the `mathsChallenge` field must support **difficulty tiers** — each node carries Year 7, 8, 9, and 10-11 variants of the same contextual question.

### 5. Content Pipeline

- **Chain template format** must be clean, well-documented, and authorable without developer involvement. A content author (teacher, writer) should be able to create a new chain by filling in a structured template — NPC assignments, dialogue, maths challenges, branching logic — without touching the game engine.
- **Chain validation tooling** — automated checks that a chain's maths challenges have correct answers, all branches resolve, budget effects are within sane ranges, and NPC assignments are consistent.
- **Playtesting framework** — ability to trigger any chain at any hop for isolated testing, without playing through a full season to reach it.

### 6. Chain Inventory Target

| Phase | Chains available | Chain instances per season (est.) | Unique experiences before repeat |
|-------|-----------------|----------------------------------|--------------------------------|
| Launch (League Two only) | 10 chains × 3 variants = 30 | ~8-12 per season | 2-3 seasons before noticeable repetition |
| League One expansion | +6 chains × 3 variants = 48 cumulative | ~10-14 per season | 3-4 seasons per league |
| Championship expansion | +6 chains × 3 variants = 66 cumulative | ~10-14 per season | 3-4 seasons per league |
| Premier League expansion | +8 chains × 3 variants = 90 cumulative | ~12-16 per season | 4+ seasons per league |
| + History-dependent chains | +10-15 across all tiers | Varies | Effectively unlimited variation |

At full build-out: **90+ chain variants plus history-dependent content.** A player completing a full career from League Two to Premier League (8-12 seasons) would encounter 80-140 chain instances with minimal repetition.
