# How-to-Play Intro — Specification

## Overview

The intro is the player's first day as owner. It's integrated into the pre-season flow — not a separate tutorial screen. The player meets the NPC cast, learns what the Financial Health Bar means, and makes a guided first decision with real consequences. By the time pre-season ends and the season begins, the player understands: I'm the owner, money is what matters, these four people are my team, and every decision I make has a cost.

**First playthrough:** Intro plays in full. Cannot be skipped.
**Subsequent playthroughs:** "Skip intro?" option appears at the start. If skipped, the player goes directly to the existing pre-season flow (formation → manager → squad) with default intro-decision outcomes applied.

---

## Narrative Context

The player has just taken over a struggling League Two club. The previous owner left under a cloud — debts, neglected facilities, thin squad. The board has appointed you because you're the only person willing to take it on. You have a small budget, a weak squad, and four staff members who've been keeping the lights on.

This is communicated through the intro, not through a text dump. The player discovers the state of the club through the NPCs' reactions and the numbers they present.

---

## Intro Flow — Seven Beats

The intro is a sequence of seven short beats. Each introduces a concept through character interaction, not explanation. Total play time: 3-5 minutes.

### Beat 1: Arrival

The screen opens on the Command Centre — but it's muted, greyed out, not yet active. A single message appears in the centre of the screen:

> **Welcome to [Club Name].**
> **You are the new owner.**

A brief pause. Then the first NPC message arrives.

> **Val Okoro, Finance Director:** *Morning. I'm Val — I handle the money. I should warn you: the previous owner didn't leave us in great shape. Let me show you where we stand.*

The **Financial Health Bar** animates into view at the top of the screen. It fills to its current state — budget, burn rate, runway. Val narrates as it appears:

> **Val:** *This is your financial overview. The number on the left is how much cash we have. The number on the right is how many weeks it'll last at our current spending rate. Right now we've got [X] weeks of runway. That sounds like a lot, but it goes fast when you're paying wages, maintaining facilities, and trying to win football matches.*

> **Val:** *Rule number one of this job: keep this bar green. If it turns amber, be careful. If it turns red... well, let's not find out.*

The Financial Health Bar is now permanently visible. The player has been introduced to the most important UI element in the game through a character they'll come to know well.

**[DESIGN NOTE]** Val's tone is established immediately: cautious, precise, slightly weary. The player meets the voice before they meet the system. "Let me show you where we stand" is more engaging than "Here is your budget display."

### Beat 2: Meet the Team

The Command Centre starts to come alive — tiles fade in, the stadium view appears in the background. Three more messages arrive in quick succession:

> **Kev Mulligan, Head of Football:** *Alright boss. I'm Kev — I look after the football side. The squad I've got is... well, it's what it is. We'll need to be smart in the market. I'll handle tactics and training — you just make sure I've got something to work with.*

> **Marcus Webb, Commercial Director:** *Hey! Marcus here. Commercial and fan engagement. I've got some ideas to get revenue moving but we'll need to invest a bit to make money. I'll bring you opportunities — you decide what's worth backing.*

> **Dani Lopes, Head of Operations:** *Dani. I run the day-to-day — facilities, suppliers, logistics. The stadium needs work. I'll keep you posted on what's urgent and what can wait. Just so you know: everything takes longer and costs more than Marcus thinks it will.*

The player has now met all four NPCs. Each introduction establishes their domain and personality in one message. Dani's dig at Marcus signals the natural tensions between the characters.

**[DESIGN NOTE]** This takes about 20 seconds. Four messages, four distinct voices, four domains established. The player doesn't need to remember everything — the NPCs will reinforce their roles through every subsequent interaction. This is just the first impression.

### Beat 3: The Stadium Tour (Light Interaction)

The Command Centre is now active. The Stadium View tile pulses gently — inviting a click.

> **Dani:** *Want to see what you're working with? Click on the stadium.*

The player clicks. The Stadium View opens — the isometric renderer showing the current state of the club's facilities. Most are low level. Some are visibly run-down.

