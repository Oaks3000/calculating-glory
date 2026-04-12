/**
 * NPC Inbox Message Templates
 *
 * Each pool is selected by seeded RNG so the same game state always produces
 * the same message. Placeholders are filled by generateNpcMessages().
 *
 * Placeholders:
 *   [WAGES]    — weekly wage bill, formatted (e.g. "£3,859")
 *   [INCOME]   — weekly income, formatted
 *   [NET]      — net per week (signed, e.g. "+£541" or "−£320")
 *   [RUNWAY]   — weeks of runway (integer)
 *   [BUDGET]   — current transfer budget, formatted
 *   [OPPONENT] — opponent team name
 *   [SCORE]    — match scoreline e.g. "2–1"
 *   [FORM]     — last 5 results string e.g. "W W D L W"
 *   [SQUAD]    — current squad count
 *   [STREAK]   — current streak length (wins or losses)
 *   [CLUB]     — club name (e.g. "Hartfield FC")
 *   [STADIUM]  — stadium name (e.g. "Calder Park")
 */

// ── Val Okoro — Finance Director ───────────────────────────────────────────

/** Net positive (income exceeds wages). Val is dry, never effusive. */
export const VAL_SUMMARY_SURPLUS = [
  'Weekly position: income [INCOME], wages [WAGES]. Net [NET]/wk. Nothing requiring your attention.',
  '[CLUB] finances in order. [NET]/wk net surplus. Budget [BUDGET]. Keep it steady.',
  'Weekly summary: [INCOME] in, [WAGES] out. Net [NET]. Comfortable position.',
  'Wage bill covered, revenue ahead of it. Net [NET]/wk. Runway healthy.',
  '[NET] net per week at current rates. Budget [BUDGET]. No flags from me.',
  'Income [INCOME], outgoings [WAGES]. Surplus of [NET]/wk. Fine.',
  'Clean week financially at [CLUB]. [NET]/wk net. Nothing to worry about — yet.',
  'Summary: [CLUB] made money this week. [NET] net. Budget [BUDGET]. Good.',
];

/** Burning slowly (runway 20+ weeks). Val is calm but watching. */
export const VAL_SUMMARY_GREEN = [
  'Weekly position: wages [WAGES], income [INCOME]. Burn [NET]/wk. Runway [RUNWAY] weeks — comfortable.',
  'Wages [WAGES], revenue [INCOME]. Net [NET]/wk. Runway [RUNWAY] weeks. Fine for now.',
  '[CLUB] burning [NET]/wk at current rates. Budget [BUDGET], [RUNWAY] weeks of runway. Not a concern.',
  'Weekly summary: [INCOME] in, [WAGES] out. Net [NET]. [RUNWAY] weeks runway. Watching it.',
  '[CLUB] finances stable. [RUNWAY] weeks of runway at this burn rate. Keep an eye on wages.',
  'Budget [BUDGET]. Burning [NET]/wk. [RUNWAY] weeks. Nothing urgent — but worth tracking.',
  'Wage bill [WAGES], income [INCOME]. Net [NET]/wk. Runway [RUNWAY] weeks. As expected.',
  'Weekly outgoings [WAGES], weekly revenue [INCOME]. Net [NET]. [RUNWAY] weeks. Steady.',
];

/** Runway amber (10–20 weeks). Val is measured but pointed. */
export const VAL_SUMMARY_AMBER = [
  '[CLUB] weekly burn [NET]/wk. Budget [BUDGET], runway [RUNWAY] weeks. Getting tighter. Worth watching.',
  'Wages [WAGES] against income [INCOME]. Net [NET]/wk. Runway down to [RUNWAY] weeks. I\'d start thinking about this.',
  'Summary: burning [NET]/wk. [RUNWAY] weeks of runway left. Not critical, but not comfortable either.',
  'Budget [BUDGET]. Burn rate [NET]/wk. Runway [RUNWAY] weeks. You should have a plan if this doesn\'t improve.',
  '[RUNWAY] weeks of runway at current burn. That\'s not a lot of buffer if something unexpected comes up at [CLUB].',
  'Wage bill [WAGES]. Revenue [INCOME]. Net [NET]/wk. [RUNWAY] weeks. I\'d flag this as a concern.',
  'Burning [NET]/wk. [RUNWAY] weeks until the budget\'s gone. This needs attention.',
  'Net [NET]/wk outgoing. [RUNWAY] weeks runway. I\'ll keep saying it until the number improves.',
];

