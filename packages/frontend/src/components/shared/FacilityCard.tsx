import { Facility, FacilityType, FACILITY_CONFIG, formatMoney, constructionDuration } from '@calculating-glory/domain';

const LEVEL_LABELS = ['Derelict', 'Basic', 'Decent', 'Good', 'Excellent', 'World-Class'];

export function LevelPips({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={[
            'w-2 h-2 rounded-full',
            i < level ? 'bg-pitch-green' : 'bg-bg-raised',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export function FacilityCard({
  facility,
  budget,
  onUpgrade,
}: {
  facility: Facility;
  budget: number;
  onUpgrade: () => void;
}) {
  const meta = FACILITY_CONFIG[facility.type];
  const isBuilding = (facility.constructionWeeksRemaining ?? 0) > 0;
  const isMaxLevel = facility.level >= 5;
  const canAfford = facility.upgradeCost <= budget;
  const canUpgrade = !isMaxLevel && !isBuilding && canAfford;

  return (
    <div
      className={[
        'card flex flex-col gap-3 border',
        isMaxLevel
          ? 'border-pitch-green/30'
          : canAfford
          ? 'border-data-blue/30 hover:border-data-blue/60 transition-colors'
          : 'border-transparent',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-3xl">{meta.icon}</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-txt-primary">{meta.label}</h3>
          <p className="text-xs2 text-txt-muted mt-0.5">{meta.description}</p>
        </div>
        {isMaxLevel && (
          <span className="badge bg-pitch-green/20 text-pitch-green text-xs2">MAX</span>
        )}
      </div>

      {/* Level */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs2 text-txt-muted uppercase tracking-wide">Level</span>
          <span className="text-sm font-semibold text-txt-primary data-font">
            {facility.level} — {LEVEL_LABELS[facility.level]}
          </span>
        </div>
        <LevelPips level={facility.level} />
      </div>

      {/* Benefit */}
      <div className="flex items-center gap-2 bg-bg-raised rounded-tag px-2 py-1">
        <span className="text-xs2 text-txt-muted">Benefit:</span>
        <span className="text-xs2 text-data-blue">
          +{facility.benefit.improvement}% {facility.benefit.type.replace('_', ' ')} per level
        </span>
      </div>

      {/* Construction in progress */}
      {isBuilding && (() => {
        const targetLevel = facility.level + 1;
        const totalWeeks  = constructionDuration(targetLevel);
        const weeksLeft   = facility.constructionWeeksRemaining!;
        const progress    = Math.round(((totalWeeks - weeksLeft) / totalWeeks) * 100);
        return (
          <div className="flex flex-col gap-1.5 pt-1 border-t border-bg-raised">
            <div className="flex items-center gap-2">
              <span className="text-base">🏗</span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-warn-amber">Under Construction</span>
                <span className="text-xs2 text-txt-muted ml-1.5">
                  — {weeksLeft} week{weeksLeft === 1 ? '' : 's'} remaining
                </span>
              </div>
              <span className="text-xs2 text-warn-amber font-semibold data-font shrink-0">{progress}%</span>
            </div>
            <div className="h-1.5 bg-bg-deep rounded-full overflow-hidden">
              <div
                className="h-full bg-warn-amber rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })()}

      {/* Upgrade section */}
      {!isMaxLevel && !isBuilding && (
        <div className="flex items-center justify-between pt-1 border-t border-bg-raised">
          <div>
            <span className="text-xs2 text-txt-muted">Upgrade cost: </span>
            <span
              className={`text-xs font-semibold data-font ${
                canAfford ? 'text-txt-primary' : 'text-alert-red'
              }`}
            >
              {formatMoney(facility.upgradeCost)}
            </span>
            {!canAfford && (
              <span className="text-xs2 text-alert-red ml-1">(insufficient funds)</span>
            )}
          </div>
          <button
            onClick={onUpgrade}
            disabled={!canUpgrade}
            className={[
              'px-3 py-1 rounded-tag text-xs font-semibold transition-all duration-150',
              canUpgrade
                ? 'bg-data-blue text-white hover:bg-data-blue/80 active:scale-95'
                : 'bg-bg-raised text-txt-muted cursor-not-allowed',
            ].join(' ')}
          >
            {facility.level === 0 ? 'Build' : 'Upgrade'}
          </button>
        </div>
      )}
    </div>
  );
}
