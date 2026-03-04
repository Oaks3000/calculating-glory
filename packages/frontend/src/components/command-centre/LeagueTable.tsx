import { LeagueTableEntry } from '@calculating-glory/domain';

interface LeagueTableProps {
  entries: LeagueTableEntry[];
  playerClubId: string;
  promotionCutoff: number;
  relegationStart: number;
}

const FORM_COLORS: Record<string, string> = {
  W: 'bg-pitch-green text-white',
  D: 'bg-warn-amber text-white',
  L: 'bg-alert-red text-white',
};

export function LeagueTable({ entries, playerClubId, promotionCutoff, relegationStart }: LeagueTableProps) {
  return (
    <div className="card overflow-hidden">
      <h2 className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-3">
        League Table
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs data-font">
          <thead>
            <tr className="text-txt-muted border-b border-bg-raised">
              <th className="text-right pr-2 pb-1 w-6">#</th>
              <th className="text-left pb-1">Club</th>
              <th className="text-right pr-1 pb-1 w-6">P</th>
              <th className="text-right pr-1 pb-1 w-6">W</th>
              <th className="text-right pr-1 pb-1 w-6">D</th>
              <th className="text-right pr-1 pb-1 w-6">L</th>
              <th className="text-right pr-1 pb-1 w-8">GF</th>
              <th className="text-right pr-1 pb-1 w-8">GA</th>
              <th className="text-right pr-2 pb-1 w-8">GD</th>
              <th className="text-right pr-2 pb-1 w-8">Pts</th>
              <th className="text-left pb-1 w-20">Form</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const isPlayer = entry.clubId === playerClubId;
              const isPromotion = entry.position <= promotionCutoff;
              const isPlayoff = entry.position > promotionCutoff && entry.position <= 7;
              const isRelegation = entry.position >= relegationStart;

              return (
                <tr
                  key={entry.clubId}
                  className={[
                    'border-b border-bg-raised/50 transition-colors',
                    isPlayer ? 'bg-data-blue/10 text-txt-primary font-medium' : 'text-txt-muted',
                    i === promotionCutoff ? 'border-b-2 border-data-blue/40' : '',
                    i === 6 ? 'border-b-2 border-warn-amber/40' : '',
                    i === relegationStart - 2 ? 'border-b-2 border-alert-red/40' : '',
                  ].join(' ')}
                >
                  <td className="text-right pr-2 py-1">
                    <span className={[
                      'inline-block w-4 text-center',
                      isPromotion ? 'text-pitch-green' : isPlayoff ? 'text-warn-amber' : isRelegation ? 'text-alert-red' : '',
                    ].join(' ')}>
                      {entry.position}
                    </span>
                  </td>
                  <td className="py-1 truncate max-w-[120px]">
                    {isPlayer ? `▶ ${entry.clubName}` : entry.clubName}
                  </td>
                  <td className="text-right pr-1 py-1">{entry.played}</td>
                  <td className="text-right pr-1 py-1">{entry.won}</td>
                  <td className="text-right pr-1 py-1">{entry.drawn}</td>
                  <td className="text-right pr-1 py-1">{entry.lost}</td>
                  <td className="text-right pr-1 py-1">{entry.goalsFor}</td>
                  <td className="text-right pr-1 py-1">{entry.goalsAgainst}</td>
                  <td className={[
                    'text-right pr-2 py-1',
                    entry.goalDifference > 0 ? 'text-pitch-green' : entry.goalDifference < 0 ? 'text-alert-red' : '',
                  ].join(' ')}>
                    {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                  </td>
                  <td className="text-right pr-2 py-1 font-semibold text-txt-primary">{entry.points}</td>
                  <td className="py-1">
                    <div className="flex gap-0.5">
                      {entry.form.slice(-5).map((r, j) => (
                        <span key={j} className={`${FORM_COLORS[r]} text-xs2 w-4 h-4 flex items-center justify-center rounded-sm font-bold`}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 mt-2 text-xs2 text-txt-muted">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pitch-green inline-block" /> Promotion</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warn-amber inline-block" /> Playoff</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-alert-red inline-block" /> Relegation</span>
      </div>
    </div>
  );
}
