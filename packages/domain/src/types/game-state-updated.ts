/**
 * Core game state types
 *
 * Game state is derived from events, not stored directly.
 * These types represent the projections built from the event log.
 */

import { GameEvent } from '../events/types';
import { Club } from './club';
import { LeagueTable } from './league';
import { CurriculumConfig } from '../curriculum/curriculum-config';
import { Player } from './player';
import { Manager } from './staff';

/**
 * A choice available within a club event
 */
export interface ClubEventChoice {
  id: string;
  label: string;
  description: string;
  cost?: number;              // pence
  budgetEffect?: number;      // pence (positive = gain)
  reputationEffect?: number;
  performanceEffect?: number;
  requiresMath?: boolean;
  /** Poaching: if true, the poach target leaves the squad (transfer fee is in budgetEffect) */
  playerLeaves?: boolean;
  /** Poaching: morale delta applied to the poach target player (negative = unhappy) */
  moraleEffect?: number;
}

/**
 * A pending club event waiting for player resolution
 */
export interface PendingClubEvent {
  id: string;
  templateId: string;
  week: number;
  title: string;
  description: string;
  severity: 'minor' | 'major';
  choices: ClubEventChoice[];
  resolved: boolean;
  /**
   * Optional metadata for specialised event types (e.g. NPC poaching).
   * Not present on standard club events.
   */
  metadata?: {
    poachTargetPlayerId?: string;
    npcClubId?: string;
    npcClubName?: string;
    offeredFee?: number;
  };
}

/**
 * Complete game state - derived from event log
 */
export interface GameState {
  /** Schema version for migrations */
  version: number;

  /** Curriculum configuration (controls difficulty, topics, features) */
  curriculum: CurriculumConfig;

  /** Event log (source of truth) */
  events: GameEvent[];

  /** Checksum for integrity verification */
  checksum: string;

  /** Current week number (1-46 for League Two season) */
  currentWeek: number;

  /** Player's club */
  club: Club;

  /** League standings */
  league: LeagueTable;

  /** Board confidence level (0-100) */
  boardConfidence: number;

  /** Business acumen stats (derived from math attempts) */
  businessAcumen: BusinessAcumen;

  /** Season phase */
  phase: SeasonPhase;

  /** Pending club events waiting for player resolution */
  pendingEvents: PendingClubEvent[];

  /** History of resolved events (templateId:choiceId pairs for branching) */
  resolvedEventHistory: string[];

  /** Current season number */
  season: number;

  /** Pool of available free agents */
  freeAgentPool: Player[];

  /** Available managers to hire (generated at game start, removed on hire) */
  managerPool: Manager[];
}

/**
 * Business acumen tracking (derived from math attempt events)
 */
export interface BusinessAcumen {
  financial: number;      // 0-5 stars
  statistical: number;    // 0-5 stars
  strategic: number;      // 0-5 stars
  
  /** Recent accuracy by category */
  recentPerformance: {
    percentage: number;     // 0-100
    decimals: number;
    ratios: number;
    algebra: number;
    statistics: number;
    multiStep: number;
    geometry: number;
  };
}

/**
 * Season phases
 */
export type SeasonPhase = 
  | 'PRE_SEASON'
  | 'EARLY_SEASON'      // Weeks 1-15
  | 'MID_SEASON'        // Weeks 16-30
  | 'LATE_SEASON'       // Weeks 31-46
  | 'SEASON_END';

/**
 * Command errors
 */
export interface CommandError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type ErrorCode =
  | 'INSUFFICIENT_BUDGET'
  | 'INVALID_TRANSFER'
  | 'SQUAD_LIMIT_EXCEEDED'
  | 'PLAYER_NOT_FOUND'
  | 'INVALID_PHASE'
  | 'VALIDATION_FAILED';

/**
 * Projection builder function type
 */
export type ProjectionBuilder<T> = (events: GameEvent[]) => T;
