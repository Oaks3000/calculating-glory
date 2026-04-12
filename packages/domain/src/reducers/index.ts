/**
 * Event Reducers
 *
 * Pure functions that apply events to state.
 */

import { GameEvent, GameStartedEvent, MatchSimulatedEvent, TransferCompletedEvent, StaffHiredEvent, MathAttemptRecordedEvent, ClubEventOccurredEvent, ClubEventResolvedEvent, SeasonStartedEvent, TrainingFocusSetEvent, FormationSetEvent, FreeAgentSignedEvent, PlayerReleasedEvent, NpcPlayerSignedEvent, ManagerHiredEvent, ManagerSackedEvent, PreSeasonStartedEvent, ScoutMissionStartedEvent, ScoutTargetFoundEvent, ScoutBidPlacedEvent, ScoutTransferCompletedEvent, OwnerForcedOutEvent, TakeoverAcceptedEvent, ParachuteOfferedEvent, CurriculumUpgradedEvent } from '../events/types';
import { GameState, Division } from '../types/game-state-updated';
import { Club } from '../types/club';
import { LeagueTable, LeagueTableEntry, sortLeagueTable } from '../types/league';
import { CURRICULUM_LEVELS } from '../curriculum/curriculum-config';
import { getTeamsForDivision } from '../data/division-teams';
import { getDefaultFacilities, getUpgradeCost } from '../types/facility';
import { facilityRevenue, squadCharismaRevenue } from '../simulation/revenue';
import { generateStartingSquad } from '../data/squad-generator';
import { generateFreeAgentPool } from '../data/free-agent-generator';
import { generateManagerPool } from '../data/manager-generator';
import {
  applyResultMoraleDelta,
  applyContractAnxiety,
  applyContagion,
  applyManagerChangeMorale,
  avgSquadMorale,
  detectFormMilestone,
} from '../simulation/morale';
import { applySeasonProgression } from '../simulation/progression';

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
    case 'FACILITY_UPGRADE_STARTED':
      return handleFacilityUpgradeStarted(state, event);
    case 'FACILITY_CONSTRUCTION_COMPLETED':
      return handleFacilityConstructionCompleted(state, event);
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
    case 'SCOUT_MISSION_STARTED':
      return handleScoutMissionStarted(state, event);
    case 'SCOUT_TARGET_FOUND':
      return handleScoutTargetFound(state, event);
    case 'SCOUT_BID_PLACED':
      return handleScoutBidPlaced(state, event);
    case 'SCOUT_TRANSFER_COMPLETED':
      return handleScoutTransferCompleted(state, event);
    case 'SCOUT_MISSION_CANCELLED':
      return handleScoutMissionCancelled(state);
    case 'OWNER_FORCED_OUT':
      return handleOwnerForcedOut(state, event);
    case 'PARACHUTE_OFFERED':
      return handleParachuteOffered(state, event);
    case 'TAKEOVER_ACCEPTED':
      return handleTakeoverAccepted(state, event);
    case 'CURRICULUM_UPGRADED':
      return handleCurriculumUpgraded(state, event);
    case 'RUNWAY_BAND_CHANGED':
      return { ...state, lastRunwayBand: event.band };
    case 'MORALE_TICKER_EVENT':
      return { ...state, lastFormMilestone: event.milestoneKey };
    case 'BOARD_BAILOUT':
      return state; // applied inside handleWeekAdvanced; event is informational
    case 'BUDGET_ALLOCATION_SET':
      return {
        ...state,
        club: {
          ...state.club,
          transferBudget: event.transfer,
          infrastructureBudget: event.infrastructure,
          wageReserve: event.wages,
          budgetAllocation: {
            transfer: Math.round((event.transfer / (event.transfer + event.infrastructure + event.wages)) * 100),
            infrastructure: Math.round((event.infrastructure / (event.transfer + event.infrastructure + event.wages)) * 100),
            wages: Math.round((event.wages / (event.transfer + event.infrastructure + event.wages)) * 100),
          },
        },
      };
    case 'PLAYER_LISTED':
      return {
        ...state,
        club: {
          ...state.club,
          listedPlayerIds: [...(state.club.listedPlayerIds ?? []), event.playerId],
        },
      };
    case 'PLAYER_UNLISTED':
      return {
        ...state,
        club: {
          ...state.club,
          listedPlayerIds: (state.club.listedPlayerIds ?? []).filter(id => id !== event.playerId),
        },
      };
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
    scoutMission: null,
    forcedOut:    null,
    division:     'LEAGUE_TWO',
    npcStrengths: {},
    resolvedEventWeeks: {},
    mathsOutcomes: {},
    clubRecords: { biggestWin: null, longestWinStreak: 0, topScorer: null },
    currentWinStreak: 0,
  };

  return events.reduce(reduceEvent, initialState);
}