/** Runway red/critical (<10 weeks). Val is direct. */
export const VAL_SUMMARY_RED = [
  '[CLUB] budget [BUDGET]. Burning [NET]/wk. Runway [RUNWAY] weeks. This is serious. We need to cut costs or find revenue.',
  '[RUNWAY] weeks of runway. At this burn rate, that\'s not enough. Something has to change.',
  'Wage bill [WAGES] exceeds income [INCOME] by [NET]/wk. Budget [BUDGET]. I\'m not going to dress this up — [CLUB] is in trouble.',
  'Net [NET]/wk outgoing. [RUNWAY] weeks left. This is the situation I\'ve been warning you about.',
  'Summary: [RUNWAY] weeks of runway. Wages [WAGES], revenue [INCOME]. We cannot sustain this.',
  '[RUNWAY] weeks. That\'s all. Something needs to change this week, not next week.',
  'Budget [BUDGET]. [RUNWAY] weeks of runway. This is a financial emergency. Your call.',
  'Burn [NET]/wk. [RUNWAY] weeks. I\'m out of diplomatic ways to put this.',
];

/** Standalone financial alert — fires if amber/red, separate from weekly summary */
export const VAL_ALERT_AMBER = [
  'Just flagging — runway is down to [RUNWAY] weeks. Not critical, but worth having a plan.',
  'Budget note: at current burn, we have [RUNWAY] weeks. I\'d start thinking about how to extend that.',
  'Runway [RUNWAY] weeks and falling. Nothing to panic about yet, but it\'s on my radar.',
  'I keep an eye on the runway number. It\'s at [RUNWAY] weeks. Just so you know.',
  'Current burn rate gives us [RUNWAY] weeks of runway. Worth keeping in mind when making commitments.',
];

export const VAL_ALERT_RED = [
  'Runway is [RUNWAY] weeks. This is the point where I stop saying "worth watching" and start saying "we have a problem."',
  '[RUNWAY] weeks of runway. I need you to take this seriously. What\'s the plan?',
  'Budget [BUDGET], runway [RUNWAY] weeks. We are running out of time. Your call, but make it soon.',
  'I\'ve run the numbers. [RUNWAY] weeks. That\'s it. Every decision you make right now has to account for this.',
  'Runway [RUNWAY] weeks. If you\'re not worried, you should be.',
];

// ── Kev Mulligan — Head of Football ───────────────────────────────────────

/** Post-match: win */
export const KEV_POST_MATCH_WIN = [
  'That\'s three points. The lads gave everything today — [OPPONENT] didn\'t like it. [SCORE].',
  'Get in. [SCORE] against [OPPONENT]. Exactly what [CLUB] needed.',
  '[SCORE]. [OPPONENT] was a tough ask today but the lads delivered. Happy.',
  'Three points in the bag. [SCORE] vs [OPPONENT]. Massive for [CLUB]\'s table.',
  'Job done. [SCORE] — [OPPONENT] didn\'t have an answer for us today.',
  'The lads were brilliant. [SCORE] against [OPPONENT]. That\'s a [CLUB] statement result.',
  '[SCORE]. Big win that. [OPPONENT] are no pushovers. [CLUB] should be proud.',
  'Three points. The way we played against [OPPONENT] today — that\'s the standard I want from [CLUB].',
  '[SCORE] vs [OPPONENT]. Couldn\'t ask for more from the lads. Brilliant.',
  'That\'s the result [CLUB] needed. [SCORE]. [OPPONENT] made it hard but we found a way.',
];

/** Post-match: draw */
export const KEV_POST_MATCH_DRAW = [
  'A point. [SCORE] vs [OPPONENT]. I won\'t lie — we probably deserved more, but a point\'s a point.',
  '[SCORE] against [OPPONENT]. We were better in patches. Should\'ve nicked it.',
  'Draw. [SCORE]. [OPPONENT] made it difficult. Not the result we wanted but the lads kept going.',
  '[SCORE] — [OPPONENT] equalised late. That\'s the frustrating part. Head up, we move on.',
  'A point at [OPPONENT]. [SCORE]. Season\'s long. We\'ll take it.',
  'Bit of a grind. [SCORE] vs [OPPONENT]. A point feels light but it\'s not nothing.',
  '[SCORE]. Neither side really took their chances today. [OPPONENT] were solid.',
  'A draw with [OPPONENT]. [SCORE]. There\'ll be better days. Focus on the next one.',
  '[SCORE] against [OPPONENT]. I thought we had enough to win it. We didn\'t. Next game.',
  'Frustrating draw. [SCORE] — [OPPONENT] will be pleased with that. We shouldn\'t be.',
];

