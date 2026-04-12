/**
 * NPC Character Message Generator
 *
 * Derives a list of NpcMessages from the current GameState.
 * Pure function — no side effects, no new events.
 * Deterministic: same state → same messages, via seeded RNG.
 */

import { GameState } from '../types/game-state-updated';
import { GameEvent, MatchSimulatedEvent } from '../events/types';
import { computeWeeklyFinancials } from './revenue';
import { formatMoney } from '../money/utils';
import { createRng } from './rng';
import {
  VAL_SUMMARY_SURPLUS,
  VAL_SUMMARY_GREEN,
  VAL_SUMMARY_AMBER,
  VAL_SUMMARY_RED,
  VAL_ALERT_AMBER,
  VAL_ALERT_RED,
  KEV_POST_MATCH_WIN,
  KEV_POST_MATCH_DRAW,
  KEV_POST_MATCH_LOSS,
  KEV_SQUAD_CONCERN,
  KEV_FORM_GOOD,
  KEV_FORM_POOR,
  KEV_STREAK_WIN_5,
  KEV_STREAK_LOSS_5,
  KEV_PROMOTION_ZONE,
  KEV_RELEGATION_ZONE,
  KEV_BIG_WIN,
  MARCUS_WEEKLY_POSITIVE,
  MARCUS_WEEKLY_NEUTRAL,
  MARCUS_WEEKLY_TOUGH,
  MARCUS_MARKET_BUSY,
  MARCUS_MARKET_QUIET,
  MARCUS_COMMERCIAL_OBS,
  MARCUS_POST_MATCH_WIN,
  MARCUS_POST_MATCH_DRAW,
  MARCUS_POST_MATCH_LOSS,
  MARCUS_BIG_WIN,
  DANI_PRESS_POSITIVE,
  DANI_PRESS_NEUTRAL,
  DANI_PRESS_NEGATIVE,
  DANI_RESULT_WIN,
  DANI_RESULT_DRAW,
  DANI_RESULT_LOSS,
  KEV_CLUB_RECORD_WIN,
  KEV_TOP_SCORER_RECALL,
  MARCUS_ATTENDANCE_BUZZ,
  MARCUS_ATTENDANCE_QUIET,
} from '../data/npc-templates';

// ── Types ──────────────────────────────────────────────────────────────────

export type NpcSender = 'VAL' | 'KEV' | 'MARCUS' | 'DANI';

export type NpcMessageCategory =
  | 'WEEKLY_SUMMARY'
  | 'POST_MATCH'
  | 'FINANCIAL_ALERT'
  | 'SQUAD_CONCERN'
  | 'FORM_UPDATE'
  | 'STREAK_UPDATE'
  | 'TABLE_UPDATE'
  | 'COMMERCIAL_UPDATE';

export interface NpcMessage {
  /** Stable ID for React keys: `${sender}-${category}-w${week}-s${season}` */
  id: string;
  sender: NpcSender;
  text: string;
  week: number;
  season: number;
  category: NpcMessageCategory;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[], rng: ReturnType<typeof createRng>): T {
  return arr[Math.floor(rng.next() * arr.length)];
}

function fillPlaceholders(
  template: string,
  vars: Partial<Record<string, string>>
): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), val ?? '?');
  }
  return result;
}

/** Signed money string: "+£541" or "−£320" */
function signedMoney(pence: number): string {
  const abs = formatMoney(Math.abs(pence));
  return pence >= 0 ? `+${abs}` : `\u2212${abs}`; // − is Unicode minus
}

// ── Generator ──────────────────────────────────────────────────────────────

/**
 * Generate the NPC inbox messages for the current game state.
 *
 * Should be called once per render — the output is deterministic
 * for a given state so multiple calls return identical results.
 */
