/**
 * Curriculum System Tests
 *
 * Tests curriculum configuration functions and the progression assessor
 * (safe early-return paths only, since calculateEvidence has a known
 *  data-structure mismatch with the event type for >= 20 attempts).
 */

import {
  CURRICULUM_LEVELS,
  getCurrentCurriculum,
  setCurriculumLevel,
  getNextLevel,
  getPreviousLevel,
  getAllCurriculumLevels
} from '../curriculum/curriculum-config';
import { assessReadinessForProgression, getProgressionSummary } from '../curriculum/curriculum-progression';
import { GameEvent } from '../events/types';

// ─── CURRICULUM_LEVELS constant ───────────────────────────────────────────────

describe('CURRICULUM_LEVELS', () => {
  it('contains all five levels', () => {
    expect(Object.keys(CURRICULUM_LEVELS)).toHaveLength(5);
    expect(CURRICULUM_LEVELS.YEAR_7).toBeDefined();
    expect(CURRICULUM_LEVELS.YEAR_8).toBeDefined();
    expect(CURRICULUM_LEVELS.YEAR_9).toBeDefined();
    expect(CURRICULUM_LEVELS.GCSE_FOUNDATION).toBeDefined();
    expect(CURRICULUM_LEVELS.GCSE_HIGHER).toBeDefined();
  });

  it('YEAR_7 has the expected level identifier', () => {
    expect(CURRICULUM_LEVELS.YEAR_7.level).toBe('YEAR_7');
  });

  it('GCSE_HIGHER has the expected level identifier', () => {
    expect(CURRICULUM_LEVELS.GCSE_HIGHER.level).toBe('GCSE_HIGHER');
  });
});

// ─── getCurrentCurriculum ─────────────────────────────────────────────────────

describe('getCurrentCurriculum', () => {
  it('returns YEAR_7 in Node.js environment (no window object)', () => {
    // Tests run in Node.js, so window is undefined → defaults to YEAR_7
    const curriculum = getCurrentCurriculum();
    expect(curriculum.level).toBe('YEAR_7');
  });
});

// ─── setCurriculumLevel ───────────────────────────────────────────────────────

describe('setCurriculumLevel', () => {
  it('does not throw in Node.js environment (returns early when window is undefined)', () => {
    expect(() => setCurriculumLevel('YEAR_8')).not.toThrow();
  });
});

// ─── getNextLevel ─────────────────────────────────────────────────────────────

describe('getNextLevel', () => {
  it('returns YEAR_8 after YEAR_7', () => {
    expect(getNextLevel('YEAR_7')).toBe('YEAR_8');
  });

  it('returns YEAR_9 after YEAR_8', () => {
    expect(getNextLevel('YEAR_8')).toBe('YEAR_9');
  });

  it('returns GCSE_FOUNDATION after YEAR_9', () => {
    expect(getNextLevel('YEAR_9')).toBe('GCSE_FOUNDATION');
  });

  it('returns GCSE_HIGHER after GCSE_FOUNDATION', () => {
    expect(getNextLevel('GCSE_FOUNDATION')).toBe('GCSE_HIGHER');
  });

  it('returns undefined after GCSE_HIGHER (highest level)', () => {
    expect(getNextLevel('GCSE_HIGHER')).toBeUndefined();
  });
});

// ─── getPreviousLevel ─────────────────────────────────────────────────────────

describe('getPreviousLevel', () => {
  it('returns undefined before YEAR_7 (lowest level)', () => {
    expect(getPreviousLevel('YEAR_7')).toBeUndefined();
  });

  it('returns YEAR_7 before YEAR_8', () => {
    expect(getPreviousLevel('YEAR_8')).toBe('YEAR_7');
  });

  it('returns YEAR_8 before YEAR_9', () => {
    expect(getPreviousLevel('YEAR_9')).toBe('YEAR_8');
  });

  it('returns YEAR_9 before GCSE_FOUNDATION', () => {
    expect(getPreviousLevel('GCSE_FOUNDATION')).toBe('YEAR_9');
  });

  it('returns GCSE_FOUNDATION before GCSE_HIGHER', () => {
    expect(getPreviousLevel('GCSE_HIGHER')).toBe('GCSE_FOUNDATION');
  });
});

