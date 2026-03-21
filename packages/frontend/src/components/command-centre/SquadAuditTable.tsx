import { GameState, formatMoney, Player, getScoutedPotential, scoutNoiseRange, getScoutLevel, isUnsettled, computeOverallRating } from '@calculating-glory/domain';

interface SquadAuditTableProps {
  state: GameState;
}

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const;

const POS_COLORS: Record<string, string> = {
  GK: 'text-warn-amber',
  DEF: 'text-pitch-green',
  MID: 'text-data-blue',
  FWD: 'text-alert-red',
};

function MoraleBar({ player }: { player: Player }) {
  const { morale } = player;
  const color =
    morale >= 70 ? 'bg-pitch-green' : morale >= 40 ? 'bg-warn-amber' : 'bg-alert-red';
  const unsettled = isUnsettled(player);
  return (
    <div className="flex items-center gap-1">
      <div className="w-10 h-1.5 bg-bg-raised rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${morale}%` }} />
      </div>
      {unsettled && (
        <span
          className="text-[9px] text-alert-red font-bold leading-none"
          title="Unsettled — performance debuffed"
        >
          !
        </span>
      )}
    </div>
  );
}

function PlayerRow({ player, scoutLevel }: { player: Player; scoutLevel: number }) {
  const statCol =
    player.position === 'FWD' || player.position === 'MID'
      ? player.stats.goals
      : player.stats.cleanSheets;
  const statLabel =
    player.position === 'FWD' || player.position === 'MID' ? 'G' : 'CS';

  const noise = scoutNoiseRange(scoutLevel);
  const scoutedPot = getScoutedPotential(player, scoutLevel);
  const potPrefix = noise >= 9 ? '~' : noise >= 3 ? '≈' : '';
  const potClass = noise === 0 ? 'text-purple-400' : noise <= 6 ? 'text-purple-400/60' : 'text-purple-400/35';

  return (
    <tr className="border-b border-bg-raised/50 hover:bg-bg-raised/30 transition-colors text-txt-muted">
      <td className="py-1 pr-2 truncate max-w-[130px] text-txt-primary">{player.name}</td>
      <td className={`pr-2 py-1 font-bold ${POS_COLORS[player.position]}`}>{player.position}</td>
      <td className="text-right pr-2 py-1 text-txt-primary font-semibold">{computeOverallRating(player)}</td>
      <td className={`text-right pr-2 py-1 font-semibold ${potClass}`} title={`Scout accuracy: ±${noise}`}>
        {potPrefix}{scoutedPot}
      </td>
      <td className="text-right pr-2 py-1">{player.age}</td>
      <td className="text-right pr-2 py-1">{player.stats.appearances}</td>
      <td className="text-right pr-2 py-1">
        <span title={statLabel === 'G' ? 'Goals' : 'Clean Sheets'}>
          {statCol}
          <span className="text-xs2 ml-0.5 text-txt-muted">{statLabel}</span>
        </span>
      </td>
      <td className="text-right pr-2 py-1">{player.stats.assists}
        <span className="text-xs2 ml-0.5 text-txt-muted">A</span>
      </td>
      <td className="text-right pr-3 py-1">{formatMoney(player.wage)}<span className="text-xs2 text-txt-muted">/wk</span></td>
      <td className="py-1">
        <MoraleBar player={player} />
      </td>
    </tr>
  );
}

export function SquadAuditTable({ state }: SquadAuditTableProps) {
  const { club } = state;
  const scoutLevel = getScoutLevel(club.facilities);

  const sorted = [...club.squad].sort((a, b) => {
    const pa = POSITION_ORDER.indexOf(a.position);
    const pb = POSITION_ORDER.indexOf(b.position);
    if (pa !== pb) return pa - pb;
    return computeOverallRating(b) - computeOverallRating(a);
  });

  const counts = POSITION_ORDER.reduce<Record<string, number>>((acc, pos) => {
    acc[pos] = club.squad.filter(p => p.position === pos).length;
    return acc;
  }, {});

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
          Squad ({club.squad.length})
        </h2>
        <div className="flex gap-2 text-xs2 data-font">
          {POSITION_ORDER.map(pos => (
            <span key={pos} className={POS_COLORS[pos]}>
              {counts[pos] ?? 0} {pos}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs data-font">
          <thead>
            <tr className="text-txt-muted border-b border-bg-raised text-left">
              <th className="pb-1 pr-2">Name</th>
              <th className="pb-1 pr-2">Pos</th>
              <th className="text-right pb-1 pr-2 w-8">OVR</th>
              <th className="text-right pb-1 pr-2 w-8 text-purple-400/60">POT</th>
              <th className="text-right pb-1 pr-2 w-8">Age</th>
              <th className="text-right pb-1 pr-2 w-8">App</th>
              <th className="text-right pb-1 pr-2 w-10">G/CS</th>
              <th className="text-right pb-1 pr-2 w-8">Ast</th>
              <th className="text-right pb-1 pr-3">Wage</th>
              <th className="pb-1 w-12">Morale</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(player => (
              <PlayerRow key={player.id} player={player} scoutLevel={scoutLevel} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
