/**
 * Manager Archetype Message Templates
 *
 * Each archetype has distinct pools for five situations:
 *   POST_WIN       — after a victory
 *   POST_LOSS      — after a defeat
 *   FORM_GOOD      — 3+ wins in last 5
 *   FORM_POOR      — 3+ losses in last 5
 *   WEEKLY_CHECKIN — periodic check-in (every ~3 weeks, no match context needed)
 *
 * Placeholders: [MANAGER], [OPPONENT], [SCORE], [POSITION], [TOTAL], [CLUB]
 *
 * Voice guide per archetype:
 *   PHILOSOPHER    — Methodical. Talks in systems, process, structure. Never excited.
 *   SERGEANT       — Blunt, binary, accountability-first. No excuses. Short sentences.
 *   YOUTH_DEVELOPER — Patient, nurturing. Long-term arc. References development.
 *   PRAGMATIST     — Matter-of-fact. Numbers and margins. No drama.
 *   SHOWMAN        — Theatrical, emotional. Feeds off energy and momentum.
 */

import { ManagerArchetype } from './manager-archetypes';

// ── Template structure ─────────────────────────────────────────────────────

export interface ManagerMessagePools {
  postWin:       readonly string[];
  postLoss:      readonly string[];
  formGood:      readonly string[];
  formPoor:      readonly string[];
  weeklyCheckin: readonly string[];
}

// ── PHILOSOPHER ────────────────────────────────────────────────────────────

const PHILOSOPHER_POST_WIN: readonly string[] = [
  'The system is working. I said it would take time to click — and it\'s clicking.',
  'Good result. More importantly, we\'re seeing the patterns we\'ve worked on come through.',
  'Three points. Exactly what the structure asks for. We stay the course.',
  'That was disciplined football. The principles held. Keep building.',
  'A win built on process, not luck. That\'s the kind of result that compounds.',
];

const PHILOSOPHER_POST_LOSS: readonly string[] = [
  'A setback in the process. We identify what broke down, we correct it, we move forward.',
  'The principles were right. The execution wasn\'t. We work on that this week.',
  'Results like this are inevitable in a long season. What matters is how we respond.',
  'I\'ve reviewed the data. There were three moments we\'d do differently. We\'ll address them.',
  'The structure didn\'t fail us — we failed the structure. That\'s a coaching problem, and I own it.',
];

const PHILOSOPHER_FORM_GOOD: readonly string[] = [
  'This is what a well-structured side looks like when it finds its rhythm. Stay patient.',
  'The patterns we\'ve been building are paying off. Discipline got us here. Discipline keeps us here.',
  'Three wins from the last five. The system is functioning. Don\'t change anything.',
];

const PHILOSOPHER_FORM_POOR: readonly string[] = [
  'A difficult patch. I\'m not panicking. The structure hasn\'t changed — the execution needs work.',
  'We\'re not in a crisis. We\'re in a difficult spell. There\'s a meaningful difference.',
  'The underlying numbers are not as bad as the run suggests. We stay with the plan.',
];

const PHILOSOPHER_WEEKLY_CHECKIN: readonly string[] = [
  'We\'re on track. Don\'t judge the season by any individual week.',
  'I\'m watching the underlying numbers. Position isn\'t everything at this stage.',
  'Training has been structured and purposeful this week. I\'m satisfied with where we are.',
  'Patience is a competitive advantage. We have it. Let\'s keep it.',
];

// ── SERGEANT ───────────────────────────────────────────────────────────────

const SERGEANT_POST_WIN: readonly string[] = [
  'Good. That\'s what I expect. Do it again.',
  'Three points. Standards were met. Next game.',
  'When we work hard, we get results. That\'s the deal. We kept our end of it.',
  'Exactly what I asked for. No more, no less.',
  'That\'s the minimum. Don\'t let it go to your head.',
];

const SERGEANT_POST_LOSS: readonly string[] = [
  'Not good enough. I\'ve said that to the players. I\'m saying it to you now.',
  'We were second best. That ends now.',
  'No excuses. We work harder this week.',
  'I won\'t accept that performance. Neither should you.',
  'Second best in every department. Every single one. That changes in training tomorrow.',
];

