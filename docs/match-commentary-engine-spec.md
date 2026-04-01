# Match Commentary Engine — Specification

## Overview

The match commentary engine drives the Owner's Box match day experience. It takes the predetermined match result (already computed by the deterministic match sim) and transforms it into a timed sequence of narrative beats delivered through the phone thread, crowd audio state changes, and scoreboard updates.

The engine does not simulate the match — the match is already resolved. It *performs* it. The analogy is a film score: the composer knows the story; the music makes you feel it.

---

## Architecture: Result → Timeline → Performance

### Step 1: Match Sim (existing)
The deterministic match engine runs as it does today: Poisson distribution, seeded RNG, attack/defence strengths, team modifiers. It produces a `MatchResult` with goals, key events, and final score. **This doesn't change.**

### Step 2: Timeline Generation (new)
A new `generateMatchTimeline()` function takes the `MatchResult` and produces a `MatchTimeline` — an ordered sequence of `Beat` objects, each with a timestamp, type, content, and metadata.

```typescript
type Beat = {
  matchMinute: number;        // 0–90 (in-game minute)
  realTimeOffset: number;     // seconds from kickoff (0–90s, maps 90 mins to ~90 secs)
  type: BeatType;
  content: PhoneMessage[];    // messages to display in the phone thread
  crowdState: CrowdState;     // audio/visual atmosphere target
  scoreboardUpdate?: Score;   // if this beat changes the score
};

type BeatType =
  | 'KICKOFF'
  | 'QUIET_PASSAGE'        // nothing happening — atmosphere only
  | 'BUILDING_PRESSURE'    // play developing toward a chance
  | 'CHANCE'               // shot, header, free kick — missed or saved
  | 'GOAL'                 // goal scored
  | 'NEAR_MISS'            // post, great save, off the line
  | 'SETBACK'              // injury, booking, defensive error
  | 'MOMENTUM_SHIFT'       // tide turning
  | 'HALF_TIME'
  | 'SECOND_HALF_START'
  | 'FINAL_MINUTES'        // last 10 mins — pacing accelerates
  | 'FULL_TIME';

type CrowdState = 'MURMUR' | 'BUILDING' | 'TENSE' | 'ROAR' | 'GROAN' | 'CELEBRATION' | 'HOSTILE' | 'SILENT';

type PhoneMessage = {
  sender: 'KEV' | 'VAL' | 'MARCUS' | 'DANI';
  text: string;
  mood: 'neutral' | 'excited' | 'worried' | 'elated' | 'frustrated' | 'dry';
};
```

### Step 3: Performance (new)
The Owner's Box UI component reads the `MatchTimeline` and performs it in real time — displaying phone messages with typing indicators, transitioning crowd audio states, updating the scoreboard. The performance is a playback of a pre-built timeline, not a live computation.

---

## Timeline Generation Rules

### Mapping match minutes to real seconds

A 90-minute match plays out in approximately **75–100 seconds** of real time (target: ~90 seconds). The mapping is not linear — it compresses quiet periods and expands dramatic ones.

| Match phase | Match minutes | Real-time allocation | Feel |
|-------------|--------------|---------------------|------|
| Early first half | 0–20 | ~10s | Setting the scene, slow |
| Mid first half | 20–35 | ~10s | Building, moderate pace |
| Late first half | 35–45 | ~8s | Pre-half-time tension |
| Half time | 45 | ~8s | Pause, summary, breath |
| Early second half | 45–60 | ~8s | Restart energy |
| Mid second half | 60–75 | ~10s | Key events often land here |
| Final minutes | 75–90 | ~15s | Maximum tension, slowest pace for drama |
| Full time | 90 | ~6s | Result, celebration/commiseration |

**Key principle:** The final 15 minutes of a close match get disproportionate real time. This is where drama lives. A 0–0 draw going into the last 10 minutes should feel agonising. A 3–0 lead should feel comfortable (faster pacing, less tension in the crowd).

### Beat density by match state

The number of beats (phone messages + atmosphere changes) varies by context:

