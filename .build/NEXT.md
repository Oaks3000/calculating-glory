---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-04-03"
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

## Recently Completed (PRs #95–100, merged 2026-04-03)

### ✅ NPC Message System
- **Issue:** #95
- **Status:** MERGED (PR #96)
- Kev, Val, Marcus messages wired into Command Centre inbox
- Message routing by sender with NPC avatar chips

### ✅ Inbox Overflow Partial Fix
- **Issue:** #92 (partial)
- **Status:** MERGED (PR #97)
- Pending decisions capped at 2 in InboxCard preview
- PREVIEW_LIMIT = 4 controls total items shown

### ✅ Post-Match Report Screen
- **Issue:** #81
- **Status:** MERGED (PR #98)
- Full post-match summary after Owner's Box concludes

### ✅ Owner's Box Phone-Screen UI
- **Issue:** #91 (partial)
- **Status:** MERGED (PR #99)
- Mobile/phone-screen UI polish for Owner's Box

### ✅ Commercial Facilities Panel
- **Issue:** #87 (partial)
- **Status:** MERGED (PR #100)
- Commercial facility types open Val's ClubCommercialSlideOver
- Groups CLUB_COMMERCIAL, FOOD_AND_BEVERAGE, FAN_ZONE, GROUNDS_SECURITY

---

## Current Priority Queue

### 1. 🔄 Math Challenge Difficulty Scaling
- **Issue:** #86
- **Priority:** HIGH — educational quality
- Progressive session difficulty: start D1, unlock D2 after 3 correct D1, unlock D3 after 3 correct D2
- Brief unlock message in chat ("tougher challenges incoming")
- Cap by MAX_DIFFICULTY_BY_LEVEL per curriculum level

### 2. 🔜 Sponsor Negotiation
- **Issue:** #80
- **Priority:** MEDIUM — decision density
- Val presents deals, negotiate terms via maths challenge

### 3. 🔜 Inbox Overflow — Full Fix
- **Issue:** #92
- **Priority:** MEDIUM — remaining stacking edge cases
- Check NPC messages + pending events + news all showing correctly within PREVIEW_LIMIT

### 4. 🔜 Stadium View — Remaining Facility Panels
- **Issue:** #87 (remaining)
- **Priority:** MEDIUM
- Training, Medical, Scout, Youth Academy panels from isometric view

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
