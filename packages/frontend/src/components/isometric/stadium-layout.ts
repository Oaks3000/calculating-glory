/**
 * Stadium layout — grid positions and visual config for every core unit.
 *
 * Grid: 20 cols × 14 rows, TILE_W=64, TILE_H=32 (fits 1366×720 viewport).
 *
 * Layout overview (isometric north = top of screen):
 *
 *   LEFT COLUMN           CENTRE              RIGHT COLUMN
 *   ─────────────────────────────────────────────────────
 *   Training (0,1)      The Pitch (7,2)      Club Office  (14,1)
 *   Medical  (0,5)                           Commercial   (14,5)
 *   Scout    (0,8)                           Food & Bev   (14,8)
 *   Youth    (0,11)
 *                   Fan Zone (6,11)  Security (11,11)
 *
 * Every facility is represented by exactly one CoreUnitDef.  The STADIUM
 * facility is visualised as The Pitch only — The Stands will be added in a
 * later PR as a separate surrounding element driven by STADIUM level.
 *
 * Visual model:
 *   Each facility is a PLOT that fills with sub-objects as levels increase.
 *   Level 0: grass-textured plot with a faint dashed outline only.
 *   Level 1–5: sub-objects from FacilityPlotContents rendered within the plot.
 *   The `colors.base` token is the primary material used by plot sub-objects.
 *   The `colors.ground` token is the plot base fill (soil/tarmac/concrete).
 *   See FacilityPlotContents.tsx for per-facility progression details.
 */

import { FacilityType } from '@calculating-glory/domain';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CoreUnitColors {
  /**
   * Ground base fill for this plot type (level 1+ only).
   * Level 0 always uses url(#pat-ground) from the SVG defs.
   */
  ground: string;
  /**
   * Primary colour token for sub-objects in this plot.
   * Used as the base colour for all FacilityPlotContents Box components.
   * Should be muted/realistic; vivid colour belongs in flagColor.
   */
  base: string;
  /** Icon / pip text colour. */
  label: string;
  /**
   * Accent colour used to identify this facility (future use: hover glow,
   * upgrade button highlight, chart colour).
   */
  flagColor: string;
}

export interface CoreUnitDef {
  /** Unique identifier used as React key and tooltip lookup. */
  id: string;
  /** Which domain facility this represents. */
  facilityType: FacilityType;
  /** Display name for tooltip. */
  label: string;
  /** Emoji icon rendered on the building. */
  icon: string;
  /** Top-left grid column of the footprint. */
  gc: number;
  /** Top-left grid row of the footprint. */
  gr: number;
  /** Footprint width in tiles. */
  cols: number;
  /** Footprint depth in tiles. */
  rows: number;
  colors: CoreUnitColors;
}

// ---------------------------------------------------------------------------
// Layout data
// ---------------------------------------------------------------------------

export const STADIUM_LAYOUT: CoreUnitDef[] = [
  // ── The Pitch ────────────────────────────────────────────────────────────
  {
    id:           'pitch',
    facilityType: 'STADIUM',
    label:        'The Pitch',
    icon:         '⚽',
    gc: 7, gr: 2, cols: 6, rows: 5,
    colors: {
      ground:    '#2D5A1B',
      base:      '#3A7D2C',
      label:     '#FFFFFF',
      flagColor: '#FFFFFF',
    },
  },

  // ── Left column — operational / performance ───────────────────────────

  {
    id:           'training',
    facilityType: 'TRAINING_GROUND',
    label:        'Training Ground',
    icon:         '🏋',
    gc: 0, gr: 1, cols: 4, rows: 3,
    colors: {
      ground:    '#2E1A0A',
      base:      '#7A5C3A',
      label:     '#FFFFFF',
      flagColor: '#FF8F00',
    },
  },
  {
    id:           'medical',
    facilityType: 'MEDICAL_CENTER',
    label:        'Medical Centre',
    icon:         '🏥',
    gc: 0, gr: 5, cols: 3, rows: 2,
    colors: {
      ground:    '#1C2B30',
      base:      '#8FA8B0',
      label:     '#FFFFFF',
      flagColor: '#E53935',
    },
  },
  {
    id:           'scout',
    facilityType: 'SCOUT_NETWORK',
    label:        'Scout Network',
    icon:         '🔭',
    gc: 0, gr: 8, cols: 3, rows: 2,
    colors: {
      ground:   '#0A1520',
      base:     '#2E3F4F',
      label:    '#FFFFFF',
      flagColor:'#29B6F6',
    },
  },
  {
    id:           'youth',
    facilityType: 'YOUTH_ACADEMY',
    label:        'Youth Academy',
    icon:         '🌱',
    gc: 0, gr: 11, cols: 4, rows: 2,
    colors: {
      ground:   '#122020',
      base:     '#5B7E8A',
      label:    '#FFFFFF',
      flagColor:'#26C6DA',
    },
  },

  // ── Right column — business / commercial ─────────────────────────────

  {
    id:           'office',
    facilityType: 'CLUB_OFFICE',
    label:        'Club Office',
    icon:         '🏢',
    gc: 14, gr: 1, cols: 3, rows: 3,
    colors: {
      ground:    '#141E2E',
      base:      '#4A5E72',
      label:     '#FFFFFF',
      flagColor: '#448AFF',
    },
  },
  {
    id:           'commercial',
    facilityType: 'CLUB_COMMERCIAL',
    label:        'Commercial Centre',
    icon:         '💰',
    gc: 14, gr: 5, cols: 3, rows: 2,
    colors: {
      ground:   '#2A1C08',
      base:     '#8B6F52',
      label:    '#FFFFFF',
      flagColor:'#FDD835',
    },
  },
  {
    id:           'food',
    facilityType: 'FOOD_AND_BEVERAGE',
    label:        'Food & Beverage',
    icon:         '🍔',
    gc: 14, gr: 8, cols: 3, rows: 2,
    colors: {
      ground:   '#281408',
      base:     '#7A4228',
      label:    '#FFFFFF',
      flagColor:'#FF7043',
    },
  },

  // ── Bottom row — matchday experience ─────────────────────────────────

  {
    id:           'fanzone',
    facilityType: 'FAN_ZONE',
    label:        'Fan Zone',
    icon:         '🎉',
    gc: 6, gr: 11, cols: 4, rows: 2,
    colors: {
      ground:   '#1A0A28',
      base:     '#5C4A6A',
      label:    '#FFFFFF',
      flagColor:'#AB47BC',
    },
  },
  {
    id:           'security',
    facilityType: 'GROUNDS_SECURITY',
    label:        'Grounds & Security',
    icon:         '🎟',
    gc: 11, gr: 11, cols: 4, rows: 2,
    colors: {
      ground:    '#1A1A1A',
      base:      '#3D4F58',
      label:     '#FFFFFF',
      flagColor: '#FFD740',
    },
  },
];

// ---------------------------------------------------------------------------
// Rendering order (painter's algorithm — back to front)
// ---------------------------------------------------------------------------

/**
 * Core units sorted for correct SVG painter's algorithm rendering.
 *
 * Sort key = front corner of the footprint: (gc + cols - 1) + (gr + rows - 1).
 * This is the isometric tile closest to the viewer for each plot, which is what
 * determines whether one plot visually overlaps another.
 * Smaller key = further from viewer = rendered first (painted underneath).
 */
export const STADIUM_LAYOUT_SORTED: CoreUnitDef[] = [...STADIUM_LAYOUT].sort(
  (a, b) =>
    (a.gc + a.cols - 1 + a.gr + a.rows - 1) -
    (b.gc + b.cols - 1 + b.gr + b.rows - 1),
);