// Helper functions for each event type

/**
 * Derives a stadium name from the club name.
 * e.g. "Calculating Glory FC" → "Calculating Glory Park"
 *      "Riverside United"     → "Riverside Park"
 */
function deriveStadiumName(clubName: string): string {
  const stripped = clubName
    .replace(/\s*(F\.?C\.?|A\.?F\.?C\.?|United|City|Town|Rovers|Wanderers|Athletic|Albion|Rangers|Celtic)\s*$/i, '')
    .trim();
  return `${stripped || clubName} Park`;
}

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
  const aiTeamEntries: LeagueTableEntry[] = getTeamsForDivision('LEAGUE_TWO').slice(0, 23).map(team => ({
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

  // Seed NPC strengths from static League Two team data for the initial season.
  const initialNpcStrengths: Record<string, number> = {};
  for (const team of getTeamsForDivision('LEAGUE_TWO')) {
    initialNpcStrengths[team.id] = team.baseStrength;
  }

  return {
    ...state,
    phase: 'PRE_SEASON',
    // Curriculum level is set by the student's year group at game start — independent of division.
    // Default to YEAR_7 for saves that pre-date this field (backward compat).
    curriculum: CURRICULUM_LEVELS[event.curriculumLevel ?? 'YEAR_7'],
    club: {
      ...state.club,
      id: event.clubId,
      name: event.clubName,
      transferBudget: Math.round(event.initialBudget * 0.5),
      infrastructureBudget: Math.round(event.initialBudget * 0.2),
      wageReserve: Math.round(event.initialBudget * 0.3),
      budgetAllocation: { transfer: 50, infrastructure: 20, wages: 30 },
      facilities: getDefaultFacilities(),
      squad: inheritedSquad,
      squadCapacity: 24,
      manager: null,
      listedPlayerIds: [],
      stadium: {
        ...state.club.stadium,
        name: event.stadiumName ?? deriveStadiumName(event.clubName),
        capacity: state.club.stadium.capacity || 5000,
        averageAttendance: state.club.stadium.averageAttendance || 1200,
        ticketPrice: state.club.stadium.ticketPrice || 1500,
      },
    },
    league: {
      ...state.league,
      entries: sortedEntries
    },
    freeAgentPool,
    managerPool,
    npcStrengths: initialNpcStrengths,
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
      transferBudget: state.club.transferBudget + event.fee,
      listedPlayerIds: (state.club.listedPlayerIds ?? []).filter(id => id !== event.playerId),
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
  const opponentId = state.club.id === homeTeamId ? awayTeamId : homeTeamId;
  if (clubResult && squad.length > 0) {
    const playerEntry   = sorted.find(e => e.clubId === state.club.id);
    const opponentEntry = sorted.find(e => e.clubId === opponentId);
    const playerPos     = playerEntry?.position   ?? 12;
    const opponentPos   = opponentEntry?.position ?? 12;
    squad = applyResultMoraleDelta(squad, clubResult, playerPos, opponentPos, clubForm);
  }

  // Layer 2: club records + board confidence drift (only when player's club played)
  let clubRecords = state.clubRecords;
  let currentWinStreak = state.currentWinStreak ?? 0;
  let boardConfidence = state.boardConfidence;

  if (clubResult) {
    const isHome = state.club.id === homeTeamId;
    const playerGoals   = isHome ? homeGoals : awayGoals;
    const opponentGoals = isHome ? awayGoals : homeGoals;
    const margin        = playerGoals - opponentGoals;
    const opponentEntry = state.league.entries.find(e => e.clubId === opponentId);
    const opponentName  = opponentEntry?.clubName ?? 'Unknown';

    // Update win streak
    if (clubResult === 'W') {
      currentWinStreak += 1;
    } else {
      currentWinStreak = 0;
    }

    // Update all-time records
    const existingMargin = clubRecords.biggestWin
      ? clubRecords.biggestWin.playerGoals - clubRecords.biggestWin.opponentGoals
      : -1;

    clubRecords = {
      ...clubRecords,
      biggestWin:
        clubResult === 'W' && margin > existingMargin
          ? { playerGoals, opponentGoals, opponentName, week: state.currentWeek + 1, season: state.season }
          : clubRecords.biggestWin,
      longestWinStreak: Math.max(clubRecords.longestWinStreak, currentWinStreak),
    };

    // Board confidence drift — small per-match signal so form builds pressure
    const confDelta = clubResult === 'W' ? 2 : clubResult === 'L' ? -3 : 0;
    boardConfidence = Math.max(5, Math.min(95, boardConfidence + confDelta));
  }

  return {
    ...state,
    league: { ...state.league, entries: sorted },
    club: { ...state.club, form: clubForm, squad },
    clubRecords,
    currentWinStreak,
    boardConfidence,
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
      infrastructureBudget: state.club.infrastructureBudget - event.cost
    }
  };
}

function handleFacilityUpgradeStarted(state: GameState, event: any): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      facilities: state.club.facilities.map(f =>
        f.type === event.facilityType
          ? { ...f, constructionWeeksRemaining: event.weeksToComplete }
          : f
      ),
      infrastructureBudget: state.club.infrastructureBudget - event.cost,
    }
  };
}

