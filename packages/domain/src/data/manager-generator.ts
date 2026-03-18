/**
 * Manager Pool Generator
 *
 * Generates a pool of 8 available managers from a seed.
 * Deterministic — same seed always produces the same pool.
 *
 * Three tiers:
 *   Elite (2)   — high experience, high wages, well-rounded
 *   Mid (3)     — specialist strength (high tactical or high motivation), moderate wages
 *   Budget (3)  — low stats, low wages — stepping-stone option
 *
 * All names are fictional lower-league gaffer archetypes.
 */

import { Manager, ManagerAttributes } from '../types/staff';
import { createRng, Rng } from '../simulation/rng';

// ─── Manager name pool ─────────────────────────────────────────────────────────

const MANAGER_NAMES: string[] = [
  'Terry Boulton',
  'Graham Nix',
  'Phil Stanwick',
  'Dave Corrigan',
  'Steve Outhwaite',
  'Mick Farron',
  'Paul Hendry',
  'Kevin Saddler',
  'Ray Trotter',
  'Brian Colwell',
  'Neil Asprey',
  'Andy Marshfield',
  'Chris Dunwell',
  'Martin Chalk',
  'Gary Pennick',
  'Bob Ashbridge',
];

// ─── Tier definitions ─────────────────────────────────────────────────────────

interface ManagerTier {
  count: number;
  /** Attribute range [min, max] for each stat */
  tacticalRange: [number, number];
  motivationRange: [number, number];
  experienceRange: [number, number];
  /** Weekly wage range in pence */
  wageRange: [number, number];
  contractLengthWeeks: number;
}

const TIERS: ManagerTier[] = [
  // Elite — two managers. High across the board, expensive.
  {
    count: 2,
    tacticalRange: [70, 90],
    motivationRange: [65, 85],
    experienceRange: [75, 95],
    wageRange: [400_000, 700_000],   // £4,000–£7,000/wk
    contractLengthWeeks: 104,        // 2 seasons
  },
  // Mid-tier — three managers. One stat dominates. Affordable.
  {
    count: 3,
    tacticalRange: [45, 75],
    motivationRange: [45, 75],
    experienceRange: [45, 75],
    wageRange: [150_000, 350_000],   // £1,500–£3,500/wk
    contractLengthWeeks: 52,         // 1 season
  },
  // Budget — three managers. Low stats, very cheap.
  {
    count: 3,
    tacticalRange: [20, 50],
    motivationRange: [20, 50],
    experienceRange: [15, 45],
    wageRange: [50_000, 130_000],    // £500–£1,300/wk
    contractLengthWeeks: 52,
  },
];

// ─── Generator ────────────────────────────────────────────────────────────────

function randInt(rng: Rng, min: number, max: number): number {
  return Math.round(min + rng.next() * (max - min));
}

/**
 * Generate the pool of 8 available managers, deterministic from seed.
 * Managers are sorted worst-to-best (budget first, elite last) so the UI
 * can present them in a sensible order.
 */
export function generateManagerPool(seed: string): Manager[] {
  const rng = createRng(`managers-${seed}`);
  const namePool = [...MANAGER_NAMES];
  const managers: Manager[] = [];
  let idCounter = 1;

  for (const tier of TIERS) {
    for (let i = 0; i < tier.count; i++) {
      // Pick a unique name
      const nameIdx = randInt(rng, 0, namePool.length - 1);
      const name = namePool.splice(nameIdx, 1)[0];

      const attributes: ManagerAttributes = {
        tactical:    randInt(rng, tier.tacticalRange[0],    tier.tacticalRange[1]),
        motivation:  randInt(rng, tier.motivationRange[0],  tier.motivationRange[1]),
        experience:  randInt(rng, tier.experienceRange[0],  tier.experienceRange[1]),
      };

      const wage = randInt(rng, tier.wageRange[0], tier.wageRange[1]);
      // Round wage to nearest £100 (10_000 pence)
      const roundedWage = Math.round(wage / 10_000) * 10_000;

      managers.push({
        id: `mgr-${idCounter++}`,
        name,
        attributes,
        wage: roundedWage,
        contractLengthWeeks: tier.contractLengthWeeks,
        contractExpiresWeek: 0, // set on hire
      });
    }
  }

  return managers;
}
