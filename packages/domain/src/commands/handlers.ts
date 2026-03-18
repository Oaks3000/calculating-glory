/**
 * Command Handlers
 *
 * Business logic that validates commands and produces events.
 */

import { GameCommand, CommandResult } from './types';
import { GameState } from '../types/game-state-updated';
import { GameEvent, NpcPlayerSignedEvent } from '../events/types';
import { validateTransfer, validateFacilityUpgrade, validateStaffHire } from '../validation/rules';
import { simulateMatch, clubToTeam, generateAITeam, Team } from '../simulation/match';
import { generateSeasonFixtures, getWeekFixtures, matchSeed } from '../simulation/season';
import { createRng } from '../simulation/rng';
import { generateWeekEvents, generatePoachAttempts } from '../simulation/events';
import { LEAGUE_TWO_TEAMS } from '../data/league-two-teams';
import { Player } from '../types/player';

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
    case 'SET_FORMATION':
      return handleSetFormation(command, state);
    case 'SIGN_FREE_AGENT':
      return handleSignFreeAgent(command, state);
    case 'RELEASE_PLAYER':
      return handleReleasePlayer(command, state);
    case 'HIRE_MANAGER':
      return handleHireManager(command, state);
    case 'SACK_MANAGER':
      return handleSackManager(command, state);
    case 'SELL_PLAYER_TO_NPC':
      return handleSellPlayerToNpc(command, state);
    case 'BEGIN_NEXT_SEASON':
      return handleBeginNextSeason(command, state);
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
    attributes: { attack: 55, defence: 55, teamwork: 60, charisma: 50, publicPotential: 65 },
    truePotential: 68,
    contractExpiresWeek: state.currentWeek + 46,
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

  // Generate NPC poach attempts (0 or 1 per week)
  const poachEvents = generatePoachAttempts(state, week, season, baseSeed);
  for (const pendingEvent of poachEvents) {
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

  // Propagate poach-specific fields from choice + event metadata
  const poachTargetId = pendingEvent.metadata?.poachTargetPlayerId;
  const playerRemovedId = choice.playerLeaves ? poachTargetId : undefined;
  const moraleTargetId = choice.moraleEffect !== undefined ? poachTargetId : undefined;

  const events: GameEvent[] = [
    {
      type: 'CLUB_EVENT_RESOLVED',
      timestamp: Date.now(),
      eventId,
      choiceId,
      clubId: state.club.id,
      budgetEffect: choice.budgetEffect,
      reputationEffect: choice.reputationEffect,
      playerRemovedId,
      moraleTargetId,
      moraleEffect: choice.moraleEffect,
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

  const now = Date.now();
  const events: GameEvent[] = [
    { type: 'SEASON_STARTED', timestamp: now, season: command.season }
  ];

  // ── NPC season-start transfers ─────────────────────────────────────────────
  // Get seed from GAME_STARTED event for determinism
  const gameStartEvent = state.events.find(e => e.type === 'GAME_STARTED');
  const baseSeed = gameStartEvent
    ? (gameStartEvent as { type: 'GAME_STARTED'; seed: string }).seed
    : 'default-seed';

  const rng = createRng(`npc-transfers-${baseSeed}-season-${command.season}`);

  // Build mutable pool (copy) — NPCs pick from this, consuming as they go
  let remainingPool: Player[] = [...state.freeAgentPool];

  // Stronger clubs pick first; exclude player's own club
  const npcClubs = [...LEAGUE_TWO_TEAMS]
    .filter(t => t.id !== state.club.id)
    .sort((a, b) => b.baseStrength - a.baseStrength);

  for (const club of npcClubs) {
    // Tier determines how many they sign and max wage they'll pay
    const { signings, maxWage } = npcTier(club.baseStrength);
    // Small clubs occasionally don't sign anyone (30% skip chance)
    const actualSignings = club.baseStrength < 45 && rng.next() < 0.3 ? 0 : signings;

    let signed = 0;
    for (let attempt = 0; attempt < actualSignings; attempt++) {
      const affordable = remainingPool.filter(p => p.wage <= maxWage);
      if (affordable.length === 0) break;

      // Pick highest-rated affordable agent, with slight randomness to avoid
      // every NPC taking the same top agent
      affordable.sort((a, b) => b.overallRating - a.overallRating);
      // Top 3 candidates, pick randomly among them
      const candidates = affordable.slice(0, Math.min(3, affordable.length));
      const picked = candidates[rng.nextInt(0, candidates.length - 1)];

      const npcEvent: NpcPlayerSignedEvent = {
        type: 'NPC_PLAYER_SIGNED',
        timestamp: now + signed,
        npcClubId: club.id,
        npcClubName: club.name,
        player: picked,
      };

      events.push(npcEvent);
      remainingPool = remainingPool.filter(p => p.id !== picked.id);
      signed++;
    }
  }

  return { events };
}

/**
 * NPC budget tier based on club strength.
 * Returns number of free-agent signings and maximum weekly wage (pence).
 */
function npcTier(strength: number): { signings: number; maxWage: number } {
  if (strength >= 55) return { signings: 2, maxWage: 250_000 };   // £2,500/wk
  if (strength >= 45) return { signings: 2, maxWage: 175_000 };   // £1,750/wk
  return { signings: 1, maxWage: 120_000 };                        // £1,200/wk
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

function handleSetFormation(command: any, state: GameState): CommandResult {
  const events: GameEvent[] = [
    {
      type: 'FORMATION_SET',
      timestamp: Date.now(),
      clubId: state.club.id,
      formation: command.formation,
      previousFormation: state.club.preferredFormation,
    },
  ];
  return { events };
}

function handleSignFreeAgent(command: any, state: GameState): CommandResult {
  // Find player in free agent pool
  const player = state.freeAgentPool.find(p => p.id === command.playerId);
  if (!player) {
    return {
      error: {
        code: 'PLAYER_NOT_FOUND',
        message: `Player '${command.playerId}' not found in free agent pool`
      }
    };
  }

  // Check squad has room
  if (state.club.squad.length >= state.club.squadCapacity) {
    return {
      error: {
        code: 'SQUAD_LIMIT_EXCEEDED',
        message: `Squad is at capacity (${state.club.squadCapacity} players)`
      }
    };
  }

  // Check wage budget
  const currentTotalWages = state.club.squad.reduce((sum, p) => sum + p.wage, 0);
  if (command.offeredWage > state.club.wageBudget - currentTotalWages) {
    return {
      error: {
        code: 'INSUFFICIENT_BUDGET',
        message: `Offered wage exceeds remaining wage budget`
      }
    };
  }

  const contractExpiresWeek = state.currentWeek + 46;

  const updatedPlayer = {
    ...player,
    wage: command.offeredWage,
    contractExpiresWeek,
  };

  const events: GameEvent[] = [
    {
      type: 'FREE_AGENT_SIGNED',
      timestamp: Date.now(),
      playerId: command.playerId,
      clubId: state.club.id,
      offeredWage: command.offeredWage,
      contractExpiresWeek,
      player: updatedPlayer,
    }
  ];

  return { events };
}

function handleReleasePlayer(command: any, state: GameState): CommandResult {
  // Find player in squad
  const player = state.club.squad.find(p => p.id === command.playerId);
  if (!player) {
    return {
      error: {
        code: 'PLAYER_NOT_FOUND',
        message: `Player '${command.playerId}' not found in squad`
      }
    };
  }

  // Compute release fee
  let releaseFee = 0;
  if (player.contractExpiresWeek > 0 && state.currentWeek < player.contractExpiresWeek) {
    releaseFee = Math.round((player.contractExpiresWeek - state.currentWeek) * player.wage * 0.5);
  }

  const events: GameEvent[] = [
    {
      type: 'PLAYER_RELEASED',
      timestamp: Date.now(),
      playerId: command.playerId,
      clubId: state.club.id,
      releaseFee,
    }
  ];

  return { events };
}

function handleHireManager(command: any, state: GameState): CommandResult {
  // Find manager in pool
  const manager = state.managerPool.find(m => m.id === command.managerId);
  if (!manager) {
    return {
      error: {
        code: 'PLAYER_NOT_FOUND',
        message: `Manager '${command.managerId}' not found in pool`,
      },
    };
  }

  // Check whether we can afford the weekly wage
  const currentTotalWages =
    state.club.squad.reduce((sum, p) => sum + p.wage, 0) +
    state.club.staff.reduce((sum, s) => sum + s.salary, 0) +
    (state.club.manager ? state.club.manager.wage : 0);

  if (manager.wage > state.club.wageBudget - currentTotalWages) {
    return {
      error: {
        code: 'INSUFFICIENT_BUDGET',
        message: `Manager wage exceeds remaining weekly wage budget`,
      },
    };
  }

  // Sack existing manager first (no compensation in pre-season — mutual consent)
  const events: GameEvent[] = [];
  if (state.club.manager) {
    events.push({
      type: 'MANAGER_SACKED',
      timestamp: Date.now(),
      clubId: state.club.id,
      managerId: state.club.manager.id,
      compensationPaid: 0,
    });
  }

  const contractExpiresWeek = state.currentWeek + manager.contractLengthWeeks;

  events.push({
    type: 'MANAGER_HIRED',
    timestamp: Date.now(),
    clubId: state.club.id,
    manager,
    contractExpiresWeek,
  });

  return { events };
}

function handleSackManager(_command: any, state: GameState): CommandResult {
  if (!state.club.manager) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: `No manager to sack`,
      },
    };
  }

  const manager = state.club.manager;
  // Compensation: half of remaining contracted wages
  const weeksRemaining = Math.max(0, manager.contractExpiresWeek - state.currentWeek);
  const compensationPaid = Math.round(weeksRemaining * manager.wage * 0.5);

  // Check club can afford compensation
  if (compensationPaid > state.club.transferBudget) {
    return {
      error: {
        code: 'INSUFFICIENT_BUDGET',
        message: `Cannot afford sacking compensation of ${compensationPaid} pence`,
      },
    };
  }

  const events: GameEvent[] = [
    {
      type: 'MANAGER_SACKED',
      timestamp: Date.now(),
      clubId: state.club.id,
      managerId: manager.id,
      compensationPaid,
    },
  ];

  return { events };
}