/** Post-match: loss */
export const KEV_POST_MATCH_LOSS = [
  '[SCORE] against [OPPONENT]. Not good enough. The [CLUB] lads know it.',
  'That one hurts. [SCORE] vs [OPPONENT]. We were second best today.',
  'Loss. [SCORE]. [OPPONENT] were sharper, more clinical. [CLUB] has to be better.',
  '[SCORE] — [OPPONENT] deserved that. We didn\'t turn up in the key moments.',
  'Not a good day for [CLUB]. [SCORE] vs [OPPONENT]. A few things to sort in the week.',
  '[SCORE]. We gave [OPPONENT] too much respect. We played scared.',
  'Beaten [SCORE] by [OPPONENT]. Disappointing. The response next week is what matters now.',
  '[SCORE] against [OPPONENT]. Hard to take. But [CLUB] don\'t have time to dwell.',
  'The lads are quiet. [SCORE] vs [OPPONENT]. That one\'s on all of us.',
  '[SCORE]. [OPPONENT] were better. Simple as that. [CLUB] need to respond.',
];

/** Kev: squad concern (squad < 14) */
export const KEV_SQUAD_CONCERN = [
  'Boss, [CLUB] has got [SQUAD] players. That\'s thin. One injury and we\'re in trouble.',
  'I need to flag the squad depth — [SQUAD] players is not enough. We need bodies.',
  '[SQUAD] in the [CLUB] squad. I\'m not going to panic, but I am going to flag this every week until it changes.',
  'Squad\'s at [SQUAD]. One or two knocks and we\'re struggling to fill positions. Worth addressing.',
  'Just to put it on record: [SQUAD] players. We need more cover. I\'d rather say it now than after someone gets injured.',
  'Boss, [SQUAD] is light. I know the budget\'s tight but [CLUB] needs to address squad depth.',
  '[SQUAD] players. Any manager would tell you that\'s not enough. The free agent list has options.',
  '[CLUB]\'s running lean at [SQUAD]. Might be worth a look at the transfer market.',
];

/** Kev: good run of form (win streak 3+) */
export const KEV_FORM_GOOD = [
  'The [CLUB] lads are flying right now. Don\'t change what\'s working.',
  'Three wins on the bounce — the squad\'s in a great place. Momentum is real.',
  'Brilliant run of form. The training ground investment is paying off.',
  'The lads are believing right now. Keep giving [CLUB] reasons to.',
  'Form\'s exceptional. This is a [CLUB] squad that knows how to win.',
  'Marcus is already talking about a new merchandise line. That\'s how you know it\'s going well.',
  'Even Val seems less worried than usual. Three wins does that.',
];

/** Kev: poor run of form (loss streak 3+) */
export const KEV_FORM_POOR = [
  'Three losses in a row. I\'m not going to sugar-coat it — [CLUB] need to turn this around fast.',
  'The lads need a result. Morale is taking a hit from this run.',
  'Poor form. Three straight defeats. Something has to change at [CLUB].',
  'We\'re in a bad run. The table doesn\'t lie. We need to respond this week.',
  'Three losses. The dressing room is quiet. We need a win — not a draw, a win.',
  'Val\'s been looking at me differently this week. The kind of look that means "sort it out". Fair enough.',
];

// ── Marcus Webb — Commercial Director ─────────────────────────────────────
//
// Voice: warm, football-obsessed, occasionally over-enthusiastic.
// He genuinely loves the game and sees the commercial side as an extension of it.
// Placeholders: [POSITION], [INCOME], [BUDGET], [SQUAD], [AGENTS], [CLUB], [STADIUM]

