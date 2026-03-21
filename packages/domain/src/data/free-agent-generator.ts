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

// ─── Famous-ish parody names (8) ──────────────────────────────────────────────

const PARODY_NAMES: string[] = [
  'Lional Messy',
  'Crystiano Ronoldo',
  'Neymur Jr',
  'Killian Mboppe',
  'Errling Haland',
  'Kevin De Bruyne',
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
 */
function generateAttributes(position: Position, rng: Rng): PlayerAttributes {
  switch (position) {
    case 'GK':
      return {
        attack:    rng.nextInt(10, 25),
        defence:   rng.nextInt(58, 78),
        teamwork:  rng.nextInt(40, 72),
        charisma:  rng.nextInt(25, 55),
        publicPotential: 0, // set after
      };
    case 'DEF':
      return {
        attack:    rng.nextInt(22, 42),
        defence:   rng.nextInt(52, 72),
        teamwork:  rng.nextInt(42, 72),
        charisma:  rng.nextInt(28, 58),
        publicPotential: 0,
      };
    case 'MID':
      return {
        attack:    rng.nextInt(38, 62),
        defence:   rng.nextInt(38, 58),
        teamwork:  rng.nextInt(48, 78),
        charisma:  rng.nextInt(35, 68),
        publicPotential: 0,
      };
    case 'FWD':
      return {
        attack:    rng.nextInt(52, 75),
        defence:   rng.nextInt(15, 35),
        teamwork:  rng.nextInt(35, 65),
        charisma:  rng.nextInt(42, 72),
        publicPotential: 0,
      };
  }
}

/**
 * Generate the free agent pool (60 players) from a seed.
 * Deterministic — same seed always produces the same pool.
 */
export function generateFreeAgentPool(seed: string): Player[] {
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

    // Wages: £500–£3,000/week in pence
    const wage = rng.nextInt(50000, 300000);

    // Attributes based on position
    const attributes = generateAttributes(position, rng);

    // publicPotential: 38–82, cap at 55 for older players (age > 28)
    const rawPotential = rng.nextInt(38, 82);
    const publicPotential = age > 28 ? Math.min(rawPotential, 55) : rawPotential;
    attributes.publicPotential = publicPotential;

    // Career curve — determines growth/decline arc and retirement age
    const curve = generatePlayerCurve(rng, age, attributes.attack, attributes.defence, position);

    // truePotential: career-arc position indicator derived from the curve
    const truePotential = computeTruePotential(curve, age);

    // Morale: 65–85 (they're keen to get a club)
    const morale = rng.nextInt(65, 85);

    return {
      id: `free-agent-${index}-${seed}`,
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
