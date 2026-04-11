/**
 * Question Bank — PERCENTAGES topic
 *
 * 11 questions across three difficulty bands:
 *   D1 (Year 7)  — single-step, whole numbers or easy decimals
 *   D2 (Year 8)  — two-step, decimal precision, percentage change
 *   D3 (Year 9)  — reverse percentage, compound growth, minimum-wins problem
 */
import { QuestionBank } from './types';

export const percentagesBank: QuestionBank = [

  // ── DIFFICULTY 1 (Year 7) ──────────────────────────────────────────────────

  {
    id: 'pct-yr7-1-001',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'division',
    template: 'Your transfer budget is £{{transferBudgetK}}k.\n\nThe board says you can spend a maximum of 25% on one signing.\n\nWhat is the largest transfer fee you could pay?\n\nGive your answer in pounds.',
    answerFn: v => Math.round(v.transferBudgetPounds * 0.25),
    answerFormula: 'transferBudgetPounds × 0.25',
    unit: '£',
    hints: [
      'To find a percentage of an amount, divide by 100, then multiply by the percentage.',
      'Find 1% first: £{{transferBudgetPounds}} ÷ 100. Then multiply your answer by 25.',
      '25% = half of 50%. Find 50% of £{{transferBudgetPounds}} (divide by 2), then halve that result.',
    ],
    explanation: 'Step 1: Find 1% of £{{transferBudgetPounds}}:\n£{{transferBudgetPounds}} ÷ 100 = £{{transferBudgetK}}0\nStep 2: Multiply by 25:\n£{{transferBudgetK}}0 × 25 = £{{transferBudgetPounds}} × 0.25\nAnswer: £{{transferBudgetPounds}} × 0.25',
    context: 'Val Hartley (CFO): "The board have approved the spend, but they want to spread the risk — no more than 25% on a single player."',
  },

  {
    id: 'pct-yr7-1-002',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'division',
    template: 'This season you have played {{played}} games and won {{won}} of them.\n\nWhat percentage of games have you won?\n\nRound your answer to the nearest whole number.',
    answerFn: v => v.played > 0 ? Math.round((v.won / v.played) * 100) : 0,
    answerFormula: 'round((won / played) × 100)',
    unit: '%',
    hints: [
      'Percentage = (part ÷ whole) × 100.',
      'Divide the number of wins by the total number of games played: {{won}} ÷ {{played}}.',
      '{{won}} ÷ {{played}} × 100. Round your final answer to the nearest whole number.',
    ],
    explanation: 'Step 1: Divide wins by games played:\n{{won}} ÷ {{played}}\nStep 2: Multiply by 100 to convert to a percentage.\nStep 3: Round to the nearest whole number.\nAnswer: {{winRatePct}}%',
    context: 'Marcus Webb (Assistant Manager): "The board want to see a winning percentage above 50% to keep confidence up. Let\'s work out where we are."',
  },

  {
    id: 'pct-yr7-1-003',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'division',
    template: 'Your weekly wage bill is £{{wageBillWeeklyPounds}}.\n\nThe board want you to cut it by 20%.\n\nHow much would you save each week?\n\nGive your answer in pounds.',
    answerFn: v => Math.round(v.wageBillWeeklyPounds * 0.20),
    answerFormula: 'wageBillWeeklyPounds × 0.20',
    unit: '£',
    hints: [
      'To find a percentage of an amount, divide by 100 then multiply by the percentage.',
      'Find 10% of £{{wageBillWeeklyPounds}} first (divide by 10), then double it to get 20%.',
      '10% of £{{wageBillWeeklyPounds}} = £{{wageBillWeeklyPounds}} ÷ 10. Double this to find 20%.',
    ],
    explanation: 'Step 1: Find 10% of £{{wageBillWeeklyPounds}}:\n£{{wageBillWeeklyPounds}} ÷ 10\nStep 2: Double to find 20%:\n(£{{wageBillWeeklyPounds}} ÷ 10) × 2 = £{{wageBillWeeklyPounds}} × 0.20\nAnswer: £{{wageBillWeeklyPounds}} × 0.20',
    context: 'Val Hartley (CFO): "We need to trim the wage bill. A 20% cut across the squad would make a significant difference to our weekly outgoings."',
  },

  {
    id: 'pct-yr7-1-004',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A club sells 600 programmes at a match. 150 of them are sold in the first half.\n\nWhat percentage of programmes are sold in the first half?',
    answerFn: _v => 25,
    answerFormula: '(150 / 600) × 100 = 25',
    unit: '%',
    hints: [
      'Percentage = (part ÷ whole) × 100.',
      'Divide the first-half sales by the total sales: 150 ÷ 600.',
      '150 ÷ 600 = 0.25. Multiply by 100 to convert to a percentage.',
    ],
    explanation: 'Step 1: Divide first-half sales by total sales:\n150 ÷ 600 = 0.25\nStep 2: Multiply by 100:\n0.25 × 100 = 25%\nAnswer: 25%',
    context: 'Kev the Groundskeeper: "Interesting — the tuck shop does way more business at half-time than the first half. But programmes? People grab those before kick-off."',
  },

  // ── DIFFICULTY 2 (Year 8) ──────────────────────────────────────────────────

  {
    id: 'pct-yr8-2-001',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'division',
    template: 'Your weekly wage bill is £{{wageBillWeeklyPounds}} and your total wage reserve is £{{wageReservePounds}}.\n\nWhat percentage of your wage reserve is being spent each week?\n\nGive your answer to 1 decimal place.',
    answerFn: v => {
      if (v.wageReservePounds === 0) return 0;
      return Math.round((v.wageBillWeeklyPounds / v.wageReservePounds) * 1000) / 10;
    },
    answerFormula: 'round((wageBillWeeklyPounds / wageReservePounds) × 100, 1dp)',
    unit: '%',
    hints: [
      'Percentage = (part ÷ whole) × 100. Here the "part" is the weekly wage bill and the "whole" is the wage reserve.',
      'Divide the wage bill by the wage reserve: £{{wageBillWeeklyPounds}} ÷ £{{wageReservePounds}}.',
      '£{{wageBillWeeklyPounds}} ÷ £{{wageReservePounds}} × 100. Round your answer to 1 decimal place.',
    ],
    explanation: 'Step 1: Divide wage bill by wage reserve:\n£{{wageBillWeeklyPounds}} ÷ £{{wageReservePounds}}\nStep 2: Multiply by 100.\nStep 3: Round to 1 decimal place.\nAnswer: expressed as a percentage to 1dp.',
    context: 'Val Hartley (CFO): "Clubs in financial difficulty almost always overspend on wages first. I need to know exactly where we stand as a percentage of our reserve."',
  },

  {
    id: 'pct-yr8-2-002',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'division',
    template: 'You have {{points}} points from {{played}} games.\n\nThe maximum possible points from those games would be {{maxPointsPossible}}.\n\nWhat percentage of the maximum points have you achieved?\n\nRound your answer to the nearest whole number.',
    answerFn: v => {
      if (v.maxPointsPossible === 0) return 0;
      return Math.round((v.points / v.maxPointsPossible) * 100);
    },
    answerFormula: 'round((points / maxPointsPossible) × 100)',
    unit: '%',
    hints: [
      'Percentage of maximum = (actual points ÷ maximum possible points) × 100.',
      'Maximum possible points = {{played}} games × 3 points per win = {{maxPointsPossible}} points.',
      '{{points}} ÷ {{maxPointsPossible}} × 100. Round to the nearest whole number.',
    ],
    explanation: 'Step 1: Maximum possible points = {{played}} × 3 = {{maxPointsPossible}}.\nStep 2: Divide actual points by maximum:\n{{points}} ÷ {{maxPointsPossible}}\nStep 3: Multiply by 100 and round.\nAnswer: the percentage of maximum points achieved.',
    context: 'Marcus Webb (Assistant Manager): "Points per game tells you how you\'re doing. But percentage of maximum points available gives you the full picture of how efficient your results have been."',
  },

  {
    id: 'pct-yr8-2-003',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A player was valued at £240,000.\n\nAfter an excellent season, his value has risen to £312,000.\n\nCalculate the percentage increase in his value.',
    answerFn: _v => 30,
    answerFormula: '((312000 - 240000) / 240000) × 100 = 30',
    unit: '%',
    hints: [
      'Percentage increase = (increase ÷ original value) × 100.',
      'First find the increase: £312,000 − £240,000 = £72,000.',
      '£72,000 ÷ £240,000 × 100. Simplify the fraction first to make the calculation easier.',
    ],
    explanation: 'Step 1: Find the increase:\n£312,000 − £240,000 = £72,000\nStep 2: Divide by the original value:\n£72,000 ÷ £240,000 = 0.3\nStep 3: Multiply by 100:\n0.3 × 100 = 30%\nAnswer: 30% increase.',
    context: 'Dani Reyes (Head Scout): "A 30% uplift in one season is exceptional. If we can sell at this valuation, it\'s a real profit on what we paid."',
  },

  {
    id: 'pct-yr8-2-004',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'The stadium has 8,200 seats.\n\nFor a cup match, 73% of seats are sold.\n\nHow many tickets are sold?\n\nRound your answer to the nearest whole number.',
    answerFn: _v => 5986,
    answerFormula: 'round(8200 × 0.73) = 5986',
    unit: 'tickets',
    hints: [
      'To find a percentage of an amount, multiply the amount by the percentage ÷ 100.',
      'Multiply 8,200 by 0.73 (which is the same as 73 ÷ 100).',
      '8,200 × 0.73 = ? Round your answer to the nearest whole number.',
    ],
    explanation: 'Step 1: Convert 73% to a decimal: 73 ÷ 100 = 0.73.\nStep 2: Multiply by the number of seats:\n8,200 × 0.73 = 5,986\nAnswer: 5,986 tickets sold.',
    context: 'Val Hartley (CFO): "A 73% sell-out for a cup match mid-week is decent. Let\'s check the revenue that generates."',
  },

  // ── DIFFICULTY 3 (Year 9) ──────────────────────────────────────────────────

  {
    id: 'pct-yr9-3-001',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'After negotiating hard, you signed a player for £1,600,000.\n\nThis was 20% less than his original asking price.\n\nWhat was the original asking price?\n\nGive your answer in pounds.',
    answerFn: _v => 2000000,
    answerFormula: '1600000 / 0.80 = 2000000',
    unit: '£',
    hints: [
      'If the price is 20% less than the original, then £1,600,000 represents 80% of the original asking price.',
      'Write the equation: 80% of original price = £1,600,000. So original = £1,600,000 ÷ 0.80.',
      '£1,600,000 ÷ 0.80 = ? Equivalently, £1,600,000 ÷ 4 × 5.',
    ],
    explanation: 'Step 1: If 20% was taken off, the amount paid is 100% − 20% = 80% of the original.\nStep 2: 80% of original = £1,600,000.\nStep 3: Divide both sides by 0.80:\nOriginal = £1,600,000 ÷ 0.80 = £2,000,000\nAnswer: £2,000,000.',
    context: 'Dani Reyes (Head Scout): "He was asking for two million. We drove him down by 20%. Still a hefty fee, but the board approved it."',
  },

  {
    id: 'pct-yr9-3-002',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'Your club\'s matchday revenue grew by 20% in Season 1 and then by a further 25% in Season 2.\n\nThe original revenue was £800,000.\n\nWhat is the revenue after both seasons?\n\nGive your answer in pounds.',
    answerFn: _v => 1200000,
    answerFormula: '800000 × 1.20 × 1.25 = 1200000',
    unit: '£',
    hints: [
      'For compound percentage growth, multiply by the multipliers in sequence. A 20% increase uses multiplier 1.20; a 25% increase uses 1.25.',
      'After Season 1: £800,000 × 1.20 = £960,000.',
      'After Season 2: £960,000 × 1.25 = ?',
    ],
    explanation: 'Step 1: Apply the Season 1 increase (20%):\n£800,000 × 1.20 = £960,000\nStep 2: Apply the Season 2 increase (25%) to the new amount:\n£960,000 × 1.25 = £1,200,000\nAnswer: £1,200,000.',
    context: 'Val Hartley (CFO): "Two seasons of strong matchday growth. Compounding works in our favour here — each increase builds on the last."',
  },

  {
    id: 'pct-yr9-3-003',
    topic: 'PERCENTAGES',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'division',
    template: 'You need a win rate above 60% across all 46 games this season to qualify for a prize fund.\n\nYou have won {{won}} of your {{played}} games so far.\n\nThere are {{gamesRemaining}} games remaining.\n\nWhat is the minimum number of those remaining games you must win to finish with a win rate above 60%?\n\nGive a whole number.',
    answerFn: v => Math.max(0, Math.ceil(0.6 * 46 - v.won)),
    answerFormula: 'max(0, ceil(0.6 × 46 − won))',
    unit: 'wins',
    hints: [
      'First work out how many wins you need in total across all 46 games to exceed 60%.',
      '60% of 46 games = 0.60 × 46 = 27.6. You need at least 28 wins in total (round up, since you need to be above 60%).',
      'You already have {{won}} wins. Minimum additional wins needed = 28 − {{won}}. If this is negative, you\'ve already qualified.',
    ],
    explanation: 'Step 1: Find the minimum total wins needed:\n60% of 46 = 27.6. Round up to 28 (must be above 60%).\nStep 2: Subtract wins already achieved:\n28 − {{won}} = minimum wins still required.\nStep 3: If the result is negative or zero, you have already qualified.\nAnswer: max(0, 28 − {{won}}) wins.',
    context: 'Marcus Webb (Assistant Manager): "The prize fund is worth chasing. Work out exactly how many wins we need from the remaining games — no room for complacency."',
  },
];
