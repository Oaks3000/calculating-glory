/**
 * Player Attribute Progression
 *
 * Age-based growth and decline for attack and defence attributes.
 * Each player has a predetermined career curve assigned at generation.
 * Progression is applied once per season at PRE_SEASON_STARTED.
 *
 * Design:
 * - 4 curve shapes distributed equally at random
 * - Peak height modifier 1–5 controls maximum stat gain above baseline
 * - Attack and defence change; teamwork is constant; charisma is separate
 * - 70:30 weighting toward the position's primary attribute
 * - Hard floor of 8 for both attack and defence
 * - Retirement age: approximate Gaussian centred ~35 (SD ~3.5), clamped 28–42
 * - truePotential is left for the caller to update — see computeTruePotential()
 */

import { Player, Position, PlayerCurve, CurveShape } from '../types/player';
import { Rng } from './rng';

// ── Curve shape parameters ─────────────────────────────────────────────────────

/** Peak position as a fraction of total career length (0 = start, 1 = retirement). */
const CURVE_PEAK_T: Record<CurveShape, number> = {
  SHALLOW_BELL:   0.45, // peaks mid-career, long plateau
  STEEP_BELL:     0.45, // peaks mid-career, sharp sides
  FRONT_WEIGHTED: 0.25, // peaks early, long gradual decline
  BACK_WEIGHTED:  0.65, // slow build, peaks late, sharp drop-off
};

/**
 * Sharpness exponents for the ascending and descending halves of each curve.
 * Uses Math.sin(π/2 * x) ^ exponent as the basis.
 * - Exponent < 1: rises/falls quickly early, flattens near the transition
 * - Exponent > 1: stays flat, then rises/falls steeply near the transition
 */
const CURVE_PARAMS: Record<CurveShape, { rise: number; fall: number }> = {
  SHALLOW_BELL:   { rise: 0.55, fall: 0.55 }, // gentle, symmetric slopes
  STEEP_BELL:     { rise: 2.0,  fall: 2.0  }, // flat then sharp — boom and bust
  FRONT_WEIGHTED: { rise: 1.2,  fall: 0.45 }, // moderate ascent, very gradual fade
  BACK_WEIGHTED:  { rise: 0.45, fall: 1.8  }, // barely rises, then collapses
};

// ── Peak gain table ────────────────────────────────────────────────────────────

/**
 * Total stat points gained at peak across attack + defence combined,
 * distributed by position weighting.
 */
const PEAK_GAIN: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 10, // barely improves — journeyman ceiling
  2: 18, // modest improvement
  3: 26, // solid development arc
  4: 34, // high-ceiling player
  5: 42, // rare talent, exceptional peak
};

// ── Position weighting ─────────────────────────────────────────────────────────

/**
 * Fraction of peak gain applied to attack vs defence.
 * 70% goes to the primary attribute for the position; 30% to the secondary.
 */
function positionWeights(position: Position): { attackWeight: number; defenceWeight: number } {
  switch (position) {
    case 'FWD': return { attackWeight: 0.70, defenceWeight: 0.30 };
    case 'GK':  return { attackWeight: 0.30, defenceWeight: 0.70 };
    case 'DEF': return { attackWeight: 0.30, defenceWeight: 0.70 };
    case 'MID': return { attackWeight: 0.50, defenceWeight: 0.50 };
  }
}

// ── Curve evaluation ───────────────────────────────────────────────────────────

/**
 * Evaluate the career curve at position t ∈ [0, 1]:
 *   t = 0  → career start  → value = 0 (no growth above base yet)
 *   t = peakT → career peak → value = 1 (maximum gain above base)
 *   t = 1  → retirement     → value = 0 (back to base; floor prevents drop below 8)
 *
 * Returns a value in [0, 1].
 */