function handleFacilityConstructionCompleted(state: GameState, event: any): GameState {
  return {
    ...state,
    club: {
      ...state.club,
      facilities: state.club.facilities.map(f =>
        f.type === event.facilityType
          ? { ...f, level: event.newLevel, upgradeCost: getUpgradeCost(event.facilityType, event.newLevel), constructionWeeksRemaining: undefined }
          : f
      ),
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

  // Facility revenue scales with division tier (see simulation/revenue.ts).
  const facRevenue = facilityRevenue(state.club.facilities, state.division);

  // Charisma-based popularity revenue: t³ × 75,000p × (OVR × 0.1)
  // Zero for most League Two squads; scales steeply above c=80 for high-OVR players.
  // See simulation/revenue.ts for full formula documentation.
  const charismaRevenue = squadCharismaRevenue(state.club.squad);

  const weeklyRevenue = facRevenue + charismaRevenue;

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

  // Reset lastFormMilestone whenever no streak is currently active.
  // The handler emits MORALE_TICKER_EVENT (which sets it) only on a new crossing;
  // we reset here so the same milestone can fire again after a streak breaks and reforms.
  const lastFormMilestone = detectFormMilestone(state.club.form);

  // Decrement construction timers on any in-progress facilities.
  // Facilities completing this week already had FACILITY_CONSTRUCTION_COMPLETED applied
  // before this event, so their constructionWeeksRemaining is already cleared.
  const facilities = state.club.facilities.map(f =>
    f.constructionWeeksRemaining && f.constructionWeeksRemaining > 0
      ? { ...f, constructionWeeksRemaining: f.constructionWeeksRemaining - 1 }
      : f
  );

  // ── Weekly wage deduction & revenue ─────────────────────────────────────────
  // Wages are real: deducted from the wage reserve each week.
  // Revenue (facility + charisma) flows into the wage reserve to sustain it.
  const playerWages  = squad.reduce((sum, p) => sum + p.wage, 0);
  const staffWages   = state.club.staff.reduce((sum, s) => sum + s.salary, 0);
  const managerWage  = state.club.manager?.wage ?? 0;
  const weeklyWages  = playerWages + staffWages + managerWage;

  let wageReserve = state.club.wageReserve + weeklyRevenue - weeklyWages;
  let transferBudget = state.club.transferBudget;
  let infrastructureBudget = state.club.infrastructureBudget;

  // ── Board bailout: cover wage shortfall at 10% penalty ──────────────────────
  // If the wage reserve goes negative, the board steps in — but charges 10%.
  // Penalty is taken from Transfer Fund first, then Infrastructure Fund.
  if (wageReserve < 0) {
    const shortfall = Math.abs(wageReserve);
    const penalty   = Math.round(shortfall * 0.1);
    wageReserve     = 0; // board covers the shortfall

    let penaltyRemaining = penalty;
    const fromTransfer = Math.min(penaltyRemaining, transferBudget);
    transferBudget -= fromTransfer;
    penaltyRemaining -= fromTransfer;

    if (penaltyRemaining > 0) {
      const fromInfra = Math.min(penaltyRemaining, infrastructureBudget);
      infrastructureBudget -= fromInfra;
    }
  }

  return {
    ...state,
    currentWeek: week,
    phase,
    lowMoraleWeeks,
    lastFormMilestone,
    club: {
      ...state.club,
      squad,
      facilities,
      wageReserve,
      transferBudget,
      infrastructureBudget,
    }
  };
}

const DIVISION_ORDER: Division[] = [
  'LEAGUE_TWO',
  'LEAGUE_ONE',
  'CHAMPIONSHIP',
  'PREMIER_LEAGUE',
];

function stepDivision(current: Division, promoted: boolean, relegated: boolean): Division {
  const idx = DIVISION_ORDER.indexOf(current);
  if (promoted)  return DIVISION_ORDER[Math.min(idx + 1, DIVISION_ORDER.length - 1)];
  if (relegated) return DIVISION_ORDER[Math.max(idx - 1, 0)];
  return current;
}

function handleSeasonEnded(state: GameState, event: any): GameState {
  const { finalPosition, promoted, relegated } = event as {
    finalPosition: number;
    promoted: boolean;
    relegated: boolean;
  };

  // Reputation delta: promotion +10, relegation -8, top 7 +3, bottom half -2
  const repDelta = promoted ? 10
    : relegated ? -8
    : finalPosition <= 7 ? 3
    : finalPosition >= 13 ? -2
    : 0;
  const newReputation = Math.max(0, Math.min(100, state.club.reputation + repDelta));

  // Board confidence delta: promotion +20, top 7 +10, near-relegated (21-22) -10, relegated -20
  const confDelta = promoted ? 20
    : relegated ? -20
    : finalPosition <= 7 ? 10
    : finalPosition >= 21 ? -10
    : 0;
  const newBoardConfidence = Math.max(0, Math.min(100, state.boardConfidence + confDelta));

  const newDivision = stepDivision(state.division, promoted, relegated);

  // ── Top scorer ───────────────────────────────────────────────────────────────
  // Attribute season goals to the squad's best forward (or best attacker if no FWD).
  // Goals = floor(teamGoalsFor × 0.28), minimum 2.
  // This is a cosmetic figure derived from aggregate match data.
  const clubEntry = state.league.entries.find(e => e.clubId === state.club.id);
  const teamGoals = clubEntry?.goalsFor ?? 0;
  let topScorer = state.clubRecords.topScorer;
  if (state.club.squad.length > 0 && teamGoals > 0) {
    const forwards = state.club.squad.filter(p => p.position === 'FWD');
    const candidates = forwards.length > 0 ? forwards : state.club.squad;
    const best = candidates.reduce((a, b) =>
      b.attributes.attack > a.attributes.attack ? b : a
    );
    const goals = Math.max(2, Math.floor(teamGoals * 0.28));
    topScorer = { name: best.name, goals, season: state.season };
  }

  return {
    ...state,
    phase: 'SEASON_END',
    club: { ...state.club, reputation: newReputation },
    boardConfidence: newBoardConfidence,
    division: newDivision,
    clubRecords: { ...state.clubRecords, topScorer },
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

  // Record the week this event+choice was resolved (for chain hop delayWeeks)
  const resolvedKey = `${pendingEvent.templateId}:${event.choiceId}`;
  const newResolvedEventWeeks = {
    ...(state.resolvedEventWeeks ?? {}),
    [resolvedKey]: event.resolvedWeek,
  };

  // Record maths quality for chain events (for mathsQuality prerequisite routing)
  const newMathsOutcomes = { ...(state.mathsOutcomes ?? {}) };
  if (event.mathsCorrect !== undefined) {
    newMathsOutcomes[pendingEvent.templateId] = event.mathsCorrect ? 'correct' : 'wrong';
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
    resolvedEventHistory: newHistory,
    resolvedEventWeeks: newResolvedEventWeeks,
    mathsOutcomes: newMathsOutcomes,
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
      listedPlayerIds: (state.club.listedPlayerIds ?? []).filter(id => id !== event.playerId),
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
  const retiringIds = new Set((event.retiredPlayers ?? []).map(p => p.id));

  // Age up all squad members, update attack/defence from their career curves,
  // and remove anyone whose retirement was confirmed by the command handler.
  const updatedSquad = state.club.squad
    .filter(p => !retiringIds.has(p.id))
    .map(p => applySeasonProgression(p));

  // Snapshot the final standings before resetting — used to display "Last Season" in the UI.
  const previousLeagueTable = state.league;

  // Evolve NPC strengths based on the previous season's final standings.
  // Top 4 NPCs by position: +2 strength. Bottom 4 NPCs: -2 strength. Clamped 25–99.
  const evolvedStrengths = { ...state.npcStrengths };
  const npcEntries = previousLeagueTable.entries
    .filter(e => e.clubId !== state.club.id)
    .sort((a, b) => a.position - b.position);
  const total = npcEntries.length;
  npcEntries.forEach((entry, idx) => {
    const rank = idx + 1;
    const current = evolvedStrengths[entry.clubId] ?? 50;
    const delta = rank <= 4 ? 2 : rank > total - 4 ? -2 : 0;
    evolvedStrengths[entry.clubId] = Math.max(25, Math.min(99, current + delta));
  });

  // Rebuild NPC entries from the player's current division (may have changed via
  // promotion/relegation). The player's own entry is preserved and stats cleared.
  const playerEntry = state.league.entries.find(e => e.clubId === state.club.id)!;
  const freshPlayerEntry: LeagueTableEntry = {
    ...playerEntry,
    played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
    points: 0, form: [],
  };
  const npcTeams = getTeamsForDivision(state.division);
  const freshNpcEntries: LeagueTableEntry[] = npcTeams.slice(0, 23).map(team => ({
    position: 1, clubId: team.id, clubName: team.name,
    played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
    points: 0, form: [],
  }));
  const freshEntries = sortLeagueTable([freshPlayerEntry, ...freshNpcEntries]);

  // Seed strengths for any NPC team entering the league for the first time
  // (e.g. after promotion — a new division's clubs won't be in evolvedStrengths yet).
  for (const team of npcTeams) {
    if (!(team.id in evolvedStrengths)) {
      evolvedStrengths[team.id] = team.baseStrength;
    }
  }

  // Refresh free agent pool for the new season, scaled to the player's current division.
  // Use a season+club seed so the pool is fresh but deterministic.
  const gameStartEvent = state.events.find(e => e.type === 'GAME_STARTED') as
    { type: 'GAME_STARTED'; seed: string } | undefined;
  const baseSeed = gameStartEvent?.seed ?? 'default-seed';
  const freshFreeAgentPool = generateFreeAgentPool(
    `${baseSeed}-season-${event.season}`,
    state.division,
  );

  return {
    ...state,
    phase: 'PRE_SEASON',
    season: event.season,
    currentWeek: 0,
    previousLeagueTable,
    league: { ...state.league, entries: freshEntries },
    npcStrengths: evolvedStrengths,
    freeAgentPool: freshFreeAgentPool,
    club: {
      ...state.club,
      squad: updatedSquad,
      form: [],
      trainingFocus: null,
      preferredFormation: null,
      listedPlayerIds: [], // clear transfer listings at start of each season
    },
  };
}

// ── Scout Mission Reducers ────────────────────────────────────────────────────

function handleScoutMissionStarted(state: GameState, event: ScoutMissionStartedEvent): GameState {
  return {
    ...state,
    scoutMission: {
      status:           'SEARCHING',
      position:          event.position,
      attributePriority: event.attributePriority,
      budgetCeiling:     event.budgetCeiling,
      scoutFee:          event.scoutFee,
      weekStarted:       event.weekStarted,
    },
    club: {
      ...state.club,
      transferBudget: state.club.transferBudget - event.scoutFee,
    },
  };
}

function handleScoutTargetFound(state: GameState, event: ScoutTargetFoundEvent): GameState {
  if (!state.scoutMission) return state;
  return {
    ...state,
    scoutMission: {
      ...state.scoutMission,
      status:            'TARGET_FOUND',
      target:             event.target,
      targetNpcClubId:    event.targetNpcClubId,
      targetNpcClubName:  event.targetNpcClubName,
      askingPrice:        event.askingPrice,
    },
  };
}

function handleScoutBidPlaced(state: GameState, event: ScoutBidPlacedEvent): GameState {
  if (!state.scoutMission) return state;
  return {
    ...state,
    scoutMission: {
      ...state.scoutMission,
      status:      event.negotiationPassed ? 'BID_PENDING' : 'BID_REJECTED',
      offeredWage: event.offeredWage,
    },
  };
}

function handleScoutTransferCompleted(state: GameState, event: ScoutTransferCompletedEvent): GameState {
  return {
    ...state,
    scoutMission: null,
    club: {
      ...state.club,
      squad: [...state.club.squad, event.player],
      transferBudget: state.club.transferBudget - event.fee,
    },
  };
}

function handleScoutMissionCancelled(state: GameState): GameState {
  return {
    ...state,
    scoutMission: null,
  };
}

function handleOwnerForcedOut(state: GameState, event: OwnerForcedOutEvent): GameState {
  return {
    ...state,
    phase: 'FORCED_OUT',
    forcedOut: {
      previousClubId:   event.previousClubId,
      previousClubName: event.previousClubName,
      previousPosition: event.previousPosition,
      takeoverClubId:   event.takeoverClubId,
      takeoverClubName: event.takeoverClubName,
      week:             event.week,
      takeoverBudget:   event.takeoverBudget,
      reputationMalus:  event.reputationMalus,
    },
  };
}

function handleParachuteOffered(state: GameState, _event: ParachuteOfferedEvent): GameState {
  // forcedOut remains populated — the offer screen reads from it.
  // currentWeek was already updated by the preceding WEEK_ADVANCED event.
  return {
    ...state,
    phase: 'PARACHUTE_OFFERED',
  };
}

function handleTakeoverAccepted(state: GameState, event: TakeoverAcceptedEvent): GameState {
  if (!state.forcedOut) return state;

  // Determine season phase from current week
  const w     = state.currentWeek;
  const phase = w <= 15 ? 'EARLY_SEASON' : w <= 30 ? 'MID_SEASON' : 'LATE_SEASON';

  // Generate a fresh (very weak) starting squad for the takeover club
  const newSquad = generateStartingSquad(
    `${event.seed}-takeover-${event.takeoverClubId}`,
    event.takeoverClubId,
  );

  const newReputation = Math.max(0, Math.min(100,
    state.club.reputation + state.forcedOut.reputationMalus,
  ));

  return {
    ...state,
    phase,
    forcedOut: null,
    scoutMission: null,
    boardConfidence: 20,      // rock-bottom board confidence
    club: {
      ...state.club,
      id:             event.takeoverClubId,
      name:           event.takeoverClubName,
      transferBudget: Math.round(state.forcedOut.takeoverBudget * 0.5),
      infrastructureBudget: Math.round(state.forcedOut.takeoverBudget * 0.2),
      wageReserve:    Math.round(state.forcedOut.takeoverBudget * 0.3),
      budgetAllocation: { transfer: 50, infrastructure: 20, wages: 30 },
      squad:          newSquad,
      squadCapacity:  24,
      facilities:     getDefaultFacilities(),
      manager:        null,
      listedPlayerIds: [],
      staff:          [],
      reputation:     newReputation,
    },
  };
}

// Utility functions

function createEmptyClub(): Club {
  return {
    id: '',
    name: '',
    transferBudget: 0,
    infrastructureBudget: 0,
    wageReserve: 0,
    budgetAllocation: { transfer: 50, infrastructure: 20, wages: 30 },
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
    listedPlayerIds: [],
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

function handleCurriculumUpgraded(state: GameState, event: CurriculumUpgradedEvent): GameState {
  const toLevel = event.toLevel as keyof typeof CURRICULUM_LEVELS;
  const newCurriculum = CURRICULUM_LEVELS[toLevel];
  if (!newCurriculum) return state;

  return {
    ...state,
    curriculum: newCurriculum,
  };
}
