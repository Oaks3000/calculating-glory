import { useEffect, useRef, useState } from 'react';
import {
  MatchTimeline,
  PhoneMessage,
  CrowdState,
  MatchScore,
  BeatType,
} from '@calculating-glory/domain';

// ── Types ─────────────────────────────────────────────────────────────────────

interface OwnerBoxProps {
  timeline: MatchTimeline;
  playerTeamName: string;
  opponentTeamName: string;
  onComplete: () => void;
}

interface VisibleMessage {
  id: string;
  sender: PhoneMessage['sender'];
  text: string;
  mood: PhoneMessage['mood'];
  beatType: BeatType;
}

// ── Crowd display config ───────────────────────────────────────────────────────

const CROWD_LABEL: Record<CrowdState, string> = {
  MURMUR:      'Crowd murmuring',
  BUILDING:    'Atmosphere building',
  TENSE:       'Tension in the stands',
  ROAR:        'The crowd erupts',
  GROAN:       'Collective groan',
  CELEBRATION: 'Celebrating',
  HOSTILE:     'Hostile reception',
  SILENT:      'Eerie silence',
};

const CROWD_COLOR: Record<CrowdState, string> = {
  MURMUR:      'text-txt-muted',
  BUILDING:    'text-warn-amber',
  TENSE:       'text-warn-amber',
  ROAR:        'text-data-blue',
  GROAN:       'text-alert-red',
  CELEBRATION: 'text-pitch-green',
  HOSTILE:     'text-alert-red',
  SILENT:      'text-txt-muted',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function uid() {
  return `msg-${Date.now()}-${Math.random()}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OwnerBox({ timeline, playerTeamName, opponentTeamName, onComplete }: OwnerBoxProps) {
  const [visibleMessages, setVisibleMessages] = useState<VisibleMessage[]>([]);
  const [currentMinute, setCurrentMinute]     = useState(0);
  const [currentCrowd, setCurrentCrowd]       = useState<CrowdState>('MURMUR');
  const [currentScore, setCurrentScore]       = useState<MatchScore>({ home: 0, away: 0 });
  const [completed, setCompleted]             = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const homeTeam = timeline.isHome ? playerTeamName : opponentTeamName;
  const awayTeam = timeline.isHome ? opponentTeamName : playerTeamName;

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages]);

  // Run the timeline — set up all timeouts on mount, clean up on unmount
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    timeline.beats.forEach(beat => {
      const beatDelay = beat.realTimeOffset * 1000;

      // Update scoreboard / minute / crowd at beat start
      timeouts.push(setTimeout(() => {
        setCurrentMinute(beat.matchMinute);
        setCurrentCrowd(beat.crowdState);
        if (beat.scoreboardUpdate) setCurrentScore(beat.scoreboardUpdate);
      }, beatDelay));

      // Reveal each message with stagger within the beat
      beat.content.forEach((msg, idx) => {
        timeouts.push(setTimeout(() => {
          setVisibleMessages(prev => [...prev, {
            id: uid(),
            sender: msg.sender,
            text: msg.text,
            mood: msg.mood,
            beatType: beat.type,
          }]);
        }, beatDelay + (idx + 1) * 800));
      });

      // After FULL_TIME messages reveal, show the continue button
      if (beat.type === 'FULL_TIME') {
        timeouts.push(setTimeout(() => {
          setCompleted(true);
        }, beatDelay + beat.content.length * 800 + 1200));
      }
    });

    return () => timeouts.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-bg-deep flex flex-col z-50 overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-bg-raised">
        <span className="text-xs font-semibold text-txt-muted uppercase tracking-widest">
          Owner's Box
        </span>
        <span className="text-xs font-mono text-txt-muted tabular-nums">
          {currentMinute}'
        </span>
      </div>

      {/* ── Scoreboard ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-center gap-6 py-5 bg-bg-surface border-b border-bg-raised">
        <span
          className={[
            'text-sm font-semibold truncate max-w-[120px] text-right',
            timeline.isHome ? 'text-txt-primary' : 'text-txt-muted',
          ].join(' ')}
        >
          {homeTeam}
        </span>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-4xl font-bold text-txt-primary tabular-nums w-8 text-center">
            {currentScore.home}
          </span>
          <span className="text-xl text-txt-muted">—</span>
          <span className="text-4xl font-bold text-txt-primary tabular-nums w-8 text-center">
            {currentScore.away}
          </span>
        </div>
        <span
          className={[
            'text-sm font-semibold truncate max-w-[120px]',
            !timeline.isHome ? 'text-txt-primary' : 'text-txt-muted',
          ].join(' ')}
        >
          {awayTeam}
        </span>
      </div>

      {/* ── Crowd state ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-center py-1.5 border-b border-bg-raised/40">
        <span className={`text-xs2 uppercase tracking-widest font-medium transition-colors duration-500 ${CROWD_COLOR[currentCrowd]}`}>
          {CROWD_LABEL[currentCrowd]}
        </span>
      </div>

      {/* ── Message thread ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {visibleMessages.map(msg => (
          <KevBubble key={msg.id} text={msg.text} beatType={msg.beatType} />
        ))}

        {/* Typing indicator — shown when not complete and at least one message visible */}
        {!completed && visibleMessages.length > 0 && (
          <TypingIndicator />
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Post-match result card (appears after FULL_TIME) ───────────────── */}
      {completed && (
        <div className="shrink-0 px-4 py-4 border-t border-bg-raised flex flex-col gap-3">
          <PostMatchResult
            finalScore={timeline.finalScore}
            isHome={timeline.isHome}
            playerTeamName={playerTeamName}
            opponentTeamName={opponentTeamName}
          />
          <button
            onClick={onComplete}
            className="w-full py-3 rounded-card bg-data-blue text-white text-sm font-semibold
                       hover:bg-data-blue/80 active:scale-95 transition-all duration-150"
          >
            Back to Command Centre
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KevBubble({ text, beatType }: { text: string; beatType: BeatType }) {
  const isGoal = beatType === 'GOAL';
  return (
    <div className="flex items-start gap-2.5 max-w-sm">
      <div
        className={[
          'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
          isGoal ? 'bg-pitch-green/20 text-pitch-green' : 'bg-data-blue/20 text-data-blue',
        ].join(' ')}
      >
        K
      </div>
      <div
        className={[
          'rounded-card px-3 py-2',
          isGoal ? 'bg-pitch-green/10 border border-pitch-green/20' : 'bg-bg-raised',
        ].join(' ')}
      >
        <p className="text-xs2 font-semibold text-data-blue mb-0.5">Kev Mulligan</p>
        <p className={`text-xs leading-relaxed ${isGoal ? 'text-pitch-green font-medium' : 'text-txt-primary'}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

// ── Post-match result card ────────────────────────────────────────────────────

const RESULT_CONFIG = {
  W: {
    badge: 'WIN',
    badgeClass: 'bg-pitch-green/20 text-pitch-green border border-pitch-green/40',
    headlines: [
      'Three points! Brilliant.',
      'Get in! What a result.',
      'The team delivered. Enjoy it.',
    ],
  },
  D: {
    badge: 'DRAW',
    badgeClass: 'bg-warn-amber/20 text-warn-amber border border-warn-amber/40',
    headlines: [
      'A point on the board.',
      'We\'ll take it. Heads up.',
      'Could have been worse. Move on.',
    ],
  },
  L: {
    badge: 'DEFEAT',
    badgeClass: 'bg-alert-red/20 text-alert-red border border-alert-red/40',
    headlines: [
      'Tough one. Back to the training ground.',
      'Not good enough today. We regroup.',
      'That hurts. Time to bounce back.',
    ],
  },
};

interface PostMatchResultProps {
  finalScore: MatchScore;
  isHome: boolean;
  playerTeamName: string;
  opponentTeamName: string;
}

function PostMatchResult({ finalScore, isHome, playerTeamName, opponentTeamName }: PostMatchResultProps) {
  const playerGoals   = isHome ? finalScore.home : finalScore.away;
  const opponentGoals = isHome ? finalScore.away : finalScore.home;
  const result: 'W' | 'D' | 'L' =
    playerGoals > opponentGoals ? 'W' : playerGoals < opponentGoals ? 'L' : 'D';
  const cfg = RESULT_CONFIG[result];

  // Pick a deterministic headline from the list based on goal diff
  const headlineIdx = Math.abs(playerGoals - opponentGoals) % cfg.headlines.length;
  const headline = cfg.headlines[headlineIdx];

  return (
    <div className="bg-bg-raised rounded-card border border-bg-raised/60 px-4 py-3 flex items-center gap-4">
      <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${cfg.badgeClass}`}>
        {cfg.badge}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-txt-primary truncate">{headline}</p>
        <p className="text-[10px] text-txt-muted mt-0.5">
          {playerTeamName} {playerGoals} – {opponentGoals} {opponentTeamName}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5 max-w-sm">
      <div className="shrink-0 w-7 h-7 rounded-full bg-data-blue/20 flex items-center justify-center text-xs font-bold text-data-blue">
        K
      </div>
      <div className="bg-bg-raised rounded-card px-3 py-3">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-txt-muted animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-txt-muted animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-txt-muted animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
