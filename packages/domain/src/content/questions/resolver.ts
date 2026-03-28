/**
 * Template resolver — substitutes {{variables}} and computes answers.
 */
import { QuestionTemplate, GameStateVariables } from './types';

/** Replace {{variableName}} placeholders with their numeric string values. */
function resolve(template: string, vars: GameStateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = (vars as unknown as Record<string, number>)[key];
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

export interface ResolvedChallenge {
  id: string;
  topic: QuestionTemplate['topic'];
  difficulty: 1 | 2 | 3;
  question: string;
  answer: number;
  unit: string;
  hints: [string, string, string];
  explanation: string;
  context?: string;
}

export function resolveTemplate(
  template: QuestionTemplate,
  vars: GameStateVariables,
): ResolvedChallenge {
  const r = (s: string) => resolve(s, vars);
  return {
    id: template.id,
    topic: template.topic,
    difficulty: template.difficulty,
    question: r(template.template),
    answer: template.answerFn(vars),
    unit: template.unit,
    hints: [r(template.hints[0]), r(template.hints[1]), r(template.hints[2])],
    explanation: r(template.explanation),
    context: template.context ? r(template.context) : undefined,
  };
}
