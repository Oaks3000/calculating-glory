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
 */

import { FacilityType } from '@calculating-glory/domain';
import { FootprintVertices, subObjectFootprint, blockPaths, footprintPath, shadeColor } from './isometric-utils';

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
    case 'TRAINING_GROUND': {
      // L1: small pitch marking on grass
      // L2: + changing hut (back-left)
      // L3: + equipment shed (back-right)
      // L4: + small gym block (front-right)
      // L5: + covered stand / pavilion (front)
      return (
        <g style={no}>
          {/* Grass pitch surface */}
          <Patch fv={fv} u1={0.08} v1={0.10} u2={0.92} v2={0.88} fill="#2D5A1B" />
          {/* Pitch markings */}
          <Patch fv={fv} u1={0.10} v1={0.12} u2={0.90} v2={0.86} fill="url(#pat-grass)" />

          {/* Changing hut — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.05} v1={0.05} u2={0.28} v2={0.35} h={18} base="#7A5C3A" />
          )}

          {/* Equipment shed — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.72} v1={0.05} u2={0.95} v2={0.30} h={14} base="#6B4F30" />
          )}

          {/* Gym block — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.65} v1={0.62} u2={0.95} v2={0.92} h={22} base="#7A5C3A" />
          )}

          {/* Covered pavilion / stand — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.05} v1={0.68} u2={0.55} v2={0.95} h={16} base="#8B6F52" />
          )}
        </g>
      );
    }

    // ── Medical Centre ─────────────────────────────────────────────────────
    case 'MEDICAL_CENTER': {
      // L1: first-aid tent (small, white)
      // L2: + ambulance bay (darker block)
      // L3: clinic building
      // L4: larger clinic + covered walkway
      // L5: full medical centre complex
      return (
        <g style={no}>
          {/* Base tarmac surface */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#2A3540" />

          {/* First-aid tent — L1 */}
          <Box fv={fv} u1={0.30} v1={0.20} u2={0.70} v2={0.60} h={14} base="#C8D8DC" />
          {/* Red cross marker on tent top */}

          {/* Ambulance bay — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.05} v1={0.60} u2={0.45} v2={0.95} h={10} base="#3D5060" />
          )}

          {/* Clinic building — L3+ */}
          {level >= 3 && (
            <>
              <Box fv={fv} u1={0.10} v1={0.05} u2={0.90} v2={0.55} h={26} base="#8FA8B0" />
              {/* Red cross on face */}
              <Patch fv={fv} u1={0.42} v1={0.08} u2={0.58} v2={0.30} fill="#E53935" />
            </>
          )}

          {/* Covered walkway — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.05} v1={0.55} u2={0.95} v2={0.72} h={8} base="#6A8890" />
          )}

          {/* Full centre annex — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.05} v1={0.72} u2={0.55} v2={0.96} h={20} base="#8FA8B0" />
          )}
        </g>
      );
    }

    // ── Scout Network ──────────────────────────────────────────────────────
    case 'SCOUT_NETWORK': {
      // L1: fold-out table + laptop (tiny flat box)
      // L2: + caravan / mobile unit
      // L3: small office + comms mast
      // L4: + satellite dish (small cylinder on top)
      // L5: full comms tower
      return (
        <g style={no}>
          {/* Dark gravel base */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1A2530" />

          {/* Table — L1 */}
          <Box fv={fv} u1={0.35} v1={0.35} u2={0.65} v2={0.65} h={6} base="#4A5E6A" />

          {/* Caravan — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.55} v1={0.55} u2={0.92} v2={0.88} h={16} base="#3A5060" />
          )}

          {/* Office block — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.05} v1={0.10} u2={0.50} v2={0.55} h={22} base="#2E3F4F" />
          )}

          {/* Mast — L3+ (thin tall column) */}
          {level >= 3 && (
            <Box fv={fv} u1={0.72} v1={0.08} u2={0.80} v2={0.22} h={36} base="#4A5E6A" />
          )}

          {/* Satellite dish — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.60} v1={0.05} u2={0.95} v2={0.35} h={10} base="#3D5060" />
          )}

          {/* Communications tower — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.08} v1={0.60} u2={0.45} v2={0.92} h={14} base="#2E3F4F" />
          )}
        </g>
      );
    }

    // ── Youth Academy ──────────────────────────────────────────────────────
    case 'YOUTH_ACADEMY': {
      // L1: small grass patch + cones
      // L2: + changing room shed
      // L3: school building
      // L4: + practice pitch
      // L5: full academy campus
      return (
        <g style={no}>
          {/* Grass base */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1C3A1A" />

          {/* Practice patch */}
          <Patch fv={fv} u1={0.40} v1={0.10} u2={0.96} v2={0.90} fill="#245520" />

          {/* Changing room shed — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.04} v1={0.60} u2={0.34} v2={0.95} h={14} base="#5B7E8A" />
          )}

          {/* School building — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.04} v1={0.05} u2={0.35} v2={0.55} h={24} base="#5B7E8A" />
          )}

          {/* Full pitch — L4+ */}
          {level >= 4 && (
            <Patch fv={fv} u1={0.38} v1={0.08} u2={0.97} v2={0.92} fill="url(#pat-grass)" />
          )}

          {/* Campus hub block — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.04} v1={0.05} u2={0.34} v2={0.95} h={30} base="#4A6E7A" />
          )}
        </g>
      );
    }

    // ── Club Office ────────────────────────────────────────────────────────
    case 'CLUB_OFFICE': {
      // L1: porta-cabin
      // L2: small office (2 storeys)
      // L3: proper 3-storey block
      // L4: main office complex
      // L5: HQ tower with helipad
      return (
        <g style={no}>
          {/* Tarmac base */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1A2230" />

          {/* Car park markings */}
          <Patch fv={fv} u1={0.60} v1={0.60} u2={0.95} v2={0.95} fill="#22303A" />

          {/* Porta-cabin — L1 */}
          <Box fv={fv} u1={0.20} v1={0.25} u2={0.80} v2={0.65} h={14} base="#4A5E72" />

          {/* Second storey — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.25} v1={0.20} u2={0.75} v2={0.60} h={28} base="#4A5E72" />
          )}

          {/* 3-storey office — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.70} h={42} base="#4A5E72" />
          )}

          {/* Complex annex — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.60} v1={0.60} u2={0.95} v2={0.95} h={24} base="#3A4E62" />
          )}

          {/* HQ tower — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.25} v1={0.08} u2={0.75} v2={0.55} h={62} base="#4A5E72" />
          )}
        </g>
      );
    }

    // ── Club Commercial ────────────────────────────────────────────────────
    case 'CLUB_COMMERCIAL': {
      // L1: market stall / trestle table
      // L2: + small shop unit
      // L3: commercial unit with shopfront
      // L4: + merchandise store
      // L5: full commercial centre
      return (
        <g style={no}>
          {/* Paved surface */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#2A2010" />

          {/* Market stall — L1 */}
          <Box fv={fv} u1={0.25} v1={0.30} u2={0.75} v2={0.70} h={8} base="#C8A060" />

          {/* Shop unit — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.10} v1={0.10} u2={0.55} v2={0.55} h={18} base="#8B6F52" />
          )}

          {/* Commercial shopfront — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.05} v1={0.05} u2={0.95} v2={0.65} h={24} base="#8B6F52" />
          )}

          {/* Merchandise store — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.10} v1={0.65} u2={0.55} v2={0.95} h={20} base="#7A6040" />
          )}

          {/* Full centre — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.55} v1={0.60} u2={0.95} v2={0.95} h={28} base="#8B6F52" />
          )}
        </g>
      );
    }

    // ── Food & Beverage ────────────────────────────────────────────────────
    case 'FOOD_AND_BEVERAGE': {
      // L1: hot dog cart (tiny box, front-centre)
      // L2: + beer van (mid-left)
      // L3: kiosk booth
      // L4: + second stall
      // L5: full concessions unit
      return (
        <g style={no}>
          {/* Gravel surface */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#281C10" />

          {/* Hot dog cart — L1 */}
          <Box fv={fv} u1={0.38} v1={0.55} u2={0.62} v2={0.85} h={10} base="#C86428" />

          {/* Beer van — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.05} v1={0.50} u2={0.35} v2={0.92} h={14} base="#4A5C3A" />
          )}

          {/* Kiosk — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.35} v1={0.08} u2={0.92} v2={0.48} h={18} base="#7A4228" />
          )}

          {/* Second stall — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.05} v1={0.05} u2={0.32} v2={0.45} h={14} base="#7A4228" />
          )}

          {/* Full concessions unit — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} h={22} base="#7A4228" />
          )}
        </g>
      );
    }

    // ── Fan Zone ───────────────────────────────────────────────────────────
    case 'FAN_ZONE': {
      // L1: banner poles + open space
      // L2: + merch table
      // L3: entertainment pavilion
      // L4: + big screen structure
      // L5: full fan zone with covered areas
      return (
        <g style={no}>
          {/* Paved plaza */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1E1428" />

          {/* Banner pole left — L1 */}
          <Box fv={fv} u1={0.10} v1={0.10} u2={0.16} v2={0.20} h={28} base="#5C4A6A" />
          {/* Banner pole right — L1 */}
          <Box fv={fv} u1={0.84} v1={0.10} u2={0.90} v2={0.20} h={28} base="#5C4A6A" />

          {/* Merch table — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.30} v1={0.60} u2={0.70} v2={0.90} h={8} base="#7A5C8A" />
          )}

          {/* Entertainment pavilion — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.10} v1={0.10} u2={0.90} v2={0.55} h={16} base="#5C4A6A" />
          )}

          {/* Big screen structure — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.35} v1={0.55} u2={0.65} v2={0.70} h={22} base="#3A2848" />
          )}

          {/* Covered side wings — L5 */}
          {level >= 5 && (
            <>
              <Box fv={fv} u1={0.04} v1={0.55} u2={0.32} v2={0.95} h={12} base="#5C4A6A" />
              <Box fv={fv} u1={0.68} v1={0.55} u2={0.96} v2={0.95} h={12} base="#5C4A6A" />
            </>
          )}
        </g>
      );
    }

    // ── Grounds & Security ─────────────────────────────────────────────────
    case 'GROUNDS_SECURITY': {
      // L1: barrier + small gatehouse
      // L2: + turnstile block
      // L3: security booth complex
      // L4: + CCTV tower
      // L5: full security hub
      return (
        <g style={no}>
          {/* Concrete base */}
          <Patch fv={fv} u1={0.04} v1={0.04} u2={0.96} v2={0.96} fill="#1A1E22" />

          {/* Gatehouse — L1 */}
          <Box fv={fv} u1={0.38} v1={0.35} u2={0.62} v2={0.65} h={14} base="#3D4F58" />

          {/* Turnstile block — L2+ */}
          {level >= 2 && (
            <Box fv={fv} u1={0.10} v1={0.62} u2={0.38} v2={0.92} h={10} base="#3D4F58" />
          )}

          {/* Security booth complex — L3+ */}
          {level >= 3 && (
            <Box fv={fv} u1={0.05} v1={0.05} u2={0.65} v2={0.60} h={20} base="#3D4F58" />
          )}

          {/* CCTV tower — L4+ */}
          {level >= 4 && (
            <Box fv={fv} u1={0.75} v1={0.08} u2={0.85} v2={0.22} h={32} base="#2E3F48" />
          )}

          {/* Security hub — L5 */}
          {level >= 5 && (
            <Box fv={fv} u1={0.65} v1={0.55} u2={0.96} v2={0.96} h={22} base="#3D4F58" />
          )}
        </g>
      );
    }

    // ── Stadium / Pitch ────────────────────────────────────────────────────
    case 'STADIUM': {
      // The pitch itself — grass stripes + centre circle suggestion
      return (
        <g style={no}>
          {/* Grass surface */}
          <Patch fv={fv} u1={0.05} v1={0.05} u2={0.95} v2={0.95} fill="url(#pat-grass)" />
          {/* Centre spot */}
          <Patch fv={fv} u1={0.45} v1={0.45} u2={0.55} v2={0.55} fill="rgba(255,255,255,0.12)" />
        </g>
      );
    }

    default:
      return null;
  }
}
