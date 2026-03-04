/**
 * League Two Teams Data
 *
 * Real English League Two clubs with base strength ratings (35-65).
 * These are used to populate the league when a new game starts.
 */

export interface LeagueTwoTeam {
  id: string;
  name: string;
  baseStrength: number; // 35-65 range, reflects quality
}

export const LEAGUE_TWO_TEAMS: LeagueTwoTeam[] = [
  { id: 'swindon', name: 'Swindon Town', baseStrength: 62 },
  { id: 'bradford', name: 'Bradford City', baseStrength: 60 },
  { id: 'doncaster', name: 'Doncaster Rovers', baseStrength: 58 },
  { id: 'gillingham', name: 'Gillingham', baseStrength: 56 },
  { id: 'crewe', name: 'Crewe Alexandra', baseStrength: 55 },
  { id: 'crawley', name: 'Crawley Town', baseStrength: 54 },
  { id: 'salford', name: 'Salford City', baseStrength: 53 },
  { id: 'newport', name: 'Newport County', baseStrength: 52 },
  { id: 'colchester', name: 'Colchester United', baseStrength: 51 },
  { id: 'tranmere', name: 'Tranmere Rovers', baseStrength: 50 },
  { id: 'walsall', name: 'Walsall', baseStrength: 49 },
  { id: 'harrogate', name: 'Harrogate Town', baseStrength: 48 },
  { id: 'barrow', name: 'Barrow', baseStrength: 47 },
  { id: 'grimsby', name: 'Grimsby Town', baseStrength: 46 },
  { id: 'mansfield', name: 'Mansfield Town', baseStrength: 45 },
  { id: 'sutton', name: 'Sutton United', baseStrength: 44 },
  { id: 'rochdale', name: 'Rochdale', baseStrength: 43 },
  { id: 'carlisle', name: 'Carlisle United', baseStrength: 42 },
  { id: 'stevenage', name: 'Stevenage', baseStrength: 41 },
  { id: 'hartlepool', name: 'Hartlepool United', baseStrength: 40 },
  { id: 'leyton', name: 'Leyton Orient', baseStrength: 39 },
  { id: 'scunthorpe', name: 'Scunthorpe United', baseStrength: 38 },
  { id: 'oldham', name: 'Oldham Athletic', baseStrength: 37 },
  { id: 'port-vale', name: 'Port Vale', baseStrength: 36 },
];
