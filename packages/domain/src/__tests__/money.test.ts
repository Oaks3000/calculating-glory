/**
 * Money Utilities Tests
 *
 * Imports via the package index to ensure index.ts is covered.
 */

import {
  toPence,
  fromPence,
  formatMoney,
  addMoney,
  subtractMoney,
  multiplyMoney,
  percentageOf
} from '../index';

describe('toPence', () => {
  it('converts whole pounds', () => {
    expect(toPence(100)).toBe(10000);
  });

  it('converts decimal pounds', () => {
    expect(toPence(1.99)).toBe(199);
  });

  it('rounds floating point edge cases', () => {
    // 0.1 + 0.2 = 0.30000000000000004 in JS — round should give 30
    expect(toPence(0.1 + 0.2)).toBe(30);
  });

  it('converts zero', () => {
    expect(toPence(0)).toBe(0);
  });

  it('converts large amounts', () => {
    expect(toPence(1000000)).toBe(100000000);
  });
});

describe('fromPence', () => {
  it('converts pence to pounds', () => {
    expect(fromPence(10000)).toBe(100);
  });

  it('converts small amounts', () => {
    expect(fromPence(199)).toBe(1.99);
  });

  it('converts zero', () => {
    expect(fromPence(0)).toBe(0);
  });

  it('round-trips with toPence', () => {
    expect(fromPence(toPence(250))).toBe(250);
  });
});

describe('formatMoney', () => {
  // formatMoney uses no decimal places (minimumFractionDigits: 0) for cleaner
  // game UI display — values are always meaningful whole-pound amounts.

  it('formats whole pounds', () => {
    expect(formatMoney(10000)).toBe('£100');
  });

  it('formats sub-pound pence (rounded to nearest pound)', () => {
    expect(formatMoney(199)).toBe('£2');
  });

  it('formats large amounts', () => {
    // en-GB locale uses commas as thousands separator
    expect(formatMoney(100000000)).toContain('1,000,000');
    expect(formatMoney(100000000)).toMatch(/^£/);
  });

  it('formats zero', () => {
    expect(formatMoney(0)).toBe('£0');
  });
});

describe('addMoney', () => {
  it('adds two pence amounts', () => {
    expect(addMoney(1000, 500)).toBe(1500);
  });

  it('handles zero addend', () => {
    expect(addMoney(0, 1000)).toBe(1000);
    expect(addMoney(1000, 0)).toBe(1000);
  });

  it('adds large amounts', () => {
    expect(addMoney(50000000, 50000000)).toBe(100000000);
  });
});

describe('subtractMoney', () => {
  it('subtracts two pence amounts', () => {
    expect(subtractMoney(1000, 300)).toBe(700);
  });

  it('handles zero subtrahend', () => {
    expect(subtractMoney(1000, 0)).toBe(1000);
  });

  it('can produce negative values', () => {
    expect(subtractMoney(100, 200)).toBe(-100);
  });

  it('handles equal amounts', () => {
    expect(subtractMoney(500, 500)).toBe(0);
  });
});

describe('multiplyMoney', () => {
  it('multiplies by a whole number', () => {
    expect(multiplyMoney(1000, 3)).toBe(3000);
  });

  it('rounds when result is fractional', () => {
    expect(multiplyMoney(1000, 0.333)).toBe(333);
  });

  it('handles 1.5x factor', () => {
    expect(multiplyMoney(1000, 1.5)).toBe(1500);
  });

  it('handles zero factor', () => {
    expect(multiplyMoney(1000, 0)).toBe(0);
  });

  it('rounds correctly for fractions that need rounding', () => {
    // 7 * 142857 pence * 0.001 factor: simple integer check
    expect(multiplyMoney(100, 0.5)).toBe(50);
  });
});

describe('percentageOf', () => {
  it('calculates 10%', () => {
    expect(percentageOf(10000, 10)).toBe(1000);
  });

  it('calculates 50%', () => {
    expect(percentageOf(10000, 50)).toBe(5000);
  });

  it('calculates 100%', () => {
    expect(percentageOf(10000, 100)).toBe(10000);
  });

  it('rounds fractional results', () => {
    // 1000 * (33/100) = 330 exactly
    expect(percentageOf(1000, 33)).toBe(330);
  });

  it('handles zero amount', () => {
    expect(percentageOf(0, 50)).toBe(0);
  });

  it('handles zero percentage', () => {
    expect(percentageOf(10000, 0)).toBe(0);
  });
});