| Context | Beat density | Reasoning |
|---------|-------------|-----------|
| Dominant position (2+ goal lead) | Low — 1 beat per ~15s | Comfortable. The player relaxes. |
| Tight match (level or 1 goal) | Medium — 1 beat per ~8-10s | Engaged. Every event matters. |
| Behind | High — 1 beat per ~5-7s | Anxious. Information comes fast. |
| Final 10 minutes, close match | Very high — 1 beat per ~4-5s | Breathless. Kev can barely keep up. |
| Quiet passage (no events nearby) | Very low — silence + crowd only | Let the atmosphere carry it. |

### Mandatory beats

Every match timeline must include:

1. **KICKOFF** — Kev's opening line + crowd state → MURMUR
2. **At least one CHANCE or NEAR_MISS in each half** — even goalless matches need near-misses
3. **HALF_TIME** — summary card + pause + NPC messages
4. **FULL_TIME** — final score + Kev's reaction + Val/Dani operational wrap

### Goal beats

Goals are the highest-priority beats. They follow a specific micro-sequence:

1. **Build-up** (2-3 seconds before): Kev describes the passage of play leading to the goal. Crowd state → BUILDING.
2. **The moment** (1-2 second gap): Silence. No messages. Crowd state → TENSE. The phone thread holds.
3. **GOAL flash**: Kev's reaction — all caps, raw emotion. Crowd state → ROAR (home goal) or SILENT → delayed groan (away goal for opponent). Scoreboard updates.
4. **Aftermath** (3-5 seconds after): Other NPCs react. Marcus ties it to business. Val notes the mood or revenue implication.

The silence before the goal confirmation is critical. It's the commentator's sharp intake of breath. The phone thread going quiet for 1.5 seconds when the player knows something is about to happen — that's where the tension lives.

### Silence beats (QUIET_PASSAGE)

Silence is not the absence of content — it's a deliberate beat. During a QUIET_PASSAGE:
- No phone messages for 5-10 seconds
- Crowd state holds at MURMUR or shifts gently
- The stadium view (if animated in SC2K phase) shows play drifting

These silences prevent message fatigue and make the next beat land harder. A match that talks constantly is exhausting. A match that goes quiet and then suddenly erupts is exciting.

**Rule of thumb:** At least 20% of match real-time should be silence.

---

## Phone Thread Message Templates

### Kev Mulligan — Match Commentary

Kev is the primary voice. His messages carry the match narrative. In v1, he is effectively the commentator delivered via text. His tone varies by match state:

**Confident (your team dominant):**
- *"We're all over them here. Just a matter of time."*
- *"This is comfortable. The lads look up for it today."*
- *"Their keeper's having a nightmare. Keep pressing."*

**Tense (close match):**
- *"Tight one this. Could go either way."*
- *"Neither side giving an inch. Proper League Two battle."*
- *"My heart can't take much more of this."*

**Worried (your team under pressure):**
- *"We're hanging on here. They're all over us."*
- *"Need to get to half time. Regroup."*
- *"Backs against the wall stuff."*

**Ecstatic (your goal):**
- *"YESSSSS! GET IN! [Scorer]!!!"*
- *"GOAL!! What a hit! [Scorer] you absolute beauty!"*
- *"HE'S DONE IT! [Scorer]! From nowhere!"*

**Devastated (opponent goal):**
- *"No... [conceder description]. Nightmare."*
- *"That's poor. Really poor. We switched off."*
- *"Gutting. Completely against the run of play."*

**Near miss (your chance):**
- *"CHANCE! [description] — just wide! So close."*
- *"OFF THE POST! How has that not gone in?!"*
- *"Should've scored there. Has to do better."*

**Near miss (their chance):**
- *"Off the post! Off the post and away! Got away with that."*
- *"Huge save from [keeper]! That was going in."*
- *"Cleared off the line! My heart nearly stopped."*

**Final minutes (winning narrowly):**
- *"Ten minutes. Just hold on."*
- *"Come on come on come on..."*
- *"Every clearance getting a cheer from the fans."*

