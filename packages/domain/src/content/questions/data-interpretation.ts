/**
 * Question Bank — DATA_INTERPRETATION topic
 *
 * 9 questions across three difficulty bands (all fixed valueScale):
 *   D1 (Year 7)  — read values, range, max/min identification
 *   D2 (Year 8)  — mean, median, comparing datasets
 *   D3 (Year 9)  — outlier effect on mean, weighted scores, spread comparison
 */
import { QuestionBank } from './types';

export const dataInterpretationBank: QuestionBank = [

  // ── DIFFICULTY 1 (Year 7) ──────────────────────────────────────────────────

  {
    id: 'dat-yr7-1-001',
    topic: 'DATA_INTERPRETATION',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A club\'s home attendances over 5 games were:\n\n4,200 | 3,800 | 5,100 | 4,600 | 3,950\n\nWhat was the range of attendances?',
    answerFn: _v => 1300,
    answerFormula: '5100 - 3800 = 1300',
    unit: 'fans',
    hints: [
      'Range = largest value − smallest value.',
      'Identify the largest attendance and the smallest attendance from the list.',
      'Largest = 5,100. Smallest = 3,800. Range = 5,100 − 3,800.',
    ],
    explanation: 'Step 1: Identify the largest value: 5,100.\nStep 2: Identify the smallest value: 3,800.\nStep 3: Range = 5,100 − 3,800 = 1,300.\nAnswer: 1,300 fans.',
    context: 'Val Hartley (CFO): "A range of over 1,000 fans per game tells us our home support is quite inconsistent. Worth investigating why."',
  },

  {
    id: 'dat-yr7-1-002',
    topic: 'DATA_INTERPRETATION',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A midfielder\'s goals per season over 5 years were:\n\n8, 12, 7, 15, 10\n\nWhat is the range of goals per season?',
    answerFn: _v => 8,
    answerFormula: '15 - 7 = 8',
    unit: 'goals',
    hints: [
      'Range = largest value − smallest value.',
      'Look through the list and find the highest and lowest number of goals.',
      'Highest = 15 goals. Lowest = 7 goals. Range = 15 − 7.',
    ],
    explanation: 'Step 1: Largest value = 15 goals (Year 4).\nStep 2: Smallest value = 7 goals (Year 3).\nStep 3: Range = 15 − 7 = 8.\nAnswer: 8 goals.',
    context: 'Dani Reyes (Head Scout): "A range of 8 suggests he can vary quite a bit season to season. Consistency matters when you\'re signing on a long contract."',
  },

  {
    id: 'dat-yr7-1-003',
    topic: 'DATA_INTERPRETATION',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A winger\'s sprint times in seconds over 5 training sessions were:\n\n5.8, 6.2, 5.5, 6.0, 5.9\n\nWhat was the fastest (lowest) sprint time?\n\nGive your answer in seconds.',
    answerFn: _v => 5.5,
    answerFormula: 'min(5.8, 6.2, 5.5, 6.0, 5.9) = 5.5',
    unit: 's',
    hints: [
      'A lower sprint time means a faster sprint. Look for the smallest number.',
      'Read through all five values and identify which is the smallest.',
      'The values are: 5.8, 6.2, 5.5, 6.0, 5.9. Which is the smallest?',
    ],
    explanation: 'The five times are: 5.8, 6.2, 5.5, 6.0, 5.9.\nThe smallest (fastest) time is 5.5 seconds.\nAnswer: 5.5 s.',
    context: 'Marcus Webb (Assistant Manager): "Session 3 was his best — 5.5 seconds over 40 metres. That\'s when he\'d just had two rest days."',
  },

  // ── DIFFICULTY 2 (Year 8) ──────────────────────────────────────────────────

  {
    id: 'dat-yr8-2-001',
    topic: 'DATA_INTERPRETATION',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A striker scored the following number of goals per month across 6 months:\n\n3, 5, 2, 6, 4, 4\n\nCalculate the mean number of goals per month.',
    answerFn: _v => 4,
    answerFormula: '(3 + 5 + 2 + 6 + 4 + 4) / 6 = 24 / 6 = 4',
    unit: 'goals',
    hints: [
      'Mean = total ÷ number of values.',
      'Add all the monthly goal totals together first.',
      '3 + 5 + 2 + 6 + 4 + 4 = 24. Divide by 6 (the number of months).',
    ],
    explanation: 'Step 1: Add all values: 3 + 5 + 2 + 6 + 4 + 4 = 24.\nStep 2: Divide by the number of values: 24 ÷ 6 = 4.\nAnswer: mean = 4 goals per month.',
    context: 'Dani Reyes (Head Scout): "Four goals a month over six months is a solid return. That\'s roughly a goal every week — Premier League clubs pay big for that."',
  },

  {
    id: 'dat-yr8-2-002',
    topic: 'DATA_INTERPRETATION',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'Club B\'s last 5 home attendances (in thousands) were:\n\n10, 18, 9, 14, 11\n\nWhat is the mean attendance for Club B?\n\nGive your answer to 1 decimal place.',
    answerFn: _v => 12.4,
    answerFormula: '(10 + 18 + 9 + 14 + 11) / 5 = 62 / 5 = 12.4',
    unit: 'thousand fans',
    hints: [
      'Mean = total ÷ number of values.',
      'Add the five attendance figures together.',
      '10 + 18 + 9 + 14 + 11 = 62. Divide by 5.',
    ],
    explanation: 'Step 1: Add all values: 10 + 18 + 9 + 14 + 11 = 62.\nStep 2: Divide by 5: 62 ÷ 5 = 12.4.\nAnswer: mean = 12.4 thousand fans.',
    context: 'Marcus Webb (Assistant Manager): "Their average crowd is 12,400. That\'s more than ours — tells you something about their financial backing."',
  },

  {
    id: 'dat-yr8-2-003',
    topic: 'DATA_INTERPRETATION',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A player\'s fitness scores out of 100 over 8 weeks were:\n\n72, 78, 74, 81, 79, 83, 85, 84\n\nWhat is the median fitness score?',
    answerFn: _v => 80,
    answerFormula: 'sorted: 72,74,78,79,81,83,84,85 → median = (79+81)/2 = 80',
    unit: '',
    hints: [
      'To find the median, first write the values in order from smallest to largest.',
      'Sorted values: 72, 74, 78, 79, 81, 83, 84, 85. With 8 values, the median is the average of the 4th and 5th values.',
      '4th value = 79, 5th value = 81. Median = (79 + 81) ÷ 2.',
    ],
    explanation: 'Step 1: Sort the values in order:\n72, 74, 78, 79, 81, 83, 84, 85\nStep 2: With 8 values (even number), the median is the mean of the 4th and 5th values.\n4th = 79, 5th = 81.\nStep 3: Median = (79 + 81) ÷ 2 = 160 ÷ 2 = 80.\nAnswer: median fitness score = 80.',
    context: 'Marcus Webb (Assistant Manager): "Fitness scores have been trending up across the season. The median gives us a cleaner picture than the mean — less affected by that dip in Week 1."',
  },

  // ── DIFFICULTY 3 (Year 9) ──────────────────────────────────────────────────

  {
    id: 'dat-yr9-3-001',
    topic: 'DATA_INTERPRETATION',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'A goalkeeper\'s save percentages over 9 matches were:\n\n68, 72, 75, 71, 69, 74, 73, 70, 11\n\nThe score of 11 is an outlier — the goalkeeper was taken off early due to injury.\n\nWhat is the mean save percentage without the outlier?\n\nGive your answer to 1 decimal place.',
    answerFn: _v => 71.5,
    answerFormula: '(68+72+75+71+69+74+73+70) / 8 = 572 / 8 = 71.5',
    unit: '%',
    hints: [
      'Remove the outlier (11) and calculate the mean of the remaining 8 values.',
      'Add the 8 remaining values: 68 + 72 + 75 + 71 + 69 + 74 + 73 + 70.',
      '68 + 72 + 75 + 71 + 69 + 74 + 73 + 70 = 572. Divide by 8.',
    ],
    explanation: 'Step 1: Remove the outlier (11).\nStep 2: Sum the remaining 8 values:\n68 + 72 + 75 + 71 + 69 + 74 + 73 + 70 = 572\nStep 3: Mean = 572 ÷ 8 = 71.5\nAnswer: 71.5%.',
    context: 'Dani Reyes (Head Scout): "That 11% was when he limped off after 12 minutes. Remove it and his true average is much more respectable."',
  },

  {
    id: 'dat-yr9-3-002',
    topic: 'DATA_INTERPRETATION',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'A club uses a weighted performance score for strikers.\n\nGoals scored count with a weight of 2.\nAssists count with a weight of 1.\n\nA striker scored 12 goals and provided 8 assists in a season.\n\nCalculate his weighted performance score.',
    answerFn: _v => 32,
    answerFormula: '2 × 12 + 1 × 8 = 24 + 8 = 32',
    unit: 'points',
    hints: [
      'Weighted score = (weight × value) for each category, then add them together.',
      'Goals contribution = 2 × 12. Assists contribution = 1 × 8.',
      '2 × 12 = 24. 1 × 8 = 8. Add these together.',
    ],
    explanation: 'Step 1: Goals contribution = 2 × 12 = 24.\nStep 2: Assists contribution = 1 × 8 = 8.\nStep 3: Weighted score = 24 + 8 = 32.\nAnswer: 32 points.',
    context: 'Dani Reyes (Head Scout): "We weight goals more heavily than assists because goals win games. A weighted score of 32 is excellent for a season."',
  },

  {
    id: 'dat-yr9-3-003',
    topic: 'DATA_INTERPRETATION',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'Two clubs\' last 5 match attendances (in thousands) were:\n\nClub A: 14, 15, 13, 16, 12\nClub B: 10, 18, 8, 20, 14\n\nBoth clubs have the same mean attendance.\n\nClub B has a larger range.\n\nWhat is Club B\'s range?\n\nYou may verify: Club A\'s mean = Club B\'s mean = 14 thousand.',
    answerFn: _v => 12,
    answerFormula: '20 - 8 = 12',
    unit: 'thousand fans',
    hints: [
      'Range = largest value − smallest value. Use Club B\'s attendance figures.',
      'Club B\'s attendances: 10, 18, 8, 20, 14. Find the largest and smallest values.',
      'Largest = 20, Smallest = 8. Range = 20 − 8.',
    ],
    explanation: 'Club B attendances: 10, 18, 8, 20, 14.\nVerify mean: (10 + 18 + 8 + 20 + 14) ÷ 5 = 70 ÷ 5 = 14 ✓\nRange = 20 − 8 = 12.\nAnswer: Club B\'s range = 12 thousand fans.\n\nNote: Both clubs average 14,000 fans, but Club B\'s support is far less consistent.',
    context: 'Marcus Webb (Assistant Manager): "Same average, but Club B\'s crowds swing wildly. That inconsistency in revenue makes long-term planning very difficult for them."',
  },
];
