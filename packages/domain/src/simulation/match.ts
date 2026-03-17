/**
 * Match Simulation
 *
 * Deterministic match simulation using Poisson distribution
 * with attack/defence split and seeded RNG.
 *
 * Same seed + same team strengths = same result, every time.
 * But player decisions (transfers, upgrades, training focus) change
 * team strength, which changes results even with the same seed.
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
 *
 * Attack/defence split means a squad of great strikers but a poor
 * goalkeeper will score freely but also concede freely.
 *
 * fanZoneBonus is kept separate from teamStrength so it can be applied
 * to home matches only — atmosphere doesn't travel to away grounds.
 */
export interface Team {
  id: string;
  name: string;
  /** Attacking quality (0-100), from player attack attributes weighted by position */
  attackStrength: number;
  /** Defensive quality (0-100), from player defence attributes weighted by position */
  defenceStrength: number;
  /** Overall modifier (0.80–1.30) from teamwork, training ground, staff, reputation, form, morale */
  teamStrength: number;
  /** Fan Zone home atmosphere bonus — applied to home expected goals only (0.00–0.05) */
  fanZoneBonus: number;
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
 * your goals = f(your attack vs their defence) × your team modifier
 * Home teams additionally get the base HOME_ADVANTAGE and their fan zone bonus.
 */
function calculateExpectedGoals(
  attack: number,
  opposingDefence: number,
  teamModifier: number,
  fanZoneBonus: number,
  isHome: boolean
): number {
  const atk = Math.max(attack, 1);
  const def = Math.max(opposingDefence, 1);

  let expected = BASE_EXPECTED_GOALS * (atk / 50) * (50 / def) * teamModifier;

  if (isHome) {
    expected *= HOME_ADVANTAGE;
    expected *= (1 + fanZoneBonus);
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
    homeTeam.fanZoneBonus,
    true
  );

  const awayExpectedGoals = calculateExpectedGoals(
    awayTeam.attackStrength,
    homeTeam.defenceStrength,
    awayTeam.teamStrength,
    0, // Fan zone is home-only — away clubs get no atmosphere bonus
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
 *
 * Attack strength uses player.attributes.attack weighted by position:
 *   FWD 3×  MID 2×  DEF 1×  GK 0×
 *
 * Defence strength uses player.attributes.defence weighted by position:
 *   FWD 1×  MID 2×  DEF 3×  GK 3.5×
 *
 * Training focus is applied after base strengths are calculated:
 *   ATTACKING       → attackStrength  × 1.05
 *   DEFENSIVE       → defenceStrength × 1.05
 *   FITNESS         → teamModifier    + 0.03
 *   SET_PIECES      → attackStrength  × 1.03
 *   YOUTH_INTEGRATION → no match effect (developmental only)
 */
export function clubToTeam(club: Club): Team {
  const { attack, defence } = calculatePositionalStrengths(club.squad);
  const { modifier, fanZoneBonus } = calculateTeamModifier(club);

  // Apply training focus multipliers after base calculation
  let attackStrength = attack;
  let defenceStrength = defence;
  let teamModifier = modifier;

  switch (club.trainingFocus) {
    case 'ATTACKING':
      attackStrength *= 1.05;
      break;
    case 'DEFENSIVE':
      defenceStrength *= 1.05;
      break;
    case 'FITNESS':
      teamModifier += 0.03;
      break;
    case 'SET_PIECES':
      attackStrength *= 1.03;
      break;
    case 'YOUTH_INTEGRATION':
      // No match effect — developmental benefit accrues over the season
      break;
  }

  // Re-clamp after training focus may have pushed modifier above ceiling
  teamModifier = Math.max(0.8, Math.min(1.3, teamModifier));

  return {
    id: club.id,
    name: club.name,
    attackStrength,
    defenceStrength,
    teamStrength: teamModifier,
    fanZoneBonus,
  };
}

/**
 * Calculate attack and defence strength from the squad.
 *
 * Uses individual skill attributes (not overallRating), weighted by position:
 *
 * Attack weights:   FWD 3×  MID 2×  DEF 1×  GK 0×
 * Defence weights:  FWD 1×  MID 2×  DEF 3×  GK 3.5×
 *
 * Rationale: a striker's attack attribute dominates the attacking calculation;
 * a goalkeeper's defence attribute is the single biggest defensive factor.
 * DEF players contributing 1× to attack reflects their ability to join set
 * pieces — it shouldn't be zero, but it's minor.
 */
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
    const atk = player.attributes.attack;
    const def = player.attributes.defence;

    switch (player.position) {
      case 'FWD':
        attackWeightedSum  += atk * 3;
        attackWeightTotal  += 3;
        defenceWeightedSum += def * 1;
        defenceWeightTotal += 1;
        break;
      case 'MID':
        attackWeightedSum  += atk * 2;
        attackWeightTotal  += 2;
        defenceWeightedSum += def * 2;
        defenceWeightTotal += 2;
        break;
      case 'DEF':
        attackWeightedSum  += atk * 1;
        attackWeightTotal  += 1;
        defenceWeightedSum += def * 3;
        defenceWeightTotal += 3;
        break;
      case 'GK':
        // GK contributes nothing to attack
        defenceWeightedSum += def * 3.5;
        defenceWeightTotal += 3.5;
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
 * Calculate the team modifier and fan zone bonus from club inputs.
 *
 * Modifier range: [0.80, 1.30] (clamped).
 * Fan zone bonus is returned separately for home-only application.
 *
 * Contributions:
 *   Squad avg teamwork  (0–100)   → +0.00 to +0.08
 *   TRAINING_GROUND level (0–5)   → +0.00 to +0.50  ← primary performance lever
 *   Staff avg quality   (0–100)   → +0.00 to +0.12
 *   Reputation          (0–100)   → +0.00 to +0.08
 *   Form last 5 (W/D/L)           → W=+0.02, D=0, L=−0.02 each
 *   Squad avg morale    (0–100)   → −0.05 to +0.05 (centred at 50)
 *   FAN_ZONE level (0–5)          → +0.00 to +0.05 (home only, returned separately)
 *
 * Theoretical max before clamping: 1.0+0.08+0.50+0.12+0.08+0.10+0.05+0.05 = 1.98 → clamped to 1.30
 * Facilities NOT in the modifier: STADIUM, COMMERCIAL, F&B (revenue), MEDICAL_CENTER (injury),
 *   YOUTH_ACADEMY (development), GROUNDS_SECURITY (attendance/reputation).
 */
function calculateTeamModifier(club: Club): {
  modifier: number;
  fanZoneBonus: number;
} {
  let modifier = 1.0;

  // Squad avg teamwork (0–100) → +0.00 to +0.08
  if (club.squad.length > 0) {
    const avgTeamwork =
      club.squad.reduce((sum, p) => sum + p.attributes.teamwork, 0) / club.squad.length;
    modifier += (avgTeamwork / 100) * 0.08;
  }

  // TRAINING_GROUND level (0–5) → +0.00 to +0.50
  const trainingGround = club.facilities.find(f => f.type === 'TRAINING_GROUND');
  if (trainingGround) {
    modifier += (trainingGround.level / 5) * 0.50;
  }

  // Staff avg quality (0–100) → +0.00 to +0.12
  if (club.staff.length > 0) {
    const avgQuality =
      club.staff.reduce((sum, s) => sum + s.quality, 0) / club.staff.length;
    modifier += (avgQuality / 100) * 0.12;
  }

  // Reputation (0–100) → +0.00 to +0.08
  modifier += (club.reputation / 100) * 0.08;

  // Form: last 5 results, W=+0.02, D=0, L=−0.02
  for (const result of club.form.slice(-5)) {
    if (result === 'W') modifier += 0.02;
    else if (result === 'L') modifier -= 0.02;
  }

  // Squad avg morale → −0.05 to +0.05 (centred at morale=50)
  // Makes sign/release decisions feel consequential immediately.
  if (club.squad.length > 0) {
    const avgMorale =
      club.squad.reduce((sum, p) => sum + p.morale, 0) / club.squad.length;
    modifier += ((avgMorale / 100) - 0.5) * 0.10;
  }

  // FAN_ZONE level (0–5) → returned separately, applied home-only in simulateMatch
  const fanZoneFacility = club.facilities.find(f => f.type === 'FAN_ZONE');
  const fanZoneBonus = fanZoneFacility
    ? (fanZoneFacility.level / 5) * 0.05
    : 0;

  return {
    modifier: Math.max(0.8, Math.min(1.3, modifier)),
    fanZoneBonus,
  };
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
    teamStrength: Math.max(0.8, Math.min(1.3, 1.0 + modifierVariation)),
    fanZoneBonus: 0, // AI clubs have no fan zone tracking
  };
}
