# Chain 7: The Poaching War

---

| Field | Value |
|-------|-------|
| Depth | 3 hops |
| Primary NPCs | Kev, Val |
| Supporting NPCs | — |
| Domain | Player / financial |
| Maths topics | Valuation, comparison, percentage, opportunity cost |
| Trigger window | Mid-season (existing poaching trigger — targets strong/unsettled players) |
| Status | mvp |
| Dependency | Integrates with the existing NPC Poaching system (PR #43) — adds NPC voice and deeper maths on top of the existing trigger |

---

**Theme:** Bigger clubs coming for your best players — defend or cash in?

---

## Hop 1: The Bid

**Trigger:** Existing poaching trigger (mid-season, targets strong/unsettled players).

**Kev:** "Boss, [bigger club] have come in for [player name]. Offering £[X]. I don't want to lose them — they're key to what we're building."

**Val:** "[Player]'s on £[Y]/week. The transfer fee is [Z] times their annual wage. In market terms, that's [fair/low/generous]. Your call."

**[MATHS]** "The offer is £18,000. The player's weekly wage is £350. What's their annual wage cost? How many years of wages does the transfer fee cover?"

> Annual wage: £350 × 52 = £18,200.
> Transfer fee covers: £18,000 ÷ £18,200 ≈ 1 year.
> Val: "That's barely a year's wages. I'd push for more."

---

## Hop 2: The Counter

**Fires:** 1 week after Hop 1, if player rejects initial bid.

**Kev:** "They've come back with a revised offer. £[X]. And they've spoken to the player — [player] is interested."

Now there's urgency. The player must factor in morale impact (unhappy player if blocked), squad impact (losing them), and financial impact.

**[MATHS]** "If [player]'s morale drops to unsettled and their performance drops 15%, and they contribute to roughly [X]% of our attacking output, what's the estimated impact on results over the remaining [Y] weeks?"

> This requires the player to reason with proportional data — not a precise calculation but an informed estimate. Forces the question: is keeping an unhappy player worth more than the transfer fee?

---

## Hop 3: Resolution

- **Sold:** Cash injection, squad hole to fill, Kev is frustrated, fans react.

  **Kev:** "I understand the decision. Doesn't mean I like it. We need a replacement — fast."

  **Val:** "£[X] in the account. That buys us [Y] weeks of runway, or a couple of decent signings."

- **Kept (player happy — counter-contract):** Expensive counter-contract, budget hit, but squad intact.

  **Val:** "That contract extension cost us £[X] in signing bonus plus £[Y] more per week. Worth it if they perform."

- **Kept (player unhappy — refused without agreement):** No cost, but morale contagion kicks in (existing system).

  **Kev:** "They're staying but they're not happy. This is going to affect the dressing room."
