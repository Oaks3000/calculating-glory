/**
 * Player Attribute Progression Tests
 *
 * Covers:
 * - curveValue shape behaviour (indirectly via computeStatsAtAge)
 * - computeStatsAtAge: floor, peak, decline, position weighting
 * - computeTruePotential: career-arc position indicator
 * - generatePlayerCurve: structural validity + self-consistency
 * - applySeasonProgression: age increment, stat update, truePotential update
 * - shouldRetire: boundary conditions
 * - getRetirementFlavour: returns a non-empty string
 */

import {
  computeStatsAtAge,
  computeTruePotential,
  generatePlayerCurve,
  applySeasonProgression,
  shouldRetire,
  getRetirementFlavour,
} from '../simulation/progression';
import { PlayerCurve, Player } from '../types/player';
import { createRng } from '../simulation/rng';

// ── Test helpers ───────────────────────────────────────────────────────────────

const DEFAULT_CURVE: PlayerCurve = {
  shape: 'SHALLOW_BELL',
  peakHeight: 3,
  startAge: 18,
  retirementAge: 36,
  baseAttack: 40,
  baseDefence: 40,
};

function makePlayerWithCurve(overrides: Partial<Player> = {}): Player {
  return {
    id: 'test-p1',
    name: 'Test Player',
    position: 'MID',
    wage: 100_000,
    transferValue: 1_000_000,
    age: 25,
    morale: 70,
    attributes: { attack: 50, defence: 50, teamwork: 55, charisma: 45, publicPotential: 60 },
    truePotential: 33,
    curve: DEFAULT_CURVE,
    contractExpiresWeek: 46,
    stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 55 },
    ...overrides,
  };
}

// ── computeStatsAtAge ──────────────────────────────────────────────────────────

