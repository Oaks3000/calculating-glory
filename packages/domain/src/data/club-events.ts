/**
 * Club Event Templates
 *
 * Defines all possible club events that can occur during a season.
 * 11 standalone events + 4 branching follow-ups = 15 legacy events.
 * Plus multi-hop event chains introduced in the chain system.
 *
 * All budget amounts are in pence.
 */

import { MathTopic } from '../curriculum/curriculum-config';

/** NPC voices that can deliver events */
export type NpcId = 'val' | 'marcus' | 'dani' | 'kev';

/**
 * A structured maths challenge attached to an event.
 * The player must enter the answer before their choice effects are applied.
 * Correct answers unlock full effects; wrong answers apply degraded effects.
 */
export interface MathsChallengeSpec {
  /** The question shown to the player */
  question: string;
  /** The numerically correct answer */
  answer: number;
  /**
   * Acceptable absolute tolerance around the answer.
   * e.g. tolerance: 50 means answers within ±50 of `answer` count as correct.
   */
  tolerance: number;
  /** Unit label shown after the answer input (e.g. '£', '%') */
  unit?: string;
  /** Hint shown after a wrong attempt */
  hint: string;
}

export interface ClubEventTemplate {
  id: string;
  category: 'facility' | 'financial' | 'staff' | 'player' | 'opportunity';
  title: string;
  description: string;
  severity: 'minor' | 'major';
  /** NPC who delivers this event. Shown as attribution in the event card. */
  npc?: NpcId;
  /** Chain this event belongs to (e.g. 'catering-crisis') */
  chainId?: string;
  /** Hop number within the chain (1-indexed) */
  hopNumber?: number;
  /** Total hops in this chain — used for UI context ("Hop 2 of 5") */
  chainLength?: number;
  /**
   * Minimum weeks that must pass after the prerequisite is resolved
   * before this hop becomes eligible.
   */
  delayWeeks?: number;
  /**
   * Structured maths challenge. When present, the player must answer
   * before their choices apply. Maths quality is recorded and can affect
   * follow-up hop variants.
   */
  mathsChallenge?: MathsChallengeSpec;
  /**
   * When set, the math negotiation choice on this event pulls a question from
   * the question bank for this topic, rather than generating an inline
   * financial-context percentage question.
   *
   * Use when the event's math story maps to a specific curriculum topic
   * (algebra, ratios, data interpretation, etc.) rather than a simple
   * percentage comparison between two budget effects.
   */
  bankTopic?: MathTopic;
  choices: {
    id: string;
    label: string;
    description: string;
    budgetEffect?: number;
    reputationEffect?: number;
    performanceEffect?: number;
    requiresMath?: boolean;
    /**
     * Budget effect applied instead of budgetEffect when the player
     * answered the maths challenge correctly. Falls back to budgetEffect
     * if not specified.
     */
    mathsCorrectBudgetEffect?: number;
    /**
     * Budget effect applied instead of budgetEffect when the player
     * answered the maths challenge wrong. Falls back to budgetEffect
     * if not specified.
     */
    mathsWrongBudgetEffect?: number;
  }[];
  prerequisite?: {
    eventId: string;
    choiceId: string;
    /**
     * If set, this follow-up only fires when the prerequisite event's
     * maths challenge was answered with the given quality.
     * Omit to fire regardless of maths quality.
     */
    mathsQuality?: 'correct' | 'wrong';
  };
  conditions?: {
    minBudget?: number;
    maxBudget?: number;
    minReputation?: number;
    maxReputation?: number;
  };
  cooldownWeeks?: number;
}

