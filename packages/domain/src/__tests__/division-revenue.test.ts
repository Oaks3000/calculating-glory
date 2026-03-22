/**
 * Division Tracking & Tier-Scaled Revenue Tests
 *
 * Covers:
 * - facilityRevenue() formula + tier multipliers
 * - division field defaults to LEAGUE_TWO
 * - SEASON_ENDED steps division up on promotion, down on relegation
 * - Division is clamped at LEAGUE_TWO (floor) and PREMIER_LEAGUE (ceiling)
 * - WEEK_ADVANCED weekly revenue reflects current division
 */

import { buildState, reduceEvent } from '../reducers';
import { GameState } from '../types/game-state-updated';
import { GameEvent, GameStartedEvent } from '../events/types';
import { facilityRevenue, TIER_REVENUE_MULTIPLIER } from '../simulation/revenue';
import { Facility } from '../types/facility';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GAME_STARTED: GameStartedEvent = {
  type: 'GAME_STARTED',
  timestamp: 1000,
  clubId: 'player-club',
  clubName: 'Test FC',
  initialBudget: 100_000_000,
  difficulty: 'MEDIUM',
  seed: 'div-rev-test'
};

function base(): GameState {
  return buildState([GAME_STARTED]);
}

function seasonEndedEvent(finalPosition: number, promoted: boolean, relegated: boolean): GameEvent {
  return {
    type: 'SEASON_ENDED',
    timestamp: 2000,
    season: 1,
    finalPosition,
    promoted,
    relegated,
  } as any;
}

function weekAdvancedEvent(week: number): GameEvent {
  return { type: 'WEEK_ADVANCED', timestamp: 3000, week, season: 1 } as any;
}

function makeCommercialFacility(level: number): Facility {
  return { type: 'CLUB_COMMERCIAL', level, upgradeCost: 0, benefit: { type: 'revenue', improvement: 0 } };
}

function makeFoodFacility(level: number): Facility {
  return { type: 'FOOD_AND_BEVERAGE', level, upgradeCost: 0, benefit: { type: 'revenue', improvement: 0 } };
}

// ─── facilityRevenue() unit tests ─────────────────────────────────────────────

describe('facilityRevenue()', () => {
  it('returns 0 with no revenue-generating facilities', () => {
    expect(facilityRevenue([], 'LEAGUE_TWO')).toBe(0);
  });

  it('CLUB_COMMERCIAL level 1 earns £500/wk base in League Two', () => {
    // 1 * 50_000p = 50_000p = £500
    expect(facilityRevenue([makeCommercialFacility(1)], 'LEAGUE_TWO')).toBe(50_000);
  });

  it('FOOD_AND_BEVERAGE level 1 earns £300/wk base in League Two', () => {
    // 1 * 30_000p = 30_000p = £300
    expect(facilityRevenue([makeFoodFacility(1)], 'LEAGUE_TWO')).toBe(30_000);
  });

  it('sums commercial + food revenue correctly in League Two', () => {
    // commercial L3 + food L2 = (3*50_000 + 2*30_000) * 1 = 210_000p
    const facilities = [makeCommercialFacility(3), makeFoodFacility(2)];
    expect(facilityRevenue(facilities, 'LEAGUE_TWO')).toBe(210_000);
  });

  it('applies League One multiplier (2×)', () => {
    const facilities = [makeCommercialFacility(1)];
    expect(facilityRevenue(facilities, 'LEAGUE_ONE')).toBe(50_000 * 2);
  });

  it('applies Championship multiplier (4×)', () => {
    const facilities = [makeCommercialFacility(1)];
    expect(facilityRevenue(facilities, 'CHAMPIONSHIP')).toBe(50_000 * 4);
  });

  it('applies Premier League multiplier (10×)', () => {
    const facilities = [makeCommercialFacility(1)];
    expect(facilityRevenue(facilities, 'PREMIER_LEAGUE')).toBe(50_000 * 10);
  });

  it('max facility output (L5 commercial + L5 food) scales correctly across tiers', () => {
    const maxFacilities = [makeCommercialFacility(5), makeFoodFacility(5)];
    // Base: (5*50_000 + 5*30_000) = 400_000p = £4,000/wk
    const baseMax = 400_000;
    expect(facilityRevenue(maxFacilities, 'LEAGUE_TWO')).toBe(baseMax);
    expect(facilityRevenue(maxFacilities, 'LEAGUE_ONE')).toBe(baseMax * 2);
    expect(facilityRevenue(maxFacilities, 'CHAMPIONSHIP')).toBe(baseMax * 4);
    expect(facilityRevenue(maxFacilities, 'PREMIER_LEAGUE')).toBe(baseMax * 10);
  });
});

// ─── TIER_REVENUE_MULTIPLIER sanity ───────────────────────────────────────────

