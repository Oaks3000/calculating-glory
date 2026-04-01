# Club Event Chains — Redesign Specification

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

## Chain 1: The Catering Crisis (5 hops)

**Theme:** Food & beverage operations — from crisis to potential empire.
**Primary NPC:** Dani (operations), with Marcus (commercial opportunity) and Val (financial caution).
**Curriculum topics:** Percentages, unit costs, break-even analysis, profit margins, ratio.

### Hop 1: Health Inspector Visit
**Trigger:** Random, weeks 5-15. More likely if Food & Beverage facility is low level.

**Dani:** "Health inspector turned up unannounced. Found hygiene issues with the food kiosks. We've got three options and I need a decision by end of week."

**Choices:**
- **A) Emergency deep clean (£3,000).** Fixes the immediate problem. Inspector satisfied. No further action.
- **B) Full facility upgrade (£12,000).** Expensive, but eliminates the root cause. Unlocks Hop 3 (partnership offer) directly.
- **C) Request a re-inspection in 2 weeks.** Free now, but you have to spend some money on improvements before they return. Dani estimates £1,500 minimum. Leads to Hop 2.

**[MATHS]** If player picks C: "The inspector gave us a score of 2 out of 5. We need a 4 to pass. Each point of improvement costs about £750 in equipment upgrades. What's the minimum we need to spend to reach a 4?"
Answer: 2 points × £750 = £1,500.

**Val weighs in:** "Just so you know — if we fail the re-inspection, the fine is £8,000 plus a mandatory closure for repairs. So this isn't a free option."

### Hop 2: Re-Inspection (fires 2 weeks after Hop 1, only if player picked C)

**Dani:** "Inspector's back today."

**Outcome depends on maths from Hop 1:**
- **Correct maths (spent £1,500+):** Pass. Inspector satisfied. Chain pauses — may lead to Hop 3 later if results are good.
- **Wrong maths (underspent):** Fail. Fine of £8,000 + mandatory closure of food kiosks for 2 weeks (lost revenue). Val: "This is exactly what I warned you about." Leads to Hop 3 anyway (the forced upgrade creates the opportunity).

**[MATHS]** "The closure costs us food revenue for 2 home games. Average food spend per fan is £3.20 and we're averaging 3,400 attendance. What's the total revenue we'll lose?"
Answer: £3.20 × 3,400 × 2 = £21,760.

### Hop 3: The Catering Partnership (fires 3-5 weeks after Hop 1 or 2)

**Marcus:** "So here's the thing — our food situation has got attention. GrubHub Catering want to run our matchday food operation. They'll handle everything — staff, supplies, equipment. We take a 15% cut of all sales."

**Dani:** "Or we run it ourselves. Higher margins but we need to hire, manage stock, deal with waste. I can make it work but it's more effort and more risk."

**Val:** "I've pulled together some numbers for both options. You'll need to work through them."

**Choices:**
- **A) Accept GrubHub partnership** — guaranteed 15% of sales, zero operational cost.
- **B) Run it in-house** — estimated 45% margin but requires £5,000 upfront for equipment and staff hiring. Leads to Hop 4.
- **C) Decline both** — keep current basic food operation.

**[MATHS]** "GrubHub estimates total matchday food sales of £8,500 per home game. We have 23 home games this season. If we take 15%, what's our total income from the partnership? And if we run it ourselves at a 45% margin, what's the income minus the £5,000 setup cost? Which is higher?"
- Partnership: £8,500 × 0.15 × 23 = £29,325
- In-house: (£8,500 × 0.45 × 23) − £5,000 = £87,975 − £5,000 = £82,975
- In-house is dramatically higher — but it depends on the estimates being right. Val will flag this.

**Val:** "Marcus's sales estimates are... optimistic. If actual sales are only 60% of his projection, the in-house numbers change quite a bit. You might want to work that out too."

**[MATHS — bonus/harder]** "At 60% of projected sales (£5,100/game), what's the in-house income minus setup cost?"
Answer: (£5,100 × 0.45 × 23) − £5,000 = £52,785 − £5,000 = £47,785. Still higher than partnership (£5,100 × 0.15 × 23 = £17,595), but the margin of safety is much thinner.

### Hop 4: Supply Chain Shock (fires 3-4 weeks after Hop 3, only if player chose in-house)

**Dani:** "Problem. Our main food supplier just raised prices 22% — something about import costs. Our current unit costs are shot. We either absorb it, find a new supplier, or renegotiate."

