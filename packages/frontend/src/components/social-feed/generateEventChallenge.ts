import {
  PendingClubEvent,
  GameState,
  CurriculumLevel,
  MAX_DIFFICULTY_BY_LEVEL,
  pickQuestion,
  resolveTemplate,
  extractVariables,
} from '@calculating-glory/domain';
import { MathChallenge, ChallengeTopic, MATH_TOPIC_TO_CHALLENGE } from './generateChallenge';

function absGBP(pence: number): number {
  return Math.abs(pence) / 100;
}

function fmtGBP(pence: number): string {
  return `£${absGBP(pence).toLocaleString('en-GB')}`;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * Clamp a raw difficulty value to what the student's curriculum level allows.
 */
function clampDifficulty(raw: 1 | 2 | 3, curriculumLevel: CurriculumLevel): 1 | 2 | 3 {
  const max = MAX_DIFFICULTY_BY_LEVEL[curriculumLevel];
  return Math.min(raw, max) as 1 | 2 | 3;
}

/**
 * Derive a deterministic selection index from an event id string.
 * Used so bank-topic events always pick the same question for the same event.
 */
function idToSeed(id: string): number {
  return id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

/**
 * Given a pending event that has a requiresMath choice, generate a MathChallenge.
 *
 * Two paths:
 *
 *   Bank path  — when event.bankTopic is set, a question is pulled from the
 *                question bank for that topic and resolved against live game
 *                state. Used for events where the maths story maps to a
 *                specific curriculum topic (algebra, ratios, data
 *                interpretation) rather than a simple budget comparison.
 *
 *   Financial context path — the original behaviour: derive a percentage
 *                question from the actual budget stakes of the negotiation
 *                (saving %, increase %, or % of transfer budget). Used for
 *                all events without a bankTopic tag.
 *
 * Returns null if no suitable challenge can be constructed (SocialFeed should
 * fall back to the standard challenge bank in that case).
 */
export function generateEventChallenge(
  event: PendingClubEvent,
  state: GameState,
): MathChallenge | null {
  const curriculumLevel = state.curriculum?.level ?? 'YEAR_7';

  // ── Bank path: event has a specific topic tag ─────────────────────────────
  if (event.bankTopic) {
    const mathChoice = event.choices.find(c => c.requiresMath);
    if (!mathChoice) return null;

    const template = pickQuestion(curriculumLevel, {
      topics: [event.bankTopic],
      selectionIndex: idToSeed(event.id),
    });
    if (!template) return null;

    const vars     = extractVariables(state);
    const resolved = resolveTemplate(template, vars);

    return {
      id:          `event-${event.id}`,
      topic:       (MATH_TOPIC_TO_CHALLENGE[resolved.topic] ?? 'percentage') as ChallengeTopic,
      difficulty:  clampDifficulty(resolved.difficulty, curriculumLevel),
      question:    resolved.question,
      answer:      resolved.answer,
      unit:        resolved.unit,
      hints:       resolved.hints,
      explanation: resolved.explanation,
      context:     `${event.title}: ${event.description}`,
    };
  }

  // ── Financial context path: derive question from budget effects ───────────
  const mathChoice = event.choices.find(c => c.requiresMath);
  if (!mathChoice || mathChoice.budgetEffect === undefined) return null;

  const transferBudget = state.club.transferBudget;
  const mathEffect     = mathChoice.budgetEffect;   // signed pence
  const mathAmount     = absGBP(mathEffect);        // unsigned £

  // Find a comparable non-math choice with the same budget sign (cost vs income)
  const comparable = event.choices.find(
    c => !c.requiresMath && c.budgetEffect !== undefined &&
         Math.sign(c.budgetEffect) === Math.sign(mathEffect)
  );

  // ── COST scenario: math route costs less than the standard option ─────────
  if (comparable?.budgetEffect !== undefined && mathEffect < 0) {
    const cmpAmount = absGBP(comparable.budgetEffect);
    const saving    = cmpAmount - mathAmount;
    const savingPct = Math.round((saving / cmpAmount) * 100);

    return {
      id:         `event-${event.id}`,
      topic:      'percentage',
      difficulty: clampDifficulty(2, curriculumLevel),
      context:
        `${event.title}: ${event.description} ` +
        `The quickest fix costs ${fmtGBP(comparable.budgetEffect)}, but ` +
        `if you can back it with numbers we can negotiate it down to ${fmtGBP(mathEffect)}.`,
      question:
        `The standard cost is ${fmtGBP(comparable.budgetEffect)}. ` +
        `The negotiated price is ${fmtGBP(mathEffect)}. ` +
        `What percentage saving does the negotiated deal represent? ` +
        `Round to the nearest whole number.`,
      answer: savingPct,
      unit: '%',
      hints: [
        `Saving = standard − negotiated = ${fmtGBP(comparable.budgetEffect)} − ${fmtGBP(mathEffect)} = £${saving.toLocaleString('en-GB')}`,
        `Percentage saving = (saving ÷ standard cost) × 100`,
        `(${saving.toLocaleString('en-GB')} ÷ ${cmpAmount.toLocaleString('en-GB')}) × 100 = ?`,
      ],
      explanation:
        `Saving = £${saving.toLocaleString('en-GB')}. ` +
        `(${saving.toLocaleString('en-GB')} ÷ ${cmpAmount.toLocaleString('en-GB')}) × 100 = ${savingPct}%`,
    };
  }

  // ── INCOME scenario: math route earns more than the standard option ───────
  if (comparable?.budgetEffect !== undefined && mathEffect > 0) {
    const cmpAmount   = absGBP(comparable.budgetEffect);
    const increase    = mathAmount - cmpAmount;
    const increasePct = Math.round((increase / cmpAmount) * 100);

    return {
      id:         `event-${event.id}`,
      topic:      'percentage',
      difficulty: clampDifficulty(2, curriculumLevel),
      context:
        `${event.title}: ${event.description} ` +
        `There's a standard offer of ${fmtGBP(comparable.budgetEffect)} on the table, ` +
        `but we think we can push for ${fmtGBP(mathEffect)}. Make the case with numbers.`,
      question:
        `The original offer is ${fmtGBP(comparable.budgetEffect)}. ` +
        `The negotiated deal is worth ${fmtGBP(mathEffect)}. ` +
        `What is the percentage increase from the original to the negotiated deal? ` +
        `Round to the nearest whole number.`,
      answer: increasePct,
      unit: '%',
      hints: [
        `Increase = negotiated − original = ${fmtGBP(mathEffect)} − ${fmtGBP(comparable.budgetEffect)} = £${increase.toLocaleString('en-GB')}`,
        `Percentage increase = (increase ÷ original) × 100`,
        `(${increase.toLocaleString('en-GB')} ÷ ${cmpAmount.toLocaleString('en-GB')}) × 100 = ?`,
      ],
      explanation:
        `Increase = £${increase.toLocaleString('en-GB')}. ` +
        `(${increase.toLocaleString('en-GB')} ÷ ${cmpAmount.toLocaleString('en-GB')}) × 100 = ${increasePct}%`,
    };
  }

  // ── FALLBACK: no comparable budget choice — express as % of transfer budget
  if (mathEffect > 0) {
    const budgetPounds = transferBudget / 100;
    const dealPct      = round1((mathAmount / budgetPounds) * 100);
    const budgetM      = round1(budgetPounds / 1_000_000);

    return {
      id:         `event-${event.id}`,
      topic:      'percentage',
      difficulty: clampDifficulty(2, curriculumLevel),
      context:
        `${event.title}: ${event.description} ` +
        `${mathChoice.description} I need you to put this in context for the board.`,
      question:
        `This deal would bring in ${fmtGBP(mathEffect)}. ` +
        `Your current transfer budget is £${budgetM}m. ` +
        `What percentage of the transfer budget would this represent? ` +
        `Give your answer to 1 decimal place.`,
      answer: dealPct,
      unit: '%',
      hints: [
        `Convert the budget: £${budgetM}m = £${budgetPounds.toLocaleString('en-GB')}`,
        `Percentage = (deal ÷ budget) × 100`,
        `(${mathAmount.toLocaleString('en-GB')} ÷ ${budgetPounds.toLocaleString('en-GB')}) × 100 = ? (1 dp)`,
      ],
      explanation:
        `(${mathAmount.toLocaleString('en-GB')} ÷ ${budgetPounds.toLocaleString('en-GB')}) × 100 = ${dealPct}%`,
    };
  }

  return null;
}

/** Format a budget effect (pence) as a signed £ string for consequence banners */
export function formatBudgetEffect(pence: number): string {
  const sign = pence >= 0 ? '+' : '−';
  const abs  = Math.abs(pence / 100).toLocaleString('en-GB', {
    style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
  });
  return `${sign}${abs}`;
}
