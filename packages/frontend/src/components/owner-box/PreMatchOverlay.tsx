import {
  GameState,
  generateSeasonFixtures,
  getWeekFixtures,
} from '@calculating-glory/domain';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PreMatchOverlayProps {
  state: GameState;
  onKickOff: () => void;
  onCancel: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const colour =
    result === 'W' ? 'bg-pitch-green' :
    result === 'D' ? 'bg-warn-amber' :
    'bg-alert-red';
  const label =
    result === 'W' ? 'Win' :
    result === 'D' ? 'Draw' : 'Loss';
  return (
    <span
      title={label}
      className={`w-4 h-4 rounded-full ${colour} inline-block`}
    />
  );
}

function FormRow({ form, label }: { form: ('W' | 'D' | 'L')[]; label: string }) {
  const last5 = form.slice(-5);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-txt-muted w-20 shrink-0 text-right">{label}</span>
      <div className="flex gap-1">
        {last5.length === 0
          ? <span className="text-xs text-txt-muted">No results yet</span>
          : last5.map((r, i) => <FormDot key={i} result={r} />)
        }
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PreMatchOverlay({ state, onKickOff, onCancel }: PreMatchOverlayProps) {
  const nextWeek = state.currentWeek + 1;

  // Compute next week's fixture for the player's club
  const teamIds = state.league.entries.map(e => e.clubId);
  const seed = `calculating-glory-mvp-v1-w${nextWeek}`;
  const allFixtures = generateSeasonFixtures({ teamIds, season: state.season, seed });
  const weekFixtures = getWeekFixtures(allFixtures, nextWeek);
  const myFixture = weekFixtures?.fixtures.find(
    f => f.homeTeamId === state.club.id || f.awayTeamId === state.club.id,
  );

  const isHome = myFixture?.homeTeamId === state.club.id;
  const opponentId = isHome ? myFixture?.awayTeamId : myFixture?.homeTeamId;
  const opponentEntry = state.league.entries.find(e => e.clubId === opponentId);
  const opponentName = opponentEntry?.clubName ?? 'Unknown';

  const myEntry = state.league.entries.find(e => e.clubId === state.club.id);
  const myPosition = myEntry?.position ?? '—';
  const opponentPosition = opponentEntry?.position ?? '—';
  const myForm = myEntry?.form ?? [];
  const opponentForm = opponentEntry?.form ?? [];

  return (
    <div className="fixed inset-0 bg-bg-deep flex flex-col z-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-bg-raised">
        <span className="text-xs font-bold text-txt-muted uppercase tracking-widest">
          Match Day — Week {nextWeek}
        </span>
        <button
          onClick={onCancel}
          className="text-xs text-txt-muted hover:text-txt-primary transition-colors"
        >
          ✕ Cancel
        </button>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">

        {/* Teams header */}
        <div className="flex items-center gap-6 w-full max-w-sm">
          {/* Home team */}
          <div className="flex-1 text-right">
            <p className={`font-bold text-base ${isHome ? 'text-txt-primary' : 'text-txt-muted'}`}>
              {state.club.name}
            </p>
            <p className="text-xs text-txt-muted">
              {isHome ? 'Home' : 'Away'} · {myPosition === '—' ? '' : `${myPosition}${ordinal(Number(myPosition))}`}
            </p>
          </div>

          <div className="text-center shrink-0">
            <div className="text-2xl font-bold text-txt-muted">vs</div>
          </div>

          {/* Away team */}
          <div className="flex-1 text-left">
            <p className={`font-bold text-base ${!isHome ? 'text-txt-primary' : 'text-txt-muted'}`}>
              {opponentName}
            </p>
            <p className="text-xs text-txt-muted">
              {!isHome ? 'Home' : 'Away'} · {opponentPosition === '—' ? '' : `${opponentPosition}${ordinal(Number(opponentPosition))}`}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full max-w-sm border-t border-bg-raised" />

        {/* Form rows */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider text-center">Recent form</p>
          <FormRow form={myForm} label={state.club.name} />
          <FormRow form={opponentForm} label={opponentName} />
        </div>

        {/* Pre-match flavour */}
        <p className="text-sm text-txt-muted text-center max-w-xs">
          {getFlavorText(myForm, opponentForm, isHome)}
        </p>
      </div>

      {/* ── Kick off button ────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-6 border-t border-bg-raised flex flex-col gap-2">
        <button
          onClick={onKickOff}
          className="w-full py-4 rounded-card bg-pitch-green text-bg-deep text-base font-bold
                     hover:bg-pitch-green/80 active:scale-95 transition-all duration-150 tracking-wide"
        >
          KICK OFF →
        </button>
        <p className="text-center text-xs text-txt-muted">
          Kev will be watching from the stands
        </p>
      </div>
    </div>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

function getFlavorText(
  myForm: ('W' | 'D' | 'L')[],
  opponentForm: ('W' | 'D' | 'L')[],
  isHome: boolean,
): string {
  const recentMine = myForm.slice(-3);
  const recentOpp = opponentForm.slice(-3);
  const myWins = recentMine.filter(r => r === 'W').length;
  const oppWins = recentOpp.filter(r => r === 'W').length;

  if (myWins === 3) return 'You\'re on fire — can you make it four in a row?';
  if (myWins === 0 && recentMine.length >= 3) return 'The players need you behind them today.';
  if (oppWins === 3) return 'They\'re in great form. A big test for the squad.';
  if (isHome) return 'The fans expect a performance at home today.';
  return 'Nothing to lose on the road. Go and get something.';
}
