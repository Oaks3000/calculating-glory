/**
 * PreMatchScreen — shown between "Advance to Week" and the Owner's Box.
 *
 * Gives the player a moment of anticipation before the result lands:
 * your side, their side, current form, and a "Kick Off" button.
 */

interface PreMatchScreenProps {
  week: number;
  playerTeamName: string;
  opponentTeamName: string;
  isHome: boolean;
  myPosition: number;
  myForm: ('W' | 'D' | 'L')[];
  opponentPosition: number;
  opponentForm: ('W' | 'D' | 'L')[];
  onKickOff: () => void;
}

const FORM_BG: Record<'W' | 'D' | 'L', string> = {
  W: 'bg-pitch-green text-white',
  D: 'bg-warn-amber text-bg-deep',
  L: 'bg-alert-red text-white',
};

function FormStrip({ form }: { form: ('W' | 'D' | 'L')[] }) {
  if (form.length === 0) {
    return <span className="text-xs text-txt-muted italic">No results yet</span>;
  }
  return (
    <div className="flex gap-1">
      {form.map((r, i) => (
        <span
          key={i}
          className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs2 font-bold ${FORM_BG[r]}`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

function TeamCard({
  name,
  position,
  form,
  isPlayerTeam,
  side,
}: {
  name: string;
  position: number;
  form: ('W' | 'D' | 'L')[];
  isPlayerTeam: boolean;
  side: 'home' | 'away';
}) {
  const sideLabel = side === 'home' ? 'HOME' : 'AWAY';
  return (
    <div
      className={[
        'flex-1 rounded-card p-4 flex flex-col gap-3',
        isPlayerTeam
          ? 'bg-data-blue/10 border border-data-blue/30'
          : 'bg-bg-raised border border-bg-raised/50',
        side === 'away' ? 'items-end text-right' : 'items-start text-left',
      ].join(' ')}
    >
      <span className="text-xs2 uppercase tracking-widest text-txt-muted font-semibold">
        {sideLabel}
      </span>
      <p
        className={`text-sm font-bold leading-tight ${isPlayerTeam ? 'text-data-blue' : 'text-txt-primary'}`}
      >
        {name}
      </p>
      <div className={`flex flex-col gap-1.5 ${side === 'away' ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-txt-muted">Pos</span>
          <span className="text-xs font-bold text-txt-primary data-font">{position}</span>
        </div>
        <div className={`flex gap-1 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
          {form.length === 0 ? (
            <span className="text-xs2 text-txt-muted italic">—</span>
          ) : (
            form.map((r, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs2 font-bold ${FORM_BG[r]}`}
              >
                {r}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function PreMatchScreen({
  week,
  playerTeamName,
  opponentTeamName,
  isHome,
  myPosition,
  myForm,
  opponentPosition,
  opponentForm,
  onKickOff,
}: PreMatchScreenProps) {
  const homeTeam = isHome ? playerTeamName : opponentTeamName;
  const awayTeam = isHome ? opponentTeamName : playerTeamName;
  const homePos  = isHome ? myPosition      : opponentPosition;
  const awayPos  = isHome ? opponentPosition : myPosition;
  const homeForm = isHome ? myForm           : opponentForm;
  const awayForm = isHome ? opponentForm      : myForm;

  return (
    <div className="fixed inset-0 bg-bg-deep flex flex-col z-50 overflow-hidden">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-bg-raised">
        <span className="text-xs font-semibold text-txt-muted uppercase tracking-widest">
          Match Day
        </span>
        <span className="text-xs font-mono text-txt-muted">
          Week {week}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">

        {/* VS badge */}
        <div className="text-center">
          <p className="text-xs2 uppercase tracking-widest text-txt-muted font-semibold mb-1">
            Kick-off
          </p>
          <div className="w-12 h-12 rounded-full bg-bg-raised border border-bg-raised/60 flex items-center justify-center">
            <span className="text-xs font-bold text-txt-muted">VS</span>
          </div>
        </div>

        {/* Team cards */}
        <div className="w-full max-w-sm flex gap-3">
          <TeamCard
            name={homeTeam}
            position={homePos}
            form={homeForm}
            isPlayerTeam={isHome}
            side="home"
          />
          <TeamCard
            name={awayTeam}
            position={awayPos}
            form={awayForm}
            isPlayerTeam={!isHome}
            side="away"
          />
        </div>

        {/* Form legend */}
        <div className="flex items-center gap-4 text-xs2 text-txt-muted">
          <span>Last 5 results</span>
          <FormStrip form={['W', 'D', 'L']} />
        </div>
      </div>

      {/* Kick off button */}
      <div className="shrink-0 px-4 py-6 border-t border-bg-raised">
        <button
          onClick={onKickOff}
          className="w-full py-4 rounded-card bg-data-blue text-white font-bold text-base
                     hover:bg-data-blue/80 active:scale-95 transition-all duration-150 tracking-wide"
        >
          Kick Off
        </button>
      </div>
    </div>
  );
}
