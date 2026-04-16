/**
 * Transfer Listed Pool Generator
 *
 * Generates a pool of players listed for sale by NPC clubs.
 * Each NPC contributes 1–3 players scaled to their evolved strength.
 *
 * These players are generally better quality than average free agents —
 * they're contracted professionals, not castoffs. Their wages are lower
 * than the "expensive gamble" free agent tier because they're not
 * demanding a freedom premium.
 *
 * Asking price = transferValue × 1.3–1.6 (clubs don't sell at cost).
 */

import { TransferListedPlayer, Position, PlayerAttributes } from '../types/player';
import { Division } from '../types/game-state-updated';
import { createRng, Rng } from '../simulation/rng';
import { generatePlayerCurve, computeTruePotential } from '../simulation/progression';
import { getScoutedPotential } from '../types/facility';

// ── Name pool ─────────────────────────────────────────────────────────────────
// Distinct from free-agent journeymen — these are contracted squad players.

const TRANSFER_NAMES: string[] = [
  'Tom Calloway',    'Danny Hirst',      'Rob Alcott',      'Jamie Neville',
  'Lee Bramley',     'Carl Whitmore',    'Andy Dunbar',     'Phil Cassidy',
  'Ryan Lockwood',   'Dave Partridge',   'Shane Cotter',    'Gary Mellor',
  'Niall Brennan',   'Sean Tully',       'Pete Ashton',     'Craig Hadley',
  'Mark Etheridge',  'Neil Forsythe',    'Barry Stubbs',    'Dion Cartwright',
  'Josh Penney',     'Liam Norcross',    'Chris Owers',     'Paul Dempsey',
  'Will Hartigan',   'Owen Farris',      'Gus Holden',      'Fred Whitaker',
  'Adrian Kral',     'Tomaz Blaha',      'Sergio Morales',  'Emilio Rivas',
  'Lukasz Wojcik',   'Piotr Sobczak',    'Ivan Petrov',     'Georgi Toshev',
  'Jean-Luc Morel',  'Pierre Renaud',    'Tobias Frick',    'Lars Wenzel',
  'Kosta Nikolaou',  'Nikos Papadakis',  'Andres Vidal',    'Carlos Prieto',
  'Enzo Marchetti',  'Lorenzo Pinto',    'Kweku Asante',    'Tobi Ogundimu',
  'Yusuf Karimi',    'Hassan Almutairi', 'Taishi Kato',     'Ryo Hayashi',
  'Marcus Ewolo',    'Edouard Ngom',     'Bruno Fonseca',   'Miguel Esteves',
  'Ciaran Maguire',  'Declan Farley',    'Ross Templeton',  'Scott Gallacher',
  'Adam Trueman',    'Kevin Briers',     'Darren Poole',    'Gareth Blaine',
];

// ── Attribute ranges by NPC strength band ────────────────────────────────────
// Strength 25–40 → weak clubs listing backup/fringe players
// Strength 40–55 → average clubs listing workmanlike pros
// Strength 55–70 → strong clubs listing quality reserves
// Strength 70+   → elite clubs listing genuine assets

interface AttributeRange { lo: number; hi: number }

function strengthBand(strength: number): { attack: AttributeRange; defence: AttributeRange; addBonus: number } {
  if (strength >= 65) return { attack: { lo: 58, hi: 75 }, defence: { lo: 55, hi: 72 }, addBonus: 8 };
  if (strength >= 50) return { attack: { lo: 48, hi: 65 }, defence: { lo: 45, hi: 62 }, addBonus: 4 };
  if (strength >= 35) return { attack: { lo: 38, hi: 56 }, defence: { lo: 36, hi: 54 }, addBonus: 2 };
  return               { attack: { lo: 28, hi: 48 }, defence: { lo: 26, hi: 46 }, addBonus: 0 };
}

const DIVISION_QUALITY_BOOST: Record<Division, number> = {
  LEAGUE_TWO:      0,
  LEAGUE_ONE:      8,
  CHAMPIONSHIP:   16,
  PREMIER_LEAGUE: 26,
};

