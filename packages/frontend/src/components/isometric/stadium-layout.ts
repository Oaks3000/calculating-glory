/**
 * Stadium layout — grid positions and visual config for every core unit.
 *
 * Grid: 20 cols × 14 rows, TILE_W=64, TILE_H=32 (fits 1366×720 viewport).
 *
 * Layout overview (isometric north = top of screen):
 *
 *   LEFT COLUMN           CENTRE              RIGHT COLUMN
 *   ─────────────────────────────────────────────────────
 *   Training (1,1)      The Pitch (7,2)      Club Office (15,1)
 *   Medical  (1,5)                           Commercial  (15,5)
 *   Scout    (1,7)                           Food & Bev  (15,9)
 *   Youth    (1,9)
 *                   Fan Zone (6,11)  Security (11,11)
 *
 * Every facility is represented by exactly one CoreUnitDef.  The STADIUM
 * facility is visualised as The Pitch only — The Stands will be added in a
 * later PR as a separate surrounding element driven by STADIUM level.
 *
 * Shading model (Gemini visual spec, PR 6):
 *   Top face:  base colour (100% light)
 *   SW face:   base colour + rgba(0,0,0,0.30) overlay (70% light)
 *   SE face:   base colour + rgba(0,0,0,0.55) overlay (45% light)
 *   Highlight: 1px rgba(255,255,255,0.20) line on top front edge (T→R)
 */

import { FacilityType } from '@calculating-glory/domain';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CoreUnitColors {
  /** Ground tile fill (level 0 — empty plot). */
  ground: string;
  /**
   * Building base colour — applied at 100% on the top face.
   * SW face receives an rgba(0,0,0,0.30) overlay; SE face gets rgba(0,0,0,0.55).
   * This produces 3-tone shading from a single hue without pre-baking hex values.
   */
  base: string;
  /**
   * Optional SVG fill override for the top face (e.g. 'url(#pat-grass)').
   * When set, the top face renders this pattern on top of the base colour.
   */
  topPattern?: string;
  /**
   * Optional SVG fill overlay for the SW face (e.g. 'url(#pat-concrete)').
   * Applied on top of the base colour + 30% dark overlay.
   */
  swPattern?: string;
  /** Icon / pip text colour. */
  label: string;
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
  /**
   * Building block height in pixels for each level (indices 0–5).
   * Level 0 = empty ground plot (height 0 = flat diamond only).
   * Levels 1–5 = increasingly tall/wide buildings.
   */
  blockHeights: [number, number, number, number, number, number];
  colors: CoreUnitColors;
}

// ---------------------------------------------------------------------------
// Layout data
// ---------------------------------------------------------------------------

