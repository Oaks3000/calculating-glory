/**
 * Revenue simulation helpers.
 *
 * Separated from the reducer so the formulas can be unit-tested independently
 * and reused across future league tiers without duplicating logic.
 */

import { Player } from '../types/player';
import { computeOverallRating } from '../types/player';

// ─── Charisma Revenue ─────────────────────────────────────────────────────────

/**
 * Weekly commercial revenue contribution from a single player's charisma.
 *
 * Formula:  t³ × 75,000p × (OVR × 0.1)
 * where     t = (charisma − 60) / 40   (0 at threshold, 1 at max)
 *
 * Design intent:
 * - Zero below charisma 60 — most League Two players contribute nothing
 * - Cubic curve creates the "hockey stick": each point above 80 is worth
 *   meaningfully more than the last
 * - OVR multiplier encodes the "Beckham effect": ability amplifies commercial
 *   appeal.  A charismatic star who can actually play drives far more revenue
 *   than an equally charismatic player who sits on the bench.
 * - Self-calibrating across leagues: a League Two player rarely exceeds
 *   OVR 68 or charisma 70, keeping contributions modest (< £100/wk).
 *   A Premier League superstar at c=92/OVR=90 can generate > £5,000/wk.
 *
 * Returns value in pence (integer).
 */
export function playerCharismaRevenue(player: Player): number {
  const { charisma } = player.attributes;
  if (charisma < 60) return 0;

  const t   = (charisma - 60) / 40;          // normalised 0–1 above threshold
  const ovr = computeOverallRating(player);

  return Math.round(t * t * t * 75_000 * (ovr * 0.1));
}

/**
 * Total weekly charisma revenue contribution from an entire squad.
 * Sums individual player contributions — each player's commercial pull is
 * independent, but only high-charisma players register meaningfully.
 *
 * Returns value in pence (integer).
 */
export function squadCharismaRevenue(squad: Player[]): number {
  return squad.reduce((sum, p) => sum + playerCharismaRevenue(p), 0);
}
