import { useState } from 'react';
import { PendingClubEvent, GameCommand } from '@calculating-glory/domain';

interface PendingEventCardProps {
  event: PendingClubEvent;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
  onMathChallenge: (event: PendingClubEvent) => void;
}

const NPC_LABELS: Record<string, { name: string; colour: string }> = {
  val:    { name: 'Val Okoro · Finance',     colour: 'text-data-blue bg-data-blue/10 border-data-blue/30' },
  marcus: { name: 'Marcus Webb · Commercial', colour: 'text-pitch-green bg-pitch-green/10 border-pitch-green/30' },
  dani:   { name: 'Dani Lopes · Operations',  colour: 'text-warn-amber bg-warn-amber/10 border-warn-amber/30' },
  kev:    { name: 'Kev Mulligan · Football',  colour: 'text-txt-muted bg-bg-raised border-bg-raised' },
};

function formatBudget(pence: number) {
  const abs = Math.abs(pence / 100);
  const sign = pence >= 0 ? '+' : '−';
  return `${sign}${abs.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  })}`;
}

function EffectPills({
  budgetEffect,
  reputationEffect,
  performanceEffect,
}: {
  budgetEffect?: number;
  reputationEffect?: number;
  performanceEffect?: number;
}) {
  const pills: { label: string; cls: string }[] = [];

  if (budgetEffect !== undefined && budgetEffect !== 0) {
    pills.push({
      label: `Budget ${formatBudget(budgetEffect)}`,
      cls: budgetEffect > 0
        ? 'bg-pitch-green/15 text-pitch-green border border-pitch-green/30'
        : 'bg-alert-red/15 text-alert-red border border-alert-red/30',
    });
  }

  if (reputationEffect !== undefined && reputationEffect !== 0) {
    pills.push({
      label: `Rep ${reputationEffect > 0 ? '+' : ''}${reputationEffect}`,
      cls: reputationEffect > 0
        ? 'bg-pitch-green/15 text-pitch-green border border-pitch-green/30'
        : 'bg-alert-red/15 text-alert-red border border-alert-red/30',
    });
  }

  if (performanceEffect !== undefined && performanceEffect !== 0) {
    pills.push({
      label: `Perf ${performanceEffect > 0 ? '+' : ''}${performanceEffect}`,
      cls: performanceEffect > 0
        ? 'bg-pitch-green/15 text-pitch-green border border-pitch-green/30'
        : 'bg-alert-red/15 text-alert-red border border-alert-red/30',
    });
  }

  if (pills.length === 0) {
    pills.push({ label: 'No financial impact', cls: 'bg-bg-raised text-txt-muted' });
  }

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {pills.map(p => (
        <span key={p.label} className={`px-2 py-0.5 rounded-tag text-xs font-medium ${p.cls}`}>
          {p.label}
        </span>
      ))}
    </div>
  );
}

/** A choice is "risky" if it has only negative effects and no positive budget gain */
function isRiskyChoice(choice: PendingClubEvent['choices'][number]): boolean {
  const hasPositive =
    (choice.budgetEffect !== undefined && choice.budgetEffect > 0) ||
    (choice.reputationEffect !== undefined && choice.reputationEffect > 0) ||
    (choice.performanceEffect !== undefined && choice.performanceEffect > 0);
  const hasNegative =
    (choice.budgetEffect !== undefined && choice.budgetEffect < 0) ||
    (choice.reputationEffect !== undefined && choice.reputationEffect < 0) ||
    (choice.performanceEffect !== undefined && choice.performanceEffect < 0);
  return !hasPositive && hasNegative;
}

/** Find the comparable standard (non-math) cost choice for a saving label */
function mathSavingLabel(event: PendingClubEvent): string | null {
  const mathChoice = event.choices.find(c => c.requiresMath);
  if (!mathChoice || mathChoice.budgetEffect === undefined) return null;

  const stdChoice = event.choices.find(
    c => !c.requiresMath && c.budgetEffect !== undefined &&
         Math.sign(c.budgetEffect) === Math.sign(mathChoice.budgetEffect!)
  );
  if (!stdChoice || stdChoice.budgetEffect === undefined) return null;

  if (mathChoice.budgetEffect < 0) {
    const saving = Math.abs(stdChoice.budgetEffect) - Math.abs(mathChoice.budgetEffect);
    if (saving > 0) {
      return `Save ${Math.abs(saving / 100).toLocaleString('en-GB', {
        style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
      })} vs standard option`;
    }
  } else if (mathChoice.budgetEffect > 0) {
    const extra = Math.abs(mathChoice.budgetEffect) - Math.abs(stdChoice.budgetEffect);
    if (extra > 0) {
      return `Earn ${Math.abs(extra / 100).toLocaleString('en-GB', {
        style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
      })} more than standard offer`;
    }
  }

  return null;
}

