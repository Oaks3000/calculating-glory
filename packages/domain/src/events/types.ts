/**
 * Event Types
 *
 * Events represent things that have happened in the game.
 * They are immutable facts that build up the event stream.
 */

import { Player, Position } from '../types/player';
import { Staff, Manager } from '../types/staff';
import { PendingClubEvent } from '../types/game-state-updated';
import { TrainingFocus } from '../types/facility';
import { Formation } from '../types/formation';
import { CurriculumLevel } from '../curriculum/curriculum-config';

export type GameEvent =
  | GameStartedEvent
  | TransferCompletedEvent
  | PlayerSoldEvent
  | BudgetUpdatedEvent
  | MatchSimulatedEvent
  | FacilityUpgradedEvent
  | FacilityUpgradeStartedEvent
  | FacilityConstructionCompletedEvent
  | StaffHiredEvent
  | StaffFiredEvent
  | MathAttemptRecordedEvent
  | WeekAdvancedEvent
  | SeasonEndedEvent
  | ClubEventOccurredEvent
  | ClubEventResolvedEvent
  | SeasonStartedEvent
  | TrainingFocusSetEvent
  | FormationSetEvent
  | FreeAgentSignedEvent
  | PlayerReleasedEvent
  | NpcPlayerSignedEvent
  | ManagerHiredEvent
  | ManagerSackedEvent
  | PreSeasonStartedEvent
  | ScoutMissionStartedEvent
  | ScoutTargetFoundEvent
  | ScoutBidPlacedEvent
  | ScoutTransferCompletedEvent
  | ScoutMissionCancelledEvent
  | OwnerForcedOutEvent
  | TakeoverAcceptedEvent
  | ParachuteOfferedEvent;

export interface TransferCompletedEvent {
  type: 'TRANSFER_COMPLETED';
  timestamp: number;
  playerId: string;
  clubId: string;
  fee: number; // in pence
  wages: number; // in pence per week
  player: Player; // Full player object to add to squad
}

export interface BudgetUpdatedEvent {
  type: 'BUDGET_UPDATED';
  timestamp: number;
  clubId: string;
  amount: number; // in pence
  reason: string;
}

export interface MatchSimulatedEvent {
  type: 'MATCH_SIMULATED';
  timestamp: number;
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  seed: string;
}

export interface FacilityUpgradedEvent {
  type: 'FACILITY_UPGRADED';
  timestamp: number;
  clubId: string;
  facilityType: string;
  level: number;
  cost: number; // in pence
}

export interface FacilityUpgradeStartedEvent {
  type: 'FACILITY_UPGRADE_STARTED';
  timestamp: number;
  clubId: string;
  facilityType: string;
  /** The level being built toward (current level + 1) */
  targetLevel: number;
  /** Budget deducted immediately (in pence) */
  cost: number;
  /** Weeks until construction completes */
  weeksToComplete: number;
}

export interface FacilityConstructionCompletedEvent {
  type: 'FACILITY_CONSTRUCTION_COMPLETED';
  timestamp: number;
  clubId: string;
  facilityType: string;
  /** The new level now active */
  newLevel: number;
}

export interface StaffHiredEvent {
  type: 'STAFF_HIRED';
  timestamp: number;
  clubId: string;
  staffId: string;
  role: string;
  wages: number; // in pence per week
  staff: Staff; // Full staff object to add to club
}

export interface MathAttemptRecordedEvent {
  type: 'MATH_ATTEMPT_RECORDED';
  timestamp: number;
  studentId: string;
  topic: string;
  difficulty: number;
  correct: boolean;
  timeSpent: number; // milliseconds
}

export interface WeekAdvancedEvent {
  type: 'WEEK_ADVANCED';
  timestamp: number;
  week: number;
  season: number;
}

export interface GameStartedEvent {
  type: 'GAME_STARTED';
  timestamp: number;
  clubId: string;
  clubName: string;
  initialBudget: number; // in pence
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  seed: string; // For deterministic league generation
  /** Curriculum level selected by the student at game start. Controls maths difficulty — independent of division. */
  curriculumLevel?: CurriculumLevel;
}

export interface PlayerSoldEvent {
  type: 'PLAYER_SOLD';
  timestamp: number;
  playerId: string;
  clubId: string;
  fee: number; // in pence
  /** Name of the sold player (for news ticker) */
  playerName?: string;
  /** Buying NPC club ID */
  npcClubId?: string;
  /** Buying NPC club name (for news ticker) */
  npcClubName?: string;
}

export interface StaffFiredEvent {
  type: 'STAFF_FIRED';
  timestamp: number;
  clubId: string;
  staffId: string;
}

export interface SeasonEndedEvent {
  type: 'SEASON_ENDED';
  timestamp: number;
  season: number;
  finalPosition: number;
  promoted: boolean;
  relegated: boolean;
}

export interface ClubEventOccurredEvent {
  type: 'CLUB_EVENT_OCCURRED';
  timestamp: number;
  eventId: string;
  templateId: string;
  week: number;
  clubId: string;
  pendingEvent: PendingClubEvent;
}

export interface ClubEventResolvedEvent {
  type: 'CLUB_EVENT_RESOLVED';
  timestamp: number;
  eventId: string;
  templateId: string;
  choiceId: string;
  clubId: string;
  budgetEffect?: number;
  reputationEffect?: number;
  /** Poaching: player ID to remove from squad (accept/counter choices) */
  playerRemovedId?: string;
  /** Poaching: player ID whose morale should change (reject/ignore choices) */
  moraleTargetId?: string;
  /** Poaching: morale delta to apply to moraleTargetId */
  moraleEffect?: number;
  /** The week the event was resolved — stored for chain hop delay scheduling */
  resolvedWeek: number;
  /**
   * Whether the player correctly answered the maths challenge.
   * Undefined for events without a maths challenge.
   */
  mathsCorrect?: boolean;
}