/** Weekly commercial update: good table position (top 8). Marcus is energised. */
export const MARCUS_WEEKLY_POSITIVE = [
  '[POSITION]th in the table and I\'m already getting calls. Sponsors, local businesses, a couple of regional media outlets. Winning is the best marketing [CLUB] has.',
  'Good week commercially. When the results are coming in, people want to be associated with [CLUB]. That\'s how you turn a football club into a brand.',
  '[CLUB] at [POSITION]th — I\'ve been saying all season that strong form drives commercial revenue. The numbers are proving it. Keep it going.',
  'Honestly? This is my favourite part of the job. [POSITION]th, fans are buzzing, [STADIUM] has an atmosphere. That energy turns into income.',
  'Position [POSITION]. Matchday feel at [STADIUM] is electric right now. Even Val cracked a smile at the gate receipts this week.',
  'The lads are performing and the commercial side is riding the wave. [POSITION]th is exactly where you want to be for sponsor conversations.',
  'I love it when football and business align. [CLUB] at [POSITION]th — every partner we\'ve got is happy. New conversations are starting too.',
  '[POSITION]th. I\'ll take it. [STADIUM] looks brilliant when it\'s rocking and right now it is. That\'s worth more than I can put in a spreadsheet.',
];

/** Weekly commercial update: mid-table (9–18). Marcus is steady, looking for angles. */
export const MARCUS_WEEKLY_NEUTRAL = [
  'Mid-table week. Nothing to shout about commercially, but the club\'s in the conversation. [CLUB] at [POSITION]th — that\'s a workable story.',
  'Solid if unspectacular from a commercial standpoint. [POSITION]th doesn\'t generate headlines, but it keeps the doors open.',
  'I keep looking for the upside angle at [POSITION]th. It\'s there — consistency, reliability, a club that turns up every week. Some sponsors value that.',
  'Nothing dramatic this week. [CLUB] at [POSITION]th, which means I\'m having normal conversations rather than exciting ones. I\'ll take it over the alternative.',
  '[POSITION]th. We\'re fine. Commercial\'s ticking along. I want more, but I know how to build from here.',
  'Some weeks are about maintaining. [CLUB] at [POSITION]th — we\'re in the picture, we\'re not making anyone nervous. That\'s the position to grow from.',
  'Honestly, mid-table is where you build the commercial infrastructure. [POSITION]th now, but the relationships I\'m forming matter for when [CLUB] kicks on.',
];

/** Weekly commercial update: lower half (19+). Marcus is concerned but finding silver linings. */
export const MARCUS_WEEKLY_TOUGH = [
  'Look, I\'m not going to lie — [POSITION]th makes commercial conversations harder. But I\'ve worked with clubs in worse positions. The story isn\'t over.',
  '[POSITION]th. Sponsors get nervous around these numbers. I\'m managing expectations and reminding people that [CLUB]\'s trajectory matters as much as the current position.',
  'Tough week commercially. [POSITION]th generates questions from partners. The answer I\'m giving them is: this squad is better than the table says.',
  'I\'m still believing in [CLUB]. [POSITION]th isn\'t where we want to be, but the commercial infrastructure we\'re building doesn\'t disappear when results go wrong.',
  '[POSITION]th. Harder to sell, not impossible. The fans who stay when it\'s rough are the ones who shout loudest when it turns around.',
  'Some of my harder conversations this week. [POSITION]th puts sponsors on alert. I need results to back up what I\'m telling them about [CLUB]\'s direction.',
];

/** Marcus: post-match win reaction. Excited about atmosphere, fan energy, commercial pull. */
export const MARCUS_POST_MATCH_WIN = [
  'Brilliant result. I know that\'s Kev\'s territory, but a [SCORE] win at [STADIUM] — that\'s the kind of afternoon that brings people back next week.',
  '[SCORE] against [OPPONENT]. The place was alive today. This is exactly what I mean when I say results are the best marketing [CLUB] has.',
  'That win against [OPPONENT] — [SCORE] — I could hear it from the office. The commercial opportunity in a ground that sounds like that is real.',
  '[SCORE]. [OPPONENT] didn\'t know what hit them. Fan mood leaving [STADIUM] today was the best I\'ve seen it. That\'s going to show in next week\'s numbers.',
  'Three points and the energy in the stands was something else. [SCORE] vs [OPPONENT]. I\'ll be honest — I got a bit swept up in it. Good day.',
  '[SCORE] against [OPPONENT]. Three points and a matchday atmosphere we can build on. This is what I mean when I say wins compound commercially.',
];

