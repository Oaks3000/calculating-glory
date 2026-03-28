import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { CommandCentre } from './components/command-centre/CommandCentre';
import { StadiumView } from './components/stadium-view/StadiumView';
import { ViewToggle, ActiveView } from './components/shared/ViewToggle';
import { PreSeasonScreen } from './components/pre-season/PreSeasonScreen';
import { SeasonEndScreen } from './components/season-end/SeasonEndScreen';
import { ForcedOutScreen } from './components/forced-out/ForcedOutScreen';

export default function App() {
  const { state, events, dispatch, isLoading, resetGame } = useGameState();
  const [activeView, setActiveView] = useState<ActiveView>('command');
  const [error, setError] = useState<string | null>(null);

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
      />

      {/* Error toast */}
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

      {/* Loading overlay */}
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
