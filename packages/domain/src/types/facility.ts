/**
 * Facility-related types
 */

export type FacilityType =
  | 'TRAINING_GROUND'
  | 'MEDICAL_CENTER'
  | 'YOUTH_ACADEMY'
  | 'STADIUM'
  | 'CLUB_OFFICE'
  | 'CLUB_COMMERCIAL'
  | 'FOOD_AND_BEVERAGE'
  | 'FAN_ZONE'
  | 'GROUNDS_SECURITY';

export interface Facility {
  type: FacilityType;

  /** Level (0-5) */
  level: number;

  /** Cost to upgrade to next level (in pence) */
  upgradeCost: number;

  /** Benefit description */
  benefit: FacilityBenefit;
}

export interface FacilityBenefit {
  /** What this facility improves */
  type: 'performance' | 'injury_reduction' | 'youth_quality' | 'revenue' | 'board_confidence' | 'reputation' | 'attendance';

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
