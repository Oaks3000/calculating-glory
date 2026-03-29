import { GameState, formatMoney } from '@calculating-glory/domain';

interface Props {
  state: GameState;
  hasSave: boolean;
  onContinue: () => void;
  onNewGame: () => void;
}

function phaseLabel(phase: GameState['phase']): string {
  switch (phase) {
    case 'PRE_SEASON':    return 'Pre-Season';
    case 'EARLY_SEASON':  return 'Early Season';
    case 'MID_SEASON':    return 'Mid Season';
    case 'LATE_SEASON':   return 'Late Season';
    case 'SEASON_END':    return 'Season End';
    default:              return 'In Progress';
  }
}

export function MenuScreen({ state, hasSave, onContinue, onNewGame }: Props) {
  return (
    <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center px-6">

      {/* Title block */}
      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-[0.3em] text-data-blue mb-3 font-semibold">
          Football Finance Simulator
        </div>
        <h1 className="text-5xl font-bold text-txt-primary tracking-tight leading-none mb-4">
          Calculating<br />Glory
        </h1>
        <p className="text-txt-muted text-sm max-w-xs mx-auto leading-relaxed">
          You're the owner. Every decision comes back to money. Keep the bar green.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">

        {/* Continue — only shown when save exists */}
        {hasSave && (
          <button
            onClick={onContinue}
            className="w-full bg-data-blue hover:bg-data-blue/90 active:scale-[0.98] text-white
                       rounded-card px-6 py-4 text-left transition-all duration-150 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-base leading-tight">Continue</div>
                <div className="text-blue-200 text-xs mt-0.5 font-mono">
                  {state.club.name}
                  {' · '}
                  {phaseLabel(state.phase)}
                  {['EARLY_SEASON', 'MID_SEASON', 'LATE_SEASON'].includes(state.phase) ? ` · Wk ${state.currentWeek}` : ''}
                  {' · '}
                  S{state.season}
                </div>
              </div>
              <div className="text-white/60 group-hover:text-white/90 transition-colors text-lg">→</div>
            </div>
            <div className="mt-2 text-blue-200/70 text-xs font-mono">
              Budget: {formatMoney(state.club.transferBudget)}
            </div>
          </button>
        )}

        {/* New Game */}
        <button
          onClick={onNewGame}
          className={`w-full rounded-card px-6 py-4 text-left transition-all duration-150 group
            ${hasSave
              ? 'bg-bg-surface hover:bg-bg-raised border border-bg-raised text-txt-primary'
              : 'bg-data-blue hover:bg-data-blue/90 active:scale-[0.98] text-white'
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-base leading-tight">New Game</div>
              <div className={`text-xs mt-0.5 ${hasSave ? 'text-txt-muted' : 'text-blue-200'}`}>
                {hasSave ? 'Overwrites your current save' : 'Start your first season'}
              </div>
            </div>
            <div className={`text-lg transition-colors ${hasSave ? 'text-txt-muted group-hover:text-txt-primary' : 'text-white/60 group-hover:text-white/90'}`}>→</div>
          </div>
        </button>

      </div>

      {/* Footer */}
      <div className="mt-16 text-txt-muted text-xs text-center opacity-40">
        Calculating Glory
      </div>

    </div>
  );
}
