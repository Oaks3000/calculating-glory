/**
 * Player-related types
 */

/**
 * Player positions
 */
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

/**
 * Individual skill attributes for a player
 */
export interface PlayerAttributes {
  /** Attacking ability (1–100). Weighted most heavily for FWD in match simulation. */
  attack: number;
  /** Defensive ability (1–100). Weighted most heavily for GK/DEF in match simulation. */
  defence: number;
  /** Teamwork (1–100). Sum of XI's teamwork modifies overall performance. */
  teamwork: number;
  /** Charisma (1–100). Sum drives club popularity → merch/attendance revenue. */
  charisma: number;
  /** Visible potential proxy (1–100). 55%-accurate representation of true development. */
  publicPotential: number;
}

/**
 * Compute a player's overall rating from their performance attributes.
 * Charisma is intentionally excluded — it is a social/commercial attribute,
 * not a measure of on-pitch ability. OVR is the mean of attack, defence, and
 * teamwork, rounded to the nearest integer.
 *
 * This is a pure function so it remains accurate as attributes change over time
 * (e.g. age-based progression/decline in future seasons).
 */
export function computeOverallRating(player: Player): number {
  const { attack, defence, teamwork } = player.attributes;
  return Math.round((attack + defence + teamwork) / 3);
}

/**
 * Player representation (simplified for Year 7 level)
 */
export interface Player {
  id: string;
  name: string;

  /** Primary position */
  position: Position;

  /** Weekly wage in pence */
  wage: number;

  /** Transfer value in pence */
  transferValue: number;

  /** Age */
  age: number;

  /** Morale (0-100) */
  morale: number;

  /** Performance stats */
  stats: PlayerStats;

  /** Individual skill attributes */
  attributes: PlayerAttributes;

  /**
   * True development potential (1–100). Hidden — scouting reveals the gap.
   * publicPotential is a 55%-accurate proxy for this value.
   */
  truePotential: number;

  /**
   * Game week when this player's contract with your club expires.
   * 0 = free agent (not yet signed to your club).
   * Releasing before expiry incurs a compensation fee.
   */
  contractExpiresWeek: number;
}

/**
 * Player performance statistics
 */
export interface PlayerStats {
  /** Goals scored (for forwards) */
  goals: number;
  
  /** Assists (for midfielders) */
  assists: number;
  
  /** Clean sheets (for defenders/GK) */
  cleanSheets: number;
  
  /** Matches played */
  appearances: number;
  
  /** Average rating this season */
  averageRating: number;
}

/**
 * Calculate goals per game for a forward
 */
export function getGoalsPerGame(player: Player): number {
  if (player.stats.appearances === 0) return 0;
  return player.stats.goals / player.stats.appearances;
}

/**
 * Calculate clean sheet rate for defender/GK
 */
export function getCleanSheetRate(player: Player): number {
  if (player.stats.appearances === 0) return 0;
  return player.stats.cleanSheets / player.stats.appearances;
}

/**
 * Calculate player's value per goal (for forwards)
 * Used in transfer decisions
 */
export function getValuePerGoal(player: Player): number {
  const goalsPerGame = getGoalsPerGame(player);
  if (goalsPerGame === 0) return Infinity;
  return player.transferValue / goalsPerGame;
}

/**
 * Calculate annual wage cost in pence
 */
export function getAnnualWageCost(player: Player): number {
  return player.wage * 52; // 52 weeks
}

/**
 * Calculate total cost over contract length
 */
export function getTotalContractCost(
  player: Player,
  contractYears: number
): number {
  const transferFee = player.transferValue;
  const totalWages = getAnnualWageCost(player) * contractYears;
  return transferFee + totalWages;
}
