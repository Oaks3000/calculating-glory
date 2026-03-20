/**
 * Phase 5.8 — Owner Forced Out Tests
 *
 * Covers:
 *  - OWNER_FORCED_OUT trigger conditions (week ≥ 30, bottom 3, budget < £10k)
 *  - Non-trigger conditions (wrong week, good position, sufficient budget)
 *  - No double-trigger if already FORCED_OUT
 *  - OWNER_FORCED_OUT reducer: sets phase, populates forcedOut
 *  - ACCEPT_TAKEOVER command: validation, happy path
 *  - TAKEOVER_ACCEPTED reducer: new club id/name/budget, squad reset, forcedOut cleared
 *  - Business acumen carries over through takeover
 */

import { handleCommand } from '../commands/handlers';
import { buildState, reduceEvent } from '../reducers';
import { GameEvent, GameStartedEvent, OwnerForcedOutEvent, TakeoverAcceptedEvent } from '../events/types';
import { GameState } from '../types/game-state-updated';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const GAME_STARTED: GameStartedEvent = {
  type:          'GAME_STARTED',
  timestamp:     1000,
  clubId:        'player-club',
  clubName:      'Player FC',
  initialBudget: 500_000_000, // £5m
  difficulty:    'MEDIUM',
  seed:          'forced-out-seed',
};

function baseState(): GameState {
  return buildState([GAME_STARTED]);
}

/**
 * Manufacture a GameState that has the league entries needed for bottom-3
 * testing, without having to simulate 30 weeks of matches.
 */
function stateWithLeaguePosition(opts: {
  position: number;       // 1-24
  budget: number;         // pence
  week: number;
  phase?: GameState['phase'];
  forcedOutAlready?: boolean;
}): GameState {
  const s = baseState();

  // Build 24 league entries. Position 24 is the player; everything else is NPC.
  const entries = Array.from({ length: 24 }, (_, i) => {
    const pos = i + 1;
    const isPlayer = pos === opts.position;
    return {
      clubId:        isPlayer ? 'player-club' : `npc-club-${pos}`,
      clubName:      isPlayer ? 'Player FC'   : `NPC Club ${pos}`,
      position:      pos,
      played:        30,
      won:           24 - pos,
      drawn:         0,
      lost:          pos - 1,
      goalsFor:      60 - pos,
      goalsAgainst:  pos,
      goalDifference: (60 - pos) - pos,
      points:        (24 - pos) * 3,
      form:          [] as ('W' | 'D' | 'L')[],
    };
  });

  return {
    ...s,
    phase:       opts.phase ?? 'LATE_SEASON',
    currentWeek: opts.week,
    season:      1,
    forcedOut:   opts.forcedOutAlready ? {
      previousClubId:   'player-club',
      previousClubName: 'Player FC',
      previousPosition: opts.position,
      takeoverClubId:   'npc-club-24',
      takeoverClubName: 'NPC Club 24',
      week:             opts.week,
    } : null,
    club: {
      ...s.club,
      transferBudget: opts.budget,
    },
    league: {
      ...s.league,
      entries,
    },
  };
}

// ─── Trigger conditions ───────────────────────────────────────────────────────

