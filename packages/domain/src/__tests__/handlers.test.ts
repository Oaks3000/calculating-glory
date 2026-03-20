/**
 * Command Handler Tests
 *
 * Tests each command handler via handleCommand, using buildState to produce
 * realistic GameState.
 */

import { handleCommand } from '../commands/handlers';
import { buildState } from '../reducers';
import { GameState, PendingClubEvent } from '../types/game-state-updated';
import { GameStartedEvent } from '../events/types';
import { Facility } from '../types/facility';
import { Player } from '../types/player';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const gameStartedEvent: GameStartedEvent = {
  type: 'GAME_STARTED',
  timestamp: 1000,
  clubId: 'player-club',
  clubName: 'Test FC',
  initialBudget: 100000000, // £1,000,000
  difficulty: 'MEDIUM',
  seed: 'handler-test-seed'
};

/** Base state: 24 teams in league, player club set up, PRE_SEASON */
function baseState(): GameState {
  return buildState([gameStartedEvent]);
}

/** State with a TRAINING_GROUND facility added to the player club */
function stateWithFacility(level = 1, budget = 100000000): GameState {
  const facility: Facility = {
    type: 'TRAINING_GROUND',
    level,
    upgradeCost: 5000000,
    benefit: { type: 'performance', improvement: 10 }
  };
  const s = baseState();
  return {
    ...s,
    club: { ...s.club, transferBudget: budget, facilities: [facility] }
  };
}

/** State with a pending club event */
function stateWithPendingEvent(resolved = false): GameState {
  const pending: PendingClubEvent = {
    id: 'event-1',
    templateId: 'burst-pipes',
    week: 1,
    title: 'Burst Pipes',
    description: 'The pipes burst.',
    severity: 'minor',
    choices: [
      { id: 'choice-a', label: 'Fix it', description: 'Pay to fix', budgetEffect: -500000, reputationEffect: 0 },
      { id: 'choice-b', label: 'Ignore', description: 'Ignore it', budgetEffect: 0, reputationEffect: -5 }
    ],
    resolved
  };
  const s = baseState();
  return { ...s, pendingEvents: [pending] };
}

// ─── Unknown command ──────────────────────────────────────────────────────────

describe('handleCommand — unknown type', () => {
  it('returns an error for unknown command types', () => {
    const result = handleCommand({ type: 'UNKNOWN_CMD' } as any, baseState());
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Unknown command type');
  });
});

// ─── MAKE_TRANSFER ────────────────────────────────────────────────────────────

