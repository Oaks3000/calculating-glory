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
