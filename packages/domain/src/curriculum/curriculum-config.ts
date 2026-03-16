/**
 * Curriculum Configuration System
 * 
 * Single source of truth for curriculum level, difficulty scaling,
 * and feature gating. Enables game to grow with student from Year 7
 * through GCSE without rebuilding.
 */

export type CurriculumLevel = 
  | 'YEAR_7'
  | 'YEAR_8' 
  | 'YEAR_9'
  | 'GCSE_FOUNDATION'
  | 'GCSE_HIGHER';

export type MathTopic =
  | 'BASIC_ARITHMETIC'
  | 'DECIMALS'
  | 'PERCENTAGES'
  | 'SIMPLE_FRACTIONS'
  | 'RATIOS'
  | 'BASIC_ALGEBRA'
  | 'DATA_INTERPRETATION'
  | 'COMPOUND_PERCENTAGES'
  | 'NEGATIVE_NUMBERS'
  | 'SIMULTANEOUS_EQUATIONS'
  | 'PROBABILITY'
  | 'SEQUENCES'
  | 'TRIGONOMETRY'
  | 'QUADRATIC_EQUATIONS'
  | 'ADVANCED_PROBABILITY'
  | 'STATISTICAL_ANALYSIS'
  | 'GRAPH_INTERPRETATION'
  // Geometry topics — surfaced via Stadium View / Groundskeeper NPC (PR 7)
  | 'AREA_AND_PERIMETER'
  | 'ANGLES'
  | 'SCALE_AND_PROPORTION'
  | 'PROPERTIES_OF_SHAPES';

export type CalculationType =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'multiply_by_small' // e.g., × 2, × 5
  | 'divide'
  | 'percentage'
  | 'compound_percentage'
  | 'ratio'
  | 'equation'
  | 'multi_step';

export interface DifficultyParams {
  /** Number of calculation steps required */
  steps: number;
  
  /** Maximum value in pence (for money amounts) */
  maxNumber: number;
  
  /** Decimal places allowed in intermediate calculations */
  decimalPlaces: number;
  
  /** Types of calculations that can appear */
  calculationTypes: CalculationType[];
  
  /** Whether to include distractors/red herrings */
  includeDistractors?: boolean;
}

export interface CurriculumConfig {
  level: CurriculumLevel;
  
  /** Display name */
  displayName: string;
  
  /** Which math topics are active at this level */
  topics: MathTopic[];
  
  /** Difficulty ranges for each problem tier */
  difficulty: {
    easy: DifficultyParams;
    medium: DifficultyParams;
    hard: DifficultyParams;
  };
  
  /** How many attempts before offering hints */
  hintThreshold: number;
  
  /** Expected completion time for problems (seconds) */
  timeExpectations: {
    easy: number;
    medium: number;
    hard: number;
  };
  
  /** Budget scale (controls magnitude of numbers in game) */
  budgetScale: {
    /** Starting transfer budget in pence */
    transferBudget: number;
    
    /** Player value range [min, max] in pence */
    playerValues: [number, number];
    
    /** Weekly wage range [min, max] in pence */
    wages: [number, number];
    
    /** Facility upgrade costs scale */
    facilityUpgradeScale: number;
  };
  
  /** Which game features are unlocked at this level */
  features: {
    /** Multiple transfer windows (summer + January) */
    multipleTransferWindows: boolean;
    
    /** European/cup competitions */
    internationalCompetitions: boolean;
    
    /** Complex contracts (bonuses, clauses, performance-related pay) */
    complexContracts: boolean;
    
    /** Investment portfolio system */
    investmentPortfolio: boolean;
    
    /** Player loan system */
    loanSystem: boolean;
    
    /** Advanced analytics dashboard */
    advancedAnalytics: boolean;
  };
  
  /** League level unlocked (affects opponent quality) */
  leagueLevel: 'LEAGUE_TWO' | 'LEAGUE_ONE' | 'CHAMPIONSHIP' | 'PREMIER_LEAGUE';
}

/**
 * Curriculum level definitions
 */
