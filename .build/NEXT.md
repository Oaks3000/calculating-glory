---
project: "Calculating Glory"
type: "build"
lastUpdated: "2026-04-12"
---

# Calculating Glory — Next Steps

> Living document. Updated after each merged PR.

---

## Recently Completed (PR #129, in review 2026-04-12)

### ✅ Command Centre UX/UI Overhaul
- **Issue:** #124
- **Status:** IN REVIEW (PR #129)
- Persistent sidebar (lg+) with Overview / Inbox / Squad / Transfers / Finances / Backroom / Stadium
- Fixed bottom tab bar (mobile) — 6 sections with unresolved-events badge on Inbox
- HeadlineStats: 3-stat strip (Position / Confidence / Budget) always above fold on overview
- OverviewSection: inbox-first stack, HeadlineStats → DataTiles → HubTiles → League Table + Squad
- Full-page sections: Inbox, Transfers (with pitch grid), Finances, Backroom, Squad
- FinancesSection: live ≈Nw wage runway counter that updates as wage reserve slider moves
- CommandCentre: reduced from 7 slide-over booleans to 3 (Negotiations, Practice, Learning Progress)
- Clicking FinancialHealthBar now navigates to Finances section (not budget slide-over)
- Backroom/Acumen DataTile clicks navigate to their sections (not slide-overs)

---

## Recently Completed (PR #123, merged 2026-04-12)

### ✅ Name Audit
- **Issues:** #40, #41
- **Status:** MERGED (PR #123)
- All 93 team names and 190+ player names reviewed across 8 data files
- Fixed `Kevin De Bruyne` → `Kelvin De Bryne` (was unchanged from real name)
- Resolved `sutbourne` ambiguity → Sutton United

### ✅ Backroom Staff Visibility
- **Issue:** #120
- **Status:** MERGED (PR #123)
- Fixed DataTiles bug: "Backroom Team" tile showed squad count, now shows staff X/5
- Manager section in BackroomTeamSlideOver with attributes + star rating
- Match impact bar: quantified staff (+0-12%) and manager (+0-6%) contributions

### ✅ Three-Pool Budget Model
- **Issues:** #61, #110
- **Status:** MERGED (PR #123)
- Replaced `transferBudget` + soft `wageBudget` cap with three real pools:
  - Transfer Fund (50%): player purchases, scout fees, sale proceeds
  - Infrastructure Fund (20%): facility upgrades
  - Wage Reserve (30%): weekly wages deducted, revenue flows in
- Board bailout: covers shortfall at 10% penalty from Transfer → Infrastructure
- `SET_BUDGET_ALLOCATION` command: only during transfer windows
- Runway-based validation: min 8 weeks for all wage commitments
- Budget allocation slider UI: three linked sliders in slide-over from Financial Health Bar

### ✅ News Ticker Speed
- **Issue:** #59
- **Status:** CLOSED (already fixed in PR #88, 147s→206s)

---

## Recently Completed (PR #102, merged 2026-04-03)

### ✅ Progressive Session Difficulty
- **Issue:** #86
- **Status:** MERGED (PR #102)
- Session starts at D1; unlock D2 after 3 correct, D3 after 3 correct at D2
- Capped by `MAX_DIFFICULTY_BY_LEVEL` per curriculum level
- D{n} badge visible on each challenge card

### ✅ NPC Cast Depth
- **Issue:** #85
- **Status:** MERGED (PR #102)
- 5 new template pools: `KEV_STREAK_WIN_5/LOSS_5`, `KEV_PROMOTION_ZONE`, `KEV_RELEGATION_ZONE`, `MARCUS_COMMERCIAL_OBS`
- W5/L5 streak with W3/L3 cascade (no double-firing)
- Kev table reaction: fires every 3 weeks in promo/relegation zone
- Marcus commercial observation: fires every 6 weeks

### ✅ Club Identity — NPC Personalisation
- **Issue:** #84
- **Status:** MERGED (PR #102)
- `[CLUB]` and `[STADIUM]` fill vars added to `generateNpcMessages`
- ~40% of entries across all NPC pools naturalise the club name/stadium
- Fixed TS6 deprecation errors (`ignoreDeprecations: "6.0"`) in both tsconfigs
- Fixed 3rd-person slip in `KEV_RELEGATION_ZONE`

### ✅ Season Arc Headlines in Ticker
- **Issue:** #83
- **Status:** MERGED (PR #102)
- Win streaks (3/5/7/9+), loss streaks (3/5/7+), unbeaten runs (5+)
- New season-best win detection (margin ≥ 3 and > previous best)
- Zone banners every 5 weeks when in promo/relegation zone
- Fixed latent bug: `leagueEntries` used inside `buildHeadlines()` without being a parameter

### ✅ Transfer Market Friction
- **Issue:** #82
- **Status:** MERGED (PR #102)
- "Hold firm" has real consequences: 0 rivals = accepts, 1 = 50/50, 2+ = rejects
- New `rejected` step: "Gone. X clubs were waiting — [name] chose elsewhere."
- Free agents with npcInterest ≥ 2 appear as 📰 RUMOUR headlines in ticker

### ✅ NPC Poaching — Frontend Wiring
- **Issue:** #36
- **Status:** MERGED (PR #102)
- Domain was complete; this wires the UI experience
- Player snapshot (name, position, OVR, wage) embedded in event metadata at generation
- `moraleEffect` now shown in EffectPills — reject/ignore morale penalties were hidden
- `isRiskyChoice` updated to consider morale
- Active poach bids → 🚨 BREAKING at front of ticker

### ✅ Construction Lag Visuals
- **Issue:** #28
- **Status:** MERGED (PR #102)
- Domain was complete; this wires the visual experience
- CoreUnit block height interpolates between old and new level during construction
- Level pips replaced by amber progress bar during construction
- FacilityCard shows progress bar with % complete
- Ticker: `FACILITY_UPGRADE_STARTED` + `FACILITY_CONSTRUCTION_COMPLETED` headlines

---

## Recently Completed (PRs #95–101, merged 2026-04-03)

### ✅ NPC Message System (PR #96)
- Kev, Val, Marcus messages wired into Command Centre inbox
- Message routing by sender with NPC avatar chips

### ✅ Inbox Overflow Partial Fix (PR #97)
- Pending decisions capped at 2 in InboxCard preview

### ✅ Post-Match Report Screen (PR #98)
- Full post-match summary after Owner's Box concludes

### ✅ Owner's Box Phone-Screen UI (PR #99)
- Mobile/phone-screen UI polish for Owner's Box

### ✅ Commercial Facilities Panel (PR #100)
- Commercial facility types open Val's ClubCommercialSlideOver

---

## Current Priority Queue

### 1. 🔜 Sponsor Negotiation
- **Issue:** #80
- **Priority:** HIGH — decision density
- Val presents weekly sponsorship deals
- Negotiate terms via maths challenge (percentage/ratio question gates a better deal)
- Accept/reject with visible financial impact

### 2. 🔜 Inbox Overflow — Full Fix
- **Issue:** #92
- **Priority:** MEDIUM
- Remaining stacking edge cases: NPC messages + pending events + news within PREVIEW_LIMIT
- Check for double-notification on poach + construction events

### 3. 🔜 Stadium View — Remaining Facility Panels
- **Issue:** #87 (remaining)
- **Priority:** MEDIUM
- Training Ground, Medical Centre, Scout Network, Youth Academy panels
- Commercial panels already done (PR #100)

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
