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
import { anglesBank } from './angles';

/** Full question bank — all topics combined. */
export const QUESTION_BANK: QuestionBank = [
  ...percentagesBank,
  ...ratiosBank,
  ...algebraBank,
  ...dataInterpretationBank,
  ...decimalsBank,
  ...areaAndPerimeterBank,
  ...anglesBank,
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
    /** Filter to questions matching any of the listed topics. */
    topics?: MathTopic[];
    /** Exclude a specific question by id (avoid back-to-back repeats). */
    excludeId?: string;
    /**
     * Deterministic selection index. The filtered pool is indexed by
     * `selectionIndex % pool.length`, avoiding Math.random().
     * When omitted, falls back to Math.random().
     */
    selectionIndex?: number;
  }
): QuestionTemplate | null {
  const studentIdx = CURRICULUM_LEVEL_ORDER.indexOf(curriculumLevel);
  const maxDiff = MAX_DIFFICULTY_BY_LEVEL[curriculumLevel];

  let pool = QUESTION_BANK.filter(q => {
    const qIdx = CURRICULUM_LEVEL_ORDER.indexOf(q.minCurriculumLevel);
    return qIdx <= studentIdx && q.difficulty <= maxDiff;
  });

  if (options?.topics && options.topics.length > 0) {
    const filtered = pool.filter(q => options.topics!.includes(q.topic));
    if (filtered.length > 0) pool = filtered;
  }
  if (options?.excludeId) {
    const deduped = pool.filter(q => q.id !== options.excludeId);
    if (deduped.length > 0) pool = deduped;
  }

  if (pool.length === 0) return null;

  const idx = options?.selectionIndex !== undefined
    ? Math.abs(options.selectionIndex) % pool.length
    : Math.floor(Math.random() * pool.length);

  return pool[idx];
}