/**
 * Inline maths challenge widget for chain events.
 * Shows the question, an answer input, and a submit button.
 * On correct answer: calls onCorrect(). On wrong: shows hint + retry.
 */
function MathsChallengeWidget({
  challenge,
  onCorrect,
  onWrong,
}: {
  challenge: NonNullable<PendingClubEvent['mathsChallenge']>;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [input, setInput] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);

  function handleSubmit() {
    const raw = parseFloat(input.replace(/[£%,\s]/g, ''));
    if (isNaN(raw)) return;
    const isCorrect = Math.abs(raw - challenge.answer) <= challenge.tolerance;
    setCorrect(isCorrect);
    setAttempted(true);
  }

  function handleConfirm() {
    if (correct) {
      onCorrect();
    } else {
      onWrong();
    }
  }

  return (
    <div className="mt-3 rounded-card border border-data-blue/30 bg-data-blue/5 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-data-blue">🧮 Work it out</span>
      </div>
      <p className="text-xs text-txt-primary leading-relaxed">{challenge.question}</p>

      {!attempted ? (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={challenge.unit ? `Answer in ${challenge.unit}` : 'Your answer'}
            className="flex-1 rounded-tag border border-data-blue/30 bg-bg-raised px-2 py-1.5 text-xs text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-data-blue"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-3 py-1.5 rounded-tag bg-data-blue text-white text-xs font-semibold disabled:opacity-40 hover:bg-data-blue/90 transition-colors"
          >
            Check
          </button>
        </div>
      ) : correct ? (
        <div className="rounded-tag bg-pitch-green/10 border border-pitch-green/30 px-2 py-1.5 flex items-center gap-1.5">
          <span className="text-xs font-semibold text-pitch-green">✓ Correct</span>
          <span className="text-xs text-txt-muted">— your choices reflect the full picture</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="rounded-tag bg-warn-amber/10 border border-warn-amber/30 px-2 py-1.5">
            <span className="text-xs font-semibold text-warn-amber">Not quite. </span>
            <span className="text-xs text-txt-muted">{challenge.hint}</span>
          </div>
          <button
            onClick={() => { setAttempted(false); setInput(''); setCorrect(null); }}
            className="text-xs text-data-blue underline underline-offset-2 self-start"
          >
            Try again
          </button>
        </div>
      )}

      {attempted && (
        <p className="text-xs2 text-txt-muted">
          {correct
            ? 'Proceed with your decision below.'
            : "You can still decide — but without the full numbers, your options may not be as favourable."}
        </p>
      )}

      {attempted && (
        <button
          onClick={handleConfirm}
          className="text-xs font-semibold text-txt-primary underline underline-offset-2 self-start"
        >
          Continue to decision →
        </button>
      )}
    </div>
  );
}

