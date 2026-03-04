/**
 * Facility-related types
 */

export type FacilityType =
  | 'TRAINING_GROUND'
  | 'MEDICAL_CENTER'
  | 'YOUTH_ACADEMY'
  | 'STADIUM';

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
  type: 'performance' | 'injury_reduction' | 'youth_quality' | 'revenue';
  
  /** Percentage improvement per level */
  improvement: number;
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
