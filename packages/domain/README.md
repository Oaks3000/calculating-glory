# Football Club Manager - Educational Maths Game

An immersive football club management game designed to teach Year 7 (ages 11-12) mathematics through strategic gameplay. Players manage a League Two club, making financial and operational decisions that require real mathematical problem-solving.

## Project Overview

**Educational Goal:** Improve Year 7 and early Year 8 maths skills through engaging, contextual practice

**Game Concept:** Manage a struggling League Two football club through a single season, making mathematical decisions that affect club resources, which indirectly impact on-field performance.

**Key Design Principles:**
- Mathematics is integral to decision-making, not artificially inserted
- Wrong answers create suboptimal outcomes (budget drain, missed opportunities) not game-over states
- Event-sourced architecture enables timeline replay, "what if" analysis, and adaptive difficulty
- Built for future multiplayer from day one (server-authoritative design patterns)

## Architecture

### Event-Sourced, Command-Driven Design

```
Commands → Events → Projections → UI
```

- **Commands:** Player actions (MakeTransfer, UpgradeFacility, SimulateWeek)
- **Events:** What happened (TransferCompleted, BudgetUpdated, MatchSimulated)
- **Projections:** Derived views (league table, finances, board confidence)

This architecture supports:
- Complete audit trail for adaptive learning
- Replay and "what if" analysis
- Clean multiplayer migration path (V2)
- Deterministic simulation across platforms

### Project Structure

```
/packages
  /domain              # Shared game logic (portable: browser + Node.js)
    /commands          # Command definitions & validators
    /events            # Event schema & types
    /reducers          # Pure state reducers (events → state)
    /simulation        # Deterministic match simulation
    /validation        # Business rules & constraints
    /money             # Integer math utilities (pence-based)
    /test              # Golden test suite for determinism
    
  /frontend            # React UI (V1 single-player)
    /src
      /components      # UI components
      /api-client      # Command dispatcher (local in V1)
      /projections     # Derive views from event log
      /persistence     # Versioned localStorage
      /problems        # Maths problem generator
      /hooks           # React hooks
      /utils           # Frontend utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies for all packages
npm install

# Run tests
npm test

# Start development server
npm run dev
```

### Development Workflow

**Week 1: Domain Package Foundation**
- Event-sourced command/event architecture
- Integer money math utilities
- Deterministic match simulation
- Golden test suite

**Week 2: Game Loop & UI**
- React components
- Command dispatcher
- Event store with versioned persistence
- Projection builders

**Week 3: Educational Systems**
- Math problem generator
- Progressive hint system
- Tutorial flows
- Adaptive difficulty telemetry

**Week 4: Content & Polish**
- Full season structure
- All scenarios (transfers, facilities, staff)
- Narrative elements
- Testing and optimization

## Key Technical Decisions

### Integer Money Math
All monetary values stored in pence (not pounds) to avoid floating-point errors:
```javascript
const budget = 50000000; // £500,000 in pence
```

### Deterministic Simulation
Match results use seeded RNG for reproducibility:
```javascript
const result = simulateMatch(teamA, teamB, "seed123");
// Always produces same result with same seed
```

### Event Log as Source of Truth
Game state derived from events, not stored directly:
```javascript
const events = [
  { type: "TRANSFER_COMPLETED", data: {...} },
  { type: "BUDGET_UPDATED", data: {...} },
  { type: "MATH_ATTEMPT_RECORDED", data: {...} }
];
const gameState = buildProjections(events);
```

### Versioned Persistence
LocalStorage saves include schema version and migrations:
```javascript
{
  version: 1,
  checksum: "abc123",
  events: [...]
}
```

## Future: V2 Multiplayer

V1 architecture enables clean migration to multiplayer:

**What Changes:**
- Backend server added (same domain code runs server-side)
- PostgreSQL event store replaces localStorage
- WebSocket for real-time transfer bidding
- Authentication and authorization

**What Stays the Same:**
- All React UI components
- All domain logic (commands, events, reducers)
- Game state schema
- Educational systems

## Testing Strategy

### Unit Tests
- Money math utilities
- Command validators
- Event reducers
- Pure functions

### Integration Tests  
- Command → Event → Projection flow
- Save/load with migrations
- Problem generation

### Determinism Tests (Golden Suite)
- Match simulation produces identical results with same seed
- Budget calculations are exact
- No platform-specific behavior

### Educational Tests
- Adaptive difficulty responds correctly to performance
- Hints trigger appropriately
- Tutorial flows work as designed

## Documentation

- `/docs/CONTEXT.md` - Full design context and decisions
- `/docs/ARCHITECTURE.md` - Technical architecture details
- `/docs/CURRICULUM.md` - Year 7 maths coverage
- `/docs/GAME_DESIGN.md` - Season structure and mechanics
- `/packages/domain/README.md` - Domain package documentation

## Contributing

### Code Style
- TypeScript for type safety
- Pure functions where possible
- Comprehensive JSDoc comments
- Unit tests for all business logic

### Commit Messages
Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `test:` Test additions/changes
- `docs:` Documentation
- `refactor:` Code restructuring

## License

Educational use only - not for commercial distribution.

## Contact

Questions? Check `/docs/CONTEXT.md` for full background and design rationale.
