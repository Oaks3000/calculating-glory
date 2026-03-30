/**
 * Central game state hook.
 * Manages the event log and re-derives state after every command.
 * Persists the event log to localStorage after every successful dispatch.
 */
import { useState, useCallback } from 'react';
import {
  buildState,
  handleCommand,
  GameCommand,
  GameEvent,
  GameState,
  CurriculumLevel,
} from '@calculating-glory/domain';
import { loadOrCreateGameState, createInitialGameState } from '../lib/initialGame';
import { saveEvents, clearSave } from '../lib/persistence';

interface UseGameStateReturn {
  state: GameState;
  events: GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  resetGame: (curriculumLevel?: CurriculumLevel, clubName?: string, stadiumName?: string) => void;
  isLoading: boolean;
}

const { state: initialState, events: initialEvents } = loadOrCreateGameState();

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
      saveEvents(newEvents);
    }

    setIsLoading(false);
    return {};
  }, [state, events]);

  const resetGame = useCallback((
    curriculumLevel: CurriculumLevel = 'YEAR_7',
    clubName?: string,
    stadiumName?: string,
  ) => {
    clearSave();
    const { state: freshState, events: freshEvents } = createInitialGameState(curriculumLevel, clubName, stadiumName);
    setEvents(freshEvents);
    setState(freshState);
  }, []);

  return { state, events, dispatch, resetGame, isLoading };
}
