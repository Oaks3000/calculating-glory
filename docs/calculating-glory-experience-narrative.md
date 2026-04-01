# Calculating Glory — Experience Narrative

## What this document is

This isn't a spec. It's a story about what it feels like to play Calculating Glory — told from the player's seat across a run of weeks in mid-season. The purpose is to establish the *feel* of the game before we specify systems.

Everything here is written as if the player is experiencing it. Where a design principle is being demonstrated, it's called out in **[DESIGN NOTE]** blocks afterward. Where a maths challenge is implied, it's flagged as **[MATHS]**.

The NPC cast is introduced as they appear naturally. Their bios are collected at the end.

---

## The Cast (preview)

Before we drop into the weeks, here's who the player will hear from. These aren't menu items — they're voices. Each one has a perspective, a bias, and a relationship to money.

- **Val Okoro** — Finance Director. The voice of "we can't afford that." Val sees every decision through the budget. She's cautious, precise, and always right about the numbers. The player will learn to respect her warnings even when they're inconvenient. Val is never excited about anything.

- **Marcus Webb** — Commercial Director. The optimist. Marcus sees revenue opportunities everywhere and always has a scheme. He's the one who brings sponsorship deals, event ideas, and partnership proposals. He's usually right that there's money to be made — but he chronically underestimates the costs and risks. Marcus is always excited about everything.

- **Dani Lopes** — Head of Operations. The one who makes things actually happen. When you decide to build a new stand, Dani is the person who has to deliver it. She surfaces problems — supplier issues, delays, complications — and is the player's main point of contact for the negotiation/consequence chains. Dani is tired but reliable.

- **Kev Mulligan** — Head of Football. The bridge between the owner's world and the pitch. Kev delivers match reports, flags squad issues, and pushes for investment in football things (training ground, scouting, players). He's the voice the player hears during match day. Kev is passionate and occasionally irrational.

**[DESIGN NOTE]** Four NPCs. Each mapped to a domain: money (Val), revenue (Marcus), operations (Dani), football (Kev). They disagree with each other naturally — Val vs Marcus on spending, Kev vs Val on player wages, Dani vs Marcus on feasibility. The player's job is to navigate conflicting advice. This is the owner experience.

---

## Week 6 — A Quiet Week (and why quiet weeks matter)

The player opens the game. The Command Centre loads.

The first thing they see — before anything else — is the **Financial Health Bar** at the top of the screen. It's always there. It shows current budget, weekly burn rate, and a projected "weeks of runway" number. Right now it reads:

> **£127,400** · Burning £2,100/wk · **60 weeks of runway**

This is comfortable. The bar is green. The player has breathing room. But it's there, always, reminding them what the game is actually about.

**[DESIGN NOTE]** The Financial Health Bar is the single most important UI addition. It replaces "budget is a number on a tile" with "budget is the oxygen meter." The runway number is the killer — it turns an abstract balance into a countdown. "60 weeks" feels fine. "8 weeks" feels terrifying. Same mechanic, completely different emotional register. The colour shifts from green → amber → red as runway shrinks. **[MATHS]** The runway calculation itself is a teaching moment: budget ÷ weekly net spend = weeks remaining. The player will internalise this ratio without being taught it explicitly.

There's a message in the inbox from **Val Okoro**:

> *Weekly Summary: Wage bill £1,800. Facility maintenance £300. Match day revenue from last week: £4,200. Net position: +£2,100. Nothing requiring your attention this week.*

This is a **quiet week**. No club event. No crisis. The player can advance to the next week whenever they want.

But the Command Centre isn't empty. The **League Table** shows they're 14th after 5 matches — mid-table, unremarkable. The **Social Feed** has a couple of fan posts: "Early days but liking what I'm seeing from the new gaffer 👀" and "Anyone else worried about the lack of depth at centre-back?"

The player can poke around — check the stadium view, look at the squad, browse the transfer market. Or they can just advance. The game doesn't force activity on a quiet week. It lets the player breathe.

But here's the thing: before they advance, there's a small **"Upcoming"** panel on the Command Centre. It reads:

> **Week 7:** Derby match vs. Northampton (A)
> **Week 8:** Transfer window closes
> **Week 9:** Board meeting — season progress review

