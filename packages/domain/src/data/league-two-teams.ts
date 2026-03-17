/**
 * League Two Teams Data
 *
 * Fictional Pro-Evo style clubs — clearly recognisable analogues of real lower-league
 * sides, slightly tweaked to sidestep licensing. Strength ratings reflect rough real-world
 * standing at League Two level (35–65).
 */

export interface LeagueTwoTeam {
  id: string;
  name: string;
  baseStrength: number; // 35-65 range, reflects quality
}

export const LEAGUE_TWO_TEAMS: LeagueTwoTeam[] = [
  { id: 'swinton', name: 'Swinton Town', baseStrength: 62 },
  { id: 'bradfield', name: 'Bradfield City', baseStrength: 60 },
  { id: 'doncaster', name: 'Doncaster Ramblers', baseStrength: 58 },
  { id: 'gillingsham', name: 'Gillingsham FC', baseStrength: 56 },
  { id: 'crewe', name: 'Crewe Alexandros', baseStrength: 55 },
  { id: 'crowley', name: 'Crowley Town', baseStrength: 54 },
  { id: 'salchester', name: 'Salchester City', baseStrength: 53 },
  { id: 'newport', name: 'Newport Athletic', baseStrength: 52 },
  { id: 'coldale', name: 'Coldale United', baseStrength: 51 },
  { id: 'tranmore', name: 'Tranmore Rovers', baseStrength: 50 },
  { id: 'walshall', name: 'Walshall FC', baseStrength: 49 },
  { id: 'harrowgate', name: 'Harrowgate Town', baseStrength: 48 },
  { id: 'barrow-vale', name: 'Barrow Vale', baseStrength: 47 },
  { id: 'grimstone', name: 'Grimstone Town', baseStrength: 46 },
  { id: 'manyfield', name: 'Manyfield Town', baseStrength: 45 },
  { id: 'sutbourne', name: 'Sutbourne United', baseStrength: 44 },
  { id: 'rochford', name: 'Rochford FC', baseStrength: 43 },
  { id: 'carlford', name: 'Carlford United', baseStrength: 42 },
  { id: 'stevenham', name: 'Stevenham FC', baseStrength: 41 },
  { id: 'hartpool', name: 'Hartpool United', baseStrength: 40 },
  { id: 'layton', name: 'Layton Orient', baseStrength: 39 },
  { id: 'scunbridge', name: 'Scunbridge United', baseStrength: 38 },
  { id: 'oldfield', name: 'Oldfield Athletic', baseStrength: 37 },
  { id: 'port-hill', name: 'Port Hill FC', baseStrength: 36 },
];
