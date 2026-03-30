import { GameEvent, LeagueTableEntry } from '@calculating-glory/domain';

// ── Seeded PRNG (splitmix32) ──────────────────────────────────────────────────

function splitmix32(seed: number) {
  let s = seed >>> 0;
  return function (): number {
    s = (s + 0x9e3779b9) >>> 0;
    let z = s;
    z = ((z ^ (z >>> 16)) * 0x85ebca6b) >>> 0;
    z = ((z ^ (z >>> 13)) * 0xc2b2ae35) >>> 0;
    return (z ^ (z >>> 16)) >>> 0;
  };
}

function seededPick<T>(arr: T[], rng: () => number): T {
  return arr[rng() % arr.length];
}

// ── News item types & constants ───────────────────────────────────────────────

/**
 * Large offset keeps news IDs from colliding with MATCH_SIMULATED event indices
 * (a full League Two season has ≤ ~1000 match events).
 */
export const NEWS_ID_OFFSET = 100_000;

export type NewsCategory = 'transfer' | 'injury' | 'league';

export interface NewsItem {
  /** Globally unique numeric ID for use in the dismissed Set. */
  id: number;
  category: NewsCategory;
  icon: string;
  headline: string;
  week: number;
}

// ── Narrative copy pools ──────────────────────────────────────────────────────

const TRANSFER_HEADLINES = [
  'Rumours link {rival} striker to a Premier League club.',
  'Sources claim {rival} are close to a seven-figure signing.',
  'Transfer window heats up: scouts seen watching League Two clash.',
  '{rival} reject bid for their top scorer — "not for sale."',
  'Agent spotted at {rival} training ground fuels speculation.',
  'Championship scouts have been watching {rival}\'s number nine.',
  'League Two clubs brace for January transfer activity.',
  'Big clubs circling: several League Two stars linked with moves up.',
  'Reported: {rival} set to offload fringe player this month.',
  'Scouts spotted at {stadium} ahead of upcoming fixtures.',
  'Rumour mill: agents circling players at {club} this week.',
];

const INJURY_HEADLINES = [
  'Muscle injuries on the rise as pitches harden into winter.',
  '{rival} confirm midfielder out for three weeks.',
  'Physio shortage hits clubs across the division.',
  'Weather-related pitch damage forces training schedule changes.',
  'Hamstring concerns cloud selection for several League Two sides.',
  'Club doctors warn of fixture congestion fatigue risk.',
  'Early-season injury list longer than expected across the division.',
  'Rest demanded: players union calls for match schedule review.',
];

const LEAGUE_HEADLINES = [
  'EFL announce stadium upgrade fund for lower league clubs.',
  'League Two: this season\'s goal tally already 10% above last year.',
  'Referee appointments criticised by multiple League Two managers.',
  'Fan attendance in League Two up 8% versus last campaign.',
  'Pitch conditions branded "unacceptable" after weekend downpours.',
  'League Two play-off race predicted to go to final day.',
  'TV cameras set to visit League Two for feature on rising clubs.',
  'League table chaos: six points separate positions 8 through 18.',
  'League Two clubs vote to trial new substitution rules next season.',
  'Board confidence crisis: two clubs reportedly looking for new managers.',
  'Pundits tipping {club} for a strong second half of the season.',
  '{club} fans vocal in their support at {stadium} this week.',
  'Full house at {stadium} as the fans get behind the team.',
];

const CATEGORY_META: Record<NewsCategory, { icon: string; headlines: string[] }> = {
  transfer: { icon: '🔄', headlines: TRANSFER_HEADLINES },
  injury:   { icon: '🩹', headlines: INJURY_HEADLINES  },
  league:   { icon: '📰', headlines: LEAGUE_HEADLINES  },
};

const ALL_CATEGORIES: NewsCategory[] = ['transfer', 'injury', 'league'];

// ── News builder ──────────────────────────────────────────────────────────────

/**
 * Deterministically generate 1–3 news items for a given week.
 * Items are seeded by week so they are stable across re-renders.
 *
 * @param week        Current game week (drives the seed)
 * @param rivals      Nearby club names from the table (used for flavour text substitution)
 * @param dismissed   Set of dismissed IDs (news IDs start at NEWS_ID_OFFSET)
 * @param clubName    Player's club name (used in {club} substitutions)
 * @param stadiumName Player's stadium name (used in {stadium} substitutions)
 */
