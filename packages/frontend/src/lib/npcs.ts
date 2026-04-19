// Shared NPC dictionary. Used by IntroScreen, GuidedTaskCard, and any other
// surface where one of the four directors speaks. Colour is a semantic key so
// call sites never hand-pick a Tailwind token.

export type NpcId = 'val' | 'kev' | 'marcus' | 'dani';
export type NpcColourKey = 'emerald' | 'sky' | 'amber' | 'violet';

export interface Npc {
  id: NpcId;
  name: string;
  role: string;
  avatar: string;
  colour: NpcColourKey;
}

// Tailwind's JIT scanner can't follow dynamic class names built from template
// strings, so every class we want to ship must appear as a static literal.
// Keep this map in sync with any colour key added to NpcColourKey.
export const NPC_COLOUR_CLASSES: Record<NpcColourKey, {
  border: string;
  ring: string;
  name: string;
  bg: string;
  bgSubtle: string;
  text: string;
}> = {
  emerald: {
    border:   'border-emerald-500',
    ring:     'ring-emerald-400/60',
    name:     'text-emerald-300',
    bg:       'bg-emerald-500',
    bgSubtle: 'bg-emerald-500/10',
    text:     'text-emerald-400',
  },
  sky: {
    border:   'border-sky-500',
    ring:     'ring-sky-400/60',
    name:     'text-sky-300',
    bg:       'bg-sky-500',
    bgSubtle: 'bg-sky-500/10',
    text:     'text-sky-400',
  },
  amber: {
    border:   'border-amber-500',
    ring:     'ring-amber-400/60',
    name:     'text-amber-300',
    bg:       'bg-amber-500',
    bgSubtle: 'bg-amber-500/10',
    text:     'text-amber-400',
  },
  violet: {
    border:   'border-violet-500',
    ring:     'ring-violet-400/60',
    name:     'text-violet-300',
    bg:       'bg-violet-500',
    bgSubtle: 'bg-violet-500/10',
    text:     'text-violet-400',
  },
};

export const NPCS: Record<NpcId, Npc> = {
  val:    { id: 'val',    name: 'Val Okoro',    role: 'Finance Director',    avatar: '📊', colour: 'emerald' },
  kev:    { id: 'kev',    name: 'Kev Mulligan', role: 'Head of Football',    avatar: '⚽', colour: 'sky'     },
  marcus: { id: 'marcus', name: 'Marcus Webb',  role: 'Commercial Director', avatar: '📣', colour: 'amber'   },
  dani:   { id: 'dani',   name: 'Dani Lopes',   role: 'Head of Operations',  avatar: '🔧', colour: 'violet'  },
};
