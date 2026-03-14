/**
 * Training Focus Tests
 *
 * Verifies SET_TRAINING_FOCUS command → TRAINING_FOCUS_SET event → reducer.
 */

import { handleCommand } from '../commands/handlers';
import { buildState, reduceEvent } from '../reducers';
import { GameStartedEvent, TrainingFocusSetEvent } from '../events/types';

const gameStartedEvent: GameStartedEvent = {
  type: 'GAME_STARTED',
  timestamp: 1000,
  clubId: 'player-club',
  clubName: 'Test FC',
  initialBudget: 100_000_000,
  difficulty: 'MEDIUM',
  seed: 'training-focus-test-seed',
};

function baseState() {
  return buildState([gameStartedEvent]);
}

describe('SET_TRAINING_FOCUS command', () => {
  it('produces a TRAINING_FOCUS_SET event with correct focus', () => {
    const state = baseState();
    const result = handleCommand({ type: 'SET_TRAINING_FOCUS', focus: 'ATTACKING' }, state);

    expect(result.error).toBeUndefined();
    expect(result.events).toHaveLength(1);

    const event = result.events![0] as TrainingFocusSetEvent;
    expect(event.type).toBe('TRAINING_FOCUS_SET');
    expect(event.focus).toBe('ATTACKING');
    expect(event.previousFocus).toBeNull();
    expect(event.clubId).toBe('player-club');
  });

  it('records the previous focus when changing', () => {
    const state = baseState();

    // Apply first focus
    const r1 = handleCommand({ type: 'SET_TRAINING_FOCUS', focus: 'DEFENSIVE' }, state);
    const stateAfterFirst = reduceEvent(state, r1.events![0]);

    // Change to a second focus
    const r2 = handleCommand({ type: 'SET_TRAINING_FOCUS', focus: 'FITNESS' }, stateAfterFirst);
    const event2 = r2.events![0] as TrainingFocusSetEvent;

    expect(event2.previousFocus).toBe('DEFENSIVE');
    expect(event2.focus).toBe('FITNESS');
  });
});

describe('TRAINING_FOCUS_SET reducer', () => {
  it('sets club.trainingFocus on state', () => {
    const state = baseState();
    expect(state.club.trainingFocus).toBeNull();

    const event: TrainingFocusSetEvent = {
      type: 'TRAINING_FOCUS_SET',
      timestamp: Date.now(),
      clubId: 'player-club',
      focus: 'SET_PIECES',
      previousFocus: null,
    };

    const next = reduceEvent(state, event);
    expect(next.club.trainingFocus).toBe('SET_PIECES');
  });

  it('overwrites an existing focus', () => {
    let state = baseState();

    const e1: TrainingFocusSetEvent = {
      type: 'TRAINING_FOCUS_SET',
      timestamp: 1,
      clubId: 'player-club',
      focus: 'ATTACKING',
      previousFocus: null,
    };
    state = reduceEvent(state, e1);
    expect(state.club.trainingFocus).toBe('ATTACKING');

    const e2: TrainingFocusSetEvent = {
      type: 'TRAINING_FOCUS_SET',
      timestamp: 2,
      clubId: 'player-club',
      focus: 'YOUTH_INTEGRATION',
      previousFocus: 'ATTACKING',
    };
    state = reduceEvent(state, e2);
    expect(state.club.trainingFocus).toBe('YOUTH_INTEGRATION');
  });

  it('is preserved through buildState event replay', () => {
    const events = [
      gameStartedEvent,
      {
        type: 'TRAINING_FOCUS_SET' as const,
        timestamp: 2000,
        clubId: 'player-club',
        focus: 'DEFENSIVE' as const,
        previousFocus: null,
      },
    ];

    const state = buildState(events);
    expect(state.club.trainingFocus).toBe('DEFENSIVE');
  });
});
