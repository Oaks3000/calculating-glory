/**
 * CoreUnit — renders one facility plot on the stadium grid.
 *
 * Visual model (plot-based — see FacilityPlotContents for per-facility detail):
 *   level 0  → ground diamond with grass fill (url(#pat-ground)) + faint dashed
 *              white outline — blends into the background, shows plot boundary
 *   level 1+ → solid ground base (def.colors.ground) + FacilityPlotContents
 *              sub-objects accumulate per level within the plot
 *
 * Interaction:
 *   - hover: blue outline + subtle white tint over the full plot
 *   - click: fires onClick (wired to facility detail in parent)
 */

import {
  footprintVertices,
  footprintPath,
  groundCenter,
} from './isometric-utils';
import { CoreUnitDef } from './stadium-layout';
import { FacilityPlotContents } from './FacilityPlotContents';

interface CoreUnitProps {
  def:       CoreUnitDef;
  /** Facility level 0–5 */
  level:     number;
  /** Weeks remaining on active construction; undefined or 0 = not building */
  constructionWeeksRemaining?: number;
  isHovered:     boolean;
  /** When true, renders a pulsing amber ring (intro tour highlight). */
  isHighlighted?: boolean;
  onClick:   () => void;
  onHover:   (id: string | null) => void;
}

export function CoreUnit({ def, level, constructionWeeksRemaining, isHovered, isHighlighted, onClick, onHover }: CoreUnitProps) {
  const isBuilding = (constructionWeeksRemaining ?? 0) > 0;
  const fv   = footprintVertices(def.gc, def.gr, def.cols, def.rows);
  const gnd  = footprintPath(fv);

  // Icon placement: always ground centre for plot-based rendering
  const iconPos = groundCenter(fv);

  // Hit region = ground diamond always (entire plot is clickable)
  const hitPath = gnd;

  return (
    <g
      role="button"
      aria-label={`${def.label} — Level ${level}`}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
      onMouseEnter={() => onHover(def.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* ── Ground base ─────────────────────────────────────────────
           Level 0: grass fill blending into background, faint outline.
           Level 1+: soil / plot fill as distinct base. */}
      <path
        d={gnd}
        fill={level === 0 ? 'url(#pat-ground)' : def.colors.ground}
        stroke={level === 0 ? 'rgba(255,255,255,0.18)' : '#0B1622'}
        strokeWidth={level === 0 ? '1' : '1'}
        strokeDasharray={level === 0 ? '5 3' : undefined}
      />

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

      {/* ── Plot contents (sub-objects per facility / level) ─────── */}
      {level > 0 && !isBuilding && (
        <FacilityPlotContents
          facilityType={def.facilityType}
          fv={fv}
          level={level}
        />
      )}

      {/* ── Plot border — only shown at level 1+ for definition ──── */}
      {level > 0 && (
        <path
          d={gnd}
          fill="none"
          stroke="#0B1622"
          strokeWidth="1"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* ── Hover tint ───────────────────────────────────────────── */}
      {isHovered && (
        <path
          d={hitPath}
          fill="rgba(255,255,255,0.08)"
          stroke="#448AFF"
          strokeWidth="1.5"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* ── Intro tour highlight — pulsing amber ring ────────────── */}
      {isHighlighted && (
        <path
          d={hitPath}
          fill="rgba(255,180,0,0.14)"
          stroke="#FFB400"
          strokeWidth="2.5"
          className="animate-pulse"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* ── Facility icon ────────────────────────────────────────────
           Level 0: centred in the plot so the player knows what's coming.
           Construction: always show the crane.
           Level 1+: small icon in the bottom corner so it doesn't fight
                     the sub-objects but still provides quick identification. */}
      {isBuilding ? (
        <text
          x={iconPos.x}
          y={iconPos.y + 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={22}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          🏗
        </text>
      ) : level === 0 ? (
        <text
          x={iconPos.x}
          y={iconPos.y + 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={def.cols >= 4 ? 20 : 16}
          opacity={0.55}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {def.icon}
        </text>
      ) : (
        <text
          x={fv.bottom.x - 6}
          y={fv.bottom.y - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={12}
          opacity={0.7}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {def.icon}
        </text>
      )}

      {/* ── Level pip row (level > 0) ─────────────────────────────── */}
      {level > 0 && !isBuilding && (
        <g
          transform={`translate(${iconPos.x - (level * 7) / 2}, ${iconPos.y - 10})`}
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
