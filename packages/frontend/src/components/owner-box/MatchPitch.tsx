/**
 * MatchPitch — top-down SVG football pitch with 22 animated blips.
 *
 * Driven by the beat timeline from OwnerBox. Blips jitter in formation
 * zones and react to match events (CHANCE → surge, GOAL → celebrate,
 * NEAR_MISS → scramble). All animation via CSS keyframes / transforms
 * for Chromebook performance.
 *
 * @see https://github.com/Oaks3000/calculating-glory/issues/65
 */

import { useEffect, useRef, useState } from 'react';
import { BeatType, CrowdState } from '@calculating-glory/domain';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BlipState = 'IDLE' | 'BUILD_UP' | 'CHANCE' | 'CELEBRATE_HOME' | 'CELEBRATE_AWAY' | 'RESET';

interface MatchPitchProps {
  blipState: BlipState;
  crowdState: CrowdState;
  isHome: boolean;
  matchMinute: number;
  /** true when the player's team just scored */
  playerGoalFlash: boolean;
  /** true when the opponent just scored */
  opponentGoalFlash: boolean;
}

// ── Formation positions (4-4-2, normalised 0–1) ──────────────────────────────
// x = across pitch (0 = left touchline, 1 = right touchline)
// y = along pitch (0 = home goal line, 1 = away goal line)

interface BlipPos { x: number; y: number; role: 'GK' | 'DEF' | 'MID' | 'FWD' }

const HOME_442: BlipPos[] = [
  { x: 0.50, y: 0.06, role: 'GK'  },
  { x: 0.15, y: 0.22, role: 'DEF' },
  { x: 0.38, y: 0.20, role: 'DEF' },
  { x: 0.62, y: 0.20, role: 'DEF' },
  { x: 0.85, y: 0.22, role: 'DEF' },
  { x: 0.12, y: 0.40, role: 'MID' },
  { x: 0.37, y: 0.38, role: 'MID' },
  { x: 0.63, y: 0.38, role: 'MID' },
  { x: 0.88, y: 0.40, role: 'MID' },
  { x: 0.35, y: 0.56, role: 'FWD' },
  { x: 0.65, y: 0.56, role: 'FWD' },
];

const AWAY_442: BlipPos[] = [
  { x: 0.50, y: 0.94, role: 'GK'  },
  { x: 0.85, y: 0.78, role: 'DEF' },
  { x: 0.62, y: 0.80, role: 'DEF' },
  { x: 0.38, y: 0.80, role: 'DEF' },
  { x: 0.15, y: 0.78, role: 'DEF' },
  { x: 0.88, y: 0.60, role: 'MID' },
  { x: 0.63, y: 0.62, role: 'MID' },
  { x: 0.37, y: 0.62, role: 'MID' },
  { x: 0.12, y: 0.60, role: 'MID' },
  { x: 0.65, y: 0.44, role: 'FWD' },
  { x: 0.35, y: 0.44, role: 'FWD' },
];

// ── Blip shift offsets by state ───────────────────────────────────────────────

function getBlipOffset(
  state: BlipState,
  role: BlipPos['role'],
  isHomeBlip: boolean,
): { dx: number; dy: number } {
  const attackDir = isHomeBlip ? 1 : -1; // home attacks toward y=1, away toward y=0

  switch (state) {
    case 'BUILD_UP':
      if (role === 'GK') return { dx: 0, dy: 0 };
      if (role === 'DEF') return { dx: 0, dy: attackDir * 0.03 };
      if (role === 'MID') return { dx: 0, dy: attackDir * 0.06 };
      return { dx: 0, dy: attackDir * 0.08 };

    case 'CHANCE':
      if (role === 'GK') return { dx: 0, dy: attackDir * 0.02 };
      if (role === 'DEF') return { dx: 0, dy: attackDir * 0.06 };
      if (role === 'MID') return { dx: 0, dy: attackDir * 0.10 };
      return { dx: 0, dy: attackDir * 0.14 };

    case 'CELEBRATE_HOME':
      // Home team converges to center, away team retreats
      if (isHomeBlip) return { dx: (0.5 - 0.5) * 0, dy: 0.50 - (isHomeBlip ? 0.3 : 0.7) };
      return { dx: 0, dy: -attackDir * 0.04 };

    case 'CELEBRATE_AWAY':
      if (!isHomeBlip) return { dx: 0, dy: 0.50 - (isHomeBlip ? 0.3 : 0.7) };
      return { dx: 0, dy: -attackDir * 0.04 };

    case 'RESET':
    case 'IDLE':
    default:
      return { dx: 0, dy: 0 };
  }
}

