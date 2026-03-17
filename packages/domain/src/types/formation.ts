/**
 * Formation types and configuration
 *
 * The player (as owner/CEO) picks a preferred formation which sets the
 * club's recruitment strategy — how many of each position to target.
 * The manager then picks the actual XI within that shape.
 */

import { Position } from './player';

/**
 * Supported formations
 */
export type Formation =
  | '4-4-2'
  | '4-3-3'
  | '4-2-3-1'
  | '3-5-2'
  | '5-3-2'
  | '4-5-1';

/**
 * How many players of each position a formation ideally fields
 */
export interface FormationSlots {
  GK: number;
  DEF: number;
  MID: number;
  FWD: number;
}

/**
 * Full config for a formation
 */
export interface FormationConfig {
  id: Formation;
  label: string;
  description: string;
  style: string;
  /** Ideal XI composition */
  slots: FormationSlots;
  /** Positions to prioritise when recruiting */
  recruitmentPriority: Position[];
}

export const FORMATION_CONFIG: Record<Formation, FormationConfig> = {
  '4-4-2': {
    id: '4-4-2',
    label: '4-4-2',
    description: 'Two banks of four with a strike partnership. Solid, predictable, hard to break down.',
    style: 'Balanced',
    slots: { GK: 1, DEF: 4, MID: 4, FWD: 2 },
    recruitmentPriority: ['MID', 'DEF', 'FWD', 'GK'],
  },
  '4-3-3': {
    id: '4-3-3',
    label: '4-3-3',
    description: 'Three forwards pressing high with a midfield triangle. Attacking and energetic.',
    style: 'Attacking',
    slots: { GK: 1, DEF: 4, MID: 3, FWD: 3 },
    recruitmentPriority: ['FWD', 'MID', 'DEF', 'GK'],
  },
  '4-2-3-1': {
    id: '4-2-3-1',
    label: '4-2-3-1',
    description: 'Double pivot protects the back four, ten behind the striker. Controlled and possession-based.',
    style: 'Controlled',
    slots: { GK: 1, DEF: 4, MID: 5, FWD: 1 },
    recruitmentPriority: ['MID', 'DEF', 'FWD', 'GK'],
  },
  '3-5-2': {
    id: '3-5-2',
    label: '3-5-2',
    description: 'Three centre-backs, wing-backs bombing on. Aggressive out wide, direct.',
    style: 'Wing Play',
    slots: { GK: 1, DEF: 3, MID: 5, FWD: 2 },
    recruitmentPriority: ['DEF', 'MID', 'FWD', 'GK'],
  },
  '5-3-2': {
    id: '5-3-2',
    label: '5-3-2',
    description: 'Solid defensive block, hit on the counter. Hard to score against.',
    style: 'Defensive',
    slots: { GK: 1, DEF: 5, MID: 3, FWD: 2 },
    recruitmentPriority: ['DEF', 'FWD', 'MID', 'GK'],
  },
  '4-5-1': {
    id: '4-5-1',
    label: '4-5-1',
    description: 'Deep midfield bank, lone striker to hold up. Grind results, absorb pressure.',
    style: 'Counter',
    slots: { GK: 1, DEF: 4, MID: 5, FWD: 1 },
    recruitmentPriority: ['MID', 'FWD', 'DEF', 'GK'],
  },
};

/**
 * How well does the current squad cover this formation's ideal slots?
 * Returns a 0-100 coverage score.
 */
export function formationCoverage(
  squadByPosition: Record<Position, number>,
  formation: Formation
): number {
  const slots = FORMATION_CONFIG[formation].slots;
  const needed = slots.GK + slots.DEF + slots.MID + slots.FWD;
  let filled = 0;

  const positions: Position[] = ['GK', 'DEF', 'MID', 'FWD'];
  for (const pos of positions) {
    const want = slots[pos];
    const have = squadByPosition[pos] ?? 0;
    filled += Math.min(have, want);
  }

  return Math.round((filled / needed) * 100);
}
