import {
  GameState,
  MathTopic,
  CURRICULUM_LEVEL_ORDER,
  MAX_DIFFICULTY_BY_LEVEL,
  QUESTION_BANK,
  QuestionTemplate,
  extractVariables,
  resolveTemplate,
} from '@calculating-glory/domain';

// ── Public types (unchanged — callers depend on these) ────────────────────────

/** Shape of businessAcumen.recentPerformance, keyed by ChallengeTopic */
export type TopicPerformance = {
  percentage: number;
  decimals:   number;
  ratios:     number;
  algebra:    number;
  statistics: number;
  multiStep:  number;
  geometry:   number;
};

export type ChallengeTopic =
  | 'percentage'
  | 'decimals'
  | 'ratios'
  | 'algebra'
  | 'statistics'
  | 'geometry';

export interface MathChallenge {
  id: string;
  topic: ChallengeTopic;
  difficulty: number; // 1-3
  question: string;
  answer: number;
  unit: string;
  hints: [string, string, string];
  explanation: string;
  context: string;
}

// ── Topic mappings ─────────────────────────────────────────────────────────────

/**
 * Maps frontend ChallengeTopic → the domain MathTopics that cover it.
 * Used when a caller requests a specific topic override.
 */
const CHALLENGE_TOPIC_TO_MATH_TOPICS: Record<ChallengeTopic, MathTopic[]> = {
  percentage: ['PERCENTAGES', 'COMPOUND_PERCENTAGES'],
  decimals:   ['DECIMALS', 'NEGATIVE_NUMBERS', 'BASIC_ARITHMETIC'],
  ratios:     ['RATIOS', 'SIMPLE_FRACTIONS'],
  algebra:    ['BASIC_ALGEBRA', 'SIMULTANEOUS_EQUATIONS', 'QUADRATIC_EQUATIONS'],
  statistics: ['DATA_INTERPRETATION', 'PROBABILITY', 'SEQUENCES', 'STATISTICAL_ANALYSIS', 'GRAPH_INTERPRETATION', 'ADVANCED_PROBABILITY'],
  geometry:   ['AREA_AND_PERIMETER', 'ANGLES', 'SCALE_AND_PROPORTION', 'PROPERTIES_OF_SHAPES'],
};

/**
 * Maps domain MathTopic → the ChallengeTopic it belongs to.
 * Used to tag resolved challenges for the frontend display system.
 */
const MATH_TOPIC_TO_CHALLENGE: Partial<Record<MathTopic, ChallengeTopic>> = {
  BASIC_ARITHMETIC:     'percentage',
  DECIMALS:             'decimals',
  PERCENTAGES:          'percentage',
  COMPOUND_PERCENTAGES: 'percentage',
  SIMPLE_FRACTIONS:     'ratios',
  RATIOS:               'ratios',
  NEGATIVE_NUMBERS:     'decimals',
  BASIC_ALGEBRA:        'algebra',
  SIMULTANEOUS_EQUATIONS: 'algebra',
  QUADRATIC_EQUATIONS:  'algebra',
  TRIGONOMETRY:         'algebra',
  DATA_INTERPRETATION:  'statistics',
  PROBABILITY:          'statistics',
  SEQUENCES:            'statistics',
  STATISTICAL_ANALYSIS: 'statistics',
  GRAPH_INTERPRETATION: 'statistics',
  ADVANCED_PROBABILITY: 'statistics',
  AREA_AND_PERIMETER:   'geometry',
  ANGLES:               'geometry',
  SCALE_AND_PROPORTION: 'geometry',
  PROPERTIES_OF_SHAPES: 'geometry',
};

// ── Challenge generator ────────────────────────────────────────────────────────

/**
 * Generate a curriculum-appropriate math challenge from the question bank.
 *
 * Signature is unchanged from the previous hardcoded version so all callers
 * (SocialFeed, TrainingFocusSlideOver, ScoutNetworkSlideOver) work without modification.
 *
 * Selection logic:
 * - Filters bank by student's curriculum level (minCurriculumLevel ≤ studentLevel)
 * - Caps difficulty by MAX_DIFFICULTY_BY_LEVEL[curriculumLevel]
 * - Optionally filters to a single topic (topicOverride)
 * - Excludes the previous template to avoid back-to-back duplicates
 * - With performance data: applies adaptive difficulty weighting (struggling → easier, mastered → harder)
 * - Without performance data: cycles deterministically via `index`
 */