**Final minutes (losing):**
- *"Running out of time here..."*
- *"Throwing everything at it. Need something."*
- *"Can anyone find a bit of magic?"*

**Full time (win):**
- *"FULL TIME! Three points! The lads were magnificent!"*
- *"That's it! Get in! What a result!"*
- *"Brilliant. Absolutely brilliant. The fans are loving it."*

**Full time (draw):**
- *"Full time. A point. I'll take it — they were tough today."*
- *"Hmm. A draw. Could've nicked it but could've lost it too."*

**Full time (loss):**
- *"Full time. Tough day. Nothing went for us."*
- *"Disappointing. The lads know it. Not good enough today."*

**Template variance:** Each mood/situation needs **15 variants minimum** to avoid repetition across a 50+ match season (and multiple seasons). High-frequency categories — Kev's quiet passage commentary, tense match lines, and goal celebrations — should target **20-25 variants** as these fire most often and will be the first to feel stale. Template authoring is a significant dedicated workstream (estimated 300-400 unique Kev templates alone, plus conditional NPC lines) and should be treated as such rather than written ad hoc during build. Templates include `[Scorer]`, `[Keeper]`, `[Player]` slots filled from match data.

### Val Okoro — Financial Texture

Val messages are sparse during the match — 2-3 per match maximum. She's not watching the football; she's watching the business.

**Home match:**
- *"Gate looking healthy today. North stand nearly full."*
- *"Hospitality boxes are packed. Good revenue day."*
- *"Programme sales brisk — [X] sold at half time."* (only if programme deal active)

**Away match:**
- *"Away match — no gate revenue today. Travel costs: £[X]."*
- *"At least the travel's cheap — [Opponent] is only down the road."*

**Post-goal (home, your team scores):**
- *"That'll boost season ticket renewals. Nice."*
- *"The sponsors will be happy with that."*

**Post-goal (home, opponent scores):**
- *"Atmosphere's dropped. That won't help next week's ticket sales."*

**Threshold-linked (only fires if Financial Health Bar is amber/red):**
- *"We really needed three points today. For the budget as much as the table."*

### Marcus Webb — Commercial Texture

Marcus messages are sponsor-linked and fan-engagement-focused. 1-3 per match.

**Sponsor references (only if relevant deals exist):**
- *"The [sponsor name] banner is getting great camera placement today."*
- *"[Sponsor contact] is in the box. Looking happy."*
- *"[Sponsor contact] just asked about extending the deal. Good sign."*

**Fan engagement:**
- *"Atmosphere is brilliant today. Social media going mad."*
- *"The fans are getting restless. Need a goal to lift them."*
- *"Away end is bouncing. Great support."*

**Post-goal:**
- *"That goal just went viral on the fan forum."*
- *"Merchandise stand will do well today after that."*

### Dani Lopes — Operational Texture

Dani messages are facilities-linked and practical. 1-2 per match.

**Facilities (only if relevant upgrades exist):**
- *"East stand food kiosk queue is massive. Good problem to have."* (if Food & Beverage upgraded)
- *"New floodlights working perfectly. Worth the investment."* (if Grounds & Security upgraded)
- *"Turnstile count confirmed — [X] through the gates."*
- *"Medical team on standby. Hopefully not needed."* (if Medical Centre upgraded)

**Operational issues (rare, add texture):**
- *"PA system playing up. Sorting it."*
- *"Slight delay at the north turnstiles. Resolved now."*

**Post-match:**
- *"Turnstile count confirmed — [X]. Travel costs covered."* (away)
- *"Ground staff getting the pitch sorted for next week."* (home)

---

## NPC Message Rules

### Frequency caps
| NPC | Messages per match | Reasoning |
|-----|-------------------|-----------|
| Kev | 12-20 | Primary narrator. Varies by match drama. |
| Val | 2-3 | Sparse. Financial texture, not commentary. |
| Marcus | 1-3 | Commercial colour. Only when relevant. |
| Dani | 1-2 | Operational detail. Grounding texture. |

**Total messages per match: ~18-28.** Spread across ~90 seconds = roughly one message every 3-5 seconds on average, but clustered around events with silences between.

