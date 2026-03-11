/**
 * SquadAuditSlideOver — full squad roster in a slide-over panel.
 * Opened when the player clicks the Training Ground core unit (level 1+).
 */

import { GameState } from '@calculating-glory/domain';
import { SlideOver } from '../shared/SlideOver';
import { SquadAuditTable } from '../command-centre/SquadAuditTable';

interface SquadAuditSlideOverProps {
  isOpen:  boolean;
  onClose: () => void;
  state:   GameState;
}

export function SquadAuditSlideOver({ isOpen, onClose, state }: SquadAuditSlideOverProps) {
  const { club } = state;

  // Squad summary stats
  const avgRating = club.squad.length
    ? Math.round(club.squad.reduce((s, p) => s + p.overallRating, 0) / club.squad.length)
    : 0;
  const totalWages = club.squad.reduce((s, p) => s + p.wage, 0);

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="🏃 Squad Audit">
      <div className="flex flex-col h-full">

        {/* Summary bar */}
        <div className="px-4 py-3 bg-bg-raised border-b border-bg-raised/50 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-txt-muted uppercase tracking-wide">Players</span>
              <p className="text-lg font-semibold text-txt-primary data-font">
                {club.squad.length}
              </p>
            </div>
            <div className="text-center">
              <span className="text-xs text-txt-muted uppercase tracking-wide">Avg OVR</span>
              <p className="text-lg font-semibold text-data-blue data-font">{avgRating}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-txt-muted uppercase tracking-wide">Wage bill</span>
              <p className="text-lg font-semibold text-warn-amber data-font">
                £{Math.round(totalWages / 100).toLocaleString()}
                <span className="text-txt-muted text-sm font-normal">/wk</span>
              </p>
            </div>
          </div>
        </div>

        {/* Squad table */}
        <div className="flex-1 overflow-y-auto p-4">
          <SquadAuditTable state={state} />
        </div>

      </div>
    </SlideOver>
  );
}
