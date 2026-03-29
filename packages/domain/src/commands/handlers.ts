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
import { generateWeekEvents, generatePoachAttempts, generateMoraleThresholdEvents } from '../simulation/events';
import { getTeamsForDivision } from '../data/division-teams';
import { Player, computeOverallRating } from '../types/player';
import { shouldRetire, getRetirementFlavour } from '../simulation/progression';
import { getScoutLevel, isTransferWindowOpen, constructionDuration } from '../types/facility';
import { generateScoutTarget, getScoutFee } from '../data/scout-target-generator';
import { ScoutTargetFoundEvent, ScoutTransferCompletedEvent, TakeoverAcceptedEvent, CurriculumUpgradedEvent } from '../events/types';
import { CURRICULUM_LEVEL_ORDER, CURRICULUM_LEVELS } from '../curriculum/curriculum-config';

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
    case 'START_SCOUT_MISSION':
      return handleStartScoutMission(command, state);
    case 'PLACE_SCOUT_BID':
      return handlePlaceScoutBid(command, state);
    case 'CANCEL_SCOUT_MISSION':
      return handleCancelScoutMission(command, state);
    case 'ACCEPT_TAKEOVER':
      return handleAcceptTakeover(command, state);
    case 'ACCEPT_INTRO_SPONSOR_DEAL':
      return {
        events: [{
          type: 'BUDGET_UPDATED',
          timestamp: Date.now(),
          clubId: command.clubId,
          amount: command.amount,
          reason: `intro-sponsor-deal-option-${command.choice.toLowerCase()}`,
        }],
      };
    case 'UPGRADE_CURRICULUM':
      return handleUpgradeCurriculum(command, state);
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
    position: 'MID' as const,
    wage: command.offeredWages,
    transferValue: command.offeredFee,
    age: 25,
    morale: 75,
    attributes: { attack: 55, defence: 55, teamwork: 60, charisma: 50, publicPotential: 65 },
    truePotential: 33,
    curve: { shape: 'SHALLOW_BELL' as const, peakHeight: 3 as const, startAge: 18, retirementAge: 35, baseAttack: 55, baseDefence: 55 },
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

  const targetLevel = facility.level + 1;
  const events: GameEvent[] = [
    {
      type: 'FACILITY_UPGRADE_STARTED',
      timestamp: Date.now(),
      clubId: command.clubId,
      facilityType: command.facilityType,
      targetLevel,
      cost: upgradeCost,
      weeksToComplete: constructionDuration(targetLevel),
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

  // ── Limbo week: player was just forced out ─────────────────────────────────
  // No matches are simulated. One week ticks by, then the parachute offer appears.
  if (state.phase === 'FORCED_OUT' && state.forcedOut) {
    const now = Date.now();
    return {
      events: [
        { type: 'WEEK_ADVANCED', timestamp: now, week, season },
        {
          type:             'PARACHUTE_OFFERED',
          timestamp:        now,
          takeoverClubId:   state.forcedOut.takeoverClubId,
          takeoverClubName: state.forcedOut.takeoverClubName,
          takeoverBudget:   state.forcedOut.takeoverBudget,
          reputationMalus:  state.forcedOut.reputationMalus,
          week,
        },
      ],
    };
  }

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

  // Generate morale threshold events (0 or 1 per week — only if no other events fired)
  // Only fires when the inbox would otherwise be clear to avoid stacking.
  const hasNewEvents = clubEvents.length > 0 || poachEvents.length > 0;
  if (!hasNewEvents) {
    const moraleEvents = generateMoraleThresholdEvents(state, week, season);
    for (const pendingEvent of moraleEvents) {
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
  }

  // ── Scout mission resolution ─────────────────────────────────────────────────

  // Complete a pending bid when the transfer window opens this week
  if (isTransferWindowOpen(week, state.phase) && state.scoutMission?.status === 'BID_PENDING') {
    const mission = state.scoutMission;
    const contractExpiresWeek = week + 46;
    const updatedPlayer: Player = {
      ...mission.target!,
      wage:                mission.offeredWage!,
      contractExpiresWeek,
    };
    const completionEvent: ScoutTransferCompletedEvent = {
      type:              'SCOUT_TRANSFER_COMPLETED',
      timestamp:         now,
      clubId:            state.club.id,
      player:            updatedPlayer,
      fee:               mission.askingPrice!,
      targetNpcClubId:   mission.targetNpcClubId!,
      targetNpcClubName: mission.targetNpcClubName!,
    };
    events.push(completionEvent);
  }

  // Resolve a SEARCHING mission into TARGET_FOUND (fires once per week tick)
  if (state.scoutMission?.status === 'SEARCHING') {
    const mission    = state.scoutMission;
    const scoutLevel = getScoutLevel(state.club.facilities);
    const gameStartEvent = state.events.find(e => e.type === 'GAME_STARTED') as
      { type: 'GAME_STARTED'; seed: string } | undefined;
    const seedStr = gameStartEvent?.seed ?? 'default-seed';
    const { player, npcClubId, npcClubName, askingPrice } = generateScoutTarget(
      mission.position,
      mission.attributePriority,
      scoutLevel,
      seedStr,
      season,
      week,
      state.club.id,
      state.division,
    );
    const foundEvent: ScoutTargetFoundEvent = {
      type:              'SCOUT_TARGET_FOUND',
      timestamp:         now,
      clubId:            state.club.id,
      target:            player,
      targetNpcClubId:   npcClubId,
      targetNpcClubName: npcClubName,
      askingPrice,
    };
    events.push(foundEvent);
  }

  // Complete any constructions that finish this week (weeksRemaining === 1)
  // These fire BEFORE WEEK_ADVANCED so the reducer can safely decrement the rest.
  for (const facility of state.club.facilities) {
    if (facility.constructionWeeksRemaining === 1) {
      events.push({
        type: 'FACILITY_CONSTRUCTION_COMPLETED',
        timestamp: now,
        clubId: state.club.id,
        facilityType: facility.type,
        newLevel: facility.level + 1,
      });
    }
  }

  // Advance the week after all matches and events
  events.push({
    type: 'WEEK_ADVANCED',
    timestamp: now,
    week,
    season
  });

  // ── Owner-forced-out check ──────────────────────────────────────────────────
  // Trigger: position bottom 3 of 24 + budget < £10,000 + week >= 30
  // Fires once — if already in FORCED_OUT phase, skip.
  if (
    state.phase !== 'FORCED_OUT' &&
    state.phase !== 'SEASON_END' &&
    !state.forcedOut &&
    week >= 30
  ) {
    const playerEntry   = state.league.entries.find(e => e.clubId === state.club.id);
    const position      = playerEntry?.position ?? 1;
    const inBottom3     = position > 21;              // positions 22, 23, 24 out of 24
    const broke         = state.club.transferBudget < 1_000_000; // < £10,000

    if (inBottom3 && broke) {
      // Find the lowest-ranked NPC club (highest position number that isn't the player's)
      const sorted    = [...state.league.entries].sort((a, b) => b.position - a.position);
      const bottomNPC = sorted.find(e => e.clubId !== state.club.id);
      if (bottomNPC) {
        const gameStartEvent = state.events.find(e => e.type === 'GAME_STARTED') as
          { type: 'GAME_STARTED'; seed: string } | undefined;
        const seedStr = gameStartEvent?.seed ?? 'default-seed';
        // Infer NPC club budget from their evolved strength (pence)
        // Weakest (strength 30) → ~£30k; median (50) → ~£50k
        const npcStrength = state.npcStrengths[bottomNPC.clubId] ?? 40;
        const takeoverBudget = Math.round((npcStrength / 100) * 10_000_000);
        events.push({
          type:             'OWNER_FORCED_OUT',
          timestamp:        now,
          previousClubId:   state.club.id,
          previousClubName: state.club.name,
          previousPosition: position,
          takeoverClubId:   bottomNPC.clubId,
          takeoverClubName: bottomNPC.clubName,
          seed:             seedStr,
          week,
          takeoverBudget,
          reputationMalus:  -10,
        });
        return { events }; // Skip SEASON_ENDED — game transitions to FORCED_OUT phase
      }
    }
  }

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
  const { eventId, choiceId, mathsCorrect } = command;

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

  // For chain events with a maths challenge, select the appropriate budget effect
  // based on whether the player answered correctly.
  let budgetEffect = choice.budgetEffect;
  if (pendingEvent.mathsChallenge && mathsCorrect !== undefined) {
    if (mathsCorrect && choice.mathsCorrectBudgetEffect !== undefined) {
      budgetEffect = choice.mathsCorrectBudgetEffect;
    } else if (!mathsCorrect && choice.mathsWrongBudgetEffect !== undefined) {
      budgetEffect = choice.mathsWrongBudgetEffect;
    }
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
      templateId: pendingEvent.templateId,
      choiceId,
      clubId: state.club.id,
      budgetEffect,
      reputationEffect: choice.reputationEffect,
      playerRemovedId,
      moraleTargetId,
      moraleEffect: choice.moraleEffect,
      resolvedWeek: state.currentWeek,
      mathsCorrect: pendingEvent.mathsChallenge !== undefined ? mathsCorrect : undefined,
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
  const npcClubs = [...getTeamsForDivision(state.division)]
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
      affordable.sort((a, b) => computeOverallRating(b) - computeOverallRating(a));
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

  for (const entry of state.league.entries) {
    if (playerTeam && entry.clubId === state.club.id) {
      teamMap.set(entry.clubId, playerTeam);
    } else {
      // Use evolved NPC strength (seeded from static team data, adjusted each season).
      // Falls back to 50 for any NPC not yet in the strengths map (shouldn't occur
      // in normal play, but guards against stale saves from before this feature).
      const baseStrength = state.npcStrengths[entry.clubId] ?? 50;
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
  const buyingClub = getTeamsForDivision(state.division).find(t => t.id === command.npcClubId);
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

  // Fee: use player's transferValue if set, otherwise derive from computed OVR
  const ovr = computeOverallRating(player);
  const fee = player.transferValue > 0
    ? player.transferValue
    : Math.max(10_000, ovr * ovr * 500);

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

  // Compute retirements: any squad player whose age+1 >= retirementAge hangs up their boots
  const retirementRng = createRng(`retirement-S${state.season}-${state.club.id}`);
  const retiredPlayers = state.club.squad
    .filter(p => shouldRetire(p))
    .map(p => ({
      id:     p.id,
      name:   p.name,
      flavour: getRetirementFlavour(retirementRng),
    }));

  return {
    events: [{
      type: 'PRE_SEASON_STARTED',
      timestamp: Date.now(),
      season: state.season + 1,
      retiredPlayers,
    }],
  };
}

function handleStartScoutMission(command: any, state: GameState): CommandResult {
  // Only one mission at a time
  if (state.scoutMission !== null) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'A scout mission is already active — cancel it before starting a new one',
      },
    };
  }

  // Need squad room for the eventual signing
  if (state.club.squad.length >= state.club.squadCapacity) {
    return {
      error: {
        code: 'SQUAD_LIMIT_EXCEEDED',
        message: 'Squad is at capacity — release a player before scouting',
      },
    };
  }

  const scoutLevel = getScoutLevel(state.club.facilities);
  const scoutFee   = getScoutFee(scoutLevel);

  if (scoutFee > state.club.transferBudget) {
    return {
      error: {
        code: 'INSUFFICIENT_BUDGET',
        message: `Scout fee of ${scoutFee} pence exceeds available transfer budget`,
      },
    };
  }

  return {
    events: [{
      type:             'SCOUT_MISSION_STARTED',
      timestamp:        Date.now(),
      clubId:           state.club.id,
      position:         command.position,
      attributePriority: command.attributePriority,
      budgetCeiling:    command.budgetCeiling,
      scoutFee,
      weekStarted:      state.currentWeek,
    }],
  };
}

function handlePlaceScoutBid(command: any, state: GameState): CommandResult {
  const bidAllowed = state.scoutMission?.status === 'TARGET_FOUND' ||
                     state.scoutMission?.status === 'BID_REJECTED';
  if (!bidAllowed || !state.scoutMission) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'No target available to bid on',
      },
    };
  }

  const mission = state.scoutMission;

  // Check we can afford the asking price + offered wage
  if (mission.askingPrice! > state.club.transferBudget) {
    return {
      error: {
        code: 'INSUFFICIENT_BUDGET',
        message: 'Transfer budget is insufficient to cover the asking price',
      },
    };
  }

  const currentTotalWages = state.club.squad.reduce((sum, p) => sum + p.wage, 0);
  if (command.offeredWage > state.club.wageBudget - currentTotalWages) {
    return {
      error: {
        code: 'INSUFFICIENT_BUDGET',
        message: 'Offered wage exceeds remaining weekly wage budget',
      },
    };
  }

  return {
    events: [{
      type:              'SCOUT_BID_PLACED',
      timestamp:         Date.now(),
      clubId:            state.club.id,
      negotiationPassed: command.negotiationPassed,
      offeredWage:       command.offeredWage,
    }],
  };
}

