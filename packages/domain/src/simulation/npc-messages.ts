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
  MARCUS_SQUAD_STRONG,
  MARCUS_SQUAD_OK,
  MARCUS_SQUAD_THIN,
  MARCUS_MARKET_BUSY,
  MARCUS_MARKET_QUIET,
  DANI_PRESS_POSITIVE,
  DANI_PRESS_NEUTRAL,
  DANI_PRESS_NEGATIVE,
  DANI_RESULT_WIN,
  DANI_RESULT_LOSS,
} from '../data/npc-templates';

// ── Types ──────────────────────────────────────────────────────────────────

export type NpcSender = 'VAL' | 'KEV' | 'MARCUS' | 'DANI';

export type NpcMessageCategory =
  | 'WEEKLY_SUMMARY'
  | 'POST_MATCH'
  | 'FINANCIAL_ALERT'
  | 'SQUAD_CONCERN'
  | 'FORM_UPDATE';

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

  const fillVars: Record<string, string> = {
    WAGES:    formatMoney(weeklyWages),
    INCOME:   formatMoney(weeklyIncome),
    NET:      signedMoney(netPerWeek),
    RUNWAY:   runway === Infinity ? '99+' : String(Math.floor(runway)),
    BUDGET:   formatMoney(state.club.transferBudget),
    SQUAD:    String(state.club.squad.length),
    AGENTS:   String(agentCount),
    POSITION: playerPosition > 0 ? String(playerPosition) : '?',
    TOTAL:    String(state.league.entries.length),
    BOARD:    String(state.boardConfidence),
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

    // Kev form update — only after a 3+ streak, once per run
    const form = state.club.form;
    if (form.length >= 3) {
      const last3 = form.slice(-3);
      const allWin = last3.every(r => r === 'W');
      const allLoss = last3.every(r => r === 'L');
      if (allWin) {
        messages.push({
          id: `KEV-FORM_UPDATE-w${week}-s${season}`,
          sender: 'KEV',
          text: pick(KEV_FORM_GOOD, rng),
          week,
          season,
          category: 'FORM_UPDATE',
        });
      } else if (allLoss) {
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

  // ── Marcus Webb weekly squad/market report ─────────────────────────────

  let marcusPool: readonly string[];
  const squadSize = state.club.squad.length;
  if (squadSize >= 17) marcusPool = MARCUS_SQUAD_STRONG;
  else if (squadSize >= 14) marcusPool = MARCUS_SQUAD_OK;
  else marcusPool = MARCUS_SQUAD_THIN;

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

    if (playerG > opponentG) {
      messages.push({
        id: `DANI-POST_MATCH-w${week}-s${season}`,
        sender: 'DANI',
        text: pick(DANI_RESULT_WIN, rng),
        week,
        season,
        category: 'POST_MATCH',
      });
    } else if (playerG < opponentG) {
      messages.push({
        id: `DANI-POST_MATCH-w${week}-s${season}`,
        sender: 'DANI',
        text: pick(DANI_RESULT_LOSS, rng),
        week,
        season,
        category: 'POST_MATCH',
      });
    }
  }

  return messages;
}
