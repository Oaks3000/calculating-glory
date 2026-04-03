/**
 * CoreUnit — renders one isometric building on the stadium grid.
 *
 * Visual behaviour:
 *   level 0  → flat ground diamond with "empty plot" marker (icon + dashed border)
 *   level 1+ → isometric block whose height scales with level, icon on top face
 *
 * Shading model (Gemini visual spec — PR 6):
 *   Top face:  base colour (100% light)   + optional topPattern overlay
 *   SW face:   base colour + rgba(0,0,0,0.30) overlay + optional swPattern overlay
 *   SE face:   base colour + rgba(0,0,0,0.55) overlay
 *   Highlight: 1px rgba(255,255,255,0.20) on top front edge (T→R)
 *              1px rgba(255,255,255,0.10) on top back edge  (T→L)
 *
 * Interaction:
 *   - hover: block highlights with a blue outline + internal white tint
 *   - click: fires onCoreUnitClick (wired to navigation in PR 4)
 */

import {
  footprintVertices,
  footprintPath,
  blockPaths,
  topFaceCenter,
  groundCenter,
} from './isometric-utils';
import { CoreUnitDef } from './stadium-layout';
import { constructionDuration } from '@calculating-glory/domain';

interface CoreUnitProps {
  def:       CoreUnitDef;
  /** Facility level 0–5 */
  level:     number;
  /** Weeks remaining on active construction; undefined or 0 = not building */
  constructionWeeksRemaining?: number;
  isHovered: boolean;
  /** When true, the building pulses with a highlight glow (used during intro tour). */
  isHighlighted?: boolean;
  onClick:   () => void;
  onHover:   (id: string | null) => void;
}

