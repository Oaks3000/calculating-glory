import { simulateMatch, clubToTeam, generateAITeam, Team } from '../simulation/match';
import { Club } from '../types/club';

function makeTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team-1',
    name: 'Test FC',
    attackStrength: 50,
    defenceStrength: 50,
    teamStrength: 1.0,
    ...overrides
  };
}

describe('simulateMatch', () => {
  it('is deterministic: same inputs produce same result', () => {
    const home = makeTeam({ id: 'home' });
    const away = makeTeam({ id: 'away' });

    const r1 = simulateMatch(home, away, 'test-seed');
    const r2 = simulateMatch(home, away, 'test-seed');

    expect(r1.homeGoals).toBe(r2.homeGoals);
    expect(r1.awayGoals).toBe(r2.awayGoals);
    expect(r1.homeExpectedGoals).toBe(r2.homeExpectedGoals);
    expect(r1.awayExpectedGoals).toBe(r2.awayExpectedGoals);
  });

  it('different seeds produce different results (statistically)', () => {
    const home = makeTeam({ id: 'home' });
    const away = makeTeam({ id: 'away' });

    // Run 20 matches with different seeds, not all should be identical
    const results = Array.from({ length: 20 }, (_, i) =>
      simulateMatch(home, away, `seed-${i}`)
    );

    const uniqueScores = new Set(
      results.map(r => `${r.homeGoals}-${r.awayGoals}`)
    );

    expect(uniqueScores.size).toBeGreaterThan(1);
  });

  it('goals are non-negative integers capped at 8', () => {
    const home = makeTeam({ id: 'home', attackStrength: 80 });
    const away = makeTeam({ id: 'away', attackStrength: 80 });

    for (let i = 0; i < 100; i++) {
      const result = simulateMatch(home, away, `cap-test-${i}`);
      expect(result.homeGoals).toBeGreaterThanOrEqual(0);
      expect(result.awayGoals).toBeGreaterThanOrEqual(0);
      expect(result.homeGoals).toBeLessThanOrEqual(8);
      expect(result.awayGoals).toBeLessThanOrEqual(8);
      expect(Number.isInteger(result.homeGoals)).toBe(true);
      expect(Number.isInteger(result.awayGoals)).toBe(true);
    }
  });

  it('home team has expected goals advantage', () => {
    const home = makeTeam({ id: 'home' });
    const away = makeTeam({ id: 'away' });

    const result = simulateMatch(home, away, 'advantage-test');

    // For equal teams, home expected goals should be > away expected goals
    expect(result.homeExpectedGoals).toBeGreaterThan(result.awayExpectedGoals);
  });

  it('expected goals are in realistic range [0.5, 3.0]', () => {
    // Test with extreme team strengths
    const strong = makeTeam({ id: 'strong', attackStrength: 90, defenceStrength: 90, teamStrength: 1.3 });
    const weak = makeTeam({ id: 'weak', attackStrength: 20, defenceStrength: 20, teamStrength: 0.8 });

    const r1 = simulateMatch(strong, weak, 'range-1');
    expect(r1.homeExpectedGoals).toBeLessThanOrEqual(3.0);
    expect(r1.awayExpectedGoals).toBeGreaterThanOrEqual(0.5);

    const r2 = simulateMatch(weak, strong, 'range-2');
    expect(r2.homeExpectedGoals).toBeGreaterThanOrEqual(0.5);
    expect(r2.awayExpectedGoals).toBeLessThanOrEqual(3.0);
  });

  it('stronger attack leads to more goals on average', () => {
    const avg = makeTeam({ id: 'avg' });
    const strongAttack = makeTeam({ id: 'strong', attackStrength: 80 });

    let avgGoals = 0;
    let strongGoals = 0;
    const n = 500;

    for (let i = 0; i < n; i++) {
      avgGoals += simulateMatch(avg, avg, `avg-${i}`).homeGoals;
      strongGoals += simulateMatch(strongAttack, avg, `strong-${i}`).homeGoals;
    }

    expect(strongGoals / n).toBeGreaterThan(avgGoals / n);
  });

  it('stronger defence leads to fewer goals conceded on average', () => {
    const avg = makeTeam({ id: 'avg' });
    const strongDefence = makeTeam({ id: 'strong-def', defenceStrength: 80 });

    let avgConceded = 0;
    let strongDefConceded = 0;
    const n = 500;

    for (let i = 0; i < n; i++) {
      avgConceded += simulateMatch(avg, avg, `avg-d-${i}`).awayGoals;
      strongDefConceded += simulateMatch(strongDefence, avg, `def-${i}`).awayGoals;
    }

    // Strong defence concedes fewer
    expect(strongDefConceded / n).toBeLessThan(avgConceded / n);
  });

  it('returns correct team IDs and seed', () => {
    const home = makeTeam({ id: 'home-id', name: 'Home FC' });
    const away = makeTeam({ id: 'away-id', name: 'Away FC' });

    const result = simulateMatch(home, away, 'id-test');

    expect(result.homeTeamId).toBe('home-id');
    expect(result.awayTeamId).toBe('away-id');
    expect(result.seed).toBe('id-test');
  });
});

