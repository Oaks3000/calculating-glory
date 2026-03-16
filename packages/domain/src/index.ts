/**
 * @calculating-glory/domain
 *
 * Portable game logic package - runs identically in browser and Node.js
 *
 * Core exports for command-event architecture, deterministic simulation,
 * and event-sourced game state management.
 */

// Curriculum system
export * from './curriculum/curriculum-config';
export * from './curriculum/curriculum-progression';

// Command types and handlers
export * from './commands/types';
export * from './commands/handlers';

// Event types and reducers
export * from './events/types';
export * from './reducers';

// Simulation
export * from './simulation/rng';
export * from './simulation/match';
export * from './simulation/season';
export * from './simulation/events';

// Validation
export * from './validation/rules';

// Money utilities
export * from './money/utils';

// Data
export * from './data/league-two-teams';
export * from './data/club-events';
export * from './data/squad-generator';

// Core state types
export * from './types/game-state-updated';
export * from './types/club';
export * from './types/player';
export * from './types/match';
export * from './types/staff';
export * from './types/facility';
export * from './types/league';
export * from './types/formation';