The player now knows what's coming. The quiet week isn't dead time — it's the moment before the storm. The upcoming panel creates anticipation without forcing action.

**[DESIGN NOTE]** Quiet weeks serve three purposes: (1) they make busy weeks feel busy by contrast, (2) they give the player space to think and plan, (3) the Upcoming panel turns idle time into anticipation. A game where every week demands action is exhausting. A game that alternates tension and release has rhythm.

---

## Week 7 — Match Day (Derby)

The player advances. The screen transitions.

### Pre-match

The Command Centre dims slightly. A banner appears:

> **MATCH DAY — Week 7**
> Northampton Town (A) · League Two · Kick-off 3:00pm

**Kev Mulligan** appears in the inbox:

> *Big one today. The lads know what a derby means. Morale's decent — I'd say we're slight underdogs but it's a derby, anything can happen. Their centre-back partnership has been solid this season so don't expect a cricket score.*

The player can't pick the team (they're the owner, not the manager). But they absorb the context. They know what's at stake emotionally (derby) and they've been primed for what to expect (tight game).

There's a brief **Gate Revenue Preview** from **Val**:

> *Away match — no gate revenue today. Travel costs: £400.*

Even on a match day, Val is counting the money. The player registers: away matches cost money, home matches make money. This lands without a tutorial.

**[DESIGN NOTE]** The pre-match moment does two things: it frames the match emotionally (Kev) and financially (Val). The player is already thinking in both registers before a ball is kicked.

### The Match — The Owner's Box

The player clicks **"Kick Off"** and the screen changes.

The Command Centre is replaced by the **Owner's Box**. This is a distinct screen — it doesn't look like anything else in the game. The visual frame is the view from a corporate box: your stadium stretching out below, the pitch visible but distant and impressionistic (the isometric stadium view, or a stylised version of it). You can tell roughly where the play is — their half, your half, near the goal — but you can't see individual actions. You're watching from above, like an owner does.

The crowd ambient noise begins (low murmur).

On one side of the screen, a **phone thread** — a group chat format, immediately familiar to any Year 7. Messages start arriving:

> **Kev:** *And we're underway at Sixfields...*
>
> **Kev:** *Northampton pressing early. Your lot sitting deep.*

A **scoreboard** sits in a corner — small, unobtrusive. Score, time, possession. It updates when events happen. Right now: 0-0, 6'.

Silence. The crowd noise drifts. The stadium view shifts subtly — play is in Northampton's half. No messages. The player watches and waits.

> **Kev:** *Better spell now. Webb's finding space on the right.*
>
> **Val:** *Hospitality boxes are full today. Good revenue day if we hold on here.*

The crowd noise lifts.

> **Kev:** *CHANCE! Webb's cross finds Okafor — header — just over! Northampton living dangerously.*
>
> **Marcus:** *The car dealership sponsor is on his feet up here. Loving this.*

