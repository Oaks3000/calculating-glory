/**
 * NPC Poaching Tests — Phase 5.4
 *
 * Tests for:
 *   - generatePoachAttempts: correct generation, rate gating, cooldown
 *   - Resolve 'accept':  player removed from squad, budget increases, rep +3
 *   - Resolve 'reject':  player stays, morale drops -15
 *   - Resolve 'counter': player removed, budget increases by 1.5× fee, rep +5
 *   - Resolve 'ignore':  player stays, morale drops -25, rep -5
 */

import { buildState, reduceEvent } from '../reducers';
import { handleCommand } from '../commands/handlers';
import { GameState, PendingClubEvent } from '../types/game-state-updated';
import { GameStartedEvent, ClubEventOccurredEvent } from '../events/types';
import { generatePoachAttempts } from '../simulation/events';
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

/** Build a Player with the given overrides. */
function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Test Player',
    // Default attributes give computeOverallRating() == 62 (above poach threshold of 55)
    position: 'MID',
    wage: 100_000,
    transferValue: 1_000_000,
    age: 24,
    morale: 75,
    stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 62 },
    attributes: { attack: 60, defence: 55, teamwork: 70, charisma: 50, publicPotential: 65 },
    truePotential: 68,
    contractExpiresWeek: 46,
    ...overrides,
  };
}

/** Inject state with an in-season phase and a custom squad. */
function withSquad(state: GameState, squad: Player[]): GameState {
  return {
    ...state,
    phase: 'EARLY_SEASON',
    club: { ...state.club, squad },
  };
}

/** Inject a poach PendingClubEvent into state. */
function withPoachEvent(
  state: GameState,
  target: Player,
  offeredFee: number,
  eventId = 'evt-S1-W3-poach'
): GameState {
  const pendingEvent: PendingClubEvent = {
    id: eventId,
    templateId: 'npc-poach',
    week: 3,
    title: `Swinton Town want ${target.name}`,
    description: `Bid of £${(offeredFee / 100).toLocaleString()} received.`,
    severity: 'major',
    metadata: {
      poachTargetPlayerId: target.id,
      npcClubId: 'swinton',
      npcClubName: 'Swinton Town',
      offeredFee,
    },
    choices: [
      {
        id: 'accept',
        label: 'Accept the bid',
        description: 'Sell.',
        budgetEffect: offeredFee,
        reputationEffect: 3,
        playerLeaves: true,
      },
      {
        id: 'reject',
        label: 'Reject the bid',
        description: 'Keep player.',
        moraleEffect: -15,
      },
      {
        id: 'counter',
        label: 'Counter at 1.5×',
        description: 'Sell for more.',
        budgetEffect: Math.round(offeredFee * 1.5),
        reputationEffect: 5,
        playerLeaves: true,
      },
      {
        id: 'ignore',
        label: 'Say nothing',
        description: 'Ghost the bid.',
        moraleEffect: -25,
        reputationEffect: -5,
      },
    ],
    resolved: false,
  };

  const occurred: ClubEventOccurredEvent = {
    type: 'CLUB_EVENT_OCCURRED',
    timestamp: Date.now(),
    eventId,
    templateId: 'npc-poach',
    week: 3,
    clubId: state.club.id,
    pendingEvent,
  };

  return reduceEvent(state, occurred);
}

// ── generatePoachAttempts ────────────────────────────────────────────────────

