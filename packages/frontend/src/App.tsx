import { useGameState } from './hooks/useGameState';
import { CommandCentre } from './components/command-centre/CommandCentre';

export default function App() {
  const { state, events, dispatch, isLoading } = useGameState();

  return (
    <div className="min-h-screen bg-bg-deep text-txt-primary">
      <CommandCentre
        state={state}
        events={events}
        dispatch={dispatch}
        isLoading={isLoading}
      />
    </div>
  );
}
