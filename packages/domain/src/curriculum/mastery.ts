/**
 * Mastery detection for curriculum advancement.
 *
 * Checks whether a student has demonstrated sufficient mastery at their
 * current curriculum level to be nudged toward stepping up.
 *
 * Criteria (last 20 MATH_ATTEMPT_RECORDED events):
 *   - At least 20 attempts recorded
 *   - ≥ 85% correct
 *   - Not already at GCSE_HIGHER (no further level to advance to)
 */

import { GameEvent, MathAttemptRecordedEvent } from '../events/types';
import { CurriculumLevel, CURRICULUM_LEVEL_ORDER, CURRICULUM_LEVELS } from './curriculum-config';

const MASTERY_MIN_ATTEMPTS = 20;
const MASTERY_ACCURACY_THRESHOLD = 0.85;

/**
 * Returns the next curriculum level if the student has demonstrated mastery,
 * or null if they haven't hit the threshold or are already at the top level.
 */
export function checkMastery(
  events: GameEvent[],
  currentLevel: CurriculumLevel,
): CurriculumLevel | null {
  // No level above GCSE_HIGHER
  const currentIdx = CURRICULUM_LEVEL_ORDER.indexOf(currentLevel);
  if (currentIdx === -1 || currentIdx === CURRICULUM_LEVEL_ORDER.length - 1) {
    return null;
  }

  // Collect last N math attempts
  const mathAttempts = events
    .filter((e): e is MathAttemptRecordedEvent => e.type === 'MATH_ATTEMPT_RECORDED')
    .slice(-MASTERY_MIN_ATTEMPTS);

  if (mathAttempts.length < MASTERY_MIN_ATTEMPTS) return null;

  const correct = mathAttempts.filter(e => e.correct).length;
  if (correct / mathAttempts.length < MASTERY_ACCURACY_THRESHOLD) return null;

  return CURRICULUM_LEVEL_ORDER[currentIdx + 1];
}

/**
 * Human-readable display name for a curriculum level.
 */
export function curriculumDisplayName(level: CurriculumLevel): string {
  return CURRICULUM_LEVELS[level].displayName;
}