describe('OWNER_FORCED_OUT trigger', () => {
  test('fires when week ≥ 30, position 22, budget < £10k', () => {
    const state = stateWithLeaguePosition({ position: 22, budget: 900_000, week: 30 });
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 30, season: 1, seed: 'test' }, state);

    expect(result.error).toBeUndefined();
    const forcedOutEvent = result.events?.find(e => e.type === 'OWNER_FORCED_OUT');
    expect(forcedOutEvent).toBeDefined();
    expect((forcedOutEvent as OwnerForcedOutEvent).previousClubId).toBe('player-club');
    expect((forcedOutEvent as OwnerForcedOutEvent).previousPosition).toBe(22);
  });

  test('fires for position 23', () => {
    const state = stateWithLeaguePosition({ position: 23, budget: 500_000, week: 35 });
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 35, season: 1, seed: 'test' }, state);
    expect(result.events?.some(e => e.type === 'OWNER_FORCED_OUT')).toBe(true);
  });

  test('fires for position 24', () => {
    const state = stateWithLeaguePosition({ position: 24, budget: 0, week: 40 });
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 40, season: 1, seed: 'test' }, state);
    expect(result.events?.some(e => e.type === 'OWNER_FORCED_OUT')).toBe(true);
  });

  test('does NOT fire before week 30 even if bottom 3 and broke', () => {
    const state = stateWithLeaguePosition({ position: 24, budget: 0, week: 29 });
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 29, season: 1, seed: 'test' }, state);
    expect(result.events?.some(e => e.type === 'OWNER_FORCED_OUT')).toBe(false);
  });

  test('does NOT fire if position is safe (top 21)', () => {
    const state = stateWithLeaguePosition({ position: 21, budget: 0, week: 35 });
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 35, season: 1, seed: 'test' }, state);
    expect(result.events?.some(e => e.type === 'OWNER_FORCED_OUT')).toBe(false);
  });

  test('does NOT fire if budget is ≥ £10k (1_000_000 pence)', () => {
    const state = stateWithLeaguePosition({ position: 24, budget: 1_000_000, week: 35 });
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 35, season: 1, seed: 'test' }, state);
    expect(result.events?.some(e => e.type === 'OWNER_FORCED_OUT')).toBe(false);
  });

  test('does NOT fire if phase is already FORCED_OUT', () => {
    const state = stateWithLeaguePosition({
      position: 24, budget: 0, week: 35,
      phase: 'FORCED_OUT', forcedOutAlready: true,
    });
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 35, season: 1, seed: 'test' }, state);
    expect(result.events?.some(e => e.type === 'OWNER_FORCED_OUT')).toBe(false);
  });

  test('does NOT fire if phase is SEASON_END', () => {
    const state = stateWithLeaguePosition({
      position: 24, budget: 0, week: 35,
      phase: 'SEASON_END',
    });
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 35, season: 1, seed: 'test' }, state);
    expect(result.events?.some(e => e.type === 'OWNER_FORCED_OUT')).toBe(false);
  });

  test('OWNER_FORCED_OUT event short-circuits — no SEASON_ENDED included', () => {
    const state = stateWithLeaguePosition({ position: 24, budget: 0, week: 35 });
    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 35, season: 1, seed: 'test' }, state);
    expect(result.events?.some(e => e.type === 'SEASON_ENDED')).toBe(false);
    expect(result.events?.some(e => e.type === 'OWNER_FORCED_OUT')).toBe(true);
  });

  test('takeover club is lowest-ranked NPC (not the player club)', () => {
    // Player is position 24 — so the lowest NPC would be position 23
    const s = baseState();
    const entries = Array.from({ length: 24 }, (_, i) => {
      const pos = i + 1;
      const isPlayer = pos === 24;
      return {
        clubId:        isPlayer ? 'player-club' : `npc-${pos}`,
        clubName:      isPlayer ? 'Player FC'   : `NPC ${pos}`,
        position:      pos,
        played:        30,
        won:           0,
        drawn:         0,
        lost:          30,
        goalsFor:      0,
        goalsAgainst:  90,
        goalDifference: -90,
        points:        0,
        form:          [] as ('W' | 'D' | 'L')[],
      };
    });

    const state: GameState = {
      ...s,
      phase: 'LATE_SEASON',
      currentWeek: 35,
      club: { ...s.club, transferBudget: 0 },
      league: { ...s.league, entries },
    };

    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 35, season: 1, seed: 'test' }, state);
    const fo = result.events?.find(e => e.type === 'OWNER_FORCED_OUT') as OwnerForcedOutEvent | undefined;
    expect(fo).toBeDefined();
    // Player is at 24 — sorted descending by position: 24, 23, 22... first that isn't player → 23
    expect(fo!.takeoverClubId).toBe('npc-23');
  });
});

// ─── Reducer: OWNER_FORCED_OUT ────────────────────────────────────────────────