### Conditional messages
Many NPC messages are conditional on game state:
- Marcus sponsor messages only fire if a sponsorship deal exists
- Dani facility messages only fire if the referenced facility has been upgraded
- Val programme messages only fire if the programme deal is active
- Val threshold messages only fire if the Financial Health Bar is amber or red

This means match day feels personalised — the NPCs reference *your* club, *your* decisions. A player who hasn't signed any sponsors won't hear Marcus talk about sponsors. A player who invested heavily in facilities will hear Dani reference them.

### Message timing
- NPC messages appear with a brief typing indicator (0.3-0.5s "..." before the message appears)
- Messages from different NPCs can cluster together (e.g., after a goal: Kev's reaction → 1s gap → Marcus's reaction → 1s gap → Val's reaction)
- Messages from the same NPC should have at least 5 seconds between them (Kev being the exception during intense passages)

---

## Crowd Audio State Machine

Four ambient audio tracks, crossfading between states. Each state is a looping audio file.

```
MURMUR ←→ BUILDING ←→ TENSE ←→ ROAR
                                  ↕
                               CELEBRATION
  ↕                               ↕
SILENT                          GROAN
  ↕
HOSTILE
```

| State | Audio character | Triggers |
|-------|----------------|----------|
| MURMUR | Low background hum. Comfortable. | Default state. Quiet passages. |
| BUILDING | Rising volume, chanting starts. | Play developing in attacking areas. |
| TENSE | Quieter but charged. Held breath. | Pre-chance moments. Penalty. Free kick. |
| ROAR | Explosive. Full stadium noise. | Your goal. Major chance. |
| CELEBRATION | Sustained cheering, singing. | Post-goal (your team). Full time win. |
| GROAN | Collective disappointment. | Opponent goal. Near miss (theirs). |
| SILENT | Near-silence. Stunned or flat. | Opponent goal at home (brief). Heavy defeat. |
| HOSTILE | Boos, angry chanting. | Poor performance at home, late in match. Rare. |

**Crossfade timing:** 0.5-1s transition between states. Abrupt transitions (TENSE → ROAR on a goal) should be faster (~0.3s). The crossfade smoothness is what makes it feel like a real crowd rather than sound effects.

**Home vs away:** The crowd audio should reflect whether you're home or away. Home matches: your fans are the dominant sound. Away matches: the home crowd is louder, your fans are a smaller pocket of noise. This can be done with volume mixing rather than separate tracks — away matches have the ROAR state at ~70% volume with a quieter layer of away-fan singing underneath.

**v1 (text only):** Crowd audio ships with v1 as the atmospheric base layer. Even without Kev's voice in audio, the crowd noise transforms the Owner's Box from "reading messages" to "being at a match." This is a high-value, low-effort addition.

---

## Stadium View During Match

The Owner's Box shows the stadium — ideally the existing isometric view, repurposed as the "view from the box."

### v1 (minimal)
The stadium view is mostly static during the match. A subtle overall visual pulse tied to the crowd audio state (slightly brighter on ROAR, slightly dimmer on SILENT) is enough to create a sense of life. No player blips, no tactical movement.

### v2 (SC2K phase)
When the SC2K visual overhaul lands, the stadium view during match day gains:
- Crowd-flash on Stands tiles (as specified in the Phase 7 backlog)
- The match day overlay with blips (as specified in the Phase 7 backlog)
- Per-facility micro-animations running throughout

The commentary engine doesn't need to change for v2 — it already emits `CrowdState` which the visual layer can use as a trigger for animations. The engine is decoupled from the renderer.

---

## Scoreboard

A small, persistent element in the Owner's Box — corner of screen, unobtrusive.

**Displays:**
- Score (updated on GOAL beats)
- Match minute (ticking, mapped from real-time via the timeline)
- Possession % (updated every ~20 in-game minutes)

**On goal:** The score flashes briefly (0.5s white flash, then settles). The match minute of the goal is annotated: "1-0 (67')".

**At half time:** Shows HT summary — shots, possession, best player rating.

**At full time:** Final score, man of the match, attendance.

---

## Determinism

The match timeline must be deterministic — given the same `MatchResult` and the same seed, `generateMatchTimeline()` must produce the same sequence of beats every time. This ensures:

1. **Replay consistency.** If save/load or replay features are added later, the match plays out identically.
2. **Template selection is seeded.** When multiple templates exist for a mood (e.g., 5 variants of "tense Kev"), the choice is made via seeded RNG, not `Math.random()`.
3. **NPC message selection is seeded.** Which conditional messages fire (from the eligible pool) is deterministic.

The seed should be derived from the existing match seed (gameWeek + team IDs), ensuring the commentary is tied to the specific match.

---

## Implementation Phasing

### Phase A: Core engine + Kev only
- `generateMatchTimeline()` function
- Beat types: KICKOFF, QUIET_PASSAGE, CHANCE, GOAL, NEAR_MISS, HALF_TIME, FULL_TIME
- Kev messages only (12-20 per match)
- Scoreboard component
- Phone thread UI (single-NPC)
- No audio

### Phase B: Full NPC cast + crowd audio
- Val, Marcus, Dani messages added (conditional on game state)
- Crowd audio state machine (4-8 looping tracks + crossfade logic)
- Full beat type roster (BUILDING_PRESSURE, MOMENTUM_SHIFT, SETBACK, FINAL_MINUTES, SECOND_HALF_START)
- Typing indicators on phone thread

### Phase C: Audio commentary (v2)
- ElevenLabs voice clone integration for Kev's commentary
- Recorded punctuation points (goal shouts, final whistle, near-miss reactions)
- Kev's text messages shift to private owner-only asides
- Audio sync with timeline beats

### Phase D: SC2K integration
- Stadium view animations tied to CrowdState
- Match day overlay with blips (Phase 7 backlog)
- Crowd-flash on Stands tiles
- Full visual integration — engine emits state, renderer consumes it

---

## Edge Cases

### Goalless draw (0-0)
Must not be boring. The timeline should include 3-4 NEAR_MISS or CHANCE beats to create drama. Kev's tone shifts from "it'll come" to "this is tense" to "we'll take a point." The match should feel hard-fought, not empty.

### Blowout (4-0+)
Risk of goal fatigue — the 4th goal can't feel as dramatic as the 1st. Solution: beat density drops after a 3-goal lead. Kev becomes more relaxed. Gaps between goals are longer. The atmosphere shifts from excitement to cruise control. Marcus starts talking about sponsors. The match winds down.

### Late equaliser against you
Maximum emotional contrast. The player has been comfortable, Kev is talking about three points, then: silence → TENSE crowd → opponent goal → SILENT crowd → Kev: "No. No no no. That is... that is devastating." → Val: "That changes the financial picture for this month." The engine needs to map the emotional shape — comfort → shock → despair — not just the event.

### Red card / injury
Currently out of scope for the match sim (noted in Phase 7 backlog). When added, they become beat types with their own micro-sequences and NPC reactions.

### Opponent's match (NPC results)
The commentary engine only fires for the player's matches. NPC results appear in the post-match newspaper / weekly summary as league table updates.

---

## Template Authoring Notes

The quality of the commentary templates is the single biggest determinant of whether the Owner's Box lands or flops. Guidelines for writing them:

1. **Short.** Phone messages should be 5-15 words. This isn't prose — it's texting. Kev doesn't write paragraphs during a match.
2. **In character.** Every message should sound like the NPC who sends it. Read it in their voice. If Val sounds excited, it's wrong. If Kev sounds measured, it's wrong.
3. **Varied.** 15 variants minimum per mood/situation; 20-25 for high-frequency categories (quiet passages, tense moments, goal celebrations). Players will watch 50+ matches a season across multiple seasons — repeated lines break the illusion fast. Template authoring is a major workstream in its own right.
4. **Player-name-aware.** Templates should reference actual player names from the squad wherever possible. "[Scorer] with a brilliant header" beats "A brilliant header."
5. **Decision-aware.** The best templates reference player decisions. "That training ground investment paying off" or "Knew we should've signed a left-back." These should be conditional — they only fire when the relevant decision exists in the game state.
6. **Emoji-light.** Kev might use the occasional exclamation but NPCs don't text in emoji. This is a professional group chat, not a friend group. The exception: Kev's goal celebrations can be raw and unstructured ("YESSSSS!!!!").
7. **Punctuation is pacing.** "He's through... one on one..." reads differently to "He's through, one on one." The ellipsis creates a pause in the reader's mind. Use it deliberately.

---

## Appendix: Example Full Match Timeline

**Context:** Home match, Week 14, vs. Barrow. You're 10th, they're 18th. You're slight favourites. Final result: 2-1 win (goals: 34', 58', 71').