export const CLUB_EVENT_TEMPLATES: ClubEventTemplate[] = [
  // ── Standalone events ──────────────────────────────────────────────────────

  {
    id: 'burst-pipes',
    category: 'facility',
    title: 'Burst Pipes in Toilets',
    description:
      'Burst pipes in the toilets — fans are complaining and the smell is unbearable!',
    severity: 'minor',
    choices: [
      {
        id: 'fix',
        label: 'Fix it immediately',
        description: 'Call the plumber and get it sorted today.',
        budgetEffect: -500000 // -£5,000
      },
      {
        id: 'ignore',
        label: 'Ignore it for now',
        description: 'Hope fans stop moaning. Reputation takes a hit.',
        reputationEffect: -5
      },
      {
        id: 'negotiate',
        label: 'Negotiate with the plumber',
        description: 'Use your maths skills to find a fairer price.',
        budgetEffect: -300000, // -£3,000
        requiresMath: true
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'pitch-reseeding',
    category: 'facility',
    title: 'Pitch Needs Reseeding',
    description:
      'The pitch is looking rough — bare patches everywhere. Players are at risk of injury.',
    severity: 'minor',
    choices: [
      {
        id: 'reseed',
        label: 'Reseed the pitch',
        description: 'Invest in proper reseeding to bring it up to standard.',
        budgetEffect: -800000 // -£8,000
      },
      {
        id: 'play-on',
        label: 'Play on it as-is',
        description: 'Save the money, accept the performance risk.',
        performanceEffect: -5
      },
      {
        id: 'find-a-deal',
        label: 'Find a deal',
        description: 'Calculate what budget you actually need and negotiate.',
        budgetEffect: -500000, // -£5,000
        requiresMath: true
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'hot-dog-complaint',
    category: 'facility',
    title: 'Hot Dog Hygiene Complaint',
    description:
      'A health inspector found issues with the hot dog stand. You need to respond quickly.',
    severity: 'minor',
    choices: [
      {
        id: 'pay-fine',
        label: 'Pay the fine',
        description: 'Pay the fine and move on. But is this really solved?',
        budgetEffect: -200000 // -£2,000
      },
      {
        id: 'upgrade',
        label: 'Upgrade the facilities',
        description: 'A proper investment — fans will love it.',
        budgetEffect: -1000000, // -£10,000
        reputationEffect: 5
      },
      {
        id: 'negotiate',
        label: 'Negotiate with the inspector',
        description: 'Work out the minimum required spend.',
        budgetEffect: -100000, // -£1,000
        requiresMath: true
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'sponsor-offer',
    category: 'financial',
    title: 'New Sponsor Offer',
    description:
      'A local business wants to sponsor the club. Could be a great boost to the transfer budget.',
    severity: 'minor',
    choices: [
      {
        id: 'accept',
        label: 'Accept their offer',
        description: 'Take the money and move on.',
        budgetEffect: 1500000 // +£15,000
      },
      {
        id: 'negotiate-higher',
        label: 'Negotiate for more',
        description: 'Use your business skills to get a better deal.',
        budgetEffect: 2500000, // +£25,000
        requiresMath: true
      },
      {
        id: 'decline',
        label: 'Decline politely',
        description: "You don't need their money. Fans respect your integrity.",
        reputationEffect: 3
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'tax-break',
    category: 'financial',
    title: 'Tax Break Opportunity',
    description:
      'Your accountant has found a potential tax break. There might be money to reclaim.',
    severity: 'minor',
    bankTopic: 'BASIC_ALGEBRA',
    choices: [
      {
        id: 'claim-it',
        label: 'Claim the tax break',
        description: 'Work out the numbers and reclaim what you are owed.',
        budgetEffect: 1200000, // +£12,000
        requiresMath: true
      },
      {
        id: 'skip-it',
        label: 'Skip it',
        description: "Too complicated. You'll leave it this time."
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'bad-weather-revenue',
    category: 'financial',
    title: 'Storm Reduces Attendance',
    description:
      'A storm is forecast for matchday — low attendance expected and revenue will take a hit.',
    severity: 'minor',
    choices: [
      {
        id: 'discount-tickets',
        label: 'Offer discounted tickets',
        description: 'Sell cheaper tickets to maintain attendance. Costs money but keeps fans happy.',
        budgetEffect: -300000, // -£3,000
        reputationEffect: 3
      },
      {
        id: 'nothing',
        label: 'Do nothing',
        description: 'Accept the lost revenue.',
        budgetEffect: -500000 // -£5,000 lost revenue
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'staff-wage-dispute',
    category: 'staff',
    title: 'Staff Wage Dispute',
    description:
      'The coaching staff are threatening to strike over wages. This could disrupt preparation.',
    severity: 'major',
    bankTopic: 'RATIOS',
    choices: [
      {
        id: 'give-raise',
        label: 'Give them a raise',
        description: 'Pay up and keep the peace.',
        budgetEffect: -1500000 // -£15,000
      },
      {
        id: 'hold-firm',
        label: 'Hold firm',
        description: 'Refuse the demands. Morale and performance will suffer.',
        performanceEffect: -10
      },
      {
        id: 'negotiate-compromise',
        label: 'Negotiate a compromise',
        description: 'Work out a fair settlement with the staff.',
        budgetEffect: -800000, // -£8,000
        requiresMath: true
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'coach-poached',
    category: 'staff',
    title: 'Coach Approached by Rival',
    description:
      'A rival club has made an approach for your best coach. How do you respond?',
    severity: 'major',
    choices: [
      {
        id: 'counter-offer',
        label: 'Make a counter-offer',
        description: 'Match or beat the rival offer to keep them.',
        budgetEffect: -1200000 // -£12,000
      },
      {
        id: 'let-them-go',
        label: 'Let them go',
        description: 'Wish them well. Performance will dip without them.',
        performanceEffect: -8
      },
      {
        id: 'negotiate-retention',
        label: 'Negotiate a retention bonus',
        description: 'Find a cost-effective deal to keep your coach.',
        budgetEffect: -700000, // -£7,000
        requiresMath: true
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'youth-talent',
    category: 'staff',
    title: 'Youth Coach Finds Talent',
    description:
      'Your youth coach has spotted a genuinely promising young player. What do you do with them?',
    severity: 'minor',
    choices: [
      {
        id: 'promote',
        label: 'Promote to first team',
        description: 'Give them a shot in the first team — free but risky.',
        performanceEffect: 3
      },
      {
        id: 'send-on-loan',
        label: 'Send on loan',
        description: 'Loan them out and earn some income.',
        budgetEffect: 200000 // +£2,000
      },
      {
        id: 'invest-in-development',
        label: 'Invest in development',
        description: 'Spend money to accelerate their progress.',
        budgetEffect: -500000, // -£5,000
        performanceEffect: 5
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'player-unhappy',
    category: 'player',
    title: 'Player Wants More Wages',
    description:
      'Your star player has asked for a wage increase. You need to decide how to respond.',
    severity: 'minor',
    choices: [
      {
        id: 'give-raise',
        label: 'Give them a raise',
        description: 'Keep them happy with more money.',
        budgetEffect: -800000 // -£8,000
      },
      {
        id: 'refuse',
        label: 'Refuse',
        description: 'Say no. Their form and your reputation will suffer.',
        performanceEffect: -5,
        reputationEffect: -3
      },
      {
        id: 'negotiate',
        label: 'Negotiate',
        description: 'Find a fair middle ground.',
        budgetEffect: -400000, // -£4,000
        requiresMath: true
      }
    ],
    cooldownWeeks: 8
  },

  {
    id: 'investment-offer',
    category: 'opportunity',
    title: 'External Investment Offer',
    description:
      'An external investor wants to put money into the club. This could change everything.',
    severity: 'minor',
    choices: [
      {
        id: 'accept',
        label: 'Accept the investment',
        description: 'Take the money — big boost to the budget.',
        budgetEffect: 5000000 // +£50,000
      },
      {
        id: 'decline',
        label: 'Decline',
        description: 'Stay independent. No effect.'
      },
      {
        id: 'negotiate-terms',
        label: 'Negotiate better terms',
        description: 'Work out a deal that gives you more money.',
        budgetEffect: 7500000, // +£75,000
        requiresMath: true
      }
    ],
    cooldownWeeks: 8
  },

  // ── Branching follow-ups ───────────────────────────────────────────────────

  {
    id: 'health-inspector',
    category: 'facility',
    title: 'Health Inspector Returns',
    description:
      "The health inspector is back — and it's worse than before. You ignored the problem and now it has escalated.",
    severity: 'major',
    prerequisite: {
      eventId: 'hot-dog-complaint',
      choiceId: 'pay-fine'
    },
    choices: [
      {
        id: 'full-renovation',
        label: 'Full catering renovation',
        description: 'A complete overhaul to fix everything properly.',
        budgetEffect: -2000000 // -£20,000
      },
      {
        id: 'appeal',
        label: 'Appeal the decision',
        description: 'Fight the decision in court with maths on your side.',
        budgetEffect: -800000, // -£8,000
        requiresMath: true
      }
    ]
  },

  {
    id: 'catering-expansion',
    category: 'facility',
    title: 'Catering Partnership Offer',
    description:
      'Your food upgrades are proving popular! A catering company wants to partner with the club.',
    severity: 'minor',
    bankTopic: 'DATA_INTERPRETATION',
    prerequisite: {
      eventId: 'hot-dog-complaint',
      choiceId: 'upgrade'
    },
    choices: [
      {
        id: 'accept-partnership',
        label: 'Accept the partnership',
        description: 'Let them run it and take a cut.',
        budgetEffect: 2000000 // +£20,000
      },
      {
        id: 'run-it-yourself',
        label: 'Run it yourself',
        description: 'Keep all the profits — but you need to calculate the margins.',
        budgetEffect: 3000000, // +£30,000
        requiresMath: true
      }
    ]
  },

  {
    id: 'investor-demands',
    category: 'opportunity',
    title: 'Investor Wants Transfer Input',
    description:
      'Your investor wants a say in transfer decisions. You need to manage this carefully.',
    severity: 'major',
    bankTopic: 'DATA_INTERPRETATION',
    prerequisite: {
      eventId: 'investment-offer',
      choiceId: 'accept'
    },
    choices: [
      {
        id: 'agree',
        label: 'Agree to their demands',
        description: 'Give them what they want. Reputation suffers.',
        reputationEffect: -5
      },
      {
        id: 'push-back',
        label: 'Push back hard',
        description: 'Stand your ground. Costs you financially.',
        budgetEffect: -1000000 // -£10,000
      },
      {
        id: 'negotiate-boundaries',
        label: 'Negotiate boundaries',
        description: 'Find a middle ground that protects your authority.',
        budgetEffect: -500000, // -£5,000
        requiresMath: true
      }
    ]
  },

  {
    id: 'investor-doubles-down',
    category: 'opportunity',
    title: 'Investor Offers More Funding',
    description:
      'Pleased with progress, your investor offers another round of funding. But there are strings attached.',
    severity: 'minor',
    prerequisite: {
      eventId: 'investment-offer',
      choiceId: 'accept'
    },
    choices: [
      {
        id: 'accept',
        label: 'Accept the funding',
        description: 'Take the money — even more budget to play with.',
        budgetEffect: 4000000 // +£40,000
      },
      {
        id: 'decline',
        label: 'Decline politely',
        description: "You don't want more strings attached.",
        reputationEffect: 5
      }
    ]
  },

  // ── Chain 1: The Catering Crisis ───────────────────────────────────────────
  // 5-hop chain. Theme: food & beverage operations from crisis to empire.
  // Primary NPC: Dani. Supporting: Marcus, Val.

  {
    id: 'chain1-hop1',
    chainId: 'catering-crisis',
    hopNumber: 1,
    chainLength: 5,
    category: 'facility',
    npc: 'dani',
    title: 'Health Inspector Visit',
    description:
      "Dani: \"Health inspector turned up unannounced. Found hygiene issues with the food kiosks. We've got three options and I need a decision by end of week.\"",
    severity: 'major',
    mathsChallenge: {
      question: "The inspector gave us a score of 2 out of 5. We need a 4 to pass. Each point of improvement costs about £750 in equipment upgrades. What's the minimum we need to spend to reach a 4?",
      answer: 1500,
      tolerance: 0,
      unit: '£',
      hint: "Work out how many points you need to gain (4 − 2 = 2), then multiply by the cost per point (£750)."
    },
    choices: [
      {
        id: 'emergency-clean',
        label: 'Emergency deep clean (£3,000)',
        description: 'Fixes the immediate problem. Inspector satisfied.',
        budgetEffect: -300000, // -£3,000
      },
      {
        id: 'full-upgrade',
        label: 'Full facility upgrade (£12,000)',
        description: 'Eliminates the root cause. Expensive but permanent — unlocks the partnership offer sooner.',
        budgetEffect: -1200000, // -£12,000
        reputationEffect: 3,
      },
      {
        id: 'reinspection',
        label: 'Request re-inspection in 2 weeks',
        description: "Free now, but you'll need to spend on improvements before they return. Val warns: if you fail, it's an £8,000 fine.",
        // Budget effect depends on maths: correct = spend minimum £1,500; wrong = underspend → Hop 2 fails
        mathsCorrectBudgetEffect: -150000,  // -£1,500 (minimum correct spend)
        mathsWrongBudgetEffect: -50000,     // -£500 (underspent — leads to failure in Hop 2)
        budgetEffect: -100000,              // fallback if no maths attempted
      },
    ],
  },

  {
    // Fires 2 weeks after Hop 1 when player chose reinspection AND got maths correct (pass)
    id: 'chain1-hop2-pass',
    chainId: 'catering-crisis',
    hopNumber: 2,
    chainLength: 5,
    category: 'facility',
    npc: 'dani',
    title: 'Re-Inspection: Passed',
    description:
      "Dani: \"Inspector's back. The improvements held up. We passed with a 4. Crisis over for now. No further action required.\"",
    severity: 'minor',
    prerequisite: {
      eventId: 'chain1-hop1',
      choiceId: 'reinspection',
      mathsQuality: 'correct',
    },
    delayWeeks: 2,
    choices: [
      {
        id: 'noted',
        label: 'Good — keep the kiosks clean',
        description: "Dani's on it. The catering operation continues.",
      },
    ],
  },

  {
    // Fires 2 weeks after Hop 1 when player chose reinspection AND got maths wrong (fail)
    id: 'chain1-hop2-fail',
    chainId: 'catering-crisis',
    hopNumber: 2,
    chainLength: 5,
    category: 'facility',
    npc: 'val',
    title: 'Re-Inspection: Failed',
    description:
      "Val: \"I told you this would happen. We underspent on the improvements and failed the re-inspection. The fine is £8,000 and the food kiosks are closed for two home games.\"",
    severity: 'major',
    mathsChallenge: {
      question: "The closure costs us food revenue for 2 home games. Average food spend per fan is £3.20 and we're averaging 3,400 attendance. What's the total revenue we'll lose?",
      answer: 21760,
      tolerance: 100,
      unit: '£',
      hint: "Multiply average spend per fan (£3.20) × attendance (3,400) × number of games (2)."
    },
    prerequisite: {
      eventId: 'chain1-hop1',
      choiceId: 'reinspection',
      mathsQuality: 'wrong',
    },
    delayWeeks: 2,
    choices: [
      {
        id: 'pay-and-learn',
        label: 'Pay the fine and upgrade properly',
        description: "Pay the £8,000 fine. Dani will do a full hygiene overhaul this time.",
        budgetEffect: -800000, // -£8,000 fine
      },
    ],
  },

  {
    // Fires 3-5 weeks after either Hop 2 variant (or after full-upgrade in Hop 1)
    id: 'chain1-hop3',
    chainId: 'catering-crisis',
    hopNumber: 3,
    chainLength: 5,
    category: 'opportunity',
    npc: 'marcus',
    title: 'Catering Partnership Offer',
    description:
      "Marcus: \"Our food situation has got attention. GrubHub Catering want to run our matchday food operation. They handle everything, we take a 15% cut of all sales.\" Dani: \"Or we run it ourselves. Higher margins but more effort and more risk.\"",
    severity: 'minor',
    mathsChallenge: {
      question: "GrubHub estimates total matchday food sales of £8,500 per home game. We have 23 home games this season. If we take 15%, what's our total income from the partnership?",
      answer: 29325,
      tolerance: 100,
      unit: '£',
      hint: "Multiply £8,500 × 0.15 × 23."
    },
    prerequisite: {
      eventId: 'chain1-hop2-pass',
      choiceId: 'noted',
    },
    delayWeeks: 3,
    choices: [
      {
        id: 'accept-partnership',
        label: 'Accept GrubHub partnership (15% cut)',
        description: 'Guaranteed income, zero operational effort.',
        // Correct maths = player knows exactly what they're getting
        mathsCorrectBudgetEffect: 2932500,  // +£29,325 (exact calculated value)
        mathsWrongBudgetEffect: 2000000,    // +£20,000 (underestimated — less favourable terms)
        budgetEffect: 2200000,
      },
      {
        id: 'run-in-house',
        label: 'Run it in-house (higher margins)',
        description: 'Keep all the profit — but needs £5,000 upfront and real operational effort. Leads to further chain hops.',
        budgetEffect: -500000, // -£5,000 setup
      },
      {
        id: 'decline-both',
        label: 'Decline — keep the basic operation',
        description: "Stay as you are. No investment, no partnership.",
      },
    ],
  },

  {
    // Fires 3-4 weeks after Hop 3 when player chose in-house
    id: 'chain1-hop4',
    chainId: 'catering-crisis',
    hopNumber: 4,
    chainLength: 5,
    category: 'facility',
    npc: 'dani',
    title: 'Supply Chain Shock',
    description:
      "Dani: \"Problem. Our main food supplier just raised prices 22%. Our unit costs are shot. Marcus knows a bulk supplier at the old rate but we'd have to buy double what we need per game. We'd be wasting half of it.\"",
    severity: 'major',
    mathsChallenge: {
      question: "If we sell 400 units at £4.00 each with Marcus's supplier at £1.45 per unit, but we have to buy 800 units, what's our actual profit per game?",
      answer: 440,
      tolerance: 10,
      unit: '£',
      hint: "Revenue = 400 × £4.00. Cost = 800 × £1.45. Profit = Revenue − Cost."
    },
    prerequisite: {
      eventId: 'chain1-hop3',
      choiceId: 'run-in-house',
    },
    delayWeeks: 3,
    choices: [
      {
        id: 'absorb-increase',
        label: 'Absorb the 22% price increase',
        description: 'Margins shrink but operations continue smoothly.',
        // Correct maths = player understands the absorb option is better than bulk deal
        mathsCorrectBudgetEffect: -20000,  // -£200/week × ~10 weeks remaining
        mathsWrongBudgetEffect: -60000,    // -£600 (made worse deal not realising bulk loses money)
        budgetEffect: -40000,
      },
      {
        id: 'bulk-deal',
        label: "Take Marcus's bulk deal",
        description: 'Lower unit cost but double the volume — you may waste half the stock.',
        budgetEffect: -30000, // net loss per game × remaining games
      },
      {
        id: 'renegotiate',
        label: 'Renegotiate with current supplier',
        description: "Dani sets up the call. Takes a week but could recover the old rate.",
        budgetEffect: 0,
        reputationEffect: 2,
      },
    ],
  },

  {
    // Fires 6-8 weeks after Hop 4 if in-house operation is running
    id: 'chain1-hop5',
    chainId: 'catering-crisis',
    hopNumber: 5,
    chainLength: 5,
    category: 'opportunity',
    npc: 'marcus',
    title: 'The Catering Empire',
    description:
      "Marcus: \"The food operation is working. I've had interest from the council. They want us to cater their community events. Six events over the summer, £2,000 fee per event, we supply food at cost plus margin.\" Val: \"This is outside our core business. There are staffing and transport costs.\"",
    severity: 'minor',
    mathsChallenge: {
      question: "Six events at £2,000 each. Staff cost: £800 per event. Food cost: £600 per event. Transport: £150 per event. What's the total profit across all six events?",
      answer: 2700,
      tolerance: 50,
      unit: '£',
      hint: "Revenue = 6 × £2,000. Total costs = 6 × (£800 + £600 + £150). Profit = Revenue − Total costs."
    },
    prerequisite: {
      eventId: 'chain1-hop4',
      choiceId: 'absorb-increase',
    },
    delayWeeks: 6,
    choices: [
      {
        id: 'accept-council',
        label: 'Accept the council contract',
        description: "Catering becomes a permanent revenue stream beyond matchday.",
        mathsCorrectBudgetEffect: 270000,  // +£2,700 (correctly calculated profit)
        mathsWrongBudgetEffect: 150000,    // +£1,500 (underestimated, negotiated poorly)
        budgetEffect: 200000,
        reputationEffect: 5,
      },
      {
        id: 'decline-council',
        label: 'Decline — too much strain on Dani',
        description: "Protect operational capacity. No income but no risk.",
      },
      {
        id: 'negotiate-fee',
        label: 'Accept but negotiate for £2,500 per event',
        description: "Push for more. They might say yes.",
        mathsCorrectBudgetEffect: 420000,  // +£4,200 (£700 profit × 6 at higher fee, if correct)
        mathsWrongBudgetEffect: 0,         // Negotiation fails — no deal
        budgetEffect: 200000,
      },
    ],
  },

  // Chain 1 Hop 3 also needs a follow-up from hop2-fail path
  {
    id: 'chain1-hop3-from-fail',
    chainId: 'catering-crisis',
    hopNumber: 3,
    chainLength: 5,
    category: 'opportunity',
    npc: 'marcus',
    title: 'Catering Partnership Offer',
    description:
      "Marcus: \"Even though the re-inspection went badly, the forced upgrade has got attention. GrubHub Catering want to run our matchday food operation, 15% cut of all sales. Might be the silver lining here.\"",
    severity: 'minor',
    mathsChallenge: {
      question: "GrubHub estimates total matchday food sales of £8,500 per home game. We have 23 home games this season. If we take 15%, what's our total income from the partnership?",
      answer: 29325,
      tolerance: 100,
      unit: '£',
      hint: "Multiply £8,500 × 0.15 × 23."
    },
    prerequisite: {
      eventId: 'chain1-hop2-fail',
      choiceId: 'pay-and-learn',
    },
    delayWeeks: 3,
    choices: [
      {
        id: 'accept-partnership',
        label: 'Accept GrubHub partnership (15% cut)',
        description: 'Guaranteed income after a rough start.',
        mathsCorrectBudgetEffect: 2932500,
        mathsWrongBudgetEffect: 2000000,
        budgetEffect: 2200000,
      },
      {
        id: 'decline-both',
        label: 'Decline — focus on getting back to basics',
        description: "Not the time for new ventures.",
      },
    ],
  },

  // ── Chain 5: The Wage Rebellion ────────────────────────────────────────────
  // 3-hop chain. Theme: squad wage pressure.
  // Primary NPCs: Val, Kev.

  {
    id: 'chain5-hop1',
    chainId: 'wage-rebellion',
    hopNumber: 1,
    chainLength: 3,
    category: 'staff',
    npc: 'kev',
    title: 'Players Want a Pay Rise',
    description:
      "Kev: \"The lads want to talk wages. They've been brilliant lately and they know players at other clubs on more money. Three of them have come to me asking for increases.\" Val: \"Current weekly wage bill: £1,800. They're asking for an average 12% increase.\"",
    severity: 'major',
    mathsChallenge: {
      question: "Weekly wage bill is £1,800. A 12% increase across the board costs how much extra per week? And over 20 remaining weeks, what's the total additional cost?",
      answer: 4320,
      tolerance: 50,
      unit: '£',
      hint: "Extra per week = £1,800 × 0.12 = £216. Total = £216 × 20 weeks."
    },
    choices: [
      {
        id: 'grant-raise',
        label: 'Grant the 12% increase',
        description: 'Squad morale rockets. But sets a precedent — others will follow.',
        mathsCorrectBudgetEffect: -432000,  // -£4,320 (correctly calculated season cost)
        mathsWrongBudgetEffect: -216000,    // -£2,160 (player underestimated, but reality hits)
        budgetEffect: -400000,
        reputationEffect: 3,
      },
      {
        id: 'refuse',
        label: 'Refuse',
        description: "Hold the line. Morale drops and the dressing room turns.",
        reputationEffect: -2,
      },
      {
        id: 'selective-raises',
        label: 'Selective raises — top performers only',
        description: "The three players asking earn £320, £280, and £250/week. Raise just theirs.",
        // ~£102/week extra for selective vs £216/week for full squad
        mathsCorrectBudgetEffect: -204000,  // -£2,040 (10 weeks × £102 extra for 3 players, correct calc)
        mathsWrongBudgetEffect: -350000,    // -£3,500 (overshot, wrong maths led to worse deal)
        budgetEffect: -250000,
        reputationEffect: 1,
      },
    ],
  },

  {
    // Fires 2-3 weeks after Hop 1 if player refused
    id: 'chain5-hop2',
    chainId: 'wage-rebellion',
    hopNumber: 2,
    chainLength: 3,
    category: 'player',
    npc: 'kev',
    title: 'Transfer Request',
    description:
      "Kev: \"Told you this would happen. Torres has handed in a transfer request. Two others aren't training properly, morale is through the floor.\" Val: \"Losing Torres saves us £320/week in wages but we'd need a replacement. Estimate: £15,000 fee plus £280/week.\"",
    severity: 'major',
    mathsChallenge: {
      question: "The full squad raise over 20 weeks costs £4,320. Alternatively: sell Torres (saves £320/week × 20 weeks = £6,400 in wages), but pay £15,000 transfer fee + £280/week for a replacement (20 weeks = £5,600). What's the net cost of selling and replacing vs just giving the raise?",
      answer: 14200,
      tolerance: 200,
      unit: '£',
      hint: "Sell-and-replace cost = £15,000 fee + £5,600 wages − £6,400 wages saved = £14,200. Compare to raise cost of £4,320."
    },
    prerequisite: {
      eventId: 'chain5-hop1',
      choiceId: 'refuse',
    },
    delayWeeks: 2,
    choices: [
      {
        id: 'grant-now',
        label: 'Give them the raise now',
        description: "Backing down costs face but saves money vs replacing Torres.",
        mathsCorrectBudgetEffect: -432000,
        mathsWrongBudgetEffect: -700000, // Player didn't realise raise was cheaper, agreed worse terms
        budgetEffect: -500000,
      },
      {
        id: 'sell-torres',
        label: 'Accept the transfer request — sell Torres',
        description: "Cash comes in but the squad is weakened. Kev is not happy.",
        budgetEffect: 1200000, // +£12,000 fee received
        reputationEffect: -2,
      },
      {
        id: 'mediate',
        label: 'Mediate — one-to-one with Torres',
        description: "Try to resolve it without money changing hands. Risky.",
        reputationEffect: 2,
      },
    ],
  },

  {
    // Fires 6-8 weeks after Hop 1 if raises were granted
    id: 'chain5-hop3',
    chainId: 'wage-rebellion',
    hopNumber: 3,
    chainLength: 3,
    category: 'financial',
    npc: 'val',
    title: 'The Wage Precedent',
    description:
      "Val: \"Remember those wage increases? Two more players have now come asking for the same. And I've heard the coaching staff are expecting a review too. Every raise raises expectations.\" Val: \"If every demand is met at 12%, what does the compounding effect look like?\"",
    severity: 'major',
    mathsChallenge: {
      question: "Original weekly wage bill: £1,800. After first 12% increase: £1,800 × 1.12. After a second 12% increase on top of that: multiply by 1.12 again. What's the new weekly wage bill after two rounds?",
      answer: 2258,
      tolerance: 5,
      unit: '£',
      hint: "Round 1: £1,800 × 1.12 = £2,016. Round 2: £2,016 × 1.12 = £2,257.92, round to £2,258."
    },
    prerequisite: {
      eventId: 'chain5-hop1',
      choiceId: 'grant-raise',
    },
    delayWeeks: 6,
    choices: [
      {
        id: 'grant-again',
        label: 'Grant the second round of increases',
        description: "Squad ecstatic. Budget takes a compounding hit.",
        mathsCorrectBudgetEffect: -500000, // -£5,000 (player correctly understood the compounding)
        mathsWrongBudgetEffect: -250000,   // -£2,500 (underestimated, reality bites later)
        budgetEffect: -400000,
      },
      {
        id: 'hold-firm',
        label: 'Hold firm — no second round',
        description: "Draw the line here. Some unhappiness but you stop the spiral.",
        reputationEffect: -3,
      },
      {
        id: 'performance-bonuses',
        label: 'Offer performance bonuses instead',
        description: "Conditional pay — only costs if the team performs. Val approves.",
        budgetEffect: -100000, // Admin cost; bonuses are future events
        reputationEffect: 2,
      },
    ],
  },

  // ── Chain 8: The Storm ─────────────────────────────────────────────────────
  // 2-hop chain. Theme: weather disruption.
  // Primary NPCs: Dani, Val.

  {
    id: 'chain8-hop1',
    chainId: 'storm',
    hopNumber: 1,
    chainLength: 2,
    category: 'financial',
    npc: 'dani',
    title: 'Storm Forecast for Saturday',
    description:
      "Dani: \"Storm forecast for Saturday. Met Office says severe. We're going to see a big attendance drop.\" Val: \"Normal attendance is 3,400. Storm games historically see a 35–50% drop. I need you to estimate the revenue impact before we decide anything.\"",
    severity: 'major',
    mathsChallenge: {
      question: "Average attendance is 3,400. If we see a 40% drop, how many fans attend? At average ticket price of £12, what's the gate revenue loss compared to a normal game?",
      answer: 16320,
      tolerance: 200,
      unit: '£',
      hint: "Storm attendance = 3,400 × 0.6 = 2,040. Normal revenue = 3,400 × £12 = £40,800. Storm revenue = 2,040 × £12. Loss = Normal − Storm."
    },
    choices: [
      {
        id: 'discount-tickets',
        label: 'Offer discounted tickets (£8 instead of £12)',
        description: "Might limit attendance drop to 20% — but at a lower price. Work out if it's worth it.",
        // Correct maths: player knows discount revenue (£21,760) < normal storm revenue (£24,480) → worse option
        mathsCorrectBudgetEffect: -1904000, // -£19,040 (player correctly evaluates, negotiates staff reduction too)
        mathsWrongBudgetEffect: -2448000,   // -£24,480 (player doesn't realise discount hurts more, full loss)
        budgetEffect: -2200000,
      },
      {
        id: 'do-nothing',
        label: 'Do nothing — accept the 40% drop',
        description: "Val: \"At least we keep the full ticket price on whoever shows up.\"",
        mathsCorrectBudgetEffect: -1632000, // -£16,320 (correctly calculated loss)
        mathsWrongBudgetEffect: -2000000,   // -£20,000 (underestimated the hit)
        budgetEffect: -1800000,
      },
      {
        id: 'reschedule',
        label: 'Move to midweek',
        description: "Reschedule costs £2,000 (pitch prep, steward rebooking) but guarantees normal attendance.",
        budgetEffect: -200000, // -£2,000 rescheduling cost; no attendance loss
      },
    ],
  },

  {
    // Fires 1 week after Hop 1
    id: 'chain8-hop2',
    chainId: 'storm',
    hopNumber: 2,
    chainLength: 2,
    category: 'facility',
    npc: 'dani',
    title: 'Storm Damage',
    description:
      "Dani: \"The roof took some damage in the storm. Repair cost: £3,500. Good thing we've been maintaining the drainage, it could've been much worse.\" Val: \"Insurance covers 60% of weather damage above a £500 excess. Let's work out what we're actually paying.\"",
    severity: 'minor',
    mathsChallenge: {
      question: "Repair cost is £3,500. We pay the first £500 as excess. Insurance covers 60% of the remaining £3,000. What's our total out-of-pocket cost?",
      answer: 1700,
      tolerance: 10,
      unit: '£',
      hint: "Excess (you pay): £500. Remaining: £3,000. Insurance pays 60% = £1,800. You pay 40% = £1,200. Total = £500 + £1,200."
    },
    prerequisite: {
      eventId: 'chain8-hop1',
      choiceId: 'do-nothing',
    },
    delayWeeks: 1,
    choices: [
      {
        id: 'claim-insurance',
        label: 'Claim on insurance',
        description: "File the claim. Out-of-pocket is less than it looks.",
        mathsCorrectBudgetEffect: -170000, // -£1,700 (correctly calculated)
        mathsWrongBudgetEffect: -350000,   // -£3,500 (player pays full cost, missed the maths)
        budgetEffect: -250000,
      },
      {
        id: 'pay-outright',
        label: "Pay it outright — don't bother with insurance",
        description: "Quicker but costs more.",
        budgetEffect: -350000, // -£3,500
      },
    ],
  },

  {
    // Fires 1 week after Hop 1 (discount-tickets path)
    id: 'chain8-hop2-discount',
    chainId: 'storm',
    hopNumber: 2,
    chainLength: 2,
    category: 'facility',
    npc: 'dani',
    title: 'Storm Damage',
    description:
      "Dani: \"Some roof damage from the storm. £3,500 to repair.\" Val: \"Insurance covers 60% above a £500 excess.\"",
    severity: 'minor',
    mathsChallenge: {
      question: "Repair cost is £3,500. We pay the first £500 as excess. Insurance covers 60% of the remaining £3,000. What's our total out-of-pocket cost?",
      answer: 1700,
      tolerance: 10,
      unit: '£',
      hint: "Excess: £500. Remaining £3,000 — insurance covers 60% = £1,800, you cover 40% = £1,200. Total = £500 + £1,200."
    },
    prerequisite: {
      eventId: 'chain8-hop1',
      choiceId: 'discount-tickets',
    },
    delayWeeks: 1,
    choices: [
      {
        id: 'claim-insurance',
        label: 'Claim on insurance',
        description: "File the claim.",
        mathsCorrectBudgetEffect: -170000,
        mathsWrongBudgetEffect: -350000,
        budgetEffect: -250000,
      },
      {
        id: 'pay-outright',
        label: "Pay it outright",
        description: "Quicker, costs more.",
        budgetEffect: -350000,
      },
    ],
  },

  // ── Chain 9: The Tax Puzzle ─────────────────────────────────────────────────
  // 2-hop chain. Theme: finding money in the books.
  // Primary NPC: Val (exclusively).

  {
    id: 'chain9-hop1',
    chainId: 'tax-puzzle',
    hopNumber: 1,
    chainLength: 2,
    category: 'financial',
    npc: 'val',
    title: 'Business Rates Overpayment',
    description:
      "Val: \"I've been through the accounts. I think we've been overpaying on business rates. The council charges based on the rateable value of the stadium, but our classification might be wrong. If we're reclassified as a community sports facility instead of a commercial entertainment venue, the rate drops from 48p to 34p in the pound. Application costs £750 and takes 4 weeks.\"",
    severity: 'minor',
    mathsChallenge: {
      question: "If the rateable value is £37,500, what are the current annual rates at 48p in the pound? What would they be at 34p? What's the annual saving?",
      answer: 5250,
      tolerance: 50,
      unit: '£',
      hint: "Current: £37,500 × 0.48. Reclassified: £37,500 × 0.34. Saving = Current − Reclassified."
    },
    choices: [
      {
        id: 'apply',
        label: 'Apply for reclassification (£750)',
        description: "Four-week wait but potentially £5,250/year saving. Is the maths right?",
        mathsCorrectBudgetEffect: -75000, // -£750 application fee (player knows the saving is worth it)
        mathsWrongBudgetEffect: -75000,   // Same cost either way — but wrong maths may undervalue the saving
        budgetEffect: -75000,
      },
      {
        id: 'skip',
        label: "Skip it — too complicated",
        description: "Leave it this year.",
      },
    ],
  },

  {
    // Fires 4 weeks after Hop 1 if player applied
    id: 'chain9-hop2',
    chainId: 'tax-puzzle',
    hopNumber: 2,
    chainLength: 2,
    category: 'financial',
    npc: 'val',
    title: 'Partial Reclassification',
    description:
      "Val: \"Result back from the council, partially approved. The corporate hospitality area still counts as commercial. New rate: 34p on 70% of the rateable value, and 48p on the remaining 30%. Not as much as we hoped, but still a saving.\"",
    severity: 'minor',
    mathsChallenge: {
      question: "Rateable value: £37,500. Calculate the new annual bill: 70% at 34p in the pound, plus 30% at 48p in the pound. What's the saving compared to the original £18,000 bill?",
      answer: 3675,
      tolerance: 25,
      unit: '£',
      hint: "70% of £37,500 = £26,250 at 34p = £8,925. 30% of £37,500 = £11,250 at 48p = £5,400. New total = £14,325. Saving = £18,000 − £14,325."
    },
    prerequisite: {
      eventId: 'chain9-hop1',
      choiceId: 'apply',
    },
    delayWeeks: 4,
    choices: [
      {
        id: 'accept-partial',
        label: 'Accept the partial saving',
        description: "Val: \"Not bad for filling in a form.\"",
        mathsCorrectBudgetEffect: 367500,  // +£3,675 annual saving reflected immediately
        mathsWrongBudgetEffect: 150000,    // +£1,500 (player underestimated — accepted worse terms)
        budgetEffect: 250000,
        reputationEffect: 1,
      },
      {
        id: 'appeal',
        label: 'Appeal for full reclassification',
        description: "Push to reclassify the hospitality area too. Costs another £500 and takes 3 more weeks. May succeed or may be rejected entirely.",
        budgetEffect: -50000, // -£500 appeal fee
      },
    ],
  },
];
