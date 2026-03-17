# Session Handover — 2026-03-17

## What Was Done This Session

### 1. Design decisions locked for Phase 5.1 & 5.2

**Owner/CEO vs. training choice framing resolved:**
- Player = owner/CEO (not manager). Training focus is a *club-wide directive to coaching staff*, not the owner on the pitch. Manager picks the XI; owner sets philosophy and weekly priorities.
- Manager quality (future: #29) determines how well directives are translated into results.

**Squad model confirmed:**
- 24 total squad slots; 16 inherited (weak, Pro-Evo names); 8 open
- Formation sets *target composition*, not hard slot requirements
- Filling the formation properly means selling/releasing inherited players to make room

**Pre-season entry:**
- Replaces week 19 arbitrary start. New game begins at pre-season (week 0)
- Narrative: just promoted from non-leagues, inherited a weak squad, need to invest to avoid immediate relegation

### 2. Issues filed

| # | Title |
|---|-------|
| #29 | design: Manager creation — strengths, weaknesses, man-management, reputation, fan engagement |
| #30 | design: Player attribute wiring into match simulation |
| #31 | design: Scout facility unlocking truePotential visibility |
| #32 | design: Club-owned players in transfer market (v2 transfers) |
| #34 | design: Owner forced out — cascade failure re-entry mechanic |
| #35 | design: NPC clubs as limited agents — transfers, finances, dynamism |
| #36 | design: NPC clubs poaching players from player's squad |

**Key design decisions captured in issue comments:**
- **#34 re-entry**: cascade failure model — your collapse triggers bottom NPC club failing within 1–2 weeks; player parachutes in mid-season at rock bottom, no waiting. Business Acumen persists, reputation malus attached.
- **#35 updates**: (a) selling to NPCs = transfer fee received; (b) NPC moves appear in news ticker; transfer-listed players (not free agents) noted for v2
- **#36 poaching**: trigger on player quality + reputation gap + teamwork score; 4 response options; teamwork degrades if unhappy → squad-wide performance hit → forced sale

### 3. Phase 5.1 — Pre-season flow (PR #33, OPEN)

**Branch:** `claude/cool-kalam` → `feat/phase5-preseason`

- Pre-season screen (replaces week 19 entry): narrative intro + formation picker + inherited squad view
- Formation picker: 6 formations (4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 5-3-2, 4-5-1), each with style tag + description
- `SET_PREFERRED_FORMATION` command → `PREFERRED_FORMATION_SET` event → `club.preferredFormation`
- `FORMATION_CONFIG` with `slots` (ideal XI per position) + `recruitmentPriority` + `formationCoverage()` helper
- Auto-generated inherited squad: 16 players, Pro-Evo names, deliberately weak (~45–55 OVR), varied ages + contracts
- `InheritedSquad.tsx`: position-grouped squad grid, OVR badges, contract expiry, "Enter Season" CTA
- `club.squadCapacity = 24`

### 4. Phase 5.2 — Transfer window (PR #37, OPEN)

**Branch:** `feat/phase5-transfers` (built on top of Phase 5.1 branch)

- **Player attributes**: `attack`, `defence`, `teamwork`, `charisma`, `publicPotential` (visible); `truePotential` (hidden — future scouting mechanic)
- **Free agent pool**: 60 seeded players (`free-agent-generator.ts`), Pro-Evo names, attribute variance by position tier
- **`TransferMarketSlideOver.tsx`**: two-tab UI (Free Agents / My Squad), position filter, sort by rating/attack/defence/wage
- **Sign mechanic**: confirm flow, wage budget guard, 24-slot cap guard → `SIGN_FREE_AGENT` command
- **Release mechanic**: contract expiry tracked; early release = fee (weeks remaining × wage × 0.5); expired/free agent = free → `RELEASE_PLAYER` command
- **269 tests green**, TypeScript clean

**What's NOT yet in the transfer market (punted):**
- Formation recruitment gap panel (shows target vs. current squad by position) — add in Phase 5.3 polish
- NPC clubs consuming free agents at season start (#35)
- Selling to NPC clubs (#35)

---

## Current State

### ✅ Done
- Phase 1–4: all merged to main
- Phase 5.1: committed on `claude/cool-kalam`, PR #33 open
- Phase 5.2: committed on `feat/phase5-transfers`, PR #37 open (targets #33 branch)
- 269 domain tests green; TypeScript clean

### 🟡 PR merge order
1. Merge PR #33 (Phase 5.1) → main first
2. Then rebase `feat/phase5-transfers` onto new main and merge PR #37

### 🔴 Stale worktrees (safe to delete)
- `zealous-sutherland` (Phase 4, merged)
- `thirsty-archimedes` (stale)
- `cool-kalam` (active — Phase 5.1 PR #33)
- `phase5-transfers` (active — Phase 5.2 PR #37)

---

## Phase 5.3 — What's Next

Priorities after Phase 5.1 + 5.2 are merged:

1. **Formation recruitment gap panel** in transfer market — compact banner showing formation target (e.g. 4-4-2 needs 2 FWD) vs. squad count per position, with shortage/surplus indicators. Uses existing `formationCoverage()` + `FORMATION_CONFIG[formation].slots` already in domain.

2. **Replace League Two real team names** with Pro-Evo analogues — naming convention is locked in memory (`project_naming_convention.md`). All existing real names in `league-two-teams.ts` and team seed data need replacing.

3. **Hub tile action flag rerouting** (#27) — low urgency, cosmetic fix

4. **Construction lag + staged build visuals** (#28) — medium priority, affects facility upgrade feel

5. **NPC season-start transfer activity** (#35) — NPCs consume ~30 free agents from pool at season start before player browses; makes transfer window feel real

---

## Worktree Status

| Worktree | Branch | Status |
|----------|--------|--------|
| `cool-kalam` | `claude/cool-kalam` | Phase 5.1, PR #33 open |
| `phase5-transfers` | `feat/phase5-transfers` | Phase 5.2, PR #37 open |
| `zealous-sutherland` | stale | safe to delete |
| `thirsty-archimedes` | stale | safe to delete |

---

## Build Commands

```bash
# ALWAYS rebuild domain dist in MAIN project after domain source changes
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# Tests
bash -c "cd /Users/oakleywalters/Projects/calculating-glory/.claude/worktrees/phase5-transfers/packages/domain && npm test"

# TypeScript check
bash -c "cd /Users/oakleywalters/Projects/calculating-glory/.claude/worktrees/phase5-transfers/packages/frontend && npx tsc --noEmit"
```

## How to Start Next Session

```bash
# 1. Sync main (after PRs #33 and #37 are merged)
git -C /Users/oakleywalters/Projects/calculating-glory pull origin main

# 2. Rebuild domain dist
cd /Users/oakleywalters/Projects/calculating-glory/packages/domain && npm run build

# 3. Create new worktree for Phase 5.3
git -C /Users/oakleywalters/Projects/calculating-glory worktree add \
  .claude/worktrees/<name> -b feat/phase5-polish origin/main

# 4. TypeScript check before writing any code
bash -c "cd /Users/oakleywalters/Projects/calculating-glory/.claude/worktrees/<name>/packages/frontend && npx tsc --noEmit"
```

## Key Files (for Phase 5.3 context)

```
packages/domain/src/
  types/
    player.ts               — Player, PlayerAttributes, truePotential, contractExpiresWeek
    formation.ts            — Formation, FORMATION_CONFIG, formationCoverage()
    club.ts                 — Club (preferredFormation, squad, squadCapacity, wageBudget, transferBudget)
    game-state-updated.ts   — GameState (freeAgentPool: Player[])
  data/
    free-agent-generator.ts — 60 seeded free agents with attribute variance by position tier
    squad-generator.ts      — 16 inherited weak players
    league-two-teams.ts     — ⚠️ still has real team names — needs Pro-Evo replacement

packages/frontend/src/components/
  pre-season/
    PreSeasonScreen.tsx     — Entry flow (narrative + formation + squad)
    FormationPicker.tsx     — 6 formations, style tags, SET_PREFERRED_FORMATION dispatch
    InheritedSquad.tsx      — Position-grouped squad grid, contract badges, Enter Season CTA
  transfer-market/
    TransferMarketSlideOver.tsx — 2-tab market (Free Agents / My Squad), filters, sign/release
  command-centre/
    CommandCentre.tsx       — Wires TransferMarketSlideOver to hub tile
```

---

**Status**: Phase 5.1 (PR #33) and 5.2 (PR #37) open and ready for review. Merge in order: #33 first, rebase #37 onto main, then merge #37. Phase 5.3 starts with formation gap panel + Pro-Evo team name replacement.