function generateListedAttributes(
  position: Position,
  rng: Rng,
  band: ReturnType<typeof strengthBand>,
  divBoost: number,
): PlayerAttributes {
  const b = (lo: number, hi: number) =>
    Math.min(rng.nextInt(lo + divBoost, hi + divBoost), 99);
  const { attack: atk, defence: def, addBonus } = band;

  switch (position) {
    case 'GK':
      return {
        attack:          b(10, 20),
        defence:         b(def.lo + 4 + addBonus, def.hi + 4 + addBonus),
        teamwork:        b(40, 70),
        charisma:        b(28, 58),
        publicPotential: 0,
      };
    case 'DEF':
      return {
        attack:          b(20, 38 + addBonus),
        defence:         b(def.lo + addBonus, def.hi + addBonus),
        teamwork:        b(40, 70),
        charisma:        b(28, 60),
        publicPotential: 0,
      };
    case 'MID':
      return {
        attack:          b(atk.lo, atk.hi),
        defence:         b(def.lo, def.hi),
        teamwork:        b(46 + addBonus, 76 + addBonus),
        charisma:        b(32, 65),
        publicPotential: 0,
      };
    case 'FWD':
      return {
        attack:          b(atk.lo + addBonus, atk.hi + addBonus),
        defence:         b(14, 32),
        teamwork:        b(34, 65),
        charisma:        b(40, 72),
        publicPotential: 0,
      };
  }
}

/** Transfer value (pence) from OVR: roughly quadratic curve for lower-league sums. */
function computeTransferValue(ovr: number, age: number): number {
  // Peak value at ~26, depreciation from 30+
  const ageFactor = age <= 26 ? 1.0 : Math.max(0.4, 1.0 - (age - 26) * 0.06);
  return Math.round(Math.pow(ovr, 2.2) * 1000 * ageFactor);
}

// ── Position distribution per club ───────────────────────────────────────────
// 1–3 players per club; position spread across all clubs ensures market variety.

const POSITION_CYCLE: Position[] = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'FWD'];

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Generate the transfer listed pool for a season.
 * Each NPC club contributes 1–3 players. Player quality tracks the club's
 * evolved strength. Deterministic — same inputs always produce the same pool.
 *
 * @param npcClubs     All NPC clubs in the current league
 * @param npcStrengths Evolved strength map (clubId → strength 25–99)
 * @param season       Current season number (used in seed)
 * @param playerClubId Player's own club id — excluded from listing
 * @param division     Current division — scales quality upward for higher tiers
 */
export function generateTransferListedPool(
  npcClubs: Array<{ id: string; name: string }>,
  npcStrengths: Record<string, number>,
  season: number,
  playerClubId: string,
  division: Division = 'LEAGUE_TWO',
): TransferListedPlayer[] {
  const rng = createRng(`transfer-listed-${season}`);
  const divBoost = DIVISION_QUALITY_BOOST[division];

  // Shuffle names once
  const names = [...TRANSFER_NAMES];
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }

  const pool: TransferListedPlayer[] = [];
  let nameIdx = 0;
  let posIdx = 0;

  for (const club of npcClubs) {
    if (club.id === playerClubId) continue;

    const strength = npcStrengths[club.id] ?? 50;
    // Stronger clubs list more players (top third: 3, mid: 2, bottom: 1)
    const listCount = strength >= 60 ? 3 : strength >= 45 ? 2 : 1;
    const band = strengthBand(strength);

    for (let i = 0; i < listCount; i++) {
      const position = POSITION_CYCLE[posIdx % POSITION_CYCLE.length] as Position;
      posIdx++;

      const name = names[nameIdx % names.length];
      nameIdx++;

      // Age 20–30 (peak/pre-peak players worth buying)
      const age = rng.nextInt(20, 30);

      const attributes = generateListedAttributes(position, rng, band, divBoost);
      const curve = generatePlayerCurve(rng, age, attributes.attack, attributes.defence, position);
      const truePotential = computeTruePotential(curve, age);

      const playerId = `listed-${club.id}-${i}-s${season}`;
      attributes.publicPotential = getScoutedPotential(
        { id: playerId, truePotential } as TransferListedPlayer,
        0,
      );

      const ovr = Math.round((attributes.attack + attributes.defence + attributes.teamwork) / 3);
      const transferValue = computeTransferValue(ovr, age);

      // Asking price: 1.3–1.6× markup on transferValue
      const markup = 1.3 + rng.next() * 0.3;
      const askingPrice = Math.round(transferValue * markup);

      // Wages: competitive but not a freedom premium — 60–85% of free-agent "expensive" tier
      const wageBase = [8_000, 16_000, 32_000, 80_000][divBoost / 8] ?? 8_000;
      const wageScale = 0.6 + (ovr / 100) * 0.6; // scales with quality
      const wage = Math.round(wageBase * wageScale * (0.9 + rng.next() * 0.2));

      // Morale: 60–80 (content at their club, not desperate)
      const morale = rng.nextInt(60, 80);

      // Contract expires ~end of this season or next (not immediately available free agent)
      const contractExpiresWeek = (season - 1) * 46 + rng.nextInt(30, 92);

      pool.push({
        id:              playerId,
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
          goals:         0,
          assists:       0,
          cleanSheets:   0,
          appearances:   0,
          averageRating: ovr,
        },
        sellingClubId:   club.id,
        sellingClubName: club.name,
        askingPrice,
      });
    }
  }

  return pool;
}
