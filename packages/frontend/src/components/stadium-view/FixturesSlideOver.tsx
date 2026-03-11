/**
 * FixturesSlideOver — league standing and recent form panel.
 * Opened when the player clicks the Stadium / Pitch core unit (level 1+).
 *
 * Shows: club's current position, form strip, mini league table.
 * Full fixture schedule will be wired in a later PR once the season
 * calendar surface is accessible from game state.
 */

import { GameState } from '@calculating-glory/domain';
import { SlideOver } from '../shared/SlideOver';

interface FixturesSlideOverProps {
  isOpen:  boolean;
  onClose: () => void;
  state:   GameState;
}

const FORM_COLORS: Record<string, string> = {
  W: 'bg-pitch-green text-white',
  D: 'bg-warn-amber  text-bg-deep',
  L: 'bg-alert-red  text-white',
};

const PHASE_LABELS: Record<string, string> = {
  PRE_SEASON:    'Pre-Season',
  EARLY_SEASON:  'Early Season',
  MID_SEASON:    'Mid-Season',
  LATE_SEASON:   'Late Season',
  SEASON_END:    'Season End',
};

export function FixturesSlideOver({ isOpen, onClose, state }: FixturesSlideOverProps) {
  const { club, league, currentWeek, phase } = state;

  const myEntry = league.entries.find(e => e.clubId === club.id);
  const promotion = league.automaticPromotion;   // e.g. 3
  const playoff   = league.playoffPositions;     // [4,5,6,7]
  const relZone   = league.relegation;           // [23,24]

  function rowClass(pos: number): string {
    if (pos <= promotion)              return 'bg-pitch-green/10';
    if (playoff.includes(pos as never)) return 'bg-data-blue/8';
    if (relZone.includes(pos as never)) return 'bg-alert-red/10';
    return '';
  }

  function positionBadge(pos: number): string {
    if (pos <= promotion)              return 'text-pitch-green font-bold';
    if (playoff.includes(pos as never)) return 'text-data-blue  font-semibold';
    if (relZone.includes(pos as never)) return 'text-alert-red  font-semibold';
    return 'text-txt-muted';
  }

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="⚽ Stadium & Fixtures">
      <div className="flex flex-col gap-4 p-4">

        {/* Season context */}
        <div className="flex items-center justify-between text-xs text-txt-muted">
          <span>Season {state.season} · Week {currentWeek} of 46</span>
          <span className="badge bg-bg-raised text-txt-muted">{PHASE_LABELS[phase] ?? phase}</span>
        </div>

        {/* Club standing hero card */}
        {myEntry && (
          <div className="card bg-bg-raised border border-bg-raised/50">
            <div className="flex items-center gap-4">
              <div className="text-center shrink-0">
                <p className="text-3xl font-black data-font text-txt-primary">
                  {myEntry.position}
                </p>
                <p className="text-xs2 text-txt-muted uppercase tracking-wide">Position</p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-txt-primary">{club.name}</p>
                <p className="text-xs2 text-txt-muted">{club.stadium.name}</p>
                <p className="text-xs2 text-txt-muted mt-0.5">
                  {myEntry.played}G · {myEntry.won}W {myEntry.drawn}D {myEntry.lost}L ·
                  GD {myEntry.goalDifference >= 0 ? '+' : ''}{myEntry.goalDifference}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black data-font text-pitch-green">{myEntry.points}</p>
                <p className="text-xs2 text-txt-muted">pts</p>
              </div>
            </div>
          </div>
        )}

        {/* Form strip */}
        {club.form.length > 0 && (
          <div>
            <p className="text-xs text-txt-muted uppercase tracking-wide mb-2">
              Recent Form (last {club.form.length})
            </p>
            <div className="flex gap-1.5">
              {club.form.map((r, i) => (
                <span
                  key={i}
                  className={[
                    'w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center data-font',
                    FORM_COLORS[r] ?? 'bg-bg-raised text-txt-muted',
                  ].join(' ')}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mini league table */}
        <div>
          <p className="text-xs text-txt-muted uppercase tracking-wide mb-2">League Two</p>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-xs data-font">
              <thead>
                <tr className="text-txt-muted border-b border-bg-raised text-left">
                  <th className="px-2 py-1.5 w-6">#</th>
                  <th className="px-2 py-1.5">Club</th>
                  <th className="text-right px-2 py-1.5 w-7">P</th>
                  <th className="text-right px-2 py-1.5 w-7">GD</th>
                  <th className="text-right px-2 py-1.5 w-7">Pts</th>
                </tr>
              </thead>
              <tbody>
                {league.entries.map(entry => (
                  <tr
                    key={entry.clubId}
                    className={[
                      'border-b border-bg-raised/30 last:border-0',
                      entry.clubId === club.id ? 'bg-data-blue/15 font-semibold' : rowClass(entry.position),
                    ].join(' ')}
                  >
                    <td className={`px-2 py-1 ${positionBadge(entry.position)}`}>
                      {entry.position}
                    </td>
                    <td className={`px-2 py-1 truncate max-w-[140px] ${entry.clubId === club.id ? 'text-txt-primary' : 'text-txt-muted'}`}>
                      {entry.clubName}
                    </td>
                    <td className="text-right px-2 py-1 text-txt-muted">{entry.played}</td>
                    <td className="text-right px-2 py-1 text-txt-muted">
                      {entry.goalDifference >= 0 ? '+' : ''}{entry.goalDifference}
                    </td>
                    <td className={`text-right px-2 py-1 ${entry.clubId === club.id ? 'text-pitch-green' : 'text-txt-primary'}`}>
                      {entry.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Zone key */}
          <div className="flex gap-3 mt-2 text-xs2 text-txt-muted">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-pitch-green/40" />
              Auto promotion (top {promotion})
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-data-blue/40" />
              Play-offs
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-alert-red/40" />
              Relegation
            </span>
          </div>
        </div>

      </div>
    </SlideOver>
  );
}