/** Marcus: post-match draw reaction. Finds the positive angle, slightly deflated. */
export const MARCUS_POST_MATCH_DRAW = [
  'A point. [SCORE] against [OPPONENT]. Not the buzz I\'d hoped for but the fans left with something. That matters commercially — they\'ll be back.',
  '[SCORE] — draw with [OPPONENT]. Not every game ends with fireworks. The commercial side can work with consistency; it\'s easier than losing.',
  'Neither side took it today. [SCORE]. I keep an eye on fan sentiment after draws and it\'s... flat but not angry. I\'ll take that.',
  '[SCORE] vs [OPPONENT]. A draw\'s a draw — the fans know we didn\'t lose and that counts for something. Not ideal, but manageable.',
  'I wanted more, honestly. [SCORE] against [OPPONENT]. But a point in the bag and the fans decent about it — worse days exist.',
];

/** Marcus: post-match loss reaction. Worried about sentiment, thinks long-term. */
export const MARCUS_POST_MATCH_LOSS = [
  'Tough one. [SCORE] against [OPPONENT]. I\'m monitoring fan channels — the mood\'s low but not panicked. We need a result next week to hold the narrative.',
  '[SCORE] vs [OPPONENT]. I won\'t dress it up — losses make my job harder. But I\'ve seen clubs come back from worse runs. The fanbase at [CLUB] knows that.',
  'Not what we needed. [SCORE] against [OPPONENT]. I\'m keeping commercial conversations warm, but I need the team to give me something to work with.',
  '[SCORE]. [OPPONENT] were better today. The commercial angle takes a hit after a result like that — partners notice. Kev needs to sort the next one.',
  'I hate losing. Most people think the commercial side doesn\'t care as long as the money\'s there. It\'s not true — I care about the result. [SCORE] hurts.',
];

/** Marcus and Kev: big win (3+ goal margin). Special celebratory pool. */
export const MARCUS_BIG_WIN = [
  'That was a statement. [SCORE] against [OPPONENT] — when [CLUB] plays like that, every commercial conversation I have this week gets easier. Incredible.',
  '[SCORE] vs [OPPONENT]! I know I\'m supposed to stay professional but come on. That\'s the kind of result that gets [CLUB] noticed beyond this division.',
  'I was in the stands for that. [SCORE] against [OPPONENT]. The noise at [STADIUM] was something I\'ll remember. Commercially, that\'s a goldmine — that\'s the story we sell.',
  '[SCORE]! Against [OPPONENT]! I texted three different sponsors after the final whistle. They were already watching. This is what I\'ve been building towards at [CLUB].',
];

export const KEV_BIG_WIN = [
  'That\'s how [CLUB] should play. [SCORE] against [OPPONENT] — complete performance. The lads were outstanding.',
  '[SCORE]. We were dominant from the first whistle. [OPPONENT] didn\'t have an answer and we didn\'t let them find one. Brilliant day.',
  'Don\'t change anything. [SCORE] vs [OPPONENT] — the lads were electric. This is what the squad is capable of when everything clicks.',
  '[SCORE] against [OPPONENT]. I keep my emotions in check but I\'ll admit — that one felt good. That\'s what I wanted from this [CLUB] squad.',
  'Statement win. [SCORE]. [OPPONENT] are a decent side and we made them look very ordinary today. I\'m proud of the lads.',
];

/** Standalone: market busy (≥20 free agents). Marcus flags the opportunity. */
export const MARCUS_MARKET_BUSY = [
  'Free agent market is busy right now — [AGENTS] available. Good window if you\'re thinking about recruitment.',
  'Market\'s well-stocked at [AGENTS] agents. Worth a look if there\'s a gap you want to fill.',
  '[AGENTS] free agents on file. Broad range of quality. If there\'s a position you need, now\'s not a bad time.',
];

/** Standalone: market quiet (≤8 free agents). Marcus flags the scarcity. */
export const MARCUS_MARKET_QUIET = [
  'Free agent market\'s thin — only [AGENTS] available. If you need someone, don\'t sit on it.',
  'Slim pickings out there: [AGENTS] agents. The pool tends to restock, but right now it\'s lean.',
  'Just [AGENTS] free agents on the market. Move quickly if you see someone worth signing.',
];

