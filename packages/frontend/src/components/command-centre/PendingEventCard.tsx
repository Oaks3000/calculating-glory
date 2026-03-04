import { PendingClubEvent, GameCommand } from '@calculating-glory/domain';

interface PendingEventCardProps {
  event: PendingClubEvent;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
  onMathChallenge: (event: PendingClubEvent) => void;
}

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

export function PendingEventCard({ event, dispatch, onError, onMathChallenge }: PendingEventCardProps) {
  function handleChoice(choiceId: string) {
    const result = dispatch({
      type: 'RESOLVE_CLUB_EVENT',
      eventId: event.id,
      choiceId,
    });
    if (result.error) onError(result.error);
  }

  const savingLabel = mathSavingLabel(event);
  const standardChoices = event.choices.filter(c => !c.requiresMath);
  const mathChoice = event.choices.find(c => c.requiresMath);

  return (
    <div
      className={[
        'card border',
        event.severity === 'major'
          ? 'border-alert-red/40 bg-alert-red/5'
          : 'border-warn-amber/30 bg-warn-amber/5',
      ].join(' ')}
    >
      <div className="flex items-start gap-2 mb-2">
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
      <p className="text-xs text-txt-muted mb-3 leading-relaxed">{event.description}</p>

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

        {/* Math challenge CTA */}
        {mathChoice && (
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
    </div>
  );
}
