import { GameState, GameCommand, FacilityType, FACILITY_CONFIG, formatMoney } from '@calculating-glory/domain';
import { FacilityCard } from '../shared/FacilityCard';

interface IsometricBlueprintProps {
  state: GameState;
  dispatch: (cmd: GameCommand) => { error?: string };
  onError: (msg: string) => void;
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

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Isometric header art */}
      <div className="card flex flex-col items-center justify-center py-6 gap-2 bg-pitch-green/5 border border-pitch-green/20">
        <div className="flex gap-2 text-4xl">
          {club.facilities.map(f => FACILITY_CONFIG[f.type]?.icon ?? '🏗').join('')}
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
