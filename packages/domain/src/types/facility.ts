/**
 * Facility-related types
 */

import { Player } from './player';

// ── Training Focus ────────────────────────────────────────────────────────────

export type TrainingFocus =
  | 'ATTACKING'
  | 'DEFENSIVE'
  | 'FITNESS'
  | 'SET_PIECES'
  | 'YOUTH_INTEGRATION';

export interface TrainingFocusConfig {
  label: string;
  icon: string;
  description: string;
  /** Short player-facing effect summary */
  effect: string;
}

export const TRAINING_FOCUS_CONFIG: Record<TrainingFocus, TrainingFocusConfig> = {
  ATTACKING: {
    label: 'Attacking Play',
    icon: '⚡',
    description: 'Drill movement, finishing, and chance creation.',
    effect: '+5% goals scored this week',
  },
  DEFENSIVE: {
    label: 'Defensive Shape',
    icon: '🛡️',
    description: 'Rehearse defensive positioning and set-piece defending.',
    effect: '-5% goals conceded this week',
  },
  FITNESS: {
    label: 'Fitness & Conditioning',
    icon: '💪',
    description: 'Peak physical conditioning to reduce injury and fatigue.',
    effect: '-10% injury risk this week',
  },
  SET_PIECES: {
    label: 'Set Pieces',
    icon: '🎯',
    description: 'Rehearse corners, free kicks, and throw-in routines.',
    effect: '+3% set-piece goal chance this week',
  },
  YOUTH_INTEGRATION: {
    label: 'Youth Integration',
    icon: '🎓',
    description: 'Bring academy players into first-team sessions.',
    effect: '+2% youth development bonus this season',
  },
};

// ── Facility types ────────────────────────────────────────────────────────────

export type FacilityType =
  | 'TRAINING_GROUND'
  | 'MEDICAL_CENTER'
  | 'YOUTH_ACADEMY'
  | 'STADIUM'
  | 'CLUB_OFFICE'
  | 'CLUB_COMMERCIAL'
  | 'FOOD_AND_BEVERAGE'
  | 'FAN_ZONE'
  | 'GROUNDS_SECURITY'
  | 'SCOUT_NETWORK';

export interface Facility {
  type: FacilityType;

  /** Level (0-5) */
  level: number;

  /** Cost to upgrade to next level (in pence) */
  upgradeCost: number;

  /** Benefit description */
  benefit: FacilityBenefit;

  /**
   * Weeks remaining until construction completes.
   * Undefined (or 0) means the facility is not under construction.
   */
  constructionWeeksRemaining?: number;
}

/**
 * Number of weeks construction takes to complete for each target level.
 * targetLevel 1 → 2 weeks, 2 → 3 weeks, ... 5 → 6 weeks.
 */
export function constructionDuration(targetLevel: number): number {
  return targetLevel + 1;
}

export interface FacilityBenefit {
  /** What this facility improves */
  type: 'performance' | 'injury_reduction' | 'youth_quality' | 'revenue' | 'board_confidence' | 'reputation' | 'attendance' | 'scouting';

  /** Percentage improvement per level */
  improvement: number;
}

/**
 * Single source of truth for facility configuration.
 * Used by domain logic, frontend display, and Stadium View rendering.
 */
