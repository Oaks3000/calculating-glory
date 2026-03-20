/**
 * ScoutingSlideOver — youth academy and scouting stub.
 * Opened when the player clicks the Youth Academy core unit (level 1+).
 *
 * Full transfer market + scouting functionality planned for Phase 5.
 * This stub teases the future feature and shows current youth prospects.
 */

import { GameState, computeOverallRating } from '@calculating-glory/domain';
import { SlideOver } from '../shared/SlideOver';

interface ScoutingSlideOverProps {
  isOpen:  boolean;
  onClose: () => void;
  state:   GameState;
}

export function ScoutingSlideOver({ isOpen, onClose, state }: ScoutingSlideOverProps) {
  const { club } = state;

  // Show youngest players as "youth prospects"
  const youngsters = [...club.squad]
    .filter(p => p.age <= 21)
    .sort((a, b) => a.age - b.age)
    .slice(0, 6);

  const youthFacility = club.facilities.find(f => f.type === 'YOUTH_ACADEMY');
  const youthLevel    = youthFacility?.level ?? 0;

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="🌱 Youth Academy">
      <div className="flex flex-col gap-4 p-4">

        {/* Academy level */}
        <div className="card bg-bg-raised border border-bg-raised/50 flex items-center justify-between">
          <div>
            <p className="text-xs2 text-txt-muted uppercase tracking-wide">Academy Level</p>
            <p className="text-2xl font-black data-font text-pitch-green">{youthLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs2 text-txt-muted uppercase tracking-wide">Young Players</p>
            <p className="text-2xl font-black data-font text-txt-primary">{youngsters.length}</p>
          </div>
        </div>

        {/* Youth prospects */}
        {youngsters.length > 0 && (
          <div>
            <p className="text-xs text-txt-muted uppercase tracking-wide mb-2">
              Current Prospects (U21)
            </p>
            <div className="card flex flex-col divide-y divide-bg-raised/50">
              {youngsters.map(player => (
                <div key={player.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-txt-primary font-semibold">{player.name}</p>
                    <p className="text-xs2 text-txt-muted">
                      Age {player.age} · {player.position}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold data-font text-data-blue">
                      {computeOverallRating(player)}
                    </p>
                    <p className="text-xs2 text-txt-muted">OVR</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coming soon banner */}
        <div className="card border border-dashed border-data-blue/40 bg-data-blue/5">
          <p className="text-xs font-semibold text-data-blue mb-1">Transfer Market — Coming Soon</p>
          <p className="text-xs2 text-txt-muted">
            Scout and sign players from the transfer market in a future update.
            Upgrade your Youth Academy to improve the quality of prospects generated each season.
          </p>
        </div>

        {/* Upgrade prompt if low level */}
        {youthLevel < 3 && (
          <div className="card bg-bg-raised border border-warn-amber/20">
            <p className="text-xs2 text-warn-amber">
              💡 A higher Youth Academy level generates better prospects and
              unlocks access to international scouting networks.
            </p>
          </div>
        )}

      </div>
    </SlideOver>
  );
}