export function buildNewsItems(
  week: number,
  rivals: string[],
  dismissed: Set<number>,
  clubName?: string,
  stadiumName?: string,
): NewsItem[] {
  if (week <= 0) return [];

  const rng   = splitmix32(week * 2654435761);
  const count = (rng() % 3) + 1; // 1–3 items

  // Shuffle categories for variety
  const cats = [...ALL_CATEGORIES].sort(() => (rng() % 2 === 0 ? -1 : 1));
  const items: NewsItem[] = [];

  for (let i = 0; i < count; i++) {
    const id = NEWS_ID_OFFSET + week * 10 + i;
    if (dismissed.has(id)) continue;

    const cat  = cats[i % cats.length];
    const meta = CATEGORY_META[cat];
    let headline = seededPick(meta.headlines, rng);

    // Substitute placeholders
    if (headline.includes('{rival}') && rivals.length > 0) {
      headline = headline.replace('{rival}', rivals[rng() % rivals.length]);
    } else {
      headline = headline.replace(/{rival}/g, 'A nearby side');
    }
    if (clubName)    headline = headline.replace(/{club}/g, clubName);
    if (stadiumName) headline = headline.replace(/{stadium}/g, stadiumName);
    // Strip any unreplaced placeholders
    headline = headline.replace(/\{club\}/g, 'the club').replace(/\{stadium\}/g, 'the ground');

    items.push({ id, category: cat, icon: meta.icon, headline, week });
  }

  return items;
}

// ── Shared types ──────────────────────────────────────────────────────────────

export interface MatchSimulatedEvent {
  type: 'MATCH_SIMULATED';
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
}

export type NotableReason = 'player' | 'leader' | 'rival' | 'relegation';

export interface NotableMatch {
  idx: number;
  homeId: string;
  awayId: string;
  home: string;
  away: string;
  homeGoals: number;
  awayGoals: number;
  reason: NotableReason;
  outcome: 'W' | 'D' | 'L' | null;
  headline: string;
}

// ── Outcome badge colours ─────────────────────────────────────────────────────

export const OUTCOME_STYLES: Record<string, string> = {
  W: 'bg-pitch-green text-white',
  D: 'bg-warn-amber text-white',
  L: 'bg-alert-red text-white',
};

export const REASON_ORDER: Record<NotableReason, number> = {
  player: 0, leader: 1, rival: 2, relegation: 3,
};

// ── Headline pools ────────────────────────────────────────────────────────────

const HEADLINES = {
  playerWin:  ['Three points — job done.', 'Victory keeps the pressure up.', 'Points on the board.', 'A big three points.'],
  playerDraw: ['A point salvaged.', 'Honours even at the final whistle.', 'Frustrating share of the spoils.'],
  playerLoss: ['Tough day at the office.', 'Back to the drawing board.', 'A result to put behind us.'],
  leaderWin:  ['Leaders extend their advantage.', 'Top of the table keeps rolling.', 'The leaders refuse to slip up.'],
  leaderDrop: ['Leaders drop points — the title race tightens.', 'Top spot wobbles — can anyone pounce?', 'Leaders held — the gap narrows.'],
  rivalWin:   ['Rival picks up three points — pressure mounts.', 'A nearby competitor wins — watch the table.', 'Rival momentum building.'],
  rivalSlip:  ['Rivals drop points — opportunity knocks.', 'A rival stumbles — the gap could shift.', 'Nearby side fails to win.'],
  relWin:     ['Survival scrap: crucial three points grabbed.', 'A basement battle won — breathing room below.', 'Fight at the bottom: one side edges ahead.'],
  relDraw:    ['Survival scrap: a point each.', 'Bottom-half teams share the spoils.', 'A point apiece in the relegation battle.'],
};

