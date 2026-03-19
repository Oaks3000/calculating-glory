/**
 * Event Reducers
 *
 * Pure functions that apply events to state.
 */

import { GameEvent, GameStartedEvent, MatchSimulatedEvent, TransferCompletedEvent, StaffHiredEvent, MathAttemptRecordedEvent, ClubEventOccurredEvent, ClubEventResolvedEvent, SeasonStartedEvent, TrainingFocusSetEvent, FormationSetEvent, FreeAgentSignedEvent, PlayerReleasedEvent, NpcPlayerSignedEvent, ManagerHiredEvent, ManagerSackedEvent, PreSeasonStartedEvent } from '../events/types';
import { GameState } from '../types/game-state-updated';
import { Club } from '../types/club';
import { LeagueTable, LeagueTableEntry, sortLeagueTable } from '../types/league';
import { CURRICULUM_LEVELS } from '../curriculum/curriculum-config';
import { LEAGUE_TWO_TEAMS } from '../data/league-two-teams';
import { getDefaultFacilities, getUpgradeCost } from '../types/facility';
import { generateStartingSquad } from '../data/squad-generator';
import { generateFreeAgentPool } from '../data/free-agent-generator';
import { generateManagerPool } from '../data/manager-generator';
import {
  applyResultMoraleDelta,
  applyContractAnxiety,
  applyContagion,
  applyManagerChangeMorale,
  avgSquadMorale,
} from '../simulation/morale';

/**
 * Reduce an event into state
 */
export function reduceEvent(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case 'GAME_STARTED':
      return handleGameStarted(state, event);
    case 'TRANSFER_COMPLETED':
      return handleTransferCompleted(state, event);
    case 'PLAYER_SOLD':
      return handlePlayerSold(state, event);
    case 'BUDGET_UPDATED':
      return handleBudgetUpdated(state, event);
    case 'MATCH_SIMULATED':
      return handleMatchSimulated(state, event);
    case 'FACILITY_UPGRADED':
      return handleFacilityUpgraded(state, event);
    case 'STAFF_HIRED':
      return handleStaffHired(state, event);
    case 'STAFF_FIRED':
      return handleStaffFired(state, event);
    case 'MATH_ATTEMPT_RECORDED':
      return handleMathAttemptRecorded(state, event);
    case 'WEEK_ADVANCED':
      return handleWeekAdvanced(state, event);
    case 'SEASON_ENDED':
      return handleSeasonEnded(state, event);
    case 'CLUB_EVENT_OCCURRED':
      return handleClubEventOccurred(state, event);
    case 'CLUB_EVENT_RESOLVED':
      return handleClubEventResolved(state, event);
    case 'SEASON_STARTED':
      return handleSeasonStarted(state, event);
    case 'TRAINING_FOCUS_SET':
      return handleTrainingFocusSet(state, event);
    case 'FORMATION_SET':
      return handleFormationSet(state, event);
    case 'FREE_AGENT_SIGNED':
      return handleFreeAgentSigned(state, event);
    case 'PLAYER_RELEASED':
      return handlePlayerReleased(state, event);
    case 'NPC_PLAYER_SIGNED':
      return handleNpcPlayerSigned(state, event);
    case 'MANAGER_HIRED':
      return handleManagerHired(state, event);
    case 'MANAGER_SACKED':
      return handleManagerSacked(state, event);
    case 'PRE_SEASON_STARTED':
      return handlePreSeasonStarted(state, event);
    default:
      return state;
  }
}

/**
 * Build complete state from event stream
 */
export function buildState(events: GameEvent[]): GameState {
  const initialState: GameState = {
    version: 1,
    curriculum: CURRICULUM_LEVELS.YEAR_7,
    events: [],
    checksum: '',
    currentWeek: 0,
    club: createEmptyClub(),
    league: createEmptyLeague(),
    boardConfidence: 50,
    businessAcumen: {
      financial: 0,
      statistical: 0,
      strategic: 0,
      recentPerformance: {
        percentage: 0,
        decimals: 0,
        ratios: 0,
        algebra: 0,
        statistics: 0,
        multiStep: 0,
        geometry: 0
      }
    },
    phase: 'PRE_SEASON',
    pendingEvents: [],
    resolvedEventHistory: [],
    season: 1,
    freeAgentPool: [],
    managerPool: [],
    lowMoraleWeeks: 0,
    moraleEventCooldowns: {},
  };

  return events.reduce(reduceEvent, initialState);
}