describe('clubToTeam', () => {
  it('creates a Team from a Club with players', () => {
    const club: Club = {
      id: 'club-1',
      name: 'Test FC',
      transferBudget: 0,
      wageBudget: 0,
      squad: [
        { id: 'p1', name: 'Striker', overallRating: 80, position: 'FWD', wage: 0, transferValue: 0, age: 25, morale: 75, attributes: { attack: 75, defence: 20, teamwork: 50, charisma: 50, publicPotential: 70 }, truePotential: 70, contractExpiresWeek: 46, stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 0 } },
        { id: 'p2', name: 'Midfielder', overallRating: 70, position: 'MID', wage: 0, transferValue: 0, age: 25, morale: 75, attributes: { attack: 55, defence: 50, teamwork: 65, charisma: 50, publicPotential: 65 }, truePotential: 65, contractExpiresWeek: 46, stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 0 } },
        { id: 'p3', name: 'Defender', overallRating: 60, position: 'DEF', wage: 0, transferValue: 0, age: 25, morale: 75, attributes: { attack: 30, defence: 62, teamwork: 55, charisma: 40, publicPotential: 55 }, truePotential: 55, contractExpiresWeek: 46, stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 0 } },
        { id: 'p4', name: 'Keeper', overallRating: 65, position: 'GK', wage: 0, transferValue: 0, age: 25, morale: 75, attributes: { attack: 15, defence: 68, teamwork: 55, charisma: 40, publicPotential: 60 }, truePotential: 60, contractExpiresWeek: 46, stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 0 } },
      ],
      staff: [],
      facilities: [],
      reputation: 50,
      stadium: { name: 'Test Arena', capacity: 5000, averageAttendance: 3000, ticketPrice: 2000 },
      form: [],
      trainingFocus: null,
      preferredFormation: null,
      squadCapacity: 24,
    };

    const team = clubToTeam(club);

    expect(team.id).toBe('club-1');
    expect(team.name).toBe('Test FC');
    // FWD (80 * 3) + MID (70 * 1) = 310 / 4 = 77.5 attack
    expect(team.attackStrength).toBeCloseTo(77.5, 1);
    // GK (65 * 3) + DEF (60 * 3) + MID (70 * 1) = 445 / 7 ≈ 63.57 defence
    expect(team.defenceStrength).toBeCloseTo(63.57, 1);
    // Base 1.0 + reputation (50/100 * 0.10) = 1.05
    expect(team.teamStrength).toBeCloseTo(1.05, 2);
  });

  it('handles empty squad with fallback strengths', () => {
    const club: Club = {
      id: 'empty',
      name: 'Empty FC',
      transferBudget: 0,
      wageBudget: 0,
      squad: [],
      staff: [],
      facilities: [],
      reputation: 0,
      stadium: { name: '', capacity: 0, averageAttendance: 0, ticketPrice: 0 },
      form: [],
      trainingFocus: null,
      preferredFormation: null,
      squadCapacity: 24,
    };

    const team = clubToTeam(club);
    expect(team.attackStrength).toBe(30);
    expect(team.defenceStrength).toBe(30);
  });

  it('form affects team modifier', () => {
    const baseClub: Club = {
      id: 'form-test',
      name: 'Form FC',
      transferBudget: 0,
      wageBudget: 0,
      squad: [
        { id: 'p1', name: 'Player', overallRating: 50, position: 'FWD', wage: 0, transferValue: 0, age: 25, morale: 75, attributes: { attack: 50, defence: 20, teamwork: 45, charisma: 40, publicPotential: 45 }, truePotential: 45, contractExpiresWeek: 46, stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 0 } },
      ],
      staff: [],
      facilities: [],
      reputation: 50,
      stadium: { name: '', capacity: 0, averageAttendance: 0, ticketPrice: 0 },
      form: [],
      trainingFocus: null,
      preferredFormation: null,
      squadCapacity: 24,
    };

    const winningClub: Club = { ...baseClub, form: ['W', 'W', 'W', 'W', 'W'] };
    const losingClub: Club = { ...baseClub, form: ['L', 'L', 'L', 'L', 'L'] };

    const winTeam = clubToTeam(winningClub);
    const loseTeam = clubToTeam(losingClub);

    expect(winTeam.teamStrength).toBeGreaterThan(loseTeam.teamStrength);
  });
});

describe('generateAITeam', () => {
  it('is deterministic: same inputs produce same team', () => {
    const t1 = generateAITeam('ai-1', 'AI FC', 50, 'season-seed');
    const t2 = generateAITeam('ai-1', 'AI FC', 50, 'season-seed');

    expect(t1).toEqual(t2);
  });

  it('different IDs produce different teams', () => {
    const t1 = generateAITeam('ai-1', 'AI 1', 50, 'seed');
    const t2 = generateAITeam('ai-2', 'AI 2', 50, 'seed');

    // Very unlikely to match
    expect(t1.attackStrength).not.toBe(t2.attackStrength);
  });

  it('strengths are within valid ranges', () => {
    for (let i = 0; i < 100; i++) {
      const team = generateAITeam(`ai-${i}`, `Team ${i}`, 50, 'range-test');
      expect(team.attackStrength).toBeGreaterThanOrEqual(20);
      expect(team.attackStrength).toBeLessThanOrEqual(80);
      expect(team.defenceStrength).toBeGreaterThanOrEqual(20);
      expect(team.defenceStrength).toBeLessThanOrEqual(80);
      expect(team.teamStrength).toBeGreaterThanOrEqual(0.8);
      expect(team.teamStrength).toBeLessThanOrEqual(1.3);
    }
  });

  it('base strength influences attack/defence', () => {
    // Weak teams should generally have lower strengths than strong teams
    let weakTotal = 0;
    let strongTotal = 0;
    const n = 100;

    for (let i = 0; i < n; i++) {
      const weak = generateAITeam(`w-${i}`, `Weak ${i}`, 30, 'strength-test');
      const strong = generateAITeam(`s-${i}`, `Strong ${i}`, 70, 'strength-test');
      weakTotal += weak.attackStrength + weak.defenceStrength;
      strongTotal += strong.attackStrength + strong.defenceStrength;
    }

    expect(strongTotal / n).toBeGreaterThan(weakTotal / n);
  });
});
