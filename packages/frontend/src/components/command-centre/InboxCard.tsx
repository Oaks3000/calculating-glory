import {
  GameEvent,
  GameCommand,
  PendingClubEvent,
  LeagueTableEntry,
  NpcMessage,
  NpcSender,
  Manager,
  MANAGER_PERSONAS,
} from '@calculating-glory/domain';
import { PendingEventCard } from './PendingEventCard';
import {
  buildNotableMatches,
  buildNewsItems,
  OUTCOME_STYLES,
  REASON_ORDER,
} from './inboxUtils';

// ── NPC sender display config ─────────────────────────────────────────────────

type StaticNpcSender = Exclude<NpcSender, 'MANAGER'>;

const NPC_CONFIG: Record<StaticNpcSender, { initial: string; name: string; avatarClass: string; nameClass: string }> = {
  VAL:    { initial: 'V', name: 'Val Chen',       avatarClass: 'bg-warn-amber/20 text-warn-amber',   nameClass: 'text-warn-amber'   },
  KEV:    { initial: 'K', name: 'Kev Mulligan',   avatarClass: 'bg-data-blue/20 text-data-blue',     nameClass: 'text-data-blue'    },
  MARCUS: { initial: 'M', name: 'Marcus Webb',    avatarClass: 'bg-pitch-green/20 text-pitch-green', nameClass: 'text-pitch-green'  },
  DANI:   { initial: 'D', name: 'Dani Osei',      avatarClass: 'bg-alert-red/20 text-alert-red',     nameClass: 'text-alert-red'    },
};

function getSenderConfig(
  sender: NpcSender,
  manager?: Manager | null
): { initial: string; name: string; avatarClass: string; nameClass: string } {
  if (sender === 'MANAGER') {
    if (!manager) {
      return { initial: 'M', name: 'Manager', avatarClass: 'bg-white/10 text-txt-muted', nameClass: 'text-txt-muted' };
    }
    const persona = MANAGER_PERSONAS[manager.archetype];
    return {
      initial:     manager.name.charAt(0),
      name:        manager.name,
      avatarClass: persona.avatarClass,
      nameClass:   persona.nameClass,
    };
  }
  return NPC_CONFIG[sender as StaticNpcSender];
}

interface InboxCardProps {
  pendingEvents: PendingClubEvent[];
  events: GameEvent[];
  clubId: string;
  clubName?: string;
  stadiumName?: string;
  leagueEntries: LeagueTableEntry[];
  currentWeek: number;
  dismissed: Set<number>;
  onDismiss: (idx: number) => void;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
  onMathChallenge: (event: PendingClubEvent) => void;
  onViewAll: () => void;
  npcMessages?: NpcMessage[];
  /** Current hired manager — used to resolve MANAGER sender display config */
  manager?: Manager | null;
}

const PREVIEW_LIMIT = 4;

export function InboxCard({
  pendingEvents,
  events,
  clubId,
  clubName,
  stadiumName,
  leagueEntries,
  currentWeek,
  dismissed,
  onDismiss,
  dispatch,
  onError,
  onMathChallenge,
  onViewAll,
  npcMessages = [],
  manager,
}: InboxCardProps) {
  const unresolvedDecisions = pendingEvents.filter(e => !e.resolved);

  // Notable match results for latest round only
  const allNotable = buildNotableMatches(events, clubId, leagueEntries, dismissed, 24);
  allNotable.sort((a, b) => REASON_ORDER[a.reason] - REASON_ORDER[b.reason]);

  // Random news items for the current week (seeded, deterministic)
  const playerPosition = leagueEntries.findIndex(e => e.clubId === clubId);
  const rivalNames = playerPosition >= 0
    ? leagueEntries
        .slice(Math.max(0, playerPosition - 3), Math.min(leagueEntries.length, playerPosition + 4))
        .filter(e => e.clubId !== clubId)
        .map(e => e.clubName)
    : [];
  const newsItems = buildNewsItems(currentWeek, rivalNames, dismissed, clubName, stadiumName);

  // Combined preview pool: decisions (capped at 2) → matches → news
  // Remaining slots after decisions are shared between matches and news.
  const DECISION_PREVIEW  = 2;
  const displayDecisions  = unresolvedDecisions.slice(0, DECISION_PREVIEW);
  const hiddenDecisions   = unresolvedDecisions.length - displayDecisions.length;

  const totalMatches      = allNotable.length;
  const totalNews         = newsItems.length;
  const remainingSlots    = Math.max(0, PREVIEW_LIMIT - displayDecisions.length);
  const previewMatchCount = Math.min(totalMatches, remainingSlots);
  const previewNewsCount  = Math.min(totalNews, Math.max(0, remainingSlots - previewMatchCount));

  const displayMatches = allNotable.slice(0, previewMatchCount);
  const displayNews    = newsItems.slice(0, previewNewsCount);
  const hiddenCount    = hiddenDecisions + (totalMatches - previewMatchCount) + (totalNews - previewNewsCount);

  const isEmpty = unresolvedDecisions.length === 0 && totalMatches === 0 && totalNews === 0 && npcMessages.length === 0;

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

        {/* Decisions — capped at DECISION_PREVIEW in the card, rest in "view all" */}
        {displayDecisions.map(evt => (
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
            {displayDecisions.length > 0 && (
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
                  className="absolute top-0 right-0 flex items-center justify-center w-10 h-10
                             text-txt-muted/30 hover:text-txt-muted text-xs leading-none
                             opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* NPC character messages */}
        {npcMessages.length > 0 && (
          <>
            {(unresolvedDecisions.length > 0 || displayMatches.length > 0) && (
              <div className="border-t border-bg-deep/60 mt-0.5 mb-0.5" />
            )}
            <p className="text-xs2 text-txt-muted uppercase tracking-wider px-1">
              From the Team
            </p>
            {npcMessages.map((msg) => {
              const cfg = getSenderConfig(msg.sender, manager);
              return (
                <div
                  key={msg.id}
                  className="flex items-start gap-2 px-3 py-2 rounded-card bg-bg-surface/80 border border-bg-deep/30"
                >
                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${cfg.avatarClass}`}>
                    {cfg.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs2 font-semibold mb-0.5 ${cfg.nameClass}`}>{cfg.name}</p>
                    <p className="text-xs leading-relaxed text-txt-primary">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* News items — texture, no gameplay effect */}
        {displayNews.length > 0 && (
          <>
            {(displayDecisions.length > 0 || displayMatches.length > 0) && (
              <div className="border-t border-bg-deep/60 mt-0.5 mb-0.5" />
            )}
            <p className="text-xs2 text-txt-muted uppercase tracking-wider px-1">
              Around the League
            </p>
            {displayNews.map((item) => (
              <div
                key={`news-${item.id}`}
                className="flex items-start gap-2 px-3 py-1.5 rounded-card text-xs group
                           relative bg-bg-surface/60 border border-bg-deep/20 hover:bg-bg-surface
                           cursor-default"
              >
                <button
                  onClick={() => onDismiss(item.id)}
                  className="absolute top-1 right-1.5 text-txt-muted/30 hover:text-txt-muted
                             opacity-0 group-hover:opacity-100 transition-opacity text-xs2 leading-none"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
                <span className="shrink-0 text-sm">{item.icon}</span>
                <span className="text-xs2 text-txt-muted/90 pr-4 leading-relaxed">
                  {item.headline}
                </span>
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