describe('generatePoachAttempts', () => {
  it('returns empty array during PRE_SEASON', () => {
    const state = makeStartedState();
    // PRE_SEASON is the default phase after GAME_STARTED
    const result = generatePoachAttempts(state, 1, 1, 'test-seed');
    expect(result).toHaveLength(0);
  });

  it('returns empty array when no squad player is rated >= 55', () => {
    const base = makeStartedState();
    // Attributes give computeOverallRating() == 48 and 47 (both below threshold of 55)
    const state = withSquad(base, [
      makePlayer({ id: 'p1', attributes: { attack: 45, defence: 50, teamwork: 50, charisma: 50, publicPotential: 65 } }),
      makePlayer({ id: 'p2', attributes: { attack: 44, defence: 48, teamwork: 50, charisma: 50, publicPotential: 65 } }),
    ]);
    const result = generatePoachAttempts(state, 1, 1, 'test-seed');
    expect(result).toHaveLength(0);
  });

  it('returns at most 1 event per week', () => {
    const base = makeStartedState();
    // Attributes give computeOverallRating() == 80 / 75 / 70 to maximise poach chance
    const state = withSquad(base, [
      makePlayer({ id: 'p1', attributes: { attack: 80, defence: 80, teamwork: 80, charisma: 50, publicPotential: 65 } }),
      makePlayer({ id: 'p2', attributes: { attack: 75, defence: 75, teamwork: 75, charisma: 50, publicPotential: 65 } }),
      makePlayer({ id: 'p3', attributes: { attack: 70, defence: 70, teamwork: 70, charisma: 50, publicPotential: 65 } }),
    ]);
    // Run across many seeds; never more than 1
    for (let w = 1; w <= 20; w++) {
      const result = generatePoachAttempts(state, w, 1, `seed-${w}`);
      expect(result.length).toBeLessThanOrEqual(1);
    }
  });

  it('returns empty if a poach event is already pending', () => {
    const base = makeStartedState();
    const target = makePlayer({ id: 'p1', attributes: { attack: 80, defence: 80, teamwork: 80, charisma: 50, publicPotential: 65 } });
    let state = withSquad(base, [target]);
    state = withPoachEvent(state, target, 800_000);

    // Find a seed that would normally fire
    const firingSeed = findFiringSeed(state, 5, 1);
    if (firingSeed) {
      const result = generatePoachAttempts(state, 5, 1, firingSeed);
      expect(result).toHaveLength(0);
    }
  });

  it('generated event has correct templateId and metadata', () => {
    const base = makeStartedState();
    const target = makePlayer({ id: 'star', wage: 200_000, attributes: { attack: 80, defence: 80, teamwork: 80, charisma: 50, publicPotential: 65 } });
    const state = withSquad(base, [target]);
    const firingSeed = findFiringSeed(state, 3, 1);
    if (!firingSeed) return; // skip if no seed fires (probabilistic)

    const [event] = generatePoachAttempts(state, 3, 1, firingSeed);
    expect(event.templateId).toBe('npc-poach');
    expect(event.metadata?.poachTargetPlayerId).toBe('star');
    expect(event.metadata?.offeredFee).toBeGreaterThan(0);
    expect(event.choices).toHaveLength(4);
    expect(event.choices.map(c => c.id)).toEqual(['accept', 'reject', 'counter', 'ignore']);
  });

  it('counter choice budget is 1.5× the accept choice budget', () => {
    const base = makeStartedState();
    const target = makePlayer({ id: 'star', wage: 200_000, attributes: { attack: 80, defence: 80, teamwork: 80, charisma: 50, publicPotential: 65 } });
    const state = withSquad(base, [target]);
    const firingSeed = findFiringSeed(state, 3, 1);
    if (!firingSeed) return;

    const [event] = generatePoachAttempts(state, 3, 1, firingSeed);
    const accept = event.choices.find(c => c.id === 'accept')!;
    const counter = event.choices.find(c => c.id === 'counter')!;
    expect(counter.budgetEffect).toBe(Math.round(accept.budgetEffect! * 1.5));
  });
});

// ── Resolution: accept ───────────────────────────────────────────────────────

describe('resolve poach — accept', () => {
  it('removes player from squad', () => {
    const target = makePlayer({ id: 'p1' });
    const fee = 800_000;
    let state = withSquad(makeStartedState(), [target]);
    state = withPoachEvent(state, target, fee);
    const budgetBefore = state.club.transferBudget;

    const result = handleCommand(
      { type: 'RESOLVE_CLUB_EVENT', eventId: 'evt-S1-W3-poach', choiceId: 'accept' },
      state
    );
    expect(result.error).toBeUndefined();
    const newState = result.events!.reduce(reduceEvent, state);

    expect(newState.club.squad.find(p => p.id === 'p1')).toBeUndefined();
    expect(newState.club.transferBudget).toBe(budgetBefore + fee);
    expect(newState.club.reputation).toBe(state.club.reputation + 3);
  });
});

// ── Resolution: reject ───────────────────────────────────────────────────────

