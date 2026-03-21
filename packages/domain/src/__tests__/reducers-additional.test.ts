/**
 * Additional Reducer Tests
 *
 * Covers event types not exercised by the existing test suite:
 * PLAYER_SOLD, BUDGET_UPDATED, FACILITY_UPGRADED, STAFF_HIRED, STAFF_FIRED,
 * MATH_ATTEMPT_RECORDED, WEEK_ADVANCED, SEASON_ENDED,
 * CLUB_EVENT_OCCURRED, CLUB_EVENT_RESOLVED, SEASON_STARTED
 */

import { buildState, reduceEvent } from '../reducers';
import { GameState, PendingClubEvent } from '../types/game-state-updated';
import { GameStartedEvent, GameEvent } from '../events/types';
import { Player } from '../types/player';
import { Staff } from '../types/staff';
import { Facility } from '../types/facility';

// ─── Shared base state ────────────────────────────────────────────────────────

const GAME_STARTED: GameStartedEvent = {
  type: 'GAME_STARTED',
  timestamp: 1000,
  clubId: 'player-club',
  clubName: 'Test FC',
  initialBudget: 100000000,
  difficulty: 'MEDIUM',
  seed: 'reducer-test-seed'
};

function base(): GameState {
  return buildState([GAME_STARTED]);
}

const DEFAULT_CURVE = { shape: 'SHALLOW_BELL' as const, peakHeight: 3 as const, startAge: 18, retirementAge: 36, baseAttack: 50, baseDefence: 50 };

function makePlayer(id: string, wage = 10000): Player {
  return {
    id, name: `Player ${id}`, position: 'MID',
    wage, transferValue: 1000000, age: 25, morale: 75,
    attributes: { attack: 50, defence: 50, teamwork: 55, charisma: 45, publicPotential: 60 },
    truePotential: 33,
    curve: DEFAULT_CURVE,
    contractExpiresWeek: 46,
    stats: { goals: 0, assists: 0, cleanSheets: 0, appearances: 0, averageRating: 70 }
  };
}

function makeStaff(id: string, salary = 50000): Staff {
  return {
    id, name: `Staff ${id}`, role: 'ATTACKING_COACH', quality: 70,
    salary, bonus: { type: 'goals', improvement: 10 }
  };
}

function makeFacility(type: Facility['type'] = 'TRAINING_GROUND', level = 1): Facility {
  return {
    type, level, upgradeCost: 5000000,
    benefit: { type: 'performance', improvement: 10 }
  };
}

function makePendingEvent(id: string, resolved = false): PendingClubEvent {
  return {
    id,
    templateId: 'burst-pipes',
    week: 1,
    title: 'Burst Pipes',
    description: 'Pipes burst.',
    severity: 'minor',
    choices: [
      { id: 'choice-a', label: 'Fix', description: 'Fix it', budgetEffect: -500000, reputationEffect: 0 }
    ],
    resolved
  };
}

// ─── PLAYER_SOLD ──────────────────────────────────────────────────────────────

describe('reducer — PLAYER_SOLD', () => {
  it('removes the sold player from squad and adds fee to transfer budget', () => {
    const player = makePlayer('p1');
    const state: GameState = {
      ...base(),
      club: { ...base().club, squad: [player], transferBudget: 10000000 }
    };

    const event: GameEvent = {
      type: 'PLAYER_SOLD',
      timestamp: 2000,
      playerId: 'p1',
      clubId: 'player-club',
      fee: 2000000
    } as any;

    const next = reduceEvent(state, event);
    expect(next.club.squad.find(p => p.id === 'p1')).toBeUndefined();
    expect(next.club.transferBudget).toBe(12000000);
  });

  it('leaves squad unchanged when player id does not match', () => {
    const player = makePlayer('p1');
    const state: GameState = {
      ...base(),
      club: { ...base().club, squad: [player] }
    };

    const event: GameEvent = {
      type: 'PLAYER_SOLD',
      timestamp: 2000,
      playerId: 'nonexistent',
      clubId: 'player-club',
      fee: 1000000
    } as any;

    const next = reduceEvent(state, event);
    expect(next.club.squad).toHaveLength(1);
  });
});

