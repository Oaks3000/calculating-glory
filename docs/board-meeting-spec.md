# Board Meetings & Board Confidence — Specification

## Overview

Board meetings are quarterly narrative checkpoints that force the player to confront where they are across all dimensions of the club — not just league position. They're the game's way of saying "here's how you're doing, here's what's working, here's what isn't." They also drive the **Board Confidence** score, which is the meta-metric capturing overall performance as an owner.

---

## Timing

Four board meetings per 46-week season:

| Meeting | Fires at | Covers | Feel |
|---------|---------|--------|------|
| Q1 Review | Week 12 | Weeks 1–12 | "Early days — are we on the right track?" |
| Q2 Review | Week 23 | Weeks 13–23 | "Mid-season. The picture is forming." |
| Q3 Review | Week 35 | Weeks 24–35 | "Final stretch. What do we need to do?" |
| End of Season | Week 46 | Full season | "The reckoning. How did we do?" |

Board meetings fire automatically at the start of the relevant week — before any other events that week. They're an interstitial that appears between weeks, not an inbox item. The player must read through it before continuing.

---

## Board Confidence Score

### What it is
A single number from 0–100 representing the board's overall assessment of the player's performance as owner. It's the closest thing the game has to an "overall score" — but it's not a grade. It's a narrative device: the board's opinion of you.

### Starting value
**50** — neutral. "We don't know you yet. Prove yourself."

### Display
Board Confidence is shown:
- At each board meeting (prominently, with change since last meeting)
- On the Command Centre as a small persistent indicator (not as prominent as the Financial Health Bar, but visible)
- At season end (final assessment)

### What drives it
Five dimensions, each scored independently and weighted into the composite:

| Dimension | Weight | Assessed by | Source |
|-----------|--------|-------------|--------|
| Financial Health | 30% | Val | Financial Health Bar state, budget trajectory, runway |
| League Performance | 25% | Kev | League position vs. target, recent form, points per game |
| Fan Satisfaction | 20% | Marcus | Attendance trend, reputation score, social feed sentiment |
| Facility Development | 15% | Dani | Facility upgrades completed, construction progress, operational quality |
| Squad Management | 10% | Kev | Squad depth, morale average, key player retention |

**Financial Health is weighted highest.** This reinforces "money is the game" — the board cares about the football, but they care about solvency more. A team in 5th place with a red Financial Health Bar will score worse than a team in 12th with green finances.

---

## Dimension Scoring

Each dimension produces a score from 0–100. The composite Board Confidence is the weighted average.

### Financial Health (30%) — Val's assessment

| Condition | Score range |
|-----------|-----------|
| Surplus state (burn rate ≤ 0) | 85–100 |
| Green zone (20+ weeks runway) | 65–85 |
| Amber zone (10–20 weeks runway) | 35–65 |
| Red zone (under 10 weeks runway) | 10–35 |
| Emergency (under 5 weeks) | 0–15 |

Within each band, the exact score is modulated by:
- Budget trajectory (improving = higher within band, declining = lower)
- Revenue diversity (multiple income streams score higher than dependency on one)
- Debt/commitment level (high fixed costs drag the score down even if runway is green)

**Val's commentary examples:**

Score 80+: *"Finances are in excellent shape. We've got room to invest and a healthy buffer. Well managed."*

Score 50-65: *"Budget is... adequate. We're not in trouble, but there's not much room for error. I'd like to see more headroom."*

Score 25-40: *"I have to be blunt — the financial position is concerning. We need to either cut costs or find revenue fast."*

Score <20: *"We're in crisis. The numbers don't lie. Without immediate action, we won't make it to the end of the season."*

### League Performance (25%) — Kev's assessment

The board sets a **league target** at the start of each season based on squad strength and league tier:

| Squad strength | Target |
|---------------|--------|
| Bottom quartile | Avoid relegation (not bottom 3) |
| Lower mid | Bottom half stability (12th–18th) |
| Upper mid | Top half (1st–12th) |
| Top quartile | Promotion challenge (top 6) |

| Condition | Score range |
|-----------|-----------|
| Exceeding target by 5+ places | 85–100 |
| Meeting or slightly exceeding target | 65–85 |
| Slightly below target (1–3 places) | 45–65 |
| Well below target (4–8 places) | 20–45 |
| Relegation zone when target was higher | 0–25 |

Modulated by: recent form (last 6 games weighted more heavily than season average), goal difference trend, and whether the team is improving or declining.

**Kev's commentary examples:**

Score 80+: *"The lads are flying. Better than anyone expected. Whatever you're doing, keep doing it."*

Score 50-65: *"Steady. We're about where we should be. Not exciting, but not worrying either."*

Score 30-45: *"Results haven't been good enough. The squad needs investment, or we need to change something tactically."*

Score <20: *"I'm not going to sugarcoat it — this is a relegation battle. The players know it, the fans know it."*

### Fan Satisfaction (20%) — Marcus's assessment

| Condition | Score range |
|-----------|-----------|
| Attendance growing + reputation 70+ | 80–100 |
| Attendance stable + reputation 50-70 | 55–80 |
| Attendance declining OR reputation 30-50 | 30–55 |
| Attendance dropping + reputation <30 | 0–35 |

