/**
 * Free Agent Pool Generator
 *
 * Generates a pool of 60 available free agents from a seed.
 * Deterministic — same seed always produces the same pool.
 *
 * Narrative context: these are journeymen and near-misses rattling around
 * the lower leagues. A few recognisable faces (sort of) among the journeymen.
 */

import { Player, Position, PlayerAttributes } from '../types/player';
import { createRng, Rng } from '../simulation/rng';
import { generatePlayerCurve, computeTruePotential } from '../simulation/progression';
import { getScoutedPotential } from '../types/facility';
import { Division } from '../types/game-state-updated';

/**
 * How many attribute points to add to every range floor/ceiling per division.
 * League Two is the baseline (0). Each step up adds 10 points, capped at 99.
 */
const DIVISION_QUALITY_BOOST: Record<Division, number> = {
  LEAGUE_TWO:    0,
  LEAGUE_ONE:    10,
  CHAMPIONSHIP:  20,
  PREMIER_LEAGUE: 30,
};

// ─── Famous-ish parody names (8) ──────────────────────────────────────────────

const PARODY_NAMES: string[] = [
  'Lional Messy',
  'Crystiano Ronoldo',
  'Neymur Jr',
  'Killian Mboppe',
  'Errling Haland',
  'Kelvin De Bryne',
  'Virgil van Dijck',
  'Mohammid Salah',
];

// ─── Plausible lower-league journeymen (52) ────────────────────────────────────

const JOURNEYMEN_NAMES: string[] = [
  'Dale Hutchins',
  'Connor Farrell',
  'Matty Swann',
  'Luke Brennan',
  'Rhys Owens',
  'Kyle Digby',
  'Jordan Pryce',
  'Nathan Holloway',
  'Callum Dack',
  'Aaron Whitfield',
  'Sam Buckley',
  'Ben Treacy',
  'Ross Corbin',
  'Jake Nolan',
  'Stuart Fenwick',
  'Marcus Osei',
  'Femi Adeyemi',
  'Tunde Ajayi',
  'Emil Novak',
  'Jakub Sedlak',
  'Radek Blaha',
  'Tibor Varga',
  'Aleksandr Volkov',
  'Dmitri Korolev',
  'Artur Lewicki',
  'Pablo Fuentes',
  'Diego Alcazar',
  'Raul Herranz',
  'Marco Ferrini',
  'Luca Battisti',
  'Fabio Mangano',
  'Yannick Gruber',
  'Stefan Baumann',
  'Pieter van Dael',
  'Jan Vermeer',
  'Christophe Moulin',
  'Gaël Renard',
  'Remi Chauvet',
  'Sven Lindqvist',
  'Bjorn Tangen',
  'Mikkel Roed',
  'Carlos Viegas',
  'Bruno Tavares',
  'Nuno Figueiredo',
  'Ahmed Okonkwo',
  'Kwame Asante',
  'Moussa Diallo',
  'Ibrahim Traore',
  'Rizwan Hussain',
  'Deepak Pillai',
  'Yuki Tanaka',
  'Seun Adebayo',
];

/** Distribution for 60 players: 4 GK, 16 DEF, 22 MID, 18 FWD */
const POSITION_DISTRIBUTION: Position[] = [
  'GK', 'GK', 'GK', 'GK',
  'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
  'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
  'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID',
  'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID',
  'MID', 'MID', 'MID', 'MID', 'MID', 'MID',
  'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD',
  'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD',
  'FWD', 'FWD',
];

/**
 * Generate attributes for a player based on position using seeded RNG.
 * qualityBoost shifts all ranges upward for higher-division pools (capped at 99).
 */
function generateAttributes(position: Position, rng: Rng, qualityBoost = 0): PlayerAttributes {
  const b = (lo: number, hi: number) => Math.min(rng.nextInt(lo + qualityBoost, hi + qualityBoost), 99);
  switch (position) {
    case 'GK':
      return {
        attack:    b(10, 25),
        defence:   b(58, 78),
        teamwork:  b(40, 72),
        charisma:  b(25, 55),
        publicPotential: 0, // set after
      };
    case 'DEF':
      return {
        attack:    b(22, 42),
        defence:   b(52, 72),
        teamwork:  b(42, 72),
        charisma:  b(28, 58),
        publicPotential: 0,
      };
    case 'MID':
      return {
        attack:    b(38, 62),
        defence:   b(38, 58),
        teamwork:  b(48, 78),
        charisma:  b(35, 68),
        publicPotential: 0,
      };
    case 'FWD':
      return {
        attack:    b(52, 75),
        defence:   b(15, 35),
        teamwork:  b(35, 65),
        charisma:  b(42, 72),
        publicPotential: 0,
      };
  }
}

