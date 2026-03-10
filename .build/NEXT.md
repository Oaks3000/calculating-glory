---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-10"
---

# Calculating Glory - Next Steps

## Immediate (Next Session)

1. **Merge PR #24** (isometric renderer) once reviewed
2. **PR 4: Navigation wiring** — wire `onCoreUnitClick(facilityType)` to correct destinations:
   - `STADIUM` → Fixtures / Match preview slide-over
   - `TRAINING_GROUND` → Squad Audit slide-over
   - `MEDICAL_CENTER` → Backroom Team slide-over (injury log tab)
   - `YOUTH_ACADEMY` → Transfer market / scouting stub
   - `CLUB_OFFICE` → Board Confidence / decisions panel
   - `CLUB_COMMERCIAL` / `FOOD_AND_BEVERAGE` / `FAN_ZONE` / `GROUNDS_SECURITY` → FacilityCard upgrade slide-over
   - Level-0 plots → BuildPanel (upgrade CTA showing "Build — £X,XXX")

## Short Term (Next 2–4 Weeks)

1. PR 5: Weekly Training Focus — `SET_TRAINING_FOCUS` command, training drill math challenges (~2 extra decisions/week)
2. PR 6: Geometry challenges — 4 new MathTopics (AREA_AND_PERIMETER, ANGLES, SCALE_AND_PROPORTION, PROPERTIES_OF_SHAPES), stadium-themed templates
3. Sub-unit art — individual building sprites per level per core unit (deferred until nav is stable)
4. End-to-end integration tests (issue #12)
5. UI polish for Chromebook 1366x768 (issue #13)

## Questions / Unknowns

- Level-0 click: open FacilityCard upgrade flow inline, or a dedicated BuildPanel slide-over?
- Should the card grid below the isometric canvas collapse once all navigation is wired (redundant at that point)?
- Sub-unit art: keep level-scaled blocks long-term, or plan detailed building sprites for Phase 5?
