/**
 * Question Bank — BASIC_ALGEBRA topic
 *
 * 10 questions across three difficulty bands (all fixed valueScale):
 *   D1 (Year 7)  — one-step equations (ax = b, x + a = b, basic substitution)
 *   D2 (Year 8)  — two-step equations (ax + b = c), formula evaluation
 *   D3 (Year 9)  — simultaneous equations, forming and solving multi-step
 */
import { QuestionBank } from './types';

export const algebraBank: QuestionBank = [

  // ── DIFFICULTY 1 (Year 7) ──────────────────────────────────────────────────

  {
    id: 'alg-yr7-1-001',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A club pays each of its 4 coaches the same weekly wage.\n\nThe total weekly coaching bill is £3,200.\n\nWhat is each coach\'s weekly wage?\n\nWrite and solve the equation: 4w = 3,200.\n\nGive your answer in pounds.',
    answerFn: _v => 800,
    answerFormula: '3200 / 4 = 800',
    unit: '£',
    hints: [
      'In the equation 4w = 3,200, w is the unknown wage. To find w, divide both sides by 4.',
      'Divide both sides of 4w = 3,200 by 4.',
      '4w ÷ 4 = 3,200 ÷ 4. So w = ?',
    ],
    explanation: 'Equation: 4w = 3,200\nDivide both sides by 4:\nw = 3,200 ÷ 4 = 800\nAnswer: £800 per week.',
    context: 'Val Hartley (CFO): "We pay all four coaches the same rate. Work out the individual wage from the total bill."',
  },

  {
    id: 'alg-yr7-1-002',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A player\'s wage increased by £500 per week.\n\nHe now earns £3,200 per week.\n\nWhat was his original weekly wage?\n\nWrite and solve the equation: w + 500 = 3,200.\n\nGive your answer in pounds.',
    answerFn: _v => 2700,
    answerFormula: '3200 - 500 = 2700',
    unit: '£',
    hints: [
      'In w + 500 = 3,200, you need to get w on its own. Subtract 500 from both sides.',
      'w + 500 − 500 = 3,200 − 500.',
      'w = 3,200 − 500 = ?',
    ],
    explanation: 'Equation: w + 500 = 3,200\nSubtract 500 from both sides:\nw = 3,200 − 500 = 2,700\nAnswer: £2,700 per week.',
    context: 'Marcus Webb (Assistant Manager): "He got a £500 rise after his first season. Work backwards to find what he was earning before."',
  },

  {
    id: 'alg-yr7-1-003',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'Tickets for a match cost £t each.\n\n300 tickets are sold and the total revenue is £7,500.\n\nWrite and solve an equation to find t.\n\nGive your answer in pounds.',
    answerFn: _v => 25,
    answerFormula: '7500 / 300 = 25',
    unit: '£',
    hints: [
      'Total revenue = price per ticket × number of tickets. Write this as: 300t = 7,500.',
      'To find t, divide both sides of 300t = 7,500 by 300.',
      '300t ÷ 300 = 7,500 ÷ 300. So t = ?',
    ],
    explanation: 'Equation: 300t = 7,500\nDivide both sides by 300:\nt = 7,500 ÷ 300 = 25\nAnswer: £25 per ticket.',
    context: 'Val Hartley (CFO): "We need to reverse-engineer the ticket price from last week\'s gate receipt. 300 fans, £7,500 revenue."',
  },

  // ── DIFFICULTY 2 (Year 8) ──────────────────────────────────────────────────

  {
    id: 'alg-yr8-2-001',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A player earns a basic weekly wage of £w plus a £500 bonus for every goal scored.\n\nLast week he scored 3 goals and earned £2,900 in total.\n\nFind his basic weekly wage.\n\nForm and solve the equation: w + 3 × 500 = 2,900.\n\nGive your answer in pounds.',
    answerFn: _v => 1400,
    answerFormula: '2900 - 1500 = 1400',
    unit: '£',
    hints: [
      'The equation is: w + (3 × 500) = 2,900. First calculate 3 × 500.',
      '3 × 500 = 1,500. The equation becomes: w + 1,500 = 2,900.',
      'Subtract 1,500 from both sides: w = 2,900 − 1,500.',
    ],
    explanation: 'Equation: w + 3 × 500 = 2,900\nStep 1: 3 × 500 = 1,500.\nStep 2: w + 1,500 = 2,900.\nStep 3: w = 2,900 − 1,500 = 1,400.\nAnswer: £1,400 per week.',
    context: 'Val Hartley (CFO): "Performance bonuses complicate the wage bill — you need algebra to unpick what the base salary actually is."',
  },

  {
    id: 'alg-yr8-2-002',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A stadium has r rows of seats. Each row has 42 seats.\n\nThere is also a VIP section with 84 seats.\n\nThe total capacity is 2,604 seats.\n\nFind r.\n\nForm and solve the equation: 42r + 84 = 2,604.',
    answerFn: _v => 60,
    answerFormula: '(2604 - 84) / 42 = 60',
    unit: 'rows',
    hints: [
      'The equation is 42r + 84 = 2,604. Subtract 84 from both sides first.',
      '42r = 2,604 − 84 = 2,520.',
      'Divide both sides by 42: r = 2,520 ÷ 42.',
    ],
    explanation: 'Equation: 42r + 84 = 2,604\nStep 1: Subtract 84 from both sides:\n42r = 2,520\nStep 2: Divide both sides by 42:\nr = 2,520 ÷ 42 = 60\nAnswer: 60 rows.',
    context: 'Kev the Groundskeeper: "I need to know how many rows we\'re repainting. Total capacity includes the VIP section, so we need to work backwards."',
  },

  {
    id: 'alg-yr8-2-003',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A club\'s matchday costs are calculated using the formula:\n\nC = 1,500 + 12n\n\nwhere n is the number of fans attending and C is the cost in pounds.\n\nHow much does it cost when 3,200 fans attend?\n\nGive your answer in pounds.',
    answerFn: _v => 39900,
    answerFormula: '1500 + 12 × 3200 = 39900',
    unit: '£',
    hints: [
      'Substitute n = 3,200 into the formula C = 1,500 + 12n.',
      'C = 1,500 + 12 × 3,200.',
      '12 × 3,200 = 38,400. Add 1,500 to this.',
    ],
    explanation: 'Substitute n = 3,200:\nC = 1,500 + 12 × 3,200\nC = 1,500 + 38,400\nC = 39,900\nAnswer: £39,900.',
    context: 'Val Hartley (CFO): "Our fixed costs are £1,500 regardless of attendance. After that, every fan adds £12 in variable costs — stewarding, utilities, cleaning."',
  },

  // ── DIFFICULTY 3 (Year 9) ──────────────────────────────────────────────────

  {
    id: 'alg-yr9-3-001',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'Club A has twice as many points as Club B.\n\nTogether they have 63 points.\n\nForm two equations and solve to find how many points Club A has.',
    answerFn: _v => 42,
    answerFormula: 'A = 2B, A + B = 63 → 3B = 63, B = 21, A = 42',
    unit: 'points',
    hints: [
      'Let B = Club B\'s points. Then Club A\'s points = 2B.\nWrite a second equation using their total: 2B + B = 63.',
      'Simplify: 3B = 63. Divide both sides by 3 to find B.',
      'B = 63 ÷ 3 = 21. Now find A: A = 2 × 21 = 42.',
    ],
    explanation: 'Let B = Club B\'s points.\nEquation 1: A = 2B\nEquation 2: A + B = 63\nSubstitute Equation 1 into Equation 2:\n2B + B = 63\n3B = 63\nB = 21\nA = 2 × 21 = 42\nAnswer: Club A has 42 points.',
    context: 'Marcus Webb (Assistant Manager): "The gap between us and second place is right there in the table. Set up the equations and it becomes obvious."',
  },

  {
    id: 'alg-yr9-3-002',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'Two players together earn £8,400 per week.\n\nThe striker earns £1,200 more per week than the goalkeeper.\n\nWhat is the goalkeeper\'s weekly wage?\n\nGive your answer in pounds.',
    answerFn: _v => 3600,
    answerFormula: 's + g = 8400, s = g + 1200 → 2g + 1200 = 8400 → g = 3600',
    unit: '£',
    hints: [
      'Let g = goalkeeper\'s wage. The striker earns g + 1,200.\nWrite the total: g + (g + 1,200) = 8,400.',
      'Simplify: 2g + 1,200 = 8,400. Subtract 1,200 from both sides.',
      '2g = 7,200. Divide both sides by 2.',
    ],
    explanation: 'Let g = goalkeeper\'s wage.\nStriker\'s wage = g + 1,200.\nEquation: g + (g + 1,200) = 8,400\n2g + 1,200 = 8,400\n2g = 7,200\ng = 3,600\nAnswer: £3,600 per week.',
    context: 'Val Hartley (CFO): "The combined wage is agreed, but they negotiated separately. I need the individual figures for the accounts."',
  },

  {
    id: 'alg-yr9-3-003',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'A youth player\'s weekly wage increases by the same fixed amount each year.\n\nIn Year 1 he earns £300 per week.\nIn Year 4 he earns £750 per week.\n\nWhat is the fixed annual increase in his weekly wage?\n\nGive your answer in pounds.',
    answerFn: _v => 150,
    answerFormula: '(750 - 300) / (4 - 1) = 450 / 3 = 150',
    unit: '£',
    hints: [
      'From Year 1 to Year 4 there are 3 equal annual increases.',
      'Total increase = £750 − £300 = £450.',
      '£450 ÷ 3 increases = £150 per year.',
    ],
    explanation: 'Step 1: Number of increases from Year 1 to Year 4 = 4 − 1 = 3.\nStep 2: Total increase = £750 − £300 = £450.\nStep 3: Annual increase = £450 ÷ 3 = £150.\nAnswer: £150 per year.',
    context: 'Val Hartley (CFO): "Youth contracts always include a fixed annual escalator. Work out the step-up before we commit to the full contract term."',
  },

  {
    id: 'alg-yr9-3-004',
    topic: 'BASIC_ALGEBRA',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'A manager\'s contract includes a base annual salary of £B, plus a £5,000 bonus for every league position above 10th.\n\nLast season the manager finished 6th and earned £75,000 in total.\n\nForm and solve an equation to find B.\n\nGive your answer in pounds.',
    answerFn: _v => 55000,
    answerFormula: 'B + 4 × 5000 = 75000 → B = 55000',
    unit: '£',
    hints: [
      'Finishing 6th is 4 positions above 10th (10 − 6 = 4), so the bonus is 4 × £5,000.',
      'Equation: B + 4 × 5,000 = 75,000. Simplify the bonus first.',
      '4 × 5,000 = 20,000. So B + 20,000 = 75,000. Subtract 20,000 from both sides.',
    ],
    explanation: 'Positions above 10th = 10 − 6 = 4.\nBonus = 4 × £5,000 = £20,000.\nEquation: B + 20,000 = 75,000\nB = 75,000 − 20,000 = 55,000\nAnswer: £55,000 base salary.',
    context: 'Val Hartley (CFO): "The bonus clause rewards top-half finishes handsomely. But the base salary is the guaranteed part — work it out from last season\'s earnings."',
  },
];
