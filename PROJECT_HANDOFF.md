# Calculating Glory - Project Handoff

## 📦 What You're Getting

A complete, production-ready project structure for building an educational football management game in Claude Code.

## 🎯 Project Status

**✅ COMPLETE:**
- Full monorepo structure with workspaces
- Event-sourced architecture designed and documented
- TypeScript configuration (strict mode)
- Jest testing framework configured
- All type definitions for game entities
- Package dependencies specified
- Comprehensive documentation
- Build pipeline ready
- Quick setup script

**🔨 READY TO BUILD (Week 1):**
- Money utilities
- Event types & reducers
- Command handlers
- Deterministic match simulation
- Validation rules
- Projection builders

## 📂 What's in the Package

```
calculating-glory-project/
├── packages/domain/          # Game logic package
│   ├── src/
│   │   ├── types/           # ✅ Complete type definitions
│   │   ├── commands/        # 🔨 Ready to build
│   │   ├── events/          # 🔨 Ready to build
│   │   ├── reducers/        # 🔨 Ready to build
│   │   ├── simulation/      # 🔨 Ready to build
│   │   ├── validation/      # 🔨 Ready to build
│   │   └── money/           # 🔨 Ready to build
│   ├── package.json         # ✅ Configured
│   ├── tsconfig.json        # ✅ Configured
│   └── jest.config.js       # ✅ Configured
│
├── docs/
│   ├── CONTEXT.md              # Full design document (48 pages!)
│   ├── GETTING_STARTED.md      # Detailed development guide
│   └── WEEK1_CHECKLIST.md      # Complete task breakdown
│
├── README.md                    # Project overview
├── CLAUDE_CODE_SETUP.md         # Quick start guide
├── package.json                 # Root workspace config
├── setup.sh                     # Automated setup script
└── .gitignore                   # Git configuration
```

## 🚀 Quick Start

1. **Open in Claude Code**
   - Create new repository or open existing folder
   - Copy all files from `calculating-glory-project/`

2. **Run Setup**
   ```bash
   ./setup.sh
   ```
   This will:
   - Verify Node.js version
   - Install dependencies
   - Build domain package
   - Run initial tests

3. **Start Building**
   - Read `CLAUDE_CODE_SETUP.md` for quick orientation
   - Check `docs/WEEK1_CHECKLIST.md` for tasks
   - Begin with money utilities: `packages/domain/src/money/utils.ts`

## 📚 Documentation Hierarchy

**Start here:**
1. `CLAUDE_CODE_SETUP.md` - Quick overview (5 min read)
2. `docs/GETTING_STARTED.md` - Detailed guide (15 min read)
3. `docs/WEEK1_CHECKLIST.md` - Task breakdown (reference)

**Deep dives:**
4. `docs/CONTEXT.md` - Full design context (reference as needed)
5. `packages/domain/README.md` - API documentation (as you build)

## 🎯 Week 1 Goals

Build the domain package with:

1. **Money Utilities** - Integer math, pence-based calculations
2. **Event System** - Event types, reducers, projection builders
3. **Command System** - Command types, handlers, validators
4. **Match Simulation** - Deterministic with golden tests
5. **Core Game Loop** - Transfer, simulate week, update league

**Exit Criteria:**
- All tests passing
- Match simulation deterministic (golden tests)
- Can execute full command → events → state flow
- Code coverage >80%
- TypeScript strict mode happy

## 🔑 Key Architectural Decisions

These are **critical** - they enable multiplayer (V2) without rebuild:

1. **Event-Sourcing**
   - State derived from events, not stored
   - Complete audit trail
   - Enables replay, "what if" analysis

2. **Server-Authoritative Design**
   - All validation designed for server
   - Commands never trust client
   - Even V1 local version follows this

3. **Deterministic Simulation**
   - Seeded RNG for reproducibility
   - Integer math (no floating point)
   - Canonical ordering for tie-breaks

4. **Pure Functions**
   - No mutations
   - No side effects
   - Portable (browser + Node.js)