export const FACILITY_CONFIG: Record<FacilityType, {
  label: string;
  icon: string;
  description: string;
  benefitType: FacilityBenefit['type'];
  improvementPerLevel: number;
  startingLevel: number;
  /** Cost to upgrade TO each level (index 0 = cost to reach level 1, etc.) */
  upgradeCosts: [number, number, number, number, number];
}> = {
  STADIUM: {
    label: 'Stadium',
    icon: '🏟',
    description: 'Boosts matchday revenue and atmosphere.',
    benefitType: 'revenue',
    improvementPerLevel: 10,
    startingLevel: 0,
    upgradeCosts: [50_000_00, 150_000_00, 400_000_00, 800_000_00, 1_500_000_00],
  },
  TRAINING_GROUND: {
    label: 'Training Ground',
    icon: '⚽',
    description: 'Improves squad performance week-on-week.',
    benefitType: 'performance',
    improvementPerLevel: 5,
    startingLevel: 0,
    upgradeCosts: [30_000_00, 80_000_00, 200_000_00, 500_000_00, 1_000_000_00],
  },
  MEDICAL_CENTER: {
    label: 'Medical Centre',
    icon: '🏥',
    description: 'Reduces injury risk and speeds recovery.',
    benefitType: 'injury_reduction',
    improvementPerLevel: 8,
    startingLevel: 0,
    upgradeCosts: [25_000_00, 60_000_00, 150_000_00, 400_000_00, 800_000_00],
  },
  YOUTH_ACADEMY: {
    label: 'Youth Academy',
    icon: '🎓',
    description: 'Produces better young players each season.',
    benefitType: 'youth_quality',
    improvementPerLevel: 7,
    startingLevel: 0,
    upgradeCosts: [40_000_00, 100_000_00, 250_000_00, 600_000_00, 1_200_000_00],
  },
  CLUB_OFFICE: {
    label: 'Club Office',
    icon: '🏢',
    description: 'Improves board confidence and unlocks admin tools.',
    benefitType: 'board_confidence',
    improvementPerLevel: 5,
    startingLevel: 1,
    upgradeCosts: [0, 75_000_00, 200_000_00, 500_000_00, 1_000_000_00],
  },
  CLUB_COMMERCIAL: {
    label: 'Commercial Centre',
    icon: '💰',
    description: 'Generates weekly revenue from sponsorship, kit sales, and media.',
    benefitType: 'revenue',
    improvementPerLevel: 10,
    startingLevel: 0,
    upgradeCosts: [100_000_00, 250_000_00, 500_000_00, 1_000_000_00, 2_000_000_00],
  },
  FOOD_AND_BEVERAGE: {
    label: 'Food & Beverage',
    icon: '🍔',
    description: 'Matchday catering from burger vans to fine dining.',
    benefitType: 'revenue',
    improvementPerLevel: 8,
    startingLevel: 0,
    upgradeCosts: [20_000_00, 60_000_00, 150_000_00, 400_000_00, 900_000_00],
  },
  FAN_ZONE: {
    label: 'Fan Zone',
    icon: '🎉',
    description: 'Matchday atmosphere from bar areas to international fan clubs.',
    benefitType: 'reputation',
    improvementPerLevel: 5,
    startingLevel: 0,
    upgradeCosts: [30_000_00, 80_000_00, 200_000_00, 500_000_00, 1_000_000_00],
  },
  GROUNDS_SECURITY: {
    label: 'Grounds & Security',
    icon: '🎟',
    description: 'Front-of-house infrastructure: tickets, parking, turnstiles, transport.',
    benefitType: 'attendance',
    improvementPerLevel: 5,
    startingLevel: 0,
    upgradeCosts: [15_000_00, 50_000_00, 120_000_00, 300_000_00, 700_000_00],
  },
  SCOUT_NETWORK: {
    label: 'Scout Network',
    icon: '🔭',
    description: 'Reduces noise on player potential readings. At level 5 you see true potential exactly.',
    benefitType: 'scouting',
    improvementPerLevel: 3,
    startingLevel: 0,
    upgradeCosts: [15_000_00, 45_000_00, 120_000_00, 300_000_00, 600_000_00],
  },
};

/**
 * Get the upgrade cost for a facility at a given level.
 * Returns 0 if already at max level (5).
 */
export function getUpgradeCost(type: FacilityType, currentLevel: number): number {
  if (currentLevel >= 5) return 0;
  return FACILITY_CONFIG[type].upgradeCosts[currentLevel];
}

/**
 * Create the default set of facilities for a new club.
 * CLUB_OFFICE starts at level 1 (the back office hut exists from day one).
 * All others start at level 0.
 */
export function getDefaultFacilities(): Facility[] {
  return (Object.keys(FACILITY_CONFIG) as FacilityType[]).map(type => {
    const config = FACILITY_CONFIG[type];
    return {
      type,
      level: config.startingLevel,
      upgradeCost: getUpgradeCost(type, config.startingLevel),
      benefit: {
        type: config.benefitType,
        improvement: config.improvementPerLevel,
      },
    };
  });
}

