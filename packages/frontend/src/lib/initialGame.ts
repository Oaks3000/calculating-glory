/**
 * Bootstrap a new game state, or rehydrate from a saved event log.
 * Starts in PRE_SEASON — the player must pick a formation before the season begins.
 */
import {
  buildState,
  GameEvent,
  GameState,
  CurriculumLevel,
  CURRICULUM_LEVELS,
} from '@calculating-glory/domain';
import { loadEvents } from './persistence';

const CLUB_ID = 'calculating-glory-fc';
const CLUB_NAME = 'Calculating Glory FC';
const STADIUM_NAME = 'Glory Park';
const SEED = 'calculating-glory-mvp-v1';

/**
 * Create a fresh game state for the given curriculum level.
 * The starting budget is derived from the curriculum config's budgetScale,
 * so a Year 7 student starts with £500k and a GCSE Higher student starts with £50M.
 * Division progression is completely separate — both start in League Two.
 */
export function createInitialGameState(
  curriculumLevel: CurriculumLevel = 'YEAR_7',
  clubName: string = CLUB_NAME,
  stadiumName: string = STADIUM_NAME,
): { state: GameState; events: GameEvent[] } {
  const config = CURRICULUM_LEVELS[curriculumLevel];

  // Derive a stable club ID from the club name
  const clubId = clubName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || CLUB_ID;

  const events: GameEvent[] = [
    {
      type: 'GAME_STARTED',
      timestamp: Date.now(),
      clubId,
      clubName,
      stadiumName,
      initialBudget: config.budgetScale.transferBudget,
      difficulty: 'MEDIUM',
      seed: SEED,
      curriculumLevel,
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