export function generateChallenge(
  state: GameState,
  index: number,
  performance?: TopicPerformance,
  topicOverride?: ChallengeTopic,
  excludeTemplateSlug?: string,
): MathChallenge {
  const vars          = extractVariables(state);
  const curriculumLevel = state.curriculum?.level ?? 'YEAR_7';
  const studentIdx    = CURRICULUM_LEVEL_ORDER.indexOf(curriculumLevel);
  const maxDifficulty = MAX_DIFFICULTY_BY_LEVEL[curriculumLevel];

  // ── Build pool: level- and difficulty-filtered ───────────────────────────────
  let pool: QuestionTemplate[] = QUESTION_BANK.filter(q => {
    const qIdx = CURRICULUM_LEVEL_ORDER.indexOf(q.minCurriculumLevel);
    return qIdx <= studentIdx && q.difficulty <= maxDifficulty;
  });

  // ── Topic filter ─────────────────────────────────────────────────────────────
  if (topicOverride) {
    const mathTopics = CHALLENGE_TOPIC_TO_MATH_TOPICS[topicOverride];
    const filtered = pool.filter(q => mathTopics.includes(q.topic));
    if (filtered.length > 0) pool = filtered;
  }

  // ── Deduplication: exclude the previously shown template ─────────────────────
  if (excludeTemplateSlug) {
    const deduped = pool.filter(q => q.id !== excludeTemplateSlug);
    if (deduped.length > 0) pool = deduped;
  }

  // ── Safe fallback if pool somehow empty ──────────────────────────────────────
  if (pool.length === 0) {
    pool = QUESTION_BANK.filter(q => q.topic === 'PERCENTAGES' && q.difficulty === 1);
  }

  // ── Template selection ────────────────────────────────────────────────────────
  const hasPerformanceData =
    performance && Object.values(performance).some(v => v > 0);

  let template: QuestionTemplate;

  if (!hasPerformanceData || topicOverride) {
    // Deterministic: cycle by index so the same game state always produces the same question
    template = pool[index % pool.length];
  } else {
    // ── Adaptive: weight by topic accuracy ──────────────────────────────────────
    const accuracy: Record<ChallengeTopic, number> = {
      percentage: performance.percentage,
      decimals:   performance.decimals,
      ratios:     performance.ratios,
      algebra:    performance.algebra,
      statistics: performance.statistics,
      geometry:   performance.geometry,
    };

    const weighted = pool.map(q => {
      const challengeTopic = MATH_TOPIC_TO_CHALLENGE[q.topic] ?? 'percentage';
      const score = accuracy[challengeTopic] ?? 50;

      // Base weight: lower accuracy → higher weight (min 20 so all topics stay reachable)
      let weight = Math.max(20, 100 - score);

      // Mastered topic (≥80%): push harder variants, suppress easy ones
      if (score >= 80) {
        if (q.difficulty >= 2) weight *= 1.5;
        if (q.difficulty === 1) weight *= 0.3;
      }

      // Struggling topic (>0 attempts but <40%): prefer easier variants
      if (score > 0 && score < 40) {
        if (q.difficulty === 1) weight *= 1.5;
        if (q.difficulty === 3) weight *= 0.5;
      }

      return { template: q, weight };
    });

    const total = weighted.reduce((s, w) => s + w.weight, 0);
    let rand = Math.random() * total;
    template = weighted[weighted.length - 1].template;
    for (const w of weighted) {
      rand -= w.weight;
      if (rand <= 0) {
        template = w.template;
        break;
      }
    }
  }

  // ── Resolve and convert to MathChallenge ─────────────────────────────────────
  const resolved = resolveTemplate(template, vars);

  return {
    id:          resolved.id,
    topic:       (MATH_TOPIC_TO_CHALLENGE[resolved.topic] ?? 'percentage') as ChallengeTopic,
    difficulty:  resolved.difficulty,
    question:    resolved.question,
    answer:      resolved.answer,
    unit:        resolved.unit,
    hints:       resolved.hints,
    explanation: resolved.explanation,
    context:     resolved.context ?? '',
  };
}
