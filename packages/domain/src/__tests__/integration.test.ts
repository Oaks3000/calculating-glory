/**
 * Integration Test
 *
 * Tests the full game flow from start to match simulation
 */

import { buildState } from '../reducers';
import { GameStartedEvent, MatchSimulatedEvent, GameEvent } from '../events/types';
import { generateSeasonFixtures, matchSeed } from '../simulation/season';
import { simulateMatch } from '../simulation/match';

describe('Game Integration Test', () => {
  it('should initialize game with 24 league teams', () => {
    const gameStartedEvent: GameStartedEvent = {
      type: 'GAME_STARTED',
      timestamp: Date.now(),
      clubId: 'player-club',
      clubName: 'Test FC',
      initialBudget: 500000000, // 5 million pounds in pence
      difficulty: 'MEDIUM',
      seed: 'test-seed-123'
    };

    const state = buildState([gameStartedEvent]);

    // Verify we have 24 teams in the league
    expect(state.league.entries).toHaveLength(24);

    // Verify player's club is in the league
    const playerClub = state.league.entries.find(e => e.clubId === 'player-club');
    expect(playerClub).toBeDefined();
    expect(playerClub?.clubName).toBe('Test FC');

    // Verify all teams start with zero stats
    state.league.entries.forEach(entry => {
      expect(entry.played).toBe(0);
      expect(entry.won).toBe(0);
      expect(entry.drawn).toBe(0);
      expect(entry.lost).toBe(0);
      expect(entry.goalsFor).toBe(0);
      expect(entry.goalsAgainst).toBe(0);
      expect(entry.goalDifference).toBe(0);
      expect(entry.points).toBe(0);
      expect(entry.form).toEqual([]);
    });

    // Verify player's club state is set up
    expect(state.club.id).toBe('player-club');
    expect(state.club.name).toBe('Test FC');
    expect(state.club.transferBudget).toBe(500000000);
    expect(state.club.wageBudget).toBe(50000000); // 10% of transfer budget
  });

  it('should simulate week 1 and update league table', () => {
    // Set up game
    const gameStartedEvent: GameStartedEvent = {
      type: 'GAME_STARTED',
      timestamp: Date.now(),
      clubId: 'player-club',
      clubName: 'Test FC',
      initialBudget: 500000000,
      difficulty: 'MEDIUM',
      seed: 'test-seed-456'
    };

    let state = buildState([gameStartedEvent]);

    // Generate fixtures for the season
    const teamIds = state.league.entries.map(e => e.clubId);
    const fixtures = generateSeasonFixtures({
      teamIds,
      season: 1,
      seed: 'test-seed-456'
    });

    // Get week 1 fixtures
    const week1 = fixtures.find(w => w.week === 1);
    expect(week1).toBeDefined();
    expect(week1?.fixtures).toHaveLength(12); // 24 teams / 2 = 12 matches

    // Simulate all matches in week 1
    const events: GameEvent[] = [gameStartedEvent];

    week1!.fixtures.forEach((fixture, index) => {
      const seed = matchSeed('test-seed-456', 1, 1, index);

      // Create Team objects for simulation
      const homeTeam = {
        id: fixture.homeTeamId,
        name: state.league.entries.find(e => e.clubId === fixture.homeTeamId)?.clubName || 'Home',
        attackStrength: 50,
        defenceStrength: 50,
        teamStrength: 1.0
      };
      const awayTeam = {
        id: fixture.awayTeamId,
        name: state.league.entries.find(e => e.clubId === fixture.awayTeamId)?.clubName || 'Away',
        attackStrength: 50,
        defenceStrength: 50,
        teamStrength: 1.0
      };

      const result = simulateMatch(homeTeam, awayTeam, seed);

      const matchEvent: MatchSimulatedEvent = {
        type: 'MATCH_SIMULATED',
        timestamp: Date.now(),
        matchId: `S1-W1-M${index}`,
        homeTeamId: fixture.homeTeamId,
        awayTeamId: fixture.awayTeamId,
        homeGoals: result.homeGoals,
        awayGoals: result.awayGoals,
        seed
      };

      events.push(matchEvent);
    });

    // Build state with all events
    state = buildState(events);

    // Verify all teams played exactly once
    state.league.entries.forEach(entry => {
      expect(entry.played).toBe(1);
    });

    // Verify player's club is in the table
    const playerClub = state.league.entries.find(e => e.clubId === 'player-club');
    expect(playerClub).toBeDefined();
    expect(playerClub?.played).toBe(1);

    // Verify league table is sorted (check positions are sequential)
    state.league.entries.forEach((entry, index) => {
      expect(entry.position).toBe(index + 1);
    });

    // Verify points are awarded correctly (3 for win, 1 for draw, 0 for loss)
    state.league.entries.forEach(entry => {
      const expectedPoints = entry.won * 3 + entry.drawn * 1;
      expect(entry.points).toBe(expectedPoints);
    });

    // Verify goal difference is calculated correctly
    state.league.entries.forEach(entry => {
      expect(entry.goalDifference).toBe(entry.goalsFor - entry.goalsAgainst);
    });

    // Verify form is updated (should have 1 result)
    state.league.entries.forEach(entry => {
      expect(entry.form).toHaveLength(1);
      expect(['W', 'D', 'L']).toContain(entry.form[0]);
    });

    // Verify total goals are even (every goal for is a goal against for someone)
    const totalGoalsFor = state.league.entries.reduce((sum, e) => sum + e.goalsFor, 0);
    const totalGoalsAgainst = state.league.entries.reduce((sum, e) => sum + e.goalsAgainst, 0);
    expect(totalGoalsFor).toBe(totalGoalsAgainst);

    // Verify total points make sense
    // Each match awards 3 points total (3+0 for win, 1+1 for draw)
    const totalPoints = state.league.entries.reduce((sum, e) => sum + e.points, 0);
    expect(totalPoints).toBeGreaterThan(0);
    expect(totalPoints).toBeLessThanOrEqual(12 * 3); // 12 matches * 3 points max
  });

  it('should simulate multiple weeks and accumulate stats', () => {
    // Set up game
    const gameStartedEvent: GameStartedEvent = {
      type: 'GAME_STARTED',
      timestamp: Date.now(),
      clubId: 'player-club',
      clubName: 'Test FC',
      initialBudget: 500000000,
      difficulty: 'MEDIUM',
      seed: 'test-seed-789'
    };

    let state = buildState([gameStartedEvent]);

    // Generate fixtures for the season
    const teamIds = state.league.entries.map(e => e.clubId);
    const fixtures = generateSeasonFixtures({
      teamIds,
      season: 1,
      seed: 'test-seed-789'
    });

    const events: GameEvent[] = [gameStartedEvent];

    // Simulate weeks 1-3
    for (let weekNum = 1; weekNum <= 3; weekNum++) {
      const week = fixtures.find(w => w.week === weekNum);
      expect(week).toBeDefined();

      week!.fixtures.forEach((fixture, index) => {
        const seed = matchSeed('test-seed-789', 1, weekNum, index);

        // Create Team objects for simulation
        const homeTeam = {
          id: fixture.homeTeamId,
          name: state.league.entries.find(e => e.clubId === fixture.homeTeamId)?.clubName || 'Home',
          attackStrength: 50,
          defenceStrength: 50,
          teamStrength: 1.0
        };
        const awayTeam = {
          id: fixture.awayTeamId,
          name: state.league.entries.find(e => e.clubId === fixture.awayTeamId)?.clubName || 'Away',
          attackStrength: 50,
          defenceStrength: 50,
          teamStrength: 1.0
        };

        const result = simulateMatch(homeTeam, awayTeam, seed);

        const matchEvent: MatchSimulatedEvent = {
          type: 'MATCH_SIMULATED',
          timestamp: Date.now(),
          matchId: `S1-W${weekNum}-M${index}`,
          homeTeamId: fixture.homeTeamId,
          awayTeamId: fixture.awayTeamId,
          homeGoals: result.homeGoals,
          awayGoals: result.awayGoals,
          seed
        };

        events.push(matchEvent);
      });
    }

    // Build state with all events
    state = buildState(events);

    // Verify all teams played exactly 3 matches
    state.league.entries.forEach(entry => {
      expect(entry.played).toBe(3);
    });

    // Verify form has up to 3 results
    state.league.entries.forEach(entry => {
      expect(entry.form.length).toBeLessThanOrEqual(3);
      expect(entry.form.length).toBeGreaterThan(0);
    });

    // Verify player's club has form updated
    const playerClub = state.league.entries.find(e => e.clubId === 'player-club');
    expect(playerClub).toBeDefined();
    expect(playerClub?.form.length).toBe(3);
    expect(state.club.form.length).toBe(3);

    // Verify stats add up correctly
    state.league.entries.forEach(entry => {
      expect(entry.played).toBe(entry.won + entry.drawn + entry.lost);
    });
  });
});
