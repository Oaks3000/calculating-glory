/**
 * Question Bank — Type Definitions
 *
 * Questions are tagged on two independent axes:
 *
 *   minCurriculumLevel — the mathematical complexity of the question.
 *                        Keyed off the student's year group (set at game start).
 *                        Never changes because the student earned a promotion.
 *
 *   valueScale         — how the injected £/stat values are sourced at runtime.
 *                        'division' → values come from the club's current division
 *                        budget, so a Year 7 kid in the Premier League gets Year 7
 *                        maths with Premier League money.
 *                        'fixed' → values are constants baked into the template
 *                        (e.g. geometry questions with fixed dimensions).
 *
 * This separation means football progression (L2→PL) and curriculum progression
 * (Year 7→GCSE Higher) are fully decoupled.
 */

import { CurriculumLevel, MathTopic } from '../../curriculum/curriculum-config';

/** Controls where injected £/stat values come from at runtime. */
export type ValueScale = 'division' | 'fixed';

/**
 * A question template in the bank.
 *
 * Template strings use {{variable}} placeholders. At render time the runtime
 * resolves each placeholder from the current GameState (using valueScale to
 * determine which values are available) and substitutes them into:
 *   - template (question text shown to the student)
 *   - hints (up to 3, shown progressively)
 *   - explanation (full worked solution, shown after resolution)
 *
 * answerFormula is a human-readable description of how the correct answer is
 * computed from the resolved variable values. It is NOT eval()'d — the runtime
 * calls a typed resolver function registered alongside the template.
 */
export interface QuestionTemplate {
  /**
   * Unique identifier. Convention: {topic-slug}-{level-slug}-{difficulty}-{seq}
   * e.g. 'pct-yr7-easy-001', 'algebra-yr9-med-003'
   */
  id: string;

  /**
   * The curriculum topic this question covers.
   * Uses MathTopic (the domain canonical taxonomy), not ChallengeTopic
   * (the frontend display grouping). A mapping between the two lives in
   * the frontend challenge generator.
   */
  topic: MathTopic;

  /**
   * Minimum curriculum level at which this question may appear.
   * The runtime filters out questions where minCurriculumLevel is above
   * the student's current level (using CURRICULUM_LEVEL_ORDER for comparison).
   */
  minCurriculumLevel: CurriculumLevel;

  /**
   * Difficulty tier within the question's curriculum level.
   *   1 = easy   (1 step, whole numbers, direct operation)
   *   2 = medium (2 steps, may involve decimals or multi-stage reasoning)
   *   3 = hard   (3+ steps, distractor values, reverse reasoning)
   *
   * At runtime this is further capped by MAX_DIFFICULTY_BY_LEVEL[studentLevel].
   */
  difficulty: 1 | 2 | 3;

  /**
   * Controls how injected values are sourced.
   * 'division' — financial variables (transferBudget, wageBill, etc.) scale
   *              with the student's current division via TIER_REVENUE_MULTIPLIER.
   *              Same mathematical operation, Premier League numbers.
   * 'fixed'    — all values are defined in the template itself, independent
   *              of the student's club state (e.g. geometry, abstract algebra).
   */
  valueScale: ValueScale;

  /**
   * The question text shown to the student.
   * May contain {{variable}} placeholders resolved from GameState at runtime.
   * Write in the register of KS3/GCSE exam questions — clear, unambiguous,
   * with units stated explicitly.
   *
   * Example:
   *   "Your transfer budget is £{{transferBudgetM}}m. The board says you can
   *    spend no more than 25% on one player. What is the maximum fee you
   *    can pay? Give your answer in pounds."
   */
  template: string;

  /**
   * Human-readable description of how the correct answer is computed.
   * Written in terms of the resolved {{variable}} names.
   * The runtime uses a registered typed resolver function — this field is
   * documentation and aids content authoring, not runtime evaluation.
   *
   * Example: "transferBudget × 0.25"
   */
  answerFormula: string;

  /**
   * The answer's unit label shown alongside the student's input.
   * Use '£' for money, '%' for percentages, etc.
   * Empty string for dimensionless answers.
   */
  unit: string;

  /**
   * Three progressive hints, shown one at a time on student request.
   * Each hint should move the student closer to the method without giving
   * away the final answer. May use {{variable}} placeholders.
   *
   * Style guide (matches KS3 scaffolding conventions):
   *   hints[0] — remind the student what operation or concept applies
   *   hints[1] — show the first step or set up the calculation
   *   hints[2] — give the numerical setup with only the final step missing
   */
  hints: [string, string, string];

  /**
   * Full worked explanation shown after the question is resolved (correct or not).
   * Should match the style of a mark-scheme worked answer.
   * May use {{variable}} placeholders.
   */
  explanation: string;

  /**
   * Optional: narrative context shown above the question, attributed to an NPC.
   * Grounds the abstract maths in the game world. Keep to 1–2 sentences.
   * May use {{variable}} placeholders.
   *
   * Example: "Val Hartley (CFO): 'Before we sign off on this, I need the numbers.'"
   */
  context?: string;
}

/**
 * A registry of question templates grouped by topic.
 * Each topic file exports a const of this type.
 */
export type QuestionBank = QuestionTemplate[];