*(Marcus's message only appears if the player took the sponsorship deal in Week 8. The match day experience reflects your decisions even in the margins.)*

The match continues. ~45-60 seconds of real time for the first half. A mix of Kev's commentary, atmospheric silence, crowd noise shifts, and occasional messages from the other NPCs weaving in the business texture around the football.

**Half time.** The phone thread pauses. A brief half-time summary appears on the scoreboard:

> **HT: Northampton 0–0 Your Club**
> Possession: 43% — 57%
> Shots: 2 — 4
> Your best player: Webb (7.2)

> **Kev:** *Decent half. We're in this. Just need to take one of these chances.*
> **Dani:** *East stand food kiosk queue is massive. Good problem to have.*

Then the second half begins.

> **Kev:** *Northampton come out fired up. Pressure on the defence here...*
>
> **Kev:** *Free kick. Dangerous position...*

The crowd noise builds. The stadium view shows play clustered near your goal.

> **Kev:** *Off the post! OFF THE POST! Your keeper won't know how that stayed out.*

The player's heart rate is up. They didn't do anything. They just *watched*. But they care.

Then, late:

> **Kev:** *Your boys pushing forward now... ten minutes left...*
>
> **Kev:** *Williams picks it up, drives forward... he's found Okafor...*

A pause. The crowd noise drops to near-silence. No messages. The phone thread holds.

> **Kev:** *OKAFOR SCORES!! GET IN!! FROM NOTHING!!*

**GOAL FLASH** — the stadium view pulses. The scoreboard updates: 1-0. The crowd noise explodes.

> **Kev:** *The away end has gone MENTAL*
> **Marcus:** *Sponsor guy is hugging strangers. This is brilliant.*
> **Val:** *Nice. That's three points and a morale boost. Good week.*

The remaining minutes tick down. The crowd noise from the home fans is muted. Kev's messages get breathless, counting down.

**Full time.**

> **Kev:** *THAT'S IT! Smash and grab derby win! The lads are absolutely buzzing!*
> **Dani:** *Turnstile count confirmed — 4,200 away allocation sold out. Travel costs covered.*

**[DESIGN NOTE]** The Owner's Box is the emotional centrepiece. Key design principles:

1. **You're at the match, not watching a simulation.** The player sees their stadium, hears the crowd, and receives the match through the people around them. This is fundamentally different from a CM ticker or a pitch view — it's experiential, not informational.
2. **The phone thread is the narrative channel.** Kev calls the match, but the other NPCs weave in business/operational texture. The player is simultaneously experiencing the football and the club. Marcus mentioning the sponsor, Dani counting turnstiles, Val noting the morale boost — these keep the owner frame alive during the most football-focused moment in the game.
3. **Silence is a tool.** Not every second has messages. The gaps — where only the crowd noise plays and the stadium view shifts — create tension. Something might happen, or it might not.
4. **Pacing varies by match state.** Early match = slow, atmospheric, sparse messages. Late match with the score close = rapid messages, breathless Kev.
5. **The player does nothing.** That's the point. They're the owner in the box, not the manager on the touchline. The experience is emotional investment without tactical control.
6. **Real time is ~90 seconds per match.** Long enough to feel like an event. Short enough to not outstay its welcome.
7. **The phone thread format is native to the audience.** Year 7 kids live in group chats. A message thread where characters react in real time is immediately legible — no UI learning curve.
8. **NPC messages reflect player decisions.** Marcus only mentions the sponsor if the deal exists. Dani references the east stand if you upgraded it. The match day experience is personalised by your choices.
9. **Kev is the in-house commentator.** Like the Wrexham documentary's club commentary team, Kev is biased, emotionally invested, and unapologetically your guy. "GET IN" isn't unprofessional — it's authentic lower-league club commentary.

**Audio evolution path (v1 → v2):**
- **v1 (text):** Kev's commentary lives in the phone thread as text messages. The other NPCs contribute texture. Crowd audio (ambient loops with state crossfades) provides atmosphere.
- **v2 (audio):** Kev's commentary script moves wholesale into an audio feed — ElevenLabs voice clone plus recorded punctuation points (goal shouts, final whistle, near-miss reactions) for moments that need genuine human energy. The audio plays over the stadium view as an in-house club radio feed. Kev's phone messages then shift to private owner-only asides: tactical whispers, "between you and me boss" texture that adds a second layer without rewriting v1 content.
- **Crowd audio** exists in both versions: ambient loops crossfading between states (murmur → tension → roar → groan → celebration). Four audio states, minimal production overhead, enormous atmospheric payoff.

**[MATHS]** No maths challenge during the match itself. The match is pure football emotion. The maths comes before and after, in the decisions that shape what happens on the pitch and the consequences that flow from it.

---

### Post-Match — The Newspaper

The Owner's Box fades. The Command Centre returns — but it's not a normal week. The inbox has a special item at the top: **The Match Day Edition**.

The player opens it and gets a newspaper-style layout — typographic, editorial, built around the result. The headline appears first, then the body fills in:

> # OKAFOR STUNS SIXFIELDS
> ## Late strike seals derby day smash-and-grab
>
> *A resolute defensive display and a moment of individual brilliance from summer signing Okafor earned a precious three points at Sixfields yesterday.*
>
> *The £8,000 recruitment gamble on the unheralded striker is starting to look like shrewd business by the ownership...*

The report is brief — three or four sentences. It references the player's decisions where relevant (signing Okafor, the training focus they set, the formation choice). It's a mirror held up to their choices.

Below the match report, the newspaper has **secondary stories** — and this is where the owner's world reasserts itself:

> **GATE RECEIPTS ROUND-UP**
> No home revenue this week (away fixture). Season average gate: £4,100/match.

> **MORALE WATCH**
> Squad morale up across the board following derby victory. Dressing room sources describe the mood as "buzzing."

> **TRANSFER WINDOW REMINDER**
> Window closes end of Week 8. The club currently has 2 open squad slots.

The newspaper stays on screen until the player clicks through. It's the moment of reflection — what happened, what it means, what's coming next.

**[DESIGN NOTE]** The newspaper lives inside the Command Centre as a special inbox item, not a separate screen. This keeps the number of visual environments tight (Command Centre + Owner's Box, that's it) while still giving the post-match moment a distinct editorial feel. The newspaper does several jobs:

1. **Reflects decisions back to the player.** "The £8,000 gamble on Okafor" — the player made that choice weeks ago. Now they see it referenced. The causal chain is visible.
2. **Surfaces financial context naturally.** Gate receipts, wage impact, transfer budget — all woven into editorial, not displayed as raw numbers.
3. **Creates forward momentum.** The transfer window reminder, the upcoming board meeting — the newspaper plants seeds for next week's decisions.
4. **Has a distinct visual identity within the inbox.** The typographic, editorial layout stands apart from normal inbox messages while staying inside the Command Centre shell.

---

## Week 8 — The Transfer Window Closes (Decision Weight)

Monday morning. The Command Centre loads. The Financial Health Bar has ticked up after the away win:

> **£131,200** · Burning £2,100/wk · **62 weeks of runway**

**Marcus Webb** is in the inbox first:

> *Morning! So the derby win has got people talking. I've had a call from a local car dealership — they want to sponsor the matchday programme. Worth about £800/month. There's a catch though — they want us to commit to printing 2,000 copies per home game, which means a print run upgrade. Dani can give you the numbers on that.*

**Dani Lopes** follows up:

> *Marcus has been bending my ear about this programme deal. Current print run is 500 copies at £0.40 each. Going to 2,000 would need a new supplier — I've had a quote at £0.28 per copy from PrintCo, but there's a minimum 12-month contract. That's a fixed commitment whether we sell them or not.*

**[MATHS]** This is a genuine decision requiring mathematical reasoning:
- Sponsorship income: £800/month
- Current print cost: 500 × £0.40 = £200/match
- New print cost: 2,000 × £0.28 = £560/match
- With ~2 home games/month, new cost = ~£1,120/month
- Net position: £800 income - £1,120 cost = **-£320/month worse off** before programme sales
- But: can they sell the extra 1,500 programmes? At what price?
- And: the 12-month lock-in means this cost persists even if attendance drops

The player has to work the numbers. The inbox doesn't tell them the answer — it gives them the inputs. Val's opinion appears if they wait:

> *I've run the numbers on Marcus's programme idea. We'd need to sell at least 1,200 of the 2,000 copies at £2 each just to break even on the deal. Current sell-through rate on 500 copies is about 80%. I'm not confident we'd maintain that rate at 4× the volume. Your call.*

**[DESIGN NOTE]** This is what "decision weight" means in practice:

1. **Multiple NPCs with different perspectives.** Marcus sees revenue. Dani sees logistics. Val sees risk. All are giving honest, useful information. None of them agree.
2. **The maths is embedded in the decision, not bolted on.** The player isn't solving a textbook problem — they're working out whether a business deal makes sense. The curriculum content (unit costs, break-even analysis, percentage sell-through) is load-bearing.
3. **The decision has a time horizon.** The 12-month contract means this choice echoes for the rest of the season. It's not a one-week transaction.
4. **There's no obviously right answer.** If attendance grows (which it might, if results improve), the deal becomes profitable. If attendance stalls, it's a drag. The player has to make a judgment call under uncertainty — which is what real business decisions feel like.

Meanwhile, the **Transfer Window** closes at end of this week. The Upcoming panel has been flagging this for two weeks. Now there's urgency.

**Kev Mulligan** weighs in:

> *Boss, I know the window's closing. We've got two open slots. I'm not saying we need to splash the cash, but we're thin at left-back and if Reeves gets injured we're in trouble. There's a lad on the free agent list — Tomás Ferreira — who'd cover both positions. Wages are reasonable.*

The player now has two decisions competing for their attention in the same week: the sponsorship deal (a financial/commercial decision with maths) and the transfer (a football/squad decision with budget implications).

Val, unprompted, connects them:

> *Just flagging — if you're considering both the programme deal AND a new signing this week, the wage commitment on Ferreira would add roughly £350/week to the burn rate. Combined with the print contract, your runway drops from 62 weeks to about 51. Still comfortable, but these things add up.*

**[DESIGN NOTE]** Val connecting the two decisions is crucial. This is how the game teaches opportunity cost without using the phrase "opportunity cost." The player sees, concretely, that doing both things changes their financial position. They might decide to do both, or one, or neither — but they make that choice with full visibility of the trade-off. The Financial Health Bar updates in real-time as they commit to each decision, so the runway number physically drops as they spend. The consequence is felt immediately.

---

## Week 9 — Board Meeting (Narrative Arc)

The player advances. Before the usual Command Centre loads, there's an interstitial:

> **BOARD MEETING — Quarter 1 Review**

This is the first of four seasonal board meetings (Q1, Q2, Q3, End of Season). It's a set-piece narrative moment that forces the player to confront where they are.

The board meeting is presented as a simple report card — not a cutscene, not a dialogue tree. It's a dashboard with editorial commentary.

> **League Position:** 12th (target: top half) — ✅ On track
> **Financial Health:** £128,500, 58 weeks runway — ✅ Healthy
> **Squad Strength:** 18/24 slots filled, thin at LB — ⚠️ Concern
> **Facilities:** 3 upgrades completed — ✅ Progressing
> **Fan Satisfaction:** 62% — 😐 Neutral

Each line has a brief NPC comment attached:

> **Kev (Football):** "Results have been solid. The derby win was massive for morale. But we need left-back cover — I flagged this before the window and we didn't act." *(If the player didn't sign Ferreira)*

or:

> **Kev (Football):** "Results have been solid. Ferreira signing gives us the cover we needed. Smart move." *(If they did sign Ferreira)*

> **Val (Finance):** "Budget is healthy. The programme sponsorship deal will need watching — early sell-through numbers next month will tell us if it's working." *(If they took the deal)*

> **Marcus (Commercial):** "Fan engagement is ticking up after the derby. I've got some ideas for a half-term community event that could boost it further — I'll put something together."

The board meeting ends with a **Board Confidence** rating: currently 65/100. And a one-line outlook:

> *"The board is cautiously optimistic. Continued financial discipline and mid-table stability would see confidence grow."*

**[DESIGN NOTE]** The board meeting creates a narrative arc checkpoint. It does several things:

1. **Forces reflection.** The player sees a summary of where they are across all dimensions — not just league position. This is where the "money is the game" framing gets reinforced: financial health is listed alongside league position as equally important.
2. **NPCs reference past decisions.** Kev's comment changes based on whether you signed Ferreira. Val mentions the programme deal if you took it. The player sees their choices reflected back, which builds the sense that decisions matter.
3. **Plants seeds.** Marcus mentions a community event — that's foreshadowing a future decision. The player starts to anticipate.
4. **Board Confidence is the meta-score.** It's the number that captures "how well are you doing overall?" It factors in finances, results, fan satisfaction, and facility development. It's what the player is ultimately trying to maximise, and it only updates at board meetings — so each update feels meaningful.

---

## Week 10 — A Consequence Lands

The player has been cruising. Two decent results, budget stable, board happy. Then:

**Dani Lopes** appears in the inbox with an amber alert badge:

> *Bad news. PrintCo — the programme supplier — have just informed me that paper costs have jumped 18% due to a supplier shortage. They're passing it on to us. New unit cost: £0.33 per copy instead of £0.28.*

*(This only fires if the player took the sponsorship deal in Week 8.)*

The player's immediate reaction: that changes the maths.

> *At the new rate, 2,000 copies per game costs £660 instead of £560. That's an extra £200/month we didn't budget for. The deal was already tight — Val's going to have something to say about this.*

**Val**, predictably:

> *I told you the margins on that programme deal were thin. At the new print cost, we need to sell 1,400 copies per game to break even. Our current sell-through is about 950. We're losing money on this.*

The player now has a choice:

> **A)** Absorb the cost increase and hope sell-through improves (keep the deal as-is)
> **B)** Renegotiate with PrintCo — try to get a better rate **[MATHS: negotiation]**
> **C)** Cancel the programme expansion and go back to 500 copies (break the sponsorship deal — reputation hit with the car dealership)