// ─── BUDGET_UPDATED ───────────────────────────────────────────────────────────

describe('reducer — BUDGET_UPDATED', () => {
  it('adds a positive amount to transfer budget', () => {
    const state: GameState = { ...base(), club: { ...base().club, transferBudget: 10000000 } };
    const event: GameEvent = {
      type: 'BUDGET_UPDATED',
      timestamp: 2000,
      amount: 5000000
    } as any;

    const next = reduceEvent(state, event);
    expect(next.club.transferBudget).toBe(15000000);
  });

  it('subtracts a negative amount from transfer budget', () => {
    const state: GameState = { ...base(), club: { ...base().club, transferBudget: 10000000 } };
    const event: GameEvent = {
      type: 'BUDGET_UPDATED',
      timestamp: 2000,
      amount: -3000000
    } as any;

    const next = reduceEvent(state, event);
    expect(next.club.transferBudget).toBe(7000000);
  });
});

// ─── FACILITY_UPGRADED ────────────────────────────────────────────────────────

describe('reducer — FACILITY_UPGRADED', () => {
  it('upgrades facility level and deducts cost from budget', () => {
    const facility = makeFacility('TRAINING_GROUND', 1);
    const state: GameState = {
      ...base(),
      club: { ...base().club, facilities: [facility], transferBudget: 10000000 }
    };

    const event: GameEvent = {
      type: 'FACILITY_UPGRADED',
      timestamp: 2000,
      clubId: 'player-club',
      facilityType: 'TRAINING_GROUND',
      level: 2,
      cost: 5000000
    } as any;

    const next = reduceEvent(state, event);
    const upgraded = next.club.facilities.find(f => f.type === 'TRAINING_GROUND');
    expect(upgraded?.level).toBe(2);
    expect(next.club.transferBudget).toBe(5000000);
  });

  it('does not modify other facilities', () => {
    const f1 = makeFacility('TRAINING_GROUND', 1);
    const f2 = makeFacility('MEDICAL_CENTER', 2);
    const state: GameState = {
      ...base(),
      club: { ...base().club, facilities: [f1, f2], transferBudget: 10000000 }
    };

    const event: GameEvent = {
      type: 'FACILITY_UPGRADED',
      timestamp: 2000,
      clubId: 'player-club',
      facilityType: 'TRAINING_GROUND',
      level: 2,
      cost: 5000000
    } as any;

    const next = reduceEvent(state, event);
    const medical = next.club.facilities.find(f => f.type === 'MEDICAL_CENTER');
    expect(medical?.level).toBe(2); // unchanged
  });
});

// ─── STAFF_HIRED ──────────────────────────────────────────────────────────────

describe('reducer — STAFF_HIRED', () => {
  it('adds staff to club and deducts wages from budget', () => {
    const staff = makeStaff('coach-1', 50000);
    const state: GameState = {
      ...base(),
      club: { ...base().club, staff: [], transferBudget: 10000000 }
    };

    const event: GameEvent = {
      type: 'STAFF_HIRED',
      timestamp: 2000,
      clubId: 'player-club',
      staffId: 'coach-1',
      role: 'ATTACKING_COACH',
      wages: 50000,
      staff
    } as any;

    const next = reduceEvent(state, event);
    expect(next.club.staff).toHaveLength(1);
    expect(next.club.staff[0].id).toBe('coach-1');
    expect(next.club.transferBudget).toBe(9950000);
  });
});

// ─── STAFF_FIRED ──────────────────────────────────────────────────────────────

