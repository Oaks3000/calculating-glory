/**
 * Match and league-related types
 */

/**
 * Match result
 */
export interface Match {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  
  /** Seed used for deterministic simulation */
  seed: string;
  
  /** Did the match happen yet? */
  played: boolean;
}

/**
 * League table entry
 */
export interface LeagueTableEntry {
  position: number;
  clubId: string;
  clubName: string;
  
  played: number;
  won: number;
  drawn: number;
  lost: number;
  
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  
  points: number;
  
  /** Last 5 results */
  form: ('W' | 'D' | 'L')[];
}

/**
 * Complete league table
 */
export interface LeagueTable {
  entries: LeagueTableEntry[];
  
  /** Promotion cutoffs */
  automaticPromotion: number; // Top 3
  playoffPositions: [number, number, number, number]; // 4th-7th
  relegation: [number, number]; // Bottom 2
}

/**
 * Calculate points from match result
 */
export function getPointsFromResult(
  homeGoals: number,
  awayGoals: number,
  isHome: boolean
): number {
  if (homeGoals === awayGoals) return 1; // Draw
  
  if (isHome) {
    return homeGoals > awayGoals ? 3 : 0;
  } else {
    return awayGoals > homeGoals ? 3 : 0;
  }
}

/**
 * Sort league table by points, then goal difference, then goals scored
 */
export function sortLeagueTable(
  entries: LeagueTableEntry[]
): LeagueTableEntry[] {
  return [...entries].sort((a, b) => {
    // Points (descending)
    if (b.points !== a.points) return b.points - a.points;
    
    // Goal difference (descending)
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    
    // Goals scored (descending)
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    
    // Alphabetical tie-breaker (deterministic)
    return a.clubName.localeCompare(b.clubName);
  }).map((entry, index) => ({
    ...entry,
    position: index + 1
  }));
}