| Real-time | Match min | Beat | Kev | Others | Crowd |
|-----------|-----------|------|-----|--------|-------|
| 0s | 0' | KICKOFF | "Here we go. Barrow at home. Let's have it." | | MURMUR |
| 6s | 8' | QUIET_PASSAGE | | Dani: "Good crowd today. North stand's full." | MURMUR |
| 12s | 15' | BUILDING_PRESSURE | "Good spell this. We're keeping the ball well." | | BUILDING |
| 18s | 22' | CHANCE | "Williams lets fly from 20 yards — just over! Getting closer." | | BUILDING→GROAN |
| 24s | 28' | QUIET_PASSAGE | (silence — 6 seconds) | | MURMUR |
| 30s | 34' | GOAL build-up | "Okafor picks it up on the left... cuts inside..." | | TENSE |
| 32s | 34' | (silence) | | | TENSE |
| 33.5s | 34' | GOAL | "SCORES! OKAFOR! What a goal! Cut inside and curled it into the far corner!" | | ROAR |
| 36s | 34' | GOAL aftermath | | Marcus: "Sponsor board right behind the goal there. Great shot for the cameras." Val: "Nice. That's the mood sorted." | CELEBRATION |
| 40s | 40' | QUIET_PASSAGE | "Comfortable now. Barrow look rattled." | | MURMUR |
| 44s | 45' | HALF_TIME | "Half time. Deserved lead. More of the same please." | Val: "Programme sales decent at the break — [X] sold." | MURMUR |
| 52s | 45' | SECOND_HALF_START | "Right, second half. Let's not sit back." | | MURMUR |
| 56s | 52' | BUILDING_PRESSURE | "We're pushing for a second. Barrow can't get out." | | BUILDING |
| 60s | 58' | GOAL build-up | "Free kick, edge of the box. Williams standing over it..." | | TENSE |
| 61.5s | 58' | (silence) | | | TENSE |
| 63s | 58' | GOAL | "IN! Williams! Straight in the top corner! 2-0!" | | ROAR |
| 66s | 58' | GOAL aftermath | "That is beautiful. The fans are loving this." | Dani: "Turnstile count: 3,800. Best of the season." | CELEBRATION |
| 70s | 65' | QUIET_PASSAGE | "Cruising now." | | MURMUR |
| 74s | 71' | SETBACK build-up | "Barrow with a corner... headed back across..." | | BUILDING |
| 76s | 71' | OPPONENT GOAL | "...it's in. Barrow pull one back. Sloppy." | | GROAN |
| 78s | 71' | Aftermath | "Come on. Don't let them back in this." | Val: "Still a good day. Don't need to panic." | MURMUR |
| 81s | 78' | FINAL_MINUTES | "Barrow pressing now. Last fifteen. Hold on." | | TENSE |
| 85s | 83' | NEAR_MISS | "Big save from [keeper]! Point blank! That was going in!" | | TENSE→ROAR |
| 89s | 88' | FINAL_MINUTES | "Two minutes. Just see it out." | | TENSE |
| 93s | 90' | FULL_TIME | "FULL TIME! 2-1! Three points! Nervy at the end but job done!" | Val: "Good day. Gate revenue plus three points. I'll take that." Dani: "Ground staff on it. Pitch held up well." | CELEBRATION |
