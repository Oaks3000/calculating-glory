/**
 * TrainingFocusSlideOver — weekly training focus picker.
 *
 * Opened when the player clicks the Training Ground core unit (level 1+).
 * Shows 5 focus options; clicking one dispatches SET_TRAINING_FOCUS.
 * The current selection is highlighted.
 */

import { useState } from 'react';
import { GameState, GameCommand, TrainingFocus, TRAINING_FOCUS_CONFIG } from '@calculating-glory/domain';
import { SlideOver } from '../shared/SlideOver';
import { GeometryDrillCard } from './GeometryDrillCard';
import { generateChallenge } from '../social-feed/generateChallenge';

const ALL_FOCUSES = Object.keys(TRAINING_FOCUS_CONFIG) as TrainingFocus[];

interface TrainingFocusSlideOverProps {
  isOpen:   boolean;
  onClose:  () => void;
  state:    GameState;
  dispatch: (cmd: GameCommand) => { error?: string };
  onError:  (msg: string) => void;
}

export function TrainingFocusSlideOver({
  isOpen,
  onClose,
  state,
  dispatch,
  onError,
}: TrainingFocusSlideOverProps) {
  const currentFocus = state.club.trainingFocus;
  const trainingGround = state.club.facilities.find(f => f.type === 'TRAINING_GROUND');
  const groundLevel = trainingGround?.level ?? 0;

  // Geometry drill — cycle through challenges on "Next drill" clicks
  const [drillIndex, setDrillIndex] = useState(0);
  const geometryDrill = generateChallenge(state, drillIndex, undefined, 'geometry');

  function handleSelect(focus: TrainingFocus) {
    if (focus === currentFocus) return; // no-op if already selected
    const result = dispatch({ type: 'SET_TRAINING_FOCUS', focus });
    if (result.error) onError(result.error);
  }

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="⚽ Weekly Training Focus">
      <div className="flex flex-col h-full">

        {/* Context bar */}
        <div className="px-4 py-3 bg-bg-raised border-b border-bg-raised/50 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-txt-muted uppercase tracking-wide">Training Ground</span>
              <p className="text-lg font-semibold text-txt-primary data-font">
                Level {groundLevel}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-txt-muted uppercase tracking-wide">Current focus</span>
              <p className="text-sm font-semibold text-warn-amber mt-0.5">
                {currentFocus
                  ? TRAINING_FOCUS_CONFIG[currentFocus].label
                  : <span className="text-txt-muted italic font-normal">None set</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Focus options */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-txt-muted mb-3 uppercase tracking-wide">
            Choose this week's training priority
          </p>

          <div className="flex flex-col gap-2">
            {ALL_FOCUSES.map(focus => {
              const cfg       = TRAINING_FOCUS_CONFIG[focus];
              const isActive  = focus === currentFocus;

              return (
                <button
                  key={focus}
                  onClick={() => handleSelect(focus)}
                  className={[
                    'w-full text-left rounded-card border px-4 py-3 transition-colors',
                    isActive
                      ? 'bg-data-blue/10 border-data-blue/50 cursor-default'
                      : 'bg-bg-raised border-bg-raised hover:border-data-blue/30 hover:bg-bg-raised/80',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl leading-none mt-0.5">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-txt-primary">{cfg.label}</p>
                        {isActive && (
                          <span className="text-xs bg-data-blue/20 text-data-blue rounded px-1.5 py-0.5">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-txt-muted mt-0.5">{cfg.description}</p>
                      <p className="text-xs2 text-pitch-green mt-1">{cfg.effect}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-xs2 text-txt-muted mt-4 italic">
            Training focus resets each week. Choose before advancing to apply the bonus.
          </p>

          {/* Groundskeeper's Drill — geometry practice, shown when ground is built */}
          {groundLevel >= 1 && (
            <div className="mt-6">
              <p className="text-xs text-txt-muted uppercase tracking-wide mb-3">
                Groundskeeper's Drill
              </p>
              <GeometryDrillCard
                challenge={geometryDrill}
                onRefresh={() => setDrillIndex(i => i + 1)}
              />
            </div>
          )}
        </div>

      </div>
    </SlideOver>
  );
}
