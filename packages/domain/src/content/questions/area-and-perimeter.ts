/**
 * Question Bank — AREA_AND_PERIMETER topic
 *
 * 11 questions across three difficulty bands (all fixed valueScale):
 *   D1 (Year 7)  — single shape, direct formula application
 *   D2 (Year 8)  — composite shapes, scale problems, missing dimensions
 *   D3 (Year 9)  — form and solve, percentage change of area, algebraic area
 *
 * Standard football dimensions used throughout:
 *   Full pitch: 105 m × 68 m
 *   Penalty area: 40 m × 16 m (approximation for clean arithmetic)
 */
import { QuestionBank } from './types';

export const areaAndPerimeterBank: QuestionBank = [

  // ── DIFFICULTY 1 (Year 7) ──────────────────────────────────────────────────

  {
    id: 'aap-yr7-1-001',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A rectangular training pitch is 85 m long and 55 m wide.\n\nCalculate its perimeter.\n\nGive your answer in metres.',
    answerFn: _v => 280,
    answerFormula: '2 × (85 + 55) = 2 × 140 = 280',
    unit: 'm',
    hints: [
      'Perimeter of a rectangle = 2 × (length + width).',
      'Add the length and width first: 85 + 55 = 140.',
      '2 × 140 = ?',
    ],
    explanation: 'Step 1: Add length and width: 85 + 55 = 140 m.\nStep 2: Multiply by 2: 2 × 140 = 280 m.\nAnswer: 280 m.',
    context: 'Kev the Groundskeeper: "I need the perimeter to order the correct length of boundary rope. 280 metres — better order a bit extra."',
  },

  {
    id: 'aap-yr7-1-002',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A football pitch is 105 m long and 68 m wide.\n\nCalculate its area.\n\nGive your answer in square metres (m²).',
    answerFn: _v => 7140,
    answerFormula: '105 × 68 = 7140',
    unit: 'm²',
    hints: [
      'Area of a rectangle = length × width.',
      'Multiply the length by the width: 105 × 68.',
      '105 × 68. You can break this down: 100 × 68 = 6,800 and 5 × 68 = 340. Then add.',
    ],
    explanation: 'Step 1: Area = length × width.\nStep 2: 105 × 68 = (100 × 68) + (5 × 68) = 6,800 + 340 = 7,140.\nAnswer: 7,140 m².',
    context: 'Kev the Groundskeeper: "The groundskeeping team needs the pitch area to calculate how much fertiliser to order for the pre-season."',
  },

  {
    id: 'aap-yr7-1-003',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A penalty area is 40 m wide and 16 m deep.\n\nCalculate its perimeter.\n\nGive your answer in metres.',
    answerFn: _v => 112,
    answerFormula: '2 × (40 + 16) = 2 × 56 = 112',
    unit: 'm',
    hints: [
      'Perimeter of a rectangle = 2 × (length + width).',
      'Add the width and depth: 40 + 16 = 56.',
      '2 × 56 = ?',
    ],
    explanation: 'Step 1: Add the two dimensions: 40 + 16 = 56 m.\nStep 2: Perimeter = 2 × 56 = 112 m.\nAnswer: 112 m.',
    context: 'Kev the Groundskeeper: "The penalty area lines need repainting before the season starts. I need the total length of line to order the right amount of paint."',
  },

  {
    id: 'aap-yr7-1-004',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_7',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A VIP hospitality box is 12 m long and 7 m wide.\n\nCalculate its area.\n\nGive your answer in square metres (m²).',
    answerFn: _v => 84,
    answerFormula: '12 × 7 = 84',
    unit: 'm²',
    hints: [
      'Area of a rectangle = length × width.',
      'Multiply 12 by 7.',
      '12 × 7 = ?',
    ],
    explanation: 'Area = length × width = 12 × 7 = 84 m².\nAnswer: 84 m².',
    context: 'Val Hartley (CFO): "The hospitality suite needs new flooring. 84 square metres — I\'ll get three quotes for the installation."',
  },

  // ── DIFFICULTY 2 (Year 8) ──────────────────────────────────────────────────

  {
    id: 'aap-yr8-2-001',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A football pitch is 105 m long and 68 m wide.\n\nThere are two penalty areas, one at each end. Each penalty area is 40 m wide and 16 m deep.\n\nCalculate the area of the pitch NOT covered by a penalty area.\n\nGive your answer in square metres (m²).',
    answerFn: _v => 5860,
    answerFormula: '105 × 68 − 2 × (40 × 16) = 7140 − 1280 = 5860',
    unit: 'm²',
    hints: [
      'Find the total area of the pitch, then subtract both penalty areas.',
      'Total pitch area = 105 × 68 = 7,140 m². Each penalty area = 40 × 16 m².',
      'Two penalty areas: 2 × (40 × 16) = 2 × 640 = 1,280 m². Subtract from the total.',
    ],
    explanation: 'Step 1: Total pitch area = 105 × 68 = 7,140 m².\nStep 2: Each penalty area = 40 × 16 = 640 m².\nStep 3: Two penalty areas = 2 × 640 = 1,280 m².\nStep 4: Area outside penalty areas = 7,140 − 1,280 = 5,860 m².\nAnswer: 5,860 m².',
    context: 'Kev the Groundskeeper: "The referee\'s assistant covers the whole touchline, but we turf the penalty areas separately. Easier if we know the non-penalty-area square footage."',
  },

  {
    id: 'aap-yr8-2-002',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A blueprint of the new stadium uses a scale of 1:500.\n\nThe main stand measures 8.4 cm on the blueprint.\n\nHow long is the stand in real life?\n\nGive your answer in metres.',
    answerFn: _v => 42,
    answerFormula: '8.4 × 500 = 4200 cm = 42 m',
    unit: 'm',
    hints: [
      'A scale of 1:500 means every 1 cm on the blueprint represents 500 cm in real life.',
      'Multiply the blueprint measurement by 500: 8.4 × 500.',
      '8.4 × 500 = 4,200 cm. Convert to metres: divide by 100.',
    ],
    explanation: 'Step 1: Multiply blueprint length by scale factor:\n8.4 cm × 500 = 4,200 cm.\nStep 2: Convert cm to metres:\n4,200 cm ÷ 100 = 42 m.\nAnswer: 42 m.',
    context: 'Kev the Groundskeeper: "The architect draws at 1:500. That 8.4 cm line on the plans represents a proper 42-metre stand in real life."',
  },

  {
    id: 'aap-yr8-2-003',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'The perimeter of a rectangular training pitch is 280 m.\n\nThe length of the pitch is 90 m.\n\nWhat is the width?\n\nGive your answer in metres.',
    answerFn: _v => 50,
    answerFormula: '2(90 + w) = 280 → w = 50',
    unit: 'm',
    hints: [
      'Perimeter of a rectangle = 2 × (length + width). Set up an equation.',
      '2 × (90 + w) = 280. Divide both sides by 2 first.',
      '90 + w = 140. Subtract 90 from both sides.',
    ],
    explanation: 'Equation: 2 × (90 + w) = 280\nStep 1: Divide both sides by 2:\n90 + w = 140\nStep 2: Subtract 90 from both sides:\nw = 140 − 90 = 50\nAnswer: 50 m.',
    context: 'Kev the Groundskeeper: "I measured the perimeter rope at 280 metres and I know it\'s 90 metres long. Work out the width for the ground plan."',
  },

  {
    id: 'aap-yr8-2-004',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A new stadium stand has an L-shape made up of two rectangles:\n\nRectangle A: 60 m × 12 m\nRectangle B: 30 m × 8 m\n\nWhat is the total area of the stand?\n\nGive your answer in square metres (m²).',
    answerFn: _v => 960,
    answerFormula: '60 × 12 + 30 × 8 = 720 + 240 = 960',
    unit: 'm²',
    hints: [
      'Split the L-shape into two separate rectangles and calculate each area.',
      'Area of Rectangle A = 60 × 12. Area of Rectangle B = 30 × 8.',
      '60 × 12 = 720. 30 × 8 = 240. Add them together.',
    ],
    explanation: 'Step 1: Area of Rectangle A = 60 × 12 = 720 m².\nStep 2: Area of Rectangle B = 30 × 8 = 240 m².\nStep 3: Total area = 720 + 240 = 960 m².\nAnswer: 960 m².',
    context: 'Kev the Groundskeeper: "L-shaped stands are tricky to quote for. Split it into two rectangles, calculate each separately, then add."',
  },

  // ── DIFFICULTY 3 (Year 9) ──────────────────────────────────────────────────

  {
    id: 'aap-yr9-3-001',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'The length of a training pitch is 3 times its width.\n\nThe area of the pitch is 2,700 m².\n\nFind the length of the pitch.\n\nGive your answer in metres.',
    answerFn: _v => 90,
    answerFormula: 'l = 3w, l × w = 2700 → 3w² = 2700 → w = 30, l = 90',
    unit: 'm',
    hints: [
      'Let w = the width. Write the length in terms of w: l = 3w.\nWrite the area equation: l × w = 2,700.',
      'Substitute l = 3w into the area equation: 3w × w = 2,700, so 3w² = 2,700.',
      'w² = 2,700 ÷ 3 = 900. Find the square root: w = 30. Then l = 3 × 30.',
    ],
    explanation: 'Let w = width. Then length = 3w.\nArea equation: 3w × w = 2,700\n3w² = 2,700\nw² = 900\nw = 30 m\nLength = 3 × 30 = 90 m.\nAnswer: 90 m.',
    context: 'Kev the Groundskeeper: "The dimensions were written down as a ratio, not exact measurements. Work backwards from the area to find the length."',
  },

  {
    id: 'aap-yr9-3-002',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'A club increases the width of their pitch by 10% and the length by 5%.\n\nThe original pitch is 100 m long and 60 m wide.\n\nWhat is the area of the new pitch?\n\nGive your answer in square metres (m²).',
    answerFn: _v => 6930,
    answerFormula: '(100 × 1.05) × (60 × 1.10) = 105 × 66 = 6930',
    unit: 'm²',
    hints: [
      'Apply the percentage increases to each dimension separately.',
      'New length = 100 × 1.05 = 105 m. New width = 60 × 1.10 = 66 m.',
      'New area = 105 × 66.',
    ],
    explanation: 'Step 1: New length = 100 × 1.05 = 105 m.\nStep 2: New width = 60 × 1.10 = 66 m.\nStep 3: New area = 105 × 66 = 6,930 m².\nAnswer: 6,930 m².\n\nNote: The original area was 100 × 60 = 6,000 m². The new area is 15.5% larger — more than the sum of the two individual increases.',
    context: 'Kev the Groundskeeper: "Expanding both dimensions sounds small on paper, but the combined effect on the area is larger than most people expect."',
  },

  {
    id: 'aap-yr9-3-003',
    topic: 'AREA_AND_PERIMETER',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 3,
    valueScale: 'fixed',
    template: 'A media gantry runs along one side of the pitch and covers 80% of the 105 m touchline.\n\nEqual lengths are left uncovered at each end.\n\nHow long is each uncovered section?\n\nGive your answer in metres.',
    answerFn: _v => 10.5,
    answerFormula: '(105 − 0.80 × 105) / 2 = (105 − 84) / 2 = 21 / 2 = 10.5',
    unit: 'm',
    hints: [
      'First find the length of the gantry: 80% of 105 m.',
      'Gantry length = 0.80 × 105 = 84 m. Total uncovered = 105 − 84 = 21 m.',
      'This 21 m is split equally between two ends: 21 ÷ 2.',
    ],
    explanation: 'Step 1: Gantry length = 80% of 105 = 0.80 × 105 = 84 m.\nStep 2: Total uncovered = 105 − 84 = 21 m.\nStep 3: Uncovered at each end = 21 ÷ 2 = 10.5 m.\nAnswer: 10.5 m.',
    context: 'Kev the Groundskeeper: "The gantry supplier offers a standard 80% coverage. I need the overhang measurement at each end before we can anchor it."',
  },
];