describe('computeStatsAtAge', () => {
  it('returns base stats at career start (t = 0)', () => {
    const { attack, defence } = computeStatsAtAge(DEFAULT_CURVE, 'MID', 18);
    // At t=0, curveValue=0, so stats = base ± rounding
    expect(attack).toBe(40);
    expect(defence).toBe(40);
  });

  it('stats are higher at peak age than at career start', () => {
    // SHALLOW_BELL peaks at t=0.45 → peakAge = 18 + 0.45*18 ≈ 26
    const atStart = computeStatsAtAge(DEFAULT_CURVE, 'MID', 18);
    const atPeak  = computeStatsAtAge(DEFAULT_CURVE, 'MID', 26);
    expect(atPeak.attack).toBeGreaterThan(atStart.attack);
    expect(atPeak.defence).toBeGreaterThan(atStart.defence);
  });

  it('stats decline after peak', () => {
    const atPeak    = computeStatsAtAge(DEFAULT_CURVE, 'MID', 26);
    const atDecline = computeStatsAtAge(DEFAULT_CURVE, 'MID', 32);
    expect(atDecline.attack).toBeLessThan(atPeak.attack);
    expect(atDecline.defence).toBeLessThan(atPeak.defence);
  });

  it('stats never fall below floor of 8', () => {
    const veryLowCurve: PlayerCurve = {
      shape: 'STEEP_BELL',
      peakHeight: 5,
      startAge: 18,
      retirementAge: 36,
      baseAttack: 8,   // at floor
      baseDefence: 8,
    };
    // At retirement (t=1), curveValue=0, so attack = base = 8
    const { attack, defence } = computeStatsAtAge(veryLowCurve, 'MID', 36);
    expect(attack).toBeGreaterThanOrEqual(8);
    expect(defence).toBeGreaterThanOrEqual(8);
  });

  it('applies 70:30 FWD weighting — attack gains more than defence', () => {
    const fwdAtPeak = computeStatsAtAge(DEFAULT_CURVE, 'FWD', 26);
    const fwdAtStart = computeStatsAtAge(DEFAULT_CURVE, 'FWD', 18);
    const attackGain  = fwdAtPeak.attack  - fwdAtStart.attack;
    const defenceGain = fwdAtPeak.defence - fwdAtStart.defence;
    // FWD: 70% goes to attack, 30% to defence
    expect(attackGain).toBeGreaterThan(defenceGain);
  });

  it('applies 70:30 GK/DEF weighting — defence gains more than attack', () => {
    const defAtPeak  = computeStatsAtAge(DEFAULT_CURVE, 'GK', 26);
    const defAtStart = computeStatsAtAge(DEFAULT_CURVE, 'GK', 18);
    const attackGain  = defAtPeak.attack  - defAtStart.attack;
    const defenceGain = defAtPeak.defence - defAtStart.defence;
    // GK: 70% goes to defence, 30% to attack
    expect(defenceGain).toBeGreaterThan(attackGain);
  });

  it('MID weighting is symmetric — equal attack and defence gains', () => {
    const midAtPeak  = computeStatsAtAge(DEFAULT_CURVE, 'MID', 26);
    const midAtStart = computeStatsAtAge(DEFAULT_CURVE, 'MID', 18);
    const attackGain  = midAtPeak.attack  - midAtStart.attack;
    const defenceGain = midAtPeak.defence - midAtStart.defence;
    // MID: 50/50 split — gains should be equal
    expect(attackGain).toBe(defenceGain);
  });

  it('peakHeight=5 produces greater gains than peakHeight=1', () => {
    const highCurve: PlayerCurve = { ...DEFAULT_CURVE, peakHeight: 5 };
    const lowCurve:  PlayerCurve = { ...DEFAULT_CURVE, peakHeight: 1 };
    const highPeak = computeStatsAtAge(highCurve, 'MID', 26);
    const lowPeak  = computeStatsAtAge(lowCurve,  'MID', 26);
    expect(highPeak.attack).toBeGreaterThan(lowPeak.attack);
  });

  it('FRONT_WEIGHTED curve peaks earlier than BACK_WEIGHTED', () => {
    // At the midpoint of the career (age 27), FRONT_WEIGHTED should be declining
    // while BACK_WEIGHTED is still ascending.
    const frontCurve: PlayerCurve = { ...DEFAULT_CURVE, shape: 'FRONT_WEIGHTED', peakHeight: 3 };
    const backCurve:  PlayerCurve = { ...DEFAULT_CURVE, shape: 'BACK_WEIGHTED',  peakHeight: 3 };
    // Compare value at career midpoint (age = startAge + 0.5*careerLength = 27)
    const frontAtMid = computeStatsAtAge(frontCurve, 'MID', 27);
    const backAtMid  = computeStatsAtAge(backCurve,  'MID', 27);
    // FRONT_WEIGHTED peaked at ~22, so at 27 it has declined back toward base
    // BACK_WEIGHTED peaks at ~29, so at 27 it is still ascending — should be higher than FRONT
    expect(backAtMid.attack).toBeGreaterThan(frontAtMid.attack);
  });

  it('handles degenerate career (retirementAge <= startAge) without throwing', () => {
    const badCurve: PlayerCurve = { ...DEFAULT_CURVE, startAge: 30, retirementAge: 30 };
    expect(() => computeStatsAtAge(badCurve, 'MID', 30)).not.toThrow();
    const { attack, defence } = computeStatsAtAge(badCurve, 'MID', 30);
    expect(attack).toBeGreaterThanOrEqual(8);
    expect(defence).toBeGreaterThanOrEqual(8);
  });
});

// ── computeTruePotential ───────────────────────────────────────────────────────

