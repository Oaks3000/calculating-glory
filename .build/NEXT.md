---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-03-31"
---

# Calculating Glory — Next Steps

> Living document. Updated after each merged PR.

---

## Recently Completed

### ✅ UX Polish — Contract Labels, Auto-exit, Budget Flash
- **Issues:** #63, #64
- **Status:** MERGED (PR #93)
- Contract label simplified: "Contract: Xw left" with tooltip
- Negotiations auto-close 2.5s after result
- Budget flash animation with +/- delta badge
- Runway label shortened to "Xw runway"

### ✅ Dani Intro Stadium Tour
- **Issue:** #90
- **Status:** MERGED (PR #94)
- 6 new intro steps with stadium backdrop
- Facility highlight pulse (Training, Medical, Scout, Stadium)
- Backdrop switching between Command Centre and IsometricBlueprint
- Dani's voice: practical, dry, trade-off framing

### ✅ NPC Match Reactions
- **Issue:** #85
- **Status:** MERGED (PR #94)
- 30+ templates across 7 scenarios (big_win, loss, streaks, etc.)
- Kev: football-obsessed. Val: commercial. Marcus: fan-focused.
- Deterministic (seeded RNG), non-stacking, Kev double-weighted
- Fires in SIMULATE_WEEK after match results

### ✅ Match Pitch Visualisation
- **Issue:** #65
- **Status:** Committed on `claude/plan-next-priorities-VHNXw` (awaiting PR)
- Top-down SVG pitch with 22 blips (11 home + 11 away, 4-4-2)
- Beat-driven blip state machine (IDLE → BUILD_UP → CHANCE → CELEBRATE → RESET)
- Goal celebration: radial pulse + blip convergence + scoreboard bounce
- Crowd atmosphere glow on pitch border
- CSS keyframes only (Chromebook-safe), prefers-reduced-motion support

### ✅ Owner's Box Polish
- **Issue:** #89
- **Status:** MERGED (PR #89)
- Message bump / goal bump physics animations
- No-duplicate commentary, Dani facility observations

### ✅ Polish Batch 2
- **Issues:** #57, #59, #62, #81, #82, #83, #84
- **Status:** MERGED (PR #82)
- Owner's Box commentary, pre-match overlay, transfer market
- Club identity, reputation, news ticker, season arc

---

## Current Priority Queue

### 1. 🔜 Season-End Experience
- **Issue:** #91
- **Priority:** HIGH — season loop completeness
- Final table reveal, awards, promotion/relegation moment
- "Next season" teaser

### 2. 🔜 Inbox Overflow Fix
- **Issue:** #92
- **Priority:** HIGH — UX bug
- Multiple events stacking on same week overflows inbox

### 3. 🔜 Stadium View — Isometric Facility View
- **Issue:** #87
- **Priority:** MEDIUM — Phase 7 foundation
- Facility info panels and upgrade actions from isometric view

### 4. 🔜 Math Challenge Difficulty Scaling
- **Issue:** #86
- **Priority:** MEDIUM — educational quality
- Early challenges too easy, late ones don't stretch

### 5. 🔜 Sponsor Negotiation
- **Issue:** #80
- **Priority:** MEDIUM — decision density
- Val presents deals, negotiate terms via maths challenge

---

## Backlog (Ordered by Theme)

**Gameplay depth:**
- #70 Formation tactics
- #71 Transfer windows
- #72 Dynamic sponsors
- #73 Local derbies
- #74 Rival managers
- #75 Board objectives
- #76 Morale system
- #77 Youth academy
- #78 Player development
- #79 Scout report deep-dive

**Visual / Technical:**
- #66 Phase 7b construction animations
- #67 Chromebook performance audit
- #68 Accessibility audit
- #69 Save/load system

See BACKLOG.md for full feature roadmap.
