/**
 * Seeded Random Number Generator
 *
 * Deterministic PRNG using mulberry32 algorithm with FNV-1a string hashing.
 * No external dependencies. Same seed always produces same sequence.
 */

/**
 * FNV-1a hash: string → 32-bit unsigned integer
 */
export function fnv1a(str: string): number {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  return hash >>> 0; // Ensure unsigned
}

/**
 * Mulberry32 PRNG: deterministic float sequence from a 32-bit seed
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return (): number => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * RNG interface
 */
export interface Rng {
  /** Next random float in [0, 1) */
  next(): number;
  /** Random integer in [min, max] inclusive */
  nextInt(min: number, max: number): number;
}

/**
 * Create a seeded RNG from a string seed.
 * Same seed always produces the same sequence.
 */
export function createRng(seed: string): Rng {
  const numericSeed = fnv1a(seed);
  const nextFloat = mulberry32(numericSeed);

  return {
    next: nextFloat,
    nextInt(min: number, max: number): number {
      return Math.floor(nextFloat() * (max - min + 1)) + min;
    }
  };
}

/**
 * Deterministic integer noise in the range [−range, +range].
 *
 * Uses a fast inline hash so it's cheap to call per-player per-week.
 * If range === 0 (e.g. a perfect manager) always returns 0.
 *
 * Used by selectManagerXI to add per-player, per-week variation to
 * apparent OVR, simulating a manager's imperfect player assessment.
 */
export function seededIntNoise(seed: string, range: number): number {
  if (range === 0) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  const span = range * 2 + 1;
  return (Math.abs(h) % span) - range;
}

/**
 * Fisher-Yates shuffle with seeded RNG. Returns a new array.
 */
export function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  const result = [...arr];
  const rng = createRng(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
