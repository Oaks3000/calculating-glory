/**
 * Match Simulation
 *
 * Deterministic match simulation using Poisson distribution
 * with attack/defence split and seeded RNG.
 *
 * Same seed + same team strengths = same result, every time.
 * But player decisions (transfers, upgrades) change team strength,
 * which changes results even with the same seed.
 */

import { createRng, Rng } from './rng';
import { Club } from '../types/club';
import { Player } from '../types/player';

/** Base expected goals for an average-vs-average matchup (League Two realistic) */
const BASE_EXPECTED_GOALS = 1.2;

/** Home team gets 10% boost */
const HOME_ADVANTAGE = 1.10;

/** Clamp expected goals to realistic range */
const MIN_EXPECTED_GOALS = 0.5;
const MAX_EXPECTED_GOALS = 3.0;

/** Max goals per side per match */
const MAX_GOALS = 8;

/**
 * Team representation for match simulation.
 * Attack/defence split means a team of great strikers but a terrible
 * goalkeeper would score lots but concede lots.
 */
export interface Team {
  id: string;
  name: string;
  /** Attacking quality (0-100), from FWD + MID player ratings */
  attackStrength: number;
  /** Defensive quality (0-100), from GK + DEF + MID player ratings */
  defenceStrength: number;
  /** Overall modifier (0.8-1.3) from staff, facilities, reputation, form */
  teamStrength: number;
}

/**
 * Match result
 */
export interface MatchResult {
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  seed: string;
}

/**
 * Poisson sample using Knuth's algorithm.
 * Given an expected value (lambda), returns a random count
 * drawn from the Poisson distribution.
 */
function poissonSample(lambda: number, rng: Rng): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;

  do {
    k++;
    p *= rng.next();
  } while (p > L);

  return k - 1;
}

/**
 * Calculate expected goals for one side.
 * your goals = f(your attack vs their defence) * your team modifier
 */
function calculateExpectedGoals(
  attack: number,
  opposingDefence: number,
  teamModifier: number,
  isHome: boolean
): number {
  const atk = Math.max(attack, 1);
  const def = Math.max(opposingDefence, 1);

  let expected = BASE_EXPECTED_GOALS * (atk / 50) * (50 / def) * teamModifier;

  if (isHome) {
    expected *= HOME_ADVANTAGE;
  }

  return Math.max(MIN_EXPECTED_GOALS, Math.min(MAX_EXPECTED_GOALS, expected));
}

/**
 * Simulate a match between two teams.
 * Deterministic: same teams + same seed = same result, every time.
 */
export function simulateMatch(
  homeTeam: Team,
  awayTeam: Team,
  seed: string
): MatchResult {
  const rng = createRng(seed);

  const homeExpectedGoals = calculateExpectedGoals(
    homeTeam.attackStrength,
    awayTeam.defenceStrength,
    homeTeam.teamStrength,
    true
  );

  const awayExpectedGoals = calculateExpectedGoals(
    awayTeam.attackStrength,
    homeTeam.defenceStrength,
    awayTeam.teamStrength,
    false
  );

  const homeGoals = Math.min(poissonSample(homeExpectedGoals, rng), MAX_GOALS);
  const awayGoals = Math.min(poissonSample(awayExpectedGoals, rng), MAX_GOALS);

  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeGoals,
    awayGoals,
    homeExpectedGoals,
    awayExpectedGoals,
    seed
  };
}

/**
 * Build a Team from the player's Club.
 * Uses position-weighted ratings for attack/defence split:
 *   FWD weighted 3x for attack, MID 1x
 *   GK/DEF weighted 3x for defence, MID 1x
 */
export function clubToTeam(club: Club): Team {
  const { attack, defence } = calculatePositionalStrengths(club.squad);
  const teamModifier = calculateTeamModifier(club);

  return {
    id: club.id,
    name: club.name,
    attackStrength: attack,
    defenceStrength: defence,
    teamStrength: teamModifier
  };
}

function calculatePositionalStrengths(squad: Player[]): {
  attack: number;
  defence: number;
} {
  if (squad.length === 0) {
    return { attack: 30, defence: 30 };
  }

  let attackWeightedSum = 0;
  let attackWeightTotal = 0;
  let defenceWeightedSum = 0;
  let defenceWeightTotal = 0;

  for (const player of squad) {
    const rating = player.overallRating;

    switch (player.position) {
      case 'FWD':
        attackWeightedSum += rating * 3;
        attackWeightTotal += 3;
        break;
      case 'MID':
        attackWeightedSum += rating;
        attackWeightTotal += 1;
        defenceWeightedSum += rating;
        defenceWeightTotal += 1;
        break;
      case 'DEF':
        defenceWeightedSum += rating * 3;
        defenceWeightTotal += 3;
        break;
      case 'GK':
        defenceWeightedSum += rating * 3;
        defenceWeightTotal += 3;
        break;
    }
  }

  const attack = attackWeightTotal > 0
    ? attackWeightedSum / attackWeightTotal
    : 30;

  const defence = defenceWeightTotal > 0
    ? defenceWeightedSum / defenceWeightTotal
    : 30;

  return { attack, defence };
}

/**
 * Calculate team modifier from staff, facilities, reputation, and form.
 * Range: [0.8, 1.3]
 */
function calculateTeamModifier(club: Club): number {
  let modifier = 1.0;

  // Staff: average quality (0-100) → 0 to +0.15
  if (club.staff.length > 0) {
    const avgQuality = club.staff.reduce((sum, s) => sum + s.quality, 0) / club.staff.length;
    modifier += (avgQuality / 100) * 0.15;
  }

  // Facilities: average level (0-5) → 0 to +0.15
  if (club.facilities.length > 0) {
    const avgLevel = club.facilities.reduce((sum, f) => sum + f.level, 0) / club.facilities.length;
    modifier += (avgLevel / 5) * 0.15;
  }

  // Reputation: 0-100 → 0 to +0.10
  modifier += (club.reputation / 100) * 0.10;

  // Form: last 5 results, W=+0.02, D=0, L=-0.02
  for (const result of club.form.slice(-5)) {
    if (result === 'W') modifier += 0.02;
    else if (result === 'L') modifier -= 0.02;
  }

  return Math.max(0.8, Math.min(1.3, modifier));
}

/**
 * Generate a deterministic AI team from a seed.
 * Used for the 23 teams the player doesn't control.
 * Base strength varies by team; attack/defence split adds personality.
 */
export function generateAITeam(
  id: string,
  name: string,
  baseStrength: number,
  seed: string
): Team {
  const rng = createRng(seed + '-' + id);

  // Vary attack/defence around baseStrength (±10)
  const attackVariation = (rng.next() - 0.5) * 20;
  const defenceVariation = (rng.next() - 0.5) * 20;

  // Team modifier varies ±0.1 around 1.0
  const modifierVariation = (rng.next() - 0.5) * 0.2;

  return {
    id,
    name,
    attackStrength: Math.max(20, Math.min(80, baseStrength + attackVariation)),
    defenceStrength: Math.max(20, Math.min(80, baseStrength + defenceVariation)),
    teamStrength: Math.max(0.8, Math.min(1.3, 1.0 + modifierVariation))
  };
}
