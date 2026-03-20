/**
 * Scout Mission Tests
 *
 * Tests for:
 *   - START_SCOUT_MISSION: validates no duplicate missions, budget deducted
 *   - SCOUT_TARGET_FOUND: emitted on week tick when SEARCHING, mission → TARGET_FOUND
 *   - PLACE_SCOUT_BID: pass → BID_PENDING with offeredWage; fail → BID_REJECTED
 *   - SCOUT_TRANSFER_COMPLETED: fires on window-open week, player in squad, budget deducted
 *   - CANCEL_SCOUT_MISSION: clears scoutMission
 *   - Transfer window: isTransferWindowOpen correctness
 *   - generateScoutTarget: determinism + position filter
 */

import { buildState, reduceEvent } from '../reducers';
import { handleCommand } from '../commands/handlers';
import { GameState } from '../types/game-state-updated';
import { GameStartedEvent } from '../events/types';
import { isTransferWindowOpen } from '../types/facility';
import { generateScoutTarget, getScoutFee } from '../data/scout-target-generator';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = buildState([
    {
      type: 'GAME_STARTED',
      timestamp: Date.now(),
      clubId: 'test-club',
      clubName: 'Test FC',
      initialBudget: 100_000_000, // £100k
      difficulty: 'MEDIUM',
      seed: 'test-seed',
    } as GameStartedEvent,
  ]);
  return { ...base, ...overrides };
}

function inSeason(state: GameState, week = 5): GameState {
  return { ...state, phase: 'MID_SEASON', currentWeek: week };
}

// ── Transfer window ───────────────────────────────────────────────────────────

describe('isTransferWindowOpen', () => {
  it('is always open in PRE_SEASON', () => {
    expect(isTransferWindowOpen(0, 'PRE_SEASON')).toBe(true);
  });

  it('is open for summer window weeks 1–4', () => {
    for (let w = 1; w <= 4; w++) {
      expect(isTransferWindowOpen(w, 'EARLY_SEASON')).toBe(true);
    }
  });

  it('is closed in weeks 5–20', () => {
    for (let w = 5; w <= 20; w++) {
      expect(isTransferWindowOpen(w, 'EARLY_SEASON')).toBe(false);
    }
  });

  it('is open for January window weeks 21–24', () => {
    for (let w = 21; w <= 24; w++) {
      expect(isTransferWindowOpen(w, 'MID_SEASON')).toBe(true);
    }
  });

  it('is closed from week 25 onwards', () => {
    for (let w = 25; w <= 46; w++) {
      expect(isTransferWindowOpen(w, 'LATE_SEASON')).toBe(false);
    }
  });
});

// ── Scout fee ─────────────────────────────────────────────────────────────────

describe('getScoutFee', () => {
  it('returns 50,000p at level 0', () => expect(getScoutFee(0)).toBe(50_000));
  it('returns 750,000p at level 5', () => expect(getScoutFee(5)).toBe(750_000));
  it('clamps below 0 to level 0', () => expect(getScoutFee(-1)).toBe(50_000));
  it('clamps above 5 to level 5', () => expect(getScoutFee(9)).toBe(750_000));
});

// ── Target generator ──────────────────────────────────────────────────────────

describe('generateScoutTarget', () => {
  it('generates a player at the requested position', () => {
    const { player } = generateScoutTarget('FWD', null, 3, 'seed', 1, 10, 'my-club');
    expect(player.position).toBe('FWD');
  });

  it('is deterministic for same inputs', () => {
    const a = generateScoutTarget('MID', 'attack', 2, 'seed', 1, 8, 'my-club');
    const b = generateScoutTarget('MID', 'attack', 2, 'seed', 1, 8, 'my-club');
    expect(a.player.id).toBe(b.player.id);
    expect(a.askingPrice).toBe(b.askingPrice);
    expect(a.npcClubId).toBe(b.npcClubId);
  });

  it('produces different targets for different weeks', () => {
    const a = generateScoutTarget('DEF', null, 2, 'seed', 1, 8, 'my-club');
    const b = generateScoutTarget('DEF', null, 2, 'seed', 1, 9, 'my-club');
    // Different week → different RNG seed → different name/club at minimum
    expect(a.player.id).not.toBe(b.player.id);
  });

  it('does not return the player club as npc club', () => {
    // Run many times with different weeks — the player club should never appear
    for (let w = 1; w <= 20; w++) {
      const { npcClubId } = generateScoutTarget('GK', null, 0, 'seed', 1, w, 'swinton');
      expect(npcClubId).not.toBe('swinton');
    }
  });

  it('sets askingPrice > 0', () => {
    const { askingPrice } = generateScoutTarget('FWD', null, 0, 'seed', 1, 5, 'my-club');
    expect(askingPrice).toBeGreaterThan(0);
  });
});

// ── START_SCOUT_MISSION ───────────────────────────────────────────────────────