function handleSellPlayerToNpc(command: any, state: GameState): CommandResult {
  // Validate player is in squad
  const player = state.club.squad.find(p => p.id === command.playerId);
  if (!player) {
    return {
      error: {
        code: 'PLAYER_NOT_FOUND',
        message: `Player '${command.playerId}' not found in squad`,
      },
    };
  }

  // Validate buying club exists
  const buyingClub = LEAGUE_TWO_TEAMS.find(t => t.id === command.npcClubId);
  if (!buyingClub) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: `NPC club '${command.npcClubId}' not found`,
      },
    };
  }

  // Buying club cannot be the player's own club
  if (command.npcClubId === state.club.id) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: `Cannot sell a player to your own club`,
      },
    };
  }

  // Fee: use player's transferValue if set, otherwise derive from overallRating
  const fee = player.transferValue > 0
    ? player.transferValue
    : Math.max(10_000, player.overallRating * player.overallRating * 500);

  const events: GameEvent[] = [
    {
      type: 'PLAYER_SOLD',
      timestamp: Date.now(),
      playerId: player.id,
      clubId: state.club.id,
      fee,
      playerName: player.name,
      npcClubId: buyingClub.id,
      npcClubName: buyingClub.name,
    },
  ];

  return { events };
}

function handleBeginNextSeason(_command: any, state: GameState): CommandResult {
  if (state.phase !== 'SEASON_END') {
    return {
      error: {
        code: 'INVALID_PHASE',
        message: `Cannot begin next season from phase '${state.phase}' — must be SEASON_END`,
      },
    };
  }

  return {
    events: [{
      type: 'PRE_SEASON_STARTED',
      timestamp: Date.now(),
      season: state.season + 1,
    }],
  };
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
