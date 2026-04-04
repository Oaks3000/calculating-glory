import { useState } from 'react';
import { GameState, GameEvent, GameCommand, PendingClubEvent, generateNpcMessages } from '@calculating-glory/domain';
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
import { FinancialHealthBar } from '../shared/FinancialHealthBar';

interface CommandCentreProps {
  state: GameState;
  events: GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  isLoading: boolean;
  onNavigateToStadium: () => void;
  /**
   * Intro walkthrough spotlight. When set, every section EXCEPT the named one
   * is covered by a dark translucent overlay, focusing the player's attention.
   * null  = intro active, no specific section (everything dimmed)
   * string = intro active, named section revealed at full brightness
   * undefined (default) = intro not active, no overlays
   *
   * Section IDs: 'news-ticker' | 'financial-bar' | 'inbox' | 'data-tiles'
   *              | 'hub-tiles' | 'league-table' | 'squad'
   */
  introSpotlight?: string | null;
}

export function CommandCentre({ state, events, dispatch, isLoading, onNavigateToStadium, introSpotlight }: CommandCentreProps) {
  const [error, setError]                     = useState<string | null>(null);
  const [socialOpen, setSocialOpen]           = useState(false);
  const [socialLinkedEvent, setSocialLinked]  = useState<PendingClubEvent | null>(null);
  const [practiceOpen, setPracticeOpen]       = useState(false);
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
  const npcMessages = generateNpcMessages(state, events);
  const maxFacilityLevel = state.club.facilities.length > 0
    ? Math.max(...state.club.facilities.map(f => f.level))
    : 0;
  // Badge only when a brand-new facility can be built AND at least one facility
  // has already been built. On game start all facilities except CLUB_OFFICE are
  // level 0 and affordable, so the badge would fire immediately with no clear
  // action — suppress it until the player has built at least one additional
  // facility beyond the default CLUB_OFFICE (level > 0 AND not CLUB_OFFICE).
  const anyBuilt = state.club.facilities.some(f => f.level > 0 && f.type !== 'CLUB_OFFICE');
  const canUnlockNew = anyBuilt && state.club.facilities.some(
    f => f.level === 0 && !(f.constructionWeeksRemaining ?? 0) && f.upgradeCost <= state.club.transferBudget
  );
  const canUpgrade = state.club.facilities.some(
    f => f.level > 0 && f.level < 5 && !(f.constructionWeeksRemaining ?? 0) && f.upgradeCost <= state.club.transferBudget
  );

  // Returns a dark overlay for a section when the intro is active and another
  // section is spotlighted. Opacity transitions smoothly so spotlights feel
  // like a reveal rather than a jump.
  const dim = (sectionId: string) => {
    if (introSpotlight === undefined) return null;
    return (
      <div
        className="absolute inset-0 bg-bg-deep/85 backdrop-blur-sm pointer-events-none z-10 transition-opacity duration-700"
        style={{ opacity: introSpotlight === sectionId ? 0 : 1 }}
      />
    );
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Live News Ticker (very top) ───────────────────────────────────── */}
      <div className="relative">
        <NewsTicker
          events={events}
          clubId={state.club.id}
          clubName={state.club.name}
          stadiumName={state.club.stadium.name}
          leagueEntries={state.league.entries}
          squad={state.club.squad}
          freeAgents={state.freeAgentPool ?? []}
          pendingEvents={state.pendingEvents}
          currentWeek={state.currentWeek}
          currentSeason={state.season}
          clubRecords={state.clubRecords}
        />
        {dim('news-ticker')}
      </div>

      {/* ── Financial Health Bar ─────────────────────────────────────────── */}
      <div className="relative">
        <FinancialHealthBar state={state} />
        {dim('financial-bar')}
      </div>

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
              clubName={state.club.name}
              stadiumName={state.club.stadium.name}
              leagueEntries={state.league.entries}
              currentWeek={state.currentWeek}
              dismissed={dismissed}
              onDismiss={handleDismiss}
              dispatch={dispatch}
              onError={setError}
              onMathChallenge={handleMathChallenge}
              onViewAll={() => setInboxOpen(true)}
              npcMessages={npcMessages}
            />
            {dim('inbox')}
          </div>

          {/* RIGHT row 1: DataTiles */}
          <div className="relative">
            <DataTiles state={state} gridMode onBackroomClick={() => setBackroomOpen(true)} onAcumenClick={() => setLearningOpen(true)} />
            {dim('data-tiles')}
          </div>

          {/* RIGHT row 2: 2×2 hub tile grid */}
          <div className="relative grid grid-cols-2 gap-2">
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
              label="Negotiations"
              sub={
                unresolvedEvents.some(e => e.choices.some(c => c.requiresMath))
                  ? 'Deals waiting'
                  : 'No active deals'
              }
              hasEvent={unresolvedEvents.some(e => e.choices.some(c => c.requiresMath))}
              onClick={() => { setSocialLinked(null); setSocialOpen(true); }}
            />
            <HubTile
              icon="🎯"
              label="Practice"
              sub="Drill with Marcus Webb"
              hasEvent={false}
              onClick={() => setPracticeOpen(true)}
            />
            <HubTile
              icon="🔄"
              label="Transfers"
              sub={`${state.freeAgentPool?.length ?? 0} agents available`}
              hasEvent={false}
              onClick={() => setTransfersOpen(true)}
            />
            {dim('hub-tiles')}
          </div>
        </div>

        {/* Bottom section: League Table + Squad full-width */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">

          {/* League Table */}
          <div className="relative flex flex-col min-w-0">
            <div className="overflow-y-auto max-h-56 rounded-card">
              <LeagueTable
                entries={state.league.entries}
                playerClubId={state.club.id}
                promotionCutoff={3}
                relegationStart={22}
                previousLeagueTable={state.previousLeagueTable}
              />
            </div>
            {dim('league-table')}
          </div>

          {/* Squad */}
          <div className="relative flex flex-col min-w-0">
            <div className="overflow-y-auto max-h-56 rounded-card">
              <SquadAuditTable state={state} />
            </div>
            {dim('squad')}
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
            events={events}
            dispatch={dispatch}
            linkedEvent={socialLinkedEvent}
            onNegotiationComplete={handleSocialClose}
          />
        )}
      </SlideOver>

      {/* ── Practice slide-over ──────────────────────────────────────────── */}
      <SlideOver
        isOpen={practiceOpen}
        onClose={() => setPracticeOpen(false)}
        title="Practice — Marcus Webb"
      >
        {practiceOpen && (
          <SocialFeed
            state={state}
            events={events}
            dispatch={dispatch}
            practiceMode
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
