/**
 * Manager Tests — Phase 5.5
 *
 * Tests for:
 *   - generateManagerPool: deterministic, correct counts per tier
 *   - HIRE_MANAGER command: adds manager, removes from pool, sets contractExpiresWeek
 *   - HIRE_MANAGER: fails when manager not in pool
 *   - HIRE_MANAGER: fails when wage exceeds budget
 *   - HIRE_MANAGER: replaces existing manager (no compensation in pre-season)
 *   - SACK_MANAGER command: removes manager, deducts compensation
 *   - SACK_MANAGER: fails when no manager
 *   - SACK_MANAGER: fails when cannot afford compensation
 *   - Manager experience contributes to team modifier in match sim
 *   - Manager tactical amplifies training focus in match sim
 *   - Manager motivation nudges morale each week in WEEK_ADVANCED
 */

import { buildState, reduceEvent } from '../reducers';
import { handleCommand } from '../commands/handlers';
import { GameState } from '../types/game-state-updated';
import { Manager } from '../types/staff';
import { GameStartedEvent } from '../events/types';
import { generateManagerPool } from '../data/manager-generator';
import { clubToTeam } from '../simulation/match';
import { Club } from '../types/club';
import { Player } from '../types/player';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeStartedState(seed = 'test-seed'): GameState {
  return buildState([
    {
      type: 'GAME_STARTED',
      timestamp: Date.now(),
      clubId: 'test-club',
      clubName: 'Test FC',
      initialBudget: 500_000_000,
      difficulty: 'MEDIUM',
      seed,
    } as GameStartedEvent,
  ]);
}

const DEFAULT_CURVE = { shape: 'SHALLOW_BELL' as const, peakHeight: 3 as const, startAge: 18, retirementAge: 36, baseAttack: 50, baseDefence: 50 };

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Test Player',
    position: 'MID',
    wage: 50_000,
    transferValue: 500_000,
    age: 24,
    morale: 60,
    stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 60 },
    attributes: { attack: 50, defence: 50, teamwork: 50, charisma: 50, publicPotential: 60 },
    truePotential: 33,
    curve: DEFAULT_CURVE,
    contractExpiresWeek: 46,
    ...overrides,
  };
}

function makeMinimalClub(overrides: Partial<Club> = {}): Club {
  return {
    id: 'club-1',
    name: 'Test FC',
    transferBudget: 10_000_000,
    wageBudget: 2_000_000,
    squad: [makePlayer()],
    staff: [],
    facilities: [],
    reputation: 30,
    stadium: { name: '', capacity: 5000, averageAttendance: 3000, ticketPrice: 1500 },
    form: [],
    trainingFocus: null,
    preferredFormation: null,
    squadCapacity: 24,
    manager: null,
    ...overrides,
  };
}

function makeManager(overrides: Partial<Manager> = {}): Manager {
  return {
    id: 'mgr-test',
    name: 'Terry Boulton',
    attributes: { tactical: 70, motivation: 65, experience: 75 },
    wage: 300_000,
    contractLengthWeeks: 52,
    contractExpiresWeek: 0,
    ...overrides,
  };
}

// ── generateManagerPool ───────────────────────────────────────────────────────

describe('generateManagerPool', () => {
  it('returns exactly 8 managers', () => {
    const pool = generateManagerPool('test-seed');
    expect(pool.length).toBe(8);
  });

  it('is deterministic — same seed produces identical pool', () => {
    const a = generateManagerPool('same-seed');
    const b = generateManagerPool('same-seed');
    expect(a).toEqual(b);
  });

  it('produces different pools from different seeds', () => {
    const a = generateManagerPool('seed-a');
    const b = generateManagerPool('seed-b');
    // At least one attribute should differ
    expect(a[0].attributes).not.toEqual(b[0].attributes);
  });

  it('all managers have unique IDs', () => {
    const pool = generateManagerPool('test-seed');
    const ids = pool.map(m => m.id);
    expect(new Set(ids).size).toBe(8);
  });

  it('all managers have attributes in 0-100 range', () => {
    const pool = generateManagerPool('test-seed');
    for (const m of pool) {
      expect(m.attributes.tactical).toBeGreaterThanOrEqual(0);
      expect(m.attributes.tactical).toBeLessThanOrEqual(100);
      expect(m.attributes.motivation).toBeGreaterThanOrEqual(0);
      expect(m.attributes.motivation).toBeLessThanOrEqual(100);
      expect(m.attributes.experience).toBeGreaterThanOrEqual(0);
      expect(m.attributes.experience).toBeLessThanOrEqual(100);
    }
  });

  it('contractExpiresWeek is 0 until hire', () => {
    const pool = generateManagerPool('test-seed');
    for (const m of pool) {
      expect(m.contractExpiresWeek).toBe(0);
    }
  });
});