describe('reduceEvent OWNER_FORCED_OUT', () => {
  function makeForcedOutEvent(overrides: Partial<OwnerForcedOutEvent> = {}): OwnerForcedOutEvent {
    return {
      type:             'OWNER_FORCED_OUT',
      timestamp:        Date.now(),
      previousClubId:   'player-club',
      previousClubName: 'Player FC',
      previousPosition: 22,
      takeoverClubId:   'npc-club-24',
      takeoverClubName: 'NPC Club 24',
      seed:             'test-seed',
      week:             30,
      ...overrides,
    };
  }

  test('sets phase to FORCED_OUT', () => {
    const state = baseState();
    const next  = reduceEvent(state, makeForcedOutEvent());
    expect(next.phase).toBe('FORCED_OUT');
  });

  test('populates forcedOut with all required fields', () => {
    const state = baseState();
    const evt   = makeForcedOutEvent({ previousPosition: 23, week: 32 });
    const next  = reduceEvent(state, evt);
    expect(next.forcedOut).not.toBeNull();
    expect(next.forcedOut!.previousClubId).toBe('player-club');
    expect(next.forcedOut!.previousClubName).toBe('Player FC');
    expect(next.forcedOut!.previousPosition).toBe(23);
    expect(next.forcedOut!.takeoverClubId).toBe('npc-club-24');
    expect(next.forcedOut!.takeoverClubName).toBe('NPC Club 24');
    expect(next.forcedOut!.week).toBe(32);
  });

  test('does not mutate original state', () => {
    const state = baseState();
    reduceEvent(state, makeForcedOutEvent());
    expect(state.phase).not.toBe('FORCED_OUT');
    expect(state.forcedOut).toBeNull();
  });
});

// ─── Command: ACCEPT_TAKEOVER ─────────────────────────────────────────────────

describe('ACCEPT_TAKEOVER command', () => {
  function forcedOutState(week = 35): GameState {
    const s = baseState();
    return {
      ...s,
      phase:       'FORCED_OUT',
      currentWeek: week,
      forcedOut: {
        previousClubId:   'player-club',
        previousClubName: 'Player FC',
        previousPosition: 22,
        takeoverClubId:   'npc-club-24',
        takeoverClubName: 'NPC Club 24',
        week,
      },
    };
  }

  test('returns TAKEOVER_ACCEPTED event on success', () => {
    const state  = forcedOutState();
    const result = handleCommand({ type: 'ACCEPT_TAKEOVER' }, state);
    expect(result.error).toBeUndefined();
    const evt = result.events?.find(e => e.type === 'TAKEOVER_ACCEPTED') as TakeoverAcceptedEvent | undefined;
    expect(evt).toBeDefined();
    expect(evt!.takeoverClubId).toBe('npc-club-24');
    expect(evt!.takeoverClubName).toBe('NPC Club 24');
  });

  test('returns error if phase is not FORCED_OUT', () => {
    const state  = { ...baseState(), phase: 'EARLY_SEASON' as const };
    const result = handleCommand({ type: 'ACCEPT_TAKEOVER' }, state);
    expect(result.error).toBeDefined();
    expect(result.events).toBeUndefined();
  });

  test('returns error if forcedOut is null', () => {
    const s: GameState = { ...baseState(), phase: 'FORCED_OUT', forcedOut: null };
    const result = handleCommand({ type: 'ACCEPT_TAKEOVER' }, s);
    expect(result.error).toBeDefined();
  });
});

// ─── Reducer: TAKEOVER_ACCEPTED ───────────────────────────────────────────────