**Marcus:** "I know a guy who can supply at the old rate, but minimum order is double what we need per game. We'd have to sell the surplus or waste it."

**Val:** "I need you to recalculate our margins at the new costs before we do anything."

**Choices:**
- **A) Absorb the increase.** Margins shrink. Calculate new margin.
- **B) Marcus's contact — bulk deal.** Lower unit cost but double the volume.
- **C) Renegotiate with current supplier** — Dani sets up the call.

**[MATHS]** "Our unit cost was £1.80. A 22% increase makes it...? And if our average selling price is £4.00, what's our new margin as a percentage?"
- New cost: £1.80 × 1.22 = £2.196 (round to £2.20)
- Margin: (£4.00 − £2.20) / £4.00 = 45% → now about 45%... wait, it was 45% of *sales* before. Let me reframe.

Actually, let me reframe the numbers to make the maths cleaner and the decision harder:
- Old unit cost: £1.60. Old selling price: £4.00. Old margin: £2.40 per item (60%).
- New unit cost after 22% increase: £1.60 × 1.22 = £1.95. New margin: £2.05 per item (51.25%).
- Marcus's bulk deal: £1.45 per unit but must order 800 units per game (normally need 400). At £4.00 selling price, margin is £2.55 per unit (63.75%) on items sold — but 400 units potentially wasted at £1.45 each = £580 waste cost.

**[MATHS]** "If we sell 400 units at £4.00 each with Marcus's supplier at £1.45 per unit, but we have to buy 800 units, what's our actual profit per game?"
- Revenue: 400 × £4.00 = £1,600
- Cost: 800 × £1.45 = £1,160
- Profit: £1,600 − £1,160 = £440

Versus absorbing the increase:
- Revenue: 400 × £4.00 = £1,600
- Cost: 400 × £1.95 = £780
- Profit: £1,600 − £780 = £820

The bulk deal is actually worse unless you can sell more than 400 units. The player who does the maths sees this. The player who doesn't might be swayed by Marcus's "lower unit cost" pitch.

### Hop 5: The Catering Empire (fires 6-8 weeks after Hop 3, only if in-house is profitable)

**Marcus:** "The food operation is working. I've had interest from the council — they want us to cater their community events. Six events over the summer, £2,000 fee per event, we supply food at cost plus margin."

**Val:** "This is outside our core business. We'd need to hire additional casual staff — £800 per event — and transport costs."

**Dani:** "I can make the logistics work. But only if we don't have more than two events in the same week — I don't have the staff bandwidth."

**[MATHS]** "Six events at £2,000 each. Staff cost: £800/event. Food cost estimated at £600/event. Transport: £150/event. What's the total profit across all six events?"
- Revenue: 6 × £2,000 = £12,000
- Costs: 6 × (£800 + £600 + £150) = 6 × £1,550 = £9,300
- Profit: £12,000 − £9,300 = £2,700

**Val:** "£2,700 profit sounds decent. But factor in Dani's time — she'll be stretched thin, which means other operations might slip. This is an opportunity cost question, not just a profit question."

**Decision:** Accept / decline / negotiate for higher fee per event.

The chain resolves. The catering operation either becomes a permanent revenue stream (reflected in weekly facility income) or remains a basic matchday-only operation.

---

## Chain 2: The Sponsor Saga (5 hops)

**Theme:** Commercial partnership — from first approach to multi-faceted deal, with external shocks.
**Primary NPC:** Marcus (opportunity), with Val (risk assessment) and Dani (operational delivery).
**Curriculum topics:** Revenue projection, percentages, compound effects, ratio, data interpretation.

### Hop 1: Initial Approach
**Trigger:** Random, weeks 4-12.

**Marcus:** "Got a call from [local business — seeded from a pool: car dealership, estate agent, building supplies, gym chain]. They want to put their name on the matchday programme and a pitch-side banner. Offering £800/month for a 6-month deal."

**Val:** "Straightforward income. Low risk. I'd take it."

**[MATHS]** "What's the total value of the deal over 6 months?"
Answer: £800 × 6 = £4,800.

**Choices:**
- **A) Accept as offered.** £800/month starts. Leads to Hop 2.
- **B) Counter-offer for more.** "We've got 3,400 average attendance. Our pitch-side visibility is worth more." Leads to negotiation maths, then Hop 2.
- **C) Decline.** No sponsor income. Chain ends (but a different sponsor may approach later).

