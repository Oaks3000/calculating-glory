# Quick Start - Claude Code Setup

## What You're Getting

A fully structured TypeScript/React project for the Football Club Manager educational game with:

✅ **Monorepo structure** (workspaces for domain + frontend)
✅ **Event-sourced architecture** ready to build
✅ **Type definitions** for all game entities
✅ **Test framework** configured (Jest)
✅ **Build pipeline** configured (TypeScript)
✅ **Documentation** (context, getting started, architecture)

## Open in Claude Code

1. **Open Claude Code**
2. **Create new repository** or **open existing folder**
3. **Copy all project files** into the repository
4. **Run setup script:**
   ```bash
   ./setup.sh
   ```

## File Structure You're Getting

```
calculating-glory/
├── packages/
│   └── domain/               # Week 1 focus
│       ├── src/
│       │   ├── types/       # ✅ COMPLETE - Game entities
│       │   ├── commands/    # 🔨 TO BUILD
│       │   ├── events/      # 🔨 TO BUILD
│       │   ├── reducers/    # 🔨 TO BUILD
│       │   ├── simulation/  # 🔨 TO BUILD
│       │   ├── validation/  # 🔨 TO BUILD
│       │   └── money/       # 🔨 TO BUILD
│       ├── package.json     # ✅ Configured
│       ├── tsconfig.json    # ✅ Configured
│       └── jest.config.js   # ✅ Configured
│
├── docs/
│   ├── CONTEXT.md           # ✅ Full design document
│   └── GETTING_STARTED.md   # ✅ Detailed guide
│
├── package.json             # ✅ Root workspace
├── README.md                # ✅ Project overview
├── setup.sh                 # ✅ Quick setup
└── .gitignore              # ✅ Configured

✅ = Complete and ready
🔨 = Ready to build (structure in place)
```

## What's Already Done

### Type Definitions (✅ Complete)
All TypeScript types defined in `/packages/domain/src/types/`:
- `game-state.ts` - Core game state and command/event types
- `club.ts` - Club representation and strength calculations
- `player.ts` - Player stats and utility functions
- `staff.ts` - Coaching staff types
- `facility.ts` - Facilities and ROI calculations
- `league.ts` - League table and match types

These provide the foundation for everything else.

### Configuration (✅ Complete)
- TypeScript configured for strict mode
- Jest configured for testing
- Workspace structure set up
- Build pipeline ready
- Package dependencies specified

## What to Build Next (Week 1)

### 1. Money Utilities
**Location:** `/packages/domain/src/money/utils.ts`

**Need:**
```typescript
// Convert pounds to pence
export function toPence(pounds: number): number;

// Convert pence to pounds
export function fromPence(pence: number): number;

// Format for display
export function formatMoney(pence: number): string;

// Add/subtract safely
export function addMoney(a: number, b: number): number;
```

### 2. Event Types
**Location:** `/packages/domain/src/events/types.ts`

**Need:** Define all event types:
- `TRANSFER_COMPLETED`
- `BUDGET_UPDATED`
- `MATCH_SIMULATED`
- `FACILITY_UPGRADED`
- `STAFF_HIRED`
- `MATH_ATTEMPT_RECORDED`
- etc.

### 3. Command Types
**Location:** `/packages/domain/src/commands/types.ts`

**Need:** Define all command types:
- `MAKE_TRANSFER`
- `UPGRADE_FACILITY`
- `HIRE_STAFF`
- `SIMULATE_WEEK`
- etc.

### 4. Deterministic Match Simulation
**Location:** `/packages/domain/src/simulation/match.ts`

**Need:**
```typescript
export function simulateMatch(
  homeTeam: Team,
  awayTeam: Team,
  seed: string
): MatchResult;
```

With golden tests to verify determinism.

### 5. Event Reducers
**Location:** `/packages/domain/src/reducers/`

**Need:** Pure functions to apply events to state:
```typescript
export function reduceEvent(
  state: GameState,
  event: GameEvent
): GameState;
```

### 6. Command Handlers
**Location:** `/packages/domain/src/commands/handlers/`

**Need:** Business logic that validates and produces events:
```typescript
export function handleCommand(
  command: Command,
  state: GameState
): CommandResult;
```

## Development Approach

**Start with the flow:**
1. Pick one feature (e.g., "Make Transfer")
2. Define command type
3. Define event types it produces
4. Write handler (command → events)
5. Write reducers (events → state)
6. Write tests
7. Repeat for next feature

**Keep it pure:**
- No mutations
- No side effects
- Deterministic
- Well tested

## Testing Strategy

### Golden Tests (Critical)
For deterministic functions, create golden test suites:

```typescript
describe('Match Simulation - Golden Tests', () => {
  const fixtures = [
    {
      homeTeam: {...},
      awayTeam: {...},
      seed: 'seed1',
      expected: { homeGoals: 2, awayGoals: 1 }
    },
    // More fixtures
  ];
  
  fixtures.forEach(({ homeTeam, awayTeam, seed, expected }) => {
    it(`produces expected result for seed ${seed}`, () => {
      const result = simulateMatch(homeTeam, awayTeam, seed);
      expect(result).toEqual(expected);
    });
  });
});
```

## Commands Reference

```bash
# Initial setup
./setup.sh

# Development
cd packages/domain
npm test:watch          # Auto-run tests on changes
npm run build           # Build TypeScript

# Testing
npm test               # All tests
npm test:determinism   # Only determinism tests
npm test -- --coverage # With coverage report
```

## Key Architectural Reminders

1. **Integer Money Math** - All amounts in pence
2. **Seeded RNG** - All randomness deterministic
3. **Event Sourcing** - State derived from events
4. **Pure Functions** - No mutations, no side effects
5. **Server Authority** - Design like server validates everything

## Resources

- **Full context:** `docs/CONTEXT.md`
- **Detailed guide:** `docs/GETTING_STARTED.md`
- **Domain API:** `packages/domain/README.md`
- **Type reference:** `packages/domain/src/types/`

## Next Steps After Week 1

Once domain package is solid:
- **Week 2:** Build React frontend
- **Week 3:** Educational systems (problems, hints, tutorials)
- **Week 4:** Content and polish

---

Ready to build! 🎮⚽
