/**
 * Question Bank — DECIMALS topic
 *
 * 10 questions across three difficulty bands:
 *   D1 (Year 7)  — simple decimal operations, reading to 1dp or 2dp
 *   D2 (Year 8)  — multi-step decimal calculations, decimal × decimal
 *   D3 (Year 9)  — decimal equations, sequences with negative step, multi-step
 */
import { QuestionBank } from './types';

export const decimalsBank: QuestionBank = [

  // ── DIFFICULTY 1 (Year 7) ──────────────────────────────────────────────────

  {
    id: 'dec-yr7-1-001',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'division',
    template: 'This season you have scored {{goalsFor}} goals in {{played}} matches.\n\nHow many goals per game is that?\n\nGive your answer to 1 decimal place.',
    answerFn: v => Math.round((v.goalsFor / Math.max(v.played, 1)) * 10) / 10,
    answerFormula: 'round(goalsFor / played, 1dp)',
    unit: 'goals/game',
    hints: [
      'Goals per game = total goals ÷ number of games.',
      'Divide {{goalsFor}} by {{played}}.',
      '{{goalsFor}} ÷ {{played}} = ? Round your answer to 1 decimal place.',
    ],
    explanation: 'Step 1: Divide total goals by games played:\n{{goalsFor}} ÷ {{played}}\nStep 2: Round to 1 decimal place.\nAnswer: {{goalsForPerGame}} goals per game.',
    context: 'Marcus Webb (Assistant Manager): "Goals per game is the key attacking metric. Anything above 1.5 and we\'re a genuine promotion threat."',
  },

  {
    id: 'dec-yr7-1-002',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'division',
    template: 'You have {{points}} points from {{played}} games.\n\nWhat is your points per game?\n\nGive your answer to 1 decimal place.',
    answerFn: v => Math.round((v.points / Math.max(v.played, 1)) * 10) / 10,
    answerFormula: 'round(points / played, 1dp)',
    unit: 'pts/game',
    hints: [
      'Points per game = total points ÷ number of games played.',
      'Divide {{points}} by {{played}}.',
      '{{points}} ÷ {{played}} = ? Round to 1 decimal place.',
    ],
    explanation: 'Step 1: Divide total points by games played:\n{{points}} ÷ {{played}}\nStep 2: Round to 1 decimal place.\nAnswer: {{pointsPerGame}} points per game.',
    context: 'Marcus Webb (Assistant Manager): "League managers talk about points-per-game constantly. You need above 1.7 to finish in the top seven over a full season."',
  },

  {
    id: 'dec-yr7-1-003',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A player earns £3,640 per week.\n\nHow much does he earn per day?\n\nGive your answer in pounds.',
    answerFn: _v => 520,
    answerFormula: '3640 / 7 = 520',
    unit: '£',
    hints: [
      'There are 7 days in a week. Divide the weekly wage by 7.',
      '£3,640 ÷ 7 = ?',
      'Think: £3,640 ÷ 7. You can check by multiplying your answer by 7 to get back to £3,640.',
    ],
    explanation: 'Step 1: Divide the weekly wage by 7:\n£3,640 ÷ 7 = £520\nAnswer: £520 per day.',
    context: 'Val Hartley (CFO): "For payroll purposes we sometimes need the daily rate. A simple division by 7."',
  },

  {
    id: 'dec-yr7-1-004',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'For VIP match-day guests, the club spends:\n\n£14.75 per programme\n£8.50 per match magazine\n£3.25 per lanyard\n\nWhat is the total cost per guest?\n\nGive your answer in pounds.',
    answerFn: _v => 26.50,
    answerFormula: '14.75 + 8.50 + 3.25 = 26.50',
    unit: '£',
    hints: [
      'Add the three costs together. Line up the decimal points when adding.',
      'Start with £14.75 + £8.50, then add £3.25.',
      '£14.75 + £8.50 = £23.25. Now add £3.25.',
    ],
    explanation: 'Step 1: £14.75 + £8.50 = £23.25.\nStep 2: £23.25 + £3.25 = £26.50.\nAnswer: £26.50 per guest.',
    context: 'Val Hartley (CFO): "VIP hospitality costs add up quickly. We need the per-head cost before we can price the packages."',
  },

  // ── DIFFICULTY 2 (Year 8) ──────────────────────────────────────────────────

  {
    id: 'dec-yr8-2-001',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'Player A earns £4,056 per week.\n\nPlayer B earns £198,744 per year.\n\nHow much more does Player A earn per week than Player B?\n\nGive your answer in pounds.',
    answerFn: _v => 234,
    answerFormula: '4056 - (198744 / 52) = 4056 - 3822 = 234',
    unit: '£',
    hints: [
      'To compare weekly wages, convert Player B\'s annual salary to a weekly figure. Divide by 52.',
      'Player B\'s weekly wage = £198,744 ÷ 52.',
      '£198,744 ÷ 52 = £3,822. Now subtract from Player A\'s weekly wage: £4,056 − £3,822.',
    ],
    explanation: 'Step 1: Convert Player B\'s annual salary to weekly:\n£198,744 ÷ 52 = £3,822 per week.\nStep 2: Find the difference:\n£4,056 − £3,822 = £234.\nAnswer: Player A earns £234 more per week.',
    context: 'Val Hartley (CFO): "Always convert to the same time period before comparing. Annual versus weekly contracts catch people out all the time."',
  },

  {
    id: 'dec-yr8-2-002',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'Agent fees are calculated at 5% of the transfer fee.\n\nA transfer fee is £740,000.\n\nCalculate the agent fee.\n\nGive your answer in pounds.',
    answerFn: _v => 37000,
    answerFormula: '740000 × 0.05 = 37000',
    unit: '£',
    hints: [
      'To find 5% of an amount, multiply by 0.05 (or divide by 100 and multiply by 5).',
      '5% of £740,000 = £740,000 × 0.05.',
      '£740,000 × 0.05 = ? (hint: find 10% first, then halve it).',
    ],
    explanation: 'Step 1: Convert 5% to a decimal: 5 ÷ 100 = 0.05.\nStep 2: Multiply: £740,000 × 0.05 = £37,000.\nAlternatively: 10% = £74,000; 5% = £74,000 ÷ 2 = £37,000.\nAnswer: £37,000.',
    context: 'Val Hartley (CFO): "The agent always takes their 5%. It comes straight off the transfer budget — don\'t forget to factor it in."',
  },

  {
    id: 'dec-yr8-2-003',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A ground improvement project costs £1,250,000 in Year 1.\n\nIn Year 2 the cost is 0.8 times the Year 1 cost.\n\nWhat is the total cost over both years?\n\nGive your answer in pounds.',
    answerFn: _v => 2250000,
    answerFormula: '1250000 + 1250000 × 0.8 = 1250000 + 1000000 = 2250000',
    unit: '£',
    hints: [
      'First calculate the Year 2 cost: multiply £1,250,000 by 0.8.',
      'Year 2 cost = £1,250,000 × 0.8 = £1,000,000.',
      'Total cost = Year 1 + Year 2 = £1,250,000 + £1,000,000.',
    ],
    explanation: 'Step 1: Year 2 cost = £1,250,000 × 0.8 = £1,000,000.\nStep 2: Total cost = £1,250,000 + £1,000,000 = £2,250,000.\nAnswer: £2,250,000.',
    context: 'Kev the Groundskeeper: "Year 2 is always cheaper because the big structural work is done. But two years of costs combined is still a serious number."',
  },

  // ── DIFFICULTY 3 (Year 9) ──────────────────────────────────────────────────

  {
    id: 'dec-yr9-3-001',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'A player\'s pace rating decreases by 0.8 per year after the age of 30.\n\nAt age 30 he is rated 78.4.\n\nWhat will his pace rating be at age 33?\n\nGive your answer to 1 decimal place.',
    answerFn: _v => 76.0,
    answerFormula: '78.4 - 3 × 0.8 = 78.4 - 2.4 = 76.0',
    unit: '',
    hints: [
      'From age 30 to age 33 is 3 years. Calculate the total decrease over 3 years.',
      'Total decrease = 3 × 0.8 = 2.4.',
      'New rating = 78.4 − 2.4 = ?',
    ],
    explanation: 'Step 1: Number of years = 33 − 30 = 3.\nStep 2: Total decrease = 3 × 0.8 = 2.4.\nStep 3: Rating at 33 = 78.4 − 2.4 = 76.0.\nAnswer: 76.0.',
    context: 'Dani Reyes (Head Scout): "Pace drops predictably after 30 — 0.8 per year in our model. Important to know when signing older players on multi-year deals."',
  },

  {
    id: 'dec-yr9-3-002',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'A player received a 15% pay rise and now earns £4,140 per week.\n\nThis can be written as:\n\n1.15p = 4,140\n\nwhere p is his original weekly wage.\n\nSolve the equation to find p.\n\nGive your answer in pounds.',
    answerFn: _v => 3600,
    answerFormula: '4140 / 1.15 = 3600',
    unit: '£',
    hints: [
      'To solve 1.15p = 4,140, divide both sides by 1.15.',
      'p = 4,140 ÷ 1.15.',
      '4,140 ÷ 1.15 = ? (Tip: multiply top and bottom by 100 to give 414,000 ÷ 115 = 3,600.)',
    ],
    explanation: 'Equation: 1.15p = 4,140\nDivide both sides by 1.15:\np = 4,140 ÷ 1.15 = 3,600\nAnswer: £3,600 per week.',
    context: 'Val Hartley (CFO): "He got his 15% rise last summer. I need the original figure for the pay-band review — divide his current wage by 1.15."',
  },

  {
    id: 'dec-yr9-3-003',
    topic: 'DECIMALS',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'A player\'s release clause is calculated as:\n\n2.5 times his transfer value, plus a £500,000 levy.\n\nHis current transfer value is £1,800,000.\n\nWhat is his release clause?\n\nGive your answer in pounds.',
    answerFn: _v => 5000000,
    answerFormula: '2.5 × 1800000 + 500000 = 4500000 + 500000 = 5000000',
    unit: '£',
    hints: [
      'First calculate 2.5 times his transfer value.',
      '2.5 × £1,800,000 = £4,500,000.',
      'Add the £500,000 levy: £4,500,000 + £500,000.',
    ],
    explanation: 'Step 1: 2.5 × £1,800,000 = £4,500,000.\nStep 2: Add the levy: £4,500,000 + £500,000 = £5,000,000.\nAnswer: £5,000,000.',
    context: 'Val Hartley (CFO): "Release clauses are always calculated on the same formula. At his current value, triggering the clause is extremely expensive — which is exactly the point."',
  },
];
