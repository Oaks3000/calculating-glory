/**
 * StadiumView — full-screen facility management.
 *
 * PR 4: Navigation wiring — clicking a core unit opens the appropriate
 * slide-over based on facility type and current level:
 *
 *  Level-0 plots        → FacilityUpgradeSlideOver (BuildPanel)
 *  STADIUM              → FixturesSlideOver
 *  TRAINING_GROUND      → TrainingFocusSlideOver
 *  MEDICAL_CENTER       → BackroomTeamSlideOver
 *  YOUTH_ACADEMY        → ScoutingSlideOver
 *  CLUB_OFFICE          → BoardConfidenceSlideOver
 *  CLUB_COMMERCIAL      →
 *  FOOD_AND_BEVERAGE    → FacilityUpgradeSlideOver (always)
 *  FAN_ZONE             →
 *  GROUNDS_SECURITY     →
 */

import { useState }                         from 'react';
import { GameState, GameCommand, FacilityType, formatMoney } from '@calculating-glory/domain';
import { IsometricBlueprint }               from '../isometric/IsometricBlueprint';
import { FacilityCard }                     from '../shared/FacilityCard';
import { SlideOver }                        from '../shared/SlideOver';
import { BackroomTeamSlideOver }            from '../command-centre/BackroomTeamSlideOver';
import { FacilityUpgradeSlideOver }         from './FacilityUpgradeSlideOver';
import { TrainingFocusSlideOver }           from './TrainingFocusSlideOver';
import { FixturesSlideOver }                from './FixturesSlideOver';
import { BoardConfidenceSlideOver }         from './BoardConfidenceSlideOver';
import { ScoutingSlideOver }                from './ScoutingSlideOver';
import { ScoutNetworkSlideOver }           from './ScoutNetworkSlideOver';

// Commercial facilities always open the upgrade panel (no dedicated nav destination)
const COMMERCIAL_TYPES = new Set<FacilityType>([
  'CLUB_COMMERCIAL',
  'FOOD_AND_BEVERAGE',
  'FAN_ZONE',
  'GROUNDS_SECURITY',
]);

interface StadiumViewProps {
  state:    GameState;
  dispatch: (cmd: GameCommand) => { error?: string };
  onError:  (msg: string) => void;
}

export function StadiumView({ state, dispatch, onError }: StadiumViewProps) {
  const { club } = state;

  // ── Slide-over open state ──────────────────────────────────────────────────
  const [upgradeTarget, setUpgradeTarget] = useState<FacilityType | null>(null);
  const [fixturesOpen,  setFixturesOpen]  = useState(false);
  const [trainingOpen,     setTrainingOpen]     = useState(false);
  const [backroomOpen,  setBackroomOpen]  = useState(false);
  const [boardOpen,        setBoardOpen]        = useState(false);
  const [scoutingOpen,     setScoutingOpen]     = useState(false);
  const [scoutNetworkOpen, setScoutNetworkOpen] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleUpgrade(facilityType: FacilityType) {
    const result = dispatch({
      type:         'UPGRADE_FACILITY',
      clubId:       club.id,
      facilityType,
    });
    if (result.error) onError(result.error);
  }

  function handleCoreUnitClick(facilityType: FacilityType) {
    const facility = club.facilities.find(f => f.type === facilityType);
    const level    = facility?.level ?? 0;

    // Commercial facilities and unbuilt (level-0) plots → upgrade/build panel
    if (COMMERCIAL_TYPES.has(facilityType) || level === 0) {
      setUpgradeTarget(facilityType);
      return;
    }

    // Level 1+ navigation facilities → type-specific slide-over
    switch (facilityType) {
      case 'STADIUM':         setFixturesOpen(true);  break;
      case 'TRAINING_GROUND': setTrainingOpen(true);     break;
      case 'MEDICAL_CENTER':  setBackroomOpen(true);  break;
      case 'YOUTH_ACADEMY':   setScoutingOpen(true);      break;
      case 'SCOUT_NETWORK':   setScoutNetworkOpen(true);  break;
      case 'CLUB_OFFICE':     setBoardOpen(true);         break;
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-col flex-1 overflow-y-auto">

        {/* ── Isometric stadium canvas ──────────────────────────────── */}
        <IsometricBlueprint
          state={state}
          dispatch={dispatch}
          onError={onError}
          onCoreUnitClick={handleCoreUnitClick}
        />

        {/* ── Below-fold detail panel ───────────────────────────────── */}
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

      {/* ── Slide-overs ──────────────────────────────────────────────────── */}

      {/* Upgrade / BuildPanel — commercial facilities + level-0 plots */}
      <FacilityUpgradeSlideOver
        facilityType={upgradeTarget}
        state={state}
        dispatch={dispatch}
        onError={onError}
        onClose={() => setUpgradeTarget(null)}
      />

      {/* STADIUM → Fixtures & League Standing */}
      <FixturesSlideOver
        isOpen={fixturesOpen}
        onClose={() => setFixturesOpen(false)}
        state={state}
      />

      {/* TRAINING_GROUND → Training Focus */}
      <TrainingFocusSlideOver
        isOpen={trainingOpen}
        onClose={() => setTrainingOpen(false)}
        state={state}
        dispatch={dispatch}
        onError={onError}
      />

      {/* MEDICAL_CENTER → Backroom Team */}
      <SlideOver
        isOpen={backroomOpen}
        onClose={() => setBackroomOpen(false)}
        title="🩺 Backroom Team"
      >
        <BackroomTeamSlideOver
          state={state}
          dispatch={dispatch}
          onError={onError}
        />
      </SlideOver>

      {/* YOUTH_ACADEMY → Scouting */}
      <ScoutingSlideOver
        isOpen={scoutingOpen}
        onClose={() => setScoutingOpen(false)}
        state={state}
      />

      {/* SCOUT_NETWORK → Scout Network */}
      <ScoutNetworkSlideOver
        isOpen={scoutNetworkOpen}
        onClose={() => setScoutNetworkOpen(false)}
        state={state}
        dispatch={dispatch}
      />

      {/* CLUB_OFFICE → Board Confidence */}
      <BoardConfidenceSlideOver
        isOpen={boardOpen}
        onClose={() => setBoardOpen(false)}
        state={state}
      />
    </>
  );
}
