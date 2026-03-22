import { useState } from 'react';
import { GameState, GameEvent, GameCommand, PendingClubEvent } from '@calculating-glory/domain';
import { DataTiles } from './DataTiles';
import { LeagueTable } from './LeagueTable';
import { SquadAuditTable } from './SquadAuditTable';
import { NewsTicker } from './NewsTicker';
import { InboxCard } from './InboxCard';
import { InboxHistory } from './InboxHistory';
import { HubTile } from './HubTiles';
import { SlideOver } from '../shared/SlideOver';
import { SocialFeed } from '../social-feed/SocialFeed';
import { BackroomTeamSlideOver } from './BackroomTeamSlideOver';
import { LearningProgressSlideOver } from './LearningProgressSlideOver';
import { TransferMarketSlideOver } from '../transfer-market/TransferMarketSlideOver';

interface CommandCentreProps {
  state: GameState;
  events: GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  isLoading: boolean;
  onNavigateToStadium: () => void;
}

export function CommandCentre({ state, events, dispatch, isLoading, onNavigateToStadium }: CommandCentreProps) {
  const [error, setError]                     = useState<string | null>(null);
  const [socialOpen, setSocialOpen]           = useState(false);
  const [socialLinkedEvent, setSocialLinked]  = useState<PendingClubEvent | null>(null);
  const [inboxOpen, setInboxOpen]             = useState(false);
  const [backroomOpen, setBackroomOpen]       = useState(false);
  const [learningOpen, setLearningOpen]       = useState(false);
  const [transfersOpen, setTransfersOpen]     = useState(false);
  const [dismissed, setDismissed]             = useState<Set<number>>(new Set());

  function handleDismiss(idx: number) {
    setDismissed(prev => new Set([...prev, idx]));
  }

  function handleMathChallenge(event: PendingClubEvent) {
    setSocialLinked(event);
    setSocialOpen(true);
  }

  function handleSocialClose() {
    setSocialOpen(false);
    setSocialLinked(null);
  }

  const unresolvedEvents = state.pendingEvents.filter(e => !e.resolved);
  const maxFacilityLevel = state.club.facilities.length > 0
    ? Math.max(...state.club.facilities.map(f => f.level))
    : 0;
  // Badge only when a brand-new facility (level 0) can be built for the first time.
  // Routine level-ups don't warrant an action signal — they're always available.
  const canUnlockNew = state.club.facilities.some(
    f => f.level === 0 && !(f.constructionWeeksRemaining ?? 0) && f.upgradeCost <= state.club.transferBudget
  );
  const canUpgrade = state.club.facilities.some(
    f => f.level > 0 && f.level < 5 && !(f.constructionWeeksRemaining ?? 0) && f.upgradeCost <= state.club.transferBudget
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Live News Ticker (very top) ───────────────────────────────────── */}
      <NewsTicker
        events={events}
        clubId={state.club.id}
        leagueEntries={state.league.entries}
      />

      {/* ── Error toast ──────────────────────────────────────────────────── */}
      {error && (
        <div
          className="mx-4 mt-2 bg-alert-red/10 border border-alert-red/40 rounded-card px-4 py-2
                     text-sm text-alert-red flex items-center justify-between"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-alert-red/70 hover:text-alert-red"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-4 pb-2 flex-1 overflow-y-auto">

        {/* Top section: Inbox spans both rows (left) | DataTiles + Hub tiles stacked (right) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-2">

          {/* LEFT: Inbox — row-spans DataTiles row + hub tiles row */}
          <div className="xl:row-span-2 min-h-0 relative">
            <InboxCard
              pendingEvents={state.pendingEvents}
              events={events}
              clubId={state.club.id}
              leagueEntries={state.league.entries}
              currentWeek={state.currentWeek}
              dismissed={dismissed}
              onDismiss={handleDismiss}
              dispatch={dispatch}
              onError={setError}
              onMathChallenge={handleMathChallenge}
              onViewAll={() => setInboxOpen(true)}
            />
          </div>

          {/* RIGHT row 1: DataTiles */}
          <DataTiles state={state} gridMode onBackroomClick={() => setBackroomOpen(true)} onAcumenClick={() => setLearningOpen(true)} />

          {/* RIGHT row 2: Stadium & Facilities + Chats + Transfers */}
          <div className="grid grid-cols-3 gap-2">
            <HubTile
              icon="🏟"
              label="Stadium & Facilities"
              sub={
                canUnlockNew ? 'New facility available'
                  : canUpgrade ? 'Upgrade available'
                  : `Facilities Lv${maxFacilityLevel}`
              }
              hasEvent={canUnlockNew}
              onClick={onNavigateToStadium}
            />
            <HubTile
              icon="💬"
              label="Chats"
              sub={
                unresolvedEvents.some(e => e.choices.some(c => c.requiresMath))
                  ? 'Negotiations waiting'
                  : 'Practice sessions available'
              }
              hasEvent={unresolvedEvents.some(e => e.choices.some(c => c.requiresMath))}
              onClick={() => { setSocialLinked(null); setSocialOpen(true); }}
            />
            <HubTile
              icon="🔄"
              label="Transfers"
              sub={`${state.freeAgentPool?.length ?? 0} agents available`}
              hasEvent={false}
              onClick={() => setTransfersOpen(true)}
            />
          </div>
        </div>

        {/* Bottom section: League Table + Squad full-width */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">

          {/* League Table */}
          <div className="flex flex-col min-w-0">
            <div className="overflow-y-auto max-h-56 rounded-card">
              <LeagueTable
                entries={state.league.entries}
                playerClubId={state.club.id}
                promotionCutoff={3}
                relegationStart={22}
                previousLeagueTable={state.previousLeagueTable}
              />
            </div>
          </div>

          {/* Squad */}
          <div className="flex flex-col min-w-0">
            <div className="overflow-y-auto max-h-56 rounded-card">
              <SquadAuditTable state={state} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Inbox slide-over ─────────────────────────────────────────────── */}
      <SlideOver
        isOpen={inboxOpen}
        onClose={() => setInboxOpen(false)}
        title="Inbox"
      >
        {inboxOpen && (
          <InboxHistory
            pendingEvents={state.pendingEvents}
            events={events}
            clubId={state.club.id}
            leagueEntries={state.league.entries}
            currentWeek={state.currentWeek}
            dismissed={dismissed}
            onDismiss={handleDismiss}
            dispatch={dispatch}
            onError={setError}
            onMathChallenge={handleMathChallenge}
          />
        )}
      </SlideOver>

      {/* ── Social Feed slide-over ────────────────────────────────────────── */}
      <SlideOver
        isOpen={socialOpen}
        onClose={handleSocialClose}
        title={socialLinkedEvent ? 'Negotiate — Agent Rodriguez' : 'Chats'}
      >
        {socialOpen && (
          <SocialFeed
            state={state}
            dispatch={dispatch}
            linkedEvent={socialLinkedEvent}
          />
        )}
      </SlideOver>

      {/* ── Backroom Team slide-over ──────────────────────────────────────── */}
      <SlideOver
        isOpen={backroomOpen}
        onClose={() => setBackroomOpen(false)}
        title="Backroom Team"
      >
        {backroomOpen && (
          <BackroomTeamSlideOver state={state} dispatch={dispatch} onError={setError} />
        )}
      </SlideOver>

      {/* ── Learning Progress slide-over ─────────────────────────────────── */}
      <SlideOver
        isOpen={learningOpen}
        onClose={() => setLearningOpen(false)}
        title="Learning Progress"
      >
        {learningOpen && (
          <LearningProgressSlideOver state={state} events={events} />
        )}
      </SlideOver>

      {/* ── Transfers slide-over ──────────────────────────────────────────── */}
      <SlideOver
        isOpen={transfersOpen}
        onClose={() => setTransfersOpen(false)}
        title="Transfers"
      >
        {transfersOpen && (
          <TransferMarketSlideOver state={state} dispatch={dispatch} onError={setError} />
        )}
      </SlideOver>

    </div>
  );
}
