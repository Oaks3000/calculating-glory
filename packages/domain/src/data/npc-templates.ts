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
 */

// ── Val Okoro — Finance Director ───────────────────────────────────────────

/** Net positive (income exceeds wages). Val is dry, never effusive. */
export const VAL_SUMMARY_SURPLUS = [
  'Weekly position: income [INCOME], wages [WAGES]. Net [NET]/wk. Nothing requiring your attention.',
  'Finances in order. [NET]/wk net surplus. Budget [BUDGET]. Keep it steady.',
  'Weekly summary: [INCOME] in, [WAGES] out. Net [NET]. Comfortable position.',
  'Wage bill covered, revenue ahead of it. Net [NET]/wk. Runway healthy.',
  '[NET] net per week at current rates. Budget [BUDGET]. No flags from me.',
  'Income [INCOME], outgoings [WAGES]. Surplus of [NET]/wk. Fine.',
  'Clean week financially. [NET]/wk net. Nothing to worry about — yet.',
  'Summary: we made money this week. [NET] net. Budget [BUDGET]. Good.',
];

/** Burning slowly (runway 20+ weeks). Val is calm but watching. */
export const VAL_SUMMARY_GREEN = [
  'Weekly position: wages [WAGES], income [INCOME]. Burn [NET]/wk. Runway [RUNWAY] weeks — comfortable.',
  'Wages [WAGES], revenue [INCOME]. Net [NET]/wk. Runway [RUNWAY] weeks. Fine for now.',
  'Burning [NET]/wk at current rates. Budget [BUDGET], [RUNWAY] weeks of runway. Not a concern.',
  'Weekly summary: [INCOME] in, [WAGES] out. Net [NET]. [RUNWAY] weeks runway. Watching it.',
  'Finances stable. [RUNWAY] weeks of runway at this burn rate. Keep an eye on wages.',
  'Budget [BUDGET]. Burning [NET]/wk. [RUNWAY] weeks. Nothing urgent — but worth tracking.',
  'Wage bill [WAGES], income [INCOME]. Net [NET]/wk. Runway [RUNWAY] weeks. As expected.',
  'Weekly outgoings [WAGES], weekly revenue [INCOME]. Net [NET]. [RUNWAY] weeks. Steady.',
];

/** Runway amber (10–20 weeks). Val is measured but pointed. */
export const VAL_SUMMARY_AMBER = [
  'Weekly burn [NET]/wk. Budget [BUDGET], runway [RUNWAY] weeks. Getting tighter. Worth watching.',
  'Wages [WAGES] against income [INCOME]. Net [NET]/wk. Runway down to [RUNWAY] weeks. I\'d start thinking about this.',
  'Summary: burning [NET]/wk. [RUNWAY] weeks of runway left. Not critical, but not comfortable either.',
  'Budget [BUDGET]. Burn rate [NET]/wk. Runway [RUNWAY] weeks. You should have a plan if this doesn\'t improve.',
  '[RUNWAY] weeks of runway at current burn. That\'s not a lot of buffer if something unexpected comes up.',
  'Wage bill [WAGES]. Revenue [INCOME]. Net [NET]/wk. [RUNWAY] weeks. I\'d flag this as a concern.',
  'Burning [NET]/wk. [RUNWAY] weeks until the budget\'s gone. This needs attention.',
  'Net [NET]/wk outgoing. [RUNWAY] weeks runway. I\'ll keep saying it until the number improves.',
];

