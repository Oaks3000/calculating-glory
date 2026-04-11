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
 * Live game state values available for question template substitution.
 * Extracted from GameState by extractVariables() in variables.ts.
 *
 * 'division'-scale questions use these values.
 * 'fixed'-scale questions ignore them (answer is a constant).
 */
export interface GameStateVariables {
  // Transfer budget (scales with division)
  transferBudgetPounds: number;   // e.g. 500000
  transferBudgetK: number;        // nearest £k, e.g. 500
  transferBudgetM: number;        // 1dp millions, e.g. 0.5

  // Weekly wages (scales with division)
  wageReservePounds: number;
  wageBillWeeklyPounds: number;
  wageHeadroomPounds: number;     // wageReserve - wageBill

  // Match stats (current season)
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  leaguePosition: number;
  gamesRemaining: number;         // 46 - played
  maxPointsPossible: number;      // played × 3

  // Board
  boardConfidence: number;        // 0–100

  // Time
  currentWeek: number;
  season: number;

  // Derived rates (safe: played=0 gives 0)
  winRatePct: number;             // round((won/played)×100)
  pointsPerGame: number;          // 1dp
  goalsForPerGame: number;        // 2dp
  goalsAgainstPerGame: number;    // 2dp
}

export interface QuestionTemplate {
  /** Unique id. Convention: {topic-slug}-{level-slug}-{difficulty}-{seq}, e.g. 'pct-yr7-1-001' */
  id: string;
  topic: MathTopic;
  minCurriculumLevel: CurriculumLevel;
  difficulty: 1 | 2 | 3;
  valueScale: ValueScale;

  /**
   * Question text shown to the student. Use {{variableName}} for GameStateVariables.
   * Write in KS3/GCSE exam register: clear, unambiguous, units stated.
   */
  template: string;

  /**
   * Typed resolver — computes the correct numerical answer from resolved variables.
   * For 'fixed' questions, ignore vars and return a constant.
   * Never use eval(). Return a plain number.
   */
  answerFn: (vars: GameStateVariables) => number;

  /** Human-readable description of the calculation. Documentation only. */
  answerFormula: string;

  unit: string;

  hints: [string, string, string];
  explanation: string;
  context?: string;

  /**
   * Optional key into the frontend DiagramLibrary.
   * When set, GeometryDrillCard renders the corresponding SVG diagram
   * above the question text. The key is a stable string identifier
   * (e.g. 'circle-chord', 'cone-cross-section') — the actual SVG lives
   * in the frontend and is never stored in domain.
   *
   * Leave undefined for questions that work as pure text.
   */
  diagram?: string;
}

/**
 * A registry of question templates grouped by topic.
 * Each topic file exports a const of this type.
 */
export type QuestionBank = QuestionTemplate[];
