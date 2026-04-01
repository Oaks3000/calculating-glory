# Financial Health Bar — Specification

## Overview

The Financial Health Bar is a persistent UI element visible on every screen in the game. It communicates the player's financial position at a glance: current budget, burn rate, and projected runway. It is the single most important addition to the game's interface — the mechanism by which "money is the game" becomes a felt reality rather than an abstract number.

---

## Position & Layout

**Location:** Top of the Command Centre, always visible. Persists across all views except the Owner's Box (match day), where the phone thread and stadium view take over. On return from the Owner's Box, the bar is immediately visible again with any post-match financial changes reflected.

**Layout (single horizontal row):**

```
[Budget: £127,400] · [Burn: £2,100/wk] · [━━━━━━━━━━━━━━ 60 weeks ━━━━━━━━━━━━━━]
```

Three elements left to right:
1. **Budget** — current cash balance, updated on every event that changes it
2. **Burn rate** — rolling 4-week average of weekly net spend (see calculation below)
3. **Runway bar** — visual bar with numeric label showing projected weeks of financial survival

The bar fills left-to-right. Full = 52+ weeks (a full season of comfort). The numeric label sits inside or beside the bar depending on space.

**Tooltip (on hover/tap of the bar):**

```
Runway: 60 weeks (4-week average)
This week's net position: +£2,100
  Match revenue: £4,200
  Wages: -£1,800
  Facilities: -£300
  Events: £0
```

The tooltip breaks down the *current week's* actual numbers, giving the player the detail behind the smoothed average. This is where numerate players will dig — the bar gives the trend, the tooltip gives the truth.

---

## Calculation

### Burn Rate (rolling 4-week average)

```
burnRate = sum(netSpend for last 4 weeks) / 4
```

Where `netSpend` for a given week = total outgoings − total income for that week.

- **Positive burnRate** = spending more than earning (the normal state; bar shows weeks remaining)
- **Negative burnRate** = earning more than spending (surplus; bar shows ∞ or "surplus" state — see edge cases)
- **Zero burnRate** = breaking even

For weeks 1–3 (insufficient history), use available weeks: week 1 uses only week 1 data, week 2 averages weeks 1–2, etc.

### Runway

```
runway = budget / burnRate  (when burnRate > 0)
runway = ∞                   (when burnRate ≤ 0)
```

Capped at display max of 99 weeks (anything above shows "99+").

### What counts as income
- Match day gate revenue
- Facility revenue (weekly tick)
- Sponsorship income
- Event revenue (football camps, community events, etc.)
- Player sales

### What counts as outgoings
- Wage bill (players + manager)
- Facility maintenance
- Construction costs (spread across build duration)
- Event costs
- Travel costs (away matches)
- Sack compensation
- Transfer fees

---

## Colour Thresholds

The bar colour shifts based on runway weeks. Transitions are smooth (CSS transition over ~0.5s), not instant.

| Runway | Colour | Emotional register |
|--------|--------|--------------------|
| 20+ weeks | **Green** | Comfortable. No pressure. |
| 10–20 weeks | **Amber** | Tight. Decisions have weight. |
| Under 10 weeks | **Red** | Crisis. Every pound matters. |
| Under 5 weeks | **Red + pulse** | Emergency. Visual urgency escalates. |
| Surplus (burn ≤ 0) | **Blue/teal** | Rare positive state. Making money. |

**Tuning note:** These thresholds are first-pass estimates. They need validation against actual game balance — if a well-played game rarely drops below 30 weeks, amber at 20 won't create enough tension. Playtest and adjust. The thresholds should be defined as constants in a single config, not scattered through the codebase.

---

## Val Commentary at Threshold Crossings

When the bar crosses a threshold boundary (in either direction), Val Okoro sends an automatic inbox message. These fire once per crossing — not every week the player is in a given zone. Crossing back and then forward again resets the trigger.

### Green → Amber (entering pressure)

> **Val Okoro:** *Just flagging — our financial cushion is getting thinner. We've got [X] weeks of runway at current spend. Nothing to panic about yet, but I'd think carefully before committing to anything expensive right now.*

### Amber → Red (entering crisis)

> **Val Okoro:** *We need to talk. We're down to [X] weeks of runway. At this rate we'll run out of money before the season ends. I'd strongly recommend cutting costs — delay any facility upgrades, consider selling a player, and avoid any new commitments until we stabilise.*

### Red → Under 5 weeks (emergency)

> **Val Okoro:** *This is serious. [X] weeks of cash left. If we don't turn this around immediately, the board will step in. We need to either generate revenue fast or make painful cuts. Your call — but it needs to be now.*

