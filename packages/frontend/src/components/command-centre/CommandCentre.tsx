import { useState } from 'react';
import { GameState, GameEvent, GameCommand, PendingClubEvent } from '@calculating-glory/domain';
import { NewsTicker } from './NewsTicker';
import { SlideOver } from '../shared/SlideOver';
import { SocialFeed } from '../social-feed/SocialFeed';
import { LearningProgressSlideOver } from './LearningProgressSlideOver';
import { FinancialHealthBar } from '../shared/FinancialHealthBar';
import { OverviewSection } from './sections/OverviewSection';
import { InboxSection } from './sections/InboxSection';
import { TransferSection } from './sections/TransferSection';
import { FinancesSection } from './sections/FinancesSection';
import { BackroomSection } from './sections/BackroomSection';
import { SquadSection } from './sections/SquadSection';
import { ActiveSection } from '../../App';

interface CommandCentreProps {
  state: GameState;
  events: GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  isLoading: boolean;
  onNavigateToStadium: () => void;
  activeSection: ActiveSection;
  onSectionChange: (s: ActiveSection) => void;
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

const SECTION_TITLES: Record<ActiveSection, string> = {
  overview:  '',
  inbox:     'Inbox',
  squad:     'Squad',
  transfers: 'Transfers',
  finances:  'Finances',
  backroom:  'Backroom Team',
};

export function CommandCentre({
  state,
  events,
  dispatch,
  isLoading: _isLoading,
  onNavigateToStadium,
  activeSection,
  onSectionChange,
  introSpotlight,
}: CommandCentreProps) {
  const [error, setError]                     = useState<string | null>(null);
  const [socialOpen, setSocialOpen]           = useState(false);
  const [socialLinkedEvent, setSocialLinked]  = useState<PendingClubEvent | null>(null);
  const [practiceOpen, setPracticeOpen]       = useState(false);
  const [learningOpen, setLearningOpen]       = useState(false);
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

  const dim = (sectionId: string) => {
    if (introSpotlight === undefined) return null;
    return (
      <div
        className="absolute inset-0 bg-bg-deep/85 backdrop-blur-sm pointer-events-none z-10 transition-opacity duration-700"
        style={{ opacity: introSpotlight === sectionId ? 0 : 1 }}
      />
    );
  };

  const sectionTitle = SECTION_TITLES[activeSection];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Live News Ticker (very top, always visible) ───────────────────── */}
      <div className="relative shrink-0">
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

      {/* ── Financial Health Bar (overview only) ──────────────────────────── */}
      {activeSection === 'overview' && (
        <div className="relative shrink-0">
          <FinancialHealthBar state={state} onClick={() => onSectionChange('finances')} />
          {dim('financial-bar')}
        </div>
      )}

      {/* ── Error toast ───────────────────────────────────────────────────── */}
      {error && (
        <div
          className="mx-4 mt-2 shrink-0 bg-alert-red/10 border border-alert-red/40 rounded-card px-4 py-2
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

      {/* ── Section header (non-overview sections) ────────────────────────── */}
      {sectionTitle && (
        <div className="shrink-0 px-4 pt-3 pb-1">
          <h2 className="text-sm font-semibold text-txt-muted uppercase tracking-wide">
            {sectionTitle}
          </h2>
        </div>
      )}

      {/* ── Section content ───────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {activeSection === 'overview' && (
          <OverviewSection
            state={state}
            events={events}
            dispatch={dispatch}
            dismissed={dismissed}
            onDismiss={handleDismiss}
            onError={setError}
            onMathChallenge={handleMathChallenge}
            onSectionChange={onSectionChange}
            onOpenNegotiations={() => { setSocialLinked(null); setSocialOpen(true); }}
            onOpenPractice={() => setPracticeOpen(true)}
            onNavigateToStadium={onNavigateToStadium}
            onOpenLearning={() => setLearningOpen(true)}
            introSpotlight={introSpotlight}
          />
        )}

        {activeSection === 'inbox' && (
          <InboxSection
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

        {activeSection === 'transfers' && (
          <TransferSection state={state} dispatch={dispatch} onError={setError} />
        )}

        {activeSection === 'finances' && (
          <FinancesSection state={state} dispatch={dispatch} onError={setError} />
        )}

        {activeSection === 'backroom' && (
          <BackroomSection state={state} dispatch={dispatch} onError={setError} />
        )}

        {activeSection === 'squad' && (
          <SquadSection state={state} />
        )}
      </div>

      {/* ── Social Feed / Negotiations slide-over ─────────────────────────── */}
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

      {/* ── Practice slide-over ───────────────────────────────────────────── */}
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

      {/* ── Learning Progress slide-over ──────────────────────────────────── */}
      <SlideOver
        isOpen={learningOpen}
        onClose={() => setLearningOpen(false)}
        title="Learning Progress"
      >
        {learningOpen && (
          <LearningProgressSlideOver state={state} events={events} />
        )}
      </SlideOver>

    </div>
  );
}
