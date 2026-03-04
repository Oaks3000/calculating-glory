/**
 * Money Utilities
 *
 * All money calculations use pence (integers) to avoid floating point errors.
 */

/**
 * Convert pounds to pence
 */
export function toPence(pounds: number): number {
  return Math.round(pounds * 100);
}

/**
 * Convert pence to pounds
 */
export function fromPence(pence: number): number {
  return pence / 100;
}

/**
 * Format money for display
 * @param pence Amount in pence
 * @returns Formatted string like "£1,234.56"
 */
export function formatMoney(pence: number): string {
  const pounds = fromPence(pence);
  return `£${pounds.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Add money amounts safely
 */
export function addMoney(a: number, b: number): number {
  return a + b;
}

/**
 * Subtract money amounts safely
 */
export function subtractMoney(a: number, b: number): number {
  return a - b;
}

/**
 * Multiply money by a factor
 */
export function multiplyMoney(amount: number, factor: number): number {
  return Math.round(amount * factor);
}

/**
 * Calculate percentage of money amount
 */
export function percentageOf(amount: number, percentage: number): number {
  return Math.round(amount * (percentage / 100));
}