describe('reduceEvent TAKEOVER_ACCEPTED', () => {
  function makeTakeoverEvent(overrides: Partial<TakeoverAcceptedEvent> = {}): TakeoverAcceptedEvent {
    return {
      type:             'TAKEOVER_ACCEPTED',
      timestamp:        Date.now(),
      takeoverClubId:   'npc-club-24',
      takeoverClubName: 'NPC Club 24',
      seed:             'test-seed',
      week:             35,
      ...overrides,
    };
  }

  function forcedOutState(week = 35): GameState {
    const s = baseState();
    return {
      ...s,
      phase:           'FORCED_OUT',
      currentWeek:     week,
      boardConfidence: 80,
      forcedOut: {
        previousClubId:   'player-club',
        previousClubName: 'Player FC',
        previousPosition: 22,
        takeoverClubId:   'npc-club-24',
        takeoverClubName: 'NPC Club 24',
        week,
      },
    };
  }

  test('clears forcedOut to null', () => {
    const state = forcedOutState();
    const next  = reduceEvent(state, makeTakeoverEvent());
    expect(next.forcedOut).toBeNull();
  });

  test('updates club id and name', () => {
    const state = forcedOutState();
    const next  = reduceEvent(state, makeTakeoverEvent());
    expect(next.club.id).toBe('npc-club-24');
    expect(next.club.name).toBe('NPC Club 24');
  });

  test('sets transfer budget to £50,000 (5_000_000 pence)', () => {
    const state = forcedOutState();
    const next  = reduceEvent(state, makeTakeoverEvent());
    expect(next.club.transferBudget).toBe(5_000_000);
  });

  test('resets board confidence to 20', () => {
    const state = forcedOutState();
    const next  = reduceEvent(state, makeTakeoverEvent());
    expect(next.boardConfidence).toBe(20);
  });

  test('clears scout mission', () => {
    const s = forcedOutState();
    const state: GameState = {
      ...s,
      scoutMission: {
        status: 'SEARCHING',
        position: 'MID',
        attributePriority: null,
        budgetCeiling: 10_000_000,
        scoutFee: 100_000,
        weekStarted: 34,
      },
    };
    const next = reduceEvent(state, makeTakeoverEvent());
    expect(next.scoutMission).toBeNull();
  });

  test('sets phase to LATE_SEASON when week > 30', () => {
    const state = forcedOutState(35);
    const next  = reduceEvent(state, makeTakeoverEvent({ week: 35 }));
    expect(next.phase).toBe('LATE_SEASON');
  });

  test('sets phase to MID_SEASON when week is 16-30', () => {
    const state = forcedOutState(20);
    const next  = reduceEvent(state, makeTakeoverEvent({ week: 20 }));
    expect(next.phase).toBe('MID_SEASON');
  });

  test('sets phase to EARLY_SEASON when week ≤ 15', () => {
    const state = forcedOutState(10);
    const next  = reduceEvent(state, makeTakeoverEvent({ week: 10 }));
    expect(next.phase).toBe('EARLY_SEASON');
  });

  test('business acumen carries over unchanged', () => {
    const state = forcedOutState();
    const next  = reduceEvent(state, makeTakeoverEvent());
    // Should be identical reference / deep-equal to the original
    expect(next.businessAcumen).toEqual(state.businessAcumen);
  });

  test('generates a fresh squad (non-empty) for the new club', () => {
    const state = forcedOutState();
    const next  = reduceEvent(state, makeTakeoverEvent());
    expect(next.club.squad.length).toBeGreaterThan(0);
  });

  test('squad belongs to the new club (player ids contain new club id)', () => {
    const state = forcedOutState();
    const next  = reduceEvent(state, makeTakeoverEvent());
    // generateStartingSquad creates ids like `inherited-${clubId}-${index}`
    const allMatch = next.club.squad.every(p => p.id.includes('npc-club-24'));
    expect(allMatch).toBe(true);
  });

  test('is a no-op if forcedOut is null (idempotency guard)', () => {
    const state: GameState = { ...baseState(), phase: 'FORCED_OUT', forcedOut: null };
    const next  = reduceEvent(state, makeTakeoverEvent());
    // Should return original state unchanged
    expect(next.club.id).toBe(state.club.id);
  });
});

// ─── Full round-trip ──────────────────────────────────────────────────────────

describe('forced-out full round-trip via buildState', () => {
  test('applying OWNER_FORCED_OUT + TAKEOVER_ACCEPTED produces correct final state', () => {
    const fo: OwnerForcedOutEvent = {
      type:             'OWNER_FORCED_OUT',
      timestamp:        2000,
      previousClubId:   'player-club',
      previousClubName: 'Player FC',
      previousPosition: 23,
      takeoverClubId:   'npc-club-22',
      takeoverClubName: 'NPC Club 22',
      seed:             'forced-out-seed',
      week:             33,
    };

    const ta: TakeoverAcceptedEvent = {
      type:             'TAKEOVER_ACCEPTED',
      timestamp:        3000,
      takeoverClubId:   'npc-club-22',
      takeoverClubName: 'NPC Club 22',
      seed:             'forced-out-seed',
      week:             33,
    };

    const events: GameEvent[] = [GAME_STARTED, fo, ta];
    const state = buildState(events);

    // Phase is EARLY_SEASON because currentWeek is 0 — no WEEK_ADVANCED events in this chain.
    // The phase→week mapping is already covered by the unit tests above.
    expect(state.phase).not.toBe('FORCED_OUT');
    expect(state.forcedOut).toBeNull();
    expect(state.club.id).toBe('npc-club-22');
    expect(state.club.transferBudget).toBe(5_000_000);
    expect(state.boardConfidence).toBe(20);
  });
});