If they pick **B**, a negotiation sequence fires:

**Dani** frames it:

> *I can set up a call with PrintCo. Their original quote was £0.28 and they've moved to £0.33. Realistically, we're not going to get them back to £0.28 — paper costs genuinely have gone up. But if we offer to extend the contract from 12 months to 18 months, that gives them revenue certainty, which might persuade them to split the difference. I'd aim for £0.30. Want me to try?*

The player confirms. A maths challenge appears:

> *PrintCo have come back with a counter-offer. They'll do £0.31 per copy if you commit to 18 months, or £0.29 per copy if you guarantee a minimum order of 2,500 copies per game (whether you need them or not). Which deal is better for you?*

**[MATHS]** The player needs to calculate:
- Option 1: 2,000 × £0.31 × ~44 remaining home games = total contract cost
- Option 2: 2,500 × £0.29 × ~44 remaining home games = total contract cost (higher volume, lower unit cost — but 500 copies potentially wasted)
- Factor in the sponsorship income and programme sale revenue under each scenario

This is percentage calculation, unit cost comparison, and scenario modelling — all wrapped in a narrative the player is invested in because it's *their* deal going wrong and they need to fix it.

**[DESIGN NOTE]** This is the consequence chain in action:

- **Week 8:** Player took the sponsorship deal (decision)
- **Week 10:** External shock changes the economics (consequence)
- **Week 10:** Player must renegotiate or absorb the hit (follow-up decision with maths)
- **Future weeks:** The outcome of the renegotiation affects budget for the rest of the season (long shadow)