**[MATHS — if B]** "Marcus thinks we can justify £1,100/month based on comparable League Two deals. But the sponsor's budget ceiling is £1,300/month. If you ask for more than their ceiling, they walk away. What monthly rate should you counter with to maximise income without exceeding their limit?"
This is a judgment call informed by the maths — the player has to decide how aggressive to be. Any answer between £800 and £1,300 is "valid" — higher is better but riskier.

### Hop 2: Expansion Request (fires 4-6 weeks after Hop 1)

**Marcus:** "The sponsor is happy with the exposure. They want to expand — shirt sponsor for the rest of the season. Big money. But they want exclusivity — we can't take any other shirt sponsors."

**Val:** "Exclusivity is a commitment. If a better offer comes along later, we're locked out."

**[MATHS]** Marcus presents the deal: £3,000/month for remaining months of season. Player must calculate total value and compare against potential alternatives Val mentions (a rumoured approach from a bigger company at "maybe £2,200/month but non-exclusive, so we could stack two sponsors").

### Hop 3: The Demand (fires 3-4 weeks after Hop 2, only if exclusivity accepted)

**Marcus:** "Small issue. The sponsor wants to bring a hospitality group to the next home game — 20 people, corporate box, catering. They're framing it as part of the deal but it wasn't in the contract."

**Dani:** "That's going to cost us about £1,200 to host — food, drinks, stewards, setup."

**Choices:**
- **A) Absorb the cost** — keep sponsor happy, costs £1,200.
- **B) Push back** — "This wasn't in the deal." Risk annoying the sponsor.
- **C) Compromise** — host the event but negotiate a smaller uplift to the monthly fee to cover future hospitality asks.

**[MATHS — if C]** "If you expect 3 more hospitality requests this season at ~£1,200 each, what monthly uplift would you need to break even on the additional hosting costs over the remaining [X] months?"

### Hop 4: External Shock (fires 2-3 weeks after Hop 3)

**Marcus:** "Bad news. The sponsor's business has been hit — [seeded reason: supply chain issues / local competitor opened / regulatory change]. They want to renegotiate the monthly fee downward. They're asking for a 30% reduction."

**Val:** "We're contractually entitled to the full amount. But if they go under, we get nothing. Might be worth meeting them halfway."

**[MATHS]** "Current monthly fee is £[X]. A 30% reduction gives them £[?]. Val suggests meeting halfway — what's a 15% reduction? And what's the total income difference over the remaining [Y] months between: (a) holding firm at full rate, (b) accepting 30% cut, (c) compromising at 15%?"

This is where the player encounters the concept of negotiation ranges and expected value — holding firm might get you more per month, but if the sponsor collapses you get zero.

### Hop 5: Resolution (fires 4-6 weeks after Hop 4)

Outcome depends on Hop 4 choice:
- **Held firm:** 50% chance sponsor pays in full (good outcome), 50% chance they default and you lose remaining income entirely. The probability is seeded — the player can't game it, but Val warns them about the risk.
- **Accepted 30% cut:** Sponsor survives. Reduced income but guaranteed.
- **Compromised at 15%:** Sponsor survives. Moderate income. And they offer to renew for next season at the compromised rate — a long-term relationship built on trust.

**Marcus** (if compromise): "They loved how we handled that. They want a two-season extension. Loyalty pays off sometimes."

**Val** (if held firm and sponsor defaulted): "I did warn you. We're now down £[X] for the rest of the season. Let's not make that mistake again."

---

## Chain 3: The Infrastructure Gamble (5 hops)

**Theme:** Major construction project — planning, budgeting, disruption, cost overruns.
**Primary NPC:** Dani (project management), with Val (budget control) and Kev (impact on football).
**Curriculum topics:** Area & perimeter, cost estimation, probability, scheduling, percentages.

### Hop 1: The Proposal
**Trigger:** Player initiates a major facility upgrade (new stand, training ground overhaul, etc.) OR fires randomly when a facility is underlevelled relative to league position.

**Dani:** "I've scoped out the [facility] upgrade. Here's what we're looking at: [X] weeks build time, £[Y] total cost. But I need you to check my numbers before we commit."

**[MATHS]** Geometry-focused: "The new stand extension is 45m × 12m. At £850 per square metre, what's the total construction cost?"
Answer: 45 × 12 = 540 sqm × £850 = £459,000.

**Val:** "That's a big chunk of our budget. I want to see a payment schedule — can we spread it across the build period rather than paying upfront?"

**[MATHS]** "If the build takes 6 weeks and we spread the cost equally, what's the weekly payment?"
Answer: £459,000 ÷ 6 = £76,500/week.