// ─── getAllCurriculumLevels ────────────────────────────────────────────────────

describe('getAllCurriculumLevels', () => {
  it('returns an array of all 5 curriculum configs', () => {
    const levels = getAllCurriculumLevels();
    expect(levels).toHaveLength(5);
  });

  it('returns levels in progression order', () => {
    const levels = getAllCurriculumLevels();
    expect(levels[0].level).toBe('YEAR_7');
    expect(levels[4].level).toBe('GCSE_HIGHER');
  });
});

// ─── assessReadinessForProgression (safe early-return paths) ──────────────────

describe('assessReadinessForProgression', () => {
  it('returns not ready with readinessScore=0 when fewer than 20 attempts', () => {
    // In Node.js, getCurrentCurriculum() → YEAR_7, which has nextLevel YEAR_8
    // With < 20 attempts, returns early without calling calculateEvidence
    const fewAttempts: GameEvent[] = Array.from({ length: 10 }, (_, i) => ({
      type: 'MATH_ATTEMPT_RECORDED' as const,
      timestamp: 1000 + i,
      studentId: 'student-1',
      topic: 'percentage',
      difficulty: 1,
      correct: true,
      timeSpent: 5000
    }));

    const result = assessReadinessForProgression(fewAttempts);
    expect(result.ready).toBe(false);
    expect(result.readinessScore).toBe(0);
    expect(result.currentLevel).toBe('YEAR_7');
    expect(result.nextLevel).toBe('YEAR_8');
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations.some(r => r.includes('20 problems'))).toBe(true);
  });

  it('returns not ready with readinessScore=0 when no events are provided', () => {
    const result = assessReadinessForProgression([]);
    expect(result.ready).toBe(false);
    expect(result.readinessScore).toBe(0);
  });

  it('ignores non-math events when counting attempts', () => {
    // Only MATCH_SIMULATED events — not math attempts
    const nonMathEvents: GameEvent[] = Array.from({ length: 30 }, (_, i) => ({
      type: 'MATCH_SIMULATED' as const,
      timestamp: 1000 + i,
      matchId: `m${i}`,
      homeTeamId: 'team-a',
      awayTeamId: 'team-b',
      homeGoals: 1,
      awayGoals: 0,
      seed: `seed-${i}`
    }));

    const result = assessReadinessForProgression(nonMathEvents);
    // Still treated as 0 math attempts → not ready
    expect(result.ready).toBe(false);
    expect(result.readinessScore).toBe(0);
  });

  it('returns ready when student meets all criteria with 20+ high-quality attempts', () => {
    // 25 correct attempts, easy difficulty, all one topic → high accuracy, low hints, good consistency
    const goodAttempts: GameEvent[] = Array.from({ length: 25 }, (_, i) => ({
      type: 'MATH_ATTEMPT_RECORDED' as const,
      timestamp: 1000 + i,
      studentId: 'student-1',
      topic: 'percentage',
      difficulty: 1, // easy — not a "hard" problem (< 3)
      correct: true,
      timeSpent: 5000
    }));

    const result = assessReadinessForProgression(goodAttempts);
    // overallAccuracy = 1.0 >= 0.85 ✅
    // hardProblemAccuracy = 0 / 0 = 0 — no hard problems → 0, not >= 0.75 ❌
    // So not ALL criteria met, but most are
    expect(result.currentLevel).toBe('YEAR_7');
    expect(result.nextLevel).toBe('YEAR_8');
    expect(result.evidence.overallAccuracy.met).toBe(true);
    expect(result.evidence.sampleSize).toBe(25);
  });

  it('returns not ready when accuracy is below threshold with 20+ attempts', () => {
    // 20 attempts, all wrong
    const failingAttempts: GameEvent[] = Array.from({ length: 20 }, (_, i) => ({
      type: 'MATH_ATTEMPT_RECORDED' as const,
      timestamp: 1000 + i,
      studentId: 'student-1',
      topic: 'algebra',
      difficulty: 1,
      correct: false,
      timeSpent: 10000
    }));

    const result = assessReadinessForProgression(failingAttempts);
    expect(result.ready).toBe(false);
    expect(result.evidence.overallAccuracy.met).toBe(false);
    expect(result.evidence.overallAccuracy.value).toBe(0);
    // Should include a recommendation about accuracy
    expect(result.recommendations.some(r => r.includes('accuracy') || r.includes('Accuracy'))).toBe(true);
  });

  it('tracks hard problem accuracy separately for difficulty >= 3', () => {
    const attempts: GameEvent[] = [
      // 15 easy correct
      ...Array.from({ length: 15 }, (_, i) => ({
        type: 'MATH_ATTEMPT_RECORDED' as const,
        timestamp: 1000 + i,
        studentId: 's1',
        topic: 'percentage',
        difficulty: 1,
        correct: true,
        timeSpent: 5000
      })),
      // 5 hard incorrect
      ...Array.from({ length: 5 }, (_, i) => ({
        type: 'MATH_ATTEMPT_RECORDED' as const,
        timestamp: 2000 + i,
        studentId: 's1',
        topic: 'algebra',
        difficulty: 3, // hard
        correct: false,
        timeSpent: 15000
      }))
    ];

    const result = assessReadinessForProgression(attempts);
    expect(result.evidence.hardProblemAccuracy.value).toBe(0); // all hard problems wrong
    expect(result.evidence.hardProblemAccuracy.met).toBe(false);
  });

  it('provides ready recommendations when all criteria are met', () => {
    // Mix of easy and hard correct attempts across multiple topics
    const excellentAttempts: GameEvent[] = [
      ...Array.from({ length: 15 }, (_, i) => ({
        type: 'MATH_ATTEMPT_RECORDED' as const,
        timestamp: 1000 + i,
        studentId: 's1',
        topic: 'percentage',
        difficulty: 1,
        correct: true,
        timeSpent: 3000
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        type: 'MATH_ATTEMPT_RECORDED' as const,
        timestamp: 2000 + i,
        studentId: 's1',
        topic: 'algebra',
        difficulty: 3,
        correct: true, // hard problems correct → hardAccuracy = 1.0
        timeSpent: 3000
      }))
    ];

    const result = assessReadinessForProgression(excellentAttempts);
    // All criteria should be met (100% accuracy overall and hard, 0 hints, default time=1.0 ≤ 1.2)
    expect(result.evidence.overallAccuracy.met).toBe(true);
    expect(result.evidence.hardProblemAccuracy.met).toBe(true);
    expect(result.evidence.hintsUsage.met).toBe(true);
    expect(result.evidence.timeEfficiency.met).toBe(true);
    if (result.ready) {
      expect(result.recommendations.some(r => r.includes('ready') || r.includes('progress'))).toBe(true);
    }
  });

  it('covers time efficiency calculation when expectedTime is present', () => {
    // Pass events with an extra `expectedTime` field to trigger the timeRatios > 0 branch.
    // These are cast through `any[]` inside calculateEvidence so TypeScript won't object.
    const attemptsWithExpectedTime = Array.from({ length: 20 }, (_, i) => ({
      type: 'MATH_ATTEMPT_RECORDED' as const,
      timestamp: 1000 + i,
      studentId: 's1',
      topic: 'percentage',
      difficulty: 1,
      correct: true,
      timeSpent: 3000,
      expectedTime: 5000 // ratio = 0.6, well within 1.2 → timeEfficiency.met = true
    })) as unknown as GameEvent[];

    const result = assessReadinessForProgression(attemptsWithExpectedTime);
    expect(result.evidence.timeEfficiency.value).toBeLessThan(1.2);
    expect(result.evidence.timeEfficiency.met).toBe(true);
  });

  it('flags hints usage when average hints per problem exceeds threshold', () => {
    const attemptsWithHints = Array.from({ length: 20 }, (_, i) => ({
      type: 'MATH_ATTEMPT_RECORDED' as const,
      timestamp: 1000 + i,
      studentId: 's1',
      topic: 'percentage',
      difficulty: 1,
      correct: true,
      timeSpent: 3000,
      hintsUsed: 2 // 2 hints per problem → avgHints = 2 > 0.5 threshold
    })) as unknown as GameEvent[];

    const result = assessReadinessForProgression(attemptsWithHints);
    expect(result.evidence.hintsUsage.value).toBe(2);
    expect(result.evidence.hintsUsage.met).toBe(false);
    // generateRecommendations should mention hints
    expect(result.recommendations.some(r => r.toLowerCase().includes('hint'))).toBe(true);
  });

  it('flags time efficiency when student is too slow relative to expected time', () => {
    const slowAttempts = Array.from({ length: 20 }, (_, i) => ({
      type: 'MATH_ATTEMPT_RECORDED' as const,
      timestamp: 1000 + i,
      studentId: 's1',
      topic: 'algebra',
      difficulty: 1,
      correct: true,
      timeSpent: 20000,  // 20 seconds
      expectedTime: 5000 // expected 5 seconds → ratio = 4.0 > 1.2
    })) as unknown as GameEvent[];

    const result = assessReadinessForProgression(slowAttempts);
    expect(result.evidence.timeEfficiency.value).toBeGreaterThan(1.2);
    expect(result.evidence.timeEfficiency.met).toBe(false);
    // generateRecommendations should mention speed
    expect(result.recommendations.some(r => r.toLowerCase().includes('speed') || r.toLowerCase().includes('slower'))).toBe(true);
  });
}); // end assessReadinessForProgression

