import { Manager, formatMoney } from '@calculating-glory/domain';

interface ManagerPickerProps {
  managers: Manager[];
  selected: Manager | null;
  onSelect: (manager: Manager) => void;
  wageBudgetRemaining: number;
}

/**
 * Stat bar — 0-100 value rendered as a narrow filled bar.
 */
function StatBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value);
  const colour =
    pct >= 70 ? 'bg-pitch-green' :
    pct >= 45 ? 'bg-warn-amber' :
    'bg-alert-red';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-txt-muted w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-bg-raised rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colour}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-txt-muted w-6 text-right">{pct}</span>
    </div>
  );
}

function ManagerCard({
  manager,
  selected,
  affordable,
  onSelect,
}: {
  manager: Manager;
  selected: boolean;
  affordable: boolean;
  onSelect: () => void;
}) {
  const avgRating = Math.round(
    (manager.attributes.tactical +
      manager.attributes.motivation +
      manager.attributes.experience) /
      3
  );

  const tier =
    avgRating >= 70 ? { label: 'Elite', colour: 'text-data-blue' } :
    avgRating >= 50 ? { label: 'Experienced', colour: 'text-warn-amber' } :
    { label: 'Journeyman', colour: 'text-txt-muted' };

  return (
    <button
      onClick={affordable ? onSelect : undefined}
      disabled={!affordable}
      className={[
        'w-full text-left p-4 rounded-card border transition-all',
        selected
          ? 'border-data-blue bg-data-blue/10'
          : affordable
            ? 'border-white/10 bg-bg-surface hover:border-white/20 hover:bg-bg-raised'
            : 'border-white/5 bg-bg-surface opacity-50 cursor-not-allowed',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-txt-primary">{manager.name}</span>
            <span className={`text-xs ${tier.colour}`}>{tier.label}</span>
          </div>
          <div className="text-xs text-txt-muted mt-0.5">
            {formatMoney(manager.wage)}/wk
            <span className="mx-1.5 text-white/20">·</span>
            {manager.contractLengthWeeks / 52} season contract
            {!affordable && (
              <span className="ml-2 text-alert-red">over budget</span>
            )}
          </div>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-data-blue flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <StatBar value={manager.attributes.tactical} label="Tactical" />
        <StatBar value={manager.attributes.motivation} label="Motivation" />
        <StatBar value={manager.attributes.experience} label="Experience" />
      </div>
    </button>
  );
}

export function ManagerPicker({
  managers,
  selected,
  onSelect,
  wageBudgetRemaining,
}: ManagerPickerProps) {
  // Sort: elite first (highest avg), then mid, then budget
  const sorted = [...managers].sort((a, b) => {
    const avgA = (a.attributes.tactical + a.attributes.motivation + a.attributes.experience) / 3;
    const avgB = (b.attributes.tactical + b.attributes.motivation + b.attributes.experience) / 3;
    return avgB - avgA;
  });

  return (
    <div className="space-y-3">
      <div className="bg-bg-surface rounded-card p-4 border border-white/5 text-sm text-txt-muted space-y-1">
        <p>
          <span className="text-txt-primary font-medium">Tactical</span> — determines how
          effectively your training focus translates on match day.
        </p>
        <p>
          <span className="text-txt-primary font-medium">Motivation</span> — affects squad morale
          week-on-week. A poor motivator will quietly erode performance.
        </p>
        <p>
          <span className="text-txt-primary font-medium">Experience</span> — base performance boost.
          Seasoned managers get more out of the same squad.
        </p>
      </div>

      <div className="space-y-2">
        {sorted.map(manager => (
          <ManagerCard
            key={manager.id}
            manager={manager}
            selected={selected?.id === manager.id}
            affordable={manager.wage <= wageBudgetRemaining}
            onSelect={() => onSelect(manager)}
          />
        ))}
      </div>
    </div>
  );
}