// ── HIRE_MANAGER command ──────────────────────────────────────────────────────

describe('HIRE_MANAGER command', () => {
  it('adds manager to club and removes from pool', () => {
    const state = makeStartedState();
    const managerId = state.managerPool[0].id;

    const result = handleCommand({ type: 'HIRE_MANAGER', managerId }, state);
    expect(result.error).toBeUndefined();

    const newState = result.events!.reduce(reduceEvent, state);
    expect(newState.club.manager?.id).toBe(managerId);
    expect(newState.managerPool.find(m => m.id === managerId)).toBeUndefined();
  });

  it('sets contractExpiresWeek correctly', () => {
    const state = makeStartedState();
    const manager = state.managerPool[0];

    const result = handleCommand({ type: 'HIRE_MANAGER', managerId: manager.id }, state);
    const newState = result.events!.reduce(reduceEvent, state);

    expect(newState.club.manager?.contractExpiresWeek).toBe(
      state.currentWeek + manager.contractLengthWeeks
    );
  });

  it('fails when managerId not in pool', () => {
    const state = makeStartedState();
    const result = handleCommand({ type: 'HIRE_MANAGER', managerId: 'nonexistent' }, state);
    expect(result.error).toBeDefined();
  });

  it('fails when manager wage exceeds remaining wage budget', () => {
    const state = makeStartedState();
    // Set a tiny wage budget
    const tightState: GameState = {
      ...state,
      club: { ...state.club, wageBudget: 1 },
    };
    const expensiveManager = state.managerPool.find(m => m.wage > 0);
    if (!expensiveManager) return;

    const result = handleCommand({ type: 'HIRE_MANAGER', managerId: expensiveManager.id }, tightState);
    expect(result.error?.code).toBe('INSUFFICIENT_BUDGET');
  });

  it('replaces an existing manager without compensation in pre-season', () => {
    const state = makeStartedState();
    const firstManagerId = state.managerPool[0].id;
    const secondManagerId = state.managerPool[1].id;

    // Hire first
    const after1 = handleCommand({ type: 'HIRE_MANAGER', managerId: firstManagerId }, state)
      .events!.reduce(reduceEvent, state);

    // Hire second — should replace first, no compensation
    const result2 = handleCommand({ type: 'HIRE_MANAGER', managerId: secondManagerId }, after1);
    expect(result2.error).toBeUndefined();

    const after2 = result2.events!.reduce(reduceEvent, after1);
    expect(after2.club.manager?.id).toBe(secondManagerId);
    // Budget should be unchanged (no compensation deducted)
    expect(after2.club.transferBudget).toBe(after1.club.transferBudget);
  });
});

// ── SACK_MANAGER command ──────────────────────────────────────────────────────