export function pick<T>(arr: T[], idx: number): T {
  return arr[Math.abs(idx) % arr.length];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getPlayerOutcome(
  homeId: string,
  awayId: string,
  homeGoals: number,
  awayGoals: number,
  clubId: string,
): 'W' | 'D' | 'L' | null {
  const isHome = homeId === clubId;
  const isAway = awayId === clubId;
  if (!isHome && !isAway) return null;
  if (homeGoals === awayGoals) return 'D';
  if (isHome) return homeGoals > awayGoals ? 'W' : 'L';
  return awayGoals > homeGoals ? 'W' : 'L';
}

export function buildHeadline(
  reason: NotableReason,
  homeId: string,
  _awayId: string,
  homeGoals: number,
  awayGoals: number,
  playerOutcome: 'W' | 'D' | 'L' | null,
  topThreeIds: Set<string>,
  rivalIds: Set<string>,
  idx: number,
): string {
  if (reason === 'player') {
    if (playerOutcome === 'W') return pick(HEADLINES.playerWin, idx);
    if (playerOutcome === 'D') return pick(HEADLINES.playerDraw, idx);
    if (playerOutcome === 'L') return pick(HEADLINES.playerLoss, idx);
    return 'Match result in.';
  }

  const isDraw  = homeGoals === awayGoals;
  const homeWon = homeGoals > awayGoals;

  if (reason === 'leader') {
    const isLeaderHome = topThreeIds.has(homeId);
    const leaderWon    = isLeaderHome ? homeWon : (!homeWon && !isDraw);
    if (isDraw || !leaderWon) return pick(HEADLINES.leaderDrop, idx);
    return pick(HEADLINES.leaderWin, idx);
  }

  if (reason === 'rival') {
    const isRivalHome = rivalIds.has(homeId);
    const rivalWon    = isRivalHome ? homeWon : (!homeWon && !isDraw);
    if (isDraw || !rivalWon) return pick(HEADLINES.rivalSlip, idx);
    return pick(HEADLINES.rivalWin, idx);
  }

  if (reason === 'relegation') {
    return isDraw ? pick(HEADLINES.relDraw, idx) : pick(HEADLINES.relWin, idx);
  }

  return 'Latest from around the league.';
}

// ── Main builder ──────────────────────────────────────────────────────────────

/**
 * Build a list of notable match results from game events.
 *
 * @param events     Full game event array
 * @param clubId     The player's club ID
 * @param leagueEntries  League table (sorted by position)
 * @param dismissed  Set of event indices the player has dismissed
 * @param roundWindow  Only look at the last N MATCH_SIMULATED events (undefined = all)
 */
export function buildNotableMatches(
  events: GameEvent[],
  clubId: string,
  leagueEntries: LeagueTableEntry[],
  dismissed: Set<number>,
  roundWindow?: number,
): NotableMatch[] {
  const nameMap         = new Map<string, string>(leagueEntries.map(e => [e.clubId, e.clubName]));
  const allMatchEvents  = events.filter(e => e.type === 'MATCH_SIMULATED') as MatchSimulatedEvent[];
  const source          = roundWindow ? allMatchEvents.slice(-roundWindow) : allMatchEvents;
  const offsetBase      = allMatchEvents.length - source.length;

  const playerPosition  = leagueEntries.findIndex(e => e.clubId === clubId);
  const topThreeIds     = new Set(leagueEntries.slice(0, 3).map(e => e.clubId));
  const relegationIds   = new Set(leagueEntries.slice(-3).map(e => e.clubId));
  const rivalIds        = playerPosition >= 0
    ? new Set(
        leagueEntries
          .slice(Math.max(0, playerPosition - 3), Math.min(leagueEntries.length, playerPosition + 4))
          .map(e => e.clubId)
          .filter(id => id !== clubId),
      )
    : new Set<string>();

  const matches: NotableMatch[] = [];

  source.forEach((m, localIdx) => {
    const idx    = offsetBase + localIdx;
    if (dismissed.has(idx)) return;

    const homeId = m.homeTeamId;
    const awayId = m.awayTeamId;

    let reason: NotableReason | null = null;
    if (homeId === clubId || awayId === clubId)         reason = 'player';
    else if (topThreeIds.has(homeId) || topThreeIds.has(awayId))   reason = 'leader';
    else if (relegationIds.has(homeId) || relegationIds.has(awayId)) reason = 'relegation';
    else if (rivalIds.has(homeId) || rivalIds.has(awayId))          reason = 'rival';
    if (!reason) return;

    const outcome  = getPlayerOutcome(homeId, awayId, m.homeGoals, m.awayGoals, clubId);
    const headline = buildHeadline(
      reason, homeId, awayId, m.homeGoals, m.awayGoals,
      outcome, topThreeIds, rivalIds, idx,
    );

    matches.push({
      idx, homeId, awayId,
      home: nameMap.get(homeId) ?? homeId,
      away: nameMap.get(awayId) ?? awayId,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      reason, outcome, headline,
    });
  });

  return matches;
}
