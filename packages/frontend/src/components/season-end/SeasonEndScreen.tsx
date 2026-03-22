import { GameState, GameCommand, formatMoney } from '@calculating-glory/domain';

interface SeasonEndScreenProps {
  state: GameState;
  dispatch: (command: GameCommand) => { error?: string };
}

// ─── Outcome helpers ───────────────────────────────────────────────────────────

function getOutcome(position: number, promoted: boolean, relegated: boolean) {
  if (promoted) return { label: 'PROMOTED', colour: 'text-pitch-green', bg: 'bg-pitch-green/10 border-pitch-green/40', emoji: '🏆', sub: 'Earning promotion to League One' };
  if (relegated) return { label: 'RELEGATED', colour: 'text-alert-red', bg: 'bg-alert-red/10 border-alert-red/40', emoji: '📉', sub: 'Dropping out of League Two' };
  if (position <= 7) return { label: 'PLAYOFFS', colour: 'text-warn-amber', bg: 'bg-warn-amber/10 border-warn-amber/40', emoji: '⚔️', sub: 'Into the promotion playoffs' };
  return { label: 'MID-TABLE', colour: 'text-data-blue', bg: 'bg-data-blue/10 border-data-blue/40', emoji: '🤝', sub: 'A season of consolidation' };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SeasonEndScreen({ state, dispatch }: SeasonEndScreenProps) {
  const { club, league, season } = state;

  // Find the SEASON_ENDED event for final position + promotion/relegation
  const seasonEndedEvent = [...state.events]
    .reverse()
    .find(e => e.type === 'SEASON_ENDED');

  const finalPosition = (seasonEndedEvent as any)?.finalPosition
    ?? league.entries.find(e => e.clubId === club.id)?.position
    ?? 0;
  const promoted: boolean = (seasonEndedEvent as any)?.promoted ?? false;
  const relegated: boolean = (seasonEndedEvent as any)?.relegated ?? false;

  const outcome = getOutcome(finalPosition, promoted, relegated);

  // Player's club league entry
  const clubEntry = league.entries.find(e => e.clubId === club.id);

  function handleBeginNextSeason() {
    dispatch({ type: 'BEGIN_NEXT_SEASON' });
  }

  return (
    <div className="min-h-screen bg-bg-deep text-txt-primary flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-8 pb-4 text-center flex flex-col items-center gap-2">
        <div className="text-xs font-bold text-txt-muted uppercase tracking-widest">
          Season {season} Complete
        </div>
        <h1 className="text-2xl font-bold text-txt-primary">{club.name}</h1>
        <div className={`text-4xl font-black mt-1 ${outcome.colour}`}>
          {outcome.emoji} {outcome.label}
        </div>
        <div className="text-lg text-txt-muted">
          Finished <span className="text-txt-primary font-semibold">{ordinal(finalPosition)}</span> — {outcome.sub}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 flex flex-col gap-4 max-w-2xl mx-auto w-full">

        {/* ── Season stats ───────────────────────────────────────────────── */}
        {clubEntry && (
          <div className="bg-bg-raised rounded-card border border-white/5 p-4">
            <div className="text-xs font-bold text-txt-muted uppercase tracking-widest mb-3">Season Stats</div>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-txt-primary">{clubEntry.played}</div>
                <div className="text-[10px] text-txt-muted uppercase">Played</div>
              </div>
              <div>
                <div className="text-xl font-bold text-pitch-green">{clubEntry.won}</div>
                <div className="text-[10px] text-txt-muted uppercase">Won</div>
              </div>
              <div>
                <div className="text-xl font-bold text-warn-amber">{clubEntry.drawn}</div>
                <div className="text-[10px] text-txt-muted uppercase">Drawn</div>
              </div>
              <div>
                <div className="text-xl font-bold text-alert-red">{clubEntry.lost}</div>
                <div className="text-[10px] text-txt-muted uppercase">Lost</div>
              </div>
              <div>
                <div className="text-xl font-bold text-txt-primary">{clubEntry.goalsFor}</div>
                <div className="text-[10px] text-txt-muted uppercase">Goals For</div>
              </div>
              <div>
                <div className="text-xl font-bold text-txt-primary">{clubEntry.goalsAgainst}</div>
                <div className="text-[10px] text-txt-muted uppercase">Goals Against</div>
              </div>
              <div>
                <div className={`text-xl font-bold ${clubEntry.goalDifference >= 0 ? 'text-pitch-green' : 'text-alert-red'}`}>
                  {clubEntry.goalDifference >= 0 ? '+' : ''}{clubEntry.goalDifference}
                </div>
                <div className="text-[10px] text-txt-muted uppercase">GD</div>
              </div>
              <div>
                <div className="text-xl font-bold text-data-blue">{clubEntry.points}</div>
                <div className="text-[10px] text-txt-muted uppercase">Points</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Club snapshot ──────────────────────────────────────────────── */}
        <div className="bg-bg-raised rounded-card border border-white/5 p-4">
          <div className="text-xs font-bold text-txt-muted uppercase tracking-widest mb-3">Club at Season End</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-pitch-green">{formatMoney(club.transferBudget)}</div>
              <div className="text-[10px] text-txt-muted uppercase">Transfer Budget</div>
            </div>
            <div>
              <div className="text-lg font-bold text-data-blue">{club.squad.length}</div>
              <div className="text-[10px] text-txt-muted uppercase">Squad Size</div>
            </div>
            <div>
              <div className="text-lg font-bold text-txt-primary">{club.reputation}</div>
              <div className="text-[10px] text-txt-muted uppercase">Reputation</div>
            </div>
          </div>
        </div>

        {/* ── Final league table ─────────────────────────────────────────── */}
        <div className="bg-bg-raised rounded-card border border-white/5 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/5 text-xs font-bold text-txt-muted uppercase tracking-widest">
            Final Table
          </div>
          <div className="divide-y divide-white/5">
            {league.entries.map(entry => {
              const isPlayer = entry.clubId === club.id;
              const isPromo = entry.position <= league.automaticPromotion;
              const isPlayoff = league.playoffPositions.includes(entry.position);
              const isRele = league.relegation.includes(entry.position);

              return (
                <div
                  key={entry.clubId}
                  className={`flex items-center gap-3 px-3 py-1.5 text-xs ${
                    isPlayer ? 'bg-data-blue/10' : ''
                  }`}
                >
                  {/* Position */}
                  <span className={`w-5 text-right font-bold shrink-0 ${
                    isPromo ? 'text-pitch-green' :
                    isPlayoff ? 'text-warn-amber' :
                    isRele ? 'text-alert-red' :
                    'text-txt-muted'
                  }`}>
                    {entry.position}
                  </span>

                  {/* Name */}
                  <span className={`flex-1 truncate ${isPlayer ? 'font-bold text-data-blue' : 'text-txt-primary'}`}>
                    {entry.clubName}
                    {isPlayer && <span className="ml-1 text-[10px] text-data-blue/70">★</span>}
                  </span>

                  {/* Stats */}
                  <span className="text-txt-muted w-5 text-right">{entry.played}</span>
                  <span className="text-pitch-green w-5 text-right">{entry.won}</span>
                  <span className="text-warn-amber w-5 text-right">{entry.drawn}</span>
                  <span className="text-alert-red w-5 text-right">{entry.lost}</span>
                  <span className={`w-7 text-right font-bold ${entry.goalDifference >= 0 ? 'text-txt-primary' : 'text-txt-muted'}`}>
                    {entry.goalDifference >= 0 ? '+' : ''}{entry.goalDifference}
                  </span>
                  <span className="text-data-blue font-bold w-6 text-right">{entry.points}</span>
                </div>
              );
            })}
          </div>

          {/* Table key */}
          <div className="px-4 py-2 border-t border-white/5 flex gap-4 text-[10px] text-txt-muted">
            <span><span className="text-pitch-green font-bold">■</span> Promotion</span>
            <span><span className="text-warn-amber font-bold">■</span> Playoff</span>
            <span><span className="text-alert-red font-bold">■</span> Relegation</span>
          </div>
        </div>
      </div>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-deep border-t border-white/5">
        <button
          onClick={handleBeginNextSeason}
          className="w-full max-w-2xl mx-auto block py-3 rounded-card bg-data-blue text-white font-bold text-sm hover:bg-data-blue/80 transition-colors"
        >
          Begin Pre-Season — Season {season + 1} →
        </button>
      </div>
    </div>
  );
}
