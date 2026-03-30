/**
 * Match Commentary Engine — Phase A (Kev only)
 *
 * Transforms a known match result into a timed beat sequence for
 * performance by the Owner's Box UI.
 *
 * Deterministic: same MatchCommentaryContext + same seed = same timeline,
 * every time. Template selection and goal-minute placement both use the
 * seeded RNG derived from the match seed.
 */

import { createRng } from './rng';
import { KEV_TEMPLATES } from '../data/commentary-templates';

// ── Core types ─────────────────────────────────────────────────────────────

export type BeatType =
  | 'KICKOFF'
  | 'QUIET_PASSAGE'
  | 'CHANCE'
  | 'GOAL'
  | 'NEAR_MISS'
  | 'HALF_TIME'
  | 'FULL_TIME';

export type CrowdState =
  | 'MURMUR'
  | 'BUILDING'
  | 'TENSE'
  | 'ROAR'
  | 'GROAN'
  | 'CELEBRATION'
  | 'HOSTILE'
  | 'SILENT';

export interface PhoneMessage {
  sender: 'KEV' | 'VAL' | 'MARCUS' | 'DANI';
  text: string;
  mood: 'neutral' | 'excited' | 'worried' | 'elated' | 'frustrated' | 'dry';
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface Beat {
  matchMinute: number;
  /** Seconds from kickoff. HALF_TIME is fixed at 28s; FULL_TIME at 75s. */
  realTimeOffset: number;
  type: BeatType;
  /** Messages to display in order in the phone thread. */
  content: PhoneMessage[];
  crowdState: CrowdState;
  /** Present only on beats where the scoreline changes. */
  scoreboardUpdate?: MatchScore;
}

export interface MatchTimeline {
  beats: Beat[];
  finalScore: MatchScore;
  /** Whether the player's club is the home side. */
  isHome: boolean;
}

/**
 * Everything generateMatchTimeline() needs.
 * Caller is responsible for mapping MatchSimulatedEvent + GameState into this shape.
 */
export interface MatchCommentaryContext {
  homeGoals: number;
  awayGoals: number;
  /** Match seed — used as base for the commentary RNG. */
  seed: string;
  /** Is the player's club the home team? */
  isHome: boolean;
  playerTeamName: string;
  opponentTeamName: string;
  /** First names of squad players — used for [SCORER] substitution. */
  squadPlayerNames: string[];
  /** Goalkeeper first name — used for [KEEPER] substitution. */
  keeperName: string;
}

// ── Real-time offset mapping ───────────────────────────────────────────────

/**
 * Piecewise linear mapping from match minutes (0–90) to real seconds (0–69).
 *
 * Segment boundaries:
 *   min  0 → 0s     min 20 → 10s    min 35 → 20s    min 45 → 28s
 *   (HALF_TIME beat occupies 28–36s)
 *   min 45 (2H) → 36s   min 60 → 44s   min 75 → 54s   min 90 → 69s
 *
 * The FULL_TIME beat is fixed at 75s (outside this function).
 */
function minuteToRealTime(minute: number): number {
  if (minute <= 20) return minute * 0.5;
  if (minute <= 35) return 10 + (minute - 20) * (10 / 15);
  if (minute <= 45) return 20 + (minute - 35) * (8 / 10);
  if (minute <= 60) return 36 + (minute - 45) * (8 / 15);
  if (minute <= 75) return 44 + (minute - 60) * (10 / 15);
  return                    54 + (minute - 75) * 1.0;
}

// ── Timeline generator ─────────────────────────────────────────────────────

export function generateMatchTimeline(ctx: MatchCommentaryContext): MatchTimeline {
  const rng = createRng(ctx.seed + '-commentary');

  const playerGoals   = ctx.isHome ? ctx.homeGoals : ctx.awayGoals;
  const opponentGoals = ctx.isHome ? ctx.awayGoals : ctx.homeGoals;

  // ── local helpers ────────────────────────────────────────────────────────

  function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(rng.next() * arr.length)];
  }

  function fill(template: string, scorer?: string): string {
    return template
      .replace(/\[SCORER\]/g,   scorer ?? 'the lad')
      .replace(/\[PLAYER\]/g,   scorer ?? 'the lad')
      .replace(/\[KEEPER\]/g,   ctx.keeperName || 'the keeper')
      .replace(/\[OPPONENT\]/g, ctx.opponentTeamName)
      .replace(/\[TEAM\]/g,     ctx.playerTeamName);
  }

  function randomPlayerName(): string {
    if (ctx.squadPlayerNames.length === 0) return 'the lad';
    return ctx.squadPlayerNames[Math.floor(rng.next() * ctx.squadPlayerNames.length)];
  }

  /**
   * Pick a random minute in [minVal, maxVal] not already taken and not adjacent
   * to a taken minute (so beats don't collide).
   */
  function pickMinute(minVal: number, maxVal: number, taken: Set<number>): number | null {
    const candidates: number[] = [];
    for (let m = minVal; m <= maxVal; m++) {
      if (!taken.has(m - 1) && !taken.has(m) && !taken.has(m + 1)) {
        candidates.push(m);
      }
    }
    if (candidates.length === 0) return null;
    return candidates[Math.floor(rng.next() * candidates.length)];
  }

  // ── distribute goal minutes ──────────────────────────────────────────────

  // Minutes 0, 45, 90 are reserved for mandatory beats.
  const reserved = new Set<number>([0, 45, 90]);

  const playerGoalMinutes: number[] = [];
  for (let i = 0; i < playerGoals; i++) {
    const m = pickMinute(2, 88, reserved);
    if (m !== null) {
      playerGoalMinutes.push(m);
      reserved.add(m);
      reserved.add(m + 1); // aftermath minute
    }
  }

  const opponentGoalMinutes: number[] = [];
  for (let i = 0; i < opponentGoals; i++) {
    const m = pickMinute(2, 88, reserved);
    if (m !== null) {
      opponentGoalMinutes.push(m);
      reserved.add(m);
      reserved.add(m + 1);
    }
  }

  playerGoalMinutes.sort((a, b) => a - b);
  opponentGoalMinutes.sort((a, b) => a - b);

  // ── score helper ─────────────────────────────────────────────────────────

  function playerLeadAtMinute(minute: number): number {
    const pg = playerGoalMinutes.filter(m => m <= minute).length;
    const og = opponentGoalMinutes.filter(m => m <= minute).length;
    return pg - og;
  }

  // ── build beat list ──────────────────────────────────────────────────────

  const beats: Beat[] = [];

  // KICKOFF ──────────────────────────────────────────────────────────────────
  beats.push({
    matchMinute: 0,
    realTimeOffset: 0,
    type: 'KICKOFF',
    content: [{ sender: 'KEV', text: fill(pick(KEV_TEMPLATES.kickoff)), mood: 'neutral' }],
    crowdState: 'MURMUR',
  });

  // GOALS (chronological, tracking running score) ───────────────────────────
  const allGoalEvents = [
    ...playerGoalMinutes.map(m  => ({ minute: m,  isPlayer: true  })),
    ...opponentGoalMinutes.map(m => ({ minute: m, isPlayer: false })),
  ].sort((a, b) => a.minute - b.minute);

  let runningPlayer   = 0;
  let runningOpponent = 0;

  for (const event of allGoalEvents) {
    if (event.isPlayer) runningPlayer++;
    else                runningOpponent++;

    const homeScore = ctx.isHome ? runningPlayer   : runningOpponent;
    const awayScore = ctx.isHome ? runningOpponent : runningPlayer;

    if (event.isPlayer) {
      const scorer = randomPlayerName();

      // GOAL beat: buildup line + reaction line (UI displays with brief gap between)
      beats.push({
        matchMinute: event.minute,
        realTimeOffset: 0,
        type: 'GOAL',
        content: [
          { sender: 'KEV', text: fill(pick(KEV_TEMPLATES.goal_player_buildup),  scorer), mood: 'excited' },
          { sender: 'KEV', text: fill(pick(KEV_TEMPLATES.goal_player_reaction), scorer), mood: 'elated'  },
        ],
        crowdState: 'ROAR',
        scoreboardUpdate: { home: homeScore, away: awayScore },
      });

      // Aftermath
      beats.push({
        matchMinute: event.minute + 1,
        realTimeOffset: 0,
        type: 'QUIET_PASSAGE',
        content: [{ sender: 'KEV', text: fill(pick(KEV_TEMPLATES.goal_player_aftermath), scorer), mood: 'elated' }],
        crowdState: 'CELEBRATION',
      });
    } else {
      beats.push({
        matchMinute: event.minute,
        realTimeOffset: 0,
        type: 'GOAL',
        content: [{ sender: 'KEV', text: fill(pick(KEV_TEMPLATES.opponent_goal_reaction)), mood: 'frustrated' }],
        crowdState: 'GROAN',
        scoreboardUpdate: { home: homeScore, away: awayScore },
      });

      beats.push({
        matchMinute: event.minute + 1,
        realTimeOffset: 0,
        type: 'QUIET_PASSAGE',
        content: [{ sender: 'KEV', text: fill(pick(KEV_TEMPLATES.opponent_goal_aftermath)), mood: 'frustrated' }],
        crowdState: 'MURMUR',
      });
    }
  }

  // CHANCE beats (1–2 per half) ─────────────────────────────────────────────
  for (let half = 0; half < 2; half++) {
    const [lo, hi] = half === 0 ? [5, 43] : [47, 87];
    const count = 1 + Math.floor(rng.next() * 2); // 1 or 2
    for (let i = 0; i < count; i++) {
      const m = pickMinute(lo, hi, reserved);
      if (m !== null) {
        reserved.add(m);
        beats.push({
          matchMinute: m,
          realTimeOffset: 0,
          type: 'CHANCE',
          content: [{
            sender: 'KEV',
            text:  fill(pick(KEV_TEMPLATES.chance_player), randomPlayerName()),
            mood: 'excited',
          }],
          crowdState: 'TENSE',
        });
      }
    }
  }

  // NEAR_MISS beats (0–1 per half, 60% chance) ──────────────────────────────
  for (let half = 0; half < 2; half++) {
    if (rng.next() < 0.6) {
      const [lo, hi] = half === 0 ? [10, 42] : [50, 86];
      const m = pickMinute(lo, hi, reserved);
      if (m !== null) {
        reserved.add(m);
        beats.push({
          matchMinute: m,
          realTimeOffset: 0,
          type: 'NEAR_MISS',
          content: [{ sender: 'KEV', text: fill(pick(KEV_TEMPLATES.near_miss_opponent)), mood: 'worried' }],
          crowdState: 'GROAN',
        });
      }
    }
  }

  // QUIET_PASSAGE beats at fixed waypoints ───────────────────────────────────
  const quietWaypoints = [7, 14, 22, 30, 38, 52, 62, 71, 79];
  for (const pos of quietWaypoints) {
    if (reserved.has(pos) || reserved.has(pos - 1) || reserved.has(pos + 1)) continue;

    const lead = playerLeadAtMinute(pos);
    const isFinalPhase = pos >= 76;

    let template: readonly string[];
    if (isFinalPhase) {
      template = lead > 0 ? KEV_TEMPLATES.final_minutes_winning
               : lead < 0 ? KEV_TEMPLATES.final_minutes_losing
               : KEV_TEMPLATES.final_minutes_level;
    } else {
      // Occasionally use building_pressure in the second half when close
      const useBuilding = pos > 45 && lead <= 0 && rng.next() < 0.35;
      if (useBuilding) {
        template = KEV_TEMPLATES.building_pressure;
      } else {
        template = lead > 0 ? KEV_TEMPLATES.quiet_winning
                 : lead < 0 ? KEV_TEMPLATES.quiet_losing
                 : KEV_TEMPLATES.quiet_neutral;
      }
    }

    const mood = lead > 0 ? 'neutral' : lead < 0 ? 'worried' : 'neutral';
    const crowd: CrowdState = isFinalPhase && Math.abs(lead) <= 1 ? 'TENSE' : 'MURMUR';

    beats.push({
      matchMinute: pos,
      realTimeOffset: 0,
      type: 'QUIET_PASSAGE',
      content: [{ sender: 'KEV', text: fill(pick(template)), mood }],
      crowdState: crowd,
    });
    reserved.add(pos);
  }

  // HALF_TIME ────────────────────────────────────────────────────────────────
  const htLead = playerLeadAtMinute(45);
  const htTemplate =
    htLead > 0 ? KEV_TEMPLATES.half_time_winning :
    htLead < 0 ? KEV_TEMPLATES.half_time_losing  :
                 KEV_TEMPLATES.half_time_level;
  beats.push({
    matchMinute: 45,
    realTimeOffset: 28,
    type: 'HALF_TIME',
    content: [{
      sender: 'KEV',
      text:   fill(pick(htTemplate)),
      mood:   htLead > 0 ? 'neutral' : htLead < 0 ? 'frustrated' : 'neutral',
    }],
    crowdState: 'MURMUR',
  });

  // FULL_TIME ────────────────────────────────────────────────────────────────
  const ftTemplate =
    playerGoals > opponentGoals ? KEV_TEMPLATES.full_time_win  :
    playerGoals < opponentGoals ? KEV_TEMPLATES.full_time_loss :
                                  KEV_TEMPLATES.full_time_draw;
  const ftMood =
    playerGoals > opponentGoals ? 'elated'     :
    playerGoals < opponentGoals ? 'frustrated' :
                                  'neutral';
  const ftCrowd: CrowdState =
    playerGoals > opponentGoals ? 'CELEBRATION' :
    playerGoals < opponentGoals ? 'SILENT'       :
                                  'MURMUR';
  beats.push({
    matchMinute: 90,
    realTimeOffset: 75,
    type: 'FULL_TIME',
    content: [{ sender: 'KEV', text: fill(pick(ftTemplate)), mood: ftMood }],
    crowdState: ftCrowd,
    scoreboardUpdate: { home: ctx.homeGoals, away: ctx.awayGoals },
  });

  // ── apply real-time offsets ───────────────────────────────────────────────
  for (const beat of beats) {
    if (beat.type !== 'HALF_TIME' && beat.type !== 'FULL_TIME') {
      beat.realTimeOffset = minuteToRealTime(beat.matchMinute);
    }
  }

  // ── sort by real-time offset ──────────────────────────────────────────────
  beats.sort((a, b) =>
    a.realTimeOffset !== b.realTimeOffset
      ? a.realTimeOffset - b.realTimeOffset
      : a.matchMinute - b.matchMinute
  );

  return {
    beats,
    finalScore: { home: ctx.homeGoals, away: ctx.awayGoals },
    isHome: ctx.isHome,
  };
}
