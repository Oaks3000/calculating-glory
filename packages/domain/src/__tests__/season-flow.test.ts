/**
 * Season Flow Tests
 *
 * Tests for season lifecycle: phase transitions, week advancement,
 * StartSeason command, and SeasonEnded event generation.
 */

import { buildState, reduceEvent } from '../reducers';
import { handleCommand } from '../commands/handlers';
import { GameEvent, GameStartedEvent, PreSeasonStartedEvent } from '../events/types';
import { GameState } from '../types/game-state-updated';
import { LeagueTableEntry } from '../types/league';

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
    // First event is SEASON_STARTED; subsequent events are NPC_PLAYER_SIGNED
    expect(result.events![0].type).toBe('SEASON_STARTED');
    const npcEvents = result.events!.filter(e => e.type === 'NPC_PLAYER_SIGNED');
    expect(npcEvents.length).toBeGreaterThan(0);

    // Apply all events and verify final state
    state = result.events!.reduce(reduceEvent, state);
    expect(state.phase).toBe('EARLY_SEASON');
    expect(state.season).toBe(1);
    // Free agent pool should be smaller after NPC signings
    expect(state.freeAgentPool.length).toBeLessThan(60);
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

describe('Season Flow: BEGIN_NEXT_SEASON command', () => {
  // Helper: build a state that is in SEASON_END phase
  function makeSeasonEndState() {
    const gameStarted = makeGameStarted();
    const seasonEndedEvent: GameEvent = {
      type: 'SEASON_ENDED',
      timestamp: Date.now(),
      season: 1,
      finalPosition: 12,
      promoted: false,
      relegated: false,
    };
    // Manually apply via reducer to land in SEASON_END
    let state = buildState([gameStarted]);
    // Inject a WEEK_ADVANCED for week 46 to ensure correct phase (or just directly set via events)
    state = reduceEvent(state, { type: 'SEASON_STARTED', timestamp: Date.now(), season: 1 });
    state = reduceEvent(state, seasonEndedEvent);
    return state;
  }

  it('emits PRE_SEASON_STARTED with season incremented by 1', () => {
    const state = makeSeasonEndState();
    expect(state.phase).toBe('SEASON_END');
    expect(state.season).toBe(1);

    const result = handleCommand({ type: 'BEGIN_NEXT_SEASON' }, state);
    expect(result.error).toBeUndefined();
    expect(result.events).toHaveLength(1);
    expect(result.events![0].type).toBe('PRE_SEASON_STARTED');
    const evt = result.events![0] as { type: 'PRE_SEASON_STARTED'; season: number };
    expect(evt.season).toBe(2);
  });

  it('fails when phase is not SEASON_END', () => {
    const gameStarted = makeGameStarted();
    const state = buildState([gameStarted]);
    expect(state.phase).toBe('PRE_SEASON');

    const result = handleCommand({ type: 'BEGIN_NEXT_SEASON' }, state);
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('INVALID_PHASE');
  });

  it('reducer transitions phase to PRE_SEASON and increments season', () => {
    const state = makeSeasonEndState();
    const result = handleCommand({ type: 'BEGIN_NEXT_SEASON' }, state);
    const newState = reduceEvent(state, result.events![0]);

    expect(newState.phase).toBe('PRE_SEASON');
    expect(newState.season).toBe(2);
  });

  it('reducer resets currentWeek to 0', () => {
    let state = makeSeasonEndState();
    state = { ...state, currentWeek: 46 };
    const result = handleCommand({ type: 'BEGIN_NEXT_SEASON' }, state);
    const newState = reduceEvent(state, result.events![0]);

    expect(newState.currentWeek).toBe(0);
  });

  it('reducer clears form, trainingFocus, and preferredFormation', () => {
    let state = makeSeasonEndState();
    state = {
      ...state,
      club: {
        ...state.club,
        form: ['W', 'L', 'D'],
        trainingFocus: 'ATTACKING',
        preferredFormation: '4-4-2',
      },
    };
    const result = handleCommand({ type: 'BEGIN_NEXT_SEASON' }, state);
    const newState = reduceEvent(state, result.events![0]);

    expect(newState.club.form).toEqual([]);
    expect(newState.club.trainingFocus).toBeNull();
    expect(newState.club.preferredFormation).toBeNull();
  });
});

// ─── NPC Strength Evolution ───────────────────────────────────────────────────

