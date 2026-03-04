# Getting Started in Claude Code

Welcome! This guide will help you get the Calculating Glory project running in Claude Code.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm or yarn
- Claude Code (duh, you're here!)

## Initial Setup

### 1. Clone/Initialize the Repository

If starting fresh in Claude Code:
```bash
# Navigate to your projects directory
cd ~/projects

# Create project directory
mkdir calculating-glory
cd calculating-glory

# Initialize git
git init
```

### 2. Install Dependencies

From the project root:
```bash
# Install all workspace dependencies
npm install
```

This will install dependencies for:
- Root workspace
- `/packages/domain` (game logic)
- `/packages/frontend` (React UI) - coming in Week 2

### 3. Verify Setup

Test that the domain package builds:
```bash
cd packages/domain
npm run build
```

Run tests:
```bash
npm test
```

## Project Structure Overview

```
calculating-glory/
├── packages/
│   ├── domain/              # Portable game logic (Week 1)
│   │   ├── src/
│   │   │   ├── commands/    # Command definitions
│   │   │   ├── events/      # Event types
│   │   │   ├── reducers/    # State reducers
│   │   │   ├── simulation/  # Match simulation
│   │   │   ├── validation/  # Business rules
│   │   │   ├── money/       # Integer math utils
│   │   │   └── types/       # TypeScript types
│   │   ├── __tests__/       # Test files
│   │   └── package.json
│   │
│   └── frontend/            # React UI (Week 2)
│       └── ...
│
├── docs/                    # Documentation
│   ├── CONTEXT.md          # Full design context
│   ├── GETTING_STARTED.md  # This file
│   └── ARCHITECTURE.md     # Technical details
│
├── package.json            # Root workspace config
└── README.md              # Project overview
```

## Development Workflow

### Week 1: Domain Package Foundation

Our current focus is building the `/packages/domain` package with:

1. **Event-sourced architecture**
   - Command definitions
   - Event types
   - Event reducers

2. **Integer money math**
   - All monetary values in pence
   - Utility functions

3. **Deterministic simulation**
   - Match simulation with seeded RNG
   - Golden test suite

4. **Core types**
   - GameState
   - Club, Player, Staff, Facility
   - League, Match

### Running Tests

```bash
# All tests
npm test

# Watch mode (auto-runs on changes)
npm test:watch

# Only determinism tests
npm test:determinism

# With coverage
npm test -- --coverage
```

### Building

```bash
# Build domain package
npm run build

# This compiles TypeScript to /dist
# Creates type definitions (.d.ts files)
```

### File Organization

When adding new features:

**Commands**: `/packages/domain/src/commands/`
- Define in `types.ts`
- Validate in `validators.ts`
- Handle in `handlers/command-name.ts`

**Events**: `/packages/domain/src/events/`
- Define in `types.ts`
- Document in event schema

**Reducers**: `/packages/domain/src/reducers/`
- Pure functions that apply events to state
- One reducer per event type usually

**Tests**: Co-locate with source
- `__tests__/` directory or
- `.test.ts` suffix

## Common Tasks

### Adding a New Command

1. Define type in `/commands/types.ts`:
```typescript
export interface MakeTransferCommand {
  type: 'MAKE_TRANSFER';
  playerId: string;
  offerAmount: number;
  // ...
}
```

2. Add validator in `/commands/validators.ts`:
```typescript
export function validateMakeTransfer(
  command: MakeTransferCommand,
  state: GameState
): ValidationResult {
  // Validation logic
}
```

3. Create handler in `/commands/handlers/make-transfer.ts`:
```typescript
export function handleMakeTransfer(
  command: MakeTransferCommand,
  state: GameState
): CommandResult {
  // Business logic
  return {
    events: [...]
  };
}
```

4. Write tests in `/commands/__tests__/make-transfer.test.ts`

### Adding a New Event

1. Define in `/events/types.ts`:
```typescript
export interface TransferCompletedEvent {
  type: 'TRANSFER_COMPLETED';
  timestamp: number;
  data: {
    playerId: string;
    actualCost: number;
  };
}
```

2. Add reducer in `/reducers/transfer.ts`:
```typescript
export function reduceTransferCompleted(
  state: GameState,
  event: TransferCompletedEvent
): GameState {
  return {
    ...state,
    budget: state.budget - event.data.actualCost
  };
}
```

3. Write tests

### Running Specific Tests

```bash
# Test a specific file
npm test -- match-simulation.test.ts

# Test a specific describe block
npm test -- -t "Match Simulation"

# Test with debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Key Development Principles

### 1. Pure Functions Only
```typescript
// ❌ Wrong - mutates state
function updateBudget(state: GameState, amount: number) {
  state.budget += amount;
  return state;
}

// ✅ Correct - returns new state
function updateBudget(state: GameState, amount: number): GameState {
  return {
    ...state,
    budget: state.budget + amount
  };
}
```

### 2. Integer Money Math
```typescript
// ❌ Wrong
const budget = 500000.00;

// ✅ Correct (£500k in pence)
const budget = 50000000;
```

### 3. Deterministic Randomness
```typescript
import seedrandom from 'seedrandom';

// ✅ Always use seeded RNG
function simulateMatch(teamA: Team, teamB: Team, seed: string) {
  const rng = seedrandom(seed);
  const random = rng(); // 0-1
}
```

### 4. Comprehensive Tests
Every function should have:
- Unit tests for logic
- Edge case tests
- Golden tests for determinism (where applicable)

## Debugging Tips

### TypeScript Errors
```bash
# Check types without running tests
npx tsc --noEmit
```

### Test Failures
```bash
# Run tests in watch mode
npm test:watch

# Focus on one test
it.only('should do something', () => {
  // This test runs alone
});
```

### Import Issues
If you get import errors:
1. Check `tsconfig.json` paths
2. Ensure you're importing from correct location
3. Rebuild: `npm run build`

## Next Steps

Once Week 1 domain package is complete, we'll move to:

**Week 2: React Frontend**
- Create `/packages/frontend`
- Build UI components
- Connect to domain package
- Local command dispatcher

**Week 3: Educational Systems**
- Math problem generator
- Hint system
- Tutorials
- Adaptive difficulty

**Week 4: Content & Polish**
- Full season content
- Narrative elements
- Testing
- Optimization

## Getting Help

- Read `/docs/CONTEXT.md` for full design background
- Check `/packages/domain/README.md` for API docs
- Look at existing tests for examples
- Ask questions in Claude Code!

## Useful Commands Reference

```bash
# Root level (from /)
npm install              # Install all dependencies
npm test                # Run all tests
npm run build           # Build all packages

# Domain package (from /packages/domain)
npm test                # Run tests
npm test:watch          # Watch mode
npm test:determinism    # Golden tests only
npm run build           # Compile TypeScript
npm run lint            # Check code style

# Later: Frontend (from /packages/frontend)
npm run dev             # Start dev server
npm run build           # Production build
npm test                # Component tests
```

---

Happy coding! Remember: Pure functions, integer math, deterministic simulation. 🎮⚽📊
