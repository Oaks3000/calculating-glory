/**
 * Scout Target Generator
 *
 * Generates a contracted player at an NPC club, seeded from the mission
 * context so the same mission always finds the same player.
 *
 * Quality scales with scout level — a better network finds better players.
 * Scout level also gates access to the getScoutedPotential noise system
 * (already in facility.ts).
 */

import { Player, Position, PlayerAttributes } from '../types/player';
import { createRng } from '../simulation/rng';
import { generatePlayerCurve, computeTruePotential } from '../simulation/progression';
import { LEAGUE_TWO_TEAMS } from './league-two-teams';

// ── Names for contracted players ──────────────────────────────────────────────

const TARGET_NAMES: string[] = [
  'Danny Forsyth',
  'Leon Cartwright',
  'Tom Maguire',
  'Ryan Estrada',
  'Pedro Alves',
  'Florian Krause',
  'Lukas Petrak',
  'Andre Beaumont',
  'Joe Whitmore',
  'Calvin Ashby',
  'Noel Stroud',
  'Remi Dubois',
  'Ariel Goldstein',
  'Omar Nassar',
  'Ivan Marchetti',
  'Phil Garvey',
  'Cian Doherty',
  'Kwabena Asare',
  'Thibault Renaud',
  'Sander Bakker',
  'Carlos Benitez',
  'Yannick Bosman',
  'Marcus Ferreira',
  'Georgi Petrov',
  'Alistair Quinn',
  'Dmitri Nikitin',
  'Seun Olatunji',
  'Xavier Moreau',
  'Emre Yilmaz',
  'Benedikt Wolf',
];

// ── Quality bands by scout level ──────────────────────────────────────────────
// Better scout levels find higher-quality players.
// OVR = avg(attack, defence, teamwork), so we target those attribute ranges.

interface QualityBand {
  attrMin: number;
  attrMax: number;
  wageMin: number;   // pence/week
  wageMax: number;
}

const QUALITY_BAND: QualityBand[] = [
  { attrMin: 38, attrMax: 52, wageMin: 50_000,  wageMax: 120_000  }, // level 0
  { attrMin: 42, attrMax: 56, wageMin: 60_000,  wageMax: 150_000  }, // level 1
  { attrMin: 47, attrMax: 62, wageMin: 75_000,  wageMax: 190_000  }, // level 2
  { attrMin: 52, attrMax: 67, wageMin: 100_000, wageMax: 230_000  }, // level 3
  { attrMin: 58, attrMax: 72, wageMin: 130_000, wageMax: 280_000  }, // level 4
  { attrMin: 63, attrMax: 78, wageMin: 160_000, wageMax: 340_000  }, // level 5
];

// ── Scout fee by level ─────────────────────────────────────────────────────────

const SCOUT_FEES_PENCE: number[] = [
  50_000,   // level 0 — £500
  100_000,  // level 1 — £1,000
  200_000,  // level 2 — £2,000
  350_000,  // level 3 — £3,500
  500_000,  // level 4 — £5,000
  750_000,  // level 5 — £7,500
];

export function getScoutFee(scoutLevel: number): number {
  return SCOUT_FEES_PENCE[Math.max(0, Math.min(5, scoutLevel))];
}

// ── Attribute generator ───────────────────────────────────────────────────────

