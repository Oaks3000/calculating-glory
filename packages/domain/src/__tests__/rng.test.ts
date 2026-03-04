import { createRng, fnv1a, seededShuffle } from '../simulation/rng';

describe('fnv1a', () => {
  it('produces consistent hashes for the same input', () => {
    expect(fnv1a('hello')).toBe(fnv1a('hello'));
    expect(fnv1a('world')).toBe(fnv1a('world'));
  });

  it('produces different hashes for different inputs', () => {
    expect(fnv1a('hello')).not.toBe(fnv1a('world'));
    expect(fnv1a('seed-1')).not.toBe(fnv1a('seed-2'));
  });

  it('returns unsigned 32-bit integers', () => {
    const hash = fnv1a('test');
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThanOrEqual(0xFFFFFFFF);
  });
});

describe('createRng', () => {
  it('is deterministic: same seed produces same sequence', () => {
    const rng1 = createRng('test-seed');
    const rng2 = createRng('test-seed');

    for (let i = 0; i < 100; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('different seeds produce different sequences', () => {
    const rng1 = createRng('seed-A');
    const rng2 = createRng('seed-B');

    // Extremely unlikely to match even one value
    const values1 = Array.from({ length: 10 }, () => rng1.next());
    const values2 = Array.from({ length: 10 }, () => rng2.next());

    expect(values1).not.toEqual(values2);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = createRng('range-test');

    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('nextInt() returns values in [min, max] inclusive', () => {
    const rng = createRng('int-test');

    for (let i = 0; i < 1000; i++) {
      const val = rng.nextInt(1, 6);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(6);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('nextInt() covers the full range', () => {
    const rng = createRng('coverage-test');
    const seen = new Set<number>();

    for (let i = 0; i < 1000; i++) {
      seen.add(rng.nextInt(1, 6));
    }

    // Should hit all values 1-6 in 1000 tries
    expect(seen.size).toBe(6);
  });

  it('produces roughly uniform distribution', () => {
    const rng = createRng('distribution-test');
    const buckets = [0, 0, 0, 0, 0]; // 5 buckets for [0, 0.2), [0.2, 0.4), etc.
    const n = 10000;

    for (let i = 0; i < n; i++) {
      const val = rng.next();
      const bucket = Math.min(Math.floor(val * 5), 4);
      buckets[bucket]++;
    }

    // Each bucket should have roughly n/5 = 2000 values
    // Allow 15% deviation
    const expected = n / 5;
    for (const count of buckets) {
      expect(count).toBeGreaterThan(expected * 0.85);
      expect(count).toBeLessThan(expected * 1.15);
    }
  });
});

describe('seededShuffle', () => {
  it('is deterministic: same seed produces same order', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = seededShuffle(arr, 'shuffle-seed');
    const b = seededShuffle(arr, 'shuffle-seed');
    expect(a).toEqual(b);
  });

  it('different seeds produce different orders', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = seededShuffle(arr, 'seed-X');
    const b = seededShuffle(arr, 'seed-Y');
    expect(a).not.toEqual(b);
  });

  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = seededShuffle(arr, 'preserve-test');
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    seededShuffle(arr, 'mutate-test');
    expect(arr).toEqual(copy);
  });
});
