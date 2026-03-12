/**
 * BoardConfidenceSlideOver — board confidence and business acumen panel.
 * Opened when the player clicks the Club Office core unit (level 1+).
 *
 * Shows: board confidence bar, acumen star ratings, season context,
 * and guidance on what affects each metric.
 */

import { GameState } from '@calculating-glory/domain';
import { SlideOver } from '../shared/SlideOver';

interface BoardConfidenceSlideOverProps {
  isOpen:  boolean;
  onClose: () => void;
  state:   GameState;
}

function StarRow({ label, value }: { label: string; value: number }) {
  const stars = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <div className="flex items-center justify-between py-2 border-b border-bg-raised last:border-0">
      <span className="text-xs text-txt-muted">{label}</span>
      <span className="text-warn-amber data-font tracking-wider text-sm">
        {'★'.repeat(stars)}
        <span className="opacity-25">{'★'.repeat(5 - stars)}</span>
      </span>
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct   = Math.min(100, Math.max(0, value));
  const color = pct >= 70 ? 'bg-pitch-green' : pct >= 40 ? 'bg-warn-amber' : 'bg-alert-red';
  const label = pct >= 70 ? 'Confident' : pct >= 40 ? 'Cautious' : 'Concerned';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <span className="text-xs text-txt-muted uppercase tracking-wide">Board Confidence</span>
        <span className="text-2xl font-black data-font text-txt-primary">{pct}</span>
      </div>
      <div className="h-2.5 bg-bg-raised rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs font-semibold ${
        pct >= 70 ? 'text-pitch-green' : pct >= 40 ? 'text-warn-amber' : 'text-alert-red'
      }`}>
        {label} — {label === 'Confident' ? 'Board is backing your decisions.' : label === 'Cautious' ? 'Results expected soon.' : 'Board patience is running low.'}
      </p>
    </div>
  );
}

export function BoardConfidenceSlideOver({ isOpen, onClose, state }: BoardConfidenceSlideOverProps) {
  const { boardConfidence, businessAcumen, currentWeek, phase, season } = state;

  const myEntry = state.league.entries.find(e => e.clubId === state.club.id);

  const PHASE_LABELS: Record<string, string> = {
    PRE_SEASON:   'Pre-Season',
    EARLY_SEASON: 'Early Season',
    MID_SEASON:   'Mid-Season',
    LATE_SEASON:  'Late Season',
    SEASON_END:   'Season End',
  };

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="🏢 Club Office">
      <div className="flex flex-col gap-4 p-4">

        {/* Season context */}
        <div className="flex items-center justify-between text-xs text-txt-muted">
          <span>Season {season} · Week {currentWeek}</span>
          <span className="badge bg-bg-raised text-txt-muted">{PHASE_LABELS[phase] ?? phase}</span>
        </div>

        {/* Board confidence */}
        <div className="card bg-bg-raised border border-bg-raised/50">
          <ConfidenceBar value={boardConfidence} />
        </div>

        {/* League standing summary */}
        {myEntry && (
          <div className="card flex items-center justify-between py-2">
            <div>
              <p className="text-xs2 text-txt-muted uppercase tracking-wide">League Position</p>
              <p className="text-2xl font-black data-font text-txt-primary mt-0.5">
                {myEntry.position}
                <span className="text-sm text-txt-muted font-normal ml-1">of 24</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs2 text-txt-muted uppercase tracking-wide">Points</p>
              <p className="text-xl font-bold data-font text-pitch-green mt-0.5">{myEntry.points}</p>
            </div>
            <div className="text-right">
              <p className="text-xs2 text-txt-muted uppercase tracking-wide">Record</p>
              <p className="text-sm data-font text-txt-primary mt-0.5">
                {myEntry.won}W {myEntry.drawn}D {myEntry.lost}L
              </p>
            </div>
          </div>
        )}

        {/* Business acumen */}
        <div>
          <p className="text-xs text-txt-muted uppercase tracking-wide mb-2">Business Acumen</p>
          <div className="card">
            <StarRow label="Financial Decisions"  value={businessAcumen.financial}   />
            <StarRow label="Statistical Analysis" value={businessAcumen.statistical} />
            <StarRow label="Strategic Thinking"   value={businessAcumen.strategic}   />
          </div>
        </div>

        {/* Guidance */}
        <div className="card bg-bg-raised border border-bg-raised/50">
          <p className="text-xs font-semibold text-txt-primary mb-2">What affects board confidence?</p>
          <ul className="flex flex-col gap-1.5 text-xs2 text-txt-muted list-none">
            <li>📈 Winning matches raises confidence</li>
            <li>📉 Losing streaks lower confidence</li>
            <li>🏟️ Upgrading facilities signals ambition</li>
            <li>💼 Resolving club events demonstrates leadership</li>
            <li>🧮 High business acumen builds long-term trust</li>
          </ul>
        </div>

      </div>
    </SlideOver>
  );
}