// ── Dani Osei — Press Officer ──────────────────────────────────────────────
//
// Placeholders:
//   [POSITION]  — current league position (integer, 1 = top)
//   [TOTAL]     — total teams in league
//   [BOARD]     — board confidence % (integer)

/** League position: strong (top 8). Dani is smooth, managing from a good place. */
export const DANI_PRESS_POSITIVE = [
  '[CLUB] are [POSITION]th in the division. That\'s the kind of number that keeps the board quiet. Long may it continue.',
  'Good week from a narrative standpoint. [POSITION]th place — people are talking positively about [CLUB].',
  'Position [POSITION]: fans engaged, board comfortable, press asking the right questions. Keep it going.',
  'Board confidence is at [BOARD]%. That\'s a healthy margin to work with. Nothing urgent from my side.',
  '[POSITION]th. Honest answer: this is the easy part to manage. Let\'s not waste it.',
];

/** League position: mid-table (9–18). Dani is measured, cautiously optimistic. */
export const DANI_PRESS_NEUTRAL = [
  '[CLUB] are [POSITION]th. Solid mid-table. Not the story for the wrong reasons, which is fine by me.',
  'Position [POSITION] — board\'s watching, not panicking. That\'s the goal for now.',
  '[POSITION]th in the table. Board confidence at [BOARD]%. Manageable.',
  'Narrative\'s quiet this week — [CLUB] at [POSITION]th, nothing inflammatory. That\'s a result in itself.',
  '[POSITION]th. Nothing to shout about, nothing to manage down. Mid-table is its own kind of peace.',
];

/** League position: danger zone (19+). Dani is frank, managing expectations. */
export const DANI_PRESS_NEGATIVE = [
  '[CLUB] are [POSITION]th. We\'re in the part of the table where questions start. I\'m managing it — but they\'re coming.',
  'Board confidence at [BOARD]%. At [POSITION]th, every result carries weight. I can shape the narrative, but results are the only real fix.',
  'Position [POSITION] — local press has noticed [CLUB]. Nothing hostile yet, but I\'d rather we weren\'t here.',
  '[POSITION]th and the tone is shifting. I\'ll hold the line on comms, but I need results to work with.',
  'At [POSITION]th I can only do so much. [BOARD]% board confidence. Results move the dial, not press releases.',
];

/** Dani: positive result reaction (post-win). Fires alongside weekly report. */
export const DANI_RESULT_WIN = [
  'That result helps the narrative. Easier conversations all round when there\'s a win to point to.',
  'Win keeps the story clean this week. Nothing for me to manage.',
  'Good result for optics too. Board picks up on these — it all feeds into the confidence number.',
  'Marcus is already drafting something for the socials. I\'m choosing not to get involved. Win was good though.',
  'The board noticed. They always notice wins more than they notice the steady weeks. That\'s just how it is.',
];

/** Dani: draw result reaction (post-draw). Dry, measured. */
export const DANI_RESULT_DRAW = [
  'A point. Not the win I wanted for the press angle, but it\'s not a loss. Easier to manage than yesterday.',
  'Draw. Board won\'t panic. Press can work with "unbeaten". I\'ll take it.',
  'Shared the spoils. Nothing inflammatory to manage this week. That\'s fine by me.',
  'A draw is the most neutral outcome in football. From a comms standpoint, that\'s almost restful.',
];

/** Dani: negative result reaction (post-loss). Fires alongside weekly report. */
export const DANI_RESULT_LOSS = [
  'I\'ll manage the press angle. But there\'s only so much spin can do — results are what moves people.',
  'More to navigate after that result. Nothing unmanageable, but I\'d rather have better news.',
  'Loss means the questions sharpen. I\'ll handle the comms side — you focus on the next result.',
  'Marcus has already phoned three times with "angles". I\'ve told him to give it 24 hours.',
  'Board\'s quiet for now. They won\'t stay quiet if this becomes a run. Talk to Kev.',
];

// ── Kev: extended streaks ──────────────────────────────────────────────────
//
// Fires on a 5-game winning/losing run. Distinct from the 3-game pools —
// Kev is more emphatic when the streak has gone on this long.
// Placeholders: [STREAK]