Modulated by: community engagement (running programmes, events), social feed sentiment trend, and matchday experience quality (linked to Food & Beverage, Fan Zone, Grounds & Security facility levels).

**Marcus's commentary examples:**

Score 80+: *"The fans love what's happening here. Attendance is up, social media is buzzing, and the community stuff is really connecting."*

Score 50-65: *"Fan engagement is... fine. Not great, not terrible. We could do more to excite people."*

Score <35: *"We've got a fan problem. Attendance is dropping, the forums are angry, and I'm struggling to sell sponsorship in this environment."*

### Facility Development (15%) — Dani's assessment

| Condition | Score range |
|-----------|-----------|
| 3+ upgrades completed this season, no construction stalled | 75–100 |
| 1–2 upgrades completed, progress being made | 50–75 |
| No upgrades but facilities adequate for league level | 35–55 |
| Facilities below league standard, no investment | 10–35 |
| Construction stalled or abandoned mid-build | 0–20 |

Modulated by: facility levels relative to league tier expectations, construction completion rate, and operational issues (stalled builds drag the score hard).

**Dani's commentary examples:**

Score 80+: *"The infrastructure is in great shape. We've invested well and it's showing — on matchday and in the revenue numbers."*

Score 45-60: *"We're getting there. Some good upgrades done, but there's still work to do to bring everything up to standard."*

Score <25: *"The facilities are letting us down. We're behind other clubs at this level and the fans and players can feel it."*

### Squad Management (10%) — Kev's second dimension

| Condition | Score range |
|-----------|-----------|
| Squad full, morale high (avg 65+), no unsettled players | 80–100 |
| Squad adequate, morale moderate (avg 45-65) | 50–80 |
| Squad thin OR morale low (avg 30-45) OR 1+ unsettled | 25–50 |
| Multiple unsettled players + thin squad + low morale | 0–30 |

Modulated by: key player retention (did you keep your best players?), squad depth at critical positions, and contract management (how many players are in the anxiety zone).

**Kev's commentary examples:**

Score 80+: *"The dressing room is in a great place. The lads are together, morale is high, and we've got depth where we need it."*

Score 45-60: *"Squad's okay. A couple of positions I'd like more cover in, and a few lads who could be happier, but we're managing."*

Score <30: *"The squad situation is a mess. We've got unhappy players, gaps in key positions, and morale is shot. This needs fixing."*

---

## Board Meeting Presentation

### Format

The board meeting is an interstitial screen — it appears between weeks, not as an inbox item. It can't be skipped (it's brief enough to not be annoying).

**Layout:**

```
╔══════════════════════════════════════════════╗
║         BOARD MEETING — Q1 REVIEW            ║
║              Weeks 1–12                       ║
╠══════════════════════════════════════════════╣
║                                              ║
║  Financial Health     ██████████░░  72  (+4)  ║
║  Val: "Budget's healthy. Let's keep it       ║
║  that way."                                  ║
║                                              ║
║  League Performance   ████████░░░░  58  (-2)  ║
║  Kev: "Steady. About where we should be."    ║
║                                              ║
║  Fan Satisfaction     ███████░░░░░  53  (+8)  ║
║  Marcus: "Fans are warming up. The community ║
║  event helped."                              ║
║                                              ║
║  Facilities           █████░░░░░░░  42  (+12) ║
║  Dani: "Good progress. The training ground   ║
║  upgrade is showing."                        ║
║                                              ║
║  Squad Management     ████████░░░░  61  (new) ║
║  Kev: "Squad's in decent shape."             ║
║                                              ║
╠══════════════════════════════════════════════╣
║                                              ║
║  BOARD CONFIDENCE:  62  (+12 since start)    ║
║                                              ║
║  "The board is cautiously optimistic.        ║
║  Financial discipline and steady results     ║
║  are building a foundation. Keep investing   ║
║  in the facilities."                         ║
║                                              ║
╚══════════════════════════════════════════════╝
```

Each dimension shows:
- A mini progress bar (visual at-a-glance)
- The numeric score
- The change since last board meeting (or "new" for Q1)
- A one-line NPC comment in character voice

Below the dimensions: the composite **Board Confidence** score with change, and a 1-2 sentence **board outlook statement** that captures the overall mood.

### Board Outlook Statements

These are generated based on the composite score and its trajectory:

| Score | Trajectory | Outlook |
|-------|-----------|---------|
| 75+ | Rising | "The board is delighted with progress. There's talk of extending your contract." |
| 75+ | Stable | "The board is very satisfied. Keep this up and the future looks bright." |
| 60–75 | Rising | "The board is cautiously optimistic. The trend is encouraging." |
| 60–75 | Stable | "The board is satisfied with steady progress. No complaints, but they want to see continued improvement." |
| 60–75 | Falling | "The board notes some recent slippage. They're not worried yet, but they're watching." |
| 45–60 | Rising | "The board sees improvement and appreciates the direction of travel." |
| 45–60 | Stable | "The board is neutral. Things are... fine. They'd like to see more ambition." |
| 45–60 | Falling | "The board is concerned about the decline. They're looking for a plan to turn things around." |
| 30–45 | Any | "The board is seriously concerned. Performance across multiple areas is below expectations. Urgent improvement is needed." |
| <30 | Any | "The board is considering its options. Without immediate improvement, your position is at risk." |

