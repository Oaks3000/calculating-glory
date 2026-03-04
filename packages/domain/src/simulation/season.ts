/**
 * Season Simulation
 *
 * Round-robin fixture generation using the circle method.
 * 24 teams, 46 match weeks, 12 matches per week.
 *
 * Fixtures are deterministic from team IDs + seed.
 * Seeded shuffle of team order gives variety between seasons.
 */

import { seededShuffle } from './rng';

/**
 * A single fixture (home vs away)
 */
export interface Fixture {
  homeTeamId: string;
  awayTeamId: string;
}

/**
 * All fixtures for one week
 */
export interface WeekFixtures {
  week: number;
  fixtures: Fixture[];
}

/**
 * Season configuration
 */
export interface SeasonConfig {
  teamIds: string[];
  season: number;
  seed: string;
}

/**
 * Generate a full season of fixtures using the circle method.
 *
 * For N teams (even): N-1 rounds in first half, N-1 in second half
 * (reversed home/away). Each round has N/2 matches.
 * Total = (N-1)*2 weeks = 46 weeks for 24 teams.
 *
 * Team order is shuffled by seed so each season has different matchups per week.
 */
export function generateSeasonFixtures(config: SeasonConfig): WeekFixtures[] {
  const { teamIds, season, seed } = config;
  const n = teamIds.length;

  if (n < 2 || n % 2 !== 0) {
    throw new Error(`Need an even number of teams >= 2, got ${n}`);
  }

  // Shuffle team order for this season so fixture patterns differ
  const shuffled = seededShuffle(teamIds, `${seed}-S${season}-order`);

  const fixed = shuffled[0];
  const rotating = [...shuffled.slice(1)];
  const rounds: Fixture[][] = [];

  // First half: N-1 rounds via circle method
  for (let round = 0; round < n - 1; round++) {
    const fixtures: Fixture[] = [];

    // Fixed team alternates home/away each round
    if (round % 2 === 0) {
      fixtures.push({ homeTeamId: fixed, awayTeamId: rotating[rotating.length - 1] });
    } else {
      fixtures.push({ homeTeamId: rotating[rotating.length - 1], awayTeamId: fixed });
    }

    // Pair remaining: position i with position (len-2-i)
    // Alternate home/away to ensure fair distribution
    for (let i = 0; i < (rotating.length - 1) / 2; i++) {
      if (i % 2 === 0) {
        fixtures.push({
          homeTeamId: rotating[i],
          awayTeamId: rotating[rotating.length - 2 - i]
        });
      } else {
        fixtures.push({
          homeTeamId: rotating[rotating.length - 2 - i],
          awayTeamId: rotating[i]
        });
      }
    }

    rounds.push(fixtures);

    // Rotate: move last element to front
    rotating.unshift(rotating.pop()!);
  }

  // Second half: same fixtures, reversed home/away
  const secondHalf = rounds.map(roundFixtures =>
    roundFixtures.map(f => ({
      homeTeamId: f.awayTeamId,
      awayTeamId: f.homeTeamId
    }))
  );

  const allRounds = [...rounds, ...secondHalf];

  // Convert to WeekFixtures with 1-indexed week numbers
  return allRounds.map((fixtures, index) => ({
    week: index + 1,
    fixtures
  }));
}

/**
 * Get the fixtures for a specific week
 */
export function getWeekFixtures(
  allFixtures: WeekFixtures[],
  week: number
): WeekFixtures | undefined {
  return allFixtures.find(w => w.week === week);
}

/**
 * Generate the per-match seed for deterministic simulation.
 * Format: baseSeed-S{season}-W{week}-M{matchIndex}
 */
export function matchSeed(
  baseSeed: string,
  season: number,
  week: number,
  matchIndex: number
): string {
  return `${baseSeed}-S${season}-W${week}-M${matchIndex}`;
}
