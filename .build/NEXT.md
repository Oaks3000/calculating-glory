---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-12"
---

# Calculating Glory - Next Steps

## Immediate (Next Session)

1. **Visual design spec — validate in mockup** — update `stadium-mockup.html` to implement Gemini's visual spec: 3-tone shading (100/70/45%), `<defs>` pattern library (grass stripes, seat banding, concrete stipple), highlight lines on top edges. Confirm it looks right before touching production code.
2. **PR 5: Weekly Training Focus** — new `SET_TRAINING_FOCUS` domain command + training drill math challenges
   - Adds ~2 extra decisions per week (one per training session)
   - Domain: `TrainingFocus` type, `SET_TRAINING_FOCUS` command, reducer update
   - UI: Training focus selector in StadiumView (TRAINING_GROUND click), challenge card format

## Short Term (Next 2–4 Weeks)

1. **Apply visual design spec to production renderer** — once validated in mockup, implement SVG `<defs>` patterns and 3-tone shading in `IsometricBlueprint.tsx` / `CoreUnit.tsx`
2. **Decide club colours** — needed for seating banding pattern; block on visual spec implementation until resolved
3. PR 6: Geometry challenges — 4 new MathTopics (AREA_AND_PERIMETER, ANGLES, SCALE_AND_PROPORTION, PROPERTIES_OF_SHAPES), stadium-themed templates
4. End-to-end integration tests (issue #12)
5. UI polish for Chromebook 1366x768 (issue #13)

## Questions / Unknowns

- **Club colours** — what are the default team's colours? Needed for seat row banding in visual design spec
- Should the card grid below the isometric canvas collapse once all navigation is wired (redundant at that point)?
- Visual design spec animations (birds, flags, crowd wave) — park in BACKLOG or target a specific PR?
