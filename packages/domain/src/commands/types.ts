/**
 * Command Types
 *
 * Commands represent intent to perform an action.
 * They are validated and transformed into events.
 */

import { GameEvent } from '../events/types';
import { CommandError } from '../types/game-state-updated';
import { TrainingFocus } from '../types/facility';
import { Formation } from '../types/formation';
import { Position } from '../types/player';

export type GameCommand =
  | MakeTransferCommand
  | UpgradeFacilityCommand
  | HireStaffCommand
  | SimulateWeekCommand
  | RecordMathAttemptCommand
  | ResolveClubEventCommand
  | StartSeasonCommand
  | SetTrainingFocusCommand
  | SetFormationCommand
  | SignFreeAgentCommand
  | ReleasePlayerCommand
  | HireManagerCommand
  | SackManagerCommand
  | SellPlayerToNpcCommand
  | BeginNextSeasonCommand
  | StartScoutMissionCommand
  | PlaceScoutBidCommand
  | CancelScoutMissionCommand
  | AcceptTakeoverCommand
  | AcceptIntroSponsorDealCommand
  | UpgradeCurriculumCommand
  | SetBudgetAllocationCommand
  | ListPlayerForSaleCommand
  | UnlistPlayerCommand
  | BuyTransferListedPlayerCommand;

export interface MakeTransferCommand {
  type: 'MAKE_TRANSFER';
  playerId: string;
  clubId: string;
  offeredFee: number; // in pence
  offeredWages: number; // in pence per week
}

export interface UpgradeFacilityCommand {
  type: 'UPGRADE_FACILITY';
  clubId: string;
  facilityType: string;
}

export interface HireStaffCommand {
  type: 'HIRE_STAFF';
  clubId: string;
  staffId: string;
}

export interface SimulateWeekCommand {
  type: 'SIMULATE_WEEK';
  week: number;
  season: number;
  seed?: string;
}

export interface RecordMathAttemptCommand {
  type: 'RECORD_MATH_ATTEMPT';
  studentId: string;
  topic: string;
  difficulty: number;
  answer: string | number;
  expectedAnswer: string | number;
  startTime: number;
  endTime: number;
}

export interface ResolveClubEventCommand {
  type: 'RESOLVE_CLUB_EVENT';
  eventId: string;
  choiceId: string;
  /**
   * Set by the frontend after evaluating the event's mathsChallenge.
   * Undefined for events without a maths challenge (legacy events).
   */
  mathsCorrect?: boolean;
}

export interface StartSeasonCommand {
  type: 'START_SEASON';
  season: number;
}

export interface SetTrainingFocusCommand {
  type: 'SET_TRAINING_FOCUS';
  focus: TrainingFocus;
}

export interface SetFormationCommand {
  type: 'SET_FORMATION';
  formation: Formation;
}

export interface SignFreeAgentCommand {
  type: 'SIGN_FREE_AGENT';
  playerId: string;
  offeredWage: number;       // pence/week
}

export interface ReleasePlayerCommand {
  type: 'RELEASE_PLAYER';
  playerId: string;
}

export interface HireManagerCommand {
  type: 'HIRE_MANAGER';
  managerId: string;
}

export interface SackManagerCommand {
  type: 'SACK_MANAGER';
}

export interface SellPlayerToNpcCommand {
  type: 'SELL_PLAYER_TO_NPC';
  playerId: string;
  /** ID of the buying NPC club (from LEAGUE_TWO_TEAMS) */
  npcClubId: string;
}

export interface BeginNextSeasonCommand {
  type: 'BEGIN_NEXT_SEASON';
}

export interface StartScoutMissionCommand {
  type: 'START_SCOUT_MISSION';
  position: Position;
  attributePriority: 'attack' | 'defence' | 'teamwork' | null;
  /** Maximum transfer fee willing to pay, in pence */
  budgetCeiling: number;
}

export interface PlaceScoutBidCommand {
  type: 'PLACE_SCOUT_BID';
  /** Whether the math challenge was passed in the frontend */
  negotiationPassed: boolean;
  /** Weekly wage offered to the player, in pence */
  offeredWage: number;
}

export interface CancelScoutMissionCommand {
  type: 'CANCEL_SCOUT_MISSION';
}

export interface AcceptTakeoverCommand {
  type: 'ACCEPT_TAKEOVER';
}

export interface AcceptIntroSponsorDealCommand {
  type: 'ACCEPT_INTRO_SPONSOR_DEAL';
  clubId: string;
  choice: 'A' | 'B';
  /** Amount to credit in pence */
  amount: number;
}

export interface UpgradeCurriculumCommand {
  type: 'UPGRADE_CURRICULUM';
  toLevel: string;
}

export interface SetBudgetAllocationCommand {
  type: 'SET_BUDGET_ALLOCATION';
  /** New absolute amounts for each pool (pence). Must sum to current total. */
  transfer: number;
  infrastructure: number;
  wages: number;
}

export interface ListPlayerForSaleCommand {
  type: 'LIST_PLAYER_FOR_SALE';
  playerId: string;
}

export interface UnlistPlayerCommand {
  type: 'UNLIST_PLAYER';
  playerId: string;
}

export interface BuyTransferListedPlayerCommand {
  type: 'BUY_TRANSFER_LISTED_PLAYER';
  /** ID of the player in transferListedPool */
  playerId: string;
  /** The player's own club ID (for validation) */
  clubId: string;
}

export interface CommandResult {
  /** Events generated (if successful) */
  events?: GameEvent[];

  /** Error (if failed) */
  error?: CommandError;
}