export interface SeasonStartedEvent {
  type: 'SEASON_STARTED';
  timestamp: number;
  season: number;
}

export interface TrainingFocusSetEvent {
  type: 'TRAINING_FOCUS_SET';
  timestamp: number;
  clubId: string;
  focus: TrainingFocus;
  previousFocus: TrainingFocus | null;
}

export interface FormationSetEvent {
  type: 'FORMATION_SET';
  timestamp: number;
  clubId: string;
  formation: Formation;
  previousFormation: Formation | null;
}

export interface FreeAgentSignedEvent {
  type: 'FREE_AGENT_SIGNED';
  timestamp: number;
  playerId: string;
  clubId: string;
  offeredWage: number;       // pence/week
  contractExpiresWeek: number;
  player: Player;            // Full player object with updated wage + contractExpiresWeek
}

export interface PlayerReleasedEvent {
  type: 'PLAYER_RELEASED';
  timestamp: number;
  playerId: string;
  clubId: string;
  releaseFee: number;        // pence, 0 if out of contract
}

export interface NpcPlayerSignedEvent {
  type: 'NPC_PLAYER_SIGNED';
  timestamp: number;
  npcClubId: string;
  npcClubName: string;
  player: Player;
}

export interface ManagerHiredEvent {
  type: 'MANAGER_HIRED';
  timestamp: number;
  clubId: string;
  manager: Manager;
  /** Week the contract expires */
  contractExpiresWeek: number;
}

export interface ManagerSackedEvent {
  type: 'MANAGER_SACKED';
  timestamp: number;
  clubId: string;
  managerId: string;
  /** Compensation paid in pence */
  compensationPaid: number;
}

export interface PreSeasonStartedEvent {
  type: 'PRE_SEASON_STARTED';
  timestamp: number;
  /** The new season number (previous season + 1) */
  season: number;
  /**
   * Players retiring this off-season (age reached retirementAge).
   * Populated by BEGIN_NEXT_SEASON command handler; applied by the reducer.
   */
  retiredPlayers?: ReadonlyArray<{ id: string; name: string; flavour: string }>;
}

// ── Scout Mission Events ───────────────────────────────────────────────────────

export interface ScoutMissionStartedEvent {
  type: 'SCOUT_MISSION_STARTED';
  timestamp: number;
  clubId: string;
  position: Position;
  attributePriority: 'attack' | 'defence' | 'teamwork' | null;
  budgetCeiling: number;   // pence
  scoutFee: number;        // pence deducted from transferBudget
  weekStarted: number;
}

/** Emitted on the week tick after SCOUT_MISSION_STARTED — player identified at NPC club */
export interface ScoutTargetFoundEvent {
  type: 'SCOUT_TARGET_FOUND';
  timestamp: number;
  clubId: string;
  target: Player;
  targetNpcClubId: string;
  targetNpcClubName: string;
  /** Transfer fee the NPC club is asking, in pence */
  askingPrice: number;
}

/** Emitted when the player attempts negotiation (math challenge result) */
export interface ScoutBidPlacedEvent {
  type: 'SCOUT_BID_PLACED';
  timestamp: number;
  clubId: string;
  /** true = challenge passed, bid pending window; false = rejected, can retry */
  negotiationPassed: boolean;
  /** Wage offered to the player, stored until window opens */
  offeredWage: number;
}

/** Emitted at the start of the first eligible transfer window week after a successful bid */
export interface ScoutTransferCompletedEvent {
  type: 'SCOUT_TRANSFER_COMPLETED';
  timestamp: number;
  clubId: string;
  player: Player;          // full player object with agreed wage + contract
  fee: number;             // pence deducted from transferBudget
  targetNpcClubId: string;
  targetNpcClubName: string;
}

export interface ScoutMissionCancelledEvent {
  type: 'SCOUT_MISSION_CANCELLED';
  timestamp: number;
  clubId: string;
}

/** Emitted when the owner-forced-out trigger fires (bottom 3 + broke at week 30+) */
export interface OwnerForcedOutEvent {
  type: 'OWNER_FORCED_OUT';
  timestamp: number;
  /** The club the player was running */
  previousClubId:   string;
  previousClubName: string;
  /** Their position in the table at the moment of ousting */
  previousPosition: number;
  /** The bottom NPC club offered as a takeover vehicle */
  takeoverClubId:   string;
  takeoverClubName: string;
  /** Seed string for generating the takeover club's starting squad */
  seed: string;
  week: number;
  /** Inferred starting budget for the takeover club (pence) */
  takeoverBudget: number;
  /** Reputation malus applied on acceptance (negative value) */
  reputationMalus: number;
}

/**
 * Emitted when the player advances through the limbo week (SIMULATE_WEEK in FORCED_OUT phase).
 * Transitions phase to PARACHUTE_OFFERED — the takeover offer screen.
 */
export interface ParachuteOfferedEvent {
  type: 'PARACHUTE_OFFERED';
  timestamp: number;
  takeoverClubId:   string;
  takeoverClubName: string;
  takeoverBudget:   number;
  reputationMalus:  number;
  week: number;
}

/** Emitted when the player clicks "Accept" on the takeover offer screen */
export interface TakeoverAcceptedEvent {
  type: 'TAKEOVER_ACCEPTED';
  timestamp: number;
  takeoverClubId:   string;
  takeoverClubName: string;
  seed: string;
  week: number;
}
