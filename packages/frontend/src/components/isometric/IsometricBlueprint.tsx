/**
 * IsometricBlueprint — the isometric SVG stadium scene.
 *
 * Renders all 9 core units on a 20×14 isometric grid.  Each unit is a
 * coloured building whose height reflects the facility level (0 = empty
 * plot, 1–5 = increasingly tall block).
 *
 * Hover shows a React HTML tooltip (not SVG foreignObject, for styling
 * consistency with the rest of the UI).
 *
 * Click fires onCoreUnitClick(facilityType) — navigation wiring is
 * handled by the parent (StadiumView / App) in PR 4.
 */

import { useState, useCallback, useRef } from 'react';
import { GameState, GameCommand, FacilityType, FACILITY_CONFIG } from '@calculating-glory/domain';
import { SVG_W, SVG_H } from './isometric-utils';
import { STADIUM_LAYOUT_SORTED } from './stadium-layout';
import { CoreUnit } from './CoreUnit';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IsometricBlueprintProps {
  state:    GameState;
  dispatch: (cmd: GameCommand) => { error?: string };
  onError:  (msg: string) => void;
  /** Called when the player clicks a core unit. */
  onCoreUnitClick?: (facilityType: FacilityType) => void;
  /** Highlights the named unit with a pulsing amber ring (intro tour). */
  highlightedId?: string | null;
  /** When true, SVG fills its container (used as intro backdrop). */
  fillParent?: boolean;
}

interface TooltipState {
  id:     string;
  mouseX: number;
  mouseY: number;
}