describe('SACK_MANAGER command', () => {
  it('removes manager from club', () => {
    const state = makeStartedState();
    const managerId = state.managerPool[0].id;

    // First hire
    const withManager = handleCommand({ type: 'HIRE_MANAGER', managerId }, state)
      .events!.reduce(reduceEvent, state);

    // Then sack
    const result = handleCommand({ type: 'SACK_MANAGER' }, withManager);
    expect(result.error).toBeUndefined();

    const final = result.events!.reduce(reduceEvent, withManager);
    expect(final.club.manager).toBeNull();
  });

  it('deducts compensation from transfer budget', () => {
    const state = makeStartedState();
    const managerId = state.managerPool[0].id;

    const withManager = handleCommand({ type: 'HIRE_MANAGER', managerId }, state)
      .events!.reduce(reduceEvent, state);

    const budgetBefore = withManager.club.transferBudget;
    const manager = withManager.club.manager!;
    const weeksRemaining = manager.contractExpiresWeek - withManager.currentWeek;
    const expectedCompensation = Math.round(weeksRemaining * manager.wage * 0.5);

    const result = handleCommand({ type: 'SACK_MANAGER' }, withManager);
    const final = result.events!.reduce(reduceEvent, withManager);

    expect(final.club.transferBudget).toBe(budgetBefore - expectedCompensation);
  });

  it('fails when no manager is hired', () => {
    const state = makeStartedState();
    const result = handleCommand({ type: 'SACK_MANAGER' }, state);
    expect(result.error).toBeDefined();
  });

  it('fails when club cannot afford compensation', () => {
    const state = makeStartedState();
    const managerId = state.managerPool[0].id;

    const withManager = handleCommand({ type: 'HIRE_MANAGER', managerId }, state)
      .events!.reduce(reduceEvent, state);

    // Set transfer budget to 0
    const brokeState: GameState = {
      ...withManager,
      club: { ...withManager.club, transferBudget: 0 },
    };

    const result = handleCommand({ type: 'SACK_MANAGER' }, brokeState);
    expect(result.error?.code).toBe('INSUFFICIENT_BUDGET');
  });
});

// ── Match sim — manager experience ───────────────────────────────────────────

describe('Match sim — manager experience contribution', () => {
  it('experienced manager increases teamStrength modifier vs no manager', () => {
    const base = makeMinimalClub({ manager: null });
    const experienced = makeMinimalClub({
      manager: makeManager({ attributes: { tactical: 50, motivation: 50, experience: 100 } }),
    });

    const teamWithout = clubToTeam(base);
    const teamWith = clubToTeam(experienced);

    expect(teamWith.teamStrength).toBeGreaterThan(teamWithout.teamStrength);
  });

  it('zero-experience manager contributes no experience bonus', () => {
    const base = makeMinimalClub({ manager: null });
    const zeroExp = makeMinimalClub({
      manager: makeManager({ attributes: { tactical: 50, motivation: 50, experience: 0 } }),
    });

    // tacticalAmplifier = 0.5 + 50/100 = 1.0 → no training focus (no focus set)
    // experience = 0 → no experience bonus
    // So teamStrength should be equal
    const teamWithout = clubToTeam(base);
    const teamWith = clubToTeam(zeroExp);

    expect(teamWith.teamStrength).toBeCloseTo(teamWithout.teamStrength, 5);
  });
});

// ── Match sim — manager tactical amplifies training focus ────────────────────

describe('Match sim — tactical amplifies training focus', () => {
  it('high tactical manager produces greater ATTACKING bonus than low tactical', () => {
    const highTactical = makeMinimalClub({
      trainingFocus: 'ATTACKING',
      manager: makeManager({ attributes: { tactical: 100, motivation: 50, experience: 0 } }),
    });
    const lowTactical = makeMinimalClub({
      trainingFocus: 'ATTACKING',
      manager: makeManager({ attributes: { tactical: 0, motivation: 50, experience: 0 } }),
    });

    const teamHigh = clubToTeam(highTactical);
    const teamLow = clubToTeam(lowTactical);

    expect(teamHigh.attackStrength).toBeGreaterThan(teamLow.attackStrength);
  });

  it('tactical=50 produces same attack as no manager (neutral amplifier)', () => {
    const noManager = makeMinimalClub({ trainingFocus: 'ATTACKING', manager: null });
    const neutralManager = makeMinimalClub({
      trainingFocus: 'ATTACKING',
      manager: makeManager({ attributes: { tactical: 50, motivation: 50, experience: 0 } }),
    });

    const teamNoMgr = clubToTeam(noManager);
    const teamNeutral = clubToTeam(neutralManager);

    // Both should use amplifier=1.0 → identical attackStrength
    expect(teamNeutral.attackStrength).toBeCloseTo(teamNoMgr.attackStrength, 5);
  });

  it('DEFENSIVE focus: high tactical raises defenceStrength', () => {
    const highTactical = makeMinimalClub({
      trainingFocus: 'DEFENSIVE',
      manager: makeManager({ attributes: { tactical: 100, motivation: 50, experience: 0 } }),
    });
    const lowTactical = makeMinimalClub({
      trainingFocus: 'DEFENSIVE',
      manager: makeManager({ attributes: { tactical: 0, motivation: 50, experience: 0 } }),
    });

    const high = clubToTeam(highTactical);
    const low = clubToTeam(lowTactical);

    expect(high.defenceStrength).toBeGreaterThan(low.defenceStrength);
  });
});

