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
import { MathsChallengeSpec, NpcId } from '../data/club-events';
import { MathTopic } from '../curriculum/curriculum-config';

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
  /**
   * Chain events: budget effect used when the event's maths challenge was correct.
   * Falls back to budgetEffect if not set.
   */
  mathsCorrectBudgetEffect?: number;
  /**
   * Chain events: budget effect used when the event's maths challenge was wrong.
   * Falls back to budgetEffect if not set.
   */
  mathsWrongBudgetEffect?: number;
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
  /** NPC who delivers this event */
  npc?: NpcId;
  /** Chain identifier (e.g. 'catering-crisis') */
  chainId?: string;
  /** Hop number within the chain (1-indexed) */
  hopNumber?: number;
  /** Total hops in the chain — used for "Hop X of Y" UI */
  chainLength?: number;
  /** Structured maths challenge to evaluate before choices apply */
  mathsChallenge?: MathsChallengeSpec;
  /**
   * When set, the math negotiation choice on this event should pull a
   * question from the question bank for this topic rather than generating
   * an inline financial-context percentage question.
   */
  bankTopic?: MathTopic;
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
 * Which division the player's club is currently competing in.
 * Starts at LEAGUE_TWO; updated on SEASON_ENDED based on promoted/relegated flags.
 */
export type Division = 'LEAGUE_TWO' | 'LEAGUE_ONE' | 'CHAMPIONSHIP' | 'PREMIER_LEAGUE';

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

  /**
   * Final standings from the previous season.
   * Undefined for season 1. Populated at the start of each subsequent season
   * so the UI can display last season's table alongside the current one.
   */
  previousLeagueTable?: LeagueTable;

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
   * The runway band recorded at the end of the last simulated week.
   * Used to detect threshold crossings (e.g. GREEN → AMBER) for Val's inbox messages.
   * Undefined until the first RUNWAY_BAND_CHANGED event is emitted.
   */
  lastRunwayBand?: 'SURPLUS' | 'GREEN' | 'AMBER' | 'RED' | 'CRITICAL';

  /**
   * The form-streak milestone last emitted as a MORALE_TICKER_EVENT.
   * Null when no streak is active. Updated by the WEEK_ADVANCED reducer.
   * Used to prevent re-emitting the same milestone during an ongoing run.
   */
  lastFormMilestone?: 'W3' | 'W5' | 'L3' | 'L5' | null;

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

  /** Which division the club is currently in. Updated at season end. */
  division: Division;

  /**
   * Evolved NPC team base strengths. Maps clubId → effective baseStrength.
   * Seeded from static team data on first appearance; adjusted each season
   * based on final league position (top 4 NPCs: +2, bottom 4 NPCs: −2,
   * clamped 25–99). Ensures long-running NPCs grow or decline over time.
   */
  npcStrengths: Record<string, number>;

  /**
   * Maps "templateId:choiceId" → the week that event+choice was resolved.
   * Used by the chain hop scheduler to enforce delayWeeks between hops.
   */
  resolvedEventWeeks: Record<string, number>;

  /**
   * Maps templateId → maths quality for chain events that had a mathsChallenge.
   * 'correct' | 'wrong' — used to route follow-up hop variants
   * (e.g. a "re-inspection pass" hop vs "re-inspection fail" hop).
   */
  mathsOutcomes: Record<string, 'correct' | 'wrong'>;
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
  /** The takeover club's inferred starting budget (pence) */
  takeoverBudget: number;
  /** Reputation malus applied on acceptance (negative) */
  reputationMalus: number;
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
  | 'EARLY_SEASON'        // Weeks 1-15
  | 'MID_SEASON'          // Weeks 16-30
  | 'LATE_SEASON'         // Weeks 31-46
  | 'SEASON_END'
  | 'FORCED_OUT'          // Owner ousted — limbo week, no matches simulated
  | 'PARACHUTE_OFFERED';  // Limbo week passed — takeover offer presented

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