const SERGEANT_FORM_GOOD: readonly string[] = [
  'This is what hard work gets you. Don\'t get comfortable — that\'s when standards slip.',
  'Three wins. Good. Now we show it wasn\'t a fluke.',
  'High standards produce high results. Keep the standards.',
];

const SERGEANT_FORM_POOR: readonly string[] = [
  'Three games without a win. I\'m not happy. The players know it.',
  'This stops now. I\'ve demanded a response. Watch what happens.',
  'Soft. We\'ve been soft. That changes this week or there will be consequences.',
];

const SERGEANT_WEEKLY_CHECKIN: readonly string[] = [
  'Standards are being maintained. For now.',
  'We\'re working hard. I\'m watching the effort levels closely.',
  'Nobody is comfortable in their position. Good. That\'s how it should be.',
  'The week has been acceptable. Acceptable isn\'t enough, but it\'s a start.',
];

// ── YOUTH DEVELOPER ────────────────────────────────────────────────────────

const YOUTH_DEVELOPER_POST_WIN: readonly string[] = [
  'The young lads were brilliant today. This is exactly why we invest in them.',
  'Results like this make the development work worthwhile. We\'re building something real here.',
  'Good win. More excitingly, some of the younger players are starting to really come on.',
  'Exactly what I hoped for. The squad is growing into this system together.',
  'That\'s the reward for patience. Brilliant.',
];

const YOUTH_DEVELOPER_POST_LOSS: readonly string[] = [
  'A learning game. The young players will be better for having experienced this.',
  'Disappointing result. But I\'ve seen plenty today to be positive about long-term.',
  'We lost today. In three or four years, some of these players will be playing at a much higher level. Keep perspective.',
  'Every setback is a lesson. We make sure the players understand what they\'re learning.',
  'It hurts. It should hurt. But we won\'t panic and abandon what we\'re building.',
];

const YOUTH_DEVELOPER_FORM_GOOD: readonly string[] = [
  'This run isn\'t a surprise to me. I\'ve watched this group develop. They were ready for it.',
  'When you invest in the right way, this is what you get. Not immediately — but eventually.',
  'The development work is paying dividends. This is the timeline we planned.',
];

const YOUTH_DEVELOPER_FORM_POOR: readonly string[] = [
  'A tough spell. But we won\'t panic and abandon what we\'re building.',
  'The players are learning what it takes at this level. That education has a cost sometimes.',
  'Development isn\'t linear. We knew there would be patches like this. We stay the course.',
];

const YOUTH_DEVELOPER_WEEKLY_CHECKIN: readonly string[] = [
  'Development takes time. We\'re seeing real progress in training this week.',
  'The young group is coming on. Don\'t judge this season purely by the table.',
  'I\'m more excited about this squad\'s ceiling than I am concerned about where we are now.',
  'We\'re planting seeds. Some of them will take a season or two to grow. Trust the process.',
];

// ── PRAGMATIST ─────────────────────────────────────────────────────────────

const PRAGMATIST_POST_WIN: readonly string[] = [
  'A professional win. We did what was required.',
  'Three points on the road. Exactly what we needed.',
  'We were the better side. Results like that are repeatable if we stay organised.',
  'Job done.',
  'Expected. We were better prepared. The preparation showed.',
];

const PRAGMATIST_POST_LOSS: readonly string[] = [
  'We gave away the margin. We\'ll be better next week.',
  'A poor result. We analyse it and move on.',
  'On the balance of chances, we probably deserved a point. We didn\'t get it. That happens.',
  'Disappointing, but not unexpected against a side like that. Reset and go again.',
  'The numbers will come right. One bad result doesn\'t change the underlying picture.',
];

const PRAGMATIST_FORM_GOOD: readonly string[] = [
  'Three wins from five. The numbers are moving in the right direction.',
  'Good form. Maintain the structure and it\'ll continue.',
  'We\'re efficient right now. Efficient wins football matches.',
];

const PRAGMATIST_FORM_POOR: readonly string[] = [
  'A difficult run. The data suggests it won\'t last if we stick to the plan.',
  'These things happen over a forty-six game season. The underlying numbers are fine.',
  'Variance. We\'re due a run. Keep working.',
];

