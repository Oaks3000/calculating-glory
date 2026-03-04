/**
 * Player-related types
 */

/**
 * Player positions
 */
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

/**
 * Player representation (simplified for Year 7 level)
 */
export interface Player {
  id: string;
  name: string;
  
  /** Overall rating (0-100) */
  overallRating: number;
  
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