> **Dani:** *Not pretty, is it? Each of these buildings does something for the club — generates revenue, improves the squad, keeps the fans happy. Upgrading them costs money, but it's how you build a club that sustains itself. We'll talk specifics when you're ready.*

The player can look around — hover over buildings to see names and levels — but there's no action to take yet. This is orientation, not decision-making. After a few seconds (or when the player clicks back):

> **Dani:** *No rush on any of that today. Let's focus on getting through pre-season first.*

### Beat 4: The Squad Reality Check

The screen transitions to the squad view (or Kev delivers the summary in the Command Centre).

> **Kev:** *Right, let me give you the honest picture. We've got 16 players on the books. Most of them are... okay. League Two level, just about. We've got capacity for 24, so there's room to bring people in. But every signing costs wages, and Val's going to have something to say about that.*

> **Val:** *I always do.*

> **Kev:** *The transfer window's open for the first few weeks of the season. We've also got a free agent pool — players without a club. Some bargains, some traps. I'll flag who I think is worth looking at, but the budget calls are yours.*

This establishes: the squad is thin, transfers are possible, wages are a commitment (not a one-off cost), and the financial/football tension is real from day one.

### Beat 5: The Guided First Decision (Real Consequences)

This is the centrepiece of the intro — a real decision that the player makes with real budget consequences.

> **Marcus:** *Boss, before the season starts, I've got something that needs a decision. A local company has offered to sponsor our pre-season friendlies. Three warm-up matches, their branding on the programme and pitch-side boards.*

> **Marcus:** *They're offering two options:*
> - **Option A: Flat fee — £2,000 for all three matches.** Simple, guaranteed money.
> - **Option B: Per-attendance deal — £0.60 per fan per match.** More money if attendance is good, less if it isn't.

> **Val:** *Our pre-season friendlies typically attract between 1,200 and 1,800 fans. Last year averaged about 1,500 across the three games.*

**[MATHS — mandatory entry]**

A maths challenge card appears:

> *If average attendance is 1,500 per match across 3 friendlies, what's the total income from Option B (£0.60 per fan per match)?*

The player types their answer.

**Correct answer: £2,700** (1,500 × 3 × £0.60)

