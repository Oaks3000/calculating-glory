/**
 * FacilityPlotContents — renders the objects inside each facility plot.
 *
 * Each facility has a unique progression of sub-objects that accumulate
 * across levels 1–5.  Level 0 is handled by CoreUnit (grass + faint outline).
 *
 * All geometry is built with subObjectFootprint() + blockPaths() so objects
 * sit correctly in isometric space and are painted back-to-front via the
 * order they appear in each facility's JSX.
 *
 * Coordinate convention:
 *   u = left→right across plot (NW→NE edge)
 *   v = back→front (NW→SW edge)
 *   Heights are screen pixels, same unit as blockPaths bh param.
 *
 * PAINTER'S ORDER RULE: within each facility, elements MUST be listed in
 * ascending v order (back → front).  This is independent of the level at
 * which each object first appears — a L3 object that sits at v=0.10 must
 * render before a L2 object at v=0.70, even though the L2 object unlocks
 * earlier.  Violating this rule causes the "floating" Z-fighting artefact.
 */

import { FacilityType } from '@calculating-glory/domain';
import { FootprintVertices, subObjectFootprint, blockPaths, footprintPath, shadeColor, facePatch } from './isometric-utils';

interface Props {
  facilityType: FacilityType;
  fv: FootprintVertices;
  level: number;  // 1–5
}

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

/** Render a solid isometric box within the plot using normalised u/v coords. */
function Box({
  fv, u1, v1, u2, v2, h, base, shade = true,
}: {
  fv: FootprintVertices;
  u1: number; v1: number; u2: number; v2: number;
  h: number;
  base: string;
  shade?: boolean;
}) {
  const sfv = subObjectFootprint(fv, u1, v1, u2, v2);
  if (h === 0) {
    return <path d={footprintPath(sfv)} fill={base} style={{ pointerEvents: 'none' }} />;
  }
  const bp = blockPaths(sfv, h);
  const lc = shade ? shadeColor(base, -15) : base;
  const rc = shade ? shadeColor(base, -30) : base;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <path d={bp.left}  fill={lc} />
      <path d={bp.right} fill={rc} />
      <path d={bp.top}   fill={base} />
    </g>
  );
}

/**
 * Single rectangular detail patch on one vertical face of a Box.
 * Pass the same u1/v1/u2/v2/h as the parent Box so the sfv is recomputed
 * consistently.  s/t coords: s=left→right across face, t=0 top → 1 ground.
 */
function FaceDetail({
  fv, u1, v1, u2, v2, h, side, s1, t1, s2, t2, fill,
}: {
  fv: FootprintVertices; u1: number; v1: number; u2: number; v2: number;
  h: number; side: 'left' | 'right';
  s1: number; t1: number; s2: number; t2: number; fill: string;
}) {
  const sfv = subObjectFootprint(fv, u1, v1, u2, v2);
  return <path d={facePatch(sfv, h, side, s1, t1, s2, t2)} fill={fill} style={{ pointerEvents: 'none' }} />;
}

/**
 * Uniform grid of windows on one vertical face of a Box.
 * margin controls the inset from all four edges of the face; gap is the
 * fraction of a cell left as wall between windows.
 */
function FaceWindows({
  fv, u1, v1, u2, v2, h, side, cols, rows, fill, margin = 0.10, gap = 0.20,
}: {
  fv: FootprintVertices; u1: number; v1: number; u2: number; v2: number;
  h: number; side: 'left' | 'right'; cols: number; rows: number;
  fill: string; margin?: number; gap?: number;
}) {
  const sfv = subObjectFootprint(fv, u1, v1, u2, v2);
  const cw = (1 - 2 * margin) / cols;
  const rh = (1 - 2 * margin) / rows;
  return (
    <g style={{ pointerEvents: 'none' }}>
      {Array.from({ length: rows }).flatMap((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const s1 = margin + c * cw + cw * gap * 0.5;
          const s2 = margin + (c + 1) * cw - cw * gap * 0.5;
          const t1 = margin + r * rh + rh * gap * 0.5;
          const t2 = margin + (r + 1) * rh - rh * gap * 0.5;
          return (
            <path
              key={`${r}-${c}`}
              d={facePatch(sfv, h, side, s1, t1, s2, t2)}
              fill={fill}
            />
          );
        })
      )}
    </g>
  );
}

