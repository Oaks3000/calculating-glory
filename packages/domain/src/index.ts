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
export * from './curriculum/mastery';

// Question bank schema
export * from './content/questions';

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
export * from './simulation/commentary';
export * from './simulation/npc-messages';

// Validation
export * from './validation/rules';

// Money utilities
export * from './money/utils';

// Data
export * from './data/league-two-teams';
export * from './data/league-one-teams';
export * from './data/division-teams';
export * from './data/club-events';
export * from './data/squad-generator';
export * from './data/free-agent-generator';
export * from './data/transfer-listed-generator';
export * from './data/manager-generator';
export * from './data/manager-archetypes';
export * from './data/manager-message-templates';
export * from './data/scout-target-generator';

// Morale system
export { isUnsettled, avgSquadMorale, UNSETTLED_THRESHOLD, detectFormMilestone, FORM_MILESTONE_HEADLINES } from './simulation/morale';
export type { FormMilestoneKey } from './simulation/morale';

// Simulation helpers
export { playerCharismaRevenue, squadCharismaRevenue, computeWeeklyFinancials } from './simulation/revenue';

// Attribute progression
export {
  POTENTIAL_CEILING_AGE,
  computeStatsAtAge,
  computeTruePotential,
  generatePlayerCurve,
  applySeasonProgression,
  shouldRetire,
  getRetirementFlavour,
} from './simulation/progression';

// Core state types
export * from './types/game-state-updated';
export * from './types/club';
export * from './types/player';
export * from './types/match';
export * from './types/staff';
export * from './types/facility';
export * from './types/league';
export * from './types/formation';
