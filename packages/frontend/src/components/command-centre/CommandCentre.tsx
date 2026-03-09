import { useState } from 'react';
import { GameState, GameEvent, GameCommand, PendingClubEvent } from '@calculating-glory/domain';
import { DataTiles } from './DataTiles';
import { LeagueTable } from './LeagueTable';
import { SquadAuditTable } from './SquadAuditTable';
import { NewsTicker } from './NewsTicker';
import { WeekAdvanceButton } from './WeekAdvanceButton';
import { InboxCard } from './InboxCard';
import { InboxHistory } from './InboxHistory';
import { HubTile } from './HubTiles';
import { SlideOver } from '../shared/SlideOver';
import { SocialFeed } from '../social-feed/SocialFeed';
import { IsometricBlueprint } from '../isometric/IsometricBlueprint';
import { BackroomTeamSlideOver } from './BackroomTeamSlideOver';

interface CommandCentreProps {
  state: GameState;
  events: GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  isLoading: boolean;
}

export function CommandCentre({ state, events, dispatch, isLoading }: CommandCentreProps) {
  const [error, setError]                     = useState<string | null>(null);
  const [socialOpen, setSocialOpen]           = useState(false);
  const [socialLinkedEvent, setSocialLinked]  = useState<PendingClubEvent | null>(null);
  const [isometricOpen, setIsometricOpen]     = useState(false);
  const [inboxOpen, setInboxOpen]             = useState(false);
  const [backroomOpen, setBackroomOpen]       = useState(false);
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
  const canUpgrade       = state.club.facilities.some(
    f => f.level < 5 && f.upgradeCost <= state.club.transferBudget
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* ── Live News Ticker (very top) ───────────────────────────────────── */}
      <NewsTicker
        events={events}
        clubId={state.club.id}
        leagueEntries={state.league.entries}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <div>
          <h1 className="text-lg font-bold text-txt-primary tracking-tight">
            {state.club.name}
          </h1>
          <p className="text-xs text-txt-muted">
            Season {state.season} · Week {state.currentWeek} ·{' '}
            <span className="capitalize">{state.phase.replace('_', ' ').toLowerCase()}</span>
          </p>
        </div>
        <WeekAdvanceButton
          pendingEvents={state.pendingEvents}
          currentWeek={state.currentWeek}
          season={state.season}
          isLoading={isLoading}
          dispatch={dispatch}
          onError={setError}
        />
      </div>

      {/* ── Error toast ──────────────────────────────────────────────────── */}
      {error && (
        <div
          className="mx-4 bg-alert-red/10 border border-alert-red/40 rounded-card px-4 py-2
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
          <DataTiles state={state} gridMode onBackroomClick={() => setBackroomOpen(true)} />

          {/* RIGHT row 2: Stadium & Facilities + Chats side-by-side */}
          <div className="grid grid-cols-2 gap-2">
            <HubTile
              icon="🏟"
              label="Stadium & Facilities"
              sub={canUpgrade ? 'Upgrade available' : `Facilities Lv${maxFacilityLevel}`}
              hasEvent={canUpgrade}
              onClick={() => setIsometricOpen(true)}
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

      {/* ── Isometric Blueprint slide-over ───────────────────────────────── */}
      <SlideOver
        isOpen={isometricOpen}
        onClose={() => setIsometricOpen(false)}
        title="Stadium &amp; Facilities"
      >
        <IsometricBlueprint state={state} dispatch={dispatch} onError={setError} />
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

      {/* ── Loading overlay ───────────────────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 bg-bg-deep/60 flex items-center justify-center z-50">
          <div className="card flex items-center gap-3 text-sm text-txt-primary">
            <div className="w-4 h-4 rounded-full border-2 border-data-blue border-t-transparent animate-spin" />
            Simulating week…
          </div>
        </div>
      )}
    </div>
  );
}
