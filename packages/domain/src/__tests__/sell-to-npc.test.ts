/**
 * SELL_PLAYER_TO_NPC Tests
 *
 * Covers command validation, fee calculation, event shape, and reducer effects.
 */

import { handleCommand } from '../commands/handlers';
import { buildState, reduceEvent } from '../reducers';
import { GameState } from '../types/game-state-updated';
import { GameStartedEvent, PlayerSoldEvent } from '../events/types';
import { Player } from '../types/player';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const gameStartedEvent: GameStartedEvent = {
  type: 'GAME_STARTED',
  timestamp: 1000,
  clubId: 'player-club',
  clubName: 'Test FC',
  initialBudget: 500_000_000,
  difficulty: 'MEDIUM',
  seed: 'sell-test-seed',
};

/** A mid-range squad player with transferValue set */
const squadPlayer: Player = {
  id: 'player-1',
  name: 'Dale Hutchins',
  position: 'MID',
  wage: 100_000,
  transferValue: 1_500_000,
  age: 26,
  morale: 70,
  attributes: { attack: 55, defence: 50, teamwork: 60, charisma: 45, publicPotential: 65 },
  truePotential: 68,
  contractExpiresWeek: 46,
  stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 62 },
};

/**
 * A signed free agent — transferValue is 0, fee computed from OVR.
 * Attributes are balanced to give computeOverallRating() == 70,
 * so the expected fee is 70 × 70 × 500 = 2,450,000.
 */
const freeAgentPlayer: Player = {
  id: 'player-2',
  name: 'Connor Farrell',
  position: 'FWD',
  wage: 150_000,
  transferValue: 0,
  age: 24,
  morale: 75,
  attributes: { attack: 70, defence: 70, teamwork: 70, charisma: 50, publicPotential: 78 },
  truePotential: 75,
  contractExpiresWeek: 50,
  stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 70 },
};

function stateWithSquad(players: Player[]): GameState {
  const base = buildState([gameStartedEvent]);
  return { ...base, club: { ...base.club, squad: players } };
}

// ─── handleCommand: SELL_PLAYER_TO_NPC ────────────────────────────────────────

describe('SELL_PLAYER_TO_NPC command', () => {
  it('returns PLAYER_SOLD event on valid sale', () => {
    const state = stateWithSquad([squadPlayer]);
    const result = handleCommand(
      { type: 'SELL_PLAYER_TO_NPC', playerId: 'player-1', npcClubId: 'swinton' },
      state,
    );
    expect(result.error).toBeUndefined();
    expect(result.events).toHaveLength(1);
    expect(result.events![0].type).toBe('PLAYER_SOLD');
  });

  it('event carries correct fee (transferValue when > 0)', () => {
    const state = stateWithSquad([squadPlayer]);
    const result = handleCommand(
      { type: 'SELL_PLAYER_TO_NPC', playerId: 'player-1', npcClubId: 'swinton' },
      state,
    );
    const evt = result.events![0] as PlayerSoldEvent;
    expect(evt.fee).toBe(1_500_000);
  });

  it('event carries correct fee derived from OVR when transferValue is 0', () => {
    const state = stateWithSquad([freeAgentPlayer]);
    const result = handleCommand(
      { type: 'SELL_PLAYER_TO_NPC', playerId: 'player-2', npcClubId: 'bradfield' },
      state,
    );
    const evt = result.events![0] as PlayerSoldEvent;
    // fee = OVR * OVR * 500 = 70 * 70 * 500 = 2_450_000
    expect(evt.fee).toBe(2_450_000);
  });

  it('event carries playerName and npcClubName', () => {
    const state = stateWithSquad([squadPlayer]);
    const result = handleCommand(
      { type: 'SELL_PLAYER_TO_NPC', playerId: 'player-1', npcClubId: 'swinton' },
      state,
    );
    const evt = result.events![0] as PlayerSoldEvent;
    expect(evt.playerName).toBe('Dale Hutchins');
    expect(evt.npcClubName).toBe('Swinton Town');
    expect(evt.npcClubId).toBe('swinton');
  });

  it('errors when player not in squad', () => {
    const state = stateWithSquad([]);
    const result = handleCommand(
      { type: 'SELL_PLAYER_TO_NPC', playerId: 'nobody', npcClubId: 'swinton' },
      state,
    );
    expect(result.error?.code).toBe('PLAYER_NOT_FOUND');
  });

  it('errors when NPC club does not exist', () => {
    const state = stateWithSquad([squadPlayer]);
    const result = handleCommand(
      { type: 'SELL_PLAYER_TO_NPC', playerId: 'player-1', npcClubId: 'nonexistent-club' },
      state,
    );
    expect(result.error?.code).toBe('VALIDATION_FAILED');
  });

  it('errors when trying to sell to own club', () => {
    const state = stateWithSquad([squadPlayer]);
    const result = handleCommand(
      { type: 'SELL_PLAYER_TO_NPC', playerId: 'player-1', npcClubId: 'player-club' },
      state,
    );
    expect(result.error?.code).toBe('VALIDATION_FAILED');
  });
});

// ─── Reducer: PLAYER_SOLD ─────────────────────────────────────────────────────

describe('PLAYER_SOLD reducer', () => {
  it('removes sold player from squad', () => {
    const state = stateWithSquad([squadPlayer, freeAgentPlayer]);
    const evt: PlayerSoldEvent = {
      type: 'PLAYER_SOLD',
      timestamp: Date.now(),
      playerId: 'player-1',
      clubId: 'player-club',
      fee: 1_500_000,
      playerName: 'Dale Hutchins',
      npcClubId: 'swinton',
      npcClubName: 'Swinton Town',
    };
    const next = reduceEvent(state, evt);
    expect(next.club.squad).toHaveLength(1);
    expect(next.club.squad[0].id).toBe('player-2');
  });

  it('credits transfer fee to transfer budget', () => {
    const state = stateWithSquad([squadPlayer]);
    const budgetBefore = state.club.transferBudget;
    const evt: PlayerSoldEvent = {
      type: 'PLAYER_SOLD',
      timestamp: Date.now(),
      playerId: 'player-1',
      clubId: 'player-club',
      fee: 1_500_000,
    };
    const next = reduceEvent(state, evt);
    expect(next.club.transferBudget).toBe(budgetBefore + 1_500_000);
  });
});

// ─── Round-trip: command → reduce ─────────────────────────────────────────────

describe('SELL_PLAYER_TO_NPC round-trip', () => {
  it('squad shrinks and budget grows after full command → reduce cycle', () => {
    const state = stateWithSquad([squadPlayer]);
    const budgetBefore = state.club.transferBudget;

    const result = handleCommand(
      { type: 'SELL_PLAYER_TO_NPC', playerId: 'player-1', npcClubId: 'crowley' },
      state,
    );

    expect(result.error).toBeUndefined();
    const finalState = result.events!.reduce(reduceEvent, state);

    expect(finalState.club.squad).toHaveLength(0);
    expect(finalState.club.transferBudget).toBe(budgetBefore + 1_500_000);
  });
});
