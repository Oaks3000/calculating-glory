# Quick Reference Card

## 🏃 Getting Started (3 steps)
```bash
1. Copy files to Claude Code
2. ./setup.sh
3. Open docs/WEEK1_CHECKLIST.md
```

## 📖 Documentation Order
1. `CLAUDE_CODE_SETUP.md` (start here, 5 min)
2. `docs/GETTING_STARTED.md` (details, 15 min)
3. `docs/WEEK1_CHECKLIST.md` (your tasks)
4. `docs/CONTEXT.md` (reference, 48 pages)

## 🔨 Week 1 Build Order
1. Money utilities (`/money/utils.ts`)
2. Event types (`/events/types.ts`)
3. Command types (`/commands/types.ts`)
4. Match simulation (`/simulation/match.ts`)
5. Event reducers (`/reducers/index.ts`)
6. Command handlers (`/commands/handlers/`)
7. Validation rules (`/validation/rules.ts`)
8. Projection builders (`/projections/builders.ts`)

## ⌨️ Essential Commands
```bash
npm test               # Run all tests
npm test:watch         # Auto-run on changes
npm run build          # Compile TypeScript
npm test:determinism   # Golden tests only
npm test -- --coverage # With coverage
```

## ⚠️ The 5 Critical Don'ts
1. ❌ NO floating point for money (use pence)
2. ❌ NO state mutations (return new objects)
3. ❌ NO Math.random() (use seeded RNG)
4. ❌ NO DOM/browser APIs (must work in Node)
5. ❌ NO `any` types (proper TypeScript)

## ✅ The 3 Must-Haves
1. ✅ Pure functions (no side effects)
2. ✅ Integer math (pence, not pounds)
3. ✅ Deterministic (seeded randomness)

## 🎯 Week 1 Exit Test
Can you run this test and have it pass?
```typescript
const cmd = { type: 'MAKE_TRANSFER', ... };
const result = handler.handle(cmd, state);
store.append(result.events);
const newState = buildProjections(store.events);
expect(newState.budget).toBe(expectedBudget);
```

## 🧪 Golden Test Pattern
```typescript
const fixtures = [
  { input: {...}, expected: {...} },
  // More fixtures
];

fixtures.forEach(({ input, expected }) => {
  it(`works for ${JSON.stringify(input)}`, () => {
    const result = fn(input);
    expect(result).toEqual(expected);
  });
});
```

## 📦 Package Locations
- Types: `packages/domain/src/types/`
- Commands: `packages/domain/src/commands/`
- Events: `packages/domain/src/events/`
- Simulation: `packages/domain/src/simulation/`
- Tests: Co-located with source

## 💡 Pro Tips
- Start with one feature end-to-end
- Write tests first
- Check determinism often
- Use TypeScript types heavily
- Keep functions small and pure

## 🆘 Stuck? Check:
1. `docs/GETTING_STARTED.md` (patterns)
2. Existing tests (examples)
3. Type definitions (guidance)
4. `docs/CONTEXT.md` (why decisions)

## 🎯 Success = These 3 Work
1. Transfer with math accuracy
2. Week simulation (deterministic)
3. League table updates correctly

---
**Read `PROJECT_HANDOFF.md` for full details**
