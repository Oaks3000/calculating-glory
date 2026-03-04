/**
 * Bootstrap a mid-season game state for the MVP demo.
 * Starts at Week 20 with a realistic mid-table position.
 */
import {
  buildState,
  handleCommand,
  GameEvent,
  GameState,
} from '@calculating-glory/domain';

const CLUB_ID = 'calculating-glory-fc';
const CLUB_NAME = 'Calculating Glory FC';
const SEED = 'calculating-glory-mvp-v1';
const START_BUDGET = 50000000; // £500,000

export function createInitialGameState(): { state: GameState; events: GameEvent[] } {
  const events: GameEvent[] = [];

  // 1. Start the game
  const startEvent: GameEvent = {
    type: 'GAME_STARTED',
    timestamp: Date.now(),
    clubId: CLUB_ID,
    clubName: CLUB_NAME,
    initialBudget: START_BUDGET,
    difficulty: 'MEDIUM',
    seed: SEED,
  };
  events.push(startEvent);

  // 2. Start the season
  const seasonCmd = handleCommand({ type: 'START_SEASON', season: 1 }, buildState(events));
  if (seasonCmd.events) events.push(...seasonCmd.events);

  // 3. Simulate weeks 1-19 to reach mid-season
  for (let week = 1; week <= 19; week++) {
    const state = buildState(events);

    // Resolve any pending events automatically (pick first choice)
    for (const pending of state.pendingEvents.filter(e => !e.resolved)) {
      const resolveCmd = handleCommand(
        { type: 'RESOLVE_CLUB_EVENT', eventId: pending.id, choiceId: pending.choices[0].id },
        buildState(events)
      );
      if (resolveCmd.events) events.push(...resolveCmd.events);
    }

    const simCmd = handleCommand(
      { type: 'SIMULATE_WEEK', week, season: 1, seed: SEED },
      buildState(events)
    );
    if (simCmd.events) events.push(...simCmd.events);
  }

  return { state: buildState(events), events };
}