The player couldn't have predicted the paper cost increase. But they made a choice that exposed them to it. That's what "decisions cast shadows" means — not that every choice has a predetermined consequence, but that every choice changes what *can* happen to you.

---

## Week 11 — The Interweave

A match week. But before the match, **Marcus Webb** reappears:

> *Right, remember I mentioned a community event at the board meeting? Here's what I'm thinking: Half-Term Football Camp for local kids. We charge £25/kid, capacity for 60 kids, and we use our training ground facilities. Sponsorship tie-in potential with the car dealership if we've still got that deal running. Total setup cost is about £600 for coaching staff and refreshments.*

**[MATHS]**
- Revenue: up to 60 × £25 = £1,500
- Cost: £600 fixed
- Maximum profit: £900
- Break-even: 24 kids (£600 ÷ £25)
- But: what's the realistic sign-up rate? Marcus thinks 40-50 kids. Val thinks 25-30.

The player decides. But they're also thinking about the match this week. And the renegotiation from last week is still resolving. And the Financial Health Bar is ticking.

This is **the interweave** — multiple threads running simultaneously, each requiring attention but none requiring immediate crisis response. The player is juggling, not firefighting.

**Kev** pops up before the match:

> *Morale's still high from the derby. Okafor's been sharp in training. I fancy us this week — Harrogate are in poor form.*

