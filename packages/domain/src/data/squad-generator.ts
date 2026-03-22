/**
 * Squad Generator
 *
 * Generates a starting squad of 16 weak, unknown non-league players.
 * Deterministic from seed — same seed always produces the same squad.
 *
 * Narrative context: the player has just been promoted from the non-leagues.
 * This is the inherited rabble. Most of them need replacing sharpish.
 */

import { Player, Position, PlayerAttributes } from '../types/player';
import { createRng, Rng } from '../simulation/rng';
import { generatePlayerCurve, computeTruePotential } from '../simulation/progression';
import { getScoutedPotential } from '../types/facility';

// Name banks — plausible lower-league English football player names
const FORENAMES = [
  'Terry', 'Dave', 'Glen', 'Craig', 'Jamie', 'Lee', 'Chris', 'Mark',
  'Steve', 'Paul', 'Andy', 'Phil', 'Rob', 'John', 'Wayne', 'Darren',
  'Scott', 'Shane', 'Kevin', 'Tony', 'Dan', 'Gary', 'Nicky', 'Barry',
  'Carl', 'Dean', 'Graham', 'Keith', 'Mick', 'Neil', 'Pete', 'Ryan',
  'Shaun', 'Tom', 'Vic', 'Will', 'Ade', 'Brad', 'Clive', 'Doug',
];

const SURNAMES = [
  'Perkins', 'Gould', 'Marsh', 'Stubbs', 'Denton', 'Holt', 'Firth',
  'Neale', 'Briggs', 'Towers', 'Grimes', 'Hackett', 'Doyle', 'Watts',
  'Sayers', 'Daly', 'Birch', 'Nolan', 'Poole', 'Cross', 'Hunter',
  'Payne', 'Webb', 'Booth', 'Curry', 'Elson', 'Frost', 'Gale',
  'Haines', 'Ivory', 'Jarvis', 'Keane', 'Lodge', 'Munro', 'Norris',
  'Ogden', 'Patel', 'Quinn', 'Reeve', 'Sykes', 'Trent', 'Upton',
  'Vance', 'Wren', 'York', 'Ashby', 'Bale', 'Crane', 'Drake',
];

/**
 * Generate attributes for weak non-league players based on position.
 */
function generateWeakAttributes(position: Position, rng: Rng): PlayerAttributes {
  switch (position) {
    case 'GK':
      return {
        attack:          rng.nextInt(8, 18),
        defence:         rng.nextInt(30, 52),
        teamwork:        rng.nextInt(35, 60),
        charisma:        rng.nextInt(20, 45),
        publicPotential: 0, // set after
      };
    case 'DEF':
      return {
        attack:          rng.nextInt(15, 30),
        defence:         rng.nextInt(28, 50),
        teamwork:        rng.nextInt(32, 58),
        charisma:        rng.nextInt(20, 45),
        publicPotential: 0,
      };
    case 'MID':
      return {
        attack:          rng.nextInt(25, 45),
        defence:         rng.nextInt(25, 42),
        teamwork:        rng.nextInt(35, 60),
        charisma:        rng.nextInt(22, 48),
        publicPotential: 0,
      };
    case 'FWD':
      return {
        attack:          rng.nextInt(32, 52),
        defence:         rng.nextInt(10, 28),
        teamwork:        rng.nextInt(28, 52),
        charisma:        rng.nextInt(25, 50),
        publicPotential: 0,
      };
  }
}

/** Distribution: 2 GK, 5 DEF, 5 MID, 4 FWD — enough to cover any formation with bench */
const POSITION_DISTRIBUTION: Position[] = [
  'GK', 'GK',
  'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
  'MID', 'MID', 'MID', 'MID', 'MID',
  'FWD', 'FWD', 'FWD', 'FWD',
];

/**
 * Generate a starting squad of 16 weak non-league players.
 * All are genuinely bad — the player needs to replace most of them.
 */
export function generateStartingSquad(seed: string, clubId: string): Player[] {
  const rng = createRng(`${seed}-squad-${clubId}`);

  const usedNames = new Set<string>();

  function pickName(): string {
    let name: string;
    let attempts = 0;
    do {
      const forename = FORENAMES[Math.floor(rng.next() * FORENAMES.length)];
      const surname = SURNAMES[Math.floor(rng.next() * SURNAMES.length)];
      name = `${forename} ${surname}`;
      attempts++;
    } while (usedNames.has(name) && attempts < 100);
    usedNames.add(name);
    return name;
  }

  return POSITION_DISTRIBUTION.map((position, index) => {
    const name = pickName();

    // Age: spread 18–34. Some too old (past it), some too young (raw).
    const age = 18 + Math.floor(rng.next() * 17);

    // Wages: £150–£350/week (non-league rates)
    const wage = (150 + Math.floor(rng.next() * 200)) * 100; // in pence

    // Transfer value: £3k–£20k — very low
    const transferValue = (3000 + Math.floor(rng.next() * 17000)) * 100; // in pence

    // Morale: moderate — they don't know what's coming
    const morale = 45 + Math.floor(rng.next() * 25);

    // Attributes for weak non-league players
    const attributes = generateWeakAttributes(position, rng);

    // Career curve — determines growth/decline arc and retirement age
    const curve = generatePlayerCurve(rng, age, attributes.attack, attributes.defence, position);

    // truePotential: career-arc position indicator derived from the curve
    const truePotential = computeTruePotential(curve, age);

    // publicPotential: noisy level-0 read of truePotential (±15 noise at L0 scout)
    const playerId = `inherited-${clubId}-${index}`;
    attributes.publicPotential = getScoutedPotential({ id: playerId, truePotential } as Player, 0);

    // contractExpiresWeek: mix of 23 and 46 (half expire mid-season to create urgency)
    const contractExpiresWeek = rng.next() < 0.5 ? 23 : 46;

    return {
      id: playerId,
      name,
      position,
      wage,
      transferValue,
      age,
      morale,
      attributes,
      truePotential,
      curve,
      contractExpiresWeek,
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