// Helper functions for each event type

function handleGameStarted(state: GameState, event: GameStartedEvent): GameState {
  // Create the player's club entry
  const playerClubEntry: LeagueTableEntry = {
    position: 1,
    clubId: event.clubId,
    clubName: event.clubName,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: []
  };

  // Create AI team entries from the first 23 teams (player's club is 24th)
  const aiTeamEntries: LeagueTableEntry[] = LEAGUE_TWO_TEAMS.slice(0, 23).map(team => ({
    position: 1,
    clubId: team.id,
    clubName: team.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    form: []
  }));

  // Combine and sort (alphabetically initially, will be re-sorted after matches)
  const allEntries = [playerClubEntry, ...aiTeamEntries];
  const sortedEntries = allEntries.sort((a, b) =>
    a.clubName.localeCompare(b.clubName)
  ).map((entry, index) => ({
    ...entry,
    position: index + 1
  }));

  // Generate the inherited starting squad of 16 weak non-league players
  const inheritedSquad = generateStartingSquad(event.seed, event.clubId);

  // Generate the free agent pool for the season
  const freeAgentPool = generateFreeAgentPool(event.seed);

  // Generate the manager pool for the season
  const managerPool = generateManagerPool(event.seed);

  return {
    ...state,
    phase: 'PRE_SEASON',
    club: {
      ...state.club,
      id: event.clubId,
      name: event.clubName,
      transferBudget: event.initialBudget,
      wageBudget: event.initialBudget / 10,
      facilities: getDefaultFacilities(),
      squad: inheritedSquad,
      squadCapacity: 24,
      manager: null,
    },
    league: {
      ...state.league,
      entries: sortedEntries
    },
    freeAgentPool,
    managerPool,
  };
}

function handleTransferCompleted(state: GameState, event: TransferCompletedEvent): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      squad: [...state.club.squad, event.player],
      transferBudget: state.club.transferBudget - event.fee
    }
  };
}

function handlePlayerSold(state: GameState, event: any): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      squad: state.club.squad.filter(p => p.id !== event.playerId),
      transferBudget: state.club.transferBudget + event.fee
    }
  };
}

function handleBudgetUpdated(state: GameState, event: any): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      transferBudget: state.club.transferBudget + event.amount
    }
  };
}

function handleMatchSimulated(state: GameState, event: MatchSimulatedEvent): GameState {
  const { homeTeamId, awayTeamId, homeGoals, awayGoals } = event;

  // Determine result for each side
  const homeResult: 'W' | 'D' | 'L' =
    homeGoals > awayGoals ? 'W' : homeGoals < awayGoals ? 'L' : 'D';
  const awayResult: 'W' | 'D' | 'L' =
    awayGoals > homeGoals ? 'W' : awayGoals < homeGoals ? 'L' : 'D';

  const homePoints = homeResult === 'W' ? 3 : homeResult === 'D' ? 1 : 0;
  const awayPoints = awayResult === 'W' ? 3 : awayResult === 'D' ? 1 : 0;

  // Update league table entries
  const updatedEntries = state.league.entries.map(entry => {
    if (entry.clubId === homeTeamId) {
      return updateEntry(entry, homeGoals, awayGoals, homePoints, homeResult);
    }
    if (entry.clubId === awayTeamId) {
      return updateEntry(entry, awayGoals, homeGoals, awayPoints, awayResult);
    }
    return entry;
  });

  // Re-sort by points, GD, goals scored
  const sorted = sortLeagueTable(updatedEntries);

  // Update player's club form if they played
  let clubForm = state.club.form;
  let clubResult: 'W' | 'D' | 'L' | null = null;
  if (state.club.id === homeTeamId) {
    clubResult = homeResult;
    clubForm = [...clubForm, homeResult].slice(-5);
  } else if (state.club.id === awayTeamId) {
    clubResult = awayResult;
    clubForm = [...clubForm, awayResult].slice(-5);
  }

  // Layer 1: result morale delta — applied when the player's club played this fixture
  let squad = state.club.squad;
  if (clubResult && squad.length > 0) {
    const playerEntry   = sorted.find(e => e.clubId === state.club.id);
    const opponentId    = state.club.id === homeTeamId ? awayTeamId : homeTeamId;
    const opponentEntry = sorted.find(e => e.clubId === opponentId);
    const playerPos     = playerEntry?.position   ?? 12;
    const opponentPos   = opponentEntry?.position ?? 12;
    squad = applyResultMoraleDelta(squad, clubResult, playerPos, opponentPos, clubForm);
  }

  return {
    ...state,
    league: { ...state.league, entries: sorted },
    club: { ...state.club, form: clubForm, squad }
  };
}

