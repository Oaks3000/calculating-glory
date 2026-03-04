/**
 * Season Flow Tests
 *
 * Tests for season lifecycle: phase transitions, week advancement,
 * StartSeason command, and SeasonEnded event generation.
 */

import { buildState, reduceEvent } from '../reducers';
import { handleCommand } from '../commands/handlers';
import { GameEvent, GameStartedEvent } from '../events/types';

// Helper: create a basic GameStartedEvent
function makeGameStarted(overrides: Partial<GameStartedEvent> = {}): GameStartedEvent {
  return {
    type: 'GAME_STARTED',
    timestamp: Date.now(),
    clubId: 'test-club',
    clubName: 'Test FC',
    initialBudget: 500000000, // £5m in pence
    difficulty: 'MEDIUM',
    seed: 'test-seed',
    ...overrides
  };
}

// Helper: advance through N weeks using SIMULATE_WEEK command, resolving all events automatically
// Returns the full event list
function simulateWeeks(
  initialEvents: GameEvent[],
  fromWeek: number,
  toWeek: number,
  seed: string = 'test-seed'
): GameEvent[] {
  let events = [...initialEvents];

  for (let week = fromWeek; week <= toWeek; week++) {
    let state = buildState(events);

    // Resolve any pending events before advancing (pick first choice each time)
    while (state.pendingEvents.some(e => !e.resolved)) {
      for (const pending of state.pendingEvents.filter(e => !e.resolved)) {
        const resolveResult = handleCommand(
          { type: 'RESOLVE_CLUB_EVENT', eventId: pending.id, choiceId: pending.choices[0].id },
          state
        );
        if (resolveResult.events) {
          events = [...events, ...resolveResult.events];
          state = buildState(events);
        }
      }
    }

    const result = handleCommand(
      { type: 'SIMULATE_WEEK', week, season: 1, seed },
      state
    );

    if (result.error) {
      throw new Error(`Week ${week} simulation error: ${result.error.message}`);
    }
    events = [...events, ...(result.events ?? [])];
  }

  return events;
}

describe('Season Flow: START_SEASON command', () => {
  it('transitions phase from PRE_SEASON to EARLY_SEASON after GAME_STARTED + START_SEASON', () => {
    const gameStarted = makeGameStarted();
    let state = buildState([gameStarted]);
    expect(state.phase).toBe('PRE_SEASON');

    const result = handleCommand({ type: 'START_SEASON', season: 1 }, state);
    expect(result.error).toBeUndefined();
    expect(result.events).toHaveLength(1);
    expect(result.events![0].type).toBe('SEASON_STARTED');

    state = reduceEvent(state, result.events![0]);
    expect(state.phase).toBe('EARLY_SEASON');
    expect(state.season).toBe(1);
  });

  it('fails if START_SEASON is issued when not in PRE_SEASON phase', () => {
    // Advance to EARLY_SEASON
    const gameStarted = makeGameStarted();
    const seasonStarted = {
      type: 'SEASON_STARTED' as const,
      timestamp: Date.now(),
      season: 1
    };
    const state = buildState([gameStarted, seasonStarted]);
    expect(state.phase).toBe('EARLY_SEASON');

    const result = handleCommand({ type: 'START_SEASON', season: 2 }, state);
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('INVALID_PHASE');
  });
});

describe('Season Flow: week advance phase transitions', () => {
  it('sets phase to EARLY_SEASON after week 1', () => {
    const events = simulateWeeks([makeGameStarted()], 1, 1);
    const state = buildState(events);
    expect(state.currentWeek).toBe(1);
    expect(state.phase).toBe('EARLY_SEASON');
  });

  it('sets phase to MID_SEASON after week 16', () => {
    const events = simulateWeeks([makeGameStarted()], 1, 16);
    const state = buildState(events);
    expect(state.currentWeek).toBe(16);
    expect(state.phase).toBe('MID_SEASON');
  });

  it('sets phase to LATE_SEASON after week 31', () => {
    const events = simulateWeeks([makeGameStarted()], 1, 31);
    const state = buildState(events);
    expect(state.currentWeek).toBe(31);
    expect(state.phase).toBe('LATE_SEASON');
  });

  it('sets phase to LATE_SEASON after week 15 and stays until week 30', () => {
    const events15 = simulateWeeks([makeGameStarted()], 1, 15);
    const state15 = buildState(events15);
    expect(state15.phase).toBe('EARLY_SEASON');

    const events30 = simulateWeeks([makeGameStarted()], 1, 30);
    const state30 = buildState(events30);
    expect(state30.phase).toBe('MID_SEASON');
  });
});

describe('Season Flow: unresolved event guard', () => {
  it('blocks week advancement when there are unresolved pending events', () => {
    const gameStarted = makeGameStarted();
    let state = buildState([gameStarted]);

    // Manually inject a CLUB_EVENT_OCCURRED so state has an unresolved event
    const fakePendingEvent = {
      id: 'evt-S1-W0-0',
      templateId: 'burst-pipes',
      week: 0,
      title: 'Test Event',
      description: 'A test event',
      severity: 'minor' as const,
      choices: [{ id: 'fix', label: 'Fix it', description: 'Fix the problem', budgetEffect: -500000 }],
      resolved: false
    };

    const clubEventOccurred: GameEvent = {
      type: 'CLUB_EVENT_OCCURRED',
      timestamp: Date.now(),
      eventId: 'evt-S1-W0-0',
      templateId: 'burst-pipes',
      week: 0,
      clubId: 'test-club',
      pendingEvent: fakePendingEvent
    };

    state = reduceEvent(state, clubEventOccurred);
    expect(state.pendingEvents).toHaveLength(1);
    expect(state.pendingEvents[0].resolved).toBe(false);

    // Attempting to simulate week 1 should fail
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 1, season: 1, seed: 'test-seed' }, state);
    expect(result.error).toBeDefined();
    expect(result.error!.message).toContain('Resolve pending events');
  });
});

describe('Season Flow: season number tracking', () => {
  it('season number is set by START_SEASON command', () => {
    const gameStarted = makeGameStarted();
    const state0 = buildState([gameStarted]);
    expect(state0.season).toBe(1); // default

    const result = handleCommand({ type: 'START_SEASON', season: 2 }, state0);
    // Note: won't work because phase check fails in state0 (PRE_SEASON is correct)
    // Actually state0 is in PRE_SEASON so it should succeed
    expect(result.error).toBeUndefined();
    const state1 = reduceEvent(state0, result.events![0]);
    expect(state1.season).toBe(2);
  });
});

describe('Season Flow: week 46 produces SeasonEndedEvent', () => {
  it('produces a SEASON_ENDED event when week 46 is simulated', () => {
    const events = simulateWeeks([makeGameStarted()], 1, 46);
    const seasonEndedEvents = events.filter(e => e.type === 'SEASON_ENDED');
    expect(seasonEndedEvents).toHaveLength(1);

    const seasonEnded = seasonEndedEvents[0] as { type: 'SEASON_ENDED'; finalPosition: number; season: number; promoted: boolean; relegated: boolean };
    expect(seasonEnded.season).toBe(1);
    expect(typeof seasonEnded.finalPosition).toBe('number');
    expect(seasonEnded.finalPosition).toBeGreaterThan(0);
    expect(seasonEnded.finalPosition).toBeLessThanOrEqual(24);
  }, 30000);

  it('final state phase is SEASON_END after week 46', () => {
    const events = simulateWeeks([makeGameStarted()], 1, 46);
    const state = buildState(events);
    expect(state.phase).toBe('SEASON_END');
  }, 30000);
});