function curveValue(t: number, shape: CurveShape): number {
  if (t <= 0 || t >= 1) return 0;

  const peakT = CURVE_PEAK_T[shape];
  const { rise, fall } = CURVE_PARAMS[shape];

  if (t <= peakT) {
    const x = t / peakT;                        // 0 → 1 up to peak
    return Math.sin((Math.PI / 2) * x) ** rise;
  } else {
    const x = (1 - t) / (1 - peakT);            // 1 → 0 from peak to retirement
    return Math.sin((Math.PI / 2) * x) ** fall;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Compute attack and defence for a player at a given age using their curve.
 * Pure — safe to call at any time, does not mutate.
 */
export function computeStatsAtAge(
  curve: PlayerCurve,
  position: Position,
  age: number,
): { attack: number; defence: number } {
  const { startAge, retirementAge, baseAttack, baseDefence, shape, peakHeight } = curve;
  const careerLength = retirementAge - startAge;

  if (careerLength <= 0) {
    return { attack: Math.max(8, baseAttack), defence: Math.max(8, baseDefence) };
  }

  const t = Math.max(0, Math.min(1, (age - startAge) / careerLength));
  const cv = curveValue(t, shape);
  const gain = PEAK_GAIN[peakHeight];
  const { attackWeight, defenceWeight } = positionWeights(position);

  return {
    attack:  Math.max(8, Math.round(baseAttack  + cv * gain * attackWeight)),
    defence: Math.max(8, Math.round(baseDefence + cv * gain * defenceWeight)),
  };
}

/**
 * Compute the career-arc position indicator (0–100):
 *   0  = career start
 *   ~50 = approaching or at peak (depending on curve shape)
 *   100 = retirement age
 *
 * Values below 50 typically indicate an ascending player;
 * values at/above 50 typically indicate plateau or decline.
 * Repurposed as truePotential on the Player — replaces the old "ceiling" meaning.
 */
export function computeTruePotential(curve: PlayerCurve, age: number): number {
  const careerLength = curve.retirementAge - curve.startAge;
  if (careerLength <= 0) return 100;
  const t = Math.max(0, Math.min(1, (age - curve.startAge) / careerLength));
  return Math.round(t * 100);
}

/**
 * Generate a PlayerCurve for a newly created player.
 *
 * Uses a back-calculation approach: the player's current stats are treated as
 * the correct value at their current age, and baseAttack/baseDefence are derived
 * to make the curve self-consistent at generation time.
 *
 * @param rng            Seeded RNG — deterministic given the same seed sequence
 * @param currentAge     Player's current age
 * @param currentAttack  Player's current attack stat
 * @param currentDefence Player's current defence stat
 * @param position       Used for 70:30 attribute weighting
 */
export function generatePlayerCurve(
  rng: Rng,
  currentAge: number,
  currentAttack: number,
  currentDefence: number,
  position: Position,
): PlayerCurve {
  const shapes: CurveShape[] = ['SHALLOW_BELL', 'STEEP_BELL', 'FRONT_WEIGHTED', 'BACK_WEIGHTED'];
  const shape = shapes[rng.nextInt(0, 3)] as CurveShape;
  const peakHeight = rng.nextInt(1, 5) as 1 | 2 | 3 | 4 | 5;

  // Career started some years before current age — gives meaningful truePotential
  // at generation. Young players: small offset (recently turned pro). Older: larger.
  const careerOffset = rng.nextInt(4, 12);
  const startAge = Math.max(16, currentAge - careerOffset);

  // Retirement age: sum-of-4-uniforms approximates Gaussian via CLT
  const u = (rng.next() + rng.next() + rng.next() + rng.next() - 2.0) * 3.5;
  const rawRetirement = Math.round(35 + u);
  // Always at least 1 season beyond current age; hard clamp 28–42
  const retirementAge = Math.max(currentAge + 1, Math.max(28, Math.min(42, rawRetirement)));

  // Back-calculate base stats so that computeStatsAtAge(curve, age) === currentStats
  const careerLength = retirementAge - startAge;
  const t = Math.max(0, Math.min(1, (currentAge - startAge) / careerLength));
  const cv = curveValue(t, shape);
  const gain = PEAK_GAIN[peakHeight];
  const { attackWeight, defenceWeight } = positionWeights(position);

  // base = current − (gain already accumulated at current age)
  // Floored at 8 — the hard floor for all stats
  const baseAttack  = Math.max(8, Math.round(currentAttack  - cv * gain * attackWeight));
  const baseDefence = Math.max(8, Math.round(currentDefence - cv * gain * defenceWeight));

  return { shape, peakHeight, startAge, retirementAge, baseAttack, baseDefence };
}

// ── Seasonal application ───────────────────────────────────────────────────────

/**
 * Returns true if this player will retire when their age increments by 1
 * (i.e. their new age would meet or exceed their retirementAge).
 */
export function shouldRetire(player: Player): boolean {
  return player.age + 1 >= player.curve.retirementAge;
}

/**
 * Apply one season of progression to a player.
 *
 * Increments age by 1, recomputes attack and defence from the curve,
 * and updates truePotential to reflect the new career-arc position.
 * teamwork and charisma are unchanged.
 *
 * Returns a new player object — does not mutate the input.
 */
export function applySeasonProgression(player: Player): Player {
  const newAge = player.age + 1;
  const { attack, defence } = computeStatsAtAge(player.curve, player.position, newAge);
  const newTruePotential = computeTruePotential(player.curve, newAge);

  return {
    ...player,
    age: newAge,
    truePotential: newTruePotential,
    attributes: {
      ...player.attributes,
      attack,
      defence,
    },
  };
}

// ── Retirement flavour ─────────────────────────────────────────────────────────

const ABSURD_RETIREMENT_REASONS: readonly string[] = [
  'cited irreconcilable differences with Mondays',
  'accepted a role as lead taster on the competitive pie-eating circuit',
  'was reportedly in hiding after accidentally winning an illegal snail-racing syndicate\'s jackpot',
  'cited a deep philosophical disagreement with the offside rule',
  'retired after mistakenly purchasing a lighthouse during a lads\' holiday in Portugal',
  'announced retirement via carrier pigeon to protest email\'s "corporate overreach"',
  'left the sport to manage his growing collection of novelty doorbells',
  'departed following an irresolvable dispute with the club physio over the correct pronunciation of "ligament"',
  'retired to train competitive ferrets for the agricultural show circuit',
  'stepped away to become a full-time spokesperson for a West Country artisan pasty concern',
  'went AWOL mid-pre-season after being shortlisted for a walk-on part in a local estate agent\'s Christmas advert',
  'left football to complete his distance-learning degree in Medieval Folklore Studies',
  'retired at the height of his powers to join a competitive gravy-boat racing syndicate in the Lake District',
  'called time following a lengthy philosophical inquiry into whether corner flags are truly necessary',
  'retired following an unexplained but apparently voluntary relocation to an uninhabited Scottish island',
];

const MUNDANE_RETIREMENT_REASONS: readonly string[] = [
  'retired due to a persistent knee injury that refused to fully recover',
  'hung up his boots after a recurring hamstring problem ended his season early',
  'called time on his career following medical advice after a difficult run of injuries',
  'stepped away from professional football to focus on coaching at youth level',
  'decided to retire after struggling to maintain fitness over the past two seasons',
];

/**
 * Returns a retirement flavour sentence for use in news items.
 * ~75% chance of an absurd reason; ~25% chance of a mundane one.
 */
export function getRetirementFlavour(rng: Rng): string {
  if (rng.next() < 0.75) {
    return ABSURD_RETIREMENT_REASONS[rng.nextInt(0, ABSURD_RETIREMENT_REASONS.length - 1)];
  }
  return MUNDANE_RETIREMENT_REASONS[rng.nextInt(0, MUNDANE_RETIREMENT_REASONS.length - 1)];
}