/** Runway red/critical (<10 weeks). Val is direct. */
export const VAL_SUMMARY_RED = [
  'Budget [BUDGET]. Burning [NET]/wk. Runway [RUNWAY] weeks. This is serious. We need to cut costs or find revenue.',
  '[RUNWAY] weeks of runway. At this burn rate, that\'s not enough. Something has to change.',
  'Wage bill [WAGES] exceeds income [INCOME] by [NET]/wk. Budget [BUDGET]. I\'m not going to dress this up — we\'re in trouble.',
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
  'Get in. [SCORE] against [OPPONENT]. Exactly what we needed.',
  '[SCORE]. [OPPONENT] was a tough ask today but the lads delivered. Happy.',
  'Three points in the bag. [SCORE] vs [OPPONENT]. Massive for the table.',
  'Job done. [SCORE] — [OPPONENT] didn\'t have an answer for us today.',
  'The lads were brilliant. [SCORE] against [OPPONENT]. That\'s a statement result.',
  '[SCORE]. Big win that. [OPPONENT] are no pushovers. The squad should be proud.',
  'Three points. The way we played against [OPPONENT] today — that\'s the standard I want.',
  '[SCORE] vs [OPPONENT]. Couldn\'t ask for more from the lads. Brilliant.',
  'That\'s the result we needed. [SCORE]. [OPPONENT] made it hard but we found a way.',
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
  '[SCORE] against [OPPONENT]. Not good enough. The lads know it.',
  'That one hurts. [SCORE] vs [OPPONENT]. We were second best today.',
  'Loss. [SCORE]. [OPPONENT] were sharper, more clinical. We have to be better.',
  '[SCORE] — [OPPONENT] deserved that. We didn\'t turn up in the key moments.',
  'Not a good day. [SCORE] vs [OPPONENT]. A few things to sort in the week.',
  '[SCORE]. We gave [OPPONENT] too much respect. We played scared.',
  'Beaten [SCORE] by [OPPONENT]. Disappointing. The response next week is what matters now.',
  '[SCORE] against [OPPONENT]. Hard to take. But we don\'t have time to dwell.',
  'The lads are quiet. [SCORE] vs [OPPONENT]. That one\'s on all of us.',
  '[SCORE]. [OPPONENT] were better. Simple as that. We need to respond.',
];

/** Kev: squad concern (squad < 14) */
export const KEV_SQUAD_CONCERN = [
  'Boss, we\'ve got [SQUAD] players. That\'s thin. One injury and we\'re in trouble.',
  'I need to flag the squad depth — [SQUAD] players is not enough. We need bodies.',
  '[SQUAD] in the squad. I\'m not going to panic, but I am going to flag this every week until it changes.',
  'Squad\'s at [SQUAD]. One or two knocks and we\'re struggling to fill positions. Worth addressing.',
  'Just to put it on record: [SQUAD] players. We need more cover. I\'d rather say it now than after someone gets injured.',
  'Boss, [SQUAD] is light. I know the budget\'s tight but we need to address squad depth.',
  '[SQUAD] players. Any manager would tell you that\'s not enough. The free agent list has options.',
  'We\'re running lean at [SQUAD]. Might be worth a look at the transfer market.',
];

/** Kev: good run of form (win streak 3+) */
export const KEV_FORM_GOOD = [
  'The lads are flying right now. Don\'t change what\'s working.',
  'Three wins on the bounce — the squad\'s in a great place. Momentum is real.',
  'Brilliant run of form. The training ground investment is paying off.',
  'The lads are believing right now. Keep giving them reasons to.',
  'Form\'s exceptional. This is a squad that knows how to win.',
];

/** Kev: poor run of form (loss streak 3+) */
export const KEV_FORM_POOR = [
  'Three losses in a row. I\'m not going to sugar-coat it — we need to turn this around fast.',
  'The lads need a result. Morale is taking a hit from this run.',
  'Poor form. Three straight defeats. Something has to change.',
  'We\'re in a bad run. The table doesn\'t lie. We need to respond this week.',
  'Three losses. The dressing room is quiet. We need a win — not a draw, a win.',
];

// ── Marcus Webb — Chief Scout ──────────────────────────────────────────────
//
// Placeholders:
//   [SQUAD]   — current squad count
//   [AGENTS]  — free agents currently available

/** Squad depth: strong (≥17 players). Marcus is measured, competent. */
export const MARCUS_SQUAD_STRONG = [
  'Squad at [SQUAD]. Good depth — we can handle rotation without worrying about injuries.',
  '[SQUAD] registered. Comfortable with the numbers. [AGENTS] agents on the market if you want to upgrade anyone.',
  'Scouting summary: [SQUAD] in the building, [AGENTS] free agents available. Good position to be in.',
  '[SQUAD] players — solid. Keep an eye on the free agent list though; it moves quickly.',
  'Squad depth looking healthy at [SQUAD]. The market has [AGENTS] options if anything comes up.',
];

