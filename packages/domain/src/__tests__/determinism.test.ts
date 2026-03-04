import { simulateMatch, Team } from '../simulation/match';

/**
 * Golden determinism tests.
 * These verify that the exact same inputs always produce the exact same outputs.
 * If any of these fail, determinism is broken.
 */

const HOME_TEAM: Team = {
  id: 'swindon',
  name: 'Swindon Town',
  attackStrength: 55,
  defenceStrength: 48,
  teamStrength: 1.05
};

const AWAY_TEAM: Team = {
  id: 'crawley',
  name: 'Crawley Town',
  attackStrength: 45,
  defenceStrength: 52,
  teamStrength: 0.95
};

const GOLDEN_SEED = 'calculating-glory-S1-W1-M0';

describe('determinism golden tests', () => {
  it('produces the exact same result 100 times', () => {
    const baseline = simulateMatch(HOME_TEAM, AWAY_TEAM, GOLDEN_SEED);

    for (let i = 0; i < 100; i++) {
      const result = simulateMatch(HOME_TEAM, AWAY_TEAM, GOLDEN_SEED);
      expect(result.homeGoals).toBe(baseline.homeGoals);
      expect(result.awayGoals).toBe(baseline.awayGoals);
      expect(result.homeExpectedGoals).toBe(baseline.homeExpectedGoals);
      expect(result.awayExpectedGoals).toBe(baseline.awayExpectedGoals);
    }
  });

  it('changing the seed changes the result (eventually)', () => {
    const baseline = simulateMatch(HOME_TEAM, AWAY_TEAM, GOLDEN_SEED);

    let foundDifferent = false;
    for (let i = 1; i <= 50; i++) {
      const result = simulateMatch(HOME_TEAM, AWAY_TEAM, `${GOLDEN_SEED}-alt-${i}`);
      if (result.homeGoals !== baseline.homeGoals || result.awayGoals !== baseline.awayGoals) {
        foundDifferent = true;
        break;
      }
    }

    expect(foundDifferent).toBe(true);
  });

  it('changing attack strength changes expected goals', () => {
    const stronger = { ...HOME_TEAM, attackStrength: 70 };
    const weaker = { ...HOME_TEAM, attackStrength: 35 };

    const r1 = simulateMatch(stronger, AWAY_TEAM, GOLDEN_SEED);
    const r2 = simulateMatch(weaker, AWAY_TEAM, GOLDEN_SEED);

    expect(r1.homeExpectedGoals).toBeGreaterThan(r2.homeExpectedGoals);
  });

  it('changing defence strength changes opponent expected goals', () => {
    const strongDef = { ...AWAY_TEAM, defenceStrength: 70 };
    const weakDef = { ...AWAY_TEAM, defenceStrength: 30 };

    const r1 = simulateMatch(HOME_TEAM, strongDef, GOLDEN_SEED);
    const r2 = simulateMatch(HOME_TEAM, weakDef, GOLDEN_SEED);

    // Home expected goals should be lower against strong defence
    expect(r1.homeExpectedGoals).toBeLessThan(r2.homeExpectedGoals);
  });

  it('team strength modifier affects expected goals', () => {
    const boosted = { ...HOME_TEAM, teamStrength: 1.3 };
    const nerfed = { ...HOME_TEAM, teamStrength: 0.8 };

    const r1 = simulateMatch(boosted, AWAY_TEAM, GOLDEN_SEED);
    const r2 = simulateMatch(nerfed, AWAY_TEAM, GOLDEN_SEED);

    expect(r1.homeExpectedGoals).toBeGreaterThan(r2.homeExpectedGoals);
  });

  it('full season simulation is reproducible', () => {
    // Simulate 46 weeks of one match and verify all are deterministic
    const results1: string[] = [];
    const results2: string[] = [];

    for (let week = 1; week <= 46; week++) {
      const seed = `golden-S1-W${week}-M0`;
      const r1 = simulateMatch(HOME_TEAM, AWAY_TEAM, seed);
      const r2 = simulateMatch(HOME_TEAM, AWAY_TEAM, seed);
      results1.push(`${r1.homeGoals}-${r1.awayGoals}`);
      results2.push(`${r2.homeGoals}-${r2.awayGoals}`);
    }

    expect(results1).toEqual(results2);
  });
});
