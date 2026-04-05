/**
 * Player-related types
 */

/**
 * Player positions
 */
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

/**
 * Career curve shape — assigned at player generation, never changes.
 *
 * SHALLOW_BELL   — gentle slopes, long plateau around mid-career peak
 * STEEP_BELL     — stays flat then rises sharply; boom-and-bust profile
 * FRONT_WEIGHTED — peaks early (t≈0.25), very gradual long-term fade
 * BACK_WEIGHTED  — barely rises for years, peaks late (t≈0.65), then collapses
 */
export type CurveShape =
  | 'SHALLOW_BELL'
  | 'STEEP_BELL'
  | 'FRONT_WEIGHTED'
  | 'BACK_WEIGHTED';

/**
 * Predetermined career arc for a player.
 *
 * Stored on the Player object. Pure functions in simulation/progression.ts
 * use this to compute exact stats at any age without storing historical state.
 *
 * Self-consistency guarantee: computeStatsAtAge(curve, position, currentAge)
 * always returns the player's actual attack/defence at the time of generation.
 */
export interface PlayerCurve {
  /** Curve shape — governs where the peak falls and the steepness of growth/decline */
  shape: CurveShape;

  /**
   * Peak height tier (1–5).
   * Controls the total stat points gained at peak above the baseline:
   * 1 = +10pts, 2 = +18pts, 3 = +26pts, 4 = +34pts, 5 = +42pts (split by position)
   */
  peakHeight: 1 | 2 | 3 | 4 | 5;

  /** Age at which this player's career arc began (conceptual career start, pre-game). */
  startAge: number;

  /** Age at which the player retires. Pre-assigned at generation. */
  retirementAge: number;

  /**
   * Attack stat at startAge (before any career growth).
   * Back-calculated so computeStatsAtAge returns currentAttack at currentAge.
   */
  baseAttack: number;

  /**
   * Defence stat at startAge (before any career growth).
   * Back-calculated so computeStatsAtAge returns currentDefence at currentAge.
   */
  baseDefence: number;
}

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
   * Career-arc position indicator (0–100). Updated each season at PRE_SEASON_STARTED.
   *   0  = career start (just entered professional football)
   *  ~50 = approaching or at peak (varies by curve shape)
   * 100  = retirement age
   *
   * Values < 50 → ascending; ≥ 50 → plateau or decline.
   *
   * NOTE: truePotential runs in the OPPOSITE direction to what is displayed.
   * Use getScoutedPotential(player, scoutLevel) for display — it returns
   * (100 − truePotential + noise), so 100 = maximum potential remaining, 0 = none left.
   * publicPotential stores that inverted display value with level-0 scout noise applied.
   */
  truePotential: number;

  /**
   * Predetermined career curve. Assigned at player generation; never changes.
   * Used by applySeasonProgression() to update attack/defence each season.
   */
  curve: PlayerCurve;

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