/** Kev: 5+ game winning run. Quietly thrilled but still grounded. */
export const KEV_STREAK_WIN_5 = [
  'Five wins on the bounce. I keep waiting for [CLUB] to slip up and it\'s not happening. The squad\'s in a brilliant place.',
  '[STREAK] straight wins. I\'ve been doing this long enough to know — don\'t change a thing. Keep the rhythm going.',
  'This is a proper run now. [STREAK] wins. The [CLUB] lads are competing like a team that believes it can go all the way.',
  '[STREAK]-game winning streak. I don\'t want to jinx it but I\'m going to say it — this [CLUB] squad is something special right now.',
  'That\'s [STREAK] in a row. At some point this stops being form and starts being standard. I like it.',
];

/** Kev: 5+ game losing run. Frank, not panicking, but serious. */
export const KEV_STREAK_LOSS_5 = [
  '[STREAK] straight defeats. I\'m not going to lie to you — that\'s a crisis for [CLUB]. We need to figure this out before it gets worse.',
  'Five losses. Morale in the dressing room is the lowest I\'ve seen it. The lads need a result, not just a pep talk.',
  '[STREAK] games. That\'s not bad form, that\'s a serious problem. Something has to change at [CLUB] — tactics, squad, something.',
  'The run is [STREAK] now. Every manager goes through a bad patch. But this one needs to end this week.',
  '[STREAK] defeats on the bounce. I\'ll be honest — I\'m worried. Not about my job, about [CLUB]. What\'s the plan?',
];

// ── Kev: table position reactions ──────────────────────────────────────────
//
// Fires when the club enters or holds a notable table position.
// Kev picks this up because it directly affects the squad\'s mentality.
// Placeholders: [POSITION]

/** Kev: automatic promotion zone (top 3). Quietly excited, eyes on the prize. */
export const KEV_PROMOTION_ZONE = [
  '[CLUB] are in the top three. I keep saying it to the lads — this is real. Don\'t throw it away.',
  '[POSITION]th. The lads can see the promotion places. It\'s not a dream anymore. Don\'t let them think it is.',
  'Top three. Every session this week I\'ve had to keep their feet on the ground. The focus has to stay sharp.',
  'The table doesn\'t lie. [CLUB] are [POSITION]th — we\'re in the hunt. Stay disciplined, don\'t get giddy.',
  'Promotion places. [CLUB] are there. Protect what we\'ve built — one game at a time.',
];

/** Kev: automatic relegation zone (bottom 4). Grim, practical, no drama. */
export const KEV_RELEGATION_ZONE = [
  'The table\'s honest. [CLUB] are [POSITION]th — we\'re in the drop zone. I\'d rather say that clearly than dress it up.',
  'Bottom four. I\'m not going to pretend otherwise. The lads know it. [CLUB] need points, not excuses.',
  '[POSITION]th. Relegation zone. Every point from here is massive. Simple.',
  '[CLUB] are in the places you don\'t want to be. [POSITION]th. The squad\'s been told — no hiding, no pointing fingers.',
  'Down in [POSITION]th. I\'ve kept squads up from worse. But [CLUB] need honesty and hard work from everyone.',
];

// ── Marcus: commercial observations ───────────────────────────────────────
//
// Fires roughly every 6 weeks. Marcus steps outside his scouting brief
// to share an observation about the commercial side of the club — fan zone,
// attendance, income trends. Warm, football-obsessed, slightly over-enthusiastic.
// Placeholders: [POSITION], [INCOME], [BUDGET], [SQUAD]

// ── Kev: all-time club record win ─────────────────────────────────────────
//
// Fires when a big win (3+ goal margin) beats the existing all-time record.
// Replaces KEV_BIG_WIN on those occasions. Kev is historically aware.
// Placeholders: [SCORE], [OPPONENT], [CLUB], [STADIUM]

export const KEV_CLUB_RECORD_WIN = [
  "That's [CLUB] history right there. [SCORE] against [OPPONENT] — I've seen a lot of games at [STADIUM] and that goes straight to the top.",
  "[SCORE] vs [OPPONENT]. New club record. I don't say this lightly — that performance will be talked about here for a long time.",
  "Best result in [CLUB]'s history. [SCORE]. [OPPONENT] never got near us. Write it down.",
  "Record win. [SCORE] against [OPPONENT]. If the lads didn't believe before, they should now. [CLUB] can do anything this season.",
  "[SCORE] vs [OPPONENT] — that's the new benchmark for this club. Everything we do from here should be measured against that.",
];