// ── Weekly morale nudge ───────────────────────────────────────────────────────

describe('Manager motivation — weekly morale nudge', () => {
  it('high motivation manager increases squad morale each week', () => {
    const state = makeStartedState();
    const managerId = state.managerPool.find(
      m => m.attributes.motivation >= 75
    )?.id;
    if (!managerId) return; // skip if no such manager in pool

    const withManager = handleCommand({ type: 'HIRE_MANAGER', managerId }, state)
      .events!.reduce(reduceEvent, state);

    const beforeMorale = withManager.club.squad.reduce((s, p) => s + p.morale, 0);

    // Advance a week
    const afterWeek = reduceEvent(withManager, {
      type: 'WEEK_ADVANCED',
      timestamp: Date.now(),
      week: 1,
      season: 1,
    });

    const afterMorale = afterWeek.club.squad.reduce((s, p) => s + p.morale, 0);
    expect(afterMorale).toBeGreaterThanOrEqual(beforeMorale);
  });

  it('no manager → morale unchanged by week advance (no nudge)', () => {
    const state = makeStartedState();
    // Ensure no manager
    expect(state.club.manager).toBeNull();

    const moraleBefore = state.club.squad.reduce((s, p) => s + p.morale, 0);

    const afterWeek = reduceEvent(state, {
      type: 'WEEK_ADVANCED',
      timestamp: Date.now(),
      week: 1,
      season: 1,
    });

    const moraleAfter = afterWeek.club.squad.reduce((s, p) => s + p.morale, 0);
    // No manager = no morale nudge
    expect(moraleAfter).toBe(moraleBefore);
  });

  it('motivation=50 manager produces zero morale delta', () => {
    const state = makeStartedState();
    // Find a manager with motivation exactly 50, or skip
    const neutralMgr = state.managerPool.find(m => m.attributes.motivation === 50);
    if (!neutralMgr) return;

    const withManager = handleCommand({ type: 'HIRE_MANAGER', managerId: neutralMgr.id }, state)
      .events!.reduce(reduceEvent, state);

    const moraleBefore = withManager.club.squad.reduce((s, p) => s + p.morale, 0);
    const afterWeek = reduceEvent(withManager, {
      type: 'WEEK_ADVANCED', timestamp: Date.now(), week: 1, season: 1,
    });
    const moraleAfter = afterWeek.club.squad.reduce((s, p) => s + p.morale, 0);
    expect(moraleAfter).toBe(moraleBefore);
  });

  it('morale is clamped to [0, 100]', () => {
    // Manager with motivation=0 — squad morale should not go below 0
    const state = makeStartedState();
    const lowMoraleMgr = state.managerPool.find(m => m.attributes.motivation <= 25);
    if (!lowMoraleMgr) return;

    // Set all squad morale to 0
    const zeroMoraleState: GameState = {
      ...state,
      club: {
        ...state.club,
        squad: state.club.squad.map(p => ({ ...p, morale: 0 })),
        manager: { ...lowMoraleMgr, contractExpiresWeek: 52 },
      },
    };

    const afterWeek = reduceEvent(zeroMoraleState, {
      type: 'WEEK_ADVANCED', timestamp: Date.now(), week: 1, season: 1,
    });

    for (const p of afterWeek.club.squad) {
      expect(p.morale).toBeGreaterThanOrEqual(0);
      expect(p.morale).toBeLessThanOrEqual(100);
    }
  });
});
