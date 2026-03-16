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

interface CoreUnitProps {
  def:       CoreUnitDef;
  /** Facility level 0–5 */
  level:     number;
  isHovered: boolean;
  onClick:   () => void;
  onHover:   (id: string | null) => void;
}

export function CoreUnit({ def, level, isHovered, onClick, onHover }: CoreUnitProps) {
  const bh   = def.blockHeights[Math.min(level, 5)];
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
      {level === 0 && (
        <path
          d={gnd}
          fill="none"
          stroke={isHovered ? '#448AFF' : '#546E7A'}
          strokeWidth="1.5"
          strokeDasharray="4 3"
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
        {def.icon}
      </text>

      {/* ── Level pip row (level > 0, small dots above icon) ─────── */}
      {level > 0 && bh > 0 && (
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