// ── Kev: previous season top scorer recall ────────────────────────────────
//
// Fires early in a new season (or every 8 weeks) when clubRecords.topScorer
// exists from a prior season. Kev sets expectations based on what came before.
// Placeholders: [TOP_SCORER], [TOP_SCORER_GOALS], [CLUB]

export const KEV_TOP_SCORER_RECALL = [
  "[TOP_SCORER] with [TOP_SCORER_GOALS] last season. That's the standard now. I want someone at [CLUB] chasing that down.",
  "Don't forget what [TOP_SCORER] gave us — [TOP_SCORER_GOALS] goals. That kind of output doesn't just happen. We need to build on it.",
  "I think about [TOP_SCORER] and [TOP_SCORER_GOALS] goals. That's what a proper [CLUB] front line looks like. Let's get back there.",
  "[TOP_SCORER_GOALS] goals from [TOP_SCORER] last season. Whoever steps up this year has a real target to aim at.",
  "The bar's been set. [TOP_SCORER] — [TOP_SCORER_GOALS] goals. I tell every forward we bring in: that's what [CLUB] expects.",
];

// ── Marcus: attendance buzz from good form ────────────────────────────────
//
// Fires when form is strong (4+ wins in last 5). Marcus links fan energy
// to commercial opportunity. Enthusiastic but grounded.
// Placeholders: [CLUB], [STADIUM], [STREAK]

export const MARCUS_ATTENDANCE_BUZZ = [
  "The crowds are responding. [STREAK] wins and [STADIUM] is generating real energy. Sponsors notice that — I've already had three conversations this week.",
  "When [CLUB] are on a run like this, the commercial side looks after itself. Attendance up, noise up, revenue up. This is when we push.",
  "[STADIUM] has been loud lately. [STREAK]-game run — the fans can feel something building. That atmosphere is worth money and I intend to use it.",
  "Good form means full houses. Full houses mean I can have proper commercial conversations. [CLUB] on a [STREAK]-game run is the story I want to tell.",
  "I track the matchday atmosphere as much as the results. Right now at [STADIUM] it's excellent. [STREAK] wins does that. Let's keep it going.",
];

// ── Marcus: attendance concerns from poor form ────────────────────────────
//
// Fires when form is poor (4+ losses in last 5). Marcus is direct but
// not alarmist — he's problem-solving, not panicking.
// Placeholders: [CLUB], [STADIUM], [STREAK]

export const MARCUS_ATTENDANCE_QUIET = [
  "I'll be straight with you — [STREAK] defeats and the atmosphere at [STADIUM] is subdued. The commercial conversations get harder when that happens.",
  "Matchday revenues are softer. [CLUB] on a [STREAK]-game losing run — it shows in the stands. Results are the only thing that fixes it.",
  "The fan zone was quieter than usual. [STREAK] losses will do that. I'm not panicking but I am paying attention.",
  "Hard to sell positivity after [STREAK] defeats. [STADIUM] feels it. I'll keep working the commercial side but I need something to point to.",
  "[STREAK] losses. The energy's gone flat at [STADIUM]. Come on — give me something to work with.",
];

export const MARCUS_COMMERCIAL_OBS = [
  'Not really my area, but I walked past the fan zone at [STADIUM] yesterday and it was buzzing. That atmosphere carries into the ground — I genuinely believe it helps the lads.',
  'Had a look at the matchday attendance numbers. When [CLUB] are playing well, the ground fills up. The connection between results and revenue is real. Win more, earn more — simple.',
  'Saw some of the hospitality figures. There\'s real money in making the matchday experience at [STADIUM] good. The commercial side matters more than people think.',
  '[STADIUM]\'s generating [INCOME]/week. That\'s the engine. Every facility upgrade is an investment in what [CLUB] can build next. Worth knowing.',
  'I know this is Val\'s territory, but I pay attention: the clubs that invest in the commercial side early are the ones who can afford better players later. Just saying.',
  'Bit of unsolicited analysis: [CLUB] are [POSITION]th in the league and the fanbase feels it. Winning brings people in, people in means income, income means better players. It\'s all connected.',
  'Word from the youth players — they want to play for a club with a buzz about it. Commercial investment creates that at [CLUB]. It\'s not just about money.',
  'The food and beverage revenue on matchday at [STADIUM] is underrated. I know it sounds unglamorous but a well-run concession adds up over a season. Val\'s probably already told you this.',
];
