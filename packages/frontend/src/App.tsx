import { useState, useRef, useEffect } from 'react';
import {
  CurriculumLevel,
  generateMatchTimeline,
  MatchTimeline,
  MatchCommentaryContext,
} from '@calculating-glory/domain';
import { useGameState } from './hooks/useGameState';
import { CommandCentre } from './components/command-centre/CommandCentre';
import { StadiumView } from './components/stadium-view/StadiumView';
import { ViewToggle, ActiveView } from './components/shared/ViewToggle';
import { PreSeasonScreen } from './components/pre-season/PreSeasonScreen';
import { SeasonEndScreen } from './components/season-end/SeasonEndScreen';
import { ForcedOutScreen } from './components/forced-out/ForcedOutScreen';
import { BoardUltimatumModal } from './components/forced-out/BoardUltimatumModal';
import { MenuScreen } from './components/menu/MenuScreen';
import { IntroScreen } from './components/intro/IntroScreen';
import { OwnerBox } from './components/owner-box/OwnerBox';
import { PostMatchScreen } from './components/owner-box/PostMatchScreen';
import { PreMatchOverlay } from './components/owner-box/PreMatchOverlay';
import { isIntroCompleted, clearIntroCompleted } from './lib/introState';

type Screen = 'menu' | 'intro' | 'game';

interface OwnerBoxData {
  timeline: MatchTimeline;
  playerTeamName: string;
  opponentTeamName: string;
}

export default function App() {
  const { state, events, dispatch, isLoading, resetGame } = useGameState();
  const [screen, setScreen] = useState<Screen>('menu');
  const [activeView, setActiveView] = useState<ActiveView>('command');
  const [error, setError] = useState<string | null>(null);
  const [ownerBoxData, setOwnerBoxData] = useState<OwnerBoxData | null>(null);
  const [showPostMatch, setShowPostMatch] = useState(false);
  const [showPreMatch, setShowPreMatch] = useState(false);
  // Track which week's ultimatum the player has dismissed (so it doesn't re-appear)
  const [ultimatumDismissedWeek, setUltimatumDismissedWeek] = useState<number | null>(null);
  const processedEventCount = useRef<number | null>(null);

  // Detect new MATCH_SIMULATED events after simulation completes
  useEffect(() => {
    if (isLoading) return;

    if (processedEventCount.current === null) {
      processedEventCount.current = events.length;
      return;
    }

    if (events.length <= processedEventCount.current) return;

    const newEvents = events.slice(processedEventCount.current);
    processedEventCount.current = events.length;

    // Find the most recent MATCH_SIMULATED in the new batch
    const matchEvent = [...newEvents]
      .reverse()
      .find(e => e.type === 'MATCH_SIMULATED');
    if (!matchEvent || matchEvent.type !== 'MATCH_SIMULATED') return;

    const isHome = matchEvent.homeTeamId === state.club.id;
    const opponentId = isHome ? matchEvent.awayTeamId : matchEvent.homeTeamId;
    const opponentEntry = state.league.entries.find(e => e.clubId === opponentId);
    const opponentTeamName = opponentEntry?.clubName ?? 'Opponents';

    const gk = state.club.squad.find(p => p.position === 'GK');
    const keeperName = gk ? gk.name.split(' ')[0] : 'Keeper';
    const squadPlayerNames = state.club.squad.map(p => p.name.split(' ')[0]);

    const ctx: MatchCommentaryContext = {
      homeGoals: matchEvent.homeGoals,
      awayGoals: matchEvent.awayGoals,
      seed: matchEvent.seed,
      isHome,
      playerTeamName: state.club.name,
      opponentTeamName,
      squadPlayerNames,
      keeperName,
    };

    setOwnerBoxData({
      timeline: generateMatchTimeline(ctx),
      playerTeamName: state.club.name,
      opponentTeamName,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, isLoading]);

  const hasSave = events.length > 1;

  function handleContinue() {
    setScreen('game');
  }

  function handleNewGame(level: CurriculumLevel, clubName: string, stadiumName: string) {
    clearIntroCompleted();
    resetGame(level, clubName, stadiumName);
    setScreen('intro');
  }

  function handleIntroComplete() {
    setScreen('game');
  }

  function handleKickOff() {
    setShowPreMatch(false);
    const nextWeek = state.currentWeek + 1;
    const result = dispatch({
      type: 'SIMULATE_WEEK',
      week: nextWeek,
      season: state.season,
      seed: `calculating-glory-mvp-v1-w${nextWeek}`,
    });
    if (result.error) setError(result.error);
  }

  if (screen === 'menu') {
    return (
      <MenuScreen
        state={state}
        hasSave={hasSave}
        onContinue={handleContinue}
        onNewGame={handleNewGame}
      />
    );
  }

  if (screen === 'intro') {
    return (
      <IntroScreen
        state={state}
        events={events}
        dispatch={dispatch}
        onComplete={handleIntroComplete}
      />
    );
  }

  if (state.phase === 'PRE_SEASON') {
    return <PreSeasonScreen state={state} dispatch={dispatch} />;
  }

  if (state.phase === 'SEASON_END') {
    return <SeasonEndScreen state={state} dispatch={dispatch} />;
  }

  if (state.phase === 'FORCED_OUT' || state.phase === 'PARACHUTE_OFFERED') {
    return <ForcedOutScreen state={state} dispatch={dispatch} />;
  }

  return (
    <div className="min-h-screen bg-bg-deep text-txt-primary flex flex-col">
      <ViewToggle
        activeView={activeView}
        onViewChange={setActiveView}
        state={state}
        isLoading={isLoading}
        dispatch={dispatch}
        onError={setError}
        onResetGame={resetGame}
        onPreMatch={() => setShowPreMatch(true)}
      />

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

      {activeView === 'command' ? (
        <CommandCentre
          state={state}
          events={events}
          dispatch={dispatch}
          isLoading={isLoading}
          onNavigateToStadium={() => setActiveView('stadium')}
        />
      ) : (
        <StadiumView
          state={state}
          dispatch={dispatch}
          onError={setError}
        />
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-bg-deep/60 flex items-center justify-center z-50">
          <div className="card flex items-center gap-3 text-sm text-txt-primary">
            <div className="w-4 h-4 rounded-full border-2 border-data-blue border-t-transparent animate-spin" />
            Simulating week…
          </div>
        </div>
      )}

      {showPreMatch && !ownerBoxData && (
        <PreMatchOverlay
          state={state}
          onKickOff={handleKickOff}
          onCancel={() => setShowPreMatch(false)}
        />
      )}

      {ownerBoxData && !showPostMatch && (
        <OwnerBox
          timeline={ownerBoxData.timeline}
          playerTeamName={ownerBoxData.playerTeamName}
          opponentTeamName={ownerBoxData.opponentTeamName}
          onComplete={() => setShowPostMatch(true)}
        />
      )}

      {ownerBoxData && showPostMatch && (
        <PostMatchScreen
          timeline={ownerBoxData.timeline}
          playerTeamName={ownerBoxData.playerTeamName}
          opponentTeamName={ownerBoxData.opponentTeamName}
          state={state}
          events={events}
          onContinue={() => { setOwnerBoxData(null); setShowPostMatch(false); }}
        />
      )}

      {state.boardUltimatum && ultimatumDismissedWeek !== state.boardUltimatum.issuedWeek && (
        <BoardUltimatumModal
          state={state}
          onDismiss={() => setUltimatumDismissedWeek(state.boardUltimatum!.issuedWeek)}
        />
      )}
    </div>
  );
}
