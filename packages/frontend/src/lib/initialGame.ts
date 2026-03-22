/**
 * Bootstrap a new game state, or rehydrate from a saved event log.
 * Starts in PRE_SEASON — the player must pick a formation before the season begins.
 */
import {
  buildState,
  GameEvent,
  GameState,
} from '@calculating-glory/domain';
import { loadEvents } from './persistence';

const CLUB_ID = 'calculating-glory-fc';
const CLUB_NAME = 'Calculating Glory FC';
const SEED = 'calculating-glory-mvp-v1';
const START_BUDGET = 50000000; // £500,000

export function createInitialGameState(): { state: GameState; events: GameEvent[] } {
  const events: GameEvent[] = [
    {
      type: 'GAME_STARTED',
      timestamp: Date.now(),
      clubId: CLUB_ID,
      clubName: CLUB_NAME,
      initialBudget: START_BUDGET,
      difficulty: 'MEDIUM',
      seed: SEED,
    },
  ];

  return { state: buildState(events), events };
}

/**
 * Load a saved game from localStorage, or start a fresh one if nothing is saved.
 * Falls back to a fresh game if the saved data is corrupt or produces a broken state.
 */
export function loadOrCreateGameState(): { state: GameState; events: GameEvent[] } {
  const saved = loadEvents();
  if (saved && saved.length > 0) {
    try {
      const state = buildState(saved);
      return { state, events: saved };
    } catch {
      // Corrupt save — fall through to fresh game
    }
  }
  return createInitialGameState();
}
