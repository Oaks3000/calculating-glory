/**
 * Isometric grid math utilities.
 *
 * Coordinate system:
 *   - Grid (col, row): integer tile positions, top-left origin
 *   - Screen (x, y): SVG pixel positions
 *
 * Tile diamond shape (top vertex is the gridToScreen output):
 *
 *        top(x, y)
 *       /          \
 *  left(x-TW/2,y+TH/2)  right(x+TW/2,y+TH/2)
 *       \          /
 *       bottom(x, y+TH)
 *
 * The grid origin (col=0, row=0) is placed at ORIGIN_X, ORIGIN_Y in SVG space.
 * ORIGIN_X is offset right by GRID_ROWS × (TILE_W/2) so the leftmost tile
 * appears at x=0.
 */

export const TILE_W = 64;   // diamond width in px
export const TILE_H = 32;   // diamond height in px

export const GRID_COLS = 20;
export const GRID_ROWS = 14;

/** SVG origin: screen position of the top vertex of tile (0, 0). */
export const ORIGIN_X = GRID_ROWS * (TILE_W / 2);  // 448
export const ORIGIN_Y = 24;                          // top padding

/**
 * SVG viewport dimensions.
 * Width  = (COLS + ROWS) × TILE_W/2  = 34 × 32 = 1088
 * Height = (COLS + ROWS) × TILE_H/2 + headroom for tall buildings
 */
export const SVG_W = (GRID_COLS + GRID_ROWS) * (TILE_W / 2);   // 1088
export const SVG_H = (GRID_COLS + GRID_ROWS) * (TILE_H / 2) + 96; // 640

// ---------------------------------------------------------------------------
// Core math
// ---------------------------------------------------------------------------

/** Convert grid (col, row) to the screen position of that tile's top vertex. */
export function gridToScreen(col: number, row: number): { x: number; y: number } {
  return {
    x: ORIGIN_X + (col - row) * (TILE_W / 2),
    y: ORIGIN_Y + (col + row) * (TILE_H / 2),
  };
}

// ---------------------------------------------------------------------------
// Footprint (rectangular patch of tiles)
// ---------------------------------------------------------------------------

export interface FootprintVertices {
  /** Topmost diamond vertex — top-left corner of the region. */
  top: { x: number; y: number };
  /** Rightmost diamond vertex — top-right corner of the region. */
  right: { x: number; y: number };
  /** Bottommost diamond vertex — bottom-right corner of the region. */
  bottom: { x: number; y: number };
  /** Leftmost diamond vertex — bottom-left corner of the region. */
  left: { x: number; y: number };
}

/**
 * Compute the 4 diamond vertices of a rectangular tile footprint.
 *
 * For a rectangle from (gc, gr) to (gc+cols-1, gr+rows-1):
 *   top    = screen top   of tile (gc,        gr        )
 *   right  = screen top   of tile (gc+cols,   gr        )  ← one past right edge
 *   bottom = screen top   of tile (gc+cols,   gr+rows   )  ← one past bottom-right
 *   left   = screen top   of tile (gc,        gr+rows   )  ← one past bottom edge
 *
 * This works because the right vertex of tile (c,r) equals the top vertex
 * of the imaginary tile (c+1, r), and so on for all 4 corners.
 */
export function footprintVertices(
  gc: number,
  gr: number,
  cols: number,
  rows: number,
): FootprintVertices {
  return {
    top:    gridToScreen(gc,        gr       ),
    right:  gridToScreen(gc + cols, gr       ),
    bottom: gridToScreen(gc + cols, gr + rows),
    left:   gridToScreen(gc,        gr + rows),
  };
}

/** SVG path string for the flat ground diamond of a footprint. */
export function footprintPath(fv: FootprintVertices): string {
  const { top, right, bottom, left } = fv;
  return `M ${top.x},${top.y} L ${right.x},${right.y} L ${bottom.x},${bottom.y} L ${left.x},${left.y} Z`;
}

// ---------------------------------------------------------------------------
// Isometric building block (sits on a footprint)
// ---------------------------------------------------------------------------

export interface BlockPaths {
  /** SVG path — flat top face of the block (footprint shifted up by bh). */
  top: string;
  /** SVG path — SW (left) vertical face. */
  left: string;
  /** SVG path — SE (right) vertical face. */
  right: string;
  /** SVG path — full block silhouette for hit-testing and hover outline. */
  hitRegion: string;
}

/**
 * Compute SVG paths for an isometric box sitting on a footprint.
 *
 * @param fv  Footprint vertices (from footprintVertices())
 * @param bh  Block height in pixels (0 = flat ground only)
 */
export function blockPaths(fv: FootprintVertices, bh: number): BlockPaths {
  const { top, right, bottom, left } = fv;

  // Top face: the footprint diamond shifted up by bh
  const topFacePath = [
    `M ${top.x},${top.y - bh}`,
    `L ${right.x},${right.y - bh}`,
    `L ${bottom.x},${bottom.y - bh}`,
    `L ${left.x},${left.y - bh} Z`,
  ].join(' ');

  // Left face — SW parallelogram
  const leftFacePath = [
    `M ${left.x},${left.y - bh}`,
    `L ${bottom.x},${bottom.y - bh}`,
    `L ${bottom.x},${bottom.y}`,
    `L ${left.x},${left.y} Z`,
  ].join(' ');

  // Right face — SE parallelogram
  const rightFacePath = [
    `M ${bottom.x},${bottom.y - bh}`,
    `L ${right.x},${right.y - bh}`,
    `L ${right.x},${right.y}`,
    `L ${bottom.x},${bottom.y} Z`,
  ].join(' ');

  // Full silhouette (top vertices) + ground edge (bottom vertices)
  const hitRegionPath = [
    `M ${top.x},${top.y - bh}`,
    `L ${right.x},${right.y - bh}`,
    `L ${right.x},${right.y}`,
    `L ${bottom.x},${bottom.y}`,
    `L ${left.x},${left.y}`,
    `L ${left.x},${left.y - bh} Z`,
  ].join(' ');

  return {
    top:       topFacePath,
    left:      leftFacePath,
    right:     rightFacePath,
    hitRegion: hitRegionPath,
  };
}

// ---------------------------------------------------------------------------
// Helpers for icon / label placement
// ---------------------------------------------------------------------------

/**
 * Screen position of the visual centre of a block's top face.
 * Used for placing emoji icons and labels.
 */
export function topFaceCenter(fv: FootprintVertices, bh: number): { x: number; y: number } {
  return {
    x: (fv.top.x + fv.bottom.x) / 2,
    y: (fv.top.y + fv.bottom.y) / 2 - bh,
  };
}

/**
 * Screen position of the centre of the ground footprint.
 * Used for placing "empty plot" markers when level === 0.
 */
export function groundCenter(fv: FootprintVertices): { x: number; y: number } {
  return {
    x: (fv.top.x + fv.bottom.x) / 2,
    y: (fv.top.y + fv.bottom.y) / 2,
  };
}