describe('computeTruePotential', () => {
  it('returns 0 at career start', () => {
    expect(computeTruePotential(DEFAULT_CURVE, 18)).toBe(0);
  });

  it('returns 100 at retirement age', () => {
    expect(computeTruePotential(DEFAULT_CURVE, 36)).toBe(100);
  });

  it('increases with age through the career', () => {
    const at20 = computeTruePotential(DEFAULT_CURVE, 20);
    const at25 = computeTruePotential(DEFAULT_CURVE, 25);
    const at30 = computeTruePotential(DEFAULT_CURVE, 30);
    expect(at20).toBeLessThan(at25);
    expect(at25).toBeLessThan(at30);
  });

  it('values below 50 indicate ascending player (pre-peak for SHALLOW_BELL)', () => {
    // SHALLOW_BELL peaks at t=0.45 → career midpoint is around 45% through
    // At age 24 (t = 6/18 = 0.33), truePotential = 33
    expect(computeTruePotential(DEFAULT_CURVE, 24)).toBe(33);
  });

  it('is clamped to [0, 100]', () => {
    expect(computeTruePotential(DEFAULT_CURVE, 5)).toBe(0);    // before career start
    expect(computeTruePotential(DEFAULT_CURVE, 99)).toBe(100); // way past retirement
  });
});

// ── generatePlayerCurve ───────────────────────────────────────────────────────

describe('generatePlayerCurve', () => {
  const rng = createRng('test-generate-curve');

  it('returns a valid PlayerCurve structure', () => {
    const curve = generatePlayerCurve(rng, 22, 55, 40, 'FWD');
    expect(['SHALLOW_BELL', 'STEEP_BELL', 'FRONT_WEIGHTED', 'BACK_WEIGHTED']).toContain(curve.shape);
    expect([1, 2, 3, 4, 5]).toContain(curve.peakHeight);
    expect(curve.startAge).toBeLessThanOrEqual(22);
    expect(curve.retirementAge).toBeGreaterThan(22);
    expect(curve.retirementAge).toBeGreaterThanOrEqual(28);
    expect(curve.retirementAge).toBeLessThanOrEqual(42);
  });

  it('self-consistency: computeStatsAtAge at currentAge returns currentStats', () => {
    // With a fresh RNG, generate a curve for a 26-year-old FWD with attack=65, defence=30
    const freshRng = createRng('self-consistency-test');
    const curve = generatePlayerCurve(freshRng, 26, 65, 30, 'FWD');
    const { attack, defence } = computeStatsAtAge(curve, 'FWD', 26);
    // Should round-trip cleanly
    expect(attack).toBe(65);
    expect(defence).toBe(30);
  });

  it('retirementAge is always at least currentAge + 1', () => {
    // Test with an old player
    const rng2 = createRng('old-player');
    const curve = generatePlayerCurve(rng2, 34, 50, 55, 'GK');
    expect(curve.retirementAge).toBeGreaterThan(34);
  });

  it('is deterministic — same seed produces same curve', () => {
    const curveA = generatePlayerCurve(createRng('determinism-test'), 24, 60, 45, 'MID');
    const curveB = generatePlayerCurve(createRng('determinism-test'), 24, 60, 45, 'MID');
    expect(curveA).toEqual(curveB);
  });

  it('baseAttack and baseDefence are >= 8 (floor enforced)', () => {
    // A player at their peak with very high peakHeight might back-calculate a very low base
    // The floor of 8 must hold
    const rng3 = createRng('floor-test');
    const curve = generatePlayerCurve(rng3, 28, 20, 20, 'FWD');
    expect(curve.baseAttack).toBeGreaterThanOrEqual(8);
    expect(curve.baseDefence).toBeGreaterThanOrEqual(8);
  });
});

// ── applySeasonProgression ────────────────────────────────────────────────────