## ⚠️ Critical Don'ts

- ❌ **NO floating point for money** - Always pence (integers)
- ❌ **NO state mutations** - Always return new objects
- ❌ **NO Math.random()** - Use seeded RNG
- ❌ **NO DOM/browser APIs** - Must work in Node.js
- ❌ **NO `any` types** - Proper TypeScript types always

## ✅ Quality Standards

**Every feature needs:**
- Unit tests for logic
- Edge case tests
- Golden tests for determinism (where applicable)
- JSDoc comments
- Type safety (no `any`)

**Coverage targets:**
- Functions: 80%
- Branches: 80%
- Lines: 80%
- Statements: 80%

## 🛠️ Common Commands

```bash
# Setup
./setup.sh

# Development
cd packages/domain
npm test:watch          # Auto-run tests
npm run build           # Compile TypeScript

# Testing
npm test                # All tests
npm test:determinism    # Golden tests only
npm test -- --coverage  # With coverage
npm test -- file.test.ts # Specific file

# Quality
npm run lint            # Check code style
npx tsc --noEmit       # Check types
```

## 📈 Success Metrics

You'll know Week 1 is complete when:

✅ This test passes:
```typescript
const command = { type: 'MAKE_TRANSFER', playerId: 'p1', ... };
const result = handler.handle(command, state);
store.append(result.events);
const newState = buildProjections(store.events);
// Transfer reflected in new state
```

✅ Determinism verified:
```typescript
const r1 = simulateMatch(teamA, teamB, 'seed1');
const r2 = simulateMatch(teamA, teamB, 'seed1');
expect(r1).toEqual(r2); // Always passes
```

✅ Full week simulation works:
```typescript
const cmd = { type: 'SIMULATE_WEEK', week: 1 };
const result = handler.handle(cmd, state);
// 12 matches simulated, league table updated
```

## 🔜 What's Next

**Week 2:** React Frontend
- Build UI components
- Connect to domain package
- Local command dispatcher
- Game loop implementation

**Week 3:** Educational Systems
- Math problem generator
- Progressive hints
- Tutorial flows
- Adaptive difficulty

**Week 4:** Content & Polish
- All scenarios
- Narrative elements
- Testing
- Optimization

## 💡 Tips for Success

1. **Start small** - Build one feature end-to-end before moving on
2. **Test first** - Write tests, then implementation
3. **Keep it pure** - No mutations, no side effects
4. **Use types** - Let TypeScript help you
5. **Check determinism** - Golden tests catch subtle bugs
6. **Read context** - The design doc has answers

## 🆘 If You Get Stuck

1. Check `docs/GETTING_STARTED.md` for patterns
2. Look at existing tests for examples
3. Review type definitions in `packages/domain/src/types/`
4. Ask in Claude Code (I'll help!)

## 🎮 The Vision

By end of Week 1, you'll have:
- Rock-solid game logic
- Deterministic simulation
- Event-sourced architecture
- Foundation for multiplayer

This foundation enables everything else - the UI, educational systems, and eventual multiplayer all build on this.

## 📦 Package Structure Philosophy

**`/packages/domain`** = The truth
- All business logic
- Portable (browser + Node.js)
- No dependencies on UI
- Heavily tested

**`/packages/frontend`** (Week 2) = The interface
- React components
- Dispatches commands
- Renders projections
- Thin layer over domain

This separation enables:
- Testing game logic without UI
- Running same logic on server (V2)
- Reusing logic across platforms
- Clear boundaries

## 🎯 Your Mission

Build an event-sourced, deterministic, testable game engine that:
1. Makes maths fun through football management
2. Tracks learning through telemetry
3. Adapts difficulty based on performance
4. Works offline as single-player
5. Can become multiplayer without rebuild

The foundation you build in Week 1 makes everything else possible.

---

**Ready to build!** 🚀⚽📊

Start with `./setup.sh` then check `CLAUDE_CODE_SETUP.md`
