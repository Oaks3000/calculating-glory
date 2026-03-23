import { useState } from 'react';
import { GameState, GameCommand, PendingClubEvent } from '@calculating-glory/domain';
import { WeekAdvanceButton } from '../command-centre/WeekAdvanceButton';

export type ActiveView = 'command' | 'stadium';

interface ViewToggleProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  state: GameState;
  isLoading: boolean;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
  onResetGame: () => void;
}

export function ViewToggle({
  activeView,
  onViewChange,
  state,
  isLoading,
  dispatch,
  onError,
  onResetGame,
}: ViewToggleProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b border-bg-raised bg-bg-surface">
        {/* Left: Club info */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-txt-primary tracking-tight">
              {state.club.name}
            </h1>
            <p className="text-xs text-txt-muted">
              Season {state.season} · Week {state.currentWeek} ·{' '}
              <span className="capitalize">{state.phase.replace('_', ' ').toLowerCase()}</span>
            </p>
          </div>
        </div>

        {/* Centre: View toggle */}
        <div className="flex items-center gap-1 bg-bg-raised rounded-card p-1">
          <button
            onClick={() => onViewChange('command')}
            className={[
              'px-3 py-1.5 rounded-tag text-xs font-semibold transition-all duration-150',
              activeView === 'command'
                ? 'bg-bg-surface text-txt-primary shadow-sm'
                : 'text-txt-muted hover:text-txt-primary',
            ].join(' ')}
          >
            Command Centre
          </button>
          <button
            onClick={() => onViewChange('stadium')}
            className={[
              'px-3 py-1.5 rounded-tag text-xs font-semibold transition-all duration-150',
              activeView === 'stadium'
                ? 'bg-bg-surface text-txt-primary shadow-sm'
                : 'text-txt-muted hover:text-txt-primary',
            ].join(' ')}
          >
            Stadium View
          </button>
        </div>

        {/* Right: New game + week advance */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfirm(true)}
            className="text-xs text-txt-muted hover:text-txt-primary transition-colors duration-150"
          >
            New Game
          </button>
          <WeekAdvanceButton
            pendingEvents={state.pendingEvents}
            currentWeek={state.currentWeek}
            season={state.season}
            isLoading={isLoading}
            dispatch={dispatch}
            onError={onError}
          />
        </div>
      </div>

      {/* New game confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-bg-deep/80 flex items-center justify-center z-50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="card max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-txt-primary mb-1">Start a new game?</h2>
            <p className="text-sm text-txt-muted mb-4">
              Your current save will be permanently wiped. This can't be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-tag text-sm text-txt-muted hover:text-txt-primary transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={onResetGame}
                className="px-4 py-2 rounded-tag text-sm font-semibold bg-alert-red/20 text-alert-red hover:bg-alert-red/30 transition-colors duration-150"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
