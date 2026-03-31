import { useState } from 'react';
import {
  GameState,
  GameCommand,
  PendingClubEvent,
  CurriculumLevel,
  CURRICULUM_LEVELS,
  getAllCurriculumLevels,
} from '@calculating-glory/domain';
import { WeekAdvanceButton } from '../command-centre/WeekAdvanceButton';

export type ActiveView = 'command' | 'stadium';

interface ViewToggleProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  state: GameState;
  isLoading: boolean;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
  onResetGame: (curriculumLevel: CurriculumLevel) => void;
  onPreMatch?: () => void;
}

/** Format pence as a compact £ string: 50000000 → "£500k", 500000000 → "£5m" */
function fmtBudget(pence: number): string {
  const pounds = pence / 100;
  if (pounds >= 1_000_000) return `£${pounds / 1_000_000}m`;
  if (pounds >= 1_000)     return `£${pounds / 1_000}k`;
  return `£${pounds}`;
}

const LEAGUE_DISPLAY: Record<string, string> = {
  LEAGUE_TWO:   'League Two',
  LEAGUE_ONE:   'League One',
  CHAMPIONSHIP: 'Championship',
  PREMIER_LEAGUE: 'Premier League',
};

export function ViewToggle({
  activeView,
  onViewChange,
  state,
  isLoading,
  dispatch,
  onError,
  onResetGame,
  onPreMatch,
}: ViewToggleProps) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'pick'>('idle');
  const [selected, setSelected] = useState<CurriculumLevel>('YEAR_7');

  const levels = getAllCurriculumLevels();

  function handleStartFresh() {
    onResetGame(selected);
    setStep('idle');
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 border-b border-bg-raised bg-bg-surface">
        {/* Left: Club info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-txt-primary tracking-tight truncate max-w-[120px] sm:max-w-none">
              {state.club.name}
            </h1>
            <p className="text-xs text-txt-muted hidden sm:block">
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
            onClick={() => setStep('confirm')}
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
            onPreMatch={onPreMatch}
          />
        </div>
      </div>

      {/* Step 1: Confirm wipe */}
      {step === 'confirm' && (
        <div
          className="fixed inset-0 bg-bg-deep/80 flex items-center justify-center z-50"
          onClick={() => setStep('idle')}
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
                onClick={() => setStep('idle')}
                className="px-4 py-2 rounded-tag text-sm text-txt-muted hover:text-txt-primary transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('pick')}
                className="px-4 py-2 rounded-tag text-sm font-semibold bg-alert-red/20 text-alert-red hover:bg-alert-red/30 transition-colors duration-150"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Year group picker */}
      {step === 'pick' && (
        <div
          className="fixed inset-0 bg-bg-deep/80 flex items-center justify-center z-50"
          onClick={() => setStep('idle')}
        >
          <div
            className="card max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-base font-bold text-txt-primary mb-1">Choose your year group</h2>
            <p className="text-sm text-txt-muted mb-4">
              This sets your maths level. Higher year groups start with bigger budgets and can
              reach higher divisions — but the maths is harder. You can always come back and
              start again.
            </p>

            <div className="flex flex-col gap-2 mb-4">
              {levels.map(config => {
                const isSelected = selected === config.level;
                return (
                  <button
                    key={config.level}
                    onClick={() => setSelected(config.level)}
                    className={[
                      'flex items-center justify-between px-4 py-3 rounded-card border text-left transition-all duration-150',
                      isSelected
                        ? 'border-accent-blue bg-accent-blue/10 text-txt-primary'
                        : 'border-bg-raised bg-bg-raised text-txt-muted hover:border-accent-blue/40 hover:text-txt-primary',
                    ].join(' ')}
                  >
                    <span className="font-semibold text-sm">{config.displayName}</span>
                    <span className="text-xs tabular-nums">
                      {LEAGUE_DISPLAY[config.leagueLevel]} access · {fmtBudget(config.budgetScale.transferBudget)} budget
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setStep('idle')}
                className="px-4 py-2 rounded-tag text-sm text-txt-muted hover:text-txt-primary transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleStartFresh}
                className="px-4 py-2 rounded-tag text-sm font-semibold bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 transition-colors duration-150"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
