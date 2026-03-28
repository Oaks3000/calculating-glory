/**
 * Full question bank — aggregates all topic banks and exposes a selector.
 */
import { QuestionBank, QuestionTemplate } from './types';
import { CurriculumLevel, MathTopic, CURRICULUM_LEVEL_ORDER, MAX_DIFFICULTY_BY_LEVEL } from '../../curriculum/curriculum-config';
import { percentagesBank } from './percentages';
import { ratiosBank } from './ratios';
import { algebraBank } from './algebra';
import { dataInterpretationBank } from './data-interpretation';
import { decimalsBank } from './decimals';
import { areaAndPerimeterBank } from './area-and-perimeter';

/** Full question bank — all topics combined. */
export const QUESTION_BANK: QuestionBank = [
  ...percentagesBank,
  ...ratiosBank,
  ...algebraBank,
  ...dataInterpretationBank,
  ...decimalsBank,
  ...areaAndPerimeterBank,
];

/**
 * Pick a question from the bank appropriate for the student's curriculum level.
 *
 * Filters by:
 *   - minCurriculumLevel ≤ student's curriculumLevel (using CURRICULUM_LEVEL_ORDER)
 *   - difficulty ≤ MAX_DIFFICULTY_BY_LEVEL[curriculumLevel]
 *   - topic (if specified)
 *
 * Returns null if no suitable question found.
 */
export function pickQuestion(
  curriculumLevel: CurriculumLevel,
  options?: {
    topic?: MathTopic;
    excludeId?: string;
    preferDifficulty?: 1 | 2 | 3;
  }
): QuestionTemplate | null {
  const studentIdx = CURRICULUM_LEVEL_ORDER.indexOf(curriculumLevel);
  const maxDiff = MAX_DIFFICULTY_BY_LEVEL[curriculumLevel];

  let pool = QUESTION_BANK.filter(q => {
    const qIdx = CURRICULUM_LEVEL_ORDER.indexOf(q.minCurriculumLevel);
    return qIdx <= studentIdx && q.difficulty <= maxDiff;
  });

  if (options?.topic) {
    pool = pool.filter(q => q.topic === options.topic);
  }
  if (options?.excludeId) {
    pool = pool.filter(q => q.id !== options.excludeId);
  }

  if (pool.length === 0) return null;

  // Prefer the requested difficulty, but fall back to any available
  if (options?.preferDifficulty) {
    const preferred = pool.filter(q => q.difficulty === options.preferDifficulty);
    if (preferred.length > 0) pool = preferred;
  }

  // Random pick (in production this should use seeded RNG)
  return pool[Math.floor(Math.random() * pool.length)];
}