export const CURRICULUM_LEVELS: Record<CurriculumLevel, CurriculumConfig> = {
  YEAR_7: {
    level: 'YEAR_7',
    displayName: 'Year 7',
    topics: [
      'BASIC_ARITHMETIC',
      'DECIMALS',
      'PERCENTAGES',
      'SIMPLE_FRACTIONS',
      'RATIOS',
      'BASIC_ALGEBRA',
      'DATA_INTERPRETATION',
      'AREA_AND_PERIMETER',
      'PROPERTIES_OF_SHAPES',
    ],
    difficulty: {
      easy: {
        steps: 1,
        maxNumber: 1000000, // £10k max
        decimalPlaces: 0,
        calculationTypes: ['add', 'subtract', 'multiply_by_small']
      },
      medium: {
        steps: 2,
        maxNumber: 5000000, // £50k max
        decimalPlaces: 1,
        calculationTypes: ['add', 'subtract', 'multiply', 'percentage']
      },
      hard: {
        steps: 3,
        maxNumber: 10000000, // £100k max
        decimalPlaces: 2,
        calculationTypes: ['add', 'subtract', 'multiply', 'divide', 'percentage', 'ratio']
      }
    },
    hintThreshold: 2,
    timeExpectations: {
      easy: 60,
      medium: 120,
      hard: 180
    },
    budgetScale: {
      transferBudget: 50000000, // £500k
      playerValues: [5000000, 30000000], // £50k-£300k
      wages: [100000, 500000], // £1k-£5k per week
      facilityUpgradeScale: 1.0
    },
    features: {
      multipleTransferWindows: false,
      internationalCompetitions: false,
      complexContracts: false,
      investmentPortfolio: false,
      loanSystem: false,
      advancedAnalytics: false
    },
    leagueLevel: 'LEAGUE_TWO'
  },
  
  YEAR_8: {
    level: 'YEAR_8',
    displayName: 'Year 8',
    topics: [
      'BASIC_ARITHMETIC',
      'DECIMALS',
      'PERCENTAGES',
      'SIMPLE_FRACTIONS',
      'RATIOS',
      'BASIC_ALGEBRA',
      'DATA_INTERPRETATION',
      'COMPOUND_PERCENTAGES',
      'NEGATIVE_NUMBERS',
      'SIMULTANEOUS_EQUATIONS',
      'PROBABILITY',
      'SEQUENCES',
      'AREA_AND_PERIMETER',
      'ANGLES',
      'PROPERTIES_OF_SHAPES',
    ],
    difficulty: {
      easy: {
        steps: 2,
        maxNumber: 10000000, // £100k
        decimalPlaces: 1,
        calculationTypes: ['add', 'subtract', 'multiply', 'percentage']
      },
      medium: {
        steps: 3,
        maxNumber: 50000000, // £500k
        decimalPlaces: 2,
        calculationTypes: ['add', 'subtract', 'multiply', 'divide', 'percentage', 'compound_percentage', 'ratio']
      },
      hard: {
        steps: 4,
        maxNumber: 100000000, // £1M
        decimalPlaces: 2,
        calculationTypes: ['multiply', 'divide', 'percentage', 'compound_percentage', 'ratio', 'equation', 'multi_step'],
        includeDistractors: true
      }
    },
    hintThreshold: 3,
    timeExpectations: {
      easy: 90,
      medium: 150,
      hard: 240
    },
    budgetScale: {
      transferBudget: 150000000, // £1.5M
      playerValues: [10000000, 100000000], // £100k-£1M
      wages: [200000, 1000000], // £2k-£10k per week
      facilityUpgradeScale: 2.0
    },
    features: {
      multipleTransferWindows: true,
      internationalCompetitions: false,
      complexContracts: true,
      investmentPortfolio: false,
      loanSystem: true,
      advancedAnalytics: false
    },
    leagueLevel: 'LEAGUE_ONE'
  },
  
  YEAR_9: {
    level: 'YEAR_9',
    displayName: 'Year 9',
    topics: [
      'BASIC_ARITHMETIC',
      'DECIMALS',
      'PERCENTAGES',
      'SIMPLE_FRACTIONS',
      'RATIOS',
      'BASIC_ALGEBRA',
      'DATA_INTERPRETATION',
      'COMPOUND_PERCENTAGES',
      'NEGATIVE_NUMBERS',
      'SIMULTANEOUS_EQUATIONS',
      'PROBABILITY',
      'SEQUENCES',
      'TRIGONOMETRY',
      'QUADRATIC_EQUATIONS',
      'ADVANCED_PROBABILITY',
      'STATISTICAL_ANALYSIS',
      'GRAPH_INTERPRETATION',
      'AREA_AND_PERIMETER',
      'ANGLES',
      'SCALE_AND_PROPORTION',
      'PROPERTIES_OF_SHAPES',
    ],
    difficulty: {
      easy: {
        steps: 3,
        maxNumber: 50000000, // £500k
        decimalPlaces: 2,
        calculationTypes: ['multiply', 'divide', 'percentage', 'compound_percentage', 'ratio']
      },
      medium: {
        steps: 4,
        maxNumber: 200000000, // £2M
        decimalPlaces: 2,
        calculationTypes: ['percentage', 'compound_percentage', 'ratio', 'equation', 'multi_step'],
        includeDistractors: true
      },
      hard: {
        steps: 5,
        maxNumber: 500000000, // £5M
        decimalPlaces: 3,
        calculationTypes: ['compound_percentage', 'ratio', 'equation', 'multi_step'],
        includeDistractors: true
      }
    },
    hintThreshold: 4,
    timeExpectations: {
      easy: 120,
      medium: 180,
      hard: 300
    },
    budgetScale: {
      transferBudget: 500000000, // £5M
      playerValues: [50000000, 500000000], // £500k-£5M
      wages: [500000, 5000000], // £5k-£50k per week
      facilityUpgradeScale: 4.0
    },
    features: {
      multipleTransferWindows: true,
      internationalCompetitions: true,
      complexContracts: true,
      investmentPortfolio: true,
      loanSystem: true,
      advancedAnalytics: true
    },
    leagueLevel: 'CHAMPIONSHIP'
  },
  
  GCSE_FOUNDATION: {
    level: 'GCSE_FOUNDATION',
    displayName: 'GCSE Foundation',
    topics: [
      'BASIC_ARITHMETIC',
      'DECIMALS',
      'PERCENTAGES',
      'SIMPLE_FRACTIONS',
      'RATIOS',
      'BASIC_ALGEBRA',
      'DATA_INTERPRETATION',
      'COMPOUND_PERCENTAGES',
      'NEGATIVE_NUMBERS',
      'SIMULTANEOUS_EQUATIONS',
      'PROBABILITY',
      'SEQUENCES',
      'AREA_AND_PERIMETER',
      'ANGLES',
      'SCALE_AND_PROPORTION',
      'PROPERTIES_OF_SHAPES',
    ],
    difficulty: {
      easy: {
        steps: 3,
        maxNumber: 100000000,
        decimalPlaces: 2,
        calculationTypes: ['percentage', 'compound_percentage', 'ratio', 'multi_step']
      },
      medium: {
        steps: 4,
        maxNumber: 300000000,
        decimalPlaces: 2,
        calculationTypes: ['compound_percentage', 'ratio', 'equation', 'multi_step'],
        includeDistractors: true
      },
      hard: {
        steps: 5,
        maxNumber: 1000000000, // £10M
        decimalPlaces: 3,
        calculationTypes: ['compound_percentage', 'equation', 'multi_step'],
        includeDistractors: true
      }
    },
    hintThreshold: 5,
    timeExpectations: {
      easy: 150,
      medium: 240,
      hard: 360
    },
    budgetScale: {
      transferBudget: 2000000000, // £20M
      playerValues: [100000000, 2000000000], // £1M-£20M
      wages: [1000000, 10000000], // £10k-£100k per week
      facilityUpgradeScale: 8.0
    },
    features: {
      multipleTransferWindows: true,
      internationalCompetitions: true,
      complexContracts: true,
      investmentPortfolio: true,
      loanSystem: true,
      advancedAnalytics: true
    },
    leagueLevel: 'PREMIER_LEAGUE'
  },
  
  GCSE_HIGHER: {
    level: 'GCSE_HIGHER',
    displayName: 'GCSE Higher',
    topics: [
      'BASIC_ARITHMETIC',
      'DECIMALS',
      'PERCENTAGES',
      'SIMPLE_FRACTIONS',
      'RATIOS',
      'BASIC_ALGEBRA',
      'DATA_INTERPRETATION',
      'COMPOUND_PERCENTAGES',
      'NEGATIVE_NUMBERS',
      'SIMULTANEOUS_EQUATIONS',
      'PROBABILITY',
      'SEQUENCES',
      'TRIGONOMETRY',
      'QUADRATIC_EQUATIONS',
      'ADVANCED_PROBABILITY',
      'STATISTICAL_ANALYSIS',
      'GRAPH_INTERPRETATION',
      'AREA_AND_PERIMETER',
      'ANGLES',
      'SCALE_AND_PROPORTION',
      'PROPERTIES_OF_SHAPES',
    ],
    difficulty: {
      easy: {
        steps: 4,
        maxNumber: 200000000,
        decimalPlaces: 2,
        calculationTypes: ['compound_percentage', 'ratio', 'equation', 'multi_step']
      },
      medium: {
        steps: 5,
        maxNumber: 500000000,
        decimalPlaces: 3,
        calculationTypes: ['compound_percentage', 'equation', 'multi_step'],
        includeDistractors: true
      },
      hard: {
        steps: 6,
        maxNumber: 2000000000, // £20M
        decimalPlaces: 3,
        calculationTypes: ['compound_percentage', 'equation', 'multi_step'],
        includeDistractors: true
      }
    },
    hintThreshold: 6,
    timeExpectations: {
      easy: 180,
      medium: 300,
      hard: 420
    },
    budgetScale: {
      transferBudget: 5000000000, // £50M
      playerValues: [500000000, 5000000000], // £5M-£50M
      wages: [5000000, 30000000], // £50k-£300k per week
      facilityUpgradeScale: 15.0
    },
    features: {
      multipleTransferWindows: true,
      internationalCompetitions: true,
      complexContracts: true,
      investmentPortfolio: true,
      loanSystem: true,
      advancedAnalytics: true
    },
    leagueLevel: 'PREMIER_LEAGUE'
  }
};