describe('TIER_REVENUE_MULTIPLIER', () => {
  it('multipliers increase with each tier', () => {
    expect(TIER_REVENUE_MULTIPLIER.LEAGUE_TWO).toBeLessThan(TIER_REVENUE_MULTIPLIER.LEAGUE_ONE);
    expect(TIER_REVENUE_MULTIPLIER.LEAGUE_ONE).toBeLessThan(TIER_REVENUE_MULTIPLIER.CHAMPIONSHIP);
    expect(TIER_REVENUE_MULTIPLIER.CHAMPIONSHIP).toBeLessThan(TIER_REVENUE_MULTIPLIER.PREMIER_LEAGUE);
  });

  it('League Two base multiplier is 1', () => {
    expect(TIER_REVENUE_MULTIPLIER.LEAGUE_TWO).toBe(1);
  });
});

// ─── Division initial state ────────────────────────────────────────────────────

describe('division — initial state', () => {
  it('starts at LEAGUE_TWO', () => {
    expect(base().division).toBe('LEAGUE_TWO');
  });
});

// ─── Division steps on SEASON_ENDED ───────────────────────────────────────────

describe('division — SEASON_ENDED steps division', () => {
  it('promotion from LEAGUE_TWO moves to LEAGUE_ONE', () => {
    const state = base(); // LEAGUE_TWO
    const next = reduceEvent(state, seasonEndedEvent(1, true, false));
    expect(next.division).toBe('LEAGUE_ONE');
  });

  it('relegation from LEAGUE_ONE moves back to LEAGUE_TWO', () => {
    const state = { ...base(), division: 'LEAGUE_ONE' as const };
    const next = reduceEvent(state, seasonEndedEvent(24, false, true));
    expect(next.division).toBe('LEAGUE_TWO');
  });

  it('promotion from LEAGUE_ONE moves to CHAMPIONSHIP', () => {
    const state = { ...base(), division: 'LEAGUE_ONE' as const };
    const next = reduceEvent(state, seasonEndedEvent(1, true, false));
    expect(next.division).toBe('CHAMPIONSHIP');
  });

  it('promotion from CHAMPIONSHIP moves to PREMIER_LEAGUE', () => {
    const state = { ...base(), division: 'CHAMPIONSHIP' as const };
    const next = reduceEvent(state, seasonEndedEvent(1, true, false));
    expect(next.division).toBe('PREMIER_LEAGUE');
  });

  it('mid-table finish leaves division unchanged', () => {
    const state = { ...base(), division: 'LEAGUE_ONE' as const };
    const next = reduceEvent(state, seasonEndedEvent(10, false, false));
    expect(next.division).toBe('LEAGUE_ONE');
  });

  it('promotion from PREMIER_LEAGUE is clamped — stays in PREMIER_LEAGUE', () => {
    const state = { ...base(), division: 'PREMIER_LEAGUE' as const };
    const next = reduceEvent(state, seasonEndedEvent(1, true, false));
    expect(next.division).toBe('PREMIER_LEAGUE');
  });

  it('relegation from LEAGUE_TWO is clamped — stays in LEAGUE_TWO', () => {
    const state = base(); // LEAGUE_TWO
    const next = reduceEvent(state, seasonEndedEvent(24, false, true));
    expect(next.division).toBe('LEAGUE_TWO');
  });
});

// ─── WEEK_ADVANCED revenue scales with division ───────────────────────────────

describe('WEEK_ADVANCED — facility revenue scales with division', () => {
  it('League One earns 2× the facility revenue of League Two', () => {
    const commercial = makeCommercialFacility(2);
    const food = makeFoodFacility(2);

    const baseClub = base().club;
    const facilitiesWithRevenue = [
      ...baseClub.facilities.filter(f => f.type !== 'CLUB_COMMERCIAL' && f.type !== 'FOOD_AND_BEVERAGE'),
      commercial,
      food,
    ];

    const stateL2: GameState = {
      ...base(),
      division: 'LEAGUE_TWO',
      club: { ...baseClub, facilities: facilitiesWithRevenue, squad: [], transferBudget: 0 },
    };
    const stateL1: GameState = {
      ...stateL2,
      division: 'LEAGUE_ONE',
    };

    const nextL2 = reduceEvent(stateL2, weekAdvancedEvent(1));
    const nextL1 = reduceEvent(stateL1, weekAdvancedEvent(1));

    // L1 budget increase should be exactly 2× L2 budget increase (squad is empty so no charisma)
    expect(nextL1.club.transferBudget).toBe(nextL2.club.transferBudget * 2);
  });

  it('Championship earns 4× the facility revenue of League Two', () => {
    const baseClub = base().club;
    const commercial = makeCommercialFacility(1);
    const facilitiesWithRevenue = [
      ...baseClub.facilities.filter(f => f.type !== 'CLUB_COMMERCIAL' && f.type !== 'FOOD_AND_BEVERAGE'),
      commercial,
    ];

    const stateL2: GameState = {
      ...base(),
      division: 'LEAGUE_TWO',
      club: { ...baseClub, facilities: facilitiesWithRevenue, squad: [], transferBudget: 0 },
    };
    const stateCH: GameState = { ...stateL2, division: 'CHAMPIONSHIP' };

    const nextL2 = reduceEvent(stateL2, weekAdvancedEvent(1));
    const nextCH = reduceEvent(stateCH, weekAdvancedEvent(1));

    expect(nextCH.club.transferBudget).toBe(nextL2.club.transferBudget * 4);
  });
});
