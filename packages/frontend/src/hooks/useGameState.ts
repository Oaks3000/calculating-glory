/**
 * Central game state hook.
 * Manages the event log and re-derives state after every command.
 */
import { useState, useCallback } from 'react';
import {
  buildState,
  handleCommand,
  GameCommand,
  GameEvent,
  GameState,
} from '@calculating-glory/domain';
import { createInitialGameState } from '../lib/initialGame';

interface UseGameStateReturn {
  state: GameState;
  events: GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  isLoading: boolean;
}

const { state: initialState, events: initialEvents } = createInitialGameState();

export function useGameState(): UseGameStateReturn {
  const [events, setEvents] = useState<GameEvent[]>(initialEvents);
  const [state, setState] = useState<GameState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useCallback((command: GameCommand): { error?: string } => {
    setIsLoading(true);

    const result = handleCommand(command, state);

    if (result.error) {
      setIsLoading(false);
      return { error: result.error.message };
    }

    if (result.events && result.events.length > 0) {
      const newEvents = [...events, ...result.events];
      const newState = buildState(newEvents);
      setEvents(newEvents);
      setState(newState);
    }

    setIsLoading(false);
    return {};
  }, [state, events]);

  return { state, events, dispatch, isLoading };
}
