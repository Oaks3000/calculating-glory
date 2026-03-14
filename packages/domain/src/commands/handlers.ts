/**
 * Command Handlers
 *
 * Business logic that validates commands and produces events.
 */

import { GameCommand, CommandResult } from './types';
import { GameState } from '../types/game-state-updated';
import { GameEvent } from '../events/types';
import { validateTransfer, validateFacilityUpgrade, validateStaffHire } from '../validation/rules';
import { simulateMatch, clubToTeam, generateAITeam, Team } from '../simulation/match';
import { generateSeasonFixtures, getWeekFixtures, matchSeed } from '../simulation/season';
import { createRng } from '../simulation/rng';
import { generateWeekEvents } from '../simulation/events';

/**
 * Handle a game command
 */
export function handleCommand(command: GameCommand, state: GameState): CommandResult {
  switch (command.type) {
    case 'MAKE_TRANSFER':
      return handleMakeTransfer(command, state);
    case 'UPGRADE_FACILITY':
      return handleUpgradeFacility(command, state);
    case 'HIRE_STAFF':
      return handleHireStaff(command, state);
    case 'SIMULATE_WEEK':
      return handleSimulateWeek(command, state);
    case 'RECORD_MATH_ATTEMPT':
      return handleRecordMathAttempt(command, state);
    case 'RESOLVE_CLUB_EVENT':
      return handleResolveClubEvent(command, state);
    case 'START_SEASON':
      return handleStartSeason(command, state);
    case 'SET_TRAINING_FOCUS':
      return handleSetTrainingFocus(command, state);
    default:
      return {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Unknown command type'
        }
      };
  }
}

function handleMakeTransfer(command: any, state: GameState): CommandResult {
  // In a real implementation, we'd look up the player from a market/database
  // For now, create a mock player
  const mockPlayer = {
    id: command.playerId,
    name: 'Mock Player',
    overallRating: 70,
    position: 'MID' as const,
    wage: command.offeredWages,
    transferValue: command.offeredFee,
    age: 25,
    morale: 75,
    stats: {
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      appearances: 0,
      averageRating: 70
    }
  };

  const validation = validateTransfer(
    state.club,
    mockPlayer,
    command.offeredFee,
    command.offeredWages
  );

  if (!validation.valid) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: validation.errors.join(', ')
      }
    };
  }

  const events: GameEvent[] = [
    {
      type: 'TRANSFER_COMPLETED',
      timestamp: Date.now(),
      playerId: command.playerId,
      clubId: command.clubId,
      fee: command.offeredFee,
      wages: command.offeredWages,
      player: mockPlayer
    }
  ];

  return { events };
}

function handleUpgradeFacility(command: any, state: GameState): CommandResult {
  // Calculate upgrade cost based on current level
  const facility = state.club.facilities.find(f => f.type === command.facilityType);
  if (!facility) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: `Facility '${command.facilityType}' not found`
      }
    };
  }

  const upgradeCost = facility.upgradeCost;
  const validation = validateFacilityUpgrade(state.club, command.facilityType, upgradeCost);

  if (!validation.valid) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: validation.errors.join(', ')
      }
    };
  }

  const events: GameEvent[] = [
    {
      type: 'FACILITY_UPGRADED',
      timestamp: Date.now(),
      clubId: command.clubId,
      facilityType: command.facilityType,
      level: facility.level + 1,
      cost: upgradeCost
    }
  ];

  return { events };
}

function handleHireStaff(command: any, state: GameState): CommandResult {
  // In a real implementation, we'd look up staff from a database
  const mockStaffWages = 50000; // £500/week in pence

  const mockStaff = {
    id: command.staffId,
    name: 'Mock Coach',
    role: 'ATTACKING_COACH' as const,
    quality: 70,
    salary: mockStaffWages,
    bonus: {
      type: 'goals' as const,
      improvement: 10
    }
  };

  const validation = validateStaffHire(state.club, mockStaffWages);

  if (!validation.valid) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: validation.errors.join(', ')
      }
    };
  }

  const events: GameEvent[] = [
    {
      type: 'STAFF_HIRED',
      timestamp: Date.now(),
      clubId: command.clubId,
      staffId: command.staffId,
      role: 'ATTACKING_COACH',
      wages: mockStaffWages,
      staff: mockStaff
    }
  ];

  return { events };
}