describe('START_SCOUT_MISSION command', () => {
  it('emits SCOUT_MISSION_STARTED and deducts scout fee from budget', () => {
    const state = makeState();
    const budgetBefore = state.club.transferBudget;
    const result = handleCommand({ type: 'START_SCOUT_MISSION', position: 'FWD', attributePriority: null, budgetCeiling: 5_000_000 }, state);
    expect(result.error).toBeUndefined();
    const event = result.events![0];
    expect(event.type).toBe('SCOUT_MISSION_STARTED');

    const newState = reduceEvent(state, event);
    expect(newState.scoutMission).not.toBeNull();
    expect(newState.scoutMission!.status).toBe('SEARCHING');
    expect(newState.club.transferBudget).toBe(budgetBefore - (event as any).scoutFee);
  });

  it('rejects when a mission is already active', () => {
    const state = makeState();
    const { events } = handleCommand({ type: 'START_SCOUT_MISSION', position: 'MID', attributePriority: null, budgetCeiling: 5_000_000 }, state);
    const stateWithMission = reduceEvent(state, events![0]);
    const result = handleCommand({ type: 'START_SCOUT_MISSION', position: 'DEF', attributePriority: null, budgetCeiling: 5_000_000 }, stateWithMission);
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('VALIDATION_FAILED');
  });

  it('rejects when transfer budget is too low for the scout fee', () => {
    const broke = makeState();
    const state = { ...broke, club: { ...broke.club, transferBudget: 0 } };
    const result = handleCommand({ type: 'START_SCOUT_MISSION', position: 'GK', attributePriority: null, budgetCeiling: 100_000 }, state);
    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('INSUFFICIENT_BUDGET');
  });
});

// ── Week tick: SEARCHING → TARGET_FOUND ──────────────────────────────────────

describe('SIMULATE_WEEK with SEARCHING mission', () => {
  it('emits SCOUT_TARGET_FOUND alongside match events', () => {
    const base = makeState();
    const { events: startEvents } = handleCommand(
      { type: 'START_SCOUT_MISSION', position: 'FWD', attributePriority: null, budgetCeiling: 10_000_000 },
      base,
    );
    const stateWithMission = reduceEvent(base, startEvents![0]);
    const midSeason = inSeason(stateWithMission, 10);

    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 11, season: 1, seed: 'test' }, midSeason);
    expect(result.error).toBeUndefined();

    const foundEvent = result.events!.find(e => e.type === 'SCOUT_TARGET_FOUND');
    expect(foundEvent).toBeDefined();
    expect((foundEvent as any).target.position).toBe('FWD');

    // Week still advances
    const weekAdvanced = result.events!.find(e => e.type === 'WEEK_ADVANCED');
    expect(weekAdvanced).toBeDefined();
  });

  it('transitions state to TARGET_FOUND after reducer applies the events', () => {
    const base = makeState();
    const { events: startEvents } = handleCommand(
      { type: 'START_SCOUT_MISSION', position: 'DEF', attributePriority: 'defence', budgetCeiling: 10_000_000 },
      base,
    );
    let state = reduceEvent(base, startEvents![0]);
    state = inSeason(state, 10);

    const { events: weekEvents } = handleCommand({ type: 'SIMULATE_WEEK', week: 11, season: 1, seed: 'test' }, state);
    for (const ev of weekEvents!) state = reduceEvent(state, ev);

    expect(state.scoutMission!.status).toBe('TARGET_FOUND');
    expect(state.scoutMission!.target).toBeDefined();
    expect(state.scoutMission!.askingPrice).toBeGreaterThan(0);
  });
});

// ── PLACE_SCOUT_BID ───────────────────────────────────────────────────────────

