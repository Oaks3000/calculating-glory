/**
 * Squad Generator
 *
 * Generates a starting squad of 16 weak, unknown non-league players.
 * Deterministic from seed — same seed always produces the same squad.
 *
 * Narrative context: the player has just been promoted from the non-leagues.
 * This is the inherited rabble. Most of them need replacing sharpish.
 */

import { Player, Position } from '../types/player';
import { createRng } from '../simulation/rng';

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

    // Rating: 35–52 — genuinely weak. A rating above 50 is a keeper here.
    const overallRating = 35 + Math.floor(rng.next() * 18);

    // Age: spread 18–34. Some too old (past it), some too young (raw).
    const age = 18 + Math.floor(rng.next() * 17);

    // Wages: £150–£350/week (non-league rates)
    const wage = (150 + Math.floor(rng.next() * 200)) * 100; // in pence

    // Transfer value: £3k–£20k — very low
    const transferValue = (3000 + Math.floor(rng.next() * 17000)) * 100; // in pence

    // Morale: moderate — they don't know what's coming
    const morale = 45 + Math.floor(rng.next() * 25);

    return {
      id: `inherited-${clubId}-${index}`,
      name,
      overallRating,
      position,
      wage,
      transferValue,
      age,
      morale,
      stats: {
        goals: 0,
        assists: 0,
        cleanSheets: 0,
        appearances: 0,
        averageRating: overallRating,
      },
    };
  });
}