function handleSimulateWeek(command: any, state: GameState): CommandResult {
  const week: number = command.week;
  const season: number = command.season;
  const baseSeed = command.seed || 'calculating-glory';

  // Check for unresolved pending events before advancing
  if (state.pendingEvents.some(e => !e.resolved)) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Resolve pending events before advancing'
      }
    };
  }

  // Need teams in the league to simulate
  const teamIds = state.league.entries.map(e => e.clubId);
  if (teamIds.length < 2) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'League must have at least 2 teams to simulate'
      }
    };
  }

  // Generate season fixtures (deterministic from seed + teams)
  const allFixtures = generateSeasonFixtures({
    teamIds,
    season,
    seed: baseSeed
  });

  const weekFixtures = getWeekFixtures(allFixtures, week);
  if (!weekFixtures) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: `No fixtures found for week ${week}`
      }
    };
  }

  // Build Team objects for the player's club and AI opponents
  const playerTeam = state.club.id ? clubToTeam(state.club) : null;
  const teamMap = buildTeamMap(state, playerTeam, baseSeed, season);

  // Simulate each match and produce events
  const events: GameEvent[] = [];
  const now = Date.now();

  weekFixtures.fixtures.forEach((fixture, index) => {
    const homeTeam = teamMap.get(fixture.homeTeamId);
    const awayTeam = teamMap.get(fixture.awayTeamId);

    if (!homeTeam || !awayTeam) return;

    const seed = matchSeed(baseSeed, season, week, index);
    const result = simulateMatch(homeTeam, awayTeam, seed);

    events.push({
      type: 'MATCH_SIMULATED',
      timestamp: now,
      matchId: `S${season}-W${week}-M${index}`,
      homeTeamId: result.homeTeamId,
      awayTeamId: result.awayTeamId,
      homeGoals: result.homeGoals,
      awayGoals: result.awayGoals,
      seed
    });
  });

  // Generate club events for this week and emit ClubEventOccurredEvent for each
  const clubEvents = generateWeekEvents(state, week, season, baseSeed);
  for (const pendingEvent of clubEvents) {
    events.push({
      type: 'CLUB_EVENT_OCCURRED',
      timestamp: now,
      eventId: pendingEvent.id,
      templateId: pendingEvent.templateId,
      week,
      clubId: state.club.id,
      pendingEvent
    });
  }

  // Advance the week after all matches and events
  events.push({
    type: 'WEEK_ADVANCED',
    timestamp: now,
    week,
    season
  });

  // If this is the last week of the season, emit SeasonEndedEvent
  if (week === 46) {
    // Calculate final position from current league table
    // The WEEK_ADVANCED event hasn't been applied yet, so we work from current state
    const playerEntry = state.league.entries.find(e => e.clubId === state.club.id);
    const finalPosition = playerEntry?.position ?? state.league.entries.length;
    const promotionPositions = state.league.automaticPromotion;
    const relegationPositions = state.league.relegation;
    events.push({
      type: 'SEASON_ENDED',
      timestamp: now,
      season,
      finalPosition,
      promoted: finalPosition <= promotionPositions,
      relegated: relegationPositions.includes(finalPosition)
    });
  }

  return { events };
}

function handleResolveClubEvent(command: any, state: GameState): CommandResult {
  const { eventId, choiceId } = command;

  // Find the pending event
  const pendingEvent = state.pendingEvents.find(e => e.id === eventId);
  if (!pendingEvent) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: `Pending event '${eventId}' not found`
      }
    };
  }

  if (pendingEvent.resolved) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: `Event '${eventId}' is already resolved`
      }
    };
  }

  // Find the choice
  const choice = pendingEvent.choices.find(c => c.id === choiceId);
  if (!choice) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: `Choice '${choiceId}' not found in event '${eventId}'`
      }
    };
  }

  const events: GameEvent[] = [
    {
      type: 'CLUB_EVENT_RESOLVED',
      timestamp: Date.now(),
      eventId,
      choiceId,
      clubId: state.club.id,
      budgetEffect: choice.budgetEffect,
      reputationEffect: choice.reputationEffect
    }
  ];

  return { events };
}

function handleStartSeason(command: any, state: GameState): CommandResult {
  if (state.phase !== 'PRE_SEASON') {
    return {
      error: {
        code: 'INVALID_PHASE',
        message: `Cannot start season from phase '${state.phase}' — must be PRE_SEASON`
      }
    };
  }

  const events: GameEvent[] = [
    {
      type: 'SEASON_STARTED',
      timestamp: Date.now(),
      season: command.season
    }
  ];

  return { events };
}

/**
 * Build a map of team ID → Team for match simulation.
 * Player's club uses real squad data; AI teams are generated from seed.
 */
function buildTeamMap(
  state: GameState,
  playerTeam: Team | null,
  baseSeed: string,
  season: number
): Map<string, Team> {
  const teamMap = new Map<string, Team>();
  const rng = createRng(`${baseSeed}-S${season}-strengths`);

  for (const entry of state.league.entries) {
    if (playerTeam && entry.clubId === state.club.id) {
      teamMap.set(entry.clubId, playerTeam);
    } else {
      // AI team: base strength spread across League Two range (35-65)
      // Use the RNG to assign a consistent base strength per team per season
      const baseStrength = 35 + rng.next() * 30;
      const aiTeam = generateAITeam(
        entry.clubId,
        entry.clubName,
        baseStrength,
        `${baseSeed}-S${season}`
      );
      teamMap.set(entry.clubId, aiTeam);
    }
  }

  return teamMap;
}

function handleSetTrainingFocus(command: any, state: GameState): CommandResult {
  const events: GameEvent[] = [
    {
      type: 'TRAINING_FOCUS_SET',
      timestamp: Date.now(),
      clubId: state.club.id,
      focus: command.focus,
      previousFocus: state.club.trainingFocus,
    },
  ];
  return { events };
}

function handleRecordMathAttempt(command: any, _state: GameState): CommandResult {
  const correct = command.answer === command.expectedAnswer;
  const timeSpent = command.endTime - command.startTime;

  const events: GameEvent[] = [
    {
      type: 'MATH_ATTEMPT_RECORDED',
      timestamp: Date.now(),
      studentId: command.studentId,
      topic: command.topic,
      difficulty: command.difficulty,
      correct,
      timeSpent
    }
  ];

  return { events };
}
