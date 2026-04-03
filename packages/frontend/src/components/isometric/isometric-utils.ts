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
// Vertical face patch (windows, doors, signs, awnings)
// ---------------------------------------------------------------------------

/**
 * SVG path for a rectangular patch on one vertical face of an isometric box.
 *
 * Use this to add windows, doors, signs, or awning stripes to any Box.
 * The same sfv + bh passed to blockPaths() should be passed here.
 *
 * Face coordinate system:
 *   s: 0 = near (left) edge of the face, 1 = far (right) edge
 *   t: 0 = top of the face (height bh), 1 = ground level
 *
 * @param sfv   Sub-object footprint vertices
 * @param bh    Block height in pixels (same value used in blockPaths)
 * @param side  'left' = SW parallelogram face, 'right' = SE parallelogram face
 * @param s1    Horizontal start (0–1)
 * @param t1    Vertical start   (0–1, 0=top)
 * @param s2    Horizontal end
 * @param t2    Vertical end
 */
export function facePatch(
  sfv: FootprintVertices,
  bh: number,
  side: 'left' | 'right',
  s1: number, t1: number,
  s2: number, t2: number,
): string {
  let TL: {x:number;y:number}, TR: {x:number;y:number},
      BR: {x:number;y:number}, BL: {x:number;y:number};
  if (side === 'left') {
    TL = { x: sfv.left.x,   y: sfv.left.y - bh };
    TR = { x: sfv.bottom.x, y: sfv.bottom.y - bh };
    BR = { x: sfv.bottom.x, y: sfv.bottom.y };
    BL = { x: sfv.left.x,   y: sfv.left.y };
  } else {
    TL = { x: sfv.bottom.x, y: sfv.bottom.y - bh };
    TR = { x: sfv.right.x,  y: sfv.right.y - bh };
    BR = { x: sfv.right.x,  y: sfv.right.y };
    BL = { x: sfv.bottom.x, y: sfv.bottom.y };
  }
  const p = (s: number, t: number) => ({
    x: TL.x*(1-s)*(1-t) + TR.x*s*(1-t) + BR.x*s*t + BL.x*(1-s)*t,
    y: TL.y*(1-s)*(1-t) + TR.y*s*(1-t) + BR.y*s*t + BL.y*(1-s)*t,
  });
  const a = p(s1,t1), b = p(s2,t1), c = p(s2,t2), d = p(s1,t2);
  return `M ${a.x},${a.y} L ${b.x},${b.y} L ${c.x},${c.y} L ${d.x},${d.y} Z`;
}

// ---------------------------------------------------------------------------
// Plot sub-object geometry
// ---------------------------------------------------------------------------

/**
 * Map a normalised rectangle (u1,v1)→(u2,v2) within a plot's ground diamond
 * to a FootprintVertices for use with blockPaths().
 *
 * Coordinate system on the plot diamond:
 *   u=0 → NW edge,  u=1 → NE edge
 *   v=0 → back (NW→NE), v=1 → front (SW→SE)
 *
 * Example: subObjectFootprint(fv, 0.1, 0.1, 0.5, 0.6) places a box in the
 * back-left quarter of the plot.
 */
export function subObjectFootprint(
  fv: FootprintVertices,
  u1: number, v1: number,
  u2: number, v2: number,
): FootprintVertices {
  const TL = fv.top, TR = fv.right, BL = fv.left;
  const p = (u: number, v: number) => ({
    x: TL.x + u * (TR.x - TL.x) + v * (BL.x - TL.x),
    y: TL.y + u * (TR.y - TL.y) + v * (BL.y - TL.y),
  });
  return { top: p(u1,v1), right: p(u2,v1), bottom: p(u2,v2), left: p(u1,v2) };
}

// ---------------------------------------------------------------------------
// Tier geometry
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Colour utilities
// ---------------------------------------------------------------------------

/**
 * Adjust a hex colour by a percentage.
 * Positive percent = lighter, negative = darker.
 * e.g. shadeColor('#448AFF', -15) → 15% darker version of that blue
 */
export function shadeColor(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const factor = 1 + percent / 100;
  const nr = Math.min(255, Math.max(0, Math.round(r * factor)));
  const ng = Math.min(255, Math.max(0, Math.round(g * factor)));
  const nb = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
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