- **If correct:** Val: *"That's right — £2,700 versus the flat £2,000. Option B looks better on paper, but attendance isn't guaranteed. Your call."*
- **If wrong (close):** Val: *"Not quite. Think about it — 1,500 fans, times 3 matches, times 60p each. Try again."* (One retry.)
- **If wrong (after retry):** Val: *"I make it £2,700. So Option B is better if attendance holds up. But it's a gamble."* (Player proceeds with the information given to them — they didn't work it out themselves.)

The player then chooses:

- **Option A (flat fee):** £2,000 added to budget immediately. Safe, simple.
- **Option B (per-attendance):** Income calculated after each friendly based on actual attendance (which varies by seeded RNG). Could be more or less than £2,000.

> **Marcus:** *Done. I'll let them know.*

> **Val:** *First decision made. Let's see how it plays out.*

**[DESIGN NOTE]** This decision teaches several things simultaneously:
1. **Maths is how you understand your options.** The player can't evaluate the deal without calculating.
2. **There's no objectively right answer.** Option A is safe; Option B has higher expected value but carries risk. The player makes a judgment call — exactly like every future decision in the game.
3. **The consequence is real.** The money (or lack of it) shows up in their budget. The Financial Health Bar changes. In week 2 or 3, Val might reference it: "The pre-season sponsor deal netted us £[X] — [better/worse] than the flat fee would have been."
4. **The NPCs have opinions.** Marcus is optimistic about attendance. Val is cautious. The player is already navigating competing advice.
5. **Wrong maths doesn't block you.** But it means you didn't work out the answer yourself — Val told you. The game rewards mathematical competence with understanding, not with a pass/fail gate.

### Beat 6: Pre-Season Proper

After the guided decision, the intro flows into the existing pre-season mechanics:

1. **Formation picker** (existing)
2. **Manager appointment** (existing)
3. **Squad review** (existing)

These already work and don't need tutorial treatment — the player explores them naturally. Kev provides context where needed through the existing NPC dialogue.

The intro has done its job. The player knows:
- They're the owner (not the manager)
- Money is what matters (the Financial Health Bar)
- Four people work for them (Val, Marcus, Dani, Kev)
- Decisions require maths and have real consequences
- There are no right answers, only trade-offs

### Beat 7: Season Kickoff

Pre-season resolves. The friendly matches play out (using a simplified version of the match day experience — maybe just results in the inbox, not the full Owner's Box yet, since it's pre-season). The sponsor deal income arrives.

> **Val:** *Pre-season's done. The sponsor deal brought in £[X]. [Commentary on whether Option A or B would have been better.]*

> **Kev:** *Squad's as ready as they'll ever be. The fixtures are out. First match is [Opponent] at [Home/Away] — week 1.*

> **Marcus:** *Fans are cautiously interested. Not expecting miracles but there's a bit of buzz about new ownership. Let's give them something to cheer about.*

> **Dani:** *Everything's set on my end. The stadium's not perfect but it'll do for now. Let me know when you want to start investing.*

The Command Centre fully activates. The Financial Health Bar is live. The Upcoming panel shows the first few weeks of the season. The game begins.

---

## Skip Behaviour (Returning Players)

On subsequent playthroughs, the game detects that the intro has been completed before (flag stored in localStorage).

**Prompt:** "Welcome back. Skip the intro? You'll start with the default pre-season sponsor deal (Option A: £2,000 flat fee)."

- **Skip:** Jumps directly to formation picker. £2,000 added to budget. NPCs are not re-introduced — the player already knows them.
- **Play intro:** Full intro plays again. The player can make a different choice on the sponsor deal this time.

**[DESIGN NOTE]** The skip default is Option A (the safe choice). This means returning players who skip always get the same starting budget, keeping speedrun/optimisation consistent. Players who replay the intro can take the Option B gamble for a potentially higher start.

---

## Design Principles

### 1. Characters before systems
Every system is introduced through a person, not a UI element. The Financial Health Bar appears because Val shows it to you. The stadium is explored because Dani invites you. The squad situation is explained because Kev is honest about it. The player remembers the people before they remember the mechanics.

### 2. Show, don't explain
Nothing in the intro says "this is how you play the game." Instead, the player experiences a miniature version of the game loop: receive information from NPCs → do maths to understand it → make a decision → see the consequence. The intro teaches by doing.

### 3. Brevity is respect
The intro is 3-5 minutes. Year 7 kids have short patience for anything that stands between them and playing. Seven beats, each under a minute, with one real decision in the middle. Nothing outstays its welcome.

### 4. The first decision sets the tone
The pre-season sponsor deal is deliberately small stakes (£2,000 vs ~£2,700) so the player isn't paralysed by fear of getting it wrong. But it's real — the money matters, and the outcome is referenced later. This calibrates expectations: every decision in this game is like this. Small maths, real consequences, no right answers.

### 5. The skip respects returning players
Nobody wants to sit through an unskippable tutorial twice. First playthrough: mandatory (because it contains a real decision). Every playthrough after: one click to skip. The default skip outcome is deterministic so it doesn't penalise speed.

---

## Future Considerations

### Classroom mode intro
A classroom version might need a shorter intro (teacher has already explained the premise) or a teacher-triggered "start game" that bypasses the narrative beats but preserves the guided decision. Design this when classroom mode is specced.

### Year group variants
The guided first decision could have difficulty variants: Year 7 gets the straightforward multiplication. Year 9 gets a version with variable attendance and expected value calculations. Same narrative, harder maths. Architecture should support this from day one (the maths challenge at Beat 5 uses the same difficulty-tier system as the event chains).

### Returning after long absence
If a player hasn't played for 30+ days, the game could offer a "recap" instead of the full intro — Val summarises where you left off: "Welcome back. Here's where things stand..." with the Financial Health Bar state and any active event chains summarised. Not part of the intro spec, but a related UX consideration.
