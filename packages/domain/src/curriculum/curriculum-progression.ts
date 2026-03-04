/**
 * Curriculum Progression System
 * 
 * Assesses student readiness to progress to next curriculum level
 * based on performance across multiple dimensions.
 */

import { GameEvent } from '../events/types';
import {
  CurriculumLevel,
  getCurrentCurriculum,
  getNextLevel,
  CURRICULUM_LEVELS
} from './curriculum-config';

export interface ProgressionAssessment {
  /** Is student ready to progress? */
  ready: boolean;
  
  /** Current curriculum level */
  currentLevel: CurriculumLevel;
  
  /** Next level (if ready) */
  nextLevel?: CurriculumLevel;
  
  /** Overall readiness score (0-100) */
  readinessScore: number;
  
  /** Evidence supporting the assessment */
  evidence: ProgressionEvidence;
  
  /** Specific recommendations */
  recommendations: string[];
}

export interface ProgressionEvidence {
  /** Overall accuracy on recent problems */
  overallAccuracy: {
    value: number; // 0-1
    required: number; // 0-1
    met: boolean;
  };
  
  /** Accuracy on hard problems */
  hardProblemAccuracy: {
    value: number;
    required: number;
    met: boolean;
  };
  
  /** Average hints needed */
  hintsUsage: {
    value: number; // Average per problem
    required: number; // Max acceptable
    met: boolean;
  };
  
  /** Average time taken relative to expectations */
  timeEfficiency: {
    value: number; // Ratio: actual/expected
    required: number; // Max acceptable ratio
    met: boolean;
  };
  
  /** Consistency across topics */
  topicConsistency: {
    value: number; // 0-1 (variance across topics)
    required: number;
    met: boolean;
  };
  
  /** Number of problems attempted */
  sampleSize: number;
}

/**
 * Assess readiness for progression to next curriculum level
 * 
 * Analyzes recent performance across multiple dimensions:
 * - Overall accuracy
 * - Hard problem performance
 * - Hint dependency
 * - Time efficiency
 * - Topic consistency
 */
export function assessReadinessForProgression(
  events: GameEvent[]
): ProgressionAssessment {
  const curriculum = getCurrentCurriculum();
  const nextLevel = getNextLevel(curriculum.level);
  
  // If at highest level, can't progress
  if (!nextLevel) {
    return {
      ready: false,
      currentLevel: curriculum.level,
      readinessScore: 100,
      evidence: createEmptyEvidence(),
      recommendations: ['You are at the highest curriculum level!']
    };
  }
  
  // Filter to recent math attempts (last 50)
  const mathAttempts = events
    .filter(e => e.type === 'MATH_ATTEMPT_RECORDED')
    .slice(-50);
  
  if (mathAttempts.length < 20) {
    return {
      ready: false,
      currentLevel: curriculum.level,
      nextLevel,
      readinessScore: 0,
      evidence: createEmptyEvidence(),
      recommendations: [
        `Need more practice - only ${mathAttempts.length} problems completed`,
        'Complete at least 20 problems before assessment'
      ]
    };
  }
  
  // Calculate evidence metrics
  const evidence = calculateEvidence(mathAttempts, curriculum);
  
  // Determine if all criteria met
  const criteriaMet = [
    evidence.overallAccuracy.met,
    evidence.hardProblemAccuracy.met,
    evidence.hintsUsage.met,
    evidence.timeEfficiency.met,
    evidence.topicConsistency.met
  ];
  
  const ready = criteriaMet.every(Boolean);
  const readinessScore = (criteriaMet.filter(Boolean).length / criteriaMet.length) * 100;
  
  // Generate recommendations
  const recommendations = generateRecommendations(evidence, ready);
  
  return {
    ready,
    currentLevel: curriculum.level,
    nextLevel,
    readinessScore,
    evidence,
    recommendations
  };
}

/**
 * Calculate all evidence metrics from math attempts
 */
function calculateEvidence(
  attempts: any[], // GameEvent with type MATH_ATTEMPT_RECORDED
  _curriculum: any
): ProgressionEvidence {
  const totalAttempts = attempts.length;

  // Overall Accuracy
  const correctAttempts = attempts.filter(a => a.correct).length;
  const overallAccuracy = correctAttempts / totalAttempts;

  // Hard Problem Accuracy (difficulty >= 3 = hard)
  const hardProblems = attempts.filter(a => a.difficulty >= 3);
  const hardCorrect = hardProblems.filter(a => a.correct).length;
  const hardAccuracy = hardProblems.length > 0 ? hardCorrect / hardProblems.length : 0;

  // Hints Usage (hintsUsed not yet tracked in events, defaults to 0)
  const totalHints = attempts.reduce((sum, a) => sum + (a.hintsUsed || 0), 0);
  const avgHints = totalHints / totalAttempts;

  // Time Efficiency (expectedTime not yet tracked in events, defaults to ratio 1.0)
  const timeRatios = attempts
    .filter(a => a.timeSpent && a.expectedTime)
    .map(a => a.timeSpent / a.expectedTime);
  const avgTimeRatio = timeRatios.length > 0
    ? timeRatios.reduce((sum, r) => sum + r, 0) / timeRatios.length
    : 1.0;

  // Topic Consistency (variance in accuracy across topics)
  const topicAccuracies = calculateTopicAccuracies(attempts);
  const topicVariance = calculateVariance(Object.values(topicAccuracies));
  const topicConsistency = 1 - topicVariance; // Lower variance = higher consistency
  
  return {
    overallAccuracy: {
      value: overallAccuracy,
      required: 0.85,
      met: overallAccuracy >= 0.85
    },
    hardProblemAccuracy: {
      value: hardAccuracy,
      required: 0.75,
      met: hardAccuracy >= 0.75
    },
    hintsUsage: {
      value: avgHints,
      required: 0.5,
      met: avgHints <= 0.5
    },
    timeEfficiency: {
      value: avgTimeRatio,
      required: 1.2, // Can take up to 20% longer than expected
      met: avgTimeRatio <= 1.2
    },
    topicConsistency: {
      value: topicConsistency,
      required: 0.7,
      met: topicConsistency >= 0.7
    },
    sampleSize: totalAttempts
  };
}