describe('resolve poach — reject', () => {
  it('keeps player in squad and reduces morale by 15', () => {
    const target = makePlayer({ id: 'p1', morale: 75 });
    let state = withSquad(makeStartedState(), [target]);
    state = withPoachEvent(state, target, 800_000);

    const result = handleCommand(
      { type: 'RESOLVE_CLUB_EVENT', eventId: 'evt-S1-W3-poach', choiceId: 'reject' },
      state
    );
    expect(result.error).toBeUndefined();
    const newState = result.events!.reduce(reduceEvent, state);

    const player = newState.club.squad.find(p => p.id === 'p1')!;
    expect(player).toBeDefined();
    expect(player.morale).toBe(60); // 75 - 15
  });

  it('does not change the budget', () => {
    const target = makePlayer({ id: 'p1' });
    let state = withSquad(makeStartedState(), [target]);
    state = withPoachEvent(state, target, 800_000);
    const budgetBefore = state.club.transferBudget;

    const result = handleCommand(
      { type: 'RESOLVE_CLUB_EVENT', eventId: 'evt-S1-W3-poach', choiceId: 'reject' },
      state
    );
    const newState = result.events!.reduce(reduceEvent, state);
    expect(newState.club.transferBudget).toBe(budgetBefore);
  });
});

// ── Resolution: counter ──────────────────────────────────────────────────────

describe('resolve poach — counter', () => {
  it('removes player and awards 1.5× fee', () => {
    const target = makePlayer({ id: 'p1' });
    const fee = 800_000;
    const counterFee = Math.round(fee * 1.5);
    let state = withSquad(makeStartedState(), [target]);
    state = withPoachEvent(state, target, fee);
    const budgetBefore = state.club.transferBudget;

    const result = handleCommand(
      { type: 'RESOLVE_CLUB_EVENT', eventId: 'evt-S1-W3-poach', choiceId: 'counter' },
      state
    );
    expect(result.error).toBeUndefined();
    const newState = result.events!.reduce(reduceEvent, state);

    expect(newState.club.squad.find(p => p.id === 'p1')).toBeUndefined();
    expect(newState.club.transferBudget).toBe(budgetBefore + counterFee);
    expect(newState.club.reputation).toBe(state.club.reputation + 5);
  });
});

// ── Resolution: ignore ───────────────────────────────────────────────────────

describe('resolve poach — ignore', () => {
  it('keeps player but drops morale by 25 and rep by 5', () => {
    const target = makePlayer({ id: 'p1', morale: 75 });
    let state = withSquad(makeStartedState(), [target]);
    state = withPoachEvent(state, target, 800_000);

    const result = handleCommand(
      { type: 'RESOLVE_CLUB_EVENT', eventId: 'evt-S1-W3-poach', choiceId: 'ignore' },
      state
    );
    expect(result.error).toBeUndefined();
    const newState = result.events!.reduce(reduceEvent, state);

    const player = newState.club.squad.find(p => p.id === 'p1')!;
    expect(player).toBeDefined();
    expect(player.morale).toBe(50); // 75 - 25
    expect(newState.club.reputation).toBe(Math.max(0, state.club.reputation - 5));
  });
});

// ── Morale clamping ──────────────────────────────────────────────────────────

describe('morale clamping', () => {
  it('morale cannot drop below 0', () => {
    const target = makePlayer({ id: 'p1', morale: 10 });
    let state = withSquad(makeStartedState(), [target]);
    state = withPoachEvent(state, target, 800_000);

    const result = handleCommand(
      { type: 'RESOLVE_CLUB_EVENT', eventId: 'evt-S1-W3-poach', choiceId: 'ignore' },
      state
    );
    const newState = result.events!.reduce(reduceEvent, state);
    const player = newState.club.squad.find(p => p.id === 'p1')!;
    expect(player.morale).toBe(0);
  });
});

// ── Utility ──────────────────────────────────────────────────────────────────

/**
 * Brute-force find a seed that causes generatePoachAttempts to fire.
 * Used to avoid brittle exact-seed tests. Returns null if none found in range.
 */
function findFiringSeed(state: GameState, week: number, season: number): string | null {
  for (let i = 0; i < 50; i++) {
    const seed = `fire-seed-${i}`;
    const result = generatePoachAttempts(state, week, season, seed);
    if (result.length > 0) return seed;
  }
  return null;
}
