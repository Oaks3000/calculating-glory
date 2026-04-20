# Session Progress — 2026-04-20

## Session Goals
- Tackle #111 — progressive disclosure / new-player ramp
- Re-tone the intro away from a money-first opening toward ambition-first (explicit feedback mid-session)
- Colour-code NPCs so the speaker is identifiable at a glance (explicit feedback mid-session)
- Add hybrid jargon explainers so Year 7/8 readers understand terms like "runway" (explicit feedback mid-session)
- Merge, update .build docs

## Completed Work

### 1. Ambition-first intro + guided ramp + jargon explainers — #111 ✅ (PR #140, merged 2026-04-20)

**New files:**
- `packages/frontend/src/lib/npcs.ts` — shared NPC dictionary with semantic colour keys (emerald / sky / amber / violet) and static Tailwind class map
- `packages/frontend/src/lib/guidedTasks.ts` — `getGuidedTasks(state, events)`, derives 4-task completion from existing event log
- `packages/frontend/src/lib/glossary.ts` — 5 terms with NPC voice, short + full + up/down explainers
- `packages/frontend/src/components/command-centre/GuidedTaskCard.tsx` — 4-task checklist UI on the Overview
- `packages/frontend/src/components/shared/TermInfo.tsx` — tappable label + ⓘ chip; first tap opens full NPC modal, subsequent taps show short popup with expand link

**Modified files:**
- `packages/frontend/src/App.tsx` — routes new-game to `intro` or `game` based on onboarding mode
- `packages/frontend/src/lib/introState.ts` — adds `getOnboardingMode()` / `setOnboardingMode()` and glossary seen tracking (`hasSeenTerm` / `markTermSeen`)
- `packages/frontend/src/components/menu/MenuScreen.tsx` — new "Meet the team / Skip intro" step after club setup
- `packages/frontend/src/components/intro/IntroScreen.tsx` — slimmed 23 → 10 steps; Kev opens with ambition; Val reframes money as enabler; stadium tour removed; uses `NPCS` dict
- `packages/frontend/src/components/intro/NpcMessage.tsx` — optional `colour` prop for left-border accent + avatar ring + name tint
- `packages/frontend/src/components/command-centre/sections/OverviewSection.tsx` — mounts `GuidedTaskCard` at top when guided mode + tasks outstanding
- `packages/frontend/src/components/command-centre/HeadlineStats.tsx` — wires `TermInfo` on Confidence + Budget
- `packages/frontend/src/components/owner-office/OwnerOffice.tsx` — wires `TermInfo` on Budget / Burn/wk / Board / Runway header chips
- `packages/frontend/src/components/pre-season/PreSeasonScreen.tsx` — wires `TermInfo` on Budget and Wage runway labels

### 2. .build Docs Updated ✅
- STATUS.md: Phase 14, progress 20%, PR #140 listed
- NEXT.md: PR #140 section at top; guided-mode follow-ups added to priority queue
- ROADMAP.md: Phase 14 added; remaining #111 work moved to current work
- BACKLOG.md: 5 new ✅ items for PR #140; PR #94 entry annotated (stadium tour retired)
- SESSION_START.md: this file

## Architecture Notes

- `NPC_COLOUR_CLASSES` uses static Tailwind literals so the JIT scanner picks them up — dynamic template-string class construction is avoided by design
- Guided task completion is stateless — derived on-demand from existing events (`BUDGET_UPDATED` with `intro-sponsor-deal-option-*` reason, `MANAGER_HIRED`, `TRANSFER_COMPLETED` / `FREE_AGENT_SIGNED`, `FACILITY_UPGRADE_STARTED`). No new reducer state introduced.
- `TermInfo` keeps NPC tone inside the explainer — the modal reuses `NpcMessage` with the NPC's colour, so the speaker is consistent across intro, guided tasks, and glossary surfaces.
- Hybrid explainer: first view shows the full explainer (short + full + ↑/↓ rows) because the user hasn't seen the term before; subsequent views start with the short line and offer "Show full explainer →" to expand. Seen state tracked in `cg-glossary-seen-v1`.
- Skip mode routes past `IntroScreen` entirely — App.tsx goes directly from menu to `game`, and pre-season is rendered via the existing `phase === 'PRE_SEASON'` check.

## Known Gaps (tracked in NEXT.md)

- Progressive disclosure on `OverviewSection` while guided tasks are outstanding — not shipped
- Gating "Begin Season" on guided task completion — blocked on pre-season flow not exposing transfers or facility upgrades
- Glossary extension to Position / Morale / Formation / Free agent / Reputation — easy follow-up, just add entries to `GLOSSARY` and drop `TermInfo` on labels
- Domain test suite has 3 failing tests (transfers / reducer-match / manager) — pre-existing, unrelated to this PR

## Current Status

### ✅ Working
- Frontend TypeScript: 0 errors
- Frontend build: clean (vite build succeeds)
- Skip-intro routes past the intro to pre-season
- Guided-mode card appears on Command Centre, ticks off as tasks complete, hides when all 4 are done
- NPC bubbles show the correct accent across intro + guided task card + glossary explainer
- Glossary modal: first-view full explainer, subsequent short + expand link

### 🟡 Pending
- Guided-mode follow-ups listed above

### 🔴 Blocked
- "Begin Season" gating blocked on pre-season flow rework

## Next Session Goals

- Mobile layout (#130) or guided-mode follow-ups
- Consider extending glossary to the remaining jargon terms
- Raise a dedicated issue for the "pre-season flow exposes transfers + facilities" refactor

---

**Status**: PR #140 merged — ambition-first intro, NPC colour coding, skip mode, and hybrid jargon explainers all live. Phase 14 new-player ramp ~20% done (core narrative + explainer loop shipped; progressive disclosure + task gating deferred).
