import { NpcId } from './npcs';

// Jargon terms kids (Year 7–8) might not know. Each entry carries:
// - short:   one-line tooltip shown on subsequent taps
// - full:    the NPC's in-character explanation shown the first time a term
//            is tapped (friendly, second-person)
// - upWhen:  "the number goes up when…"
// - downWhen: "the number goes down when…"
// Keep copy tight — these are for a 12-year-old reader, not a finance textbook.

export type GlossaryTermId =
  | 'runway'
  | 'burn-per-week'
  | 'transfer-budget'
  | 'board-confidence'
  | 'wage-reserve';

export interface GlossaryTerm {
  id: GlossaryTermId;
  term: string;
  npc: NpcId;
  short: string;
  full: string;
  upWhen: string;
  downWhen: string;
}

export const GLOSSARY: Record<GlossaryTermId, GlossaryTerm> = {
  'runway': {
    id: 'runway',
    term: 'Runway',
    npc: 'val',
    short: 'How many weeks of cash we have left at our current spending rate.',
    full:
      "Runway is how many weeks we can keep paying wages before the bank runs dry. " +
      "Think of it like fuel in a plane — the bigger the number, the further we can fly before we need to land.",
    upWhen:
      "earning more than we spend each week — better sponsors, higher attendance, cheaper wages.",
    downWhen:
      "wages and running costs are higher than income. Big signings, expensive managers or fewer fans all eat into it.",
  },

  'burn-per-week': {
    id: 'burn-per-week',
    term: 'Burn/wk',
    npc: 'val',
    short: "The total cash we spend every week — wages, staff, running the place.",
    full:
      "Burn is everything going out of the bank account each week. Player wages, staff salaries, the manager's pay, " +
      "keeping the lights on. If burn is bigger than the money coming in, we're losing cash every week.",
    upWhen:
      "we sign a player on big wages, hire a pricey manager or upgrade a facility that needs staffing.",
    downWhen:
      "we release a player, let a contract expire or bring in younger squad members on lower wages.",
  },

  'transfer-budget': {
    id: 'transfer-budget',
    term: 'Budget',
    npc: 'val',
    short: "The pot of cash you can spend on signing new players.",
    full:
      "Your transfer budget is the money ring-fenced for buying players. It's separate from the wage pot — " +
      "signing someone costs a one-off fee from here, then their weekly wage comes out of the other pot.",
    upWhen:
      "a sponsor deal lands, we sell a player, cup prize money arrives, or the board grants a top-up.",
    downWhen:
      "we buy a player — the fee comes straight out. Bigger signings, bigger dent.",
  },

  'board-confidence': {
    id: 'board-confidence',
    term: 'Board',
    npc: 'val',
    short: "How much the people who own the club trust you to do the job.",
    full:
      "The board are the people above you — they gave you the job. This number is how much they still back you. " +
      "High and they give you room to chase the big stuff. Low and they start making uncomfortable phone calls.",
    upWhen:
      "the team wins, we climb the league, or we land a cup run or a big sponsor.",
    downWhen:
      "we lose matches, drop in the table, blow through money or miss promises we made them.",
  },

  'wage-reserve': {
    id: 'wage-reserve',
    term: 'Wage reserve',
    npc: 'val',
    short: "The separate pot of cash set aside just for paying wages each week.",
    full:
      "Wages have to be paid every week — players, staff, the manager. The wage reserve is a ring-fenced pot " +
      "just for that, so we can't accidentally spend it on a signing. When it runs out, we can't pay people.",
    upWhen:
      "matchday income comes in, sponsors pay out or the board tops it up.",
    downWhen:
      "every week that passes — wages come straight out. Hiring higher-paid staff drains it faster.",
  },
};
