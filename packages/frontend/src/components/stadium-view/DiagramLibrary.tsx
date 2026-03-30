/**
 * DiagramLibrary — static registry of geometry diagrams for the Groundskeeper's Drill.
 *
 * Each entry is a React node (SVG) keyed by a stable string identifier.
 * QuestionTemplate.diagram references one of these keys; GeometryDrillCard
 * looks it up here and renders it above the question text.
 *
 * Keys are permanent — once a question bank ships with a diagram key, the
 * corresponding entry here must remain. Rename a key and any question using
 * the old key silently gets no diagram (it won't break, just loses the visual).
 *
 * ── Adding a new diagram ──────────────────────────────────────────────────────
 * 1. Write the SVG as a React fragment (use `viewBox`, keep it responsive).
 * 2. Add it to DIAGRAM_LIBRARY below with a descriptive kebab-case key.
 * 3. Set `diagram: 'your-key'` on the QuestionTemplate in the question bank.
 *
 * ── Naming convention ─────────────────────────────────────────────────────────
 * {shape}-{concept}   e.g.  'circle-chord-angle', 'cone-cross-section',
 *                           'sphere-great-circle', 'pyramid-net'
 *
 * ── Visual spec ───────────────────────────────────────────────────────────────
 * - viewBox="0 0 240 160" — consistent aspect ratio across all diagrams
 * - Stroke: #4CAF50 (pitch-green) for primary shapes
 * - Labels: #E0E0E0 (txt-muted equivalent) at font-size 11
 * - Background: transparent — the card background shows through
 * - Keep diagrams minimal: enough to understand the question, no decoration
 */

import type { ReactNode } from 'react';

export const DIAGRAM_LIBRARY: Record<string, ReactNode> = {
  // ── Populated when question banks for CIRCLES and VOLUME_AND_SURFACE_AREA
  // ── are written (GCSE Foundation / Higher tiers).
  //
  // Example entry shape (do not uncomment — illustrative only):
  //
  // 'circle-chord-angle': (
  //   <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg"
  //        style={{ width: '100%', maxWidth: 240 }}>
  //     <circle cx="120" cy="80" r="60" stroke="#4CAF50" strokeWidth="1.5" />
  //     ...
  //   </svg>
  // ),
};
