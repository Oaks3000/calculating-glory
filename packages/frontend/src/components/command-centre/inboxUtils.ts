import { GameEvent, LeagueTableEntry } from '@calculating-glory/domain';

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