/**
 * Calculate ROI for facility upgrade
 */
export function calculateFacilityROI(
  facility: Facility,
  seasonLength: number = 46 // League Two has 46 games
): {
  cost: number;
  benefit: number;
  breakEven: number; // Weeks to break even
} {
  const cost = facility.upgradeCost;

  // Different benefits calculated differently
  if (facility.benefit.type === 'revenue') {
    // Revenue improvement
    const weeklyBenefit = cost * (facility.benefit.improvement / 100) / 52;
    return {
      cost,
      benefit: weeklyBenefit * seasonLength,
      breakEven: Math.ceil(cost / weeklyBenefit)
    };
  }

  // Performance benefits are harder to quantify
  // Estimate as equivalent to X squad points improvement
  const equivalentValue = cost * 0.8; // Rough approximation
  return {
    cost,
    benefit: equivalentValue,
    breakEven: 1 // Immediate for performance
  };
}

// ── Scout Network — potential visibility ──────────────────────────────────────

/**
 * Maximum noise applied to potential at scout level 0 (±15 points).
 * Scales linearly to 0 at level 5.
 */
const SCOUT_MAX_NOISE = 15;

/**
 * Deterministic noise offset for a player given the current scout level.
 *
 * Uses a simple hash of the player's ID so the same player always shows the
 * same (wrong) value at a given scout level — upgrading the scout network
 * sharpens the reading rather than re-rolling it.
 *
 * Returns an integer in [-noiseRange, +noiseRange].
 */
function scoutNoise(playerId: string, noiseRange: number): number {
  if (noiseRange === 0) return 0;
  // Simple deterministic hash: sum char codes mod (2*noiseRange+1), shift to centre
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = (hash * 31 + playerId.charCodeAt(i)) >>> 0;
  }
  const span = noiseRange * 2 + 1; // e.g. 31 values for noiseRange=15
  return (hash % span) - noiseRange;
}

/**
 * Returns the displayed potential for a player given the current scout network level (0–5).
 *
 * - Level 0: truePotential ± up to 15 (deterministic per player)
 * - Level 5: truePotential exactly
 *
 * Always clamped to [1, 100].
 */
export function getScoutedPotential(player: Player, scoutLevel: number): number {
  const level = Math.max(0, Math.min(5, scoutLevel));
  const noiseRange = Math.round(SCOUT_MAX_NOISE * (1 - level / 5));
  const noise = scoutNoise(player.id, noiseRange);
  // Invert for display: truePotential is a career-arc position (0=start, 100=retirement).
  // Displayed potential should be 100 for a player with maximum upside, 0 for one who has peaked.
  const displayPotential = 100 - player.truePotential;
  return Math.max(1, Math.min(100, displayPotential + noise));
}

/**
 * Returns the noise range (±N) for a given scout level.
 * Used by the UI to decide how to label the potential display.
 */
export function scoutNoiseRange(scoutLevel: number): number {
  const level = Math.max(0, Math.min(5, scoutLevel));
  return Math.round(SCOUT_MAX_NOISE * (1 - level / 5));
}

/**
 * Returns the scout network level from a club's facilities array.
 * 0 if the facility is not present or not yet built.
 */
export function getScoutLevel(facilities: Facility[]): number {
  return facilities.find(f => f.type === 'SCOUT_NETWORK')?.level ?? 0;
}

/**
 * Returns true when a transfer can legally complete.
 * Pre-season is always open.
 * In-season: summer window (weeks 1–4) and January window (weeks 21–24).
 */
export function isTransferWindowOpen(week: number, phase: string): boolean {
  if (phase === 'PRE_SEASON') return true;
  return (week >= 1 && week <= 4) || (week >= 21 && week <= 24);
}

/**
 * Human-readable label for the next transfer window that will open,
 * relative to the current in-season week.
 */
export function nextWindowLabel(week: number): string {
  if (week < 21) return 'January window (week 21)';
  return 'next summer window (start of next season)';
}
