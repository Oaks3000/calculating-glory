import { useEffect, useRef, useState } from 'react';
import {
  MatchTimeline,
  PhoneMessage,
  CrowdState,
  MatchScore,
  BeatType,
} from '@calculating-glory/domain';
import { MatchPitch, BlipState } from './MatchPitch';

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

// ── Crowd config ───────────────────────────────────────────────────────────────

const CROWD_STATUS: Record<CrowdState, string> = {
  MURMUR:      'Crowd murmuring…',
  BUILDING:    'Atmosphere building',
  TENSE:       'Tension in the stands',
  ROAR:        'The crowd erupts! 🔥',
  GROAN:       'Collective groan',
  CELEBRATION: 'They\'re celebrating! 🎉',
  HOSTILE:     'Hostile reception',
  SILENT:      'Eerie silence',
};

// Subtle background tint per crowd state — CSS colour string
const CROWD_TINT: Record<CrowdState, string> = {
  MURMUR:      'rgba(30,40,55,0)',
  BUILDING:    'rgba(251,191,36,0.04)',
  TENSE:       'rgba(251,191,36,0.06)',
  ROAR:        'rgba(59,130,246,0.08)',
  GROAN:       'rgba(239,68,68,0.06)',
  CELEBRATION: 'rgba(34,197,94,0.10)',
  HOSTILE:     'rgba(239,68,68,0.08)',
  SILENT:      'rgba(30,40,55,0)',
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
  const [blipState, setBlipState]             = useState<BlipState>('IDLE');
  const [playerGoalFlash, setPlayerGoalFlash] = useState(false);
  const [opponentGoalFlash, setOpponentGoalFlash] = useState(false);
  const [scoreBounce, setScoreBounce]         = useState<'home' | 'away' | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const homeTeam = timeline.isHome ? playerTeamName : opponentTeamName;
  const awayTeam = timeline.isHome ? opponentTeamName : playerTeamName;

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages]);

  // Run the timeline
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    timeline.beats.forEach(beat => {
      const beatDelay = beat.realTimeOffset * 1000;

      timeouts.push(setTimeout(() => {
        setCurrentMinute(beat.matchMinute);
        setCurrentCrowd(beat.crowdState);

        if (beat.scoreboardUpdate) {
          setCurrentScore(prev => {
            if (beat.scoreboardUpdate!.home > prev.home) setScoreBounce('home');
            else if (beat.scoreboardUpdate!.away > prev.away) setScoreBounce('away');
            return beat.scoreboardUpdate!;
          });
          timeouts.push(setTimeout(() => setScoreBounce(null), 600));
        }

        if (beat.type === 'GOAL') {
          const isPlayerGoal = beat.content.some(m => m.mood === 'elated');
          const homeScored = timeline.isHome ? isPlayerGoal : !isPlayerGoal;
          setBlipState(homeScored ? 'CELEBRATE_HOME' : 'CELEBRATE_AWAY');
          if (isPlayerGoal) setPlayerGoalFlash(true);
          else setOpponentGoalFlash(true);
          timeouts.push(setTimeout(() => {
            setBlipState('RESET');
            setPlayerGoalFlash(false);
            setOpponentGoalFlash(false);
          }, 3000));
          timeouts.push(setTimeout(() => setBlipState('IDLE'), 4000));
        } else if (beat.type === 'CHANCE') {
          setBlipState('BUILD_UP');
          timeouts.push(setTimeout(() => setBlipState('CHANCE'), 400));
          timeouts.push(setTimeout(() => setBlipState('IDLE'), 2500));
        } else if (beat.type === 'NEAR_MISS') {
          setBlipState('CHANCE');
          timeouts.push(setTimeout(() => setBlipState('IDLE'), 1800));
        } else if (beat.type === 'HALF_TIME' || beat.type === 'FULL_TIME') {
          setBlipState('IDLE');
        }
      }, beatDelay));

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
    <div
      className="fixed inset-0 z-50 overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: '#09090f' }}
    >
      {/* ── Background: blurred pitch ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none
                   scale-125 blur-sm opacity-[0.18] transition-opacity duration-700"
      >
        <MatchPitch
          blipState={blipState}
          crowdState={currentCrowd}
          isHome={timeline.isHome}
          matchMinute={currentMinute}
          playerGoalFlash={playerGoalFlash}
          opponentGoalFlash={opponentGoalFlash}
        />
      </div>

      {/* ── Crowd tint overlay ──────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: CROWD_TINT[currentCrowd] }}
      />

      {/* ── Ambient score ghost ─────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-[18%] flex justify-center pointer-events-none select-none">
        <span className="text-[96px] font-black tabular-nums text-white/[0.04] leading-none tracking-tight">
          {currentScore.home}–{currentScore.away}
        </span>
      </div>

      {/* ── Phone frame ─────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-center justify-center py-4 px-3">
        <div
          className="w-full max-w-[380px] h-full max-h-[720px]
                     flex flex-col overflow-hidden
                     rounded-[36px] border border-white/[0.12]
                     shadow-[0_32px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]"
          style={{ background: 'rgba(13,13,22,0.92)', backdropFilter: 'blur(24px)' }}
        >
          {/* ── Phone status bar ──────────────────────────────────────────── */}
          <div className="shrink-0 flex items-center justify-between px-6 pt-3.5 pb-1">
            <span className="text-[11px] font-semibold text-white/40 tabular-nums">9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Signal bars */}
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none" className="opacity-40">
                <rect x="0" y="8" width="3" height="4" rx="0.5" fill="white"/>
                <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="white"/>
                <rect x="9" y="2" width="3" height="10" rx="0.5" fill="white"/>
                <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="white" opacity="0.35"/>
              </svg>
              {/* Battery */}
              <svg width="22" height="12" viewBox="0 0 22 12" fill="none" className="opacity-40">
                <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="white"/>
                <rect x="19.5" y="3.5" width="2" height="5" rx="1" fill="white"/>
                <rect x="2" y="2" width="12" height="8" rx="1.5" fill="white"/>
              </svg>
            </div>
          </div>

          {/* ── Contact header ────────────────────────────────────────────── */}
          <div className="shrink-0 px-4 pb-3 flex items-center gap-3">
            {/* Avatar */}
            <div className="shrink-0 w-10 h-10 rounded-full
                            bg-data-blue/25 border border-data-blue/30
                            flex items-center justify-center
                            text-sm font-bold text-data-blue">
              K
            </div>

            {/* Name + status */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-txt-primary leading-tight">Kev Mulligan</p>
              <p className="text-[10px] text-txt-muted leading-tight truncate transition-all duration-500">
                {CROWD_STATUS[currentCrowd]}
              </p>
            </div>

            {/* Score chip */}
            <div
              className="shrink-0 flex items-center gap-1.5
                         bg-white/[0.06] border border-white/[0.08]
                         rounded-full px-3 py-1.5"
            >
              <span className={`text-xs font-bold text-txt-primary tabular-nums transition-transform ${scoreBounce === 'home' ? 'animate-score-bounce' : ''}`}>
                {currentScore.home}
              </span>
              <span className="text-[10px] text-txt-muted">–</span>
              <span className={`text-xs font-bold text-txt-primary tabular-nums transition-transform ${scoreBounce === 'away' ? 'animate-score-bounce' : ''}`}>
                {currentScore.away}
              </span>
              <span className="text-[10px] text-txt-muted/70 ml-0.5 tabular-nums">
                {currentMinute}'
              </span>
            </div>
          </div>

          {/* Separator */}
          <div className="shrink-0 mx-4 h-px bg-white/[0.06]" />

          {/* ── Team names strip ──────────────────────────────────────────── */}
          <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-2">
            <span className={`text-[11px] font-medium truncate max-w-[120px] text-right ${timeline.isHome ? 'text-txt-primary' : 'text-txt-muted/60'}`}>
              {homeTeam}
            </span>
            <span className="text-[10px] text-txt-muted/40 shrink-0">vs</span>
            <span className={`text-[11px] font-medium truncate max-w-[120px] ${!timeline.isHome ? 'text-txt-primary' : 'text-txt-muted/60'}`}>
              {awayTeam}
            </span>
          </div>

          {/* ── Message thread ────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
            {visibleMessages.map(msg => (
              <PhoneBubble
                key={msg.id}
                text={msg.text}
                beatType={msg.beatType}
                mood={msg.mood}
              />
            ))}

            {!completed && visibleMessages.length > 0 && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>

          {/* ── Full-time footer ──────────────────────────────────────────── */}
          {completed ? (
            <div className="shrink-0 px-4 pb-6 pt-3 flex flex-col gap-3">
              <div className="h-px bg-white/[0.06] mx-0 mb-1" />
              <PostMatchResult
                finalScore={timeline.finalScore}
                isHome={timeline.isHome}
                playerTeamName={playerTeamName}
                opponentTeamName={opponentTeamName}
              />
              <button
                onClick={onComplete}
                className="w-full py-3 rounded-[18px] bg-data-blue text-white text-sm font-semibold
                           hover:bg-data-blue/80 active:scale-95 transition-all duration-150"
              >
                Back to Command Centre
              </button>
              {/* Home indicator */}
              <div className="flex justify-center pt-1">
                <div className="w-24 h-1 rounded-full bg-white/20" />
              </div>
            </div>
          ) : (
            <div className="shrink-0 pb-3 flex justify-center">
              <div className="w-24 h-1 rounded-full bg-white/10" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Phone-style chat bubble ────────────────────────────────────────────────────

function PhoneBubble({ text, beatType, mood }: { text: string; beatType: BeatType; mood: PhoneMessage['mood'] }) {
  const animClass =
    beatType === 'GOAL' && mood === 'elated'       ? 'animate-msg-goal-bump origin-left'
    : beatType === 'GOAL' && mood === 'frustrated'  ? 'animate-msg-goal-bump-oppo origin-left'
    : beatType === 'CHANCE' || beatType === 'NEAR_MISS' || (beatType === 'GOAL' && mood === 'excited')
      ? 'animate-msg-bump origin-left'
    : 'animate-fade-in';

  // Bubble colour shifts slightly with mood
  const bubbleBg =
    mood === 'elated'      ? 'bg-pitch-green/20 border-pitch-green/20'
    : mood === 'frustrated'  ? 'bg-alert-red/15 border-alert-red/15'
    : mood === 'worried'     ? 'bg-warn-amber/15 border-warn-amber/15'
    : 'bg-white/[0.07] border-white/[0.06]';

  return (
    <div className={`flex items-end gap-2 max-w-[86%] ${animClass}`}>
      {/* Avatar */}
      <div className="shrink-0 w-6 h-6 rounded-full bg-data-blue/25 border border-data-blue/30
                      flex items-center justify-center text-[10px] font-bold text-data-blue mb-0.5">
        K
      </div>
      {/* Bubble */}
      <div className={`rounded-[18px] rounded-bl-[4px] px-3.5 py-2.5 border ${bubbleBg}`}>
        <p className="text-[13px] leading-relaxed text-txt-primary">
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
    badgeClass: 'bg-pitch-green/20 text-pitch-green border border-pitch-green/30',
    headlines: [
      'Three points! Brilliant.',
      'Get in! What a result.',
      'The team delivered. Enjoy it.',
    ],
  },
  D: {
    badge: 'DRAW',
    badgeClass: 'bg-warn-amber/20 text-warn-amber border border-warn-amber/30',
    headlines: [
      'A point on the board.',
      "We'll take it. Heads up.",
      "Could've been worse. Move on.",
    ],
  },
  L: {
    badge: 'DEFEAT',
    badgeClass: 'bg-alert-red/20 text-alert-red border border-alert-red/30',
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
  const headlineIdx = Math.abs(playerGoals - opponentGoals) % cfg.headlines.length;

  return (
    <div className="bg-white/[0.05] rounded-[18px] border border-white/[0.07] px-4 py-3 flex items-center gap-3">
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${cfg.badgeClass}`}>
        {cfg.badge}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-txt-primary truncate">{cfg.headlines[headlineIdx]}</p>
        <p className="text-[10px] text-txt-muted mt-0.5">
          {playerTeamName} {playerGoals} – {opponentGoals} {opponentTeamName}
        </p>
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 max-w-[86%] animate-fade-in">
      <div className="shrink-0 w-6 h-6 rounded-full bg-data-blue/25 border border-data-blue/30
                      flex items-center justify-center text-[10px] font-bold text-data-blue mb-0.5">
        K
      </div>
      <div className="bg-white/[0.07] border border-white/[0.06] rounded-[18px] rounded-bl-[4px] px-4 py-3">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-txt-muted animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-txt-muted animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-txt-muted animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