### Red → Amber (recovering)

> **Val Okoro:** *Breathing room. We're back to [X] weeks of runway. Not out of the woods yet, but the trend is in the right direction. Whatever you did, keep doing it.*

### Amber → Green (comfortable again)

> **Val Okoro:** *Budget's looking healthy again. [X] weeks of runway. We can start thinking about investments again — but let's not get carried away.*

### Surplus state (burn rate ≤ 0)

> **Val Okoro:** *Something I don't get to say very often: we're actually making money. Income is exceeding outgoings. Enjoy it — it won't last forever. This might be a good window to invest in something that needs upfront spend.*

**[DESIGN NOTE]** Val's messages make the threshold crossing an *event*, not just a colour change. The player reads it in her voice — cautious, precise, slightly weary. The messages also serve as implicit tutorials: Val tells you what to do ("consider selling a player," "delay facility upgrades") without making it a tutorial popup. She's giving advice in character, which is more engaging and less patronising than a system message.

---

## Visual Urgency Cues

Beyond colour, the bar gains visual intensity as the situation worsens:

| State | Visual treatment |
|-------|-----------------|
| Green | Static bar, calm. No animation. |
| Amber | Subtle warm glow on the bar edge. The runway number is **bold**. |
| Red | Bar pulses gently (opacity oscillation, ~2s cycle). Runway number is **bold + slightly larger**. |
| Under 5 weeks | Bar pulses more rapidly (~1s cycle). A subtle shake/tremor on the runway number (CSS `translateX` jitter, ±1px, ~0.3s). The entire bar has a faint red border glow. |
| Surplus | Calm teal/blue. Subtle shimmer (very optional, low priority). |

**Accessibility:** All urgency cues must respect `prefers-reduced-motion`. With reduced motion enabled: no pulse, no shake, no shimmer. Colour change and Val's messages carry the communication alone (which is sufficient — the visual cues are enhancement, not information).

**Performance:** All animations are CSS-only (opacity, transform). No JS intervals. Chromebook-safe.

---

## Edge Cases

### Week 1 (no history)
Burn rate uses only week 1 data. Runway may be volatile. Val's first weekly summary should contextualise: "Early days — the budget picture will stabilise over the next few weeks as we build up a spending pattern."

### Windfall events (player sale, large one-off income)
Budget jumps, but burn rate (rolling average) smooths it out. The runway bar will jump upward but the burn rate stays realistic. The tooltip shows the windfall in the current week breakdown. This is correct behaviour — a one-off doesn't change your underlying financial health.

### Catastrophic one-off expense
Same principle in reverse. Budget drops but burn rate stays smoothed. If the expense is large enough to push runway into amber/red, Val's threshold message fires.

### Surplus state
When income consistently exceeds outgoings (rare but possible with good facility investment + results), the burn rate goes negative. Runway is effectively infinite. The bar fills to max and shows a "Surplus" label in teal/blue. Val comments (see above). This should feel like an achievement — the player has built a self-sustaining club.

### Zero budget
If budget hits exactly £0, runway is 0 regardless of burn rate. This connects to the Phase 5.8 owner-forced-out trigger (budget < £10,000 + bottom 3 + week ≥ 30). The bar at 0 should feel like a flatline — full red, no animation (the pulse stopping is more ominous than the pulse continuing).

---

## Integration with Existing Systems

### Event sourcing
The bar reads from `GameState` — specifically `club.budget` and a derived `burnRate` calculated from the event log (sum of financial events over the last 4 weeks). No new events needed — the bar is a pure UI projection of existing state.

### Facility revenue, wages, match revenue
All already tracked in the domain. The bar aggregates them. The tooltip breakdown maps to existing event types.

### Phase 5.8 (Owner Forced Out)
The bar's red/emergency state is the visual precursor to the forced-out trigger. The player should see the bar screaming at them for several weeks before the cascade fires — it should never feel like a surprise.

### Board meetings
Board Confidence (future spec) should factor in financial health zone. Being in green at a board meeting = confidence boost. Being in red = confidence penalty. The bar's state is a visible, persistent representation of one axis of the board's assessment.

---

## How-to-Play Intro (connection)

The Financial Health Bar is the centrepiece of the skippable how-to-play intro. Val walks the player through it on their first day:

> *"This is your financial overview. The number on the left is how much cash you have. The number on the right is how many weeks it'll last at your current spending rate. Green means you're comfortable. If it turns amber, you need to be careful. If it turns red... well, let's not let it turn red. Every decision you make in this job comes back to this bar. Keep it green and you'll be fine."*

This positions Val as the player's guide from minute one and establishes the bar as the thing to watch.