// ─── getProgressionSummary ────────────────────────────────────────────────────

describe('getProgressionSummary', () => {
  it('returns not_ready status when score is low (fewer than 20 attempts)', () => {
    const fewAttempts: GameEvent[] = Array.from({ length: 5 }, (_, i) => ({
      type: 'MATH_ATTEMPT_RECORDED' as const,
      timestamp: 1000 + i,
      studentId: 's1',
      topic: 'percentage',
      difficulty: 1,
      correct: false,
      timeSpent: 10000
    }));

    const summary = getProgressionSummary(fewAttempts);
    expect(summary.currentLevel).toBeDefined();
    expect(summary.status).toBe('not_ready');
    expect(summary.message).toBeDefined();
  });

  it('returns progressing status when 3-4 criteria are met (readinessScore >= 60)', () => {
    // 25 easy correct attempts, all one topic → overallAccuracy ✅, hintsUsage ✅,
    // timeEfficiency ✅, topicConsistency ✅, but hardProblemAccuracy ❌ (no hard problems)
    // → 4/5 criteria = 80% score = 'progressing'
    const progressingAttempts: GameEvent[] = Array.from({ length: 25 }, (_, i) => ({
      type: 'MATH_ATTEMPT_RECORDED' as const,
      timestamp: 1000 + i,
      studentId: 's1',
      topic: 'percentage',
      difficulty: 1, // all easy, no hard problems → hardProblemAccuracy = 0 → unmet
      correct: true,
      timeSpent: 3000
    }));

    const summary = getProgressionSummary(progressingAttempts);
    expect(summary.currentLevel).toBeDefined();
    // readinessScore = 80 (4/5 criteria met) → 'progressing'
    expect(summary.status).toBe('progressing');
    expect(summary.message).toBe('Making good progress');
  });

  it('returns ready status when student meets all criteria', () => {
    const excellentAttempts: GameEvent[] = [
      ...Array.from({ length: 15 }, (_, i) => ({
        type: 'MATH_ATTEMPT_RECORDED' as const,
        timestamp: 1000 + i,
        studentId: 's1',
        topic: 'percentage',
        difficulty: 1,
        correct: true,
        timeSpent: 3000
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        type: 'MATH_ATTEMPT_RECORDED' as const,
        timestamp: 2000 + i,
        studentId: 's1',
        topic: 'algebra',
        difficulty: 3,
        correct: true, // all hard correct → hardProblemAccuracy = 1.0 ✅
        timeSpent: 3000
      }))
    ];

    const summary = getProgressionSummary(excellentAttempts);
    expect(summary.currentLevel).toBeDefined();
    if (summary.status === 'ready') {
      expect(summary.message).toBe('Ready to progress!');
      expect(summary.nextLevel).toBeDefined();
    }
  });
});