describe('applySeasonProgression', () => {
  it('increments player age by 1', () => {
    const player = makePlayerWithCurve({ age: 25 });
    const updated = applySeasonProgression(player);
    expect(updated.age).toBe(26);
  });

  it('does not mutate the original player', () => {
    const player = makePlayerWithCurve({ age: 25 });
    const originalAge = player.age;
    applySeasonProgression(player);
    expect(player.age).toBe(originalAge);
  });

  it('updates attack and defence based on the curve', () => {
    // Use a curve where the player is ascending at age 25 → 26
    const ascendingCurve: PlayerCurve = {
      shape: 'SHALLOW_BELL',
      peakHeight: 3,
      startAge: 22,   // started career at 22
      retirementAge: 36,
      baseAttack: 50,
      baseDefence: 50,
    };
    const player = makePlayerWithCurve({
      age: 24,
      curve: ascendingCurve,
      attributes: {
        attack: computeStatsAtAge(ascendingCurve, 'MID', 24).attack,
        defence: computeStatsAtAge(ascendingCurve, 'MID', 24).defence,
        teamwork: 55,
        charisma: 45,
        publicPotential: 60,
      },
    });
    const updated = applySeasonProgression(player);
    const expected = computeStatsAtAge(ascendingCurve, 'MID', 25);
    expect(updated.attributes.attack).toBe(expected.attack);
    expect(updated.attributes.defence).toBe(expected.defence);
  });

  it('does NOT change teamwork', () => {
    const player = makePlayerWithCurve({ attributes: { attack: 50, defence: 50, teamwork: 62, charisma: 45, publicPotential: 60 } });
    const updated = applySeasonProgression(player);
    expect(updated.attributes.teamwork).toBe(62);
  });

  it('does NOT change charisma', () => {
    const player = makePlayerWithCurve({ attributes: { attack: 50, defence: 50, teamwork: 55, charisma: 72, publicPotential: 60 } });
    const updated = applySeasonProgression(player);
    expect(updated.attributes.charisma).toBe(72);
  });

  it('updates truePotential to reflect new career-arc position', () => {
    const player = makePlayerWithCurve({ age: 25, curve: DEFAULT_CURVE });
    const updated = applySeasonProgression(player);
    const expectedTP = computeTruePotential(DEFAULT_CURVE, 26);
    expect(updated.truePotential).toBe(expectedTP);
  });
});

// ── shouldRetire ──────────────────────────────────────────────────────────────

describe('shouldRetire', () => {
  it('returns true when age + 1 >= retirementAge', () => {
    const player = makePlayerWithCurve({ age: 35, curve: { ...DEFAULT_CURVE, retirementAge: 36 } });
    expect(shouldRetire(player)).toBe(true);
  });

  it('returns true when exactly at retirement (age + 1 === retirementAge)', () => {
    const player = makePlayerWithCurve({ age: 35, curve: { ...DEFAULT_CURVE, retirementAge: 36 } });
    expect(shouldRetire(player)).toBe(true);
  });

  it('returns false when player has seasons remaining', () => {
    const player = makePlayerWithCurve({ age: 28, curve: { ...DEFAULT_CURVE, retirementAge: 36 } });
    expect(shouldRetire(player)).toBe(false);
  });

  it('returns false when player is one season away from retirement', () => {
    const player = makePlayerWithCurve({ age: 34, curve: { ...DEFAULT_CURVE, retirementAge: 36 } });
    expect(shouldRetire(player)).toBe(false);
  });
});

// ── getRetirementFlavour ───────────────────────────────────────────────────────

describe('getRetirementFlavour', () => {
  it('returns a non-empty string', () => {
    const rng = createRng('flavour-test');
    const flavour = getRetirementFlavour(rng);
    expect(typeof flavour).toBe('string');
    expect(flavour.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same seed', () => {
    const flavourA = getRetirementFlavour(createRng('det-test'));
    const flavourB = getRetirementFlavour(createRng('det-test'));
    expect(flavourA).toBe(flavourB);
  });

  it('produces different flavours for different seeds', () => {
    const results = new Set(
      Array.from({ length: 20 }, (_, i) => getRetirementFlavour(createRng(`seed-${i}`)))
    );
    // 20 different seeds should produce at least 3 distinct flavours
    expect(results.size).toBeGreaterThanOrEqual(3);
  });
});