export function PendingEventCard({ event, dispatch, onError, onMathChallenge }: PendingEventCardProps) {
  // For chain events with a maths challenge, we gate choices behind the challenge
  const [mathsResult, setMathsResult] = useState<'correct' | 'wrong' | null>(
    event.mathsChallenge ? null : 'skip' as any
  );
  const choicesUnlocked = !event.mathsChallenge || mathsResult !== null;

  function handleChoice(choiceId: string) {
    const result = dispatch({
      type: 'RESOLVE_CLUB_EVENT',
      eventId: event.id,
      choiceId,
      mathsCorrect: mathsResult === 'correct' ? true : mathsResult === 'wrong' ? false : undefined,
    });
    if (result.error) onError(result.error);
  }

  const savingLabel = mathSavingLabel(event);
  const standardChoices = event.choices.filter(c => !c.requiresMath);
  const mathChoice = event.choices.find(c => c.requiresMath);
  const npcMeta = event.npc ? NPC_LABELS[event.npc] : null;

  return (
    <div
      className={[
        'card border',
        event.severity === 'major'
          ? 'border-alert-red/40 bg-alert-red/5'
          : 'border-warn-amber/30 bg-warn-amber/5',
      ].join(' ')}
    >
      {/* Header row: severity badge + title */}
      <div className="flex items-start gap-2 mb-1.5">
        <span
          className={[
            'badge shrink-0',
            event.severity === 'major'
              ? 'bg-alert-red/20 text-alert-red'
              : 'bg-warn-amber/20 text-warn-amber',
          ].join(' ')}
        >
          {event.severity === 'major' ? '🚨 URGENT' : '⚡ DECISION'}
        </span>
        <h3 className="text-sm font-semibold text-txt-primary">{event.title}</h3>
      </div>

      {/* Chain context + NPC attribution */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {event.chainId && event.hopNumber && event.chainLength && (
          <span className="text-xs2 text-txt-muted bg-bg-raised px-1.5 py-0.5 rounded-tag border border-bg-raised">
            Hop {event.hopNumber} of {event.chainLength}
          </span>
        )}
        {npcMeta && (
          <span className={`text-xs2 font-medium px-1.5 py-0.5 rounded-tag border ${npcMeta.colour}`}>
            {npcMeta.name}
          </span>
        )}
      </div>

      <p className="text-xs text-txt-muted mb-3 leading-relaxed">{event.description}</p>

      {/* Inline maths challenge for chain events */}
      {event.mathsChallenge && mathsResult === null && (
        <MathsChallengeWidget
          challenge={event.mathsChallenge}
          onCorrect={() => setMathsResult('correct')}
          onWrong={() => setMathsResult('wrong')}
        />
      )}

      {/* Maths result confirmation banner */}
      {event.mathsChallenge && mathsResult === 'correct' && (
        <div className="mb-3 rounded-tag bg-pitch-green/10 border border-pitch-green/30 px-2 py-1 text-xs text-pitch-green font-medium">
          ✓ Maths correct — full outcome unlocked
        </div>
      )}
      {event.mathsChallenge && mathsResult === 'wrong' && (
        <div className="mb-3 rounded-tag bg-warn-amber/10 border border-warn-amber/30 px-2 py-1 text-xs text-warn-amber font-medium">
          ⚠ Maths incomplete — outcomes may be less favourable
        </div>
      )}

      {/* Choices — shown after maths challenge is attempted (or no maths challenge) */}
      {choicesUnlocked && (
        <div className="flex flex-col gap-2">
          {/* Standard choices */}
          {standardChoices.map(choice => {
            const risky = isRiskyChoice(choice);
            return (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className={[
                  'text-left w-full rounded-card px-3 py-2.5 border transition-all duration-150 group',
                  risky
                    ? 'bg-warn-amber/5 border-warn-amber/20 hover:bg-warn-amber/10 hover:border-warn-amber/40'
                    : 'bg-bg-raised border-bg-raised hover:bg-data-blue/10 hover:border-data-blue/30',
                ].join(' ')}
              >
                <span className={[
                  'text-xs font-semibold transition-colors',
                  risky ? 'text-warn-amber' : 'text-txt-primary group-hover:text-data-blue',
                ].join(' ')}>
                  {risky ? `⚠ ${choice.label}` : choice.label}
                </span>
                <p className="text-xs2 text-txt-muted mt-0.5 leading-relaxed">{choice.description}</p>
                <EffectPills
                  budgetEffect={choice.budgetEffect}
                  reputationEffect={choice.reputationEffect}
                  performanceEffect={choice.performanceEffect}
                />
              </button>
            );
          })}

          {/* Math challenge CTA (legacy events without mathsChallenge) */}
          {mathChoice && !event.mathsChallenge && (
            <button
              onClick={() => onMathChallenge(event)}
              className="text-left w-full rounded-card px-3 py-2.5
                         bg-data-blue/10 border border-data-blue/30
                         hover:bg-data-blue/20 hover:border-data-blue/50
                         transition-all duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-data-blue">
                  🧮 Negotiate via Maths →
                </span>
                {event.severity === 'major' && (
                  <span className="text-xs2 text-data-blue/70 font-medium">Recommended</span>
                )}
              </div>
              <p className="text-xs2 text-txt-muted mt-0.5 leading-relaxed">{mathChoice.description}</p>
              {savingLabel && (
                <p className="text-xs2 text-pitch-green font-medium mt-1">{savingLabel}</p>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