// ── Pitch dimensions ──────────────────────────────────────────────────────────

const W = 280;
const H = 180;
const PAD = 8;
const PITCH_X = PAD;
const PITCH_Y = PAD;
const PITCH_W = W - PAD * 2;
const PITCH_H = H - PAD * 2;

// ── Component ─────────────────────────────────────────────────────────────────

export function MatchPitch({
  blipState,
  crowdState,
  isHome,
  matchMinute,
  playerGoalFlash,
  opponentGoalFlash,
}: MatchPitchProps) {
  const [flash, setFlash] = useState<'home' | 'away' | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger goal flash
  useEffect(() => {
    if (playerGoalFlash || opponentGoalFlash) {
      const side = playerGoalFlash
        ? (isHome ? 'away' : 'home')   // goal scored at opponent's end
        : (isHome ? 'home' : 'away');
      setFlash(side);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(null), 2000);
    }
    return () => { if (flashTimer.current) clearTimeout(flashTimer.current); };
  }, [playerGoalFlash, opponentGoalFlash, isHome]);

  const homeBlipColor = isHome ? '#448AFF' : '#EF5350';
  const awayBlipColor = isHome ? '#EF5350' : '#448AFF';

  // Celebration state: which team's blips converge
  const celebrateState = blipState === 'CELEBRATE_HOME' || blipState === 'CELEBRATE_AWAY'
    ? blipState : null;

  return (
    <div className="relative w-full flex justify-center">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[320px]"
        style={{ aspectRatio: `${W}/${H}` }}
        role="img"
        aria-label={`Match pitch — minute ${matchMinute}`}
      >
        {/* ── Pitch background ─────────────────────────────────── */}
        <rect
          x={PITCH_X} y={PITCH_Y}
          width={PITCH_W} height={PITCH_H}
          rx="3"
          fill="#2D5A1B"
          stroke="#3A7A28"
          strokeWidth="1.5"
        />

        {/* Grass stripes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x={PITCH_X}
            y={PITCH_Y + i * (PITCH_H / 8)}
            width={PITCH_W}
            height={PITCH_H / 8}
            fill={i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
          />
        ))}

        {/* ── Pitch markings ───────────────────────────────────── */}
        {/* Centre line */}
        <line
          x1={PITCH_X} y1={PITCH_Y + PITCH_H / 2}
          x2={PITCH_X + PITCH_W} y2={PITCH_Y + PITCH_H / 2}
          stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"
        />
        {/* Centre circle */}
        <circle
          cx={PITCH_X + PITCH_W / 2} cy={PITCH_Y + PITCH_H / 2}
          r={PITCH_H * 0.12}
          fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"
        />
        {/* Centre spot */}
        <circle
          cx={PITCH_X + PITCH_W / 2} cy={PITCH_Y + PITCH_H / 2}
          r="1.5" fill="rgba(255,255,255,0.4)"
        />
        {/* Home penalty area */}
        <rect
          x={PITCH_X + PITCH_W * 0.25} y={PITCH_Y}
          width={PITCH_W * 0.5} height={PITCH_H * 0.14}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"
        />
        {/* Away penalty area */}
        <rect
          x={PITCH_X + PITCH_W * 0.25} y={PITCH_Y + PITCH_H * 0.86}
          width={PITCH_W * 0.5} height={PITCH_H * 0.14}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8"
        />
        {/* Home goal area */}
        <rect
          x={PITCH_X + PITCH_W * 0.35} y={PITCH_Y}
          width={PITCH_W * 0.3} height={PITCH_H * 0.06}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6"
        />
        {/* Away goal area */}
        <rect
          x={PITCH_X + PITCH_W * 0.35} y={PITCH_Y + PITCH_H * 0.94}
          width={PITCH_W * 0.3} height={PITCH_H * 0.06}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6"
        />

        {/* ── Goal flash pulse ─────────────────────────────────── */}
        {flash && (
          <circle
            cx={PITCH_X + PITCH_W / 2}
            cy={flash === 'home' ? PITCH_Y + 4 : PITCH_Y + PITCH_H - 4}
            r="0"
            fill="none"
            stroke={flash === (isHome ? 'away' : 'home') ? '#448AFF' : '#EF5350'}
            strokeWidth="3"
            opacity="0.6"
            className="animate-goal-pulse"
          />
        )}

        {/* ── Home blips ───────────────────────────────────────── */}
        {HOME_442.map((pos, i) => {
          const offset = getBlipOffset(blipState, pos.role, true);
          const celebrating = celebrateState === 'CELEBRATE_HOME';
          const cx = PITCH_X + (pos.x + offset.dx) * PITCH_W;
          const cy = PITCH_Y + (pos.y + offset.dy) * PITCH_H;
          const targetCx = celebrating ? PITCH_X + PITCH_W / 2 : cx;
          const targetCy = celebrating ? PITCH_Y + PITCH_H * 0.45 : cy;
          const blipCx = celebrating ? targetCx + (cx - targetCx) * 0.3 : cx;
          const blipCy = celebrating ? targetCy + (cy - targetCy) * 0.3 : cy;

          return (
            <circle
              key={`h-${i}`}
              cx={blipCx}
              cy={blipCy}
              r={celebrating ? 3.5 : 2.5}
              fill={homeBlipColor}
              opacity={0.9}
              className={getBlipAnimClass(blipState, 'home', i)}
              style={{
                transition: 'cx 0.8s ease, cy 0.8s ease, r 0.3s ease',
                animationDelay: `${i * 47}ms`,
              }}
            />
          );
        })}

        {/* ── Away blips ───────────────────────────────────────── */}
        {AWAY_442.map((pos, i) => {
          const offset = getBlipOffset(blipState, pos.role, false);
          const celebrating = celebrateState === 'CELEBRATE_AWAY';
          const cx = PITCH_X + (pos.x + offset.dx) * PITCH_W;
          const cy = PITCH_Y + (pos.y + offset.dy) * PITCH_H;
          const targetCx = celebrating ? PITCH_X + PITCH_W / 2 : cx;
          const targetCy = celebrating ? PITCH_Y + PITCH_H * 0.55 : cy;
          const blipCx = celebrating ? targetCx + (cx - targetCx) * 0.3 : cx;
          const blipCy = celebrating ? targetCy + (cy - targetCy) * 0.3 : cy;

          return (
            <circle
              key={`a-${i}`}
              cx={blipCx}
              cy={blipCy}
              r={celebrating ? 3.5 : 2.5}
              fill={awayBlipColor}
              opacity={0.9}
              className={getBlipAnimClass(blipState, 'away', i)}
              style={{
                transition: 'cx 0.8s ease, cy 0.8s ease, r 0.3s ease',
                animationDelay: `${i * 53}ms`,
              }}
            />
          );
        })}

        {/* ── Crowd atmosphere glow (edges of pitch) ───────────── */}
        {(crowdState === 'ROAR' || crowdState === 'CELEBRATION') && (
          <rect
            x={PITCH_X} y={PITCH_Y}
            width={PITCH_W} height={PITCH_H}
            rx="3"
            fill="none"
            stroke={crowdState === 'CELEBRATION' ? '#448AFF' : '#FDD835'}
            strokeWidth="2.5"
            opacity="0.4"
            className="animate-crowd-glow"
          />
        )}
        {crowdState === 'HOSTILE' && (
          <rect
            x={PITCH_X} y={PITCH_Y}
            width={PITCH_W} height={PITCH_H}
            rx="3"
            fill="none"
            stroke="#EF5350"
            strokeWidth="2"
            opacity="0.3"
            className="animate-crowd-glow"
          />
        )}
      </svg>
    </div>
  );
}

// ── Blip animation class helper ───────────────────────────────────────────────

function getBlipAnimClass(state: BlipState, team: 'home' | 'away', _index: number): string {
  const isIdle = state === 'IDLE' || state === 'RESET';
  const isCelebrating =
    (state === 'CELEBRATE_HOME' && team === 'home') ||
    (state === 'CELEBRATE_AWAY' && team === 'away');

  if (isCelebrating) return 'animate-blip-celebrate';
  if (state === 'CHANCE') return 'animate-blip-tense';
  if (state === 'BUILD_UP') return 'animate-blip-drift';
  if (isIdle) return 'animate-blip-jitter';
  return 'animate-blip-jitter';
}