function handleCancelScoutMission(_command: any, state: GameState): CommandResult {
  if (!state.scoutMission) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'No active scout mission to cancel',
      },
    };
  }

  return {
    events: [{
      type:      'SCOUT_MISSION_CANCELLED',
      timestamp: Date.now(),
      clubId:    state.club.id,
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

function handleAcceptTakeover(_command: any, state: GameState): CommandResult {
  if ((state.phase !== 'FORCED_OUT' && state.phase !== 'PARACHUTE_OFFERED') || !state.forcedOut) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'No forced-out takeover is pending',
      },
    };
  }

  const gameStartEvent = state.events.find(e => e.type === 'GAME_STARTED') as
    { type: 'GAME_STARTED'; seed: string } | undefined;
  const seedStr = gameStartEvent?.seed ?? 'default-seed';

  const event: TakeoverAcceptedEvent = {
    type:             'TAKEOVER_ACCEPTED',
    timestamp:        Date.now(),
    takeoverClubId:   state.forcedOut.takeoverClubId,
    takeoverClubName: state.forcedOut.takeoverClubName,
    seed:             seedStr,
    week:             state.forcedOut.week,
  };

  return { events: [event] };
}

function handleUpgradeCurriculum(command: any, state: GameState): CommandResult {
  const toLevel = command.toLevel as string;

  // Validate toLevel is a known curriculum level
  if (!CURRICULUM_LEVELS[toLevel as keyof typeof CURRICULUM_LEVELS]) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: `Unknown curriculum level: ${toLevel}`,
      },
    };
  }

  // Validate it's actually an advancement (not a downgrade)
  const currentLevel = state.curriculum?.level ?? 'YEAR_7';
  const currentIdx = CURRICULUM_LEVEL_ORDER.indexOf(currentLevel);
  const targetIdx  = CURRICULUM_LEVEL_ORDER.indexOf(toLevel as any);

  if (targetIdx <= currentIdx) {
    return {
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Can only upgrade to a higher curriculum level',
      },
    };
  }

  const event: CurriculumUpgradedEvent = {
    type:      'CURRICULUM_UPGRADED',
    timestamp: Date.now(),
    fromLevel: currentLevel,
    toLevel,
  };

  return { events: [event] };
}