/**
 * Get current curriculum configuration
 * V1: Load from localStorage
 * V2: Load from user profile on server
 */
export function getCurrentCurriculum(): CurriculumConfig {
  if (typeof window === 'undefined') {
    // Server-side or Node.js - default to YEAR_7
    return CURRICULUM_LEVELS.YEAR_7;
  }
  
  const saved = localStorage.getItem('curriculum_level');
  const level = (saved as CurriculumLevel) || 'YEAR_7';
  
  return CURRICULUM_LEVELS[level];
}

/**
 * Update curriculum level
 * Called when user progresses or manually changes setting
 */
export function setCurriculumLevel(level: CurriculumLevel): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('curriculum_level', level);
  
  // Trigger event for UI to update
  window.dispatchEvent(new CustomEvent('curriculum_changed', { 
    detail: { level } 
  }));
}

/**
 * Get next curriculum level in progression
 */
export function getNextLevel(current: CurriculumLevel): CurriculumLevel | undefined {
  const progression: CurriculumLevel[] = [
    'YEAR_7',
    'YEAR_8',
    'YEAR_9',
    'GCSE_FOUNDATION',
    'GCSE_HIGHER'
  ];
  
  const index = progression.indexOf(current);
  return progression[index + 1];
}

/**
 * Get previous curriculum level
 */
export function getPreviousLevel(current: CurriculumLevel): CurriculumLevel | undefined {
  const progression: CurriculumLevel[] = [
    'YEAR_7',
    'YEAR_8',
    'YEAR_9',
    'GCSE_FOUNDATION',
    'GCSE_HIGHER'
  ];
  
  const index = progression.indexOf(current);
  return index > 0 ? progression[index - 1] : undefined;
}

/**
 * Check if a specific feature is unlocked at current curriculum level
 */
export function isFeatureUnlocked(feature: keyof CurriculumConfig['features']): boolean {
  const curriculum = getCurrentCurriculum();
  return curriculum.features[feature];
}

/**
 * Get all available curriculum levels for UI
 */
export function getAllCurriculumLevels(): CurriculumConfig[] {
  return [
    CURRICULUM_LEVELS.YEAR_7,
    CURRICULUM_LEVELS.YEAR_8,
    CURRICULUM_LEVELS.YEAR_9,
    CURRICULUM_LEVELS.GCSE_FOUNDATION,
    CURRICULUM_LEVELS.GCSE_HIGHER
  ];
}
