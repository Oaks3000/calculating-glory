/**
 * Club-related types
 */

import { Player, computeOverallRating } from './player';
import { Facility, TrainingFocus } from './facility';
import { Staff, Manager } from './staff';
import { Formation } from './formation';

/**
 * Football club representation
 */
export interface Club {
  id: string;
  name: string;
  
  /** Transfer budget in pence */
  transferBudget: number;

  /** Infrastructure budget in pence — funds facility upgrades */
  infrastructureBudget: number;

  /** Wage reserve in pence — funds ongoing salary commitments */
  wageReserve: number;

  /** How the overall budget is split across pools (percentages summing to 100) */
  budgetAllocation: { transfer: number; infrastructure: number; wages: number };
  
  /** Current squad */
  squad: Player[];
  
  /** Manager and coaching staff */
  staff: Staff[];
  
  /** Club facilities */
  facilities: Facility[];
  
  /** Club reputation (0-100) */
  reputation: number;
  
  /** Stadium details */
  stadium: Stadium;
  
  /** Form (last 5 results: W/D/L) */
  form: FormResult[];

  /** Weekly training focus chosen by the manager (null = not yet set) */
  trainingFocus: TrainingFocus | null;

  /** Owner's preferred formation — governs recruitment strategy */
  preferredFormation: Formation | null;

  /** Total squad slots available (capped at 24) */
  squadCapacity: number;

  /** Currently hired manager (null = no manager appointed) */
  manager: Manager | null;
}

/**
 * Stadium information
 */
export interface Stadium {
  name: string;
  capacity: number;
  averageAttendance: number;
  ticketPrice: number; // In pence
}

/**
 * Form result
 */
export type FormResult = 'W' | 'D' | 'L';

/**
 * Calculate club's overall strength for match simulation
 * Based on squad quality, manager, facilities, morale
 */
export function calculateClubStrength(club: Club): number {
  // Returns integer 0-10000
  const squadStrength = calculateSquadStrength(club.squad);
  const staffBonus = calculateStaffBonus(club.staff);
  const facilityBonus = calculateFacilityBonus(club.facilities);
  const reputationBonus = club.reputation * 10; // 0-1000
  
  return squadStrength + staffBonus + facilityBonus + reputationBonus;
}

function calculateSquadStrength(squad: Player[]): number {
  // Average computed OVR * 100
  const totalRating = squad.reduce((sum, p) => sum + computeOverallRating(p), 0);
  return Math.floor((totalRating / squad.length) * 100);
}

function calculateStaffBonus(staff: Staff[]): number {
  // Staff quality adds bonus
  return staff.reduce((sum, s) => sum + s.quality * 10, 0);
}

function calculateFacilityBonus(facilities: Facility[]): number {
  // Each facility level adds bonus
  return facilities.reduce((sum, f) => sum + f.level * 50, 0);
}