/** Squad depth: adequate (14–16 players). Marcus is watchful. */
export const MARCUS_SQUAD_OK = [
  'We\'re at [SQUAD]. Workable for now, but one bad week of injuries could stretch us. [AGENTS] agents available.',
  '[SQUAD] registered — fine, not comfortable. Market shows [AGENTS] options if we need cover.',
  'Squad at [SQUAD]. I\'d ideally want 17+, but it\'s manageable. [AGENTS] free agents on file.',
  'Standard week — [SQUAD] players, [AGENTS] free agents. No urgency, but worth a scan.',
  '[SQUAD] in the squad. It\'s enough, as long as nothing goes wrong. [AGENTS] agents available if needed.',
];

/** Squad depth: thin (<14 players). Marcus is pointed. */
export const MARCUS_SQUAD_THIN = [
  '[SQUAD] players. That\'s the kind of squad where one hamstring pull becomes a selection problem. [AGENTS] agents are available now.',
  'Flagging again: [SQUAD] is too thin for a full season. [AGENTS] free agents out there — some decent options.',
  'Squad at [SQUAD]. I know Kev\'s said it too, but I\'ll add: the free agent list has [AGENTS] names on it right now.',
  '[SQUAD]. We\'re a small injury away from real trouble. [AGENTS] agents available — some of them won\'t be there next week.',
  'I keep saying [SQUAD] isn\'t enough. [AGENTS] free agents available. Some of them are better than you\'d expect.',
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
  '[POSITION]th in the division. That\'s the kind of number that keeps the board quiet. Long may it continue.',
  'Good week from a narrative standpoint. [POSITION]th place — people are talking positively.',
  'Position [POSITION]: fans engaged, board comfortable, press asking the right questions. Keep it going.',
  'Board confidence is at [BOARD]%. That\'s a healthy margin to work with. Nothing urgent from my side.',
  '[POSITION]th. Honest answer: this is the easy part to manage. Let\'s not waste it.',
];

/** League position: mid-table (9–18). Dani is measured, cautiously optimistic. */
export const DANI_PRESS_NEUTRAL = [
  '[POSITION]th. Solid mid-table. Not the story for the wrong reasons, which is fine by me.',
  'Position [POSITION] — board\'s watching, not panicking. That\'s the goal for now.',
  '[POSITION]th in the table. Board confidence at [BOARD]%. Manageable.',
  'Narrative\'s quiet this week — [POSITION]th, nothing inflammatory. That\'s a result in itself.',
  '[POSITION]th. Nothing to shout about, nothing to manage down. Mid-table is its own kind of peace.',
];

/** League position: danger zone (19+). Dani is frank, managing expectations. */
export const DANI_PRESS_NEGATIVE = [
  '[POSITION]th. We\'re in the part of the table where questions start. I\'m managing it — but they\'re coming.',
  'Board confidence at [BOARD]%. At [POSITION]th, every result carries weight. I can shape the narrative, but results are the only real fix.',
  'Position [POSITION] — local press has noticed. Nothing hostile yet, but I\'d rather we weren\'t here.',
  '[POSITION]th and the tone is shifting. I\'ll hold the line on comms, but I need results to work with.',
  'At [POSITION]th I can only do so much. [BOARD]% board confidence. Results move the dial, not press releases.',
];

/** Dani: positive result reaction (post-win). Fires alongside weekly report. */
export const DANI_RESULT_WIN = [
  'That result helps the narrative. Easier conversations all round when there\'s a win to point to.',
  'Win keeps the story clean this week. Nothing for me to manage.',
  'Good result for optics too. Board picks up on these — it all feeds into the confidence number.',
];

/** Dani: negative result reaction (post-loss). Fires alongside weekly report. */
export const DANI_RESULT_LOSS = [
  'I\'ll manage the press angle. But there\'s only so much spin can do — results are what moves people.',
  'More to navigate after that result. Nothing unmanageable, but I\'d rather have better news.',
  'Loss means the questions sharpen. I\'ll handle the comms side — you focus on the next result.',
];
