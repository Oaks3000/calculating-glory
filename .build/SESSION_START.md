# Session Progress - 2026-03-24

## Session Goals
- League One NPC teams + division-aware opponent pool

## Completed Work

### 1. League One NPC teams + division-aware opponents (PR #68) ✅
- `LEAGUE_ONE_TEAMS` — 23 fictional Pro-Evo style League One clubs, baseStrength 55–78
- `getTeamsForDivision(division)` — returns correct NPC pool per division (L2 → L2 teams, L1/Champ/PL → L1 teams as placeholder)
- `handlePreSeasonStarted` rewritten to rebuild all 23 NPC entries from `getTeamsForDivision(state.division)` instead of just resetting stats — promoted clubs now face League One opponents next season
- NPC transfers (`handleNpcTransfers`), poaching events (`generatePoachAttempts`), scout target generation, and sell-to-NPC lookup all updated to use `getTeamsForDivision(state.division)`
- `generateScoutTarget` gains optional `division` param (defaults `'LEAGUE_TWO'`) — no test changes needed
- Championship/Premier League fall back to League One teams as placeholder until full tiers are built

### 2. publicPotential semantics (PR #67 — previous session) ✅
- Already shipped; included for completeness

## Architecture Notes

- **Division-aware NPC pool pattern**: `getTeamsForDivision(division)` is the single source of truth. Any new place that needs "who are the current league opponents?" should call this.
- **`handlePreSeasonStarted` rebuild**: Player entry is preserved by `clubId` lookup; all 23 NPC slots are rebuilt fresh. This is idempotent — same division = same clubs, different division = new clubs.
- **Match sim is NOT yet division-aware**: `generateAITeam()` still uses raw `baseStrength` ± 10. The higher L1 base strengths (55–78 vs L2's 35–65) will make matches harder automatically — but consider a strength floor or multiplier if it needs further tuning.

## Current Status

### ✅ Working
- PR #68 merged; main is clean
- 441 domain tests green
- TypeScript clean (pre-existing inboxUtils fixture issue only)

### 🟡 In Progress
- Nothing

### 🔴 Blocked
- Nothing

## Build Commands / Key Files

```bash
# Domain tests
cd packages/domain && npm test

# Frontend TypeScript check
cd packages/frontend && npx tsc --noEmit

# Domain dist rebuild (from worktree)
cd packages/domain && npm run build
```

Key files:
- `packages/domain/src/data/league-one-teams.ts` — new L1 NPC data
- `packages/domain/src/data/division-teams.ts` — getTeamsForDivision helper
- `packages/domain/src/reducers/index.ts` — handlePreSeasonStarted NPC rebuild
- `packages/domain/src/commands/handlers.ts` — NPC transfers + sell-to-NPC
- `packages/domain/src/simulation/events.ts` — poaching events
- `packages/domain/src/data/scout-target-generator.ts` — division param added

## Next Session Goals

1. **Division-aware match difficulty tuning** — observe if L1 NPC strength jump (55–78 vs L2's 35–65) is sufficient or if a strength multiplier per division is needed
2. **resetGame() UI** — New Game button somewhere in the frontend
3. **NPC strength evolution** — use previousLeagueTable finish to modestly adjust NPC AI strength each season (top 4 +2, bottom 4 −2)

---

**Status**: PR #68 merged. Promoted clubs now face League One opponents. 441 domain tests green. Match sim inherits harder opponents automatically via higher baseStrength values.
