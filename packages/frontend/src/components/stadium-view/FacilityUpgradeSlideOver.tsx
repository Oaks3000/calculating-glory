/**
 * FacilityUpgradeSlideOver — shows a single FacilityCard in a slide-over panel.
 *
 * Used for:
 *  - Commercial facilities (CLUB_COMMERCIAL, FOOD_AND_BEVERAGE, FAN_ZONE,
 *    GROUNDS_SECURITY) which have no dedicated navigation destination
 *  - Level-0 plots for any facility type (BuildPanel: "Build — £X,XXX" CTA)
 */

import { FacilityType, GameState, GameCommand, FACILITY_CONFIG } from '@calculating-glory/domain';
import { SlideOver } from '../shared/SlideOver';
import { FacilityCard } from '../shared/FacilityCard';

interface FacilityUpgradeSlideOverProps {
  /** Null = closed */
  facilityType: FacilityType | null;
  state:        GameState;
  dispatch:     (cmd: GameCommand) => { error?: string };
  onError:      (msg: string) => void;
  onClose:      () => void;
}

export function FacilityUpgradeSlideOver({
  facilityType,
  state,
  dispatch,
  onError,
  onClose,
}: FacilityUpgradeSlideOverProps) {
  const { club } = state;
  const facility = facilityType ? club.facilities.find(f => f.type === facilityType) ?? null : null;
  const meta     = facilityType ? FACILITY_CONFIG[facilityType] : null;

  function handleUpgrade() {
    if (!facilityType) return;
    const result = dispatch({
      type:         'UPGRADE_FACILITY',
      clubId:       club.id,
      facilityType,
    });
    if (result.error) onError(result.error);
  }

  const isLevel0 = (facility?.level ?? 0) === 0;
  const title    = meta
    ? `${meta.icon} ${isLevel0 ? `Build ${meta.label}` : meta.label}`
    : 'Facility';

  return (
    <SlideOver isOpen={!!facilityType} onClose={onClose} title={title}>
      <div className="p-4 flex flex-col gap-4">

        {/* Build context banner (level 0 only) */}
        {isLevel0 && meta && (
          <div className="bg-data-blue/10 border border-data-blue/30 rounded-card px-3 py-2">
            <p className="text-xs2 text-data-blue">
              This plot is undeveloped. Invest to unlock {meta.label.toLowerCase()} benefits
              and add it to your stadium.
            </p>
          </div>
        )}

        {facility && (
          <FacilityCard
            facility={facility}
            budget={club.transferBudget}
            onUpgrade={handleUpgrade}
          />
        )}

      </div>
    </SlideOver>
  );
}