/** Flat ground patch within the plot. */
function Patch({
  fv, u1, v1, u2, v2, fill,
}: {
  fv: FootprintVertices;
  u1: number; v1: number; u2: number; v2: number;
  fill: string;
}) {
  const sfv = subObjectFootprint(fv, u1, v1, u2, v2);
  return <path d={footprintPath(sfv)} fill={fill} style={{ pointerEvents: 'none' }} />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FacilityPlotContents({ facilityType, fv, level }: Props) {
  if (level === 0) return null;

  const no = { pointerEvents: 'none' as const };

  switch (facilityType) {

    // ── Training Ground ────────────────────────────────────────────────────
    // Back→front: shed(v2=0.30) < hut(v2=0.35) < gym(v2=0.92) < pavilion(v2=0.95)
    case 'TRAINING_GROUND': {
      return (
        <g style={no}>
          {/* Ground: grass pitch surface */}
          <Patch fv={fv} u1={0.08} v1={0.10} u2={0.92} v2={0.88} fill="#2D5A1B" />
          <Patch fv={fv} u1={0.10} v1={0.12} u2={0.90} v2={0.86} fill="url(#pat-grass)" />

          {/* BACK: equipment shed (v2=0.30) — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.72} v1={0.05} u2={0.95} v2={0.30} h={14} base="#6B4F30" />
          )}

          {/* BACK: changing hut (v2=0.35) — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.05} v1={0.05} u2={0.28} v2={0.35} h={18} base="#7A5C3A" />
          )}

          {/* FRONT: gym block (v2=0.92) — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.65} v1={0.62} u2={0.95} v2={0.92} h={22} base="#7A5C3A" />
          )}

          {/* FRONT: covered pavilion / stand (v2=0.95) — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.05} v1={0.68} u2={0.55} v2={0.95} h={16} base="#8B6F52" />
          )}
        </g>
      );
    }

    // ── Medical Centre ─────────────────────────────────────────────────────
    // Back→front: clinic(v2=0.55) < tent(v2=0.60) < walkway(v2=0.72) < ambulance(v2=0.95) < annex(v2=0.96)
    case 'MEDICAL_CENTER': {
      const WIN_MED = 'rgba(220,235,240,0.55)'; // frosted clinical white
      return (
        <g style={no}>
          {/* Base tarmac surface */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#2A3540" />

          {/* BACK: clinic building (v2=0.55) — L3+ replaces tent */}
          {level >= 3 ? (
            <>
              <Box fv={fv} u1={0.10} v1={0.05} u2={0.90} v2={0.55} h={26} base="#8FA8B0" />
              {/* Red cross marking on clinic roof */}
              <Patch fv={fv} u1={0.42} v1={0.08} u2={0.58} v2={0.25} fill="#E53935" />
              {/* Red cross on left & right face walls */}
              <FaceDetail fv={fv} u1={0.10} v1={0.05} u2={0.90} v2={0.55} h={26} side="left"  s1={0.38} t1={0.18} s2={0.62} t2={0.55} fill="#E53935" />
              <FaceDetail fv={fv} u1={0.10} v1={0.05} u2={0.90} v2={0.55} h={26} side="left"  s1={0.22} t1={0.30} s2={0.78} t2={0.44} fill="#E53935" />
              <FaceDetail fv={fv} u1={0.10} v1={0.05} u2={0.90} v2={0.55} h={26} side="right" s1={0.38} t1={0.18} s2={0.62} t2={0.55} fill="#E53935" />
              <FaceDetail fv={fv} u1={0.10} v1={0.05} u2={0.90} v2={0.55} h={26} side="right" s1={0.22} t1={0.30} s2={0.78} t2={0.44} fill="#E53935" />
              {/* Windows either side of cross */}
              <FaceWindows fv={fv} u1={0.10} v1={0.05} u2={0.90} v2={0.55} h={26} side="left"  cols={2} rows={1} fill={WIN_MED} margin={0.08} gap={0.50} />
              <FaceWindows fv={fv} u1={0.10} v1={0.05} u2={0.90} v2={0.55} h={26} side="right" cols={2} rows={1} fill={WIN_MED} margin={0.08} gap={0.50} />
            </>
          ) : (
            /* BACK: first-aid tent (v2=0.60) — L1–2 only */
            <Box fv={fv} u1={0.30} v1={0.20} u2={0.70} v2={0.60} h={14} base="#C8D8DC" />
          )}

          {/* MID: covered walkway (v2=0.72) — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.05} v1={0.55} u2={0.95} v2={0.72} h={8} base="#6A8890" />
          )}

          {/* FRONT: ambulance bay (v2=0.95) — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.05} v1={0.62} u2={0.45} v2={0.95} h={10} base="#3D5060" />
          )}

          {/* FRONT: full centre annex (v2=0.96) — L5 */}
          {level >= 5 && (
            <>
              <Box fv={fv} u1={0.50} v1={0.72} u2={0.96} v2={0.96} h={20} base="#8FA8B0" />
              <FaceWindows fv={fv} u1={0.50} v1={0.72} u2={0.96} v2={0.96} h={20} side="left"  cols={2} rows={1} fill={WIN_MED} />
              <FaceWindows fv={fv} u1={0.50} v1={0.72} u2={0.96} v2={0.96} h={20} side="right" cols={2} rows={1} fill={WIN_MED} />
            </>
          )}
        </g>
      );
    }

    // ── Scout Network ──────────────────────────────────────────────────────
    // Back→front: dish(v2=0.35) < mast(v2=0.22)* < office(v2=0.55) < table(v2=0.65) < caravan(v2=0.88) < tower(v2=0.92)
    // *mast is very thin — render early so caravan face isn't clipped by it
    case 'SCOUT_NETWORK': {
      return (
        <g style={no}>
          {/* Dark gravel base */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1A2530" />

          {/* BACK: satellite dish (v2=0.35) — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.60} v1={0.05} u2={0.95} v2={0.35} h={10} base="#3D5060" />
          )}

          {/* BACK: comms mast — thin column (v2=0.22) — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.72} v1={0.08} u2={0.80} v2={0.22} h={36} base="#4A5E6A" />
          )}

          {/* BACK: office block (v2=0.55) — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.05} v1={0.10} u2={0.50} v2={0.55} h={22} base="#2E3F4F" />
          )}

          {/* MID: fold-out table (v2=0.65) — L1 */}
          <Box fv={fv} u1={0.35} v1={0.35} u2={0.65} v2={0.65} h={6} base="#4A5E6A" />

          {/* FRONT: caravan / mobile unit (v2=0.88) — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.55} v1={0.55} u2={0.92} v2={0.88} h={16} base="#3A5060" />
          )}

          {/* FRONT: comms tower (v2=0.92) — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.08} v1={0.60} u2={0.45} v2={0.92} h={14} base="#2E3F4F" />
          )}
        </g>
      );
    }

    // ── Youth Academy ──────────────────────────────────────────────────────
    // Left half buildings — back→front: school(v2=0.55) < changing room(v2=0.95)
    // Right half pitch — flat patches, no height conflict
    case 'YOUTH_ACADEMY': {
      return (
        <g style={no}>
          {/* Ground: grass base */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1C3A1A" />
          {/* Right side: practice patch (always visible) */}
          <Patch fv={fv} u1={0.40} v1={0.10} u2={0.96} v2={0.90} fill="#245520" />
          {/* Right side: full grass pitch overlay — L4+ */}
          {level >= 4 && (
            <Patch fv={fv} u1={0.38} v1={0.08} u2={0.97} v2={0.92} fill="url(#pat-grass)" />
          )}

          {/* BACK LEFT: school building (v2=0.55) — L3+ */}
          {level >= 3 && level < 5 && (
            <Box fv={fv} u1={0.04} v1={0.05} u2={0.35} v2={0.55} h={24} base="#5B7E8A" />
          )}

          {/* FRONT LEFT: changing room shed (v2=0.95) — L2+ */}
          {level >= 2 && level < 5 && (
            <Box fv={fv} u1={0.04} v1={0.60} u2={0.34} v2={0.95} h={14} base="#5B7E8A" />
          )}

          {/* L5: campus hub replaces individual left-side buildings */}
          {level >= 5 && (
            <Box fv={fv} u1={0.04} v1={0.05} u2={0.34} v2={0.95} h={30} base="#4A6E7A" />
          )}
        </g>
      );
    }

    // ── Club Office ────────────────────────────────────────────────────────
    // Back→front: HQ tower(v2=0.55) < 3-storey(v2=0.70) < 2nd storey(v2=0.60)* < annex(v2=0.95)
    // *lower-level structures are subsumed at higher levels — suppress when superseded
    case 'CLUB_OFFICE': {
      const WIN = 'rgba(120,170,255,0.52)';   // blue glass windows
      const WIN_DIM = 'rgba(80,120,200,0.40)'; // darker glass for lower floors
      return (
        <g style={no}>
          {/* Tarmac base + car park markings */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1A2230" />
          <Patch fv={fv} u1={0.60} v1={0.60} u2={0.95} v2={0.95} fill="#22303A" />

          {/* BACK: HQ tower (v2=0.55) — L5 */}
          {level >= 5 && (
            <>
              <Box fv={fv} u1={0.28} v1={0.08} u2={0.72} v2={0.55} h={62} base="#4A5E72" />
              <FaceWindows fv={fv} u1={0.28} v1={0.08} u2={0.72} v2={0.55} h={62} side="left"  cols={2} rows={5} fill={WIN} margin={0.12} />
              <FaceWindows fv={fv} u1={0.28} v1={0.08} u2={0.72} v2={0.55} h={62} side="right" cols={2} rows={5} fill={WIN} margin={0.12} />
            </>
          )}

          {/* BACK-MID: 3-storey office (v2=0.70) — L3–4, subsumed at L5 by tower+annex */}
          {level >= 3 && level < 5 && (
            <>
              <Box fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.70} h={42} base="#4A5E72" />
              <FaceWindows fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.70} h={42} side="left"  cols={3} rows={2} fill={WIN} />
              <FaceWindows fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.70} h={42} side="right" cols={3} rows={2} fill={WIN} />
            </>
          )}
          {/* At L5, keep the wide base but shorter — tower rises from centre */}
          {level >= 5 && (
            <>
              <Box fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.70} h={28} base="#3A4E62" />
              <FaceWindows fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.70} h={28} side="left"  cols={3} rows={1} fill={WIN_DIM} />
              <FaceWindows fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.70} h={28} side="right" cols={3} rows={1} fill={WIN_DIM} />
            </>
          )}

          {/* BACK-MID: 2-storey office (v2=0.60) — L2 only */}
          {level === 2 && (
            <>
              <Box fv={fv} u1={0.25} v1={0.20} u2={0.75} v2={0.60} h={28} base="#4A5E72" />
              <FaceWindows fv={fv} u1={0.25} v1={0.20} u2={0.75} v2={0.60} h={28} side="left"  cols={2} rows={1} fill={WIN} />
              <FaceWindows fv={fv} u1={0.25} v1={0.20} u2={0.75} v2={0.60} h={28} side="right" cols={2} rows={1} fill={WIN} />
            </>
          )}

          {/* BACK-MID: porta-cabin (v2=0.65) — L1 only */}
          {level === 1 && (
            <>
              <Box fv={fv} u1={0.20} v1={0.25} u2={0.80} v2={0.65} h={14} base="#4A5E72" />
              <FaceWindows fv={fv} u1={0.20} v1={0.25} u2={0.80} v2={0.65} h={14} side="left"  cols={1} rows={1} fill={WIN} margin={0.15} />
              <FaceWindows fv={fv} u1={0.20} v1={0.25} u2={0.80} v2={0.65} h={14} side="right" cols={1} rows={1} fill={WIN} margin={0.15} />
            </>
          )}

          {/* FRONT: complex annex (v2=0.95) — L4+ */}
          {level >= 4 && (
            <>
              <Box fv={fv} u1={0.60} v1={0.62} u2={0.96} v2={0.96} h={24} base="#3A4E62" />
              <FaceWindows fv={fv} u1={0.60} v1={0.62} u2={0.96} v2={0.96} h={24} side="left"  cols={2} rows={1} fill={WIN_DIM} />
              <FaceWindows fv={fv} u1={0.60} v1={0.62} u2={0.96} v2={0.96} h={24} side="right" cols={2} rows={1} fill={WIN_DIM} />
            </>
          )}
        </g>
      );
    }

    // ── Club Commercial ────────────────────────────────────────────────────
    // Back→front: shop(v2=0.55) < shopfront(v2=0.65) < stall(v2=0.70) < store(v2=0.95) < wing(v2=0.95)
    case 'CLUB_COMMERCIAL': {
      const SIGN = '#FDD835';      // gold signage stripe
      const WIN_SHOP = 'rgba(255,220,100,0.35)'; // warm shop-window glow
      return (
        <g style={no}>
          {/* Paved surface */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#2A2010" />

          {/* BACK: shop unit (v2=0.55) — L2 only, subsumed by shopfront at L3 */}
          {level === 2 && (
            <>
              <Box fv={fv} u1={0.10} v1={0.10} u2={0.55} v2={0.55} h={18} base="#8B6F52" />
              <FaceDetail fv={fv} u1={0.10} v1={0.10} u2={0.55} v2={0.55} h={18} side="left"  s1={0} t1={0} s2={1} t2={0.18} fill={SIGN} />
              <FaceDetail fv={fv} u1={0.10} v1={0.10} u2={0.55} v2={0.55} h={18} side="right" s1={0} t1={0} s2={1} t2={0.18} fill={SIGN} />
            </>
          )}

          {/* BACK: commercial shopfront (v2=0.65) — L3+ */}
          {level >= 3 && (
            <>
              <Box fv={fv} u1={0.05} v1={0.05} u2={0.95} v2={0.65} h={24} base="#8B6F52" />
              {/* Gold sign band + large shop window */}
              <FaceDetail   fv={fv} u1={0.05} v1={0.05} u2={0.95} v2={0.65} h={24} side="left"  s1={0} t1={0} s2={1} t2={0.18} fill={SIGN} />
              <FaceDetail   fv={fv} u1={0.05} v1={0.05} u2={0.95} v2={0.65} h={24} side="right" s1={0} t1={0} s2={1} t2={0.18} fill={SIGN} />
              <FaceWindows  fv={fv} u1={0.05} v1={0.05} u2={0.95} v2={0.65} h={24} side="left"  cols={2} rows={1} fill={WIN_SHOP} margin={0.08} gap={0.15} />
              <FaceWindows  fv={fv} u1={0.05} v1={0.05} u2={0.95} v2={0.65} h={24} side="right" cols={2} rows={1} fill={WIN_SHOP} margin={0.08} gap={0.15} />
            </>
          )}

          {/* MID: market stall (v2=0.70) — L1 only */}
          {level === 1 && (
            <Box fv={fv} u1={0.25} v1={0.30} u2={0.75} v2={0.70} h={8} base="#C8A060" />
          )}

          {/* FRONT: merchandise store (v2=0.95, left) — L4+ */}
          {level >= 4 && (
            <>
              <Box fv={fv} u1={0.05} v1={0.65} u2={0.50} v2={0.95} h={20} base="#7A6040" />
              <FaceDetail fv={fv} u1={0.05} v1={0.65} u2={0.50} v2={0.95} h={20} side="left"  s1={0} t1={0} s2={1} t2={0.18} fill={SIGN} />
              <FaceDetail fv={fv} u1={0.05} v1={0.65} u2={0.50} v2={0.95} h={20} side="right" s1={0} t1={0} s2={1} t2={0.18} fill={SIGN} />
            </>
          )}

          {/* FRONT: full centre wing (v2=0.95, right) — L5 */}
          {level >= 5 && (
            <>
              <Box fv={fv} u1={0.52} v1={0.62} u2={0.96} v2={0.96} h={28} base="#8B6F52" />
              <FaceDetail fv={fv} u1={0.52} v1={0.62} u2={0.96} v2={0.96} h={28} side="left"  s1={0} t1={0} s2={1} t2={0.14} fill={SIGN} />
              <FaceDetail fv={fv} u1={0.52} v1={0.62} u2={0.96} v2={0.96} h={28} side="right" s1={0} t1={0} s2={1} t2={0.14} fill={SIGN} />
            </>
          )}
        </g>
      );
    }

    // ── Food & Beverage ────────────────────────────────────────────────────
    // Back→front: second stall(v2=0.45) < kiosk(v2=0.48) < beer van(v2=0.92) < hot dog cart(v2=0.85)
    // Hot dog cart sits mid-front; beer van is further front-left; kiosk is back-right
    case 'FOOD_AND_BEVERAGE': {
      const AWNING = '#FF5722';   // vivid orange awning stripe
      const AWNING2 = '#E64A19';  // darker variant for second stall
      return (
        <g style={no}>
          {/* Gravel surface */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#281C10" />

          {/* BACK: second stall (v2=0.45) — L4+ */}
          {level >= 4 && (
            <>
              <Box fv={fv} u1={0.05} v1={0.05} u2={0.32} v2={0.45} h={14} base="#7A4228" />
              <FaceDetail fv={fv} u1={0.05} v1={0.05} u2={0.32} v2={0.45} h={14} side="left"  s1={0} t1={0} s2={1} t2={0.22} fill={AWNING2} />
              <FaceDetail fv={fv} u1={0.05} v1={0.05} u2={0.32} v2={0.45} h={14} side="right" s1={0} t1={0} s2={1} t2={0.22} fill={AWNING2} />
            </>
          )}

          {/* BACK: kiosk (v2=0.48) — L3+ */}
          {level >= 3 && (
            <>
              <Box fv={fv} u1={0.35} v1={0.08} u2={0.92} v2={0.48} h={18} base="#7A4228" />
              <FaceDetail fv={fv} u1={0.35} v1={0.08} u2={0.92} v2={0.48} h={18} side="left"  s1={0} t1={0} s2={1} t2={0.20} fill={AWNING} />
              <FaceDetail fv={fv} u1={0.35} v1={0.08} u2={0.92} v2={0.48} h={18} side="right" s1={0} t1={0} s2={1} t2={0.20} fill={AWNING} />
            </>
          )}

          {/* FRONT: hot dog cart (v2=0.85) — L1–2 (subsumed by kiosk at L3+) */}
          {level < 3 && (
            <>
              <Box fv={fv} u1={0.38} v1={0.55} u2={0.62} v2={0.85} h={10} base="#C86428" />
              <FaceDetail fv={fv} u1={0.38} v1={0.55} u2={0.62} v2={0.85} h={10} side="left"  s1={0} t1={0} s2={1} t2={0.25} fill={AWNING} />
              <FaceDetail fv={fv} u1={0.38} v1={0.55} u2={0.62} v2={0.85} h={10} side="right" s1={0} t1={0} s2={1} t2={0.25} fill={AWNING} />
            </>
          )}

          {/* FRONT: beer van (v2=0.92) — L2+ */}
          {level >= 2 && level < 5 && (
            <Box fv={fv} u1={0.05} v1={0.52} u2={0.35} v2={0.92} h={14} base="#4A5C3A" />
          )}

          {/* L5: full concessions replaces individual stalls */}
          {level >= 5 && (
            <>
              <Box fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} h={22} base="#7A4228" />
              <FaceDetail fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} h={22} side="left"  s1={0} t1={0} s2={1} t2={0.15} fill={AWNING} />
              <FaceDetail fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} h={22} side="right" s1={0} t1={0} s2={1} t2={0.15} fill={AWNING} />
            </>
          )}
        </g>
      );
    }

    // ── Fan Zone ───────────────────────────────────────────────────────────
    // Back→front: poles(v2=0.20) < pavilion(v2=0.55) < screen(v2=0.70) < table(v2=0.90) < wings(v2=0.95)
    case 'FAN_ZONE': {
      const BANNER = '#AB47BC'; // vivid purple banner stripe
      const SCREEN = '#0D0D18'; // near-black screen face
      return (
        <g style={no}>
          {/* Paved plaza */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1E1428" />

          {/* BACK: banner poles (v2=0.20) — L1+ */}
          <Box fv={fv} u1={0.10} v1={0.10} u2={0.16} v2={0.20} h={28} base="#5C4A6A" />
          <Box fv={fv} u1={0.84} v1={0.10} u2={0.90} v2={0.20} h={28} base="#5C4A6A" />

          {/* BACK-MID: entertainment pavilion (v2=0.55) — L3+ */}
          {level >= 3 && (
            <>
              <Box fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.55} h={16} base="#5C4A6A" />
              {/* Banner stripe across top of pavilion faces */}
              <FaceDetail fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.55} h={16} side="left"  s1={0} t1={0} s2={1} t2={0.25} fill={BANNER} />
              <FaceDetail fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.55} h={16} side="right" s1={0} t1={0} s2={1} t2={0.25} fill={BANNER} />
            </>
          )}

          {/* MID: big screen structure (v2=0.70) — L4+ */}
          {level >= 4 && (
            <>
              <Box fv={fv} u1={0.35} v1={0.55} u2={0.65} v2={0.70} h={22} base="#3A2848" />
              {/* Screen face — dark panel on the front faces */}
              <FaceDetail fv={fv} u1={0.35} v1={0.55} u2={0.65} v2={0.70} h={22} side="left"  s1={0.08} t1={0.08} s2={0.92} t2={0.88} fill={SCREEN} />
              <FaceDetail fv={fv} u1={0.35} v1={0.55} u2={0.65} v2={0.70} h={22} side="right" s1={0.08} t1={0.08} s2={0.92} t2={0.88} fill={SCREEN} />
            </>
          )}

          {/* FRONT: merch table (v2=0.90) — L2 only */}
          {level === 2 && (
            <Box fv={fv} u1={0.30} v1={0.60} u2={0.70} v2={0.90} h={8} base="#7A5C8A" />
          )}

          {/* FRONT: covered side wings (v2=0.95) — L5 */}
          {level >= 5 && (
            <>
              <Box fv={fv} u1={0.04} v1={0.55} u2={0.32} v2={0.95} h={12} base="#5C4A6A" />
              <FaceDetail fv={fv} u1={0.04} v1={0.55} u2={0.32} v2={0.95} h={12} side="left"  s1={0} t1={0} s2={1} t2={0.30} fill={BANNER} />
              <FaceDetail fv={fv} u1={0.04} v1={0.55} u2={0.32} v2={0.95} h={12} side="right" s1={0} t1={0} s2={1} t2={0.30} fill={BANNER} />
              <Box fv={fv} u1={0.68} v1={0.55} u2={0.96} v2={0.95} h={12} base="#5C4A6A" />
              <FaceDetail fv={fv} u1={0.68} v1={0.55} u2={0.96} v2={0.95} h={12} side="left"  s1={0} t1={0} s2={1} t2={0.30} fill={BANNER} />
              <FaceDetail fv={fv} u1={0.68} v1={0.55} u2={0.96} v2={0.95} h={12} side="right" s1={0} t1={0} s2={1} t2={0.30} fill={BANNER} />
            </>
          )}
        </g>
      );
    }

    // ── Grounds & Security ─────────────────────────────────────────────────
    // Back→front: CCTV tower(v2=0.22) < booth complex(v2=0.60) < gatehouse(v2=0.65) < turnstile(v2=0.92) < hub(v2=0.96)
    case 'GROUNDS_SECURITY': {
      return (
        <g style={no}>
          {/* Concrete base */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1A1E22" />

          {/* BACK: CCTV tower — thin column (v2=0.22) — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.75} v1={0.08} u2={0.85} v2={0.22} h={32} base="#2E3F48" />
          )}

          {/* BACK-MID: security booth complex (v2=0.60) — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.05} v1={0.05} u2={0.65} v2={0.60} h={20} base="#3D4F58" />
          )}

          {/* MID: gatehouse (v2=0.65) — L1–2 only */}
          {level < 3 && (
            <Box fv={fv} u1={0.38} v1={0.35} u2={0.62} v2={0.65} h={14} base="#3D4F58" />
          )}

          {/* FRONT: turnstile block (v2=0.92) — L2+ */}
          {level >= 2 && level < 5 && (
            <Box fv={fv} u1={0.10} v1={0.62} u2={0.38} v2={0.92} h={10} base="#3D4F58" />
          )}

          {/* FRONT: security hub (v2=0.96) — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.65} v1={0.55} u2={0.96} v2={0.96} h={22} base="#3D4F58" />
          )}
        </g>
      );
    }

    // ── Stadium / Pitch ────────────────────────────────────────────────────
    case 'STADIUM': {
      return (
        <g style={no}>
          <Patch fv={fv} u1={0.05} v1={0.05} u2={0.95} v2={0.95} fill="url(#pat-grass)" />
          <Patch fv={fv} u1={0.45} v1={0.45} u2={0.55} v2={0.55} fill="rgba(255,255,255,0.12)" />
        </g>
      );
    }

    default:
      return null;
  }
}
