/**
 * Club Event Templates
 *
 * Defines all possible club events that can occur during a season.
 * 11 standalone events + 4 branching follow-ups = 15 total.
 *
 * All budget amounts are in pence.
 */

export interface ClubEventTemplate {
  id: string;
  category: 'facility' | 'financial' | 'staff' | 'player' | 'opportunity';
  title: string;
  description: string;
  severity: 'minor' | 'major';
  choices: {
    id: string;
    label: string;
    description: string;
    budgetEffect?: number;
    reputationEffect?: number;
    performanceEffect?: number;
    requiresMath?: boolean;
  }[];
  prerequisite?: {
    eventId: string;
    choiceId: string;
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
  }
];