describe('reducer — STAFF_FIRED', () => {
  it('removes staff member from club', () => {
    const staff = makeStaff('coach-1');
    const state: GameState = {
      ...base(),
      club: { ...base().club, staff: [staff] }
    };

    const event: GameEvent = {
      type: 'STAFF_FIRED',
      timestamp: 2000,
      clubId: 'player-club',
      staffId: 'coach-1'
    } as any;

    const next = reduceEvent(state, event);
    expect(next.club.staff).toHaveLength(0);
  });

  it('leaves other staff members unchanged', () => {
    const coach1 = makeStaff('coach-1');
    const coach2 = makeStaff('coach-2');
    const state: GameState = {
      ...base(),
      club: { ...base().club, staff: [coach1, coach2] }
    };

    const event: GameEvent = {
      type: 'STAFF_FIRED',
      timestamp: 2000,
      clubId: 'player-club',
      staffId: 'coach-1'
    } as any;

    const next = reduceEvent(state, event);
    expect(next.club.staff).toHaveLength(1);
    expect(next.club.staff[0].id).toBe('coach-2');
  });
});

// ─── MATH_ATTEMPT_RECORDED ────────────────────────────────────────────────────

describe('reducer — MATH_ATTEMPT_RECORDED', () => {
  it('updates percentage performance on a correct attempt', () => {
    const state = base();
    const event: GameEvent = {
      type: 'MATH_ATTEMPT_RECORDED',
      timestamp: 2000,
      studentId: 'student-1',
      topic: 'percentage',
      difficulty: 'EASY',
      correct: true,
      timeSpent: 5000
    } as any;

    const next = reduceEvent(state, event);
    // Initial score = 0, correct: 0*0.8 + 100*0.2 = 20
    expect(next.businessAcumen.recentPerformance.percentage).toBe(20);
  });

  it('updates decimals performance on an incorrect attempt', () => {
    const state = base();
    const event: GameEvent = {
      type: 'MATH_ATTEMPT_RECORDED',
      timestamp: 2000,
      studentId: 'student-1',
      topic: 'decimals',
      difficulty: 'MEDIUM',
      correct: false,
      timeSpent: 8000
    } as any;

    const next = reduceEvent(state, event);
    // 0*0.8 + 0*0.2 = 0
    expect(next.businessAcumen.recentPerformance.decimals).toBe(0);
  });

  it('ignores unknown topics without crashing', () => {
    const state = base();
    const event: GameEvent = {
      type: 'MATH_ATTEMPT_RECORDED',
      timestamp: 2000,
      studentId: 'student-1',
      topic: 'trigonometry-unknown',
      difficulty: 'HARD',
      correct: true,
      timeSpent: 12000
    } as any;

    const next = reduceEvent(state, event);
    // State should be unchanged
    expect(next.businessAcumen).toEqual(state.businessAcumen);
  });

  it('correctly maps all known topic aliases', () => {
    // Note: topics are lower-cased before lookup, so 'multiStep' becomes
    // 'multistep' which isn't in the mapping. Only 'multi-step' is supported.
    const topicAliases = [
      ['percentages', 'percentage'],
      ['decimal', 'decimals'],
      ['ratio', 'ratios'],
      ['ratios', 'ratios'],
      ['algebra', 'algebra'],
      ['statistics', 'statistics'],
      ['stats', 'statistics'],
      ['multi-step', 'multiStep']
    ] as const;

    for (const [topic, field] of topicAliases) {
      const state = base();
      const event: GameEvent = {
        type: 'MATH_ATTEMPT_RECORDED',
        timestamp: 2000,
        studentId: 'student-1',
        topic,
        difficulty: 'EASY',
        correct: true,
        timeSpent: 3000
      } as any;
      const next = reduceEvent(state, event);
      expect(next.businessAcumen.recentPerformance[field]).toBe(20);
    }
  });

  it('awards stars based on average performance', () => {
    // Get all topics to high performance to push stars up
    let state = base();
    const topics = ['percentage', 'decimals', 'ratios', 'algebra', 'statistics', 'multiStep'];

    // Apply many correct attempts to reach high performance
    for (let i = 0; i < 20; i++) {
      for (const topic of topics) {
        const event: GameEvent = {
          type: 'MATH_ATTEMPT_RECORDED',
          timestamp: 2000 + i,
          studentId: 'student-1',
          topic,
          difficulty: 'EASY',
          correct: true,
          timeSpent: 3000
        } as any;
        state = reduceEvent(state, event);
      }
    }
    // After many correct attempts, stars should be > 0
    expect(state.businessAcumen.financial).toBeGreaterThan(0);
  });
});

