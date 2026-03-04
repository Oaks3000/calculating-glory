import { GameState, GameCommand, formatMoney } from '@calculating-glory/domain';
import { Facility, FacilityType } from '@calculating-glory/domain';

interface IsometricBlueprintProps {
  state: GameState;
  dispatch: (cmd: GameCommand) => { error?: string };
  onError: (msg: string) => void;
}

const FACILITY_META: Record<FacilityType, { icon: string; label: string; description: string }> = {
  TRAINING_GROUND: {
    icon: '⚽',
    label: 'Training Ground',
    description: 'Improves squad performance week-on-week.',
  },
  MEDICAL_CENTER: {
    icon: '🏥',
    label: 'Medical Centre',
    description: 'Reduces injury risk and speeds recovery.',
  },
  YOUTH_ACADEMY: {
    icon: '🎓',
    label: 'Youth Academy',
    description: 'Produces better young players each season.',
  },
  STADIUM: {
    icon: '🏟',
    label: 'Stadium',
    description: 'Boosts matchday revenue and atmosphere.',
  },
};

const LEVEL_LABELS = ['Derelict', 'Basic', 'Decent', 'Good', 'Excellent', 'World-Class'];

function LevelPips({ level }: { level: number }) {
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

function FacilityCard({
  facility,
  budget,
  onUpgrade,
}: {
  facility: Facility;
  budget: number;
  onUpgrade: () => void;
}) {
  const meta = FACILITY_META[facility.type];
  const isMaxLevel = facility.level >= 5;
  const canAfford = facility.upgradeCost <= budget;
  const canUpgrade = !isMaxLevel && canAfford;

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

      {/* Upgrade section */}
      {!isMaxLevel && (
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
            Upgrade →
          </button>
        </div>
      )}
    </div>
  );
}

export function IsometricBlueprint({ state, dispatch, onError }: IsometricBlueprintProps) {
  const { club } = state;

  function handleUpgrade(facilityType: FacilityType) {
    const result = dispatch({
      type: 'UPGRADE_FACILITY',
      clubId: club.id,
      facilityType,
    });
    if (result.error) onError(result.error);
  }

  // Isometric "stadium" SVG placeholder — simple isometric box grid
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Isometric header art */}
      <div className="card flex flex-col items-center justify-center py-6 gap-2 bg-pitch-green/5 border border-pitch-green/20">
        <div className="flex gap-2 text-4xl">
          {club.facilities.map(f => FACILITY_META[f.type]?.icon ?? '🏗').join('')}
        </div>
        <p className="text-sm font-semibold text-txt-primary">{club.stadium.name}</p>
        <p className="text-xs2 text-txt-muted">
          Capacity: {club.stadium.capacity.toLocaleString()} ·
          Avg attendance: {club.stadium.averageAttendance.toLocaleString()}
        </p>
        <p className="text-xs2 text-txt-muted italic mt-1">
          Full 3D isometric view coming in next sprint
        </p>
      </div>

      {/* Budget banner */}
      <div className="flex items-center justify-between px-4 py-2 bg-bg-raised rounded-card">
        <span className="text-xs text-txt-muted">Transfer Budget</span>
        <span className="data-font text-sm font-semibold text-pitch-green">
          {formatMoney(club.transferBudget)}
        </span>
      </div>

      {/* Facility cards */}
      <div className="flex flex-col gap-3">
        {club.facilities.map(facility => (
          <FacilityCard
            key={facility.type}
            facility={facility}
            budget={club.transferBudget}
            onUpgrade={() => handleUpgrade(facility.type)}
          />
        ))}
      </div>
    </div>
  );
}