describe('handleCommand — MAKE_TRANSFER', () => {
  it('produces a TRANSFER_COMPLETED event on success', () => {
    const state = baseState();
    const result = handleCommand({
      type: 'MAKE_TRANSFER',
      playerId: 'new-player-1',
      clubId: 'player-club',
      offeredFee: 5000000,
      offeredWages: 50000
    }, state);
    expect(result.error).toBeUndefined();
    expect(result.events).toBeDefined();
    expect(result.events![0].type).toBe('TRANSFER_COMPLETED');
  });

  it('returns an error when transfer budget is insufficient', () => {
    const state: GameState = { ...baseState(), club: { ...baseState().club, transferBudget: 100 } };
    const result = handleCommand({
      type: 'MAKE_TRANSFER',
      playerId: 'some-player',
      clubId: 'player-club',
      offeredFee: 5000000,
      offeredWages: 50000
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('VALIDATION_FAILED');
  });

  it('returns an error when squad is full (25 players)', () => {
    const s = baseState();
    const fullSquad: Player[] = Array.from({ length: 25 }, (_, i) => ({
      id: `player-${i}`, name: `Player ${i}`, position: 'MID' as const,
      wage: 10000, transferValue: 1000000, age: 25, morale: 70,
      attributes: { attack: 45, defence: 40, teamwork: 50, charisma: 40, publicPotential: 50 },
      truePotential: 50,
      contractExpiresWeek: 46,
      stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 60 }
    }));
    const state: GameState = { ...s, club: { ...s.club, squad: fullSquad } };
    const result = handleCommand({
      type: 'MAKE_TRANSFER',
      playerId: 'new-player',
      clubId: 'player-club',
      offeredFee: 1000000,
      offeredWages: 10000
    }, state);
    expect(result.error).toBeDefined();
  });
});

// ─── UPGRADE_FACILITY ─────────────────────────────────────────────────────────

describe('handleCommand — UPGRADE_FACILITY', () => {
  it('produces a FACILITY_UPGRADED event on success', () => {
    const state = stateWithFacility(1, 100000000);
    const result = handleCommand({
      type: 'UPGRADE_FACILITY',
      clubId: 'player-club',
      facilityType: 'TRAINING_GROUND'
    }, state);
    expect(result.error).toBeUndefined();
    expect(result.events).toBeDefined();
    expect(result.events![0].type).toBe('FACILITY_UPGRADED');
  });

  it('returns an error when facility does not exist', () => {
    const s = baseState();
    const state: GameState = { ...s, club: { ...s.club, facilities: [] } };
    const result = handleCommand({
      type: 'UPGRADE_FACILITY',
      clubId: 'player-club',
      facilityType: 'TRAINING_GROUND'
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('not found');
  });

  it('returns an error when facility is at max level', () => {
    const state = stateWithFacility(5, 100000000);
    const result = handleCommand({
      type: 'UPGRADE_FACILITY',
      clubId: 'player-club',
      facilityType: 'TRAINING_GROUND'
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('maximum level');
  });

  it('returns an error when budget is insufficient', () => {
    const state = stateWithFacility(1, 100); // very low budget
    const result = handleCommand({
      type: 'UPGRADE_FACILITY',
      clubId: 'player-club',
      facilityType: 'TRAINING_GROUND'
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('budget');
  });
});

// ─── HIRE_STAFF ───────────────────────────────────────────────────────────────

describe('handleCommand — HIRE_STAFF', () => {
  it('produces a STAFF_HIRED event on success', () => {
    const s = baseState();
    const state: GameState = { ...s, club: { ...s.club, wageBudget: 10000000 } };
    const result = handleCommand({
      type: 'HIRE_STAFF',
      staffId: 'coach-1',
      clubId: 'player-club'
    }, state);
    expect(result.error).toBeUndefined();
    expect(result.events).toBeDefined();
    expect(result.events![0].type).toBe('STAFF_HIRED');
  });

  it('returns an error when wage budget is insufficient', () => {
    const s = baseState();
    // wageBudget is 10% of initialBudget = 10,000,000 pence = £100,000/week
    // Mock staff wages = 50,000 pence = £500/week, so this should pass by default
    // Override with tiny wageBudget
    const state: GameState = { ...s, club: { ...s.club, wageBudget: 100 } };
    const result = handleCommand({
      type: 'HIRE_STAFF',
      staffId: 'coach-1',
      clubId: 'player-club'
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('VALIDATION_FAILED');
  });
});

// ─── SIMULATE_WEEK ────────────────────────────────────────────────────────────

describe('handleCommand — SIMULATE_WEEK', () => {
  it('simulates week 1 and produces match events', () => {
    const state = buildState([{ ...gameStartedEvent, type: 'GAME_STARTED' }]);
    // Phase must not be PRE_SEASON blocking... actually SIMULATE_WEEK doesn't check phase
    const result = handleCommand({
      type: 'SIMULATE_WEEK',
      week: 1,
      season: 1,
      seed: 'test'
    }, state);
    expect(result.error).toBeUndefined();
    expect(result.events).toBeDefined();
    // Should have 12 match events + WEEK_ADVANCED at minimum
    const matchEvents = result.events!.filter(e => e.type === 'MATCH_SIMULATED');
    expect(matchEvents).toHaveLength(12);
    const weekAdvanced = result.events!.find(e => e.type === 'WEEK_ADVANCED');
    expect(weekAdvanced).toBeDefined();
  });

  it('returns error when there are unresolved pending events', () => {
    const state = stateWithPendingEvent(false);
    const result = handleCommand({
      type: 'SIMULATE_WEEK',
      week: 1,
      season: 1,
      seed: 'test'
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Resolve pending events');
  });

  it('returns error when league has fewer than 2 teams', () => {
    const s = baseState();
    const state: GameState = {
      ...s,
      league: { ...s.league, entries: [] }
    };
    const result = handleCommand({
      type: 'SIMULATE_WEEK',
      week: 1,
      season: 1,
      seed: 'test'
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('at least 2 teams');
  });

  it('produces SEASON_ENDED event when simulating week 46', () => {
    const state = baseState();
    const result = handleCommand({
      type: 'SIMULATE_WEEK',
      week: 46,
      season: 1,
      seed: 'test'
    }, state);
    expect(result.error).toBeUndefined();
    const seasonEnded = result.events!.find(e => e.type === 'SEASON_ENDED');
    expect(seasonEnded).toBeDefined();
  });
});

// ─── RECORD_MATH_ATTEMPT ──────────────────────────────────────────────────────

describe('handleCommand — RECORD_MATH_ATTEMPT', () => {
  it('produces MATH_ATTEMPT_RECORDED with correct=true when answer matches', () => {
    const result = handleCommand({
      type: 'RECORD_MATH_ATTEMPT',
      studentId: 'student-1',
      topic: 'percentage',
      difficulty: 1,
      answer: 42,
      expectedAnswer: 42,
      startTime: 1000,
      endTime: 6000
    }, baseState());
    expect(result.error).toBeUndefined();
    expect(result.events![0].type).toBe('MATH_ATTEMPT_RECORDED');
    expect((result.events![0] as any).correct).toBe(true);
  });

  it('produces MATH_ATTEMPT_RECORDED with correct=false when answer is wrong', () => {
    const result = handleCommand({
      type: 'RECORD_MATH_ATTEMPT',
      studentId: 'student-1',
      topic: 'algebra',
      difficulty: 2,
      answer: 10,
      expectedAnswer: 42,
      startTime: 1000,
      endTime: 10000
    }, baseState());
    expect(result.error).toBeUndefined();
    expect((result.events![0] as any).correct).toBe(false);
  });

  it('records time spent correctly', () => {
    const result = handleCommand({
      type: 'RECORD_MATH_ATTEMPT',
      studentId: 'student-1',
      topic: 'decimals',
      difficulty: 3,
      answer: 5,
      expectedAnswer: 5,
      startTime: 1000,
      endTime: 4000
    }, baseState());
    expect((result.events![0] as any).timeSpent).toBe(3000);
  });
});

// ─── RESOLVE_CLUB_EVENT ───────────────────────────────────────────────────────

describe('handleCommand — RESOLVE_CLUB_EVENT', () => {
  it('produces CLUB_EVENT_RESOLVED on success', () => {
    const state = stateWithPendingEvent(false);
    const result = handleCommand({
      type: 'RESOLVE_CLUB_EVENT',
      eventId: 'event-1',
      choiceId: 'choice-a'
    }, state);
    expect(result.error).toBeUndefined();
    expect(result.events![0].type).toBe('CLUB_EVENT_RESOLVED');
  });

  it('returns error when event id is not found', () => {
    const state = baseState();
    const result = handleCommand({
      type: 'RESOLVE_CLUB_EVENT',
      eventId: 'nonexistent',
      choiceId: 'choice-a'
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('not found');
  });

  it('returns error when event is already resolved', () => {
    const state = stateWithPendingEvent(true);
    const result = handleCommand({
      type: 'RESOLVE_CLUB_EVENT',
      eventId: 'event-1',
      choiceId: 'choice-a'
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('already resolved');
  });

  it('returns error when choice id is not found', () => {
    const state = stateWithPendingEvent(false);
    const result = handleCommand({
      type: 'RESOLVE_CLUB_EVENT',
      eventId: 'event-1',
      choiceId: 'nonexistent-choice'
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('not found');
  });
});

// ─── START_SEASON ─────────────────────────────────────────────────────────────

describe('handleCommand — START_SEASON', () => {
  it('produces SEASON_STARTED when phase is PRE_SEASON', () => {
    const state = baseState(); // PRE_SEASON by default
    const result = handleCommand({
      type: 'START_SEASON',
      season: 1
    }, state);
    expect(result.error).toBeUndefined();
    expect(result.events![0].type).toBe('SEASON_STARTED');
  });

  it('returns error when phase is not PRE_SEASON', () => {
    const state: GameState = { ...baseState(), phase: 'EARLY_SEASON' };
    const result = handleCommand({
      type: 'START_SEASON',
      season: 1
    }, state);
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('INVALID_PHASE');
    expect(result.error?.message).toContain('PRE_SEASON');
  });
});