// ─── WEEK_ADVANCED ────────────────────────────────────────────────────────────

describe('reducer — WEEK_ADVANCED', () => {
  it('sets EARLY_SEASON for weeks 1-15', () => {
    const state = base();
    for (const week of [1, 8, 15]) {
      const event: GameEvent = { type: 'WEEK_ADVANCED', timestamp: 2000, week, season: 1 } as any;
      const next = reduceEvent(state, event);
      expect(next.phase).toBe('EARLY_SEASON');
      expect(next.currentWeek).toBe(week);
    }
  });

  it('sets MID_SEASON for weeks 16-30', () => {
    const state = base();
    for (const week of [16, 23, 30]) {
      const event: GameEvent = { type: 'WEEK_ADVANCED', timestamp: 2000, week, season: 1 } as any;
      const next = reduceEvent(state, event);
      expect(next.phase).toBe('MID_SEASON');
    }
  });

  it('sets LATE_SEASON for weeks 31-46', () => {
    const state = base();
    for (const week of [31, 38, 46]) {
      const event: GameEvent = { type: 'WEEK_ADVANCED', timestamp: 2000, week, season: 1 } as any;
      const next = reduceEvent(state, event);
      expect(next.phase).toBe('LATE_SEASON');
    }
  });
});

// ─── SEASON_ENDED ─────────────────────────────────────────────────────────────

describe('reducer — SEASON_ENDED', () => {
  it('sets phase to SEASON_END', () => {
    const state = base();
    const event: GameEvent = {
      type: 'SEASON_ENDED',
      timestamp: 2000,
      season: 1,
      finalPosition: 5,
      promoted: false,
      relegated: false
    } as any;

    const next = reduceEvent(state, event);
    expect(next.phase).toBe('SEASON_END');
  });
});

// ─── CLUB_EVENT_OCCURRED ──────────────────────────────────────────────────────

describe('reducer — CLUB_EVENT_OCCURRED', () => {
  it('adds a pending event to pendingEvents', () => {
    const state = base();
    const pending = makePendingEvent('event-1');

    const event: GameEvent = {
      type: 'CLUB_EVENT_OCCURRED',
      timestamp: 2000,
      eventId: 'event-1',
      templateId: 'burst-pipes',
      week: 1,
      clubId: 'player-club',
      pendingEvent: pending
    } as any;

    const next = reduceEvent(state, event);
    expect(next.pendingEvents).toHaveLength(1);
    expect(next.pendingEvents[0].id).toBe('event-1');
  });

  it('accumulates multiple pending events', () => {
    let state = base();
    const event1: GameEvent = {
      type: 'CLUB_EVENT_OCCURRED',
      timestamp: 2000,
      eventId: 'ev-1',
      templateId: 'burst-pipes',
      week: 1,
      clubId: 'player-club',
      pendingEvent: makePendingEvent('ev-1')
    } as any;
    const event2: GameEvent = {
      type: 'CLUB_EVENT_OCCURRED',
      timestamp: 2001,
      eventId: 'ev-2',
      templateId: 'sponsor-offer',
      week: 1,
      clubId: 'player-club',
      pendingEvent: makePendingEvent('ev-2')
    } as any;

    state = reduceEvent(state, event1);
    state = reduceEvent(state, event2);
    expect(state.pendingEvents).toHaveLength(2);
  });
});