const LEVEL_LABELS = ['Derelict', 'Basic', 'Decent', 'Good', 'Excellent', 'World-Class'] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IsometricBlueprint({
  state,
  dispatch: _dispatch,
  onError: _onError,
  onCoreUnitClick,
  highlightedId,
  fillParent,
}: IsometricBlueprintProps) {
  const { club } = state;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip,   setTooltip]   = useState<TooltipState | null>(null);

  // Ref so handleMouseMove can read the current hoveredId without stale closures.
  const hoveredIdRef = useRef<string | null>(null);

  // Fast lookups: facilityType → level / constructionWeeksRemaining
  const levelOf = Object.fromEntries(
    club.facilities.map(f => [f.type, f.level]),
  ) as Record<FacilityType, number>;
  const constructionOf = Object.fromEntries(
    club.facilities.map(f => [f.type, f.constructionWeeksRemaining ?? 0]),
  ) as Record<FacilityType, number>;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleHover = useCallback((id: string | null) => {
    hoveredIdRef.current = id;
    setHoveredId(id);
    if (!id) setTooltip(null);
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const id = hoveredIdRef.current;
    if (!id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      id,
      mouseX: e.clientX - rect.left,
      mouseY: e.clientY - rect.top,
    });
  }

  function handleMouseLeave() {
    setHoveredId(null);
    setTooltip(null);
  }

  // ── Tooltip ───────────────────────────────────────────────────────────────

  const tooltipContent = (() => {
    if (!tooltip || !hoveredId) return null;
    const def = STADIUM_LAYOUT_SORTED.find(d => d.id === hoveredId);
    if (!def) return null;
    const level = levelOf[def.facilityType] ?? 0;
    const meta  = FACILITY_CONFIG[def.facilityType];

    const tipX = Math.min(tooltip.mouseX + 14, SVG_W - 190);
    const tipY = Math.max(tooltip.mouseY - 64, 4);

    return (
      <div
        className="absolute z-10 pointer-events-none bg-bg-surface border border-bg-raised
                   rounded-card px-3 py-2 shadow-lg min-w-[160px]"
        style={{ left: tipX, top: tipY }}
      >
        <p className="text-sm font-semibold text-txt-primary flex items-center gap-1.5">
          <span>{def.icon}</span>
          <span>{def.label}</span>
        </p>
        <p className="text-xs text-txt-muted mt-0.5">
          Level {level} — {LEVEL_LABELS[level]}
        </p>
        <p className="text-xs2 text-txt-muted mt-0.5 italic">{meta.description}</p>
        {constructionOf[def.facilityType] > 0 && (
          <p className="text-xs2 text-warn-amber mt-1">
            🏗 Under construction — {constructionOf[def.facilityType]} wk{constructionOf[def.facilityType] === 1 ? '' : 's'} remaining
          </p>
        )}
        {level === 0 && constructionOf[def.facilityType] === 0 && (
          <p className="text-xs2 text-data-blue mt-1">Click to upgrade →</p>
        )}
      </div>
    );
  })();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="relative w-full overflow-x-auto select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        width={fillParent ? '100%' : SVG_W}
        height={fillParent ? '100%' : SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio={fillParent ? 'xMidYMid slice' : undefined}
        style={{ display: 'block', margin: fillParent ? undefined : '0 auto' }}
      >
        {/* ── Pattern library ─────────────────────────────────────────── */}
        <defs>
          {/* Grass stripes — alternating dark/light green, rotated to align
              with the isometric top face (arctan(TH/TW) ≈ 26.57°). */}
          <pattern
            id="pat-grass"
            patternUnits="userSpaceOnUse"
            width={32}
            height={16}
            patternTransform="rotate(-26.57)"
          >
            <rect x={0} y={0} width={32} height={8} fill="#2a5c14" />
            <rect x={0} y={8} width={32} height={8} fill="#1e4a0c" />
          </pattern>

          {/* Concrete stipple — scattered dots at low opacity.
              Applied as an overlay on SW faces of support buildings. */}
          <pattern
            id="pat-concrete"
            patternUnits="userSpaceOnUse"
            width={6}
            height={6}
          >
            <circle cx={1} cy={1} r={0.7} fill="rgba(0,0,0,0.12)" />
            <circle cx={4} cy={4} r={0.7} fill="rgba(0,0,0,0.08)" />
          </pattern>

          {/* Grassland ground surround — 48×32 tile of organic ellipses in
              lighter and darker greens. Large tile reduces visible repetition.
              Ellipse positions deliberately irregular to avoid grid artifacts. */}
          <pattern
            id="pat-ground"
            patternUnits="userSpaceOnUse"
            width={48}
            height={32}
          >
            <rect width={48} height={32} fill="#1d3a0d" />
            {/* lighter patches */}
            <ellipse cx={7}  cy={5}  rx={5}   ry={3}   fill="#264d10" opacity={0.65} />
            <ellipse cx={31} cy={3}  rx={4}   ry={2.5} fill="#2c5514" opacity={0.55} />
            <ellipse cx={20} cy={15} rx={7}   ry={3.5} fill="#234811" opacity={0.60} />
            <ellipse cx={43} cy={19} rx={4}   ry={2.5} fill="#285010" opacity={0.60} />
            <ellipse cx={11} cy={26} rx={5}   ry={2.5} fill="#274e0f" opacity={0.65} />
            <ellipse cx={37} cy={28} rx={3}   ry={2}   fill="#2a5212" opacity={0.55} />
            {/* darker patches */}
            <ellipse cx={17} cy={9}  rx={3}   ry={2}   fill="#122508" opacity={0.55} />
            <ellipse cx={40} cy={11} rx={2.5} ry={1.8} fill="#0f2006" opacity={0.50} />
            <ellipse cx={25} cy={24} rx={3.5} ry={2}   fill="#132608" opacity={0.55} />
            <ellipse cx={4}  cy={18} rx={2.5} ry={1.8} fill="#102208" opacity={0.50} />
            <ellipse cx={46} cy={6}  rx={2}   ry={1.5} fill="#112408" opacity={0.45} />
          </pattern>
        </defs>

        {/* Background — textured grassland surround */}
        <rect width={SVG_W} height={SVG_H} fill="url(#pat-ground)" />

        {/* Core units — back-to-front (painter's algorithm via STADIUM_LAYOUT_SORTED) */}
        {STADIUM_LAYOUT_SORTED.map(def => (
          <CoreUnit
            key={def.id}
            def={def}
            level={levelOf[def.facilityType] ?? 0}
            constructionWeeksRemaining={constructionOf[def.facilityType]}
            isHovered={hoveredId === def.id}
            isHighlighted={!!highlightedId && highlightedId === def.id}
            onClick={() => onCoreUnitClick?.(def.facilityType)}
            onHover={handleHover}
          />
        ))}
      </svg>

      {tooltipContent}
    </div>
  );
}
