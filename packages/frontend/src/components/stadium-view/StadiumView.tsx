import { GameState, GameCommand, FacilityType, formatMoney } from '@calculating-glory/domain';
import { FacilityCard } from '../shared/FacilityCard';
import { IsometricBlueprint } from '../isometric/IsometricBlueprint';

interface StadiumViewProps {
  state:    GameState;
  dispatch: (cmd: GameCommand) => { error?: string };
  onError:  (msg: string) => void;
}

export function StadiumView({ state, dispatch, onError }: StadiumViewProps) {
  const { club } = state;

  function handleUpgrade(facilityType: FacilityType) {
    const result = dispatch({
      type:         'UPGRADE_FACILITY',
      clubId:       club.id,
      facilityType,
    });
    if (result.error) onError(result.error);
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">

      {/* ── Isometric stadium canvas ──────────────────────────────── */}
      <IsometricBlueprint
        state={state}
        dispatch={dispatch}
        onError={onError}
        // Navigation wiring added in PR 4
        onCoreUnitClick={undefined}
      />

      {/* ── Below-fold detail panel ──────────────────────────────── */}
      <div className="flex flex-col gap-4 p-4">

        {/* Stadium header bar */}
        <div className="card flex items-center justify-between py-3 bg-pitch-green/5 border border-pitch-green/20">
          <div>
            <p className="text-sm font-semibold text-txt-primary">{club.stadium.name}</p>
            <p className="text-xs2 text-txt-muted">
              Capacity: {club.stadium.capacity.toLocaleString()} ·
              Avg attendance: {club.stadium.averageAttendance.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-txt-muted">Transfer Budget</span>
            <p className="data-font text-sm font-semibold text-pitch-green">
              {formatMoney(club.transferBudget)}
            </p>
          </div>
        </div>

        {/* Facility upgrade cards — 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    </div>
  );
}
