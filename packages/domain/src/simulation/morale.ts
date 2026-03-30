/**
 * Morale system — pure helpers for computing morale deltas.
 *
 * All functions are stateless, deterministic, and side-effect free.
 * They are called from:
 *   - reducers/index.ts  (handleMatchSimulated, handleWeekAdvanced, handleManagerHired)
 *   - simulation/match.ts (unsettled debuff)
 *   - simulation/events.ts (threshold event generation, poach weighting)
 */

import { Player } from '../types/player';

// ── Charisma factor ─────────────────────────────────────────────────────────────

/**
 * Scale factor for morale swings based on player charisma.
 * Models emotional stability: high charisma resists change in both directions.
 *
 *   charisma=100 → 0.5× swing  (very stable)
 *   charisma=50  → 1.0× swing  (normal)
 *   charisma=0   → 1.5× swing  (very volatile)
 */
export function charismaFactor(charisma: number): number {
  return 1 + (50 - charisma) / 100;
}

// ── Squad average ──────────────────────────────────────────────────────────────

export function avgSquadMorale(squad: Player[]): number {
  if (squad.length === 0) return 50;
  return squad.reduce((sum, p) => sum + p.morale, 0) / squad.length;
}

// ── Layer 1: Result delta ──────────────────────────────────────────────────────

const RESULT_BASE: Record<'W' | 'D' | 'L', number> = { W: 3, D: 1, L: -4 };

/**
 * Apply per-player morale delta after the player's club match result.
 *
 * Factors:
 *   - base delta:    W +3 / D +1 / L −4
 *   - context ×1.5: upset win (beat a team 5+ positions higher) or
 *                   shock loss (lost to a team 5+ positions lower)
 *   - streak bonus:  +2 if last 3 results all W / −3 if last 5 all L
 *   - per-player:    scaled by charismaFactor (volatile players swing harder)
 *
 * @param squad         Current squad
 * @param result        W/D/L for the player's club in this match
 * @param playerPos     Player's club league position (1–24)
 * @param opponentPos   Opponent's league position (1–24)
 * @param currentForm   Club form AFTER this result has been appended (last 5)
 */
export function applyResultMoraleDelta(
  squad: Player[],
  result: 'W' | 'D' | 'L',
  playerPos: number,
  opponentPos: number,
  currentForm: ('W' | 'D' | 'L')[]
): Player[] {
  const base = RESULT_BASE[result];

  // Context: upset win (beat stronger opponent) or shock loss (lost to weaker)
  const posGap = opponentPos - playerPos; // positive = opponent is lower ranked
  const isUpset =
    (result === 'W' && posGap >= 5) ||
    (result === 'L' && posGap <= -5);
  const contextMult = isUpset ? 1.5 : 1.0;

  // Form streak modifier (uniform across squad, shaped by charisma per player)
  const last5 = currentForm.slice(-5);
  const last3 = currentForm.slice(-3);
  const streakBonus =
    last3.length === 3 && last3.every(r => r === 'W') ? 2 :
    last5.length === 5 && last5.every(r => r === 'L') ? -3 :
    0;

  return squad.map(p => {
    const cf = charismaFactor(p.attributes.charisma);
    const delta = Math.round((base * contextMult + streakBonus) * cf);
    return { ...p, morale: Math.max(0, Math.min(100, p.morale + delta)) };
  });
}

// ── Layer 2: Contract anxiety ──────────────────────────────────────────────────

/**
 * Weekly morale drain for players with expiring contracts.
 * Applied silently in WEEK_ADVANCED — independent of manager nudge.
 *
 *   < 4 weeks left: −2/wk
 *   < 8 weeks left: −1/wk
 */
export function applyContractAnxiety(
  squad: Player[],
  currentWeek: number
): Player[] {
  return squad.map(p => {
    const weeksLeft = p.contractExpiresWeek - currentWeek;
    const drain = weeksLeft < 4 ? -2 : weeksLeft < 8 ? -1 : 0;
    if (drain === 0) return p;
    return { ...p, morale: Math.max(0, Math.min(100, p.morale + drain)) };
  });
}

// ── Layer 4: Contagion ─────────────────────────────────────────────────────────

/**
 * Players at morale 0 drain teammates in the same position group by −1/wk.
 * At most one contagion source per position group; the source itself is unaffected.
 */
export function applyContagion(squad: Player[]): Player[] {
  // Find positions that have at least one player at morale 0
  const contagionPositions = new Set<string>(
    squad.filter(p => p.morale === 0).map(p => p.position)
  );
  if (contagionPositions.size === 0) return squad;

  return squad.map(p => {
    if (!contagionPositions.has(p.position)) return p;
    if (p.morale === 0) return p; // source is not drained further
    return { ...p, morale: Math.max(0, p.morale - 1) };
  });
}

// ── Manager change: gravitational pull ────────────────────────────────────────

/**
 * One-time morale effect fired on MANAGER_HIRED.
 * Pulls each player's morale toward 55 (slight optimism — new chapter),
 * scaled by charisma. This is independent of the incoming manager's attributes.
 *
 *   High morale squad → pulled down (uncertainty)
 *   Low morale squad  → pulled up   (hope of turnaround)
 *   ~55 morale squad  → no effect
 *
 *   Pull strength: 20% of the gap toward 55 per appointment.
 */
const MANAGER_CHANGE_TARGET = 55;
const MANAGER_CHANGE_PULL   = 0.20;

export function applyManagerChangeMorale(squad: Player[]): Player[] {
  return squad.map(p => {
    const cf = charismaFactor(p.attributes.charisma);
    const delta = Math.round(
      (MANAGER_CHANGE_TARGET - p.morale) * MANAGER_CHANGE_PULL * cf
    );
    return { ...p, morale: Math.max(0, Math.min(100, p.morale + delta)) };
  });
}

// ── Unsettled flag (derived — no storage needed) ───────────────────────────────

/** Players below this threshold are "unsettled" — debuffed in match sim and poach-priority. */
export const UNSETTLED_THRESHOLD = 20;

export function isUnsettled(player: Player): boolean {
  return player.morale < UNSETTLED_THRESHOLD;
}

// ── Form-streak milestone detection ───────────────────────────────────────────

export type FormMilestoneKey = 'W3' | 'W5' | 'L3' | 'L5';

/**
 * Detect the highest form-streak milestone present in the given form array.
 * Returns null when no streak is active (mixed results, or fewer than 3 games).
 *
 * Priority: W5 > L5 > W3 > L3 (longer streaks take precedence so W5 supersedes W3).
 */
export function detectFormMilestone(form: ('W' | 'D' | 'L')[]): FormMilestoneKey | null {
  const last5 = form.slice(-5);
  const last3 = form.slice(-3);
  if (last5.length === 5 && last5.every(r => r === 'W')) return 'W5';
  if (last5.length === 5 && last5.every(r => r === 'L')) return 'L5';
  if (last3.length === 3 && last3.every(r => r === 'W')) return 'W3';
  if (last3.length === 3 && last3.every(r => r === 'L')) return 'L3';
  return null;
}

/** Ticker headline for each form milestone. */
export const FORM_MILESTONE_HEADLINES: Record<FormMilestoneKey, string> = {
  W3: 'Squad spirits high after a 3-match winning run',
  W5: '🔥 Unstoppable — five wins on the bounce',
  L3: 'Confidence shaken after 3 straight defeats',
  L5: '⚠ Deep crisis — five successive defeats',
};