### NPC Cross-References

The best board meeting moments are when NPCs reference each other's domains:

- **Val** (if league position is good but finances are amber): *"Results are good, but we're spending more than we're earning to get them. That's not sustainable."*
- **Kev** (if facilities have been upgraded but league position is poor): *"We've got great facilities but the results aren't matching the investment. The fans expect more."*
- **Marcus** (if finances are green but fan satisfaction is low): *"We've got money in the bank but empty seats. We need to spend some of that on giving fans a reason to come."*

These cross-references make the board meeting feel like an actual conversation between people with different priorities, not a dashboard.

---

## Consequences of Board Confidence

### Direct gameplay effects

| Score range | Effect |
|-------------|--------|
| 80+ | Board grants a £10,000 bonus to the budget. "Keep up the good work." Transfer and facility decisions are unconstrained. |
| 60–80 | Normal operation. No bonuses or penalties. |
| 40–60 | Board scrutiny. Val notes: "The board is watching our spending more closely." Large facility upgrades require an additional confirmation step (the board questions the investment). |
| 20–40 | Board pressure. Marcus: "I'm hearing whispers about your position." A mandatory cost-cutting event fires — the player must find savings. Transfer spending is capped. |
| <20 | Board ultimatum. "Improve by the next board meeting or you're out." If confidence is still <20 at the next quarterly review, the player is fired — game over (or restart with a new club, connecting to the Phase 5.8 forced-out mechanic). |

### Season-end effects

Board Confidence at the end-of-season meeting determines:
- **Contract extension:** 70+ = automatic renewal. 50-70 = renewed with a warning. <50 = board considers replacement (50% chance of firing at <40, certain at <25).
- **Next season budget:** Higher confidence = larger starting budget for next season. The bonus scales: 80+ confidence adds 15% to base budget, 60-80 adds 5%, below 60 gives base budget only, below 40 reduces budget by 10%.
- **Reputation carry-over:** Confidence above 70 grants a +5 reputation bonus into next season. Below 40 applies a -5 penalty.

### Board Confidence as narrative fuel

Board Confidence isn't just a score — it shapes the NPC dialogue throughout the season. When confidence is high, NPCs are more supportive and ambitious. When it's low, they're more cautious and occasionally snippy with each other (blaming each other's domains for the problem). This creates a mood that pervades the entire game, not just the quarterly meetings.

**High confidence atmosphere:**
- Marcus pitches bigger deals with more enthusiasm
- Val is slightly more relaxed about spending
- Kev talks about promotion ambitions
- Dani proposes facility upgrades proactively

**Low confidence atmosphere:**
- Marcus is quieter, fewer opportunities surface
- Val becomes more restrictive: "We really can't afford that right now."
- Kev is defensive about results
- Dani flags maintenance issues rather than upgrades

---

## End of Season Meeting — Special Format

The Week 46 meeting is different from the quarterly reviews. It's the season reckoning.

**Additional elements:**
- **Full season stats grid:** Total revenue, total spend, net financial position, total points, goals scored/conceded, attendance average, facilities upgraded.
- **NPC season reflections:** Each NPC gives a 2-3 sentence summary of the season from their perspective. These reference specific decisions the player made — the chains they navigated, the investments they made, the crises they survived.
- **"Moment of the Season":** The game identifies the single most impactful decision or event and presents it as a highlight — "The decision to invest in the catering operation in Week 14 ultimately generated £[X] in additional revenue and funded the training ground upgrade."
- **Board verdict:** Contract decision + next season budget allocation.
- **Next season preview:** A brief look ahead — "League One awaits" (if promoted), or "Another season in League Two — the board expects improvement" (if staying), or "Relegation. The board is... disappointed" (if relegated).

---

## Integration Notes

### Event sourcing
Board Confidence is computed from GameState at each quarterly checkpoint — it's a derived value, not a stored one. The five dimensions read from existing state: budget/runway for Financial Health, leagueTable position for League Performance, reputation for Fan Satisfaction, facility levels for Facility Development, and squad/morale for Squad Management. No new events needed for the scoring itself.

### Board meeting events
The board meeting interstitial should emit a `BOARD_MEETING_HELD` event with the composite score and per-dimension scores, for history tracking. The budget bonus/penalty at season end is a standard budget event.

### Financial Health Bar connection
The Financial Health dimension at board meetings reads from the same data as the Financial Health Bar — they should always tell a consistent story. If the bar is red, Val's board meeting commentary should reflect that. No contradictions.

### Existing board confidence in codebase
The STATUS.md mentions "reputation + board confidence deltas on season end" (PR #53). This spec replaces and extends that — the quarterly cadence, the five-dimension model, and the NPC commentary are all new. The existing season-end delta logic should be refactored into this system.
