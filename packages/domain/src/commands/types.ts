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
  | BeginNextSeasonCommand;

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

export interface CommandResult {
  /** Events generated (if successful) */
  events?: GameEvent[];

  /** Error (if failed) */
  error?: CommandError;
}
