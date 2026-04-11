/**
 * Transfer Window Tests
 *
 * Tests for free agent pool generation, signing, and releasing players.
 */

import { generateFreeAgentPool } from '../data/free-agent-generator';
import { handleCommand } from '../commands/handlers';
import { buildState } from '../reducers';
import { reduceEvent } from '../reducers';
import { computeOverallRating } from '../types/player';
import { GameState } from '../types/game-state-updated';
import { GameStartedEvent } from '../events/types';
import { Player } from '../types/player';

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const gameStartedEvent: GameStartedEvent = {
  type: 'GAME_STARTED',
  timestamp: 1000,
  clubId: 'player-club',
  clubName: 'Test FC',
  initialBudget: 500000000, // £5,000,000
  difficulty: 'MEDIUM',
  seed: 'transfer-test-seed',
};

function baseState(): GameState {
  return buildState([gameStartedEvent]);
}

// ─── generateFreeAgentPool ────────────────────────────────────────────────────

describe('generateFreeAgentPool', () => {
  it('returns exactly 60 players', () => {
    const pool = generateFreeAgentPool('test-seed');
    expect(pool).toHaveLength(60);
  });

  it('has correct position distribution: 4 GK, 16 DEF, 22 MID, 18 FWD', () => {
    const pool = generateFreeAgentPool('test-seed');
    const counts = pool.reduce(
      (acc, p) => {
        acc[p.position] = (acc[p.position] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    expect(counts['GK']).toBe(4);
    expect(counts['DEF']).toBe(16);
    expect(counts['MID']).toBe(22);
    expect(counts['FWD']).toBe(18);
  });

  it('all players have transferValue of 0 (free agents)', () => {
    const pool = generateFreeAgentPool('test-seed');
    pool.forEach(p => expect(p.transferValue).toBe(0));
  });

  it('all players have contractExpiresWeek of 0', () => {
    const pool = generateFreeAgentPool('test-seed');
    pool.forEach(p => expect(p.contractExpiresWeek).toBe(0));
  });

  it('all players have attributes object with all required keys', () => {
    const pool = generateFreeAgentPool('test-seed');
    pool.forEach(p => {
      expect(p.attributes).toBeDefined();
      expect(typeof p.attributes.attack).toBe('number');
      expect(typeof p.attributes.defence).toBe('number');
      expect(typeof p.attributes.teamwork).toBe('number');
      expect(typeof p.attributes.charisma).toBe('number');
      expect(typeof p.attributes.publicPotential).toBe('number');
    });
  });

  it('is deterministic — same seed produces same pool', () => {
    const pool1 = generateFreeAgentPool('determinism-test');
    const pool2 = generateFreeAgentPool('determinism-test');
    expect(pool1.map(p => p.name)).toEqual(pool2.map(p => p.name));
    expect(pool1.map(p => computeOverallRating(p))).toEqual(pool2.map(p => computeOverallRating(p)));
  });

  it('different seeds produce different pools', () => {
    const pool1 = generateFreeAgentPool('seed-a');
    const pool2 = generateFreeAgentPool('seed-b');
    // Very unlikely to produce identical orderings
    const names1 = pool1.map(p => p.name).join(',');
    const names2 = pool2.map(p => p.name).join(',');
    expect(names1).not.toEqual(names2);
  });

  it('age range is 18–34', () => {
    const pool = generateFreeAgentPool('age-test');
    pool.forEach(p => {
      expect(p.age).toBeGreaterThanOrEqual(18);
      expect(p.age).toBeLessThanOrEqual(34);
    });
  });

  it('wages are in the expected range (50000–300000 pence)', () => {
    const pool = generateFreeAgentPool('wage-test');
    pool.forEach(p => {
      expect(p.wage).toBeGreaterThanOrEqual(50000);
      expect(p.wage).toBeLessThanOrEqual(300000);
    });
  });

  it('morale is in the 65–85 range', () => {
    const pool = generateFreeAgentPool('morale-test');
    pool.forEach(p => {
      expect(p.morale).toBeGreaterThanOrEqual(65);
      expect(p.morale).toBeLessThanOrEqual(85);
    });
  });
});

// ─── SIGN_FREE_AGENT ──────────────────────────────────────────────────────────

describe('handleCommand — SIGN_FREE_AGENT', () => {
  it('succeeds when budget and squad space available', () => {
    const state = baseState();
    const freeAgent = state.freeAgentPool[0];
    expect(freeAgent).toBeDefined();

    const result = handleCommand(
      { type: 'SIGN_FREE_AGENT', playerId: freeAgent.id, offeredWage: freeAgent.wage },
      state
    );

    expect(result.error).toBeUndefined();
    expect(result.events).toHaveLength(1);
    expect(result.events![0].type).toBe('FREE_AGENT_SIGNED');
  });

  it('applies FREE_AGENT_SIGNED event correctly — moves player to squad and off pool', () => {
    const state = baseState();
    const freeAgent = state.freeAgentPool[0];

    const result = handleCommand(
      { type: 'SIGN_FREE_AGENT', playerId: freeAgent.id, offeredWage: freeAgent.wage },
      state
    );

    const newState = reduceEvent(state, result.events![0]);
    const signedPlayer = newState.club.squad.find(p => p.id === freeAgent.id);

    expect(signedPlayer).toBeDefined();
    expect(newState.freeAgentPool.find(p => p.id === freeAgent.id)).toBeUndefined();
    expect(signedPlayer!.wage).toBe(freeAgent.wage);
    expect(signedPlayer!.contractExpiresWeek).toBeGreaterThan(0);
  });

  it('fails when squad is full (24 players)', () => {
    const state = baseState();

    // Build 24 fake squad players from the free agent pool to fill the squad
    const fakeSquad: Player[] = [];
    for (let i = 0; i < 24; i++) {
      fakeSquad.push({
        id: `fake-${i}`,
        name: `Player ${i}`,
        position: 'MID',
        wage: 10000,
        transferValue: 0,
        age: 25,
        morale: 70,
        attributes: { attack: 40, defence: 40, teamwork: 40, charisma: 40, publicPotential: 40 },
        truePotential: 40,
        curve: { shape: 'SHALLOW_BELL' as const, peakHeight: 3 as const, startAge: 18, retirementAge: 36, baseAttack: 50, baseDefence: 50 },
        contractExpiresWeek: 46,
        stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 50 },
      });
    }

    const fullState: GameState = {
      ...state,
      club: { ...state.club, squad: fakeSquad },
    };

    const freeAgent = state.freeAgentPool[0];
    const result = handleCommand(
      { type: 'SIGN_FREE_AGENT', playerId: freeAgent.id, offeredWage: freeAgent.wage },
      fullState
    );

    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('SQUAD_LIMIT_EXCEEDED');
  });

  it('fails when weekly wage exceeds remaining wage budget', () => {
    const state = baseState();
    const freeAgent = state.freeAgentPool[0];

    // Set wage budget to 0
    const skintState: GameState = {
      ...state,
      club: { ...state.club, wageReserve: 0 },
    };

    const result = handleCommand(
      { type: 'SIGN_FREE_AGENT', playerId: freeAgent.id, offeredWage: freeAgent.wage },
      skintState
    );

    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('INSUFFICIENT_BUDGET');
  });

  it('fails when player is not in the free agent pool', () => {
    const state = baseState();
    const result = handleCommand(
      { type: 'SIGN_FREE_AGENT', playerId: 'nonexistent-player-id', offeredWage: 50000 },
      state
    );

    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('PLAYER_NOT_FOUND');
  });
});

// ─── RELEASE_PLAYER ───────────────────────────────────────────────────────────

describe('handleCommand — RELEASE_PLAYER', () => {
  it('removes player from squad and returns release fee to budget', () => {
    const state = baseState();
    const player = state.club.squad[0];
    expect(player).toBeDefined();

    const result = handleCommand(
      { type: 'RELEASE_PLAYER', playerId: player.id },
      state
    );

    expect(result.error).toBeUndefined();
    expect(result.events).toHaveLength(1);
    expect(result.events![0].type).toBe('PLAYER_RELEASED');

    const newState = reduceEvent(state, result.events![0]);
    expect(newState.club.squad.find(p => p.id === player.id)).toBeUndefined();
  });

  it('release fee is non-zero when player is under contract', () => {
    const state = baseState();
    // Find a player with a non-zero contractExpiresWeek beyond current week
    const player = state.club.squad.find(
      p => p.contractExpiresWeek > 0 && p.contractExpiresWeek > state.currentWeek
    );
    expect(player).toBeDefined();

    const result = handleCommand(
      { type: 'RELEASE_PLAYER', playerId: player!.id },
      state
    );

    expect(result.error).toBeUndefined();
    const event = result.events![0] as any;
    expect(event.releaseFee).toBeGreaterThan(0);

    const newState = reduceEvent(state, result.events![0]);
    expect(newState.club.transferBudget).toBe(state.club.transferBudget + event.releaseFee);
  });

  it('release fee is zero when player contract has expired (contractExpiresWeek has passed)', () => {
    const state = baseState();
    const player = state.club.squad[0];

    // Advance week beyond the player's contract expiry
    const expiredContractState: GameState = {
      ...state,
      currentWeek: 100, // way past any contract expiry
    };

    const result = handleCommand(
      { type: 'RELEASE_PLAYER', playerId: player.id },
      expiredContractState
    );

    expect(result.error).toBeUndefined();
    const event = result.events![0] as any;
    expect(event.releaseFee).toBe(0);
  });

  it('fails when player is not in the squad', () => {
    const state = baseState();
    const result = handleCommand(
      { type: 'RELEASE_PLAYER', playerId: 'not-in-squad-id' },
      state
    );

    expect(result.error).toBeDefined();
    expect(result.error!.code).toBe('PLAYER_NOT_FOUND');
  });
});
