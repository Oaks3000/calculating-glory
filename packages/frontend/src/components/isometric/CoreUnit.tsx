/**
 * CoreUnit — renders one isometric building on the stadium grid.
 *
 * Visual behaviour:
 *   level 0  → flat ground diamond with "empty plot" marker (icon + dashed border)
 *   level 1+ → isometric block whose height scales with level, icon on top face
 *
 * Interaction:
 *   - hover: block highlights with a blue outline + internal white tint
 *   - click: fires onCoreUnitClick (wired to navigation in PR 4)
 *
 * Sub-unit art is intentionally deferred to a later PR; the level-scaled block
 * height already gives clear visual progression feedback.
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

  // Hover overlay opacity (hex suffix)
  const hoverAlpha = isHovered ? '28' : '00';

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
        fill={level === 0 ? def.colors.ground : def.colors.ground}
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
          <path d={bp.left}  fill={def.colors.left}  stroke="#0B1622" strokeWidth="0.5" />
          <path d={bp.right} fill={def.colors.right} stroke="#0B1622" strokeWidth="0.5" />
          <path d={bp.top}   fill={def.colors.top}   stroke="#0B1622" strokeWidth="0.5" />
        </>
      )}

      {/* ── Hover tint (sits above block faces, below icon) ──────── */}
      {isHovered && (
        <path
          d={hitPath}
          fill={`#FFFFFF${hoverAlpha}`}
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