export function CoreUnit({ def, level, constructionWeeksRemaining, isHovered, isHighlighted, onClick, onHover }: CoreUnitProps) {
  const isBuilding = (constructionWeeksRemaining ?? 0) > 0;

  // During construction interpolate block height between current and target level.
  // Starts at old-level height, grows toward new-level height as weeks tick down.
  const bhCurrent = def.blockHeights[Math.min(level, 5)];
  const bhTarget  = def.blockHeights[Math.min(level + 1, 5)];
  const bh = isBuilding
    ? Math.round(
        bhCurrent +
        (bhTarget - bhCurrent) *
          (1 - (constructionWeeksRemaining! / constructionDuration(level + 1)))
      )
    : bhCurrent;

  const fv   = footprintVertices(def.gc, def.gr, def.cols, def.rows);
  const gnd  = footprintPath(fv);

  // Block paths (only meaningful when bh > 0)
  const bp = bh > 0 ? blockPaths(fv, bh) : null;

  // Icon placement
  const iconPos = bh > 0
    ? topFaceCenter(fv, bh)
    : groundCenter(fv);

  // Top-face raised vertex coords — used for highlight lines
  const txTop   = fv.top.x,   tyTop   = fv.top.y - bh;
  const txRight = fv.right.x, tyRight = fv.right.y - bh;
  const txLeft  = fv.left.x,  tyLeft  = fv.left.y - bh;

  // Hit region for click / hover — full block silhouette if built, ground diamond otherwise
  const hitPath = bp ? bp.hitRegion : gnd;

  return (
    <g
      role="button"
      aria-label={`${def.label} — Level ${level}`}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={() => onHover(def.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* ── Ground base (always drawn) ───────────────────────────── */}
      <path
        d={gnd}
        fill={def.colors.ground}
        stroke="#0B1622"
        strokeWidth="1"
      />

      {/* ── Dashed "empty plot" border at level 0 ────────────────── */}
      {level === 0 && !isBuilding && (
        <path
          d={gnd}
          fill="none"
          stroke={isHovered ? '#448AFF' : '#546E7A'}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* ── Construction outline (amber dashes while building) ────── */}
      {isBuilding && (
        <path
          d={hitPath}
          fill="rgba(255,180,0,0.08)"
          stroke="#FFB400"
          strokeWidth="2"
          strokeDasharray="5 3"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* ── Building block (level > 0) ───────────────────────────── */}
      {bp && (
        <>
          {/* SW face — base colour + 30% dark overlay */}
          <path d={bp.left} fill={def.colors.base} />
          <path d={bp.left} fill="rgba(0,0,0,0.30)" style={{ pointerEvents: 'none' }} />
          {def.colors.swPattern && (
            <path d={bp.left} fill={def.colors.swPattern} style={{ pointerEvents: 'none' }} />
          )}

          {/* SE face — base colour + 55% dark overlay */}
          <path d={bp.right} fill={def.colors.base} />
          <path d={bp.right} fill="rgba(0,0,0,0.55)" style={{ pointerEvents: 'none' }} />

          {/* Top face — base colour (+ optional pattern) */}
          <path d={bp.top} fill={def.colors.base} />
          {def.colors.topPattern && (
            <path d={bp.top} fill={def.colors.topPattern} style={{ pointerEvents: 'none' }} />
          )}

          {/* 1px highlight on top front edge (north → east) — 20% white */}
          <line
            x1={txTop}   y1={tyTop}
            x2={txRight} y2={tyRight}
            stroke="rgba(255,255,255,0.20)"
            strokeWidth={1}
            style={{ pointerEvents: 'none' }}
          />
          {/* Subtler highlight on top back edge (north → west) — 10% white */}
          <line
            x1={txTop}  y1={tyTop}
            x2={txLeft} y2={tyLeft}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1}
            style={{ pointerEvents: 'none' }}
          />
        </>
      )}

      {/* ── Intro tour highlight pulse ─────────────────────────── */}
      {isHighlighted && (
        <path
          d={hitPath}
          fill="rgba(68,138,255,0.15)"
          stroke="#448AFF"
          strokeWidth="2"
          style={{ pointerEvents: 'none', animation: 'intro-highlight 1.5s ease-in-out infinite' }}
        />
      )}

      {/* ── Hover tint (sits above block faces, below icon) ──────── */}
      {isHovered && (
        <path
          d={hitPath}
          fill="rgba(255,255,255,0.10)"
          stroke="#448AFF"
          strokeWidth="1.5"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* ── Icon ─────────────────────────────────────────────────── */}
      <text
        x={iconPos.x}
        y={iconPos.y + (bh > 0 ? 8 : 6)}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={def.cols >= 4 ? 22 : 16}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {isBuilding ? '🏗' : def.icon}
      </text>

      {/* ── Construction progress bar (replaces pips while building) */}
      {isBuilding && bh > 0 && (() => {
        const totalWeeks = constructionDuration(level + 1);
        const weeksLeft  = constructionWeeksRemaining!;
        const progress   = 1 - weeksLeft / totalWeeks; // 0 → 1
        const barW = 28;
        const barH = 4;
        const bx   = iconPos.x - barW / 2;
        const by   = iconPos.y - bh * 0.45 - 8;
        return (
          <g transform={`translate(${bx}, ${by})`} style={{ pointerEvents: 'none' }}>
            <rect x={0} y={0} width={barW} height={barH} rx={2} fill="rgba(0,0,0,0.40)" />
            <rect x={0} y={0} width={barW * progress} height={barH} rx={2} fill="#FFB400" />
          </g>
        );
      })()}

      {/* ── Level pip row (level > 0, small dots above icon) ─────── */}
      {level > 0 && bh > 0 && !isBuilding && (
        <g
          transform={`translate(${iconPos.x - (level * 7) / 2}, ${iconPos.y - (bh > 0 ? bh * 0.45 : 0) - 6})`}
          style={{ pointerEvents: 'none' }}
        >
          {Array.from({ length: level }).map((_, i) => (
            <circle
              key={i}
              cx={i * 7 + 3}
              cy={0}
              r={2.5}
              fill={def.colors.label}
              opacity={0.8}
            />
          ))}
        </g>
      )}

      {/* ── Transparent full hit region (ensures click area = full block) */}
      <path
        d={hitPath}
        fill="transparent"
        stroke="none"
      />
    </g>
  );
}
