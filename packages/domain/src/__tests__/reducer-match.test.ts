import { reduceEvent } from '../reducers';
import { GameState } from '../types/game-state-updated';
import { MatchSimulatedEvent } from '../events/types';
import { LeagueTableEntry } from '../types/league';
import { CURRICULUM_LEVELS } from '../curriculum/curriculum-config';

function makeEntry(overrides: Partial<LeagueTableEntry> = {}): LeagueTableEntry {
  return {
    position: 1,
    clubId: 'club-1',
    clubName: 'Club 1',
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: [],
    ...overrides
  };
}

function makeState(entries: LeagueTableEntry[], playerClubId: string = 'club-1'): GameState {
  return {
    version: 1,
    curriculum: CURRICULUM_LEVELS.YEAR_7,
    events: [],
    checksum: '',
    currentWeek: 0,
    club: {
      id: playerClubId,
      name: 'Player FC',
      transferBudget: 0,
      wageBudget: 0,
      squad: [],
      staff: [],
      facilities: [],
      reputation: 50,
      stadium: { name: 'Test', capacity: 5000, averageAttendance: 3000, ticketPrice: 2000 },
      form: [],
      trainingFocus: null,
      preferredFormation: null,
      squadCapacity: 24,
      manager: null,
    },
    league: {
      entries,
      automaticPromotion: 3,
      playoffPositions: [4, 5, 6, 7],
      relegation: [23, 24]
    },
    boardConfidence: 50,
    businessAcumen: {
      financial: 0,
      statistical: 0,
      strategic: 0,
      recentPerformance: { percentage: 0, decimals: 0, ratios: 0, algebra: 0, statistics: 0, multiStep: 0, geometry: 0 }
    },
    phase: 'EARLY_SEASON',
    pendingEvents: [],
    resolvedEventHistory: [],
    season: 1,
    freeAgentPool: [],
    managerPool: [],
    lowMoraleWeeks: 0,
    moraleEventCooldowns: {},
    scoutMission: null,
    forcedOut: null,
    division: 'LEAGUE_TWO',
    npcStrengths: {},
    resolvedEventWeeks: {},
    mathsOutcomes: {},
  };
}

function makeMatchEvent(overrides: Partial<MatchSimulatedEvent> = {}): MatchSimulatedEvent {
  return {
    type: 'MATCH_SIMULATED',
    timestamp: Date.now(),
    matchId: 'S1-W1-M0',
    homeTeamId: 'club-1',
    awayTeamId: 'club-2',
    homeGoals: 2,
    awayGoals: 1,
    seed: 'test-seed',
    ...overrides
  };
}

