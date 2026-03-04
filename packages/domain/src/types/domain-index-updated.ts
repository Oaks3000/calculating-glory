/**
 * @football-manager/domain
 * 
 * Portable game logic package - runs identically in browser and Node.js
 * 
 * Core exports for command-event architecture, deterministic simulation,
 * and event-sourced game state management.
 */

// Curriculum system
export * from '../curriculum/curriculum-config';
export * from '../curriculum/curriculum-progression';

// Command types and handlers
export * from '../commands/types';
export * from '../commands/handlers';

// Event types and reducers
export * from '../events/types';
export * from '../reducers';

// Simulation
export * from '../simulation/match';
export * from '../simulation/season';

// Validation
export * from '../validation/rules';

// Money utilities
export * from '../money/utils';

// Core state types
export * from './game-state-updated';
export * from './club';
export * from './player';
export * from './match';