export function generateNpcMessages(
  state: GameState,
  events: GameEvent[]
): NpcMessage[] {
  // No NPC messages before the season starts
  if (state.phase === 'PRE_SEASON' || state.currentWeek === 0) return [];

  const { week, season } = { week: state.currentWeek, season: state.season };
  const rng = createRng(`npc-${season}-${week}`);
  const messages: NpcMessage[] = [];

  const { weeklyIncome, weeklyWages, runway } =
    computeWeeklyFinancials(state);
  const netPerWeek = weeklyIncome - weeklyWages; // positive = surplus

  // ── Shared fill vars ───────────────────────────────────────────────────

  const playerPosition = state.league.entries.findIndex(e => e.clubId === state.club.id) + 1;
  const agentCount = state.freeAgentPool?.length ?? 0;

  const records = state.clubRecords;
  const topScorer = records?.topScorer;
  const biggestWin = records?.biggestWin;

  const fillVars: Record<string, string> = {
    WAGES:             formatMoney(weeklyWages),
    INCOME:            formatMoney(weeklyIncome),
    NET:               signedMoney(netPerWeek),
    RUNWAY:            runway === Infinity ? '99+' : String(Math.floor(runway)),
    BUDGET:            formatMoney(state.club.transferBudget),
    SQUAD:             String(state.club.squad.length),
    AGENTS:            String(agentCount),
    POSITION:          playerPosition > 0 ? String(playerPosition) : '?',
    TOTAL:             String(state.league.entries.length),
    BOARD:             String(state.boardConfidence),
    CLUB:              state.club.name,
    STADIUM:           state.club.stadium.name,
    TOP_SCORER:        topScorer?.name ?? '',
    TOP_SCORER_GOALS:  topScorer ? String(topScorer.goals) : '',
    BIGGEST_WIN_SCORE: biggestWin ? `${biggestWin.playerGoals}–${biggestWin.opponentGoals}` : '',
    BIGGEST_WIN_OPP:   biggestWin?.opponentName ?? '',
  };

  // ── Val weekly summary ─────────────────────────────────────────────────

  let valPool: readonly string[];
  if (netPerWeek >= 0) {
    valPool = VAL_SUMMARY_SURPLUS;
  } else if (runway >= 20) {
    valPool = VAL_SUMMARY_GREEN;
  } else if (runway >= 10) {
    valPool = VAL_SUMMARY_AMBER;
  } else {
    valPool = VAL_SUMMARY_RED;
  }

  messages.push({
    id: `VAL-WEEKLY_SUMMARY-w${week}-s${season}`,
    sender: 'VAL',
    text: fillPlaceholders(pick(valPool, rng), fillVars),
    week,
    season,
    category: 'WEEKLY_SUMMARY',
  });

  // ── Val financial alert (separate alert if amber/red runway) ───────────

  if (runway < 10) {
    messages.push({
      id: `VAL-FINANCIAL_ALERT-w${week}-s${season}`,
      sender: 'VAL',
      text: fillPlaceholders(pick(VAL_ALERT_RED, rng), fillVars),
      week,
      season,
      category: 'FINANCIAL_ALERT',
    });
  } else if (runway < 20) {
    messages.push({
      id: `VAL-FINANCIAL_ALERT-w${week}-s${season}`,
      sender: 'VAL',
      text: fillPlaceholders(pick(VAL_ALERT_AMBER, rng), fillVars),
      week,
      season,
      category: 'FINANCIAL_ALERT',
    });
  }

  // ── Kev post-match reaction ────────────────────────────────────────────
  // Find the most recent MATCH_SIMULATED event for this week

  const thisWeekMatch = [...events]
    .reverse()
    .find((e): e is MatchSimulatedEvent =>
      e.type === 'MATCH_SIMULATED' &&
      (e.homeTeamId === state.club.id || e.awayTeamId === state.club.id)
    );

  if (thisWeekMatch) {
    const isHome = thisWeekMatch.homeTeamId === state.club.id;
    const playerGoals = isHome ? thisWeekMatch.homeGoals : thisWeekMatch.awayGoals;
    const opponentGoals = isHome ? thisWeekMatch.awayGoals : thisWeekMatch.homeGoals;
    const opponentId = isHome ? thisWeekMatch.awayTeamId : thisWeekMatch.homeTeamId;
    const opponentEntry = state.league.entries.find(e => e.clubId === opponentId);
    const opponentName = opponentEntry?.clubName ?? 'the opposition';

    const matchFill: Record<string, string> = {
      ...fillVars,
      OPPONENT: opponentName,
      SCORE: playerGoals > opponentGoals
        ? `${playerGoals}–${opponentGoals}`
        : `${opponentGoals}–${playerGoals}`,
    };

    let kevPool: readonly string[];
    if (playerGoals > opponentGoals)      kevPool = KEV_POST_MATCH_WIN;
    else if (playerGoals === opponentGoals) kevPool = KEV_POST_MATCH_DRAW;
    else                                   kevPool = KEV_POST_MATCH_LOSS;

    messages.push({
      id: `KEV-POST_MATCH-w${week}-s${season}`,
      sender: 'KEV',
      text: fillPlaceholders(pick(kevPool, rng), matchFill),
      week,
      season,
      category: 'POST_MATCH',
    });

    // Kev streak messages — differentiate 3-game and 5-game runs
    const form = state.club.form;
    if (form.length >= 3) {
      const last5 = form.slice(-5);
      const last3 = form.slice(-3);
      const win5  = last5.length >= 5 && last5.every(r => r === 'W');
      const loss5 = last5.length >= 5 && last5.every(r => r === 'L');
      const win3  = last3.every(r => r === 'W');
      const loss3 = last3.every(r => r === 'L');

      if (win5) {
        // 5-game win streak — emphatic
        messages.push({
          id: `KEV-STREAK_UPDATE-w${week}-s${season}`,
          sender: 'KEV',
          text: fillPlaceholders(pick(KEV_STREAK_WIN_5, rng), { ...fillVars, STREAK: String(last5.filter(r => r === 'W').length) }),
          week,
          season,
          category: 'STREAK_UPDATE',
        });
      } else if (loss5) {
        // 5-game loss streak — serious
        messages.push({
          id: `KEV-STREAK_UPDATE-w${week}-s${season}`,
          sender: 'KEV',
          text: fillPlaceholders(pick(KEV_STREAK_LOSS_5, rng), { ...fillVars, STREAK: String(last5.filter(r => r === 'L').length) }),
          week,
          season,
          category: 'STREAK_UPDATE',
        });
      } else if (win3) {
        // 3-game win streak (not yet 5)
        messages.push({
          id: `KEV-FORM_UPDATE-w${week}-s${season}`,
          sender: 'KEV',
          text: pick(KEV_FORM_GOOD, rng),
          week,
          season,
          category: 'FORM_UPDATE',
        });
      } else if (loss3) {
        // 3-game loss streak (not yet 5)
        messages.push({
          id: `KEV-FORM_UPDATE-w${week}-s${season}`,
          sender: 'KEV',
          text: pick(KEV_FORM_POOR, rng),
          week,
          season,
          category: 'FORM_UPDATE',
        });
      }
    }
  }

  // ── Kev table position reaction ────────────────────────────────────────
  // Fire once when entering promo/relegation zone — seeded so it doesn't fire every week.
  // Use week % 3 === 0 as a simple throttle (not every week, not too rare).

  const relegationStart = state.league.entries.length - (state.league.relegation?.length ?? 4) + 1;
  const inPromoAuto     = playerPosition >= 1 && playerPosition <= state.league.automaticPromotion;
  const inRelegation    = playerPosition >= relegationStart;

  if (inPromoAuto && week % 3 === 1) {
    messages.push({
      id: `KEV-TABLE_UPDATE-promo-w${week}-s${season}`,
      sender: 'KEV',
      text: fillPlaceholders(pick(KEV_PROMOTION_ZONE, rng), fillVars),
      week,
      season,
      category: 'TABLE_UPDATE',
    });
  } else if (inRelegation && week % 3 === 1) {
    messages.push({
      id: `KEV-TABLE_UPDATE-rele-w${week}-s${season}`,
      sender: 'KEV',
      text: fillPlaceholders(pick(KEV_RELEGATION_ZONE, rng), fillVars),
      week,
      season,
      category: 'TABLE_UPDATE',
    });
  }

  // ── Kev squad concern ──────────────────────────────────────────────────

  if (state.club.squad.length < 14) {
    messages.push({
      id: `KEV-SQUAD_CONCERN-w${week}-s${season}`,
      sender: 'KEV',
      text: fillPlaceholders(pick(KEV_SQUAD_CONCERN, rng), fillVars),
      week,
      season,
      category: 'SQUAD_CONCERN',
    });
  }

  // ── Marcus Webb weekly commercial update ──────────────────────────────
  // Pool selected by league position (commercial appetite tracks results).

  let marcusPool: readonly string[];
  if (playerPosition > 0 && playerPosition <= 8) marcusPool = MARCUS_WEEKLY_POSITIVE;
  else if (playerPosition <= 18)                 marcusPool = MARCUS_WEEKLY_NEUTRAL;
  else                                           marcusPool = MARCUS_WEEKLY_TOUGH;

  messages.push({
    id: `MARCUS-WEEKLY_SUMMARY-w${week}-s${season}`,
    sender: 'MARCUS',
    text: fillPlaceholders(pick(marcusPool, rng), fillVars),
    week,
    season,
    category: 'WEEKLY_SUMMARY',
  });

  // ── Marcus market condition alert ───────────────────────────────────────

  if (agentCount >= 20) {
    messages.push({
      id: `MARCUS-FINANCIAL_ALERT-w${week}-s${season}`,
      sender: 'MARCUS',
      text: fillPlaceholders(pick(MARCUS_MARKET_BUSY, rng), fillVars),
      week,
      season,
      category: 'FINANCIAL_ALERT',
    });
  } else if (agentCount <= 8) {
    messages.push({
      id: `MARCUS-FINANCIAL_ALERT-w${week}-s${season}`,
      sender: 'MARCUS',
      text: fillPlaceholders(pick(MARCUS_MARKET_QUIET, rng), fillVars),
      week,
      season,
      category: 'FINANCIAL_ALERT',
    });
  }

  // ── Marcus post-match reaction ─────────────────────────────────────────
  // Marcus reacts to results from the commercial/fan-energy angle.

  if (thisWeekMatch) {
    const isMHome = thisWeekMatch.homeTeamId === state.club.id;
    const mPlayerG = isMHome ? thisWeekMatch.homeGoals : thisWeekMatch.awayGoals;
    const mOppG    = isMHome ? thisWeekMatch.awayGoals : thisWeekMatch.homeGoals;
    const mOppId   = isMHome ? thisWeekMatch.awayTeamId : thisWeekMatch.homeTeamId;
    const mOppName = state.league.entries.find(e => e.clubId === mOppId)?.clubName ?? 'the opposition';
    const mFill: Record<string, string> = {
      ...fillVars,
      OPPONENT: mOppName,
      SCORE: mPlayerG > mOppG
        ? `${mPlayerG}–${mOppG}`
        : mPlayerG < mOppG
          ? `${mOppG}–${mPlayerG}`
          : `${mPlayerG}–${mOppG}`,
    };

    // Big win (3+ goal margin): special emphatic pool for both Kev and Marcus.
    // If it breaks the all-time record, Kev uses the historic pool instead.
    const margin = mPlayerG - mOppG;
    if (margin >= 3) {
      const allTimeMargin = biggestWin
        ? biggestWin.playerGoals - biggestWin.opponentGoals
        : 0;
      const isClubRecord = margin > allTimeMargin;
      messages.push({
        id: `KEV-BIG_WIN-w${week}-s${season}`,
        sender: 'KEV',
        text: fillPlaceholders(pick(isClubRecord ? KEV_CLUB_RECORD_WIN : KEV_BIG_WIN, rng), mFill),
        week,
        season,
        category: 'POST_MATCH',
      });
      messages.push({
        id: `MARCUS-BIG_WIN-w${week}-s${season}`,
        sender: 'MARCUS',
        text: fillPlaceholders(pick(MARCUS_BIG_WIN, rng), mFill),
        week,
        season,
        category: 'POST_MATCH',
      });
    } else {
      // Normal result: Marcus reacts win/draw/loss
      let mPool: readonly string[];
      if (mPlayerG > mOppG)       mPool = MARCUS_POST_MATCH_WIN;
      else if (mPlayerG === mOppG) mPool = MARCUS_POST_MATCH_DRAW;
      else                         mPool = MARCUS_POST_MATCH_LOSS;

      messages.push({
        id: `MARCUS-POST_MATCH-w${week}-s${season}`,
        sender: 'MARCUS',
        text: fillPlaceholders(pick(mPool, rng), mFill),
        week,
        season,
        category: 'POST_MATCH',
      });
    }
  }

  // ── Marcus deep-dive commercial observation (~every 6 weeks) ──────────
  // A longer-form commercial observation beyond the weekly summary.
  // Seeded to week 2, 8, 14, 20, 26, 32, 38, 44 (week % 6 === 2).

  if (week % 6 === 2) {
    messages.push({
      id: `MARCUS-COMMERCIAL_UPDATE-w${week}-s${season}`,
      sender: 'MARCUS',
      text: fillPlaceholders(pick(MARCUS_COMMERCIAL_OBS, rng), fillVars),
      week,
      season,
      category: 'COMMERCIAL_UPDATE',
    });
  }

  // ── Kev: previous season top scorer recall (every 8 weeks) ───────────────
  // Only fires if a top scorer record exists from a prior season.
  // Gives Kev a reason to reference club history and set expectations.

  if (topScorer && week % 8 === 4) {
    messages.push({
      id: `KEV-TOP_SCORER_RECALL-w${week}-s${season}`,
      sender: 'KEV',
      text: fillPlaceholders(pick(KEV_TOP_SCORER_RECALL, rng), fillVars),
      week,
      season,
      category: 'FORM_UPDATE',
    });
  }

  // ── Marcus: attendance reaction to extended form runs ────────────────────
  // Fires when form is very good (4+ wins in last 5) or very poor (4+ losses).
  // Throttled to week % 4 === 3 to avoid weekly repetition.

  if (week % 4 === 3 && state.club.form.length >= 5) {
    const last5 = state.club.form.slice(-5);
    const wins  = last5.filter(r => r === 'W').length;
    const losses = last5.filter(r => r === 'L').length;
    const streakCount = String(wins >= 4 ? wins : losses);
    const attendanceFill = { ...fillVars, STREAK: streakCount };
    if (wins >= 4) {
      messages.push({
        id: `MARCUS-ATTENDANCE_BUZZ-w${week}-s${season}`,
        sender: 'MARCUS',
        text: fillPlaceholders(pick(MARCUS_ATTENDANCE_BUZZ, rng), attendanceFill),
        week,
        season,
        category: 'COMMERCIAL_UPDATE',
      });
    } else if (losses >= 4) {
      messages.push({
        id: `MARCUS-ATTENDANCE_QUIET-w${week}-s${season}`,
        sender: 'MARCUS',
        text: fillPlaceholders(pick(MARCUS_ATTENDANCE_QUIET, rng), attendanceFill),
        week,
        season,
        category: 'COMMERCIAL_UPDATE',
      });
    }
  }

  // ── Dani Osei weekly press update ──────────────────────────────────────

  let daniPool: readonly string[];
  if (playerPosition > 0 && playerPosition <= 8) daniPool = DANI_PRESS_POSITIVE;
  else if (playerPosition <= 18)                 daniPool = DANI_PRESS_NEUTRAL;
  else                                           daniPool = DANI_PRESS_NEGATIVE;

  messages.push({
    id: `DANI-WEEKLY_SUMMARY-w${week}-s${season}`,
    sender: 'DANI',
    text: fillPlaceholders(pick(daniPool, rng), fillVars),
    week,
    season,
    category: 'WEEKLY_SUMMARY',
  });

  // ── Dani result reaction ────────────────────────────────────────────────

  if (thisWeekMatch) {
    const isHomeD = thisWeekMatch.homeTeamId === state.club.id;
    const playerG = isHomeD ? thisWeekMatch.homeGoals : thisWeekMatch.awayGoals;
    const opponentG = isHomeD ? thisWeekMatch.awayGoals : thisWeekMatch.homeGoals;

    let daniResultPool: readonly string[];
    if (playerG > opponentG)       daniResultPool = DANI_RESULT_WIN;
    else if (playerG < opponentG)  daniResultPool = DANI_RESULT_LOSS;
    else                           daniResultPool = DANI_RESULT_DRAW;

    messages.push({
      id: `DANI-POST_MATCH-w${week}-s${season}`,
      sender: 'DANI',
      text: pick(daniResultPool, rng),
      week,
      season,
      category: 'POST_MATCH',
    });
  }

  return messages;
}