describe('reducer: MATCH_SIMULATED', () => {
  it('updates league table entries for a home win', () => {
    const entries = [
      makeEntry({ clubId: 'club-1', clubName: 'Club 1' }),
      makeEntry({ clubId: 'club-2', clubName: 'Club 2', position: 2 })
    ];
    const state = makeState(entries);
    const event = makeMatchEvent({ homeTeamId: 'club-1', awayTeamId: 'club-2', homeGoals: 2, awayGoals: 1 });

    const newState = reduceEvent(state, event);

    const home = newState.league.entries.find(e => e.clubId === 'club-1')!;
    const away = newState.league.entries.find(e => e.clubId === 'club-2')!;

    // Home team wins
    expect(home.played).toBe(1);
    expect(home.won).toBe(1);
    expect(home.drawn).toBe(0);
    expect(home.lost).toBe(0);
    expect(home.goalsFor).toBe(2);
    expect(home.goalsAgainst).toBe(1);
    expect(home.goalDifference).toBe(1);
    expect(home.points).toBe(3);
    expect(home.form).toEqual(['W']);

    // Away team loses
    expect(away.played).toBe(1);
    expect(away.won).toBe(0);
    expect(away.drawn).toBe(0);
    expect(away.lost).toBe(1);
    expect(away.goalsFor).toBe(1);
    expect(away.goalsAgainst).toBe(2);
    expect(away.goalDifference).toBe(-1);
    expect(away.points).toBe(0);
    expect(away.form).toEqual(['L']);
  });

  it('updates league table entries for a draw', () => {
    const entries = [
      makeEntry({ clubId: 'club-1', clubName: 'Club 1' }),
      makeEntry({ clubId: 'club-2', clubName: 'Club 2', position: 2 })
    ];
    const state = makeState(entries);
    const event = makeMatchEvent({ homeGoals: 1, awayGoals: 1 });

    const newState = reduceEvent(state, event);

    const home = newState.league.entries.find(e => e.clubId === 'club-1')!;
    const away = newState.league.entries.find(e => e.clubId === 'club-2')!;

    expect(home.points).toBe(1);
    expect(away.points).toBe(1);
    expect(home.drawn).toBe(1);
    expect(away.drawn).toBe(1);
    expect(home.form).toEqual(['D']);
    expect(away.form).toEqual(['D']);
  });

  it('sorts table by points after match', () => {
    const entries = [
      makeEntry({ clubId: 'club-1', clubName: 'Club 1', points: 0, position: 1 }),
      makeEntry({ clubId: 'club-2', clubName: 'Club 2', points: 0, position: 2 })
    ];
    const state = makeState(entries);

    // Away team wins, should be top
    const event = makeMatchEvent({ homeGoals: 0, awayGoals: 3 });
    const newState = reduceEvent(state, event);

    expect(newState.league.entries[0].clubId).toBe('club-2');
    expect(newState.league.entries[0].position).toBe(1);
    expect(newState.league.entries[1].clubId).toBe('club-1');
    expect(newState.league.entries[1].position).toBe(2);
  });

  it('sorts by goal difference when points are equal', () => {
    const entries = [
      makeEntry({ clubId: 'club-1', clubName: 'Club 1', points: 3, goalsFor: 2, goalsAgainst: 1, goalDifference: 1 }),
      makeEntry({ clubId: 'club-2', clubName: 'Club 2', points: 3, goalsFor: 1, goalsAgainst: 0, goalDifference: 1, position: 2 }),
      makeEntry({ clubId: 'club-3', clubName: 'Club 3', points: 0, position: 3 })
    ];
    const state = makeState(entries);

    // club-3 beats club-2 by 4-0: club-2 gets 0 points, club-3 gets 3 points
    const event = makeMatchEvent({
      homeTeamId: 'club-3',
      awayTeamId: 'club-2',
      homeGoals: 4,
      awayGoals: 0
    });

    const newState = reduceEvent(state, event);

    // club-1: 3 pts, GD +1
    // club-3: 3 pts, GD +4
    // club-2: 3 pts, GD -3
    expect(newState.league.entries[0].clubId).toBe('club-3');
    expect(newState.league.entries[1].clubId).toBe('club-1');
    expect(newState.league.entries[2].clubId).toBe('club-2');
  });

  it('updates player club form when player is home team', () => {
    const entries = [
      makeEntry({ clubId: 'player-club', clubName: 'Player FC' }),
      makeEntry({ clubId: 'opponent', clubName: 'Opponent FC', position: 2 })
    ];
    const state = makeState(entries, 'player-club');
    const event = makeMatchEvent({
      homeTeamId: 'player-club',
      awayTeamId: 'opponent',
      homeGoals: 3,
      awayGoals: 0
    });

    const newState = reduceEvent(state, event);
    expect(newState.club.form).toEqual(['W']);
  });

  it('updates player club form when player is away team', () => {
    const entries = [
      makeEntry({ clubId: 'opponent', clubName: 'Opponent FC' }),
      makeEntry({ clubId: 'player-club', clubName: 'Player FC', position: 2 })
    ];
    const state = makeState(entries, 'player-club');
    const event = makeMatchEvent({
      homeTeamId: 'opponent',
      awayTeamId: 'player-club',
      homeGoals: 0,
      awayGoals: 2
    });

    const newState = reduceEvent(state, event);
    expect(newState.club.form).toEqual(['W']);
  });

  it('form keeps only last 5 results', () => {
    const entries = [
      makeEntry({ clubId: 'club-1', clubName: 'Club 1' }),
      makeEntry({ clubId: 'club-2', clubName: 'Club 2', position: 2 })
    ];
    let state = makeState(entries, 'club-1');

    // Simulate 7 wins
    for (let i = 0; i < 7; i++) {
      const event = makeMatchEvent({
        matchId: `match-${i}`,
        homeGoals: 2,
        awayGoals: 0
      });
      state = reduceEvent(state, event);
    }

    const entry = state.league.entries.find(e => e.clubId === 'club-1')!;
    expect(entry.form.length).toBe(5);
    expect(entry.form).toEqual(['W', 'W', 'W', 'W', 'W']);
    expect(state.club.form.length).toBe(5);
  });

  it('accumulates stats across multiple matches', () => {
    const entries = [
      makeEntry({ clubId: 'club-1', clubName: 'Club 1' }),
      makeEntry({ clubId: 'club-2', clubName: 'Club 2', position: 2 })
    ];
    let state = makeState(entries);

    // Match 1: 2-1 home win
    state = reduceEvent(state, makeMatchEvent({ homeGoals: 2, awayGoals: 1 }));
    // Match 2: 0-0 draw
    state = reduceEvent(state, makeMatchEvent({ matchId: 'm2', homeGoals: 0, awayGoals: 0 }));

    const home = state.league.entries.find(e => e.clubId === 'club-1')!;
    expect(home.played).toBe(2);
    expect(home.won).toBe(1);
    expect(home.drawn).toBe(1);
    expect(home.goalsFor).toBe(2);
    expect(home.goalsAgainst).toBe(1);
    expect(home.points).toBe(4); // 3 + 1
    expect(home.form).toEqual(['W', 'D']);
  });
});
