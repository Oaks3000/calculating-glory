/**
 * Manager Archetype Shells
 *
 * Five distinct manager personas. Each archetype defines a communication
 * style, personality, and stat bias — giving hiring decisions character
 * alongside numerical consequence.
 *
 * Archetypes are assigned at pool generation time and are stable for
 * the lifetime of a save.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type ManagerArchetype =
  | 'PHILOSOPHER'
  | 'SERGEANT'
  | 'YOUTH_DEVELOPER'
  | 'PRAGMATIST'
  | 'SHOWMAN';

export interface ManagerPersona {
  archetype: ManagerArchetype;
  /** Display label shown in UI: "The Philosopher" */
  label: string;
  /** One-liner shown in manager picker */
  shortDesc: string;
  /**
   * Tailwind classes for the avatar chip in inbox.
   * e.g. 'bg-violet-400/20 text-violet-400'
   */
  avatarClass: string;
  /** Tailwind class for the name/sender label */
  nameClass: string;
}

// ── Persona definitions ────────────────────────────────────────────────────

export const MANAGER_PERSONAS: Record<ManagerArchetype, ManagerPersona> = {
  PHILOSOPHER: {
    archetype: 'PHILOSOPHER',
    label: 'The Philosopher',
    shortDesc: 'Meticulous. Builds systems over years. Don\'t expect fireworks.',
    avatarClass: 'bg-violet-400/20 text-violet-400',
    nameClass: 'text-violet-400',
  },
  SERGEANT: {
    archetype: 'SERGEANT',
    label: 'The Sergeant',
    shortDesc: 'Demanding. High standards. Squad morale can be a casualty.',
    avatarClass: 'bg-orange-400/20 text-orange-400',
    nameClass: 'text-orange-400',
  },
  YOUTH_DEVELOPER: {
    archetype: 'YOUTH_DEVELOPER',
    label: 'The Developer',
    shortDesc: 'Patient. Builds from within. Won\'t win you anything quickly.',
    avatarClass: 'bg-emerald-400/20 text-emerald-400',
    nameClass: 'text-emerald-400',
  },
  PRAGMATIST: {
    archetype: 'PRAGMATIST',
    label: 'The Pragmatist',
    shortDesc: 'Steady. Unspectacular. Gets the job done without drama.',
    avatarClass: 'bg-slate-300/20 text-slate-300',
    nameClass: 'text-slate-300',
  },
  SHOWMAN: {
    archetype: 'SHOWMAN',
    label: 'The Showman',
    shortDesc: 'Charismatic. Volatile. The dressing room loves or hates him.',
    avatarClass: 'bg-yellow-400/20 text-yellow-400',
    nameClass: 'text-yellow-400',
  },
};

// ── Tier → archetype pools ─────────────────────────────────────────────────
// Archetypes available per tier, drawn from randomly at generation time.

export const ARCHETYPE_POOL_ELITE: ManagerArchetype[] = [
  'PHILOSOPHER',
  'SERGEANT',
  'SHOWMAN',
];

export const ARCHETYPE_POOL_MID: ManagerArchetype[] = [
  'PHILOSOPHER',
  'PRAGMATIST',
  'YOUTH_DEVELOPER',
  'SHOWMAN',
  'SERGEANT',
];

export const ARCHETYPE_POOL_BUDGET: ManagerArchetype[] = [
  'PRAGMATIST',
  'YOUTH_DEVELOPER',
  'PHILOSOPHER',
];
