import { useState } from 'react';
import { GameState, GameEvent, GameCommand, PendingClubEvent } from '@calculating-glory/domain';
import { DataTiles } from './DataTiles';
import { LeagueTable } from './LeagueTable';
import { SquadAuditTable } from './SquadAuditTable';
import { NewsTicker } from './NewsTicker';
import { WeekAdvanceButton } from './WeekAdvanceButton';
import { PendingEventCard } from './PendingEventCard';
import { HubTile } from './HubTiles';
import { SlideOver } from '../shared/SlideOver';
import { SocialFeed } from '../social-feed/SocialFeed';
import { IsometricBlueprint } from '../isometric/IsometricBlueprint';

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

  function handleMathChallenge(event: PendingClubEvent) {
    setSocialLinked(event);
    setSocialOpen(true);
  }

  function handleSocialClose() {
    setSocialOpen(false);
    setSocialLinked(null);
  }

  const unresolvedEvents = state.pendingEvents.filter(e => !e.resolved);
  const maxFacilityLevel = Math.max(...state.club.facilities.map(f => f.level));
  const canUpgrade       = state.club.facilities.some(
    f => f.level < 5 && f.upgradeCost <= state.club.transferBudget
  );

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Live News Ticker (very top) ───────────────────────────────────── */}
      <NewsTicker
        events={events}
        clubId={state.club.id}
        leagueEntries={state.league.entries}
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
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
      <div className="flex flex-col gap-4 px-4 pb-4 flex-1">

        {/* Top section: Squad (left) | Data tiles 2-col grid (right) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-4">
          <SquadAuditTable state={state} />
          <DataTiles state={state} gridMode />
        </div>

        {/* Bottom section: 4 equal columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Col 1: League Table (scrollable) */}
          <div className="flex flex-col">
            <div className="overflow-y-auto max-h-80 rounded-card">
              <LeagueTable
                entries={state.league.entries}
                playerClubId={state.club.id}
                promotionCutoff={3}
                relegationStart={22}
              />
            </div>
          </div>

          {/* Col 2: Pending Decisions */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-warn-amber uppercase tracking-wider">
              {unresolvedEvents.length > 0
                ? `⚠ Pending Decisions (${unresolvedEvents.length})`
                : '✓ Pending Decisions'}
            </h2>
            {unresolvedEvents.length > 0 ? (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-72">
                {unresolvedEvents.map(evt => (
                  <PendingEventCard
                    key={evt.id}
                    event={evt}
                    dispatch={dispatch}
                    onError={setError}
                    onMathChallenge={handleMathChallenge}
                  />
                ))}
              </div>
            ) : (
              <div className="card flex flex-col items-center justify-center gap-2 py-6 text-center border border-pitch-green/20 bg-pitch-green/5">
                <span className="text-2xl">✓</span>
                <span className="text-xs text-pitch-green font-medium">All clear</span>
                <span className="text-xs2 text-txt-muted">No decisions waiting</span>
              </div>
            )}
          </div>

          {/* Col 3: Club Blueprint */}
          <HubTile
            icon="🏟"
            label="Club Blueprint"
            sub={canUpgrade ? 'Upgrade available' : `Facilities Lv${maxFacilityLevel}`}
            hasEvent={canUpgrade}
            onClick={() => setIsometricOpen(true)}
          />

          {/* Col 4: Social Feed */}
          <HubTile
            icon="💬"
            label="Social Feed"
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

      {/* ── Social Feed slide-over ────────────────────────────────────────── */}
      <SlideOver
        isOpen={socialOpen}
        onClose={handleSocialClose}
        title={socialLinkedEvent ? 'Negotiate — Agent Rodriguez' : 'Social Feed'}
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
        title="Club Blueprint"
      >
        <IsometricBlueprint state={state} dispatch={dispatch} onError={setError} />
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
