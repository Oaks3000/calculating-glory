import { GameState } from '@calculating-glory/domain';

interface BoardUltimatumModalProps {
  state: GameState;
  onDismiss: () => void;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function BoardUltimatumModal({ state, onDismiss }: BoardUltimatumModalProps) {
  const { boardUltimatum } = state;
  if (!boardUltimatum) return null;

  // Only show on the week the ultimatum was issued
  if (state.currentWeek !== boardUltimatum.issuedWeek) return null;

  const weeksLeft = boardUltimatum.deadlineWeek - boardUltimatum.issuedWeek;
  const playerEntry = state.league.entries.find(e => e.clubId === state.club.id);
  const currentPosition = playerEntry?.position ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70">
      <div className="max-w-md w-full space-y-5 bg-bg-raised border border-alert-red/40 rounded-card p-6 shadow-2xl">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-2xl font-bold text-alert-red tracking-tight">
            Board Ultimatum
          </h2>
          <p className="text-txt-muted text-sm">
            Season {state.season} · Week {state.currentWeek}
          </p>
        </div>

        {/* Message */}
        <div className="bg-alert-red/5 border border-alert-red/20 rounded-card p-4 space-y-2">
          <p className="text-sm text-txt-primary leading-relaxed">
            Board confidence has collapsed. The directors have lost faith in your
            leadership and are demanding immediate improvement.
          </p>
          <p className="text-sm text-txt-primary leading-relaxed">
            You have <span className="font-semibold text-warn-amber">{weeksLeft} weeks</span> to
            reach the <span className="font-semibold text-warn-amber">{ordinal(boardUltimatum.minimumPosition)} position</span> or
            better. Fail to meet this target and the board will act.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <p className="text-xs2 text-txt-muted uppercase tracking-wide mb-1">Current</p>
            <p className="text-xl font-bold data-font text-alert-red">
              {currentPosition > 0 ? ordinal(currentPosition) : '—'}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs2 text-txt-muted uppercase tracking-wide mb-1">Target</p>
            <p className="text-xl font-bold data-font text-warn-amber">
              {ordinal(boardUltimatum.minimumPosition)}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-xs2 text-txt-muted uppercase tracking-wide mb-1">Deadline</p>
            <p className="text-xl font-bold data-font text-txt-primary">
              Wk {boardUltimatum.deadlineWeek}
            </p>
          </div>
        </div>

        {/* Confidence indicator */}
        <div className="flex items-start gap-3 bg-warn-amber/10 border border-warn-amber/30 rounded-card p-3">
          <span className="text-base">📉</span>
          <p className="text-xs2 text-txt-muted leading-relaxed">
            Board confidence: <span className="text-alert-red font-semibold">{state.boardConfidence}</span>/100.
            Wins, strong finances, and key decisions will help rebuild it — but you need
            results on the pitch first.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-tag bg-alert-red text-white font-semibold text-sm
                     hover:bg-alert-red/80 active:scale-95 transition-all"
        >
          Understood — I'll turn this around
        </button>

      </div>
    </div>
  );
}