### Hop 2: The Disruption (fires 1-2 weeks into construction)

**Kev:** "Boss, the building work is a nightmare. The noise during training is affecting concentration. The lads are complaining."

**Dani:** "We can schedule construction around training sessions, but it'll add 2 weeks to the build time. Or we push through and accept the disruption."

**[MATHS]** "Extending the build by 2 weeks means 2 extra weeks of weekly construction costs (site maintenance, equipment hire: £4,500/week). What's the total extra cost? And what's the performance impact of disruption — Kev estimates a -3 modifier for the remaining build duration."

The player weighs: £9,000 extra cost vs. match performance impact over the construction period. If they're in a tight league race, the performance hit matters more. If they're comfortable mid-table, saving £9,000 might be wiser.

### Hop 3: Cost Overrun (fires mid-construction)

**Dani:** "We've hit a problem. [Seeded from pool: ground conditions worse than survey showed / materials cost spike / subcontractor went bust]. The project is going to cost an additional [15-25]% over budget."

**Val:** "This is exactly why I build contingency into my projections. How much contingency did we set aside?"

If the player calculated well in Hop 1, they might have budget room. If they were tight, this is a crisis.

**[MATHS]** "The original budget was £[X]. The overrun is [Y]%. What's the new total cost? And given our current budget of £[Z], can we afford to complete?"

**Choices:**
- **A) Fund the overrun from reserves.** Pay extra, project continues on schedule.
- **B) Pause construction.** Save money now but the half-built facility sits there doing nothing (and maintenance costs accumulate).
- **C) Value-engineer.** Reduce the spec to bring costs down — Dani can cut [20]% of the cost but the facility will be lower capacity / fewer features.

### Hop 4: The Knock-On (fires on completion or mid-pause)

If completed: **Marcus** spots a commercial opportunity. "The new [facility] is getting attention. I've had enquiries about hiring it out on non-match days — conferences, events, five-a-side bookings." Revenue projection maths.

If paused: **Kev** complains. "The half-built stand is an eyesore. The fans are asking questions. And the lack of [facility benefit] is hurting us on the pitch." Pressure to resume or abandon.

If value-engineered: **Dani** flags a consequence. "The reduced-spec [facility] works, but it won't support a further upgrade later without starting from scratch. We've locked ourselves into a ceiling."

**[MATHS]** Varies by path — revenue projection for hire-out, cost-of-delay for pause, or long-term value comparison for reduced spec.

### Hop 5: The Legacy (fires 6-8 weeks after completion)

The facility is operational. Its impact plays out:
- Revenue contribution is visible in Val's weekly summaries
- Kev references it in match prep ("the new training ground is showing in the results")
- Board meeting factors it into confidence score
- Marcus uses it in future sponsor pitches ("we've got facilities that rival League One clubs")

**Val:** "The [facility] has generated £[X] in the [Y] weeks since it opened. At this rate, it'll pay for itself in [Z] weeks."

**[MATHS]** "Total cost was £[X]. Weekly revenue contribution is £[Y]. How many weeks to break even? And will that happen before the end of the season?"

This is the payoff — the player sees the long-term return on a decision they made 15-20 weeks earlier. The shadow of the original choice is visible in the numbers.

---

## Chain 4: The Investor (4 hops)

**Theme:** External money with strings attached — governance, control, and the price of growth.
**Primary NPC:** Marcus (brings the opportunity), Val (risk/terms), with board dynamics.
**Curriculum topics:** Large number arithmetic, percentages, proportion, negotiation maths.

### Hop 1: The Approach
**Trigger:** Random, weeks 8-20. More likely if club is performing well.

**Marcus:** "I've been approached by [investor name — seeded]. They want to put £50,000 into the club. But they want a seat on the board and 15% of future transfer profits."

**Val:** "Free money doesn't exist. Let's look at what that 15% actually costs us over a season."

**[MATHS]** "If we make £80,000 in transfer sales this season, what's 15% of that? What if we have a great year and make £150,000?"

**Choices:**
- **A) Accept terms as offered.** £50,000 cash injection, 15% transfer profit share. Leads to Hop 2.
- **B) Counter-offer.** Negotiate the percentage down. **[MATHS]** "What percentage would make the deal work if you want to keep at least £70,000 of £80,000 in projected transfer sales?"
- **C) Decline.** No investor. Chain ends.

### Hop 2: The Honeymoon (fires 3-4 weeks after Hop 1)

Investor is happy. Money is in the account. They make a suggestion:

**Marcus:** "The investor thinks we should spend £20,000 on a marquee signing — someone who'll get fans through the gate and raise the club's profile."

**Kev:** "I've got a target in mind. But £20,000 is a lot for one player at our level."

**Val:** "If gate receipts go up even 10% because of the signing, it pays for itself in [X] weeks. But that's a big if."

**[MATHS]** "Current average gate revenue: £4,100/game. A 10% increase is £[?] per game. Over [X] remaining home games, total extra revenue is £[?]. How long to recoup £20,000?"

### Hop 3: The Power Play (fires 4-6 weeks after Hop 2)

**Marcus:** "The investor is... getting more involved than we'd like. They want veto power over transfers above £5,000. They're also questioning the facility spend."

**Val:** "This is a governance issue. If we push back, they might reduce their financial commitment. If we give in, we lose operational control."

**Choices:**
- **A) Concede control.** Investor happy, but future decisions require their approval (gameplay constraint — some choices become unavailable or delayed).
- **B) Push back.** Investor threatens to pull funding. **[MATHS]** "If the investor withdraws their remaining committed funds of £[X], and our current runway is [Y] weeks, what does runway drop to?"
- **C) Negotiate boundaries.** Formal agreement on decision rights. **[MATHS]** "Propose a threshold: investor approves transfers above £[X] but you have autonomy below. What threshold balances their 15% stake against your operational needs?"

### Hop 4: Resolution (fires 3-4 weeks after Hop 3)

Outcome depends on path:
- **Conceded:** Investor is embedded. Budget is healthier but some decisions are constrained. Board meeting reflects "investor relations: stable but controlling."
- **Pushed back:** Investor partially withdraws. Less money but full autonomy. Val: "We're lighter in the budget but at least every decision is ours."
- **Negotiated:** Balanced outcome. Investor stays, boundaries are clear, relationship is professional. Marcus: "That's how you handle a stakeholder. Well played."

---

## Chain 5: The Wage Rebellion (3 hops)

**Theme:** Squad wage pressure — balancing financial sustainability with squad harmony.
**Primary NPC:** Val (budget impact), Kev (squad morale).
**Curriculum topics:** Percentage increase, budget modelling, averages, cumulative effects.

### Hop 1: The Demand
**Trigger:** After 3+ consecutive wins, or after a strong cup run. Success breeds expectation.

**Kev:** "The lads want to talk wages. They've been brilliant lately and they know players at other clubs on more money. Three of them have come to me asking for increases."

**Val:** "Current weekly wage bill: £[X]. They're asking for an average 12% increase. I need you to work out what that means for the budget."

**[MATHS]** "Weekly wage bill is £1,800. A 12% increase across the board costs £[?] per week. Over the remaining [X] weeks of the season, that's £[?] total."

**Choices:**
- **A) Grant the increase.** Budget impact hits. Morale boosts. Leads to Hop 3 (wage expectations set high for future negotiations).
- **B) Refuse.** Morale drops. Risk of player unrest. Leads to Hop 2.
- **C) Selective raises.** Only reward the top performers. **[MATHS]** "The three players asking earn £320, £280, and £250/week respectively. A 12% raise for just these three costs £[?]/week. What's the total season cost vs the full squad increase?"

### Hop 2: The Fallout (fires 2-3 weeks after refusal)

**Kev:** "Told you this would happen. [Player name]'s handing in a transfer request. And two others aren't training properly — morale is through the floor."

**Val:** "Losing [player name] would save us £[X]/week in wages, but we'd need to replace them. Replacement cost estimate: £[Y] fee plus wages."

**[MATHS]** "Is it cheaper to give the raise or to sell [player] and buy a replacement?" Full cost comparison.

### Hop 3: The Precedent (fires 6-8 weeks after Hop 1, only if raises were granted)

**Val:** "Remember those wage increases? Two more players have now come asking for the same. And I've heard the coaching staff are expecting a review too. This is the precedent problem — every raise raises expectations."

**[MATHS]** "If every wage demand is met at 12%, what's the compounding effect? Current bill × 1.12 × 1.12 (if two rounds of increases hit). What's the new weekly cost? What does that do to runway?"

This teaches compound growth — not just "12% more" but "12% more on top of 12% more."

---

## Chain 6: The Youth Prospect (3 hops)

**Theme:** Long-term player development — invest now, maybe benefit later.
**Primary NPC:** Kev (talent assessment), Val (cost/benefit).
**Curriculum topics:** Probability, data interpretation, ratio, expected value.

