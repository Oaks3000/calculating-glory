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
 * @param division  Current division — scales attribute quality upward for higher tiers.
 *                  Defaults to LEAGUE_TWO (original baseline).
 */
export function generateFreeAgentPool(seed: string, division: Division = 'LEAGUE_TWO'): Player[] {
  const qualityBoost = DIVISION_QUALITY_BOOST[division];
  const rng = createRng(`${seed}-free-agents`);

  // Build full name list: parody names first, then journeymen
  // Shuffle both lists separately using rng for variety
  const allNames = [...PARODY_NAMES, ...JOURNEYMEN_NAMES];

  // Shuffle the name list deterministically
  const shuffledNames = [...allNames];
  for (let i = shuffledNames.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [shuffledNames[i], shuffledNames[j]] = [shuffledNames[j], shuffledNames[i]];
  }

  // Shuffle position distribution
  const positions = [...POSITION_DISTRIBUTION];
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  return positions.map((position, index) => {
    const name = shuffledNames[index] ?? `Free Agent ${index + 1}`;

    // Age: 18–34
    const age = rng.nextInt(18, 34);

    // Wages scale with division: L2 £500–£3k, L1 £1k–£5k, Champ £2k–£10k, PL £5k–£25k (pence)
    const wageFloor = [50_000, 100_000, 200_000, 500_000][DIVISION_QUALITY_BOOST[division] / 10] ?? 50_000;
    const wageCeil  = [300_000, 500_000, 1_000_000, 2_500_000][DIVISION_QUALITY_BOOST[division] / 10] ?? 300_000;
    const wage = rng.nextInt(wageFloor, wageCeil);

    // Attributes based on position, scaled up for higher divisions
    const attributes = generateAttributes(position, rng, qualityBoost);

    // Career curve — determines growth/decline arc and retirement age
    const curve = generatePlayerCurve(rng, age, attributes.attack, attributes.defence, position);

    // truePotential: career-arc position indicator derived from the curve
    const truePotential = computeTruePotential(curve, age);

    // publicPotential: noisy level-0 read of truePotential (±15 noise at L0 scout)
    const playerId = `free-agent-${index}-${seed}`;
    attributes.publicPotential = getScoutedPotential({ id: playerId, truePotential } as Player, 0);

    // Morale: 65–85 (they're keen to get a club)
    const morale = rng.nextInt(65, 85);

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
