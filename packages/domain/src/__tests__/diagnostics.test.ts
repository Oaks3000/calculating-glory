import { diagnoseMatch } from '../simulation/diagnostics';
import { Club } from '../types/club';
import { Player, Position } from '../types/player';
import { Facility } from '../types/facility';

function makePlayer(over: Partial<Player> & { id: string; position: Position }): Player {
  return {
    name: 'Test', wage: 0, transferValue: 0, age: 25, morale: 50,
    attributes: { attack: 50, defence: 50, teamwork: 50, charisma: 50, publicPotential: 50 },
    truePotential: 50,
    curve: { shape: 'SHALLOW_BELL', peakHeight: 3, startAge: 18, retirementAge: 36, baseAttack: 50, baseDefence: 50 },
    contractExpiresWeek: 46,
    stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 0 },
    ...over,
  } as Player;
}

function makeClub(over: Partial<Club> = {}): Club {
  const squad: Player[] = [
    makePlayer({ id: 'p1', position: 'FWD' }),
    makePlayer({ id: 'p2', position: 'MID' }),
    makePlayer({ id: 'p3', position: 'DEF' }),
    makePlayer({ id: 'p4', position: 'GK' }),
  ];
  return {
    id: 'club-1', name: 'Test FC',
    transferBudget: 0, infrastructureBudget: 0, wageReserve: 0,
    budgetAllocation: { transfer: 50, infrastructure: 20, wages: 30 },
    squad,
    staff: [], facilities: [], reputation: 50,
    stadium: { name: 'Test Arena', capacity: 5000, averageAttendance: 3000, ticketPrice: 2000 },
    form: [], trainingFocus: null, preferredFormation: null,
    squadCapacity: 24, manager: null, listedPlayerIds: [],
    ...over,
  };
}

describe('diagnoseMatch', () => {
  it('flags missing manager as a negative factor', () => {
    const factors = diagnoseMatch(makeClub({ manager: null }), false, 5);
    const noMgr = factors.find(f => f.label === 'No manager in the dugout');
    expect(noMgr).toBeDefined();
    expect(noMgr!.sign).toBe('negative');
  });

  it('flags low squad morale as a negative factor', () => {
    const lowMoraleSquad = [
      makePlayer({ id: 'p1', position: 'FWD', morale: 20 }),
      makePlayer({ id: 'p2', position: 'MID', morale: 25 }),
      makePlayer({ id: 'p3', position: 'DEF', morale: 30 }),
      makePlayer({ id: 'p4', position: 'GK', morale: 25 }),
    ];
    const factors = diagnoseMatch(makeClub({ squad: lowMoraleSquad }), false, 5);
    const morale = factors.find(f => f.label === 'Squad morale');
    expect(morale).toBeDefined();
    expect(morale!.sign).toBe('negative');
  });

  it('flags high squad morale as a positive factor', () => {
    const highMoraleSquad = [
      makePlayer({ id: 'p1', position: 'FWD', morale: 90 }),
      makePlayer({ id: 'p2', position: 'MID', morale: 85 }),
      makePlayer({ id: 'p3', position: 'DEF', morale: 80 }),
      makePlayer({ id: 'p4', position: 'GK', morale: 85 }),
    ];
    const factors = diagnoseMatch(makeClub({ squad: highMoraleSquad }), false, 5);
    const morale = factors.find(f => f.label === 'Squad morale');
    expect(morale).toBeDefined();
    expect(morale!.sign).toBe('positive');
  });

  it('flags low Training Ground level as a negative factor', () => {
    const lowTg: Facility[] = [
      { type: 'TRAINING_GROUND', level: 0, upgradeCost: 5000000 } as Facility,
    ];
    const factors = diagnoseMatch(makeClub({ facilities: lowTg }), false, 5);
    const tg = factors.find(f => f.label === 'Training Ground');
    expect(tg).toBeDefined();
    expect(tg!.sign).toBe('negative');
  });

  it('flags high Training Ground level as a positive factor', () => {
    const highTg: Facility[] = [
      { type: 'TRAINING_GROUND', level: 5, upgradeCost: 5000000 } as Facility,
    ];
    const factors = diagnoseMatch(makeClub({ facilities: highTg }), false, 5);
    const tg = factors.find(f => f.label === 'Training Ground');
    expect(tg).toBeDefined();
    expect(tg!.sign).toBe('positive');
  });

  it('only surfaces home-atmosphere bonus when isHome=true', () => {
    const fz: Facility[] = [
      { type: 'FAN_ZONE', level: 5, upgradeCost: 5000000 } as Facility,
    ];
    const homeFactors = diagnoseMatch(makeClub({ facilities: fz }), true, 8);
    const awayFactors = diagnoseMatch(makeClub({ facilities: fz }), false, 8);
    expect(homeFactors.find(f => f.label === 'Home atmosphere')).toBeDefined();
    expect(awayFactors.find(f => f.label === 'Home atmosphere')).toBeUndefined();
  });

  it('returns at most topN factors, ordered by absolute weight', () => {
    const factors = diagnoseMatch(makeClub({ manager: null }), false, 2);
    expect(factors.length).toBeLessThanOrEqual(2);
    if (factors.length === 2) {
      expect(factors[0].weight).toBeGreaterThanOrEqual(factors[1].weight);
    }
  });
});