### Hop 1: The Discovery
**Trigger:** Random, weeks 6-20. More likely if Youth Academy facility is upgraded.

**Kev:** "The youth coach has found someone special. [Player name], 16 years old. Raw but the potential is there. I want to put them on a development programme."

**Val:** "Development programme costs £500/week for a dedicated coach. That's £[X] over the season. What's the return?"

**Kev:** "Can't guarantee anything. But if they develop, they're either a first-team player worth £[Y] or a sale worth £[Z]."

**[MATHS]** "Kev estimates a 60% chance the player develops successfully. If they do, they're worth approximately £25,000 (sale) or save you £15,000 in transfer fees (keep). If they don't develop (40% chance), you've spent the development cost for nothing. What's the expected value of the investment?"
- Expected value: (0.6 × £25,000) + (0.4 × £0) = £15,000 expected return vs. £500 × [weeks] cost.

### Hop 2: Progress Check (fires 8-10 weeks after Hop 1)

**Kev:** "The kid's coming along. [Data report] — their training scores have improved [X]% over the period. But they've hit a plateau in [specific area]. Extra specialist coaching would cost another £300/week."

**[MATHS]** Data interpretation: the player is shown a simple chart/table of the youth player's training scores over 8 weeks and asked to identify the trend, calculate the improvement rate, and decide if the additional investment is justified.

### Hop 3: The Payoff (fires 8-12 weeks after Hop 2)

Outcome depends on investment level and maths quality:
- **Full investment, good maths:** Player develops. First-team ready or high sale value.
- **Partial investment:** Player develops slowly. Might be ready next season.
- **No investment:** Player stagnates. "What could have been."

---

## Chain 7: The Poaching War (3 hops)

**Theme:** Bigger clubs coming for your best players — defend or cash in?
**Primary NPC:** Kev (emotional, wants to keep the player), Val (pragmatic, sees the money).
**Curriculum topics:** Valuation, comparison, percentage, opportunity cost.

*Note: This integrates with the existing NPC Poaching system (PR #43) but adds NPC voice and deeper maths.*

### Hop 1: The Bid
**Trigger:** Existing poaching trigger (mid-season, targets strong/unsettled players).

**Kev:** "Boss, [bigger club] have come in for [player name]. Offering £[X]. I don't want to lose them — they're key to what we're building."

**Val:** "[Player]'s on £[Y]/week. The transfer fee is [Z] times their annual wage. In market terms, that's [fair/low/generous]. Your call."

**[MATHS]** "The offer is £18,000. The player's weekly wage is £350. What's their annual wage cost? How many years of wages does the transfer fee cover?"
Answer: £350 × 52 = £18,200/year. Fee covers ~1 year. Val: "That's barely a year's wages. I'd push for more."

### Hop 2: The Counter (fires 1 week after Hop 1, if player rejects initial bid)

**Kev:** "They've come back with a revised offer. £[X]. And they've spoken to the player — [player] is interested."

Now there's urgency. The player must factor in morale impact (unhappy player if blocked), squad impact (losing them), and financial impact.

**[MATHS]** "If [player]'s morale drops to unsettled and their performance drops 15%, and they contribute to roughly [X]% of our attacking output, what's the estimated impact on results over the remaining [Y] weeks?"

### Hop 3: Resolution
- **Sold:** Cash injection, squad hole to fill, Kev is frustrated, fans react.
- **Kept (player happy):** Expensive counter-contract, budget hit, but squad intact.
- **Kept (player unhappy):** No cost, but morale contagion kicks in (existing system). Kev: "They're staying but they're not happy. This is going to affect the dressing room."

---

## Chain 8: The Storm (2 hops)

**Theme:** Weather disruption — reactive financial management.
**Primary NPC:** Dani (operational), Val (financial impact).
**Curriculum topics:** Percentage decrease, estimation, data interpretation.

### Hop 1: The Forecast
**Trigger:** Random, match weeks. More likely in winter (weeks 15-30).

**Dani:** "Storm forecast for Saturday. Met Office says severe. We're going to see a big attendance drop."

**Val:** "Normal attendance: [X]. Storm games historically see a 35-50% drop. I need you to estimate the revenue impact."

**[MATHS]** "Average attendance is 3,400. If we see a 40% drop, how many fans attend? At average ticket price of £12, what's the gate revenue loss compared to a normal game?"

**Choices:**
- **A) Offer discounted tickets (£8 instead of £12).** Might limit the attendance drop to 20%.
- **B) Do nothing.** Accept the 40% drop.
- **C) Move to midweek.** Reschedule costs £2,000 (pitch prep, steward rebooking) but guarantees normal attendance.