function updateEntry(
  entry: LeagueTableEntry,
  goalsFor: number,
  goalsAgainst: number,
  points: number,
  result: 'W' | 'D' | 'L'
): LeagueTableEntry {
  const won = entry.won + (result === 'W' ? 1 : 0);
  const drawn = entry.drawn + (result === 'D' ? 1 : 0);
  const lost = entry.lost + (result === 'L' ? 1 : 0);
  const gf = entry.goalsFor + goalsFor;
  const ga = entry.goalsAgainst + goalsAgainst;

  return {
    ...entry,
    played: entry.played + 1,
    won,
    drawn,
    lost,
    goalsFor: gf,
    goalsAgainst: ga,
    goalDifference: gf - ga,
    points: entry.points + points,
    form: [...entry.form, result].slice(-5)
  };
}

function handleFacilityUpgraded(state: GameState, event: any): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      facilities: state.club.facilities.map(f =>
        f.type === event.facilityType
          ? { ...f, level: event.level, upgradeCost: getUpgradeCost(event.facilityType, event.level) }
          : f
      ),
      transferBudget: state.club.transferBudget - event.cost
    }
  };
}

function handleStaffHired(state: GameState, event: StaffHiredEvent): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      staff: [...state.club.staff, event.staff],
      transferBudget: state.club.transferBudget - event.wages
    }
  };
}

function handleStaffFired(state: GameState, event: any): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      staff: state.club.staff.filter(s => s.id !== event.staffId)
    }
  };
}

function handleMathAttemptRecorded(state: GameState, event: MathAttemptRecordedEvent): GameState {
  // Map topic to recentPerformance field
  const topicMapping: Record<string, keyof typeof state.businessAcumen.recentPerformance> = {
    'percentage': 'percentage',
    'percentages': 'percentage',
    'decimal': 'decimals',
    'decimals': 'decimals',
    'ratio': 'ratios',
    'ratios': 'ratios',
    'algebra': 'algebra',
    'statistics': 'statistics',
    'stats': 'statistics',
    'multiStep': 'multiStep',
    'multi-step': 'multiStep',
    'geometry': 'geometry'
  };

  const topicKey = topicMapping[event.topic.toLowerCase()];
  if (!topicKey) {
    // Unknown topic, skip update
    return state;
  }

  // Simple rolling average: weight new attempt at 20%, existing score at 80%
  const currentScore = state.businessAcumen.recentPerformance[topicKey];
  const attemptScore = event.correct ? 100 : 0;
  const newScore = Math.round(currentScore * 0.8 + attemptScore * 0.2);

  const updatedPerformance = {
    ...state.businessAcumen.recentPerformance,
    [topicKey]: newScore
  };

  // Calculate star ratings based on average performance
  // Average all topic scores to get overall performance
  const scores = Object.values(updatedPerformance);
  const avgPerformance = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  // Map performance to stars (0-5)
  // 0-20: 0 stars, 20-40: 1 star, 40-60: 2 stars, 60-80: 3 stars, 80-90: 4 stars, 90+: 5 stars
  const calculateStars = (performance: number): number => {
    if (performance >= 90) return 5;
    if (performance >= 80) return 4;
    if (performance >= 60) return 3;
    if (performance >= 40) return 2;
    if (performance >= 20) return 1;
    return 0;
  };

  const stars = calculateStars(avgPerformance);

  return {
    ...state,
    businessAcumen: {
      ...state.businessAcumen,
      financial: stars,
      statistical: stars,
      strategic: stars,
      recentPerformance: updatedPerformance
    }
  };
}

