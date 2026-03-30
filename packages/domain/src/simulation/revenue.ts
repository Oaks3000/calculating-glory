/**
 * Revenue simulation helpers.
 *
 * Separated from the reducer so the formulas can be unit-tested independently
 * and reused across future league tiers without duplicating logic.
 */

import { Player } from '../types/player';
import { computeOverallRating } from '../types/player';
import { Division, GameState } from '../types/game-state-updated';
import { Facility } from '../types/facility';

// ─── League Tier Revenue Multipliers ──────────────────────────────────────────

/**
 * Revenue multiplier applied to all facility income based on current division.
 *
 * Design intent:
 * - League Two is the base (1×). Bigger leagues have bigger crowds, bigger
 *   sponsorship deals, and larger media contracts — all of which amplify
 *   what the same physical facility can generate.
 * - Multipliers are intentionally round numbers: easy to communicate to the
 *   player as a "promotion bonus" and easy to re-tune in future.
 *
 * Approximate real-world revenue ratios (EFL/PL club median):
 *   League Two → League One ≈ 2×
 *   League One → Championship ≈ 2×
 *   Championship → Premier League ≈ 5×
 */
export const TIER_REVENUE_MULTIPLIER: Record<Division, number> = {
  LEAGUE_TWO:    1,
  LEAGUE_ONE:    2,
  CHAMPIONSHIP:  4,
  PREMIER_LEAGUE: 10,
};

// ─── Facility Revenue ─────────────────────────────────────────────────────────

/**
 * Weekly facility revenue from CLUB_COMMERCIAL and FOOD_AND_BEVERAGE,
 * scaled by the current division tier.
 *
 * Base rates (League Two):
 *   CLUB_COMMERCIAL  — £500/wk per level  (50,000p × level)
 *   FOOD_AND_BEVERAGE — £300/wk per level  (30,000p × level)
 *
 * Returns value in pence (integer).
 */
export function facilityRevenue(facilities: Facility[], division: Division): number {
  const commercial   = facilities.find(f => f.type === 'CLUB_COMMERCIAL');
  const foodBev      = facilities.find(f => f.type === 'FOOD_AND_BEVERAGE');
  const commercialRev = commercial ? commercial.level * 50_000 : 0;
  const foodRev       = foodBev    ? foodBev.level    * 30_000 : 0;
  const multiplier    = TIER_REVENUE_MULTIPLIER[division];
  return Math.round((commercialRev + foodRev) * multiplier);
}

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

// ─── Weekly Financials Summary ────────────────────────────────────────────────

/**
 * Derives the three financial headline figures used by NPC messages and
 * the financial health bar from the current game state.
 *
 * weeklyIncome  — facility + charisma revenue (pence/week)
 * weeklyWages   — player + staff + manager wages (pence/week)
 * runway        — weeks of transferBudget remaining at current deficit;
 *                 Infinity when income ≥ wages (no deficit)
 */
export function computeWeeklyFinancials(state: GameState): {
  weeklyIncome: number;
  weeklyWages: number;
  runway: number;
} {
  const weeklyIncome = facilityRevenue(state.club.facilities, state.division)
    + squadCharismaRevenue(state.club.squad);

  const playerWages  = state.club.squad.reduce((sum, p) => sum + p.wage, 0);
  const staffWages   = state.club.staff.reduce((sum, s) => sum + s.salary, 0);
  const managerWage  = state.club.manager?.wage ?? 0;
  const weeklyWages  = playerWages + staffWages + managerWage;

  const deficit = weeklyWages - weeklyIncome;
  const runway  = deficit <= 0 ? Infinity : state.club.transferBudget / deficit;

  return { weeklyIncome, weeklyWages, runway };
}

/** Maps a runway value (weeks) to the colour band shown in the Financial Health Bar. */
export function computeRunwayBand(
  runway: number,
  isSurplus: boolean
): 'SURPLUS' | 'GREEN' | 'AMBER' | 'RED' | 'CRITICAL' {
  if (isSurplus) return 'SURPLUS';
  if (runway >= 20) return 'GREEN';
  if (runway >= 10) return 'AMBER';
  if (runway >= 5)  return 'RED';
  return 'CRITICAL';
}