function generateTargetAttributes(
  position: Position,
  attributePriority: 'attack' | 'defence' | 'teamwork' | null,
  band: QualityBand,
  rng: ReturnType<typeof createRng>,
): PlayerAttributes {
  const { attrMin, attrMax } = band;

  // Base attributes for position
  let attack: number;
  let defence: number;
  let teamwork: number;

  switch (position) {
    case 'GK':
      attack  = rng.nextInt(10, 25);
      defence = rng.nextInt(attrMin + 5, attrMax + 5);
      teamwork = rng.nextInt(attrMin - 10, attrMax - 5);
      break;
    case 'DEF':
      attack  = rng.nextInt(attrMin - 15, attrMax - 10);
      defence = rng.nextInt(attrMin + 5, attrMax + 5);
      teamwork = rng.nextInt(attrMin - 5, attrMax);
      break;
    case 'MID':
      attack  = rng.nextInt(attrMin - 5, attrMax);
      defence = rng.nextInt(attrMin - 5, attrMax);
      teamwork = rng.nextInt(attrMin, attrMax + 5);
      break;
    case 'FWD':
      attack  = rng.nextInt(attrMin + 5, attrMax + 10);
      defence = rng.nextInt(attrMin - 20, attrMax - 10);
      teamwork = rng.nextInt(attrMin - 10, attrMax);
      break;
  }

  // Attribute priority boosts the relevant stat by ~10%
  if (attributePriority === 'attack')   attack   = Math.min(99, Math.round(attack   * 1.1));
  if (attributePriority === 'defence')  defence  = Math.min(99, Math.round(defence  * 1.1));
  if (attributePriority === 'teamwork') teamwork = Math.min(99, Math.round(teamwork * 1.1));

  const charisma       = rng.nextInt(30, 70);
  const publicPotential = rng.nextInt(attrMin - 10, attrMax);

  return {
    attack:          Math.max(1, attack),
    defence:         Math.max(1, defence),
    teamwork:        Math.max(1, teamwork),
    charisma,
    publicPotential: Math.max(1, Math.min(99, publicPotential)),
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface ScoutTargetResult {
  player: Player;
  npcClubId: string;
  npcClubName: string;
  askingPrice: number;
}

/**
 * Deterministically generate the player a scout finds, given mission context.
 *
 * Seeded from baseSeed + season + week so the same state always produces the
 * same target. Upgrading the Scout Network before the week ticks will change
 * the quality band but same target identity within that band.
 */
export function generateScoutTarget(
  position: Position,
  attributePriority: 'attack' | 'defence' | 'teamwork' | null,
  scoutLevel: number,
  baseSeed: string,
  season: number,
  week: number,
  playerClubId: string,
): ScoutTargetResult {
  const level = Math.max(0, Math.min(5, scoutLevel));
  const band  = QUALITY_BAND[level];
  const rng   = createRng(`scout-${baseSeed}-S${season}-W${week}`);

  // Pick an NPC club (not the player's own club)
  const eligibleClubs = LEAGUE_TWO_TEAMS.filter(t => t.id !== playerClubId);
  const npcClub = eligibleClubs[rng.nextInt(0, eligibleClubs.length - 1)];

  // Pick a name
  const name = TARGET_NAMES[rng.nextInt(0, TARGET_NAMES.length - 1)];

  // Age: typically 20–32 for contracted players
  const age = rng.nextInt(20, 32);

  // Attributes
  const attributes = generateTargetAttributes(position, attributePriority, band, rng);

  // Wage: within the band
  const wage = rng.nextInt(band.wageMin, band.wageMax);

  // Morale: contracted players are generally content
  const morale = rng.nextInt(55, 80);

  // Transfer value / asking price: OVR² × 800, same formula as SELL_PLAYER_TO_NPC.
  // Computed inline here since overallRating is no longer stored on Player.
  const ovr = Math.round((attributes.attack + attributes.defence + attributes.teamwork) / 3);
  const askingPrice = Math.max(10_000_00, ovr * ovr * 800);

  // Career curve — determines growth/decline arc and retirement age
  const curve = generatePlayerCurve(rng, age, attributes.attack, attributes.defence, position);

  // truePotential: career-arc position indicator derived from the curve
  const truePotential = computeTruePotential(curve, age);

  const player: Player = {
    id: `scout-target-S${season}-W${week}-${position}`,
    name,
    position,
    wage,
    transferValue: askingPrice,
    age,
    morale,
    attributes,
    truePotential,
    curve,
    contractExpiresWeek: 0, // updated on SCOUT_TRANSFER_COMPLETED
    stats: {
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      appearances: 0,
      averageRating: ovr,
    },
  };

  return { player, npcClubId: npcClub.id, npcClubName: npcClub.name, askingPrice };
}
