/**
 * Bootstrap a new game state.
 * Starts in PRE_SEASON — the player must pick a formation before the season begins.
 */
import {
  buildState,
  GameEvent,
  GameState,
} from '@calculating-glory/domain';

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
