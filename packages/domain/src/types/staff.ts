/**
 * Staff-related types
 */

export type StaffRole =
  | 'MANAGER'
  | 'ATTACKING_COACH'
  | 'DEFENSIVE_COACH'
  | 'FITNESS_COACH'
  | 'YOUTH_COACH'
  | 'PHYSIO';

/**
 * Manager attributes — three independent ratings (0-100).
 *
 * tactical:    How well the manager translates the owner's training focus
 *              into match performance. High tactical managers amplify the
 *              training focus bonus; poor ones dampen it.
 *
 * motivation:  Weekly morale nudge applied to all players.
 *              motivation=50 → neutral (±0/wk)
 *              motivation=100 → +2 morale/wk across the squad
 *              motivation=0   → −2 morale/wk across the squad
 *
 * experience:  Base team modifier contribution — seasoned managers just
 *              get more out of the same resources.
 *              experience=100 → +0.06 modifier (same ceiling as staff quality).
 */
export interface ManagerAttributes {
  tactical: number;
  motivation: number;
  experience: number;
}

/**
 * Manager — hired by the owner to run the playing side.
 * Distinct from Staff (coaches): one manager per club, unlimited staff.
 */
export interface Manager {
  id: string;
  name: string;
  attributes: ManagerAttributes;
  /** Weekly wage in pence */
  wage: number;
  /** Contract duration in weeks (for display) */
  contractLengthWeeks: number;
  /** Absolute week the contract expires (set on hire) */
  contractExpiresWeek: number;
}

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  
  /** Quality rating (0-100) */
  quality: number;
  
  /** Weekly salary in pence */
  salary: number;
  
  /** Specialization bonus */
  bonus: StaffBonus;
}

export interface StaffBonus {
  /** What stat this improves */
  type: 'goals' | 'defense' | 'fitness' | 'youth' | 'injury';
  
  /** Percentage improvement (e.g., 10 = 10% improvement) */
  improvement: number;
}
