/**
 * Event Types
 *
 * Events represent things that have happened in the game.
 * They are immutable facts that build up the event stream.
 */

import { Player } from '../types/player';
import { Staff } from '../types/staff';
import { PendingClubEvent } from '../types/game-state-updated';
import { TrainingFocus } from '../types/facility';

export type GameEvent =
  | GameStartedEvent
  | TransferCompletedEvent
  | PlayerSoldEvent
  | BudgetUpdatedEvent
  | MatchSimulatedEvent
  | FacilityUpgradedEvent
  | StaffHiredEvent
  | StaffFiredEvent
  | MathAttemptRecordedEvent
  | WeekAdvancedEvent
  | SeasonEndedEvent
  | ClubEventOccurredEvent
  | ClubEventResolvedEvent
  | SeasonStartedEvent
  | TrainingFocusSetEvent;

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
}

export interface PlayerSoldEvent {
  type: 'PLAYER_SOLD';
  timestamp: number;
  playerId: string;
  clubId: string;
  fee: number; // in pence
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
  choiceId: string;
  clubId: string;
  budgetEffect?: number;
  reputationEffect?: number;
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
