import { GameState, GameEvent, GameCommand, PendingClubEvent, generateNpcMessages } from '@calculating-glory/domain';
import { HeadlineStats } from '../HeadlineStats';
import { DataTiles } from '../DataTiles';
import { HubTile } from '../HubTiles';
import { InboxCard } from '../InboxCard';
import { LeagueTable } from '../LeagueTable';
import { SquadAuditTable } from '../SquadAuditTable';
import { ActiveSection } from '../../../App';

interface OverviewSectionProps {
  state: GameState;
  events: GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  dismissed: Set<number>;
  onDismiss: (idx: number) => void;
  onError: (msg: string) => void;
  onMathChallenge: (event: PendingClubEvent) => void;
  onSectionChange: (s: ActiveSection) => void;
  onOpenNegotiations: () => void;
  onOpenPractice: () => void;
  onNavigateToStadium: () => void;
  onOpenLearning: () => void;
  introSpotlight?: string | null;
}

export function OverviewSection({
  state,
  events,
  dispatch,
  dismissed,
  onDismiss,
  onError,
  onMathChallenge,
  onSectionChange,
  onOpenNegotiations,
  onOpenPractice,
  onNavigateToStadium,
  onOpenLearning,
  introSpotlight,
}: OverviewSectionProps) {
  const npcMessages = generateNpcMessages(state, events);
  const unresolvedEvents = state.pendingEvents.filter(e => !e.resolved);

  const maxFacilityLevel = state.club.facilities.length > 0
    ? Math.max(...state.club.facilities.map(f => f.level))
    : 0;
  const anyBuilt = state.club.facilities.some(f => f.level > 0 && f.type !== 'CLUB_OFFICE');
  const canUnlockNew = anyBuilt && state.club.facilities.some(
    f => f.level === 0 && !(f.constructionWeeksRemaining ?? 0) && f.upgradeCost <= state.club.transferBudget
  );
  const canUpgrade = state.club.facilities.some(
    f => f.level > 0 && f.level < 5 && !(f.constructionWeeksRemaining ?? 0) && f.upgradeCost <= state.club.transferBudget
  );

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
    <div className="flex flex-col gap-2 px-4 pb-4">

      {/* ── Inbox (priority: at top, full height) ───────────────────────── */}
      <div className="relative">
        <InboxCard
          pendingEvents={state.pendingEvents}
          events={events}
          clubId={state.club.id}
          clubName={state.club.name}
          stadiumName={state.club.stadium.name}
          leagueEntries={state.league.entries}
          currentWeek={state.currentWeek}
          dismissed={dismissed}
          onDismiss={onDismiss}
          dispatch={dispatch}
          onError={onError}
          onMathChallenge={onMathChallenge}
          onViewAll={() => onSectionChange('inbox')}
          npcMessages={npcMessages}
        />
        {dim('inbox')}
      </div>

      {/* ── Headline stats strip ────────────────────────────────────────── */}
      <HeadlineStats state={state} />

      {/* ── DataTiles ───────────────────────────────────────────────────── */}
      <div className="relative">
        <DataTiles
          state={state}
          gridMode
          onBackroomClick={() => onSectionChange('backroom')}
          onAcumenClick={onOpenLearning}
        />
        {dim('data-tiles')}
      </div>

      {/* ── Hub tiles ───────────────────────────────────────────────────── */}
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
          onClick={onOpenNegotiations}
        />
        <HubTile
          icon="🎯"
          label="Practice"
          sub="Drill with Marcus Webb"
          hasEvent={false}
          onClick={onOpenPractice}
        />
        <HubTile
          icon="🔄"
          label="Transfers"
          sub={`${state.freeAgentPool?.length ?? 0} agents available`}
          hasEvent={false}
          onClick={() => onSectionChange('transfers')}
        />
        {dim('hub-tiles')}
      </div>

      {/* ── League Table + Squad ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
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
        <div className="relative flex flex-col min-w-0">
          <div className="overflow-y-auto max-h-56 rounded-card">
            <SquadAuditTable state={state} />
          </div>
          {dim('squad')}
        </div>
      </div>

    </div>
  );
}
