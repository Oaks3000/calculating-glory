import { Player, Position, Formation, FORMATION_CONFIG, formatMoney } from '@calculating-glory/domain';

interface InheritedSquadProps {
  squad: Player[];
  formation: Formation | null;
}

const POSITION_ORDER: Position[] = ['GK', 'DEF', 'MID', 'FWD'];
const POSITION_COLOUR: Record<Position, string> = {
  GK:  'bg-warn-amber/20 text-warn-amber',
  DEF: 'bg-data-blue/20 text-data-blue',
  MID: 'bg-pitch-green/20 text-pitch-green',
  FWD: 'bg-alert-red/20 text-alert-red',
};

function ratingColour(r: number): string {
  if (r >= 60) return 'text-pitch-green';
  if (r >= 50) return 'text-warn-amber';
  return 'text-alert-red';
}

function RatingBar({ rating }: { rating: number }) {
  const pct = Math.round((rating / 100) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-mono font-bold w-6 ${ratingColour(rating)}`}>{rating}</span>
      <div className="flex-1 h-1.5 bg-bg-deep rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${rating >= 60 ? 'bg-pitch-green' : rating >= 50 ? 'bg-warn-amber' : 'bg-alert-red'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function InheritedSquad({ squad, formation }: InheritedSquadProps) {
  const sorted = [...squad].sort(
    (a, b) => POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position)
  );

  // How many of each position the formation wants
  const targets = formation ? FORMATION_CONFIG[formation].slots : null;
  const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of squad) counts[p.position]++;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-txt-primary">Inherited Squad</h3>
        <span className="text-xs text-txt-muted">{squad.length} / 24 slots</span>
      </div>
      <p className="text-xs text-txt-muted mb-3">
        Promoted from non-league. Most of these lads need replacing before you're relegated on day one.
      </p>

      {/* Position coverage vs formation */}
      {targets && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {POSITION_ORDER.map(pos => {
            const have = counts[pos];
            const want = targets[pos];
            const ok = have >= want;
            return (
              <div key={pos} className="bg-bg-deep rounded-card p-2 text-center">
                <div className={`text-lg font-bold font-mono ${ok ? 'text-pitch-green' : 'text-alert-red'}`}>
                  {have}/{want}
                </div>
                <div className="text-xs2 text-txt-muted">{pos}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-1">
        {sorted.map(player => (
          <div
            key={player.id}
            className="flex items-center gap-3 bg-bg-raised rounded-lg px-3 py-2"
          >
            <span className={`text-xs2 font-bold px-1.5 py-0.5 rounded-tag w-8 text-center ${POSITION_COLOUR[player.position]}`}>
              {player.position}
            </span>
            <span className="flex-1 text-sm text-txt-primary truncate">{player.name}</span>
            <span className="text-xs text-txt-muted w-6 text-center">{player.age}</span>
            <div className="w-28">
              <RatingBar rating={player.overallRating} />
            </div>
            <span className="text-xs text-txt-muted w-16 text-right font-mono">
              {formatMoney(player.wage)}<span className="text-xs2">/wk</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