function handleWeekAdvanced(state: GameState, event: any): GameState {
  const week: number = event.week;

  // Calculate weekly revenue from revenue-generating facilities
  const commercial = state.club.facilities.find(f => f.type === 'CLUB_COMMERCIAL');
  const foodBev = state.club.facilities.find(f => f.type === 'FOOD_AND_BEVERAGE');
  const commercialRevenue = commercial ? commercial.level * 50_000 : 0; // £500/week per level
  const foodRevenue = foodBev ? foodBev.level * 30_000 : 0;            // £300/week per level
  const weeklyRevenue = commercialRevenue + foodRevenue;

  let phase = state.phase;
  if (week <= 15) {
    phase = 'EARLY_SEASON';
  } else if (week <= 30) {
    phase = 'MID_SEASON';
  } else if (week <= 46) {
    phase = 'LATE_SEASON';
  }

  // Manager motivation nudges squad morale each week.
  // motivation=50 → 0/wk  |  motivation=100 → +2/wk  |  motivation=0 → −2/wk
  // Rounds to integer: steps of 1 at 25/75, steps of 2 at 0/100.
  let squad = state.club.squad;
  if (state.club.manager && squad.length > 0) {
    const moraleDelta = Math.round((state.club.manager.attributes.motivation - 50) / 25);
    if (moraleDelta !== 0) {
      squad = squad.map(p => ({
        ...p,
        morale: Math.max(0, Math.min(100, p.morale + moraleDelta)),
      }));
    }
  }

  // Layer 2: contract anxiety drain (individual, bypasses manager nudge)
  if (squad.length > 0) {
    squad = applyContractAnxiety(squad, week);
  }

  // Layer 4: contagion — morale-0 players drain their position group
  if (squad.length > 0) {
    squad = applyContagion(squad);
  }

  // Track consecutive low-morale weeks (< 40 avg) for "Losing Faith" threshold
  const avg = avgSquadMorale(squad);
  const lowMoraleWeeks = avg < 40 ? (state.lowMoraleWeeks ?? 0) + 1 : 0;

  return {
    ...state,
    currentWeek: week,
    phase,
    lowMoraleWeeks,
    club: {
      ...state.club,
      squad,
      transferBudget: state.club.transferBudget + weeklyRevenue,
    }
  };
}

function handleSeasonEnded(state: GameState, _event: any): GameState {
  return {
    ...state,
    phase: 'SEASON_END'
  };
}

const MORALE_THRESHOLD_TEMPLATE_IDS = new Set([
  'morale-unrest',
  'morale-losing-faith',
  'morale-unsettled-player',
]);

function handleClubEventOccurred(state: GameState, event: ClubEventOccurredEvent): GameState {
  // Set a 6-week cooldown for morale threshold events when they fire
  const templateId = event.pendingEvent.templateId;
  const moraleEventCooldowns = MORALE_THRESHOLD_TEMPLATE_IDS.has(templateId)
    ? { ...state.moraleEventCooldowns, [templateId]: event.week + 6 }
    : state.moraleEventCooldowns;

  return {
    ...state,
    moraleEventCooldowns,
    pendingEvents: [...state.pendingEvents, event.pendingEvent]
  };
}

function handleClubEventResolved(state: GameState, event: ClubEventResolvedEvent): GameState {
  // Find the pending event to get its templateId
  const pendingEvent = state.pendingEvents.find(e => e.id === event.eventId);
  if (!pendingEvent) return state;

  // Apply budget effect
  const budgetDelta = event.budgetEffect ?? 0;
  const newBudget = state.club.transferBudget + budgetDelta;

  // Apply reputation effect (clamped 0-100)
  const repDelta = event.reputationEffect ?? 0;
  const newReputation = Math.max(0, Math.min(100, state.club.reputation + repDelta));

  // Append to resolved history
  const historyEntry = `${pendingEvent.templateId}:${event.choiceId}`;
  const newHistory = [...state.resolvedEventHistory, historyEntry];

  // Remove resolved events from pendingEvents
  const newPendingEvents = state.pendingEvents.filter(e => e.id !== event.eventId);

  // Poaching: remove player from squad if accepted
  let squad = state.club.squad;
  if (event.playerRemovedId) {
    squad = squad.filter(p => p.id !== event.playerRemovedId);
  }

  // Poaching: apply morale delta to specific target player (clamped 0-100)
  if (event.moraleTargetId && event.moraleEffect !== undefined) {
    squad = squad.map(p =>
      p.id === event.moraleTargetId
        ? { ...p, morale: Math.max(0, Math.min(100, p.morale + event.moraleEffect!)) }
        : p
    );
  }

  // Morale threshold events: apply moraleEffect squad-wide (no target = all players)
  // Also handles the unsettled-player event's targeted talk/pay-rise (metadata.poachTargetPlayerId)
  if (!event.moraleTargetId && event.moraleEffect !== undefined) {
    const targetPlayerId = pendingEvent.metadata?.poachTargetPlayerId;
    if (targetPlayerId) {
      // Unsettled player event — apply only to that player
      squad = squad.map(p =>
        p.id === targetPlayerId
          ? { ...p, morale: Math.max(0, Math.min(100, p.morale + event.moraleEffect!)) }
          : p
      );
    } else {
      // Squad-wide morale events (unrest, losing faith)
      squad = squad.map(p => ({
        ...p,
        morale: Math.max(0, Math.min(100, p.morale + event.moraleEffect!)),
      }));
    }
  }

  return {
    ...state,
    club: {
      ...state.club,
      transferBudget: newBudget,
      reputation: newReputation,
      squad,
    },
    pendingEvents: newPendingEvents,
    resolvedEventHistory: newHistory
  };
}