**[MATHS — if A]** "At £8 tickets and only a 20% attendance drop, what's total gate revenue? Is it more or less than accepting the 40% drop at full price?"

### Hop 2: The Aftermath (fires week after the storm)

**Dani:** "The [pitch/roof/floodlights] took damage in the storm. Repair cost: £[X]."

If the player has invested in Grounds & Security, the damage is reduced: "Good thing we upgraded the drainage — the damage could have been much worse."

**[MATHS]** "Repair cost is £3,500. Insurance covers 60% of weather damage above a £500 excess. What's our out-of-pocket cost?"
Answer: Total: £3,500. Excess: £500 (we pay). Remaining £3,000: insurance covers 60% = £1,800. We pay £500 + £1,200 = £1,700.

---

## Chain 9: The Tax Puzzle (2 hops)

**Theme:** Tax efficiency — finding money in the books.
**Primary NPC:** Val (exclusively).
**Curriculum topics:** Multi-step arithmetic, percentages, fractions.

### Hop 1: The Discovery
**Trigger:** Random, weeks 10-30. Only fires once per season.

**Val:** "I've been going through the accounts and I think we've been overpaying on our business rates. The council charges based on the rateable value of the stadium, but our classification might be wrong."

**Val:** "Current annual rates bill: £18,000. If we're reclassified as a 'community sports facility' instead of 'commercial entertainment venue', the rate drops from 48p in the pound to 34p in the pound. But the reclassification application costs £750 and takes 4 weeks."

**[MATHS]** "If the rateable value is £37,500, what are the current annual rates at 48p in the pound? What would they be at 34p? What's the annual saving? And is it worth the £750 application fee?"
- Current: £37,500 × 0.48 = £18,000
- Reclassified: £37,500 × 0.34 = £12,750
- Saving: £5,250/year
- Net of application fee: £5,250 − £750 = £4,500 in year one

### Hop 2: The Complication (fires 4 weeks after Hop 1, if player applied)

**Val:** "The reclassification came back approved — but only partially. They've given us a blended rate because the corporate hospitality area still counts as commercial. The new rate is 34p on 70% of the rateable value and 48p on the remaining 30%."

**[MATHS]** "£37,500 rateable value. 70% at 34p, 30% at 48p. What's the new annual bill?"
- 70%: £26,250 × 0.34 = £8,925
- 30%: £11,250 × 0.48 = £5,400
- Total: £14,325
- Saving vs original: £18,000 − £14,325 = £3,675

Val: "Not as much as we hoped, but £3,675 a year is still worth having. Not bad for filling in a form."

---

## Chain 10: The Community Pitch (2 hops)

**Theme:** Community engagement — building the club's local presence.
**Primary NPC:** Marcus (opportunity), Dani (logistics).
**Curriculum topics:** Area, ratio, revenue projection.

### Hop 1: The Council Approach
**Trigger:** Random, weeks 8-25. More likely if reputation is above 60.

**Marcus:** "The local council wants to know if we'd run a community football programme on Saturdays — using our training pitch. They'd pay a grant of £1,500/month and we can charge participants £5/session."

**Dani:** "Our training pitch is 90m × 60m. We'd need to split it into smaller pitches for 5-a-side. Each 5-a-side pitch is 30m × 20m."

**[MATHS]** "How many 5-a-side pitches (30m × 20m) can we fit on our training pitch (90m × 60m)? And if each pitch runs 3 sessions per Saturday with 10 players per session at £5 each, what's the weekly participant revenue?"
- Pitches: (90÷30) × (60÷20) = 3 × 3 = 9 pitches
- Revenue: 9 × 3 × 10 × £5 = £1,350/week participant revenue + £375/week grant (£1,500 ÷ 4)

**Val:** "Factor in coaching costs — £200 per Saturday — and equipment wear."

### Hop 2: The Expansion (fires 6-8 weeks after Hop 1, if programme is running)

**Marcus:** "The community programme is a hit. Council wants to double the sessions to include weekday evenings. They'll increase the grant to £2,500/month."

**Dani:** "Weekday sessions mean floodlight costs — £85 per evening — and we'll need an additional coach at £150/session."

**[MATHS]** "Two weekday evening sessions per week. Floodlight cost: £85 × 2 = £170/week. Extra coach: £150 × 2 = £300/week. Extra participant revenue at same rates. Is the expansion profitable?"