/**
 * Calculate accuracy for each topic
 */
function calculateTopicAccuracies(attempts: any[]): Record<string, number> {
  const topicStats: Record<string, { correct: number; total: number }> = {};
  
  attempts.forEach(attempt => {
    const topic = attempt.topic || 'unknown';
    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, total: 0 };
    }
    topicStats[topic].total++;
    if (attempt.correct) {
      topicStats[topic].correct++;
    }
  });
  
  const accuracies: Record<string, number> = {};
  for (const [topic, stats] of Object.entries(topicStats)) {
    accuracies[topic] = stats.total > 0 ? stats.correct / stats.total : 0;
  }
  
  return accuracies;
}

/**
 * Calculate variance of an array of numbers
 */
function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return variance;
}

/**
 * Generate personalized recommendations based on evidence
 */
function generateRecommendations(
  evidence: ProgressionEvidence,
  ready: boolean
): string[] {
  if (ready) {
    return [
      '🎉 Excellent work! You\'re ready to progress to the next level',
      'You\'ve demonstrated strong performance across all areas',
      'Continue to the next curriculum level for new challenges'
    ];
  }
  
  const recommendations: string[] = [];
  
  if (!evidence.overallAccuracy.met) {
    const gap = ((evidence.overallAccuracy.required - evidence.overallAccuracy.value) * 100).toFixed(1);
    recommendations.push(
      `📊 Overall accuracy: ${(evidence.overallAccuracy.value * 100).toFixed(1)}% (need ${(evidence.overallAccuracy.required * 100).toFixed(0)}%)`,
      `   Work on improving accuracy by ${gap}% before progressing`
    );
  }
  
  if (!evidence.hardProblemAccuracy.met) {
    recommendations.push(
      `💪 Hard problems: ${(evidence.hardProblemAccuracy.value * 100).toFixed(1)}% accuracy (need ${(evidence.hardProblemAccuracy.required * 100).toFixed(0)}%)`,
      '   Focus on challenging yourself with harder problems'
    );
  }
  
  if (!evidence.hintsUsage.met) {
    recommendations.push(
      `💡 Hints used: ${evidence.hintsUsage.value.toFixed(2)} per problem (aim for < ${evidence.hintsUsage.required})`,
      '   Try solving more problems independently before asking for hints'
    );
  }
  
  if (!evidence.timeEfficiency.met) {
    const percentSlower = ((evidence.timeEfficiency.value - 1) * 100).toFixed(0);
    recommendations.push(
      `⏱️ Speed: ${percentSlower}% slower than expected`,
      '   Practice to improve your calculation speed'
    );
  }
  
  if (!evidence.topicConsistency.met) {
    recommendations.push(
      `📚 Topic consistency: ${(evidence.topicConsistency.value * 100).toFixed(0)}% (need ${(evidence.topicConsistency.required * 100).toFixed(0)}%)`,
      '   Some topics need more practice - focus on weak areas'
    );
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Keep practicing to improve your skills!');
  }
  
  return recommendations;
}

/**
 * Create empty evidence structure
 */
function createEmptyEvidence(): ProgressionEvidence {
  return {
    overallAccuracy: { value: 0, required: 0.85, met: false },
    hardProblemAccuracy: { value: 0, required: 0.75, met: false },
    hintsUsage: { value: 0, required: 0.5, met: false },
    timeEfficiency: { value: 0, required: 1.2, met: false },
    topicConsistency: { value: 0, required: 0.7, met: false },
    sampleSize: 0
  };
}

/**
 * Get progression status summary for UI display
 */
export function getProgressionSummary(
  events: GameEvent[]
): {
  currentLevel: string;
  nextLevel?: string;
  progress: number;
  status: 'not_ready' | 'progressing' | 'ready';
  message: string;
} {
  const assessment = assessReadinessForProgression(events);
  
  let status: 'not_ready' | 'progressing' | 'ready';
  let message: string;
  
  if (assessment.ready) {
    status = 'ready';
    message = 'Ready to progress!';
  } else if (assessment.readinessScore >= 60) {
    status = 'progressing';
    message = 'Making good progress';
  } else {
    status = 'not_ready';
    message = 'Keep practicing';
  }
  
  return {
    currentLevel: CURRICULUM_LEVELS[assessment.currentLevel].displayName,
    nextLevel: assessment.nextLevel 
      ? CURRICULUM_LEVELS[assessment.nextLevel].displayName 
      : undefined,
    progress: assessment.readinessScore,
    status,
    message
  };
}
