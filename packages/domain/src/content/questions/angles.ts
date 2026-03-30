/**
 * Question Bank — ANGLES topic
 *
 * 8 questions across two difficulty bands:
 *   D1 (Year 8) — angles on a line/point, vertically opposite, triangle rules
 *   D2 (Year 9) — polygon interior/exterior angles, parallel-line rules
 *
 * All questions use Kev the Groundskeeper framing — stadium structures,
 * pitch markings, floodlights, roof trusses, and stand geometry.
 */
import { QuestionBank } from './types';

export const anglesBank: QuestionBank = [

  // ── DIFFICULTY 1 (Year 8) ──────────────────────────────────────────────────

  {
    id: 'ang-yr8-1-001',
    topic: 'ANGLES',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'Two floodlight beams meet a straight horizontal gantry.\n\nOne beam makes an angle of 68° with the gantry.\n\nWhat is the angle the other beam makes with the gantry on the same side?\n\nGive your answer in degrees.',
    answerFn: _v => 112,
    answerFormula: '180 − 68 = 112',
    unit: '°',
    hints: [
      'Angles on a straight line always add up to 180°.',
      'The two angles together must total 180°.',
      '180 − 68 = ?',
    ],
    explanation: 'Angles on a straight line sum to 180°.\n180° − 68° = 112°.\nAnswer: 112°.',
    context: 'Kev the Groundskeeper: "The gantry is dead horizontal. I need the supplementary angle to know how to brace the second beam at the correct pitch."',
  },

  {
    id: 'ang-yr8-1-002',
    topic: 'ANGLES',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'Four cable stays meet at a single point on the stadium roof.\n\nThree of the angles at the point are 95°, 105°, and 80°.\n\nWhat is the fourth angle?\n\nGive your answer in degrees.',
    answerFn: _v => 80,
    answerFormula: '360 − 95 − 105 − 80 = 80',
    unit: '°',
    hints: [
      'Angles at a point always add up to 360°.',
      'Add the three known angles: 95 + 105 + 80.',
      'Subtract the total from 360.',
    ],
    explanation: 'Angles at a point sum to 360°.\n95 + 105 + 80 = 280.\n360 − 280 = 80°.\nAnswer: 80°.',
    context: 'Kev the Groundskeeper: "Four stays anchored at the crown — they have to share a full 360°. I need the last angle to cut the tensioning bracket correctly."',
  },

  {
    id: 'ang-yr8-1-003',
    topic: 'ANGLES',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'Two structural beams cross inside the stadium roof to form an X-shape.\n\nOne of the angles at the crossing point is 47°.\n\nWhat is the size of the vertically opposite angle?\n\nGive your answer in degrees.',
    answerFn: _v => 47,
    answerFormula: 'Vertically opposite angles are equal: 47°',
    unit: '°',
    hints: [
      'When two straight lines cross, the angles directly opposite each other are called vertically opposite angles.',
      'Vertically opposite angles are always equal.',
      'The angle is the same as the one given.',
    ],
    explanation: 'Vertically opposite angles are equal.\nThe angle opposite 47° is also 47°.\nAnswer: 47°.',
    context: 'Kev the Groundskeeper: "The two roof beams cross at exactly the same point. The angle directly across the joint is always the same — saves me measuring both sides."',
  },

  {
    id: 'ang-yr8-1-004',
    topic: 'ANGLES',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A corner flag support forms a triangle with the ground.\n\nThe flag meets the ground at a right angle (90°).\n\nOne of the other angles in the triangle is 34°.\n\nFind the third angle.\n\nGive your answer in degrees.',
    answerFn: _v => 56,
    answerFormula: '180 − 90 − 34 = 56',
    unit: '°',
    hints: [
      'Angles in a triangle always add up to 180°.',
      'You already know two angles: 90° and 34°. Add them.',
      'Subtract the total from 180°.',
    ],
    explanation: 'Angles in a triangle sum to 180°.\n90 + 34 = 124.\n180 − 124 = 56°.\nAnswer: 56°.',
    context: 'Kev the Groundskeeper: "Right-angle flag poles make the maths simple — I just need the third angle to cut the support brace at the right mitre."',
  },

  {
    id: 'ang-yr8-1-005',
    topic: 'ANGLES',
    minCurriculumLevel: 'YEAR_8',
    difficulty: 1,
    valueScale: 'fixed',
    template: 'A triangular roof truss has two interior angles of 55° and 70°.\n\nA support beam is extended beyond the third vertex of the triangle, creating an exterior angle.\n\nFind the exterior angle at the third vertex.\n\nGive your answer in degrees.',
    answerFn: _v => 125,
    answerFormula: '55 + 70 = 125 (exterior angle = sum of the two non-adjacent interior angles)',
    unit: '°',
    hints: [
      'The exterior angle of a triangle equals the sum of the two non-adjacent interior angles.',
      'The two non-adjacent interior angles here are 55° and 70°.',
      '55 + 70 = ?',
    ],
    explanation: 'Exterior angle of a triangle = sum of the two opposite interior angles.\n55 + 70 = 125°.\nAnswer: 125°.',
    context: 'Kev the Groundskeeper: "The beam runs straight past the third corner — the angle it makes on the outside is equal to the sum of the two angles on the inside. Useful shortcut."',
  },

  // ── DIFFICULTY 2 (Year 9) ──────────────────────────────────────────────────

  {
    id: 'ang-yr9-2-001',
    topic: 'ANGLES',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A new stadium cross-section is designed as a regular hexagon (6 equal sides and angles).\n\nCalculate the size of each interior angle.\n\nGive your answer in degrees.',
    answerFn: _v => 120,
    answerFormula: '(6 − 2) × 180 ÷ 6 = 720 ÷ 6 = 120',
    unit: '°',
    hints: [
      'Sum of interior angles of a polygon = (n − 2) × 180°, where n is the number of sides.',
      'For a hexagon, n = 6. Calculate (6 − 2) × 180.',
      'Divide the total by 6 (number of equal angles in a regular hexagon).',
    ],
    explanation: 'Sum of interior angles = (6 − 2) × 180° = 4 × 180° = 720°.\nEach interior angle of a regular hexagon = 720° ÷ 6 = 120°.\nAnswer: 120°.',
    context: 'Kev the Groundskeeper: "The architect went with a hexagonal cross-section. Every joint has to be cut at the interior angle, so I need the exact figure before fabrication starts."',
  },

  {
    id: 'ang-yr9-2-002',
    topic: 'ANGLES',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'The south stand roof truss is a pentagon (5-sided shape).\n\nFour of the interior angles are: 108°, 115°, 97°, and 103°.\n\nFind the fifth interior angle.\n\nGive your answer in degrees.',
    answerFn: _v => 117,
    answerFormula: '(5 − 2) × 180 − (108 + 115 + 97 + 103) = 540 − 423 = 117',
    unit: '°',
    hints: [
      'Sum of interior angles of a pentagon = (5 − 2) × 180° = 540°.',
      'Add the four known angles: 108 + 115 + 97 + 103.',
      'Subtract the total from 540°.',
    ],
    explanation: 'Sum of interior angles = (5 − 2) × 180° = 3 × 180° = 540°.\nKnown angles: 108 + 115 + 97 + 103 = 423°.\nFifth angle = 540° − 423° = 117°.\nAnswer: 117°.',
    context: 'Kev the Groundskeeper: "The fabricators need the fifth corner angle before they can weld the last section. One wrong cut and the whole truss warps."',
  },

  {
    id: 'ang-yr9-2-003',
    topic: 'ANGLES',
    minCurriculumLevel: 'YEAR_9',
    difficulty: 2,
    valueScale: 'fixed',
    template: 'A maintenance walkway runs at an angle, crossing two parallel touchlines on the pitch.\n\nThe walkway makes an angle of 63° with the first touchline (the corresponding angle).\n\nWhat angle does the walkway make with the second touchline on the same side (the co-interior angle)?\n\nGive your answer in degrees.',
    answerFn: _v => 117,
    answerFormula: '180 − 63 = 117 (co-interior angles sum to 180°)',
    unit: '°',
    hints: [
      'When a line crosses two parallel lines, co-interior angles (also called same-side interior angles) add up to 180°.',
      'The corresponding angle is 63°. Co-interior angles sum to 180°.',
      '180 − 63 = ?',
    ],
    explanation: 'Co-interior (same-side interior) angles between parallel lines sum to 180°.\n180° − 63° = 117°.\nAnswer: 117°.\n\nNote: Corresponding angles are equal (both would be 63°). Co-interior angles are supplementary (sum to 180°).',
    context: 'Kev the Groundskeeper: "The touchlines are dead parallel. Once I have one angle, the co-interior angle at the far line tells me how to cut the walkway bracket at the other end."',
  },

];