/**
 * Generate the free agent pool (60 players) from a seed.
 * Deterministic — same seed always produces the same pool.
 *
 * The pool is bimodal by design:
 *
 *   Bargain bin (40 players) — age 28–36, OVR ~25–50.
 *   Released castoffs, over-the-hill journeymen, youth that never made it.
 *   Low wages because nobody else wants them.
 *
 *   Expensive gamble (20 players) — age 23–30, OVR ~52–72.
 *   Decent players demanding a freedom premium for their time without a club.
 *   Good enough to strengthen the squad; expensive enough to be a budget risk.
 *
 * This creates a real decision: pay the premium for quality, or save wages
 * and accept the risk of a bargain-bin signing.
 *
 * @param division  Current division — scales attribute quality upward for higher tiers.
 *                  Defaults to LEAGUE_TWO (original baseline).
 */
export function generateFreeAgentPool(seed: string, division: Division = 'LEAGUE_TWO'): Player[] {
  const qualityBoost = DIVISION_QUALITY_BOOST[division];
  const rng = createRng(`${seed}-free-agents`);

  const allNames = [...PARODY_NAMES, ...JOURNEYMEN_NAMES];
  const shuffledNames = [...allNames];
  for (let i = shuffledNames.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [shuffledNames[i], shuffledNames[j]] = [shuffledNames[j], shuffledNames[i]];
  }

  const positions = [...POSITION_DISTRIBUTION];
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // Wage bands per division tier index (0=L2, 1=L1, 2=Champ, 3=PL)
  const tierIdx = DIVISION_QUALITY_BOOST[division] / 10;
  // Bargain bin wages — low, reflects unwantedness
  const bargainWageFloor = [20_000,  40_000,  80_000, 200_000][tierIdx] ?? 20_000;
  const bargainWageCeil  = [80_000, 160_000, 320_000, 800_000][tierIdx] ?? 80_000;
  // Expensive gamble wages — premium for freedom
  const premiumWageFloor = [180_000, 360_000, 700_000, 1_500_000][tierIdx] ?? 180_000;
  const premiumWageCeil  = [450_000, 900_000, 1_800_000, 4_500_000][tierIdx] ?? 450_000;

  return positions.map((position, index) => {
    const playerId = `free-agent-${index}-${seed}`;
    const name = shuffledNames[index] ?? `Free Agent ${index + 1}`;

    // First 40 = bargain bin; last 20 = expensive gamble
    const isBargain = index < 40;

    const age = isBargain
      ? rng.nextInt(28, 36)   // older / declining
      : rng.nextInt(23, 30);  // prime / pre-peak

    // Quality boost for bargain bin is reduced (these are poor players)
    const bargainQualityPenalty = isBargain ? -10 : 10;
    const attributes = generateAttributes(position, rng, qualityBoost + bargainQualityPenalty);

    const wage = isBargain
      ? rng.nextInt(bargainWageFloor, bargainWageCeil)
      : rng.nextInt(premiumWageFloor, premiumWageCeil);

    const curve = generatePlayerCurve(rng, age, attributes.attack, attributes.defence, position);
    const truePotential = computeTruePotential(curve, age);
    attributes.publicPotential = getScoutedPotential({ id: playerId, truePotential } as Player, 0);

    // Bargain bin morale: 55–75 (frustrated, not despairing)
    // Expensive gamble morale: 70–88 (confident, knows their worth)
    const morale = isBargain ? rng.nextInt(55, 75) : rng.nextInt(70, 88);

    return {
      id: playerId,
      name,
      position,
      wage,
      transferValue: 0,
      age,
      morale,
      attributes,
      truePotential,
      curve,
      contractExpiresWeek: 0,
      stats: {
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        appearances: 0,
        averageRating: Math.round((attributes.attack + attributes.defence + attributes.teamwork) / 3),
      },
    };
  });
}
