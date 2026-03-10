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
}

export function ViewToggle({
  activeView,
  onViewChange,
  state,
  isLoading,
  dispatch,
  onError,
}: ViewToggleProps) {
  return (
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

      {/* Right: Week advance */}
      <WeekAdvanceButton
        pendingEvents={state.pendingEvents}
        currentWeek={state.currentWeek}
        season={state.season}
        isLoading={isLoading}
        dispatch={dispatch}
        onError={onError}
      />
    </div>
  );
}
