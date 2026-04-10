/**
 * Validation Rules
 *
 * Business rules and constraints for validating commands.
 */

import { Club } from '../types/club';
import { Player } from '../types/player';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const MAX_SQUAD_SIZE = 25;
const MIN_SQUAD_SIZE = 18;

/**
 * Validate a transfer
 */
export function validateTransfer(
  club: Club,
  player: Player,
  offeredFee: number,
  offeredWages: number
): ValidationResult {
  const errors: string[] = [];

  // Check squad size
  if (club.squad.length >= MAX_SQUAD_SIZE) {
    errors.push(`Squad is full (${MAX_SQUAD_SIZE} players maximum)`);
  }

  // Check if player already in squad
  if (club.squad.some(p => p.id === player.id)) {
    errors.push('Player is already in your squad');
  }

  // Check transfer budget
  if (offeredFee > club.transferBudget) {
    errors.push(`Insufficient transfer budget. Need £${(offeredFee / 100).toFixed(2)}, have £${(club.transferBudget / 100).toFixed(2)}`);
  }

  // Check wage reserve runway (need at least 8 weeks of wages after signing)
  const currentWeeklyWages = club.squad.reduce((sum, p) => sum + p.wage, 0) +
                             club.staff.reduce((sum, s) => sum + s.salary, 0) +
                             (club.manager ? club.manager.wage : 0);
  const newWeeklyWages = currentWeeklyWages + offeredWages;
  const runwayAfter = newWeeklyWages > 0 ? club.wageReserve / newWeeklyWages : Infinity;

  if (runwayAfter < 8) {
    errors.push(`Wage reserve too low. Signing would leave only ${Math.floor(runwayAfter)} weeks of wages (minimum 8 required).`);
  }

  // Check if offer meets player's minimum
  if (offeredFee < player.transferValue) {
    errors.push(`Offer too low. Player valued at £${(player.transferValue / 100).toFixed(2)}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate selling a player
 */
export function validatePlayerSale(
  club: Club,
  playerId: string
): ValidationResult {
  const errors: string[] = [];

  // Check squad size after sale
  if (club.squad.length - 1 < MIN_SQUAD_SIZE) {
    errors.push(`Cannot sell - squad would be below minimum size of ${MIN_SQUAD_SIZE}`);
  }

  // Check player exists
  if (!club.squad.some(p => p.id === playerId)) {
    errors.push('Player not found in squad');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate a facility upgrade
 */
export function validateFacilityUpgrade(
  club: Club,
  facilityType: string,
  upgradeCost: number
): ValidationResult {
  const errors: string[] = [];

  // Check if facility exists
  const facility = club.facilities.find(f => f.type === facilityType);
  if (!facility) {
    errors.push(`Facility '${facilityType}' not found`);
    return { valid: false, errors };
  }

  // Check if already under construction
  if (facility.constructionWeeksRemaining && facility.constructionWeeksRemaining > 0) {
    errors.push(`${facilityType} is already under construction`);
    return { valid: false, errors };
  }

  // Check if already at max level
  const MAX_LEVEL = 5;
  if (facility.level >= MAX_LEVEL) {
    errors.push(`${facilityType} is already at maximum level`);
  }

  // Check budget
  if (upgradeCost > club.transferBudget) {
    errors.push(`Insufficient budget. Need £${(upgradeCost / 100).toFixed(2)}, have £${(club.transferBudget / 100).toFixed(2)}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate hiring staff
 */
export function validateStaffHire(
  club: Club,
  staffWages: number
): ValidationResult {
  const errors: string[] = [];

  // Check wage reserve runway (need at least 8 weeks of wages after hire)
  const currentWeeklyWages = club.squad.reduce((sum, p) => sum + p.wage, 0) +
                             club.staff.reduce((sum, s) => sum + s.salary, 0) +
                             (club.manager ? club.manager.wage : 0);
  const newWeeklyWages = currentWeeklyWages + staffWages;
  const runwayAfter = newWeeklyWages > 0 ? club.wageReserve / newWeeklyWages : Infinity;

  if (runwayAfter < 8) {
    errors.push(`Wage reserve too low for staff hire. Would leave only ${Math.floor(runwayAfter)} weeks of wages (minimum 8 required).`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