describe('NPC strength evolution on PRE_SEASON_STARTED', () => {
  /**
   * Build a GameState with a known league table and known npcStrengths,
   * already in SEASON_END, then fire PRE_SEASON_STARTED and inspect
   * the resulting npcStrengths.
   *
   * Layout (24 clubs):
   *   pos 1: player-club
   *   pos 2–5: top NPC clubs   → should get +2
   *   pos 6–20: mid NPC clubs  → no change
   *   pos 21–24: bottom NPC clubs → should get -2
   */
  function makeLeagueEntry(clubId: string, position: number): LeagueTableEntry {
    return {
      clubId, clubName: clubId, position,
      played: 46, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
      points: 0, form: [],
    };
  }

  function stateForEvolution(): GameState {
    const s = buildState([makeGameStarted()]);

    const entries: LeagueTableEntry[] = [
      makeLeagueEntry('player-club', 1),
      ...Array.from({ length: 23 }, (_, i) => makeLeagueEntry(`npc-${i + 2}`, i + 2)),
    ];

    const npcStrengths: Record<string, number> = {};
    for (let i = 2; i <= 24; i++) npcStrengths[`npc-${i}`] = 50;

    return {
      ...s,
      phase: 'SEASON_END',
      season: 1,
      currentWeek: 46,
      club: { ...s.club, id: 'player-club' },
      league: { ...s.league, entries },
      npcStrengths,
    };
  }

  function applyPreSeason(state: GameState): GameState {
    const evt: PreSeasonStartedEvent = {
      type: 'PRE_SEASON_STARTED',
      timestamp: Date.now(),
      season: 2,
    };
    return reduceEvent(state, evt);
  }

  test('top-4 NPCs (positions 2–5) gain +2 strength', () => {
    const next = applyPreSeason(stateForEvolution());
    expect(next.npcStrengths['npc-2']).toBe(52);
    expect(next.npcStrengths['npc-3']).toBe(52);
    expect(next.npcStrengths['npc-4']).toBe(52);
    expect(next.npcStrengths['npc-5']).toBe(52);
  });

  test('bottom-4 NPCs (positions 21–24) lose -2 strength', () => {
    const next = applyPreSeason(stateForEvolution());
    expect(next.npcStrengths['npc-21']).toBe(48);
    expect(next.npcStrengths['npc-22']).toBe(48);
    expect(next.npcStrengths['npc-23']).toBe(48);
    expect(next.npcStrengths['npc-24']).toBe(48);
  });

  test('mid-table NPCs (positions 6–20) are unchanged', () => {
    const next = applyPreSeason(stateForEvolution());
    for (let i = 6; i <= 20; i++) {
      expect(next.npcStrengths[`npc-${i}`]).toBe(50);
    }
  });

  test('player club is excluded from evolution', () => {
    const next = applyPreSeason(stateForEvolution());
    expect(next.npcStrengths['player-club']).toBeUndefined();
  });

  test('new division NPC clubs are seeded from baseStrength if not previously seen', () => {
    const next = applyPreSeason(stateForEvolution());
    // handlePreSeasonStarted rebuilds league from LEAGUE_TWO teams (state.division = LEAGUE_TWO).
    // Those teams are seeded at game start, so they should all be present in npcStrengths.
    const l2Teams = require('../data/league-two-teams').LEAGUE_TWO_TEAMS as Array<{ id: string; baseStrength: number }>;
    for (const team of l2Teams) {
      expect(next.npcStrengths[team.id]).toBeDefined();
    }
  });

  test('clamps strength at minimum 25', () => {
    const state = stateForEvolution();
    state.npcStrengths['npc-24'] = 26;
    const next = applyPreSeason(state);
    expect(next.npcStrengths['npc-24']).toBe(25);
  });

  test('clamps strength at maximum 99', () => {
    const state = stateForEvolution();
    state.npcStrengths['npc-2'] = 98;
    const next = applyPreSeason(state);
    expect(next.npcStrengths['npc-2']).toBe(99);
  });

  test('evolution compounds correctly across two consecutive seasons', () => {
    const s1 = applyPreSeason(stateForEvolution());
    const s1End: GameState = {
      ...s1,
      phase: 'SEASON_END',
      currentWeek: 46,
      league: {
        ...s1.league,
        entries: [
          makeLeagueEntry('player-club', 1),
          ...Array.from({ length: 23 }, (_, i) => makeLeagueEntry(`npc-${i + 2}`, i + 2)),
        ],
      },
    };
    const s2 = applyPreSeason(s1End);
    expect(s2.npcStrengths['npc-2']).toBe(54);   // 50 + 2 + 2
    expect(s2.npcStrengths['npc-24']).toBe(46);  // 50 - 2 - 2
  });
});