Match day arrives. The radio plays. They win 2-1. The newspaper reflects the result and mentions the football camp in a sidebar:

> **COMMUNITY CORNER**
> The club has announced a Half-Term Football Camp — spaces filling up fast. A sign of growing community engagement under the new ownership.

*(Only if the player approved the event.)*

The player is now managing a portfolio of decisions across different time horizons: the programme deal (long-term, under pressure), the football camp (short-term, straightforward), squad development (ongoing), and the league campaign (week-to-week). Each one connects to the others through the budget.

**[DESIGN NOTE]** The interweave is the target state for the weekly loop. Not every week has this density — that would be exhausting. But by Week 11, the player should have 2-3 threads running simultaneously. The threads interact through the shared resource (money) and the shared NPCs (who reference each other's domains). The Financial Health Bar is the constant anchor: every thread either adds to or subtracts from the runway.

---

## Week 12 — The Quiet After

Another quiet week. No major events. **Val's** weekly summary:

> *Programme sell-through last home game: 1,050 copies at £2 each. Revenue: £2,100. Print cost (at renegotiated £0.31): £620. Net: £1,480. Sponsorship income: £400 (bi-weekly). After costs, the programme deal made us £1,280 this period. Better than I expected. Still watching it.*

The player reads this and feels something: **relief, or vindication, or concern** — depending on how the renegotiation went and what the numbers show. A number going up in a box means nothing. Val telling you "better than I expected" after three weeks of stress about the deal? That *means* something.

The Financial Health Bar is green. The Upcoming panel shows a run of league games. The board meeting feedback is still warm. The player is, for a moment, in control.

They'll enjoy it while it lasts.

**[DESIGN NOTE]** The quiet week after a run of activity is essential. It lets the player absorb the outcome of their recent decisions. Val's summary is the payoff — the consequence chain that started in Week 8 (sponsorship deal) and escalated in Week 10 (price shock) now resolves with a clear financial outcome. The player can see the cause-and-effect chain across four weeks of play. And because it resolved through Val — a character they've been listening to throughout — it feels personal, not statistical.

---

## Design Principles (extracted from the narrative)

### 1. Money is oxygen
The Financial Health Bar is always visible. Every decision is ultimately measured by its effect on the budget. The runway number turns finance from a ledger into a countdown.

### 2. NPCs are the interface
Information doesn't come from UI elements — it comes from people. Val warns you, Marcus pitches you, Dani informs you, Kev advocates. The player builds relationships with these voices and learns whose judgment to trust.

### 3. Decisions cast shadows
No decision resolves in isolation. The sponsorship deal in Week 8 creates a vulnerability that's exploited in Week 10. The training ground investment in Week 3 shapes match results in Week 12. The player should always be able to trace back from a consequence to the choice that enabled it.

### 4. The game has rhythm
Quiet weeks → build-up → match day → newspaper reflection → consequence landing → quiet week. Not every week hits every beat, but the pattern creates a pulse. The player feels the difference between a calm Tuesday and a hectic transfer deadline.

### 5. Match day is sacred
The Owner's Box is a distinct, immersive experience that doesn't look or feel like anything else in the game. The player is a spectator, not a participant. The emotion comes from investment in the outcome, not control over it. The match arrives through the people around you — Kev's in-house commentary, the other NPCs' business texture, the crowd atmosphere — not through a tactical simulation.

### 6. The newspaper bridges football and business
Post-match, the editorial lens shifts from what happened on the pitch to what it means for the club. Revenue, morale, upcoming decisions — all surfaced through journalism, not dashboards. It lives inside the Command Centre as a special inbox item, keeping the visual environment count tight.

### 7. Maths is the language of decisions
Every meaningful choice requires mathematical reasoning — but the maths is never presented as a standalone exercise. It's always in service of a decision the player is invested in. The curriculum content is load-bearing: get the maths wrong and you make a bad deal.

### 8. Anticipation is half the experience
The Upcoming panel, the board meeting cadence, Marcus's foreshadowing of future events — the player should always know roughly what's coming without knowing exactly how it'll play out. This creates narrative pull: "I need to save budget for the board meeting period" or "the transfer window closes next week, I need to decide now."

---

## NPC Bios

### Val Okoro — Finance Director
**Domain:** Budget, financial health, risk assessment
**Personality:** Cautious, precise, dry. Never enthusiastic. Says "your call" a lot, but her tone makes it clear which call she thinks you should make. Occasionally deadpan funny.
**Bias:** Toward caution. She'll always flag the downside. The player needs to learn when Val's caution is wisdom and when it's excessive.
**Catchphrases:** "I've run the numbers." / "Just flagging." / "Still watching it."
**Role in the game:** Val is the player's financial conscience. She delivers weekly summaries, flags budget risks, connects decisions to their financial impact, and provides the "cold water" perspective on Marcus's schemes.

### Marcus Webb — Commercial Director
**Domain:** Revenue, sponsorships, fan engagement, commercial opportunities
**Personality:** Optimistic, energetic, always has a scheme. Genuinely good at spotting opportunities but consistently underestimates costs and overestimates demand. Not dishonest — just optimistic.
**Bias:** Toward action and revenue. He'll always advocate for spending money to make money. The player needs to learn to check Marcus's numbers rather than taking them on faith.
**Catchphrases:** "I've had an idea." / "Hear me out." / "The numbers stack up." (They usually don't, quite.)
**Role in the game:** Marcus brings commercial decisions to the player — sponsorships, events, partnerships, merchandise. He's the engine of the revenue side and the source of most maths challenges related to business deals.

### Dani Lopes — Head of Operations
**Domain:** Facilities, suppliers, logistics, construction, day-to-day operations
**Personality:** Practical, slightly weary, reliable. She's the one who turns decisions into reality and surfaces the problems that nobody else thought about. She doesn't advocate for or against things — she tells you what it'll actually take.
**Bias:** Toward feasibility. She'll tell you what's realistic regardless of what Marcus is promising or Val is worrying about.
**Catchphrases:** "I can make that work, but..." / "You should know that..." / "Just so you're aware."
**Role in the game:** Dani is the operational layer. When you build a facility, she manages it. When a supplier raises prices, she brings you the news. She's the main NPC for negotiation sequences — she sets up the call, frames the situation, and presents the options.

### Kev Mulligan — Head of Football & In-House Commentator
**Domain:** Squad, match preparation, training, scouting, morale, match day commentary
**Personality:** Passionate, emotional, occasionally irrational. He genuinely cares about the football side and will push for investment in players and training even when the budget can't support it. He's the voice of "but we need to win games."
**Bias:** Toward football spending. He'll always want a bigger squad, better training facilities, one more signing. The player needs to balance Kev's football instincts against Val's financial reality.
**Catchphrases:** "Boss, we need to talk about..." / "The lads are..." / "I fancy us this week." / "GET IN!"
**Role in the game:** Kev is the bridge to the pitch. He delivers pre-match briefings, post-match morale reports, and squad concerns. On match day, he is the club's in-house commentator — biased, emotionally invested, unapologetically your guy (in the mould of Wrexham AFC's club commentary team). In v1, his commentary arrives as text messages in the Owner's Box phone thread. In v2, his script moves wholesale into an audio feed (ElevenLabs clone + recorded punctuation points), and his text messages shift to private owner-only asides. He pushes for transfers and training investment. He's how the player feels the football side of the club without being a manager.

---

## What This Document Doesn't Cover (Yet)

- **Match commentary engine specification** — the beat structure, template system, pacing rules, and phone thread message sequencing need their own doc
- **Owner's Box visual specification** — stadium view integration, phone thread UI, scoreboard component, crowd audio state machine
- **Maths challenge integration patterns** — how challenges are triggered, difficulty scaling, and curriculum mapping within the decision framework
- **Club event chain designs** — the 15 event templates and their branching follow-ups, rewritten to use NPC voices
- **Financial Health Bar specification** — exact calculation, colour thresholds, edge cases
- **Board meeting scoring** — how Board Confidence is calculated and what drives it
- **How-to-play intro** — skippable onboarding that establishes the Financial Health Bar, the owner-not-manager framing, and the "money is the game" mental model
- **Consequence density scaling** — toggling decision chain complexity by school year / player age
- **Classroom mode** — adapting the session rhythm for ~30-minute timed play

---

## Appendix: Backlog Note — Classroom Mode

*Captured from design discussion, 2026-03-24*

The current design targets home use with self-directed pacing. A future "Classroom Mode" should adapt the cadence for ~30-minute timed sessions, potentially including: session-length match day compression, mid-session save points aligned to natural break points, and teacher-controlled pacing options. This is a separate design task — the home-use rhythm should be right before classroom adaptations are considered.

---

## Appendix: Backlog Note — Consequence Density Scaling

*Captured from design discussion, 2026-03-24*

The consequence chain density (e.g. sponsorship deal → price shock → renegotiation → resolution) should be tuneable by player age / school year. Younger players get simpler chains (fewer branches, more scaffolding from NPCs, lower mathematical complexity). Older players get deeper chains with more ambiguity and less hand-holding. This is a difficulty/complexity lever separate from the curriculum-level maths difficulty that already exists. Design task: define 2-3 density tiers and map them to the event chain system.

---

## Appendix: Backlog Note — How-to-Play Intro

*Captured from design discussion, 2026-03-24*

The game needs a skippable introductory sequence that establishes: (1) you are the owner, not the manager — you make business decisions, Kev handles the football; (2) the Financial Health Bar and what runway means; (3) the basic weekly loop and what match day looks like. This should feel like a narrative intro (Val walking you through your first day), not a tutorial overlay. Design as part of the pre-season flow.
