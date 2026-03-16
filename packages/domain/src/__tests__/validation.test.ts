/**
 * Validation Rules Tests
 */

import {
  validateTransfer,
  validatePlayerSale,
  validateFacilityUpgrade,
  validateStaffHire
} from '../validation/rules';
import { Club } from '../types/club';
import { Player } from '../types/player';
import { Facility } from '../types/facility';
import { Staff } from '../types/staff';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Test Player',
    overallRating: 70,
    position: 'MID',
    wage: 50000,          // £500/week
    transferValue: 5000000, // £50,000
    age: 25,
    morale: 75,
    stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 70 },
    ...overrides
  };
}

function makeStaff(overrides: Partial<Staff> = {}): Staff {
  return {
    id: 's1',
    name: 'Test Coach',
    role: 'ATTACKING_COACH',
    quality: 70,
    salary: 50000, // £500/week
    bonus: { type: 'goals', improvement: 10 },
    ...overrides
  };
}

function makeFacility(overrides: Partial<Facility> = {}): Facility {
  return {
    type: 'TRAINING_GROUND',
    level: 1,
    upgradeCost: 5000000, // £50,000
    benefit: { type: 'performance', improvement: 10 },
    ...overrides
  };
}

function makeClub(overrides: Partial<Club> = {}): Club {
  return {
    id: 'club-1',
    name: 'Test FC',
    transferBudget: 10000000, // £100,000
    wageBudget: 500000,       // £5,000/week
    squad: [],
    staff: [],
    facilities: [makeFacility()],
    reputation: 50,
    stadium: { name: 'Test Ground', capacity: 5000, averageAttendance: 3000, ticketPrice: 1500 },
    form: [],
    trainingFocus: null,
    ...overrides
  } as Club;
}

// ─── validateTransfer ─────────────────────────────────────────────────────────

describe('validateTransfer', () => {
  it('passes when all conditions are met', () => {
    const club = makeClub();
    const player = makePlayer();
    const result = validateTransfer(club, player, 5000000, 50000);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when squad is at maximum size (25)', () => {
    const squad = Array.from({ length: 25 }, (_, i) =>
      makePlayer({ id: `player-${i}` })
    );
    const club = makeClub({ squad });
    const player = makePlayer({ id: 'new-player' });
    const result = validateTransfer(club, player, 5000000, 50000);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Squad is full'))).toBe(true);
  });

  it('fails when player is already in squad', () => {
    const existingPlayer = makePlayer({ id: 'existing' });
    const club = makeClub({ squad: [existingPlayer] });
    const result = validateTransfer(club, existingPlayer, 5000000, 50000);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('already in your squad'))).toBe(true);
  });

  it('fails when offered fee exceeds transfer budget', () => {
    const club = makeClub({ transferBudget: 1000000 }); // £10,000
    const player = makePlayer({ transferValue: 5000000 });
    const result = validateTransfer(club, player, 5000000, 50000);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('transfer budget'))).toBe(true);
  });

  it('fails when annual wages exceed available wage budget', () => {
    // wageBudget = £1,000/week, existing squad uses it all
    const player1 = makePlayer({ id: 'p1', wage: 100000 }); // £1,000/week
    const club = makeClub({
      wageBudget: 100000, // £1,000/week — fully consumed by p1
      squad: [player1]
    });
    const newPlayer = makePlayer({ id: 'p2', transferValue: 100000 });
    const result = validateTransfer(club, newPlayer, 100000, 100000);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('wage budget'))).toBe(true);
  });

  it('fails when offered fee is below player transfer value', () => {
    const club = makeClub({ transferBudget: 100000000 });
    const player = makePlayer({ transferValue: 10000000 });
    const result = validateTransfer(club, player, 5000000, 50000);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Offer too low'))).toBe(true);
  });

  it('accumulates multiple errors', () => {
    // Squad full + budget too low + offer too low
    const squad = Array.from({ length: 25 }, (_, i) =>
      makePlayer({ id: `player-${i}` })
    );
    const club = makeClub({ squad, transferBudget: 100 });
    const player = makePlayer({ id: 'new', transferValue: 5000000 });
    const result = validateTransfer(club, player, 50, 50000);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

// ─── validatePlayerSale ───────────────────────────────────────────────────────

describe('validatePlayerSale', () => {
  it('passes when squad has more than minimum players', () => {
    const squad = Array.from({ length: 20 }, (_, i) =>
      makePlayer({ id: `player-${i}` })
    );
    const club = makeClub({ squad });
    const result = validatePlayerSale(club, 'player-0');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when selling would drop below minimum squad size (18)', () => {
    const squad = Array.from({ length: 18 }, (_, i) =>
      makePlayer({ id: `player-${i}` })
    );
    const club = makeClub({ squad });
    const result = validatePlayerSale(club, 'player-0');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('minimum size'))).toBe(true);
  });

  it('fails when player is not in squad', () => {
    const squad = Array.from({ length: 20 }, (_, i) =>
      makePlayer({ id: `player-${i}` })
    );
    const club = makeClub({ squad });
    const result = validatePlayerSale(club, 'nonexistent-player');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not found'))).toBe(true);
  });
});

// ─── validateFacilityUpgrade ──────────────────────────────────────────────────

describe('validateFacilityUpgrade', () => {
  it('passes when facility exists, is not at max level, and budget is sufficient', () => {
    const club = makeClub({ transferBudget: 10000000 });
    const result = validateFacilityUpgrade(club, 'TRAINING_GROUND', 5000000);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when facility does not exist', () => {
    const club = makeClub({ facilities: [] });
    const result = validateFacilityUpgrade(club, 'TRAINING_GROUND', 5000000);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("not found"))).toBe(true);
  });

  it('fails when facility is already at max level (5)', () => {
    const maxFacility = makeFacility({ level: 5 });
    const club = makeClub({ facilities: [maxFacility] });
    const result = validateFacilityUpgrade(club, 'TRAINING_GROUND', 5000000);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('maximum level'))).toBe(true);
  });

  it('fails when transfer budget is insufficient', () => {
    const club = makeClub({ transferBudget: 1000 });
    const result = validateFacilityUpgrade(club, 'TRAINING_GROUND', 5000000);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('budget'))).toBe(true);
  });
});

// ─── validateStaffHire ────────────────────────────────────────────────────────

describe('validateStaffHire', () => {
  it('passes when wage budget has room', () => {
    const club = makeClub({ wageBudget: 1000000, squad: [], staff: [] });
    const result = validateStaffHire(club, 50000); // £500/week
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when wage budget is fully consumed by squad and staff', () => {
    const player = makePlayer({ wage: 100000 }); // £1,000/week
    const staffMember = makeStaff({ salary: 100000 }); // £1,000/week
    // wageBudget = £2,000/week, consumed by player + staff
    const club = makeClub({
      wageBudget: 200000, // £2,000/week
      squad: [player],
      staff: [staffMember]
    });
    const result = validateStaffHire(club, 50000); // trying to add £500/week
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('wage budget'))).toBe(true);
  });

  it('passes with empty squad and staff', () => {
    const club = makeClub({ wageBudget: 500000, squad: [], staff: [] });
    const result = validateStaffHire(club, 50000);
    expect(result.valid).toBe(true);
  });
});