// ─── CLUB_EVENT_RESOLVED ──────────────────────────────────────────────────────

describe('reducer — CLUB_EVENT_RESOLVED', () => {
  it('removes the event from pendingEvents and applies budget + reputation effects', () => {
    const pending = makePendingEvent('event-1');
    const state: GameState = {
      ...base(),
      pendingEvents: [pending],
      club: { ...base().club, transferBudget: 10000000, reputation: 50 }
    };

    const event: GameEvent = {
      type: 'CLUB_EVENT_RESOLVED',
      timestamp: 2000,
      eventId: 'event-1',
      choiceId: 'choice-a',
      clubId: 'player-club',
      budgetEffect: -500000,
      reputationEffect: 5
    } as any;

    const next = reduceEvent(state, event);
    expect(next.pendingEvents).toHaveLength(0);
    expect(next.club.transferBudget).toBe(9500000);
    expect(next.club.reputation).toBe(55);
    expect(next.resolvedEventHistory).toContain('burst-pipes:choice-a');
  });

  it('clamps reputation at 0 (floor)', () => {
    const pending = makePendingEvent('event-1');
    const state: GameState = {
      ...base(),
      pendingEvents: [pending],
      club: { ...base().club, reputation: 2 }
    };

    const event: GameEvent = {
      type: 'CLUB_EVENT_RESOLVED',
      timestamp: 2000,
      eventId: 'event-1',
      choiceId: 'choice-a',
      clubId: 'player-club',
      budgetEffect: 0,
      reputationEffect: -10
    } as any;

    const next = reduceEvent(state, event);
    expect(next.club.reputation).toBe(0);
  });

  it('clamps reputation at 100 (ceiling)', () => {
    const pending = makePendingEvent('event-1');
    const state: GameState = {
      ...base(),
      pendingEvents: [pending],
      club: { ...base().club, reputation: 98 }
    };

    const event: GameEvent = {
      type: 'CLUB_EVENT_RESOLVED',
      timestamp: 2000,
      eventId: 'event-1',
      choiceId: 'choice-a',
      clubId: 'player-club',
      budgetEffect: 0,
      reputationEffect: 10
    } as any;

    const next = reduceEvent(state, event);
    expect(next.club.reputation).toBe(100);
  });

  it('does nothing when event id is not found in pendingEvents', () => {
    const state = base();
    const event: GameEvent = {
      type: 'CLUB_EVENT_RESOLVED',
      timestamp: 2000,
      eventId: 'nonexistent',
      choiceId: 'choice-a',
      clubId: 'player-club',
      budgetEffect: -500000,
      reputationEffect: 5
    } as any;

    const next = reduceEvent(state, event);
    expect(next).toBe(state); // Should return same state reference
  });
});

// ─── SEASON_STARTED ───────────────────────────────────────────────────────────

describe('reducer — SEASON_STARTED', () => {
  it('sets phase to EARLY_SEASON and updates season number', () => {
    const state = base();
    const event: GameEvent = {
      type: 'SEASON_STARTED',
      timestamp: 2000,
      season: 2
    } as any;

    const next = reduceEvent(state, event);
    expect(next.phase).toBe('EARLY_SEASON');
    expect(next.season).toBe(2);
  });
});

// ─── Default case ─────────────────────────────────────────────────────────────

describe('reducer — unknown event type', () => {
  it('returns state unchanged for unrecognised event types', () => {
    const state = base();
    const event: GameEvent = { type: 'UNKNOWN_EVENT' as any, timestamp: 2000 } as any;
    const next = reduceEvent(state, event);
    // State should be the same (identity check or deep equal)
    expect(next.currentWeek).toBe(state.currentWeek);
    expect(next.phase).toBe(state.phase);
  });
});
