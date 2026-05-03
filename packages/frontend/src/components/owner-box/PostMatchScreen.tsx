/**
 * PostMatchScreen
 *
 * Full-screen overlay shown after the Owner's Box completes.
 * Sits between OwnerBox.onComplete and returning to the Command Centre.
 *
 * Shows: result badge, score, goal timeline, league position, NPC reactions.
 */

import { GameState, GameEvent, generateNpcMessages, avgSquadMorale, diagnoseMatch, MatchFactor } from '@calculating-glory/domain';
import { MatchTimeline, MatchScore } from '@calculating-glory/domain';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GoalMoment {
  minute: number;
  scoredByPlayer: boolean;
  score: MatchScore;
}

interface PostMatchScreenProps {
  timeline: MatchTimeline;
  playerTeamName: string;
  opponentTeamName: string;
  state: GameState;
  events: GameEvent[];
  onContinue: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractGoals(timeline: MatchTimeline): GoalMoment[] {
  const goals: GoalMoment[] = [];
  let prev: MatchScore = { home: 0, away: 0 };

  for (const beat of timeline.beats) {
    if (beat.type === 'GOAL' && beat.scoreboardUpdate) {
      const curr = beat.scoreboardUpdate;
      const homeScored = curr.home > prev.home;
      const scoredByPlayer = timeline.isHome ? homeScored : !homeScored;
      goals.push({ minute: beat.matchMinute, scoredByPlayer, score: { ...curr } });
      prev = curr;
    }
  }

  return goals;
}

function getResult(timeline: MatchTimeline): 'W' | 'D' | 'L' {
  const { finalScore, isHome } = timeline;
  const p = isHome ? finalScore.home : finalScore.away;
  const o = isHome ? finalScore.away : finalScore.home;
  return p > o ? 'W' : p < o ? 'L' : 'D';
}

const RESULT_CONFIG = {
  W: {
    label: 'WIN',
    emoji: '🏆',
    colour: 'text-pitch-green',
    bg: 'bg-pitch-green/10 border-pitch-green/30',
    headlines: [
      'Three points. The team delivered.',
      'Get in. That\'s what we\'re here for.',
      'Brilliant. Back to winning ways.',
    ],
  },
  D: {
    label: 'DRAW',
    emoji: '🤝',
    colour: 'text-warn-amber',
    bg: 'bg-warn-amber/10 border-warn-amber/30',
    headlines: [
      'A point on the board. We take it.',
      'Honours even. There\'s work to do.',
      'Could\'ve been worse. Move on.',
    ],
  },
  L: {
    label: 'DEFEAT',
    emoji: '📉',
    colour: 'text-alert-red',
    bg: 'bg-alert-red/10 border-alert-red/30',
    headlines: [
      'Tough day. Back to the training ground.',
      'That stings. We regroup.',
      'Not good enough. Time to bounce back.',
    ],
  },
};

const NPC_COLOURS: Record<string, { avatar: string; name: string }> = {
  VAL:    { avatar: 'bg-warn-amber/20 text-warn-amber',   name: 'text-warn-amber'   },
  KEV:    { avatar: 'bg-data-blue/20 text-data-blue',     name: 'text-data-blue'    },
  MARCUS: { avatar: 'bg-pitch-green/20 text-pitch-green', name: 'text-pitch-green'  },
  DANI:   { avatar: 'bg-alert-red/20 text-alert-red',     name: 'text-alert-red'    },
};

const NPC_FULL_NAMES: Record<string, string> = {
  VAL: 'Val Chen', KEV: 'Kev Mulligan', MARCUS: 'Marcus Webb', DANI: 'Dani Osei',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function PostMatchScreen({
  timeline,
  playerTeamName,
  opponentTeamName,
  state,
  events,
  onContinue,
}: PostMatchScreenProps) {
  const result   = getResult(timeline);
  const cfg      = RESULT_CONFIG[result];
  const goals    = extractGoals(timeline);
  const { finalScore, isHome } = timeline;

  const playerGoals   = isHome ? finalScore.home : finalScore.away;
  const opponentGoals = isHome ? finalScore.away : finalScore.home;
  const homeTeam      = isHome ? playerTeamName : opponentTeamName;
  const awayTeam      = isHome ? opponentTeamName : playerTeamName;

  // Deterministic headline from goal diff
  const headlineIdx = (playerGoals + opponentGoals) % cfg.headlines.length;
  const headline    = cfg.headlines[headlineIdx];

  // League position
  const position = state.league.entries.findIndex(e => e.clubId === state.club.id) + 1;
  const total    = state.league.entries.length;

  // Squad morale
  const morale = avgSquadMorale(state.club.squad);

  // Why-this-result factors — top 3 contributing inputs the player can act on.
  // Pulls from the same modifier weights the simulation actually used.
  const factors = diagnoseMatch(state.club, isHome, 3);

  // NPC reactions — POST_MATCH + WEEKLY_SUMMARY, capped at 3
  const allNpcMessages = generateNpcMessages(state, events);
  const npcReactions = allNpcMessages
    .filter(m => m.category === 'POST_MATCH' || m.category === 'WEEKLY_SUMMARY')
    .slice(0, 3);

  return (
    <div className="fixed inset-0 bg-bg-deep flex flex-col z-50 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 pt-8 pb-4 text-center flex flex-col items-center gap-1.5">
        <p className="text-xs font-bold text-txt-muted uppercase tracking-widest">Full Time</p>

        {/* Score */}
        <div className="flex items-center gap-4 mt-1">
          <span className={`text-sm font-semibold truncate max-w-[110px] text-right ${isHome ? 'text-txt-primary' : 'text-txt-muted'}`}>
            {homeTeam}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-4xl font-black text-txt-primary tabular-nums">{finalScore.home}</span>
            <span className="text-xl text-txt-muted">–</span>
            <span className="text-4xl font-black text-txt-primary tabular-nums">{finalScore.away}</span>
          </div>
          <span className={`text-sm font-semibold truncate max-w-[110px] ${!isHome ? 'text-txt-primary' : 'text-txt-muted'}`}>
            {awayTeam}
          </span>
        </div>

        {/* Result badge */}
        <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border ${cfg.bg}`}>
          <span>{cfg.emoji}</span>
          <span className={`text-sm font-black tracking-widest ${cfg.colour}`}>{cfg.label}</span>
        </div>

        <p className="text-xs2 text-txt-muted mt-1 italic">{headline}</p>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-3 max-w-lg mx-auto w-full">

        {/* Goal timeline */}
        {goals.length > 0 && (
          <div className="bg-bg-raised rounded-card border border-white/5 p-3">
            <p className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-2">Goals</p>
            <div className="flex flex-col gap-1.5">
              {goals.map((g, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-xs2 font-mono text-txt-muted w-8 shrink-0 text-right">
                    {g.minute}'
                  </span>
                  <span className={`text-xs2 shrink-0 ${g.scoredByPlayer ? 'text-pitch-green' : 'text-alert-red'}`}>
                    ⚽
                  </span>
                  <span className="text-xs2 text-txt-primary flex-1">
                    {g.scoredByPlayer ? playerTeamName : opponentTeamName}
                  </span>
                  <span className="text-xs2 font-mono text-txt-muted tabular-nums">
                    {isHome
                      ? `${g.score.home}–${g.score.away}`
                      : `${g.score.away}–${g.score.home}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why-this-result panel — ties the score back to player-controllable inputs */}
        {factors.length > 0 && (
          <div className="bg-bg-raised rounded-card border border-white/5 p-3">
            <p className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-2">
              {result === 'W' ? 'Why we won' : result === 'L' ? 'Why we lost' : 'Why it ended level'}
            </p>
            <div className="flex flex-col gap-2">
              {factors.map((f: MatchFactor, i: number) => {
                const colour =
                  f.sign === 'positive' ? 'text-pitch-green' :
                  f.sign === 'negative' ? 'text-alert-red' :
                  'text-warn-amber';
                const glyph = f.sign === 'positive' ? '▲' : f.sign === 'negative' ? '▼' : '◆';
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`text-xs2 ${colour} shrink-0 leading-snug`} aria-hidden>
                      {glyph}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-txt-primary leading-snug">{f.label}</span>
                      <span className="text-xs2 text-txt-muted leading-relaxed">{f.detail}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Snapshot stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-bg-raised rounded-card border border-white/5 p-3 text-center">
            <p className={`text-xl font-black ${
              position <= 4 ? 'text-pitch-green' :
              position >= total - 3 ? 'text-alert-red' :
              'text-txt-primary'
            }`}>
              {position}<span className="text-sm font-normal text-txt-muted">/{total}</span>
            </p>
            <p className="text-[10px] text-txt-muted uppercase mt-0.5">League Pos</p>
          </div>
          <div className="bg-bg-raised rounded-card border border-white/5 p-3 text-center">
            <p className={`text-xl font-black ${
              morale >= 70 ? 'text-pitch-green' :
              morale >= 40 ? 'text-warn-amber' :
              'text-alert-red'
            }`}>
              {Math.round(morale)}
            </p>
            <p className="text-[10px] text-txt-muted uppercase mt-0.5">Squad Morale</p>
          </div>
          <div className="bg-bg-raised rounded-card border border-white/5 p-3 text-center">
            <p className="text-xl font-black text-txt-primary">
              {state.club.form.slice(-5).join('')}
            </p>
            <p className="text-[10px] text-txt-muted uppercase mt-0.5">Last 5</p>
          </div>
        </div>

        {/* NPC reactions */}
        {npcReactions.length > 0 && (
          <div className="bg-bg-raised rounded-card border border-white/5 p-3 flex flex-col gap-2.5">
            <p className="text-xs font-bold text-txt-muted uppercase tracking-wider">Reactions</p>
            {npcReactions.map(msg => {
              const colours = NPC_COLOURS[msg.sender];
              return (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${colours.avatar}`}>
                    {msg.sender[0]}
                  </div>
                  <div>
                    <p className={`text-xs2 font-semibold mb-0.5 ${colours.name}`}>
                      {NPC_FULL_NAMES[msg.sender]}
                    </p>
                    <p className="text-xs leading-relaxed text-txt-primary">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-4 border-t border-bg-raised">
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-card bg-data-blue text-white text-sm font-semibold
                     hover:bg-data-blue/80 active:scale-95 transition-all duration-150"
        >
          Back to Command Centre
        </button>
      </div>
    </div>
  );
}
