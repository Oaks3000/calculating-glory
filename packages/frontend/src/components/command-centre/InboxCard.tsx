import { GameEvent, GameCommand, PendingClubEvent, LeagueTableEntry } from '@calculating-glory/domain';
import { PendingEventCard } from './PendingEventCard';
import {
  buildNotableMatches,
  OUTCOME_STYLES,
  REASON_ORDER,
} from './inboxUtils';

interface InboxCardProps {
  pendingEvents: PendingClubEvent[];
  events: GameEvent[];
  clubId: string;
  leagueEntries: LeagueTableEntry[];
  dismissed: Set<number>;
  onDismiss: (idx: number) => void;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
  onMathChallenge: (event: PendingClubEvent) => void;
  onViewAll: () => void;
}

const PREVIEW_LIMIT = 4;

export function InboxCard({
  pendingEvents,
  events,
  clubId,
  leagueEntries,
  dismissed,
  onDismiss,
  dispatch,
  onError,
  onMathChallenge,
  onViewAll,
}: InboxCardProps) {
  const unresolvedDecisions = pendingEvents.filter(e => !e.resolved);

  // Build notable matches for the last round only (last 24 MATCH_SIMULATED events)
  const allNotable = buildNotableMatches(events, clubId, leagueEntries, dismissed, 24);
  allNotable.sort((a, b) => REASON_ORDER[a.reason] - REASON_ORDER[b.reason]);

  const displayMatches = allNotable.slice(0, PREVIEW_LIMIT);
  const hiddenCount    = allNotable.length - displayMatches.length;

  const isEmpty = unresolvedDecisions.length === 0 && allNotable.length === 0;

  return (
    <div className="absolute inset-0 bg-bg-raised rounded-card p-4 overflow-hidden flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h2 className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
          Inbox
        </h2>
        {unresolvedDecisions.length > 0 && (
          <span className="text-xs2 font-bold text-warn-amber bg-warn-amber/10 px-2 py-0.5 rounded-tag">
            {unresolvedDecisions.length} need action
          </span>
        )}
      </div>

      {/* ── Feed ───────────────────────────────────────────────────────── */}
      <div className="overflow-y-auto flex-1 flex flex-col gap-1.5 min-h-0">

        {isEmpty && (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <span className="text-xl">✓</span>
            <span className="text-xs text-pitch-green font-medium">All clear</span>
            <span className="text-xs2 text-txt-muted">No decisions or results yet</span>
          </div>
        )}

        {/* Decisions — always at the top */}
        {unresolvedDecisions.map(evt => (
          <PendingEventCard
            key={evt.id}
            event={evt}
            dispatch={dispatch}
            onError={onError}
            onMathChallenge={onMathChallenge}
          />
        ))}

        {/* Notable match results — preview */}
        {displayMatches.length > 0 && (
          <>
            {unresolvedDecisions.length > 0 && (
              <div className="border-t border-bg-deep/60 mt-0.5 mb-0.5" />
            )}
            <p className="text-xs2 text-txt-muted uppercase tracking-wider px-1">
              Latest Results
            </p>
            {displayMatches.map((item) => (
              <div
                key={`match-${item.idx}`}
                className={[
                  'flex flex-col px-3 py-1.5 rounded-card text-xs group relative cursor-pointer',
                  item.reason === 'player'
                    ? 'inbox-relief bg-data-blue/20 border-l-2 border-data-blue/70 border border-data-blue/25 hover:bg-data-blue/25'
                    : 'bg-bg-surface/80 border border-bg-deep/30 hover:bg-bg-surface',
                ].join(' ')}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onDismiss(item.idx); }}
                  className="absolute top-1 right-1.5 text-txt-muted/30 hover:text-txt-muted
                             opacity-0 group-hover:opacity-100 transition-opacity text-xs2 leading-none"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
                <span className={[
                  'text-xs2 italic mb-0.5 pr-4',
                  item.reason === 'player' ? 'text-data-blue font-medium' : 'text-txt-muted/80',
                ].join(' ')}>
                  {item.headline}
                </span>
                <div className="flex items-center gap-1.5">
                  {item.outcome && (
                    <span className={`text-xs2 font-bold w-5 h-5 flex items-center justify-center rounded-sm shrink-0 ${OUTCOME_STYLES[item.outcome]}`}>
                      {item.outcome}
                    </span>
                  )}
                  {!item.outcome && (
                    <span className="text-txt-muted/50 shrink-0 text-xs2">⚽</span>
                  )}
                  <span className={[
                    'truncate text-xs2',
                    item.reason === 'player' ? 'text-txt-primary font-semibold' : 'text-txt-muted',
                  ].join(' ')}>
                    {item.home} {item.homeGoals}–{item.awayGoals} {item.away}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── View all footer ─────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-bg-deep/50 mt-2 pt-1.5">
        <button
          onClick={onViewAll}
          className="w-full flex items-center justify-between px-1 py-0.5
                     text-xs2 text-txt-muted hover:text-data-blue transition-colors"
        >
          <span>View full inbox</span>
          <span className="flex items-center gap-1">
            {hiddenCount > 0 && (
              <span className="bg-data-blue/15 text-data-blue px-1.5 py-0.5 rounded-tag font-medium">
                +{hiddenCount} more
              </span>
            )}
            <span>→</span>
          </span>
        </button>
      </div>

    </div>
  );
}