export const STADIUM_LAYOUT: CoreUnitDef[] = [
  // ── The Pitch ────────────────────────────────────────────────────────────
  // Central 6×5 footprint.  Driven by the STADIUM facility.
  {
    id:           'pitch',
    facilityType: 'STADIUM',
    label:        'The Pitch',
    icon:         '⚽',
    gc: 7, gr: 2, cols: 6, rows: 5,
    blockHeights: [4, 8, 12, 16, 20, 24],
    colors: {
      ground:     '#2D5A1B',
      base:       '#4CAF50',
      topPattern: 'url(#pat-grass)',  // grass stripe pattern on top face
      label:      '#FFFFFF',
    },
  },

  // ── Left column — operational / performance ───────────────────────────

  {
    id:           'training',
    facilityType: 'TRAINING_GROUND',
    label:        'Training Ground',
    icon:         '🏋',
    gc: 1, gr: 1, cols: 3, rows: 2,
    blockHeights: [0, 20, 30, 40, 52, 64],
    colors: {
      ground:    '#5C4A18',
      base:      '#FF8F00',
      swPattern: 'url(#pat-concrete)',  // concrete stipple on SW (shadow) face
      label:     '#FFFFFF',
    },
  },
  {
    id:           'medical',
    facilityType: 'MEDICAL_CENTER',
    label:        'Medical Centre',
    icon:         '🏥',
    gc: 1, gr: 5, cols: 2, rows: 2,
    blockHeights: [0, 20, 30, 40, 52, 64],
    colors: {
      ground:    '#3A3A3A',
      base:      '#ECEFF1',
      swPattern: 'url(#pat-concrete)',
      label:     '#263238',
    },
  },
  {
    id:           'scout',
    facilityType: 'SCOUT_NETWORK',
    label:        'Scout Network',
    icon:         '🔭',
    gc: 1, gr: 7, cols: 2, rows: 2,
    blockHeights: [0, 16, 24, 34, 44, 56],
    colors: {
      ground: '#0A1A2A',
      base:   '#1565C0',
      label:  '#FFFFFF',
    },
  },
  {
    id:           'youth',
    facilityType: 'YOUTH_ACADEMY',
    label:        'Youth Academy',
    icon:         '🌱',
    gc: 1, gr: 9, cols: 3, rows: 2,
    blockHeights: [0, 20, 30, 40, 52, 64],
    colors: {
      ground: '#0D3A3A',
      base:   '#26C6DA',
      label:  '#FFFFFF',
    },
  },

  // ── Right column — business / commercial ─────────────────────────────

  {
    id:           'office',
    facilityType: 'CLUB_OFFICE',
    label:        'Club Office',
    icon:         '🏢',
    gc: 15, gr: 1, cols: 2, rows: 2,
    blockHeights: [0, 24, 36, 48, 60, 72],
    colors: {
      ground:    '#1A2A4A',
      base:      '#448AFF',
      swPattern: 'url(#pat-concrete)',
      label:     '#FFFFFF',
    },
  },
  {
    id:           'commercial',
    facilityType: 'CLUB_COMMERCIAL',
    label:        'Commercial Centre',
    icon:         '💰',
    gc: 15, gr: 5, cols: 2, rows: 2,
    blockHeights: [0, 20, 30, 42, 54, 66],
    colors: {
      ground: '#3A2A08',
      base:   '#FDD835',
      label:  '#212121',
    },
  },
  {
    id:           'food',
    facilityType: 'FOOD_AND_BEVERAGE',
    label:        'Food & Beverage',
    icon:         '🍔',
    gc: 15, gr: 9, cols: 2, rows: 2,
    blockHeights: [0, 16, 24, 34, 44, 56],
    colors: {
      ground: '#3A1A08',
      base:   '#FF7043',
      label:  '#FFFFFF',
    },
  },

  // ── Bottom row — matchday experience ─────────────────────────────────

  {
    id:           'fanzone',
    facilityType: 'FAN_ZONE',
    label:        'Fan Zone',
    icon:         '🎉',
    gc: 6, gr: 11, cols: 3, rows: 2,
    blockHeights: [0, 14, 22, 32, 42, 52],
    colors: {
      ground: '#2A0A3A',
      base:   '#AB47BC',
      label:  '#FFFFFF',
    },
  },
  {
    id:           'security',
    facilityType: 'GROUNDS_SECURITY',
    label:        'Grounds & Security',
    icon:         '🎟',
    gc: 11, gr: 11, cols: 3, rows: 2,
    blockHeights: [0, 14, 22, 32, 42, 52],
    colors: {
      ground:    '#2A2A2A',
      base:      '#78909C',
      swPattern: 'url(#pat-concrete)',
      label:     '#FFFFFF',
    },
  },
];

// ---------------------------------------------------------------------------
// Rendering order (painter's algorithm — back to front)
// ---------------------------------------------------------------------------

/**
 * Core units sorted for correct SVG painter's algorithm rendering.
 *
 * Sort key = gc + gr (smaller = further back = rendered first).
 * For multi-tile footprints use the front edge: (gc + cols) + (gr + rows).
 */
export const STADIUM_LAYOUT_SORTED: CoreUnitDef[] = [...STADIUM_LAYOUT].sort(
  (a, b) => (a.gc + a.gr) - (b.gc + b.gr),
);