const PRAGMATIST_WEEKLY_CHECKIN: readonly string[] = [
  'Nothing unusual to report. We\'re working well.',
  'Steady week. I\'ve got no particular concerns.',
  'The squad is in reasonable shape. We prepare for the next game.',
  'On track. No drama.',
];

// ── SHOWMAN ────────────────────────────────────────────────────────────────

const SHOWMAN_POST_WIN: readonly string[] = [
  'That\'s what this club can be when we believe in each other. That\'s the [CLUB] I know.',
  'Did you feel that atmosphere at the end? That\'s the energy we feed off. Unbelievable.',
  'We\'re flying right now. When this group clicks, nobody can stop us.',
  'Brilliant. Just brilliant. This is why I got into football.',
  'The crowd, the players, the occasion — everything came together. Days like this are everything.',
];

const SHOWMAN_POST_LOSS: readonly string[] = [
  'I\'m gutted. The players are gutted. We let the fans down and we know it.',
  'That wasn\'t us. That wasn\'t who we are. Next week is our chance to show our real face.',
  'A bad day. But I\'ve seen what this group can do when they\'re switched on. We\'ll be back.',
  'We owe the supporters a response. They were unbelievable today and we didn\'t give them what they deserved.',
  'There\'s hurt in that dressing room. Good. Use it.',
];

const SHOWMAN_FORM_GOOD: readonly string[] = [
  'We\'re on a roll and you can feel it around the whole club. Don\'t let it stop.',
  'This is momentum. You can\'t buy it. We have it. We protect it.',
  'The fans are buzzing, the players are buzzing — everything is alive right now.',
];

const SHOWMAN_FORM_POOR: readonly string[] = [
  'I need the players to find something deep down. The supporters deserve a reaction.',
  'We\'re in a rough patch. These are the moments that define a club\'s character.',
  'The noise outside doesn\'t help. I\'m blocking it out and so are the players. Watch what\'s coming.',
];

const SHOWMAN_WEEKLY_CHECKIN: readonly string[] = [
  'Energy in training has been electric this week. I like what I\'m seeing.',
  'The boys are fired up. Watch this space.',
  'Great atmosphere at the training ground. Everyone is bought in.',
  'There\'s a real belief running through this squad right now. I can feel it.',
];

// ── Assembled pools ────────────────────────────────────────────────────────

export const MANAGER_MESSAGE_POOLS: Record<ManagerArchetype, ManagerMessagePools> = {
  PHILOSOPHER: {
    postWin:       PHILOSOPHER_POST_WIN,
    postLoss:      PHILOSOPHER_POST_LOSS,
    formGood:      PHILOSOPHER_FORM_GOOD,
    formPoor:      PHILOSOPHER_FORM_POOR,
    weeklyCheckin: PHILOSOPHER_WEEKLY_CHECKIN,
  },
  SERGEANT: {
    postWin:       SERGEANT_POST_WIN,
    postLoss:      SERGEANT_POST_LOSS,
    formGood:      SERGEANT_FORM_GOOD,
    formPoor:      SERGEANT_FORM_POOR,
    weeklyCheckin: SERGEANT_WEEKLY_CHECKIN,
  },
  YOUTH_DEVELOPER: {
    postWin:       YOUTH_DEVELOPER_POST_WIN,
    postLoss:      YOUTH_DEVELOPER_POST_LOSS,
    formGood:      YOUTH_DEVELOPER_FORM_GOOD,
    formPoor:      YOUTH_DEVELOPER_FORM_POOR,
    weeklyCheckin: YOUTH_DEVELOPER_WEEKLY_CHECKIN,
  },
  PRAGMATIST: {
    postWin:       PRAGMATIST_POST_WIN,
    postLoss:      PRAGMATIST_POST_LOSS,
    formGood:      PRAGMATIST_FORM_GOOD,
    formPoor:      PRAGMATIST_FORM_POOR,
    weeklyCheckin: PRAGMATIST_WEEKLY_CHECKIN,
  },
  SHOWMAN: {
    postWin:       SHOWMAN_POST_WIN,
    postLoss:      SHOWMAN_POST_LOSS,
    formGood:      SHOWMAN_FORM_GOOD,
    formPoor:      SHOWMAN_FORM_POOR,
    weeklyCheckin: SHOWMAN_WEEKLY_CHECKIN,
  },
};