function handleSeasonStarted(state: GameState, event: SeasonStartedEvent): GameState {
  return {
    ...state,
    phase: 'EARLY_SEASON',
    season: event.season
  };
}

function handleTrainingFocusSet(state: GameState, event: TrainingFocusSetEvent): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      trainingFocus: event.focus,
    },
  };
}

function handleFormationSet(state: GameState, event: FormationSetEvent): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      preferredFormation: event.formation,
    },
  };
}

function handleFreeAgentSigned(state: GameState, event: FreeAgentSignedEvent): GameState {
  return {
    ...state,
    freeAgentPool: state.freeAgentPool.filter(p => p.id !== event.playerId),
    club: {
      ...state.club,
      squad: [...state.club.squad, event.player],
    },
  };
}

function handlePlayerReleased(state: GameState, event: PlayerReleasedEvent): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      squad: state.club.squad.filter(p => p.id !== event.playerId),
      transferBudget: state.club.transferBudget + event.releaseFee,
    },
  };
}

function handleNpcPlayerSigned(state: GameState, event: NpcPlayerSignedEvent): GameState {
  return {
    ...state,
    freeAgentPool: state.freeAgentPool.filter(p => p.id !== event.player.id),
  };
}

function handleManagerHired(state: GameState, event: ManagerHiredEvent): GameState {
  // Manager change morale: gravitational pull toward 55 (independent of new manager's attributes)
  const squad = state.club.squad.length > 0
    ? applyManagerChangeMorale(state.club.squad)
    : state.club.squad;

  return {
    ...state,
    managerPool: state.managerPool.filter(m => m.id !== event.manager.id),
    club: {
      ...state.club,
      squad,
      manager: { ...event.manager, contractExpiresWeek: event.contractExpiresWeek },
    },
  };
}

function handleManagerSacked(state: GameState, event: ManagerSackedEvent): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      manager: null,
      // Compensation comes out of transfer budget
      transferBudget: state.club.transferBudget - event.compensationPaid,
    },
  };
}

function handlePreSeasonStarted(state: GameState, event: PreSeasonStartedEvent): GameState {
  return {
    ...state,
    phase: 'PRE_SEASON',
    season: event.season,
    currentWeek: 0,
    // Reset form so pre-season starts fresh
    club: {
      ...state.club,
      form: [],
      trainingFocus: null,
      preferredFormation: null,
    },
  };
}

// Utility functions

function createEmptyClub(): Club {
  return {
    id: '',
    name: '',
    transferBudget: 0,
    wageBudget: 0,
    squad: [],
    staff: [],
    facilities: [],
    reputation: 0,
    stadium: {
      name: '',
      capacity: 0,
      averageAttendance: 0,
      ticketPrice: 0
    },
    form: [],
    trainingFocus: null,
    preferredFormation: null,
    squadCapacity: 24,
    manager: null,
  };
}

function createEmptyLeague(): LeagueTable {
  return {
    entries: [],
    automaticPromotion: 3,
    playoffPositions: [4, 5, 6, 7],
    relegation: [23, 24]
  };
}