describe('PLACE_SCOUT_BID command', () => {
  function stateWithTarget(): GameState {
    let state = makeState();
    // Must have an active mission before TARGET_FOUND can be applied
    state = reduceEvent(state, {
      type: 'SCOUT_MISSION_STARTED', timestamp: Date.now(), clubId: 'test-club',
      position: 'FWD', attributePriority: null, budgetCeiling: 10_000_000,
      scoutFee: 50_000, weekStarted: 5,
    });
    return reduceEvent(state, {
      type:              'SCOUT_TARGET_FOUND',
      timestamp:         Date.now(),
      clubId:            'test-club',
      target: {
        id: 'scout-target-S1-W11-FWD', name: 'Test Target',
        position: 'FWD', wage: 150_000, transferValue: 3_000_000, age: 24,
        morale: 70, attributes: { attack: 70, defence: 25, teamwork: 60, charisma: 55, publicPotential: 70 },
        truePotential: 72, contractExpiresWeek: 0,
        stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 65 },
      },
      targetNpcClubId:   'bradfield',
      targetNpcClubName: 'Bradfield City',
      askingPrice:       3_000_000,
    });
  }

  it('transitions to BID_PENDING on negotiation success', () => {
    const state = stateWithTarget();
    const result = handleCommand({ type: 'PLACE_SCOUT_BID', negotiationPassed: true, offeredWage: 200_000 }, state);
    expect(result.error).toBeUndefined();
    const newState = reduceEvent(state, result.events![0]);
    expect(newState.scoutMission!.status).toBe('BID_PENDING');
    expect(newState.scoutMission!.offeredWage).toBe(200_000);
  });

  it('transitions to BID_REJECTED on negotiation failure', () => {
    const state = stateWithTarget();
    const result = handleCommand({ type: 'PLACE_SCOUT_BID', negotiationPassed: false, offeredWage: 200_000 }, state);
    const newState = reduceEvent(state, result.events![0]);
    expect(newState.scoutMission!.status).toBe('BID_REJECTED');
  });

  it('allows re-bid directly from BID_REJECTED → BID_PENDING', () => {
    let state = stateWithTarget();
    const fail = handleCommand({ type: 'PLACE_SCOUT_BID', negotiationPassed: false, offeredWage: 200_000 }, state);
    state = reduceEvent(state, fail.events![0]);
    expect(state.scoutMission!.status).toBe('BID_REJECTED');

    // Can bid again without needing to re-find the target
    const pass = handleCommand({ type: 'PLACE_SCOUT_BID', negotiationPassed: true, offeredWage: 200_000 }, state);
    expect(pass.error).toBeUndefined();
    const newState = reduceEvent(state, pass.events![0]);
    expect(newState.scoutMission!.status).toBe('BID_PENDING');
  });
});

// ── SCOUT_TRANSFER_COMPLETED on window open ───────────────────────────────────

describe('SIMULATE_WEEK at transfer window open with BID_PENDING', () => {
  it('emits SCOUT_TRANSFER_COMPLETED at week 21, adds player to squad, deducts fee', () => {
    let state = makeState();

    // Set up a BID_PENDING mission manually via events
    state = reduceEvent(state, {
      type: 'SCOUT_MISSION_STARTED', timestamp: Date.now(), clubId: 'test-club',
      position: 'MID', attributePriority: null, budgetCeiling: 10_000_000,
      scoutFee: 50_000, weekStarted: 10,
    });
    state = reduceEvent(state, {
      type: 'SCOUT_TARGET_FOUND', timestamp: Date.now(), clubId: 'test-club',
      target: {
        id: 'scout-target-S1-W11-MID', name: 'Target Dude',
        position: 'MID', wage: 150_000, transferValue: 2_500_000, age: 26,
        morale: 70, attributes: { attack: 55, defence: 50, teamwork: 70, charisma: 55, publicPotential: 65 },
        truePotential: 67, contractExpiresWeek: 0,
        stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 60 },
      },
      targetNpcClubId: 'bradfield', targetNpcClubName: 'Bradfield City', askingPrice: 2_500_000,
    });
    state = reduceEvent(state, {
      type: 'SCOUT_BID_PLACED', timestamp: Date.now(), clubId: 'test-club',
      negotiationPassed: true, offeredWage: 200_000,
    });

    expect(state.scoutMission!.status).toBe('BID_PENDING');

    // Set phase so window is open at week 21
    state = { ...state, phase: 'MID_SEASON', currentWeek: 20 };

    const budgetBefore = state.club.transferBudget;
    const squadBefore  = state.club.squad.length;

    const result = handleCommand({ type: 'SIMULATE_WEEK', week: 21, season: 1, seed: 'test' }, state);
    expect(result.error).toBeUndefined();

    const completedEvent = result.events!.find(e => e.type === 'SCOUT_TRANSFER_COMPLETED');
    expect(completedEvent).toBeDefined();
    expect((completedEvent as any).player.name).toBe('Target Dude');

    // Apply all events
    for (const ev of result.events!) state = reduceEvent(state, ev);

    expect(state.scoutMission).toBeNull();
    expect(state.club.squad.length).toBe(squadBefore + 1);
    expect(state.club.transferBudget).toBeLessThan(budgetBefore);
    // Week also advanced
    expect(state.currentWeek).toBe(21);
  });
});

// ── CANCEL_SCOUT_MISSION ──────────────────────────────────────────────────────

describe('CANCEL_SCOUT_MISSION command', () => {
  it('clears the active mission', () => {
    const base = makeState();
    const { events } = handleCommand({ type: 'START_SCOUT_MISSION', position: 'GK', attributePriority: null, budgetCeiling: 2_000_000 }, base);
    let state = reduceEvent(base, events![0]);
    expect(state.scoutMission).not.toBeNull();

    const cancel = handleCommand({ type: 'CANCEL_SCOUT_MISSION' }, state);
    expect(cancel.error).toBeUndefined();
    state = reduceEvent(state, cancel.events![0]);
    expect(state.scoutMission).toBeNull();
  });

  it('rejects when no mission is active', () => {
    const state = makeState();
    const result = handleCommand({ type: 'CANCEL_SCOUT_MISSION' }, state);
    expect(result.error).toBeDefined();
  });
});
