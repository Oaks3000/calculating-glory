# Session Progress - 2026-03-23

## Session Goals
- Fix #30 publicPotential semantics (noisy read of truePotential)

## Completed Work

### 1. publicPotential semantics — #30 (PR #67) ✅
- `squad-generator.ts` and `free-agent-generator.ts` updated: curve/truePotential now computed first; `publicPotential = getScoutedPotential(player, 0)` — a ±15 noisy read of `truePotential` at level-0 scout
- `playerId` hoisted above the return statement so it can be passed into `getScoutedPotential` before the object literal
- Old: independent `rng.nextInt()` roll completely unrelated to actual player potential
- New: signals are correlated — a scout upgrade meaningfully narrows the gap between what you see and what's real
- `scout-target-generator.ts` skipped — already uses `getScoutedPotential()` at display time
- 441 domain tests green; TypeScript clean

## Architecture Notes

- RNG sequence shift: removing the `rng.nextInt(25, 55)` / `rng.nextInt(38, 82)` calls shifts downstream RNG draws for morale, contractExpiresWeek, etc. Accepted — no real users yet, and correctness > reproducibility at this stage.
- `getScoutedPotential` is in `types/facility.ts` (exported alongside `ScoutNetwork` config) — import path is `'../types/facility'` from generators.

## Current Status

### ✅ Working
- PR #67 merged; main is clean
- 441 domain tests green
- TypeScript clean (pre-existing inboxUtils fixture issue only)

### 🟡 In Progress
- Nothing

### 🔴 Blocked
- Nothing

## Build Commands / Key Files

```bash
# Dev server
npm run dev --workspace=@calculating-glory/frontend

# Domain tests (from worktree)
cd packages/domain && npm test

# Frontend tests
cd packages/frontend && npx vitest run

# Domain dist rebuild (must be from worktree, not main project)
cd packages/domain && npm run build
```

Key files touched this session:
- `packages/domain/src/data/squad-generator.ts` — publicPotential derivation
- `packages/domain/src/data/free-agent-generator.ts` — publicPotential derivation

## Next Session Goals

1. **Multiple leagues** — League One NPC team data, division-aware match sim, promotion/relegation opponent pool swap
2. **resetGame() UI** — New Game button (no home for it yet)
3. **NPC strength evolution** — use previousLeagueTable to modestly adjust NPC AI strength each season

---

**Status**: #30 shipped (PR #67). publicPotential is now a correlated noisy read of truePotential. 441 domain tests green. Next: multiple leagues.
