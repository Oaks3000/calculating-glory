import { GameEvent, GameCommand, PendingClubEvent, LeagueTableEntry } from '@calculating-glory/domain';
import { PendingEventCard } from './PendingEventCard';
import {
  buildNotableMatches,
  OUTCOME_STYLES,
  NotableMatch,
} from './inboxUtils';

interface InboxHistoryProps {
  pendingEvents: PendingClubEvent[];
  events: GameEvent[];
  clubId: string;
  leagueEntries: LeagueTableEntry[];
  dismissed: Set<number>;
  onDismiss: (idx: number) => void;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
  onMathChallenge: (event: PendingClubEvent) => void;
}

function SectionHeading({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-1 sticky top-0 bg-bg-surface z-10">
      <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs2 text-txt-muted/60">{count}</span>
      )}
    </div>
  );
}

function MatchItem({
  item,
  onDismiss,
}: {
  item: NotableMatch;
  onDismiss: (idx: number) => void;
}) {
  return (
    <div
      className={[
        'flex flex-col mx-4 mb-1.5 px-3 py-2 rounded-card text-xs group relative',
        item.reason === 'player'
          ? 'inbox-relief bg-data-blue/20 border-l-2 border-data-blue/70 border border-data-blue/25'
          : 'bg-bg-raised border border-bg-deep/40',
      ].join(' ')}
    >
      <button
        onClick={() => onDismiss(item.idx)}
        className="absolute top-1.5 right-2 text-txt-muted/30 hover:text-txt-muted
                   opacity-0 group-hover:opacity-100 transition-opacity text-xs2 leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
      <span className={[
        'text-xs2 italic mb-1 pr-4',
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
  );
}

export function InboxHistory({
  pendingEvents,
  events,
  clubId,
  leagueEntries,
  dismissed,
  onDismiss,
  dispatch,
  onError,
  onMathChallenge,
}: InboxHistoryProps) {
  const unresolved = pendingEvents.filter(e => !e.resolved);
  const resolved   = pendingEvents.filter(e => e.resolved);

  // All notable matches across full history, newest first
  const allNotable = buildNotableMatches(events, clubId, leagueEntries, dismissed);
  allNotable.sort((a, b) => b.idx - a.idx); // reverse chronological

  const isEmpty = unresolved.length === 0 && allNotable.length === 0 && resolved.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
        <span className="text-3xl">✓</span>
        <span className="text-sm text-pitch-green font-medium">All clear</span>
        <span className="text-xs text-txt-muted">Nothing to show yet — advance a week to see results</span>
      </div>
    );
  }

  return (
    <div className="pb-6">

      {/* ── Pending decisions ─────────────────────────────────────────── */}
      {unresolved.length > 0 && (
        <>
          <SectionHeading label="Needs Action" count={unresolved.length} />
          <div className="px-4 flex flex-col gap-2 pb-2">
            {unresolved.map(evt => (
              <PendingEventCard
                key={evt.id}
                event={evt}
                dispatch={dispatch}
                onError={onError}
                onMathChallenge={onMathChallenge}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Match results (full history) ──────────────────────────────── */}
      {allNotable.length > 0 && (
        <>
          <SectionHeading label="Results" count={allNotable.length} />
          {allNotable.map(item => (
            <MatchItem key={`match-${item.idx}`} item={item} onDismiss={onDismiss} />
          ))}
        </>
      )}

      {/* ── Resolved decisions ────────────────────────────────────────── */}
      {resolved.length > 0 && (
        <>
          <SectionHeading label="Resolved" count={resolved.length} />
          <div className="flex flex-col gap-1.5 px-4">
            {[...resolved].reverse().map(evt => (
              <div
                key={evt.id}
                className="flex items-start gap-2 px-3 py-2 rounded-card bg-bg-raised/40"
              >
                <span className="text-xs2 text-pitch-green/70 mt-0.5 shrink-0">✓</span>
                <div className="min-w-0">
                  <span className="text-xs text-txt-muted/70 font-medium truncate block">
                    {evt.title}
                  </span>
                  <span className="text-xs2 text-txt-muted/40">
                    Week {evt.week}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
