import { generateSeasonFixtures, getWeekFixtures, matchSeed, SeasonConfig } from '../simulation/season';

function makeTeamIds(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `team-${i + 1}`);
}

describe('generateSeasonFixtures', () => {
  const config: SeasonConfig = {
    teamIds: makeTeamIds(24),
    season: 1,
    seed: 'test-season'
  };

  it('generates correct number of weeks (46 for 24 teams)', () => {
    const fixtures = generateSeasonFixtures(config);
    expect(fixtures.length).toBe(46);
  });

  it('each week has correct number of matches (12 for 24 teams)', () => {
    const fixtures = generateSeasonFixtures(config);
    for (const week of fixtures) {
      expect(week.fixtures.length).toBe(12);
    }
  });

  it('weeks are numbered 1 through 46', () => {
    const fixtures = generateSeasonFixtures(config);
    const weeks = fixtures.map(w => w.week);
    expect(weeks).toEqual(Array.from({ length: 46 }, (_, i) => i + 1));
  });

  it('every team plays exactly once per week', () => {
    const fixtures = generateSeasonFixtures(config);

    for (const week of fixtures) {
      const teamsThisWeek = new Set<string>();
      for (const fixture of week.fixtures) {
        teamsThisWeek.add(fixture.homeTeamId);
        teamsThisWeek.add(fixture.awayTeamId);
      }
      expect(teamsThisWeek.size).toBe(24);
    }
  });

  it('no team plays itself', () => {
    const fixtures = generateSeasonFixtures(config);

    for (const week of fixtures) {
      for (const fixture of week.fixtures) {
        expect(fixture.homeTeamId).not.toBe(fixture.awayTeamId);
      }
    }
  });

  it('every team plays every other team exactly twice (home and away)', () => {
    const fixtures = generateSeasonFixtures(config);
    const matchups = new Map<string, number>();

    for (const week of fixtures) {
      for (const fixture of week.fixtures) {
        // Ordered key: "home-away" captures direction
        const key = `${fixture.homeTeamId}-vs-${fixture.awayTeamId}`;
        matchups.set(key, (matchups.get(key) || 0) + 1);
      }
    }

    // For each pair (A, B), there should be exactly 1 match where A is home
    // and 1 match where B is home
    const teamIds = config.teamIds;
    for (let i = 0; i < teamIds.length; i++) {
      for (let j = 0; j < teamIds.length; j++) {
        if (i === j) continue;
        const key = `${teamIds[i]}-vs-${teamIds[j]}`;
        expect(matchups.get(key)).toBe(1);
      }
    }
  });

  it('second half reverses home/away from first half', () => {
    const fixtures = generateSeasonFixtures(config);

    // Week 1 fixtures should be the reverse of week 24
    // (first half round 0 → second half round 0)
    for (let round = 0; round < 23; round++) {
      const firstHalf = fixtures[round].fixtures;
      const secondHalf = fixtures[round + 23].fixtures;

      expect(firstHalf.length).toBe(secondHalf.length);

      for (let i = 0; i < firstHalf.length; i++) {
        expect(firstHalf[i].homeTeamId).toBe(secondHalf[i].awayTeamId);
        expect(firstHalf[i].awayTeamId).toBe(secondHalf[i].homeTeamId);
      }
    }
  });

  it('is deterministic: same config produces same fixtures', () => {
    const f1 = generateSeasonFixtures(config);
    const f2 = generateSeasonFixtures(config);

    expect(f1).toEqual(f2);
  });

  it('different seasons produce different fixture orders', () => {
    const s1 = generateSeasonFixtures({ ...config, season: 1 });
    const s2 = generateSeasonFixtures({ ...config, season: 2 });

    // Week 1 fixtures should differ between seasons
    // (due to seeded shuffle of team order)
    const w1s1 = s1[0].fixtures.map(f => `${f.homeTeamId}-${f.awayTeamId}`).join(',');
    const w1s2 = s2[0].fixtures.map(f => `${f.homeTeamId}-${f.awayTeamId}`).join(',');

    expect(w1s1).not.toBe(w1s2);
  });

  it('throws for odd number of teams', () => {
    expect(() => generateSeasonFixtures({
      teamIds: makeTeamIds(23),
      season: 1,
      seed: 'odd'
    })).toThrow();
  });

  it('throws for fewer than 2 teams', () => {
    expect(() => generateSeasonFixtures({
      teamIds: ['only-one'],
      season: 1,
      seed: 'too-few'
    })).toThrow();
  });

  it('works for small leagues (4 teams)', () => {
    const small = generateSeasonFixtures({
      teamIds: makeTeamIds(4),
      season: 1,
      seed: 'small'
    });

    // 4 teams: 3 rounds * 2 = 6 weeks, 2 matches per week
    expect(small.length).toBe(6);
    for (const week of small) {
      expect(week.fixtures.length).toBe(2);
    }
  });
});

describe('getWeekFixtures', () => {
  it('returns the correct week', () => {
    const all = generateSeasonFixtures({
      teamIds: makeTeamIds(24),
      season: 1,
      seed: 'get-test'
    });

    const week5 = getWeekFixtures(all, 5);
    expect(week5).toBeDefined();
    expect(week5!.week).toBe(5);
    expect(week5!.fixtures.length).toBe(12);
  });

  it('returns undefined for invalid week', () => {
    const all = generateSeasonFixtures({
      teamIds: makeTeamIds(24),
      season: 1,
      seed: 'invalid-test'
    });

    expect(getWeekFixtures(all, 0)).toBeUndefined();
    expect(getWeekFixtures(all, 47)).toBeUndefined();
  });
});

describe('matchSeed', () => {
  it('produces deterministic seeds', () => {
    expect(matchSeed('base', 1, 5, 3)).toBe('base-S1-W5-M3');
    expect(matchSeed('base', 1, 5, 3)).toBe('base-S1-W5-M3');
  });

  it('different parameters produce different seeds', () => {
    const s1 = matchSeed('base', 1, 1, 0);
    const s2 = matchSeed('base', 1, 1, 1);
    const s3 = matchSeed('base', 1, 2, 0);
    const s4 = matchSeed('base', 2, 1, 0);

    expect(new Set([s1, s2, s3, s4]).size).toBe(4);
  });
});
