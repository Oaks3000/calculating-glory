/**
 * Question Bank — RATIOS topic
 *
 * 9 questions across three difficulty bands:
 *   D1 (Year 7)  — divide in ratio, simplify, scale factor
 *   D2 (Year 8)  — 3-part ratios, unequal shares, division-scaled budgets
 *   D3 (Year 9)  — ratio with unknown, ratio combined with algebra
 */
import { QuestionBank } from './types';

export const ratiosBank: QuestionBank = [

  // ── DIFFICULTY 1 (Year 7) ──────────────────────────────────────────────────

  {
    id: 'rat-yr7-1-001',
    topic: 'RATIOS',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'Prize money of £450,000 is shared between two clubs in the ratio 3:2.\n\nThe first-placed club gets the larger share.\n\nHow much does the first-placed club receive?\n\nGive your answer in pounds.',
    answerFn: _v => 270000,
    answerFormula: '(3 / 5) × 450000 = 270000',
    unit: '£',
    hints: [
      'Find the total number of parts first: add the two numbers in the ratio together.',
      'Total parts = 3 + 2 = 5. The first club gets 3 out of every 5 parts.',
      'Each part = £450,000 ÷ 5 = £90,000. First club gets 3 parts: 3 × £90,000.',
    ],
    explanation: 'Step 1: Total parts = 3 + 2 = 5.\nStep 2: Value of one part = £450,000 ÷ 5 = £90,000.\nStep 3: First club\'s share = 3 × £90,000 = £270,000.\nAnswer: £270,000.',
    context: 'Val Hartley (CFO): "The league always splits prize money in a 3:2 ratio between the two cup finalists. Finishing first makes a big difference."',
  },

  {
    id: 'rat-yr7-1-002',
    topic: 'RATIOS',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'The club employs staff and volunteers in the ratio 24:16.\n\nWrite this ratio in its simplest form.\n\nWhat is the value of a when the simplified ratio is written as a:b?',
    answerFn: _v => 3,
    answerFormula: 'HCF(24, 16) = 8; 24 ÷ 8 = 3',
    unit: '',
    hints: [
      'To simplify a ratio, divide both numbers by their highest common factor (HCF).',
      'Factors of 24: 1, 2, 3, 4, 6, 8, 12, 24. Factors of 16: 1, 2, 4, 8, 16. The HCF is 8.',
      'Divide both numbers by 8: 24 ÷ 8 = 3, and 16 ÷ 8 = 2. The simplified ratio is 3:2.',
    ],
    explanation: 'Step 1: Find the HCF of 24 and 16.\nFactors of 24: 1, 2, 3, 4, 6, 8, 12, 24\nFactors of 16: 1, 2, 4, 8, 16\nHCF = 8.\nStep 2: Divide both parts by 8:\n24 ÷ 8 = 3, 16 ÷ 8 = 2.\nSimplified ratio = 3:2.\nAnswer: a = 3.',
    context: 'Val Hartley (CFO): "I always insist on simplified ratios in the staff reports — much easier to read at a glance."',
  },

  {
    id: 'rat-yr7-1-003',
    topic: 'RATIOS',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A squad of 18 players is made up of attackers, midfielders and defenders in the ratio 1:2:3.\n\nHow many defenders are in the squad?',
    answerFn: _v => 9,
    answerFormula: '(3 / 6) × 18 = 9',
    unit: 'players',
    hints: [
      'Add up all the parts of the ratio to find the total number of parts.',
      'Total parts = 1 + 2 + 3 = 6. Defenders have 3 out of every 6 parts.',
      'Each part = 18 ÷ 6 = 3 players. Defenders = 3 × 3 = 9.',
    ],
    explanation: 'Step 1: Total parts = 1 + 2 + 3 = 6.\nStep 2: Value of one part = 18 ÷ 6 = 3 players.\nStep 3: Defenders = 3 parts × 3 = 9 players.\nAnswer: 9 defenders.',
    context: 'Marcus Webb (Assistant Manager): "A 1:2:3 split is quite defensive. We might need to look at the balance if we\'re struggling to score."',
  },

  {
    id: 'rat-yr7-1-004',
    topic: 'RATIOS',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'The ratio of home wins to away wins this season is 4:1.\n\nYou have 8 home wins.\n\nHow many away wins do you have?',
    answerFn: _v => 2,
    answerFormula: '8 / 4 = 2 (scale factor), 1 × 2 = 2',
    unit: 'wins',
    hints: [
      'If the ratio is 4:1 and you have 8 home wins, work out how many times bigger 8 is compared to 4.',
      '8 ÷ 4 = 2. This means the scale factor is 2.',
      'Multiply the away wins part of the ratio (1) by the scale factor (2): 1 × 2 = 2.',
    ],
    explanation: 'Step 1: Find the scale factor: 8 ÷ 4 = 2.\nStep 2: Multiply the away wins part by the scale factor: 1 × 2 = 2.\nAnswer: 2 away wins.',
    context: 'Marcus Webb (Assistant Manager): "Four home wins for every away win is a common pattern — away matches are always tougher."',
  },

  // ── DIFFICULTY 2 (Year 8) ──────────────────────────────────────────────────

  {
    id: 'rat-yr8-2-001',
    topic: 'RATIOS',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'division',
    template: 'Your transfer budget is £{{transferBudgetPounds}}.\n\nYou decide to split it between buying a striker and a goalkeeper in the ratio 3:2.\n\nHow much do you spend on the striker?\n\nGive your answer in pounds.',
    answerFn: v => Math.round(v.transferBudgetPounds * 3 / 5),
    answerFormula: 'transferBudgetPounds × (3/5)',
    unit: '£',
    hints: [
      'Find the total number of parts: 3 + 2 = 5.',
      'Each part = £{{transferBudgetPounds}} ÷ 5. The striker gets 3 parts.',
      'Striker\'s share = 3 × (£{{transferBudgetPounds}} ÷ 5).',
    ],
    explanation: 'Step 1: Total parts = 3 + 2 = 5.\nStep 2: One part = £{{transferBudgetPounds}} ÷ 5.\nStep 3: Striker\'s share = 3 × (£{{transferBudgetPounds}} ÷ 5).\nAnswer: £{{transferBudgetPounds}} × 3 ÷ 5.',
    context: 'Dani Reyes (Head Scout): "I\'d put the bigger share into the striker — goals win games. But make sure the goalkeeper budget still buys someone reliable."',
  },

  {
    id: 'rat-yr8-2-002',
    topic: 'RATIOS',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A club splits its £240,000 kit and travel budget in the ratio 5:3.\n\nHow much is spent on kit?\n\nGive your answer in pounds.',
    answerFn: _v => 150000,
    answerFormula: '(5 / 8) × 240000 = 150000',
    unit: '£',
    hints: [
      'Add the parts of the ratio: 5 + 3 = 8 parts in total.',
      'Each part = £240,000 ÷ 8 = £30,000.',
      'Kit budget = 5 × £30,000 = £150,000.',
    ],
    explanation: 'Step 1: Total parts = 5 + 3 = 8.\nStep 2: One part = £240,000 ÷ 8 = £30,000.\nStep 3: Kit budget = 5 × £30,000 = £150,000.\nAnswer: £150,000.',
    context: 'Val Hartley (CFO): "Kit costs always outweigh travel for lower-league clubs. A 5:3 split reflects that."',
  },

  {
    id: 'rat-yr8-2-003',
    topic: 'RATIOS',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A club splits its £320,000 stadium improvement budget between ground improvements, hospitality and marketing in the ratio 4:3:1.\n\nHow much is spent on hospitality?\n\nGive your answer in pounds.',
    answerFn: _v => 120000,
    answerFormula: '(3 / 8) × 320000 = 120000',
    unit: '£',
    hints: [
      'Add all three parts of the ratio: 4 + 3 + 1 = 8 parts in total.',
      'Each part = £320,000 ÷ 8 = £40,000.',
      'Hospitality = 3 parts × £40,000 = £120,000.',
    ],
    explanation: 'Step 1: Total parts = 4 + 3 + 1 = 8.\nStep 2: One part = £320,000 ÷ 8 = £40,000.\nStep 3: Hospitality share = 3 × £40,000 = £120,000.\nAnswer: £120,000.',
    context: 'Val Hartley (CFO): "The board insisted hospitality gets at least 3 parts of the budget. It\'s where we make the most money per person through the gate."',
  },

  // ── DIFFICULTY 3 (Year 9) ──────────────────────────────────────────────────

  {
    id: 'rat-yr9-3-001',
    topic: 'RATIOS',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'Stadium revenue is split between the players\' bonus pool and club reinvestment in the ratio 5:3.\n\nThe bonus pool receives £75,000 more than the reinvestment fund.\n\nWhat is the total revenue shared?\n\nGive your answer in pounds.',
    answerFn: _v => 300000,
    answerFormula: 'difference = 2 parts = £75000, so 1 part = £37500, total = 8 × 37500 = 300000',
    unit: '£',
    hints: [
      'The difference between the two shares corresponds to the difference in the ratio parts: 5 − 3 = 2 parts.',
      '2 parts = £75,000, so 1 part = £75,000 ÷ 2 = £37,500.',
      'Total parts = 5 + 3 = 8. Total revenue = 8 × £37,500.',
    ],
    explanation: 'Step 1: Difference in ratio = 5 − 3 = 2 parts.\nStep 2: 2 parts = £75,000, so 1 part = £37,500.\nStep 3: Total parts = 8.\nStep 4: Total revenue = 8 × £37,500 = £300,000.\nAnswer: £300,000.',
    context: 'Val Hartley (CFO): "The players know the bonus pool is always bigger than reinvestment. What they don\'t always realise is how to work backwards from the difference."',
  },

  {
    id: 'rat-yr9-3-002',
    topic: 'RATIOS',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'division',
    template: 'Two clubs share a cup prize fund of £{{transferBudgetPounds}} in the ratio 7:3.\n\nHow much does the club with the smaller share receive?\n\nGive your answer in pounds.',
    answerFn: v => Math.round(v.transferBudgetPounds * 3 / 10),
    answerFormula: 'transferBudgetPounds × (3/10)',
    unit: '£',
    hints: [
      'Total parts = 7 + 3 = 10.',
      'One part = £{{transferBudgetPounds}} ÷ 10.',
      'Smaller share = 3 parts × (£{{transferBudgetPounds}} ÷ 10).',
    ],
    explanation: 'Step 1: Total parts = 7 + 3 = 10.\nStep 2: One part = £{{transferBudgetPounds}} ÷ 10.\nStep 3: Smaller share (3 parts) = 3 × (£{{transferBudgetPounds}} ÷ 10).\nAnswer: £{{transferBudgetPounds}} × 3 ÷ 10.',
    context: 'Marcus Webb (Assistant Manager): "Even the smaller share from a cup final pays for a decent pre-season. Don\'t underestimate it."',
  },
];
