import { useState } from 'react';
import { LeagueTableEntry, LeagueTable as LeagueTableType } from '@calculating-glory/domain';

interface LeagueTableProps {
  entries: LeagueTableEntry[];
  playerClubId: string;
  promotionCutoff: number;
  relegationStart: number;
  previousLeagueTable?: LeagueTableType;
}

const FORM_COLORS: Record<string, string> = {
  W: 'bg-pitch-green text-white',
  D: 'bg-warn-amber text-white',
  L: 'bg-alert-red text-white',
};

function TableRows({
  entries,
  playerClubId,
  promotionCutoff,
  relegationStart,
}: {
  entries: LeagueTableEntry[];
  playerClubId: string;
  promotionCutoff: number;
  relegationStart: number;
}) {
  return (
    <>
      {entries.map((entry, i) => {
        const isPlayer    = entry.clubId === playerClubId;
        const isPromotion = entry.position <= promotionCutoff;
        const isPlayoff   = entry.position > promotionCutoff && entry.position <= 7;
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
            <td className={[
              'text-right pr-2 py-1',
              entry.goalDifference > 0 ? 'text-pitch-green' : entry.goalDifference < 0 ? 'text-alert-red' : '',
            ].join(' ')}>
              {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
            </td>
            <td className="text-right pr-2 py-1 font-semibold text-txt-primary">{entry.points}</td>
            <td className="py-1">
              <div className="flex gap-0.5">
                {entry.form.slice(-3).map((r, j) => (
                  <span key={j} className={`${FORM_COLORS[r]} text-xs2 w-4 h-4 flex items-center justify-center rounded-sm font-bold`}>
                    {r}
                  </span>
                ))}
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}

export function LeagueTable({ entries, playerClubId, promotionCutoff, relegationStart, previousLeagueTable }: LeagueTableProps) {
  const [tab, setTab] = useState<'current' | 'previous'>('current');

  const showingPrevious = tab === 'previous' && !!previousLeagueTable;
  const activeEntries = showingPrevious ? previousLeagueTable!.entries : entries;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
          League Table
        </h2>
        {previousLeagueTable && (
          <div className="flex gap-1">
            <button
              onClick={() => setTab('current')}
              className={[
                'px-2 py-0.5 rounded-tag text-xs2 font-medium transition-colors',
                tab === 'current'
                  ? 'bg-data-blue/20 text-data-blue'
                  : 'text-txt-muted hover:text-txt-primary',
              ].join(' ')}
            >
              This Season
            </button>
            <button
              onClick={() => setTab('previous')}
              className={[
                'px-2 py-0.5 rounded-tag text-xs2 font-medium transition-colors',
                tab === 'previous'
                  ? 'bg-data-blue/20 text-data-blue'
                  : 'text-txt-muted hover:text-txt-primary',
              ].join(' ')}
            >
              Last Season
            </button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs data-font">
          <thead>
            <tr className="text-txt-muted border-b border-bg-raised">
              <th className="text-right pr-2 pb-1 w-6">#</th>
              <th className="text-left pb-1">Club</th>
              <th className="text-right pr-1 pb-1 w-6">P</th>
              <th className="text-right pr-1 pb-1 w-6">W</th>
              <th className="text-right pr-2 pb-1 w-8">GD</th>
              <th className="text-right pr-2 pb-1 w-8">Pts</th>
              <th className="text-left pb-1 w-14">Form</th>
            </tr>
          </thead>
          <tbody>
            <TableRows
              entries={activeEntries}
              playerClubId={playerClubId}
              promotionCutoff={promotionCutoff}
              relegationStart={relegationStart}
            />
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
