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
 *   Youth    (1,9)                           Food & Bev  (15,9)
 *                   Fan Zone (6,11)  Security (11,11)
 *
 * Every facility is represented by exactly one CoreUnitDef.  The STADIUM
 * facility is visualised as The Pitch only — The Stands will be added in a
 * later PR as a separate surrounding element driven by STADIUM level.
 */

import { FacilityType } from '@calculating-glory/domain';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CoreUnitColors {
  /** Ground tile fill (level 0 — empty plot). */
  ground: string;
  /** Top face of the building block. */
  top: string;
  /** SW (left) face — slightly darker. */
  left: string;
  /** SE (right) face — darkest. */
  right: string;
  /** Icon / label text colour. */
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
      ground: '#2D5A1B',
      top:    '#4CAF50',
      left:   '#388E3C',
      right:  '#2E7D32',
      label:  '#FFFFFF',
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
      ground: '#5C4A18',
      top:    '#FF8F00',
      left:   '#E65100',
      right:  '#BF360C',
      label:  '#FFFFFF',
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
      ground: '#3A3A3A',
      top:    '#ECEFF1',
      left:   '#B0BEC5',
      right:  '#78909C',
      label:  '#263238',
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
      top:    '#26C6DA',
      left:   '#00838F',
      right:  '#006064',
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
      ground: '#1A2A4A',
      top:    '#448AFF',
      left:   '#1565C0',
      right:  '#0D47A1',
      label:  '#FFFFFF',
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
      top:    '#FDD835',
      left:   '#F9A825',
      right:  '#F57F17',
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
      top:    '#FF7043',
      left:   '#E64A19',
      right:  '#BF360C',
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
      top:    '#AB47BC',
      left:   '#6A1B9A',
      right:  '#4A148C',
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
      ground: '#2A2A2A',
      top:    '#78909C',
      left:   '#546E7A',
      right:  '#37474F',
      label:  '#FFFFFF',
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
