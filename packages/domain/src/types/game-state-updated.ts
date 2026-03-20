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
import { Player, Position } from './player';
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

// ── Scout Mission ─────────────────────────────────────────────────────────────

export type ScoutMissionStatus =
  | 'SEARCHING'     // Scout is out looking — resolves to TARGET_FOUND on next week tick
  | 'TARGET_FOUND'  // Player identified at NPC club — awaiting bid
  | 'BID_PENDING'   // Math challenge passed, bid submitted — completes when window opens
  | 'BID_REJECTED'; // Math challenge failed — can re-bid

export interface ScoutMission {
  status: ScoutMissionStatus;
  position: Position;
  attributePriority: 'attack' | 'defence' | 'teamwork' | null;
  /** Maximum transfer fee willing to pay, in pence */
  budgetCeiling: number;
  /** Scout fee already paid upfront, in pence */
  scoutFee: number;
  /** Week the mission was started */
  weekStarted: number;
  /** Populated when status moves to TARGET_FOUND */
  target?: Player;
  targetNpcClubId?: string;
  targetNpcClubName?: string;
  /** Transfer fee the NPC club wants, in pence */
  askingPrice?: number;
  /** Wage offered by the player — stored when bid is placed, used on window open */
  offeredWage?: number;
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

  /**
   * Consecutive weeks the squad average morale has been below 40.
   * Resets to 0 when avg morale rises back above 40.
   * Used to trigger the "Players Losing Faith" event at 3+ weeks.
   */
  lowMoraleWeeks: number;

  /**
   * Cooldown tracker for threshold morale events.
   * Maps event templateId → week the cooldown expires.
   * Prevents the same event firing more than once per 6 weeks.
   */
  moraleEventCooldowns: Record<string, number>;

  /**
   * Active scout mission, if any.
   * Only one mission can be active at a time.
   */
  scoutMission: ScoutMission | null;

  /**
   * Set when the owner has been forced out (trigger: bottom 3 + budget < £10k at week 30+).
   * Cleared when the player accepts the takeover of the bottom NPC club.
   */
  forcedOut: ForcedOutState | null;
}

/**
 * State held during the forced-out / takeover-offer interstitial.
 */
export interface ForcedOutState {
  /** The club the player was ousted from */
  previousClubId:   string;
  previousClubName: string;
  /** Their league position at the time of ousting */
  previousPosition: number;
  /** The bottom NPC club being offered as the takeover target */
  takeoverClubId:   string;
  takeoverClubName: string;
  /** The week the ousting happened */
  week: number;
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
  | 'SEASON_END'
  | 'FORCED_OUT';       // Owner ousted — awaiting takeover acceptance

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