The player works out whether the additional revenue covers the additional costs, factoring in the increased grant.

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

The 10 chains above are **Season 1, League Two content.** The system must support expansion across multiple seasons and league tiers without architectural changes. This section defines how.

### 1. Chain Tiers (by league)

Each league has its own chain pool. When the player promotes, new chains unlock and existing chains scale up.

| League | Chain pool | Scale | Maths difficulty |
|--------|-----------|-------|-----------------|
| League Two | 10 base chains (this doc) | Local businesses, small budgets, thousands of pounds | Year 7 |
| League One | 10 base + 6 new chains | Regional brands, tens of thousands, more complex deals | Year 8 |
| Championship | 10 base + 6 + 6 new chains | National sponsors, hundreds of thousands, multi-party negotiations | Year 9–10 |
| Premier League | 10 base + 6 + 6 + 8 new chains | Global brands, millions, regulatory/media complexity | Year 10–11 |

**Base chains scale, not duplicate.** The Sponsor Saga in League Two is a local car dealership at £800/month. In League One, the same chain skeleton fires but with a regional brand at £5,000/month, performance clauses, and media rights considerations. The NPC voices stay the same; the narrative specifics and numbers change. This is implemented via a `leagueTier` field on the chain content — the engine picks the tier-appropriate variant at trigger time.

**New chains per tier are league-specific narratives.** Things that only make sense at higher levels: media rights negotiations (Championship+), UEFA coefficient considerations (PL), academy recruitment compliance (League One+), FFP constraints (Championship+). These don't exist at League Two because they wouldn't be realistic.

### 2. Seasonal Variants

Each chain has **3 seasonal variants** — different specific circumstances, NPCs, numbers, and maths challenges wrapped around the same structural skeleton.

Example — The Storm (Chain 8):
- **Variant A:** Winter storm, attendance drop, pitch damage.
- **Variant B:** Summer heatwave, pitch unplayable, rescheduling decision.
- **Variant C:** Flooding, car park underwater, access route blocked — operational logistics chain.

All three are "weather disrupts operations" chains with similar hop structures but different content. The scheduler picks a variant the player hasn't seen recently (tracked per chain per season, seeded).

With 3 variants × 10 chains = **30 distinct chain experiences in League Two alone.** Across a typical 3-season League Two career before promotion, the player might see 18-24 chain instances — very unlikely to repeat.

### 3. History-Dependent Chains

Some chains should only fire once the player has history — decisions from previous seasons creating new narrative opportunities.

**Season 2+ triggers:**
- **The Returning Hero:** A player you sold in a previous season wants to come back. Valuation maths based on how they've developed away. (Requires: player sale in a prior season.)
- **The Legacy Sponsor:** A sponsor from a previous deal approaches with a bigger, multi-season proposal. The terms reference your previous relationship. (Requires: completed Sponsor Saga in a prior season.)
- **The Expansion Question:** The board asks whether to invest in expanding the stadium or improving what you have. A strategic fork that shapes the next 2 seasons. (Requires: season 2+, facilities above a threshold.)
- **The Rival's Collapse:** A league rival goes into administration. Their players are available cheaply, but there are ethical questions and salary cap implications. (Requires: season 2+.)

These are narratively richer because they reference the player's own story. "Remember when you sold Martinez? He's back, and he's better." That kind of callback creates the sense that the game remembers what you did and the world responds to it.

### 4. Curriculum Tier Integration

The maths difficulty scales with the chain tier, but the mapping is explicit:

| Year group | Target league tier | New maths topics introduced |
|-----------|-------------------|---------------------------|
| Year 7 | League Two | Arithmetic, percentages, area/perimeter, basic probability, ratio, data reading |
| Year 8 | League One | Algebra (expressions, solving), sequences, better statistics (mean/median), scale/proportion |
| Year 9 | Championship | Compound interest, simultaneous considerations, trigonometry hooks (stadium geometry), probability trees |
| Year 10–11 | Premier League | Algebraic modelling, statistical analysis, financial maths (depreciation, amortisation), optimisation |

The chain narrative skeleton stays the same across tiers. The maths challenge at each hop swaps out for the age-appropriate variant. This is why the `mathsChallenge` field must support **difficulty tiers** — each node carries Year 7, 8, 9, and 10-11 variants of the same contextual question.

### 5. Content Pipeline

The scaling architecture means content creation is the primary ongoing investment. The engine is built once; chains are authored indefinitely. To support this:

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
