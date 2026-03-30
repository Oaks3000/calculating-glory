/**
 * PostMatchScreen — shown after the Owner's Box completes.
 *
 * Win/draw/loss each get a distinct visual treatment so the result has weight.
 * Includes morale event if one fired this week, plus a brief NPC reaction.
 */

import { MatchScore } from '@calculating-glory/domain';

interface PostMatchScreenProps {
  finalScore: MatchScore;
  isHome: boolean;
  playerTeamName: string;
  opponentTeamName: string;
  moraleEvent: { headline: string; milestoneKey: string } | null;
  onDismiss: () => void;
}

type Outcome = 'WIN' | 'DRAW' | 'LOSS';

function getOutcome(score: MatchScore, isHome: boolean): Outcome {
  const myGoals  = isHome ? score.home : score.away;
  const oppGoals = isHome ? score.away : score.home;
  if (myGoals > oppGoals) return 'WIN';
  if (myGoals < oppGoals) return 'LOSS';
  return 'DRAW';
}

const OUTCOME_CONFIG: Record<Outcome, {
  label: string;
  labelColor: string;
  bgAccent: string;
  border: string;
  scoreColor: string;
  npcName: string;
  npcReaction: string;
  buttonBg: string;
}> = {
  WIN: {
    label: 'Victory',
    labelColor: 'text-pitch-green',
    bgAccent: 'bg-pitch-green/5',
    border: 'border-pitch-green/20',
    scoreColor: 'text-pitch-green',
    npcName: 'Val',
    npcReaction: "The numbers are moving. Keep this going and the board will notice.",
    buttonBg: 'bg-pitch-green hover:bg-pitch-green/80',
  },
  DRAW: {
    label: 'Draw',
    labelColor: 'text-warn-amber',
    bgAccent: 'bg-warn-amber/5',
    border: 'border-warn-amber/20',
    scoreColor: 'text-warn-amber',
    npcName: 'Marcus',
    npcReaction: "A point on the road is a point. We move on and reset for next week.",
    buttonBg: 'bg-warn-amber hover:bg-warn-amber/80 text-bg-deep',
  },
  LOSS: {
    label: 'Defeat',
    labelColor: 'text-alert-red',
    bgAccent: 'bg-alert-red/5',
    border: 'border-alert-red/20',
    scoreColor: 'text-alert-red',
    npcName: 'Val',
    npcReaction: "Tough one. We review, we reset. There are still points to play for.",
    buttonBg: 'bg-bg-raised hover:bg-bg-raised/80 border border-bg-raised/60',
  },
};

const MORALE_LABEL: Record<string, string> = {
  W3: '3 wins on the bounce',
  W5: '5-match winning streak',
  L3: '3 losses in a row',
  L5: '5-match losing run',
};

export function PostMatchScreen({
  finalScore,
  isHome,
  playerTeamName,
  opponentTeamName,
  moraleEvent,
  onDismiss,
}: PostMatchScreenProps) {
  const outcome = getOutcome(finalScore, isHome);
  const cfg = OUTCOME_CONFIG[outcome];

  const homeTeam  = isHome ? playerTeamName : opponentTeamName;
  const awayTeam  = isHome ? opponentTeamName : playerTeamName;

  return (
    <div className="fixed inset-0 bg-bg-deep flex flex-col z-50 overflow-hidden">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-bg-raised">
        <span className="text-xs font-semibold text-txt-muted uppercase tracking-widest">
          Full Time
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">

        {/* Outcome banner */}
        <div className={`w-full max-w-sm rounded-card px-6 py-5 text-center ${cfg.bgAccent} border ${cfg.border}`}>
          <p className={`text-xs2 uppercase tracking-widest font-semibold text-txt-muted mb-2`}>
            Result
          </p>
          <p className={`text-4xl font-black tracking-tight mb-4 ${cfg.labelColor}`}>
            {cfg.label}
          </p>

          {/* Score */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs font-semibold text-txt-muted max-w-[90px] text-right truncate">
              {homeTeam}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-3xl font-bold tabular-nums ${cfg.scoreColor}`}>
                {finalScore.home}
              </span>
              <span className="text-lg text-txt-muted">—</span>
              <span className={`text-3xl font-bold tabular-nums ${cfg.scoreColor}`}>
                {finalScore.away}
              </span>
            </div>
            <span className="text-xs font-semibold text-txt-muted max-w-[90px] text-left truncate">
              {awayTeam}
            </span>
          </div>
        </div>

        {/* Morale event (if fired this week) */}
        {moraleEvent && (
          <div className="w-full max-w-sm rounded-card px-4 py-3 bg-bg-raised border border-bg-raised/50">
            <p className="text-xs2 uppercase tracking-widest text-txt-muted font-semibold mb-1">
              Morale
            </p>
            <p className="text-xs text-txt-primary font-medium">
              {MORALE_LABEL[moraleEvent.milestoneKey] ?? moraleEvent.headline}
            </p>
          </div>
        )}

        {/* NPC reaction */}
        <div className="w-full max-w-sm flex items-start gap-3">
          <div className="shrink-0 w-7 h-7 rounded-full bg-warn-amber/20 flex items-center justify-center text-xs font-bold text-warn-amber">
            V
          </div>
          <div className="bg-bg-raised rounded-card px-3 py-2.5 flex-1">
            <p className="text-xs2 font-semibold text-warn-amber mb-0.5">{cfg.npcName}</p>
            <p className="text-xs leading-relaxed text-txt-primary">{cfg.npcReaction}</p>
          </div>
        </div>
      </div>

      {/* Dismiss */}
      <div className="shrink-0 px-4 py-6 border-t border-bg-raised">
        <button
          onClick={onDismiss}
          className={`w-full py-3 rounded-card text-white text-sm font-semibold
                     active:scale-95 transition-all duration-150 ${cfg.buttonBg}`}
        >
          Back to Command Centre
        </button>
      </div>
    </div>
  );
}
