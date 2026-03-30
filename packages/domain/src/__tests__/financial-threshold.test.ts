/**
 * Financial Threshold Event Tests
 *
 * Tests for generateFinancialThresholdEvents:
 *   - fires on deterioration (GREEN→AMBER, AMBER→RED, RED→CRITICAL)
 *   - fires on recovery (CRITICAL/RED→AMBER or better)
 *   - no-op when band unchanged
 *   - no-op when unresolved financial event already pending
 *   - no-op in PRE_SEASON / SEASON_END
 */

import { buildState } from '../reducers';
import { GameState, PendingClubEvent } from '../types/game-state-updated';
import { GameStartedEvent } from '../events/types';
import { generateFinancialThresholdEvents } from '../simulation/events';

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = buildState([
    {
      type: 'GAME_STARTED',
      timestamp: Date.now(),
      clubId: 'test-club',
      clubName: 'Test FC',
      initialBudget: 500_000_00,
      difficulty: 'MEDIUM',
      seed: 'test-seed',
    } as GameStartedEvent,
  ]);
  return { ...base, ...overrides };
}

function pendingFinancialEvent(templateId: string): PendingClubEvent {
  return {
    id: 'evt-existing',
    templateId,
    week: 1,
    title: 'Test',
    description: 'Test',
    severity: 'minor',
    choices: [],
    resolved: false,
  };
}

describe('generateFinancialThresholdEvents', () => {
  // ── Deterioration ──────────────────────────────────────────────────────────

  test('fires val-runway-amber when crossing GREEN → AMBER', () => {
    const state = makeState({ lastRunwayBand: 'GREEN', phase: 'EARLY_SEASON' });
    const events = generateFinancialThresholdEvents(state, 5, 1, 'AMBER', 15);
    expect(events).toHaveLength(1);
    expect(events[0].templateId).toBe('val-runway-amber');
    expect(events[0].npc).toBe('val');
    expect(events[0].severity).toBe('minor');
  });

  test('fires val-runway-amber when crossing SURPLUS → AMBER', () => {
    const state = makeState({ lastRunwayBand: 'SURPLUS', phase: 'EARLY_SEASON' });
    const events = generateFinancialThresholdEvents(state, 5, 1, 'AMBER', 15);
    expect(events).toHaveLength(1);
    expect(events[0].templateId).toBe('val-runway-amber');
  });

  test('fires val-runway-red when crossing AMBER → RED', () => {
    const state = makeState({ lastRunwayBand: 'AMBER', phase: 'MID_SEASON' });
    const events = generateFinancialThresholdEvents(state, 10, 1, 'RED', 7);
    expect(events).toHaveLength(1);
    expect(events[0].templateId).toBe('val-runway-red');
    expect(events[0].severity).toBe('major');
  });

  test('fires val-runway-red when crossing GREEN → RED (skipped a band)', () => {
    const state = makeState({ lastRunwayBand: 'GREEN', phase: 'MID_SEASON' });
    const events = generateFinancialThresholdEvents(state, 10, 1, 'RED', 7);
    expect(events).toHaveLength(1);
    expect(events[0].templateId).toBe('val-runway-red');
  });

  test('fires val-runway-critical when crossing RED → CRITICAL', () => {
    const state = makeState({ lastRunwayBand: 'RED', phase: 'LATE_SEASON' });
    const events = generateFinancialThresholdEvents(state, 15, 1, 'CRITICAL', 3);
    expect(events).toHaveLength(1);
    expect(events[0].templateId).toBe('val-runway-critical');
    expect(events[0].severity).toBe('major');
  });

  // ── Recovery ───────────────────────────────────────────────────────────────

  test('fires val-runway-recovery when crossing CRITICAL → AMBER', () => {
    const state = makeState({ lastRunwayBand: 'CRITICAL', phase: 'MID_SEASON' });
    const events = generateFinancialThresholdEvents(state, 20, 1, 'AMBER', 12);
    expect(events).toHaveLength(1);
    expect(events[0].templateId).toBe('val-runway-recovery');
    expect(events[0].severity).toBe('minor');
  });

  test('fires val-runway-recovery when crossing RED → GREEN', () => {
    const state = makeState({ lastRunwayBand: 'RED', phase: 'MID_SEASON' });
    const events = generateFinancialThresholdEvents(state, 20, 1, 'GREEN', 25);
    expect(events).toHaveLength(1);
    expect(events[0].templateId).toBe('val-runway-recovery');
  });

  test('fires val-runway-recovery when crossing RED → SURPLUS', () => {
    const state = makeState({ lastRunwayBand: 'RED', phase: 'MID_SEASON' });
    const events = generateFinancialThresholdEvents(state, 20, 1, 'SURPLUS', Infinity);
    expect(events).toHaveLength(1);
    expect(events[0].templateId).toBe('val-runway-recovery');
  });

  // ── No-op cases ────────────────────────────────────────────────────────────

  test('no event when band unchanged', () => {
    const state = makeState({ lastRunwayBand: 'AMBER', phase: 'EARLY_SEASON' });
    const events = generateFinancialThresholdEvents(state, 5, 1, 'AMBER', 12);
    expect(events).toHaveLength(0);
  });

  test('no event when lastRunwayBand is undefined and band is GREEN (first run)', () => {
    const state = makeState({ lastRunwayBand: undefined, phase: 'EARLY_SEASON' });
    const events = generateFinancialThresholdEvents(state, 1, 1, 'GREEN', 30);
    expect(events).toHaveLength(0);
  });

  test('no event when an unresolved financial threshold card is already pending', () => {
    const state = makeState({
      lastRunwayBand: 'GREEN',
      phase: 'EARLY_SEASON',
      pendingEvents: [pendingFinancialEvent('val-runway-amber')],
    });
    const events = generateFinancialThresholdEvents(state, 5, 1, 'AMBER', 15);
    expect(events).toHaveLength(0);
  });

  test('fires even when unrelated pending events exist', () => {
    const state = makeState({
      lastRunwayBand: 'GREEN',
      phase: 'EARLY_SEASON',
      pendingEvents: [pendingFinancialEvent('morale-unrest')],
    });
    const events = generateFinancialThresholdEvents(state, 5, 1, 'AMBER', 15);
    expect(events).toHaveLength(1);
  });

  test('no event during PRE_SEASON', () => {
    const state = makeState({ lastRunwayBand: 'GREEN', phase: 'PRE_SEASON' });
    const events = generateFinancialThresholdEvents(state, 1, 1, 'AMBER', 15);
    expect(events).toHaveLength(0);
  });

  test('no event during SEASON_END', () => {
    const state = makeState({ lastRunwayBand: 'GREEN', phase: 'SEASON_END' });
    const events = generateFinancialThresholdEvents(state, 46, 1, 'AMBER', 15);
    expect(events).toHaveLength(0);
  });

  // ── Content checks ─────────────────────────────────────────────────────────

  test('amber card has 2 choices', () => {
    const state = makeState({ lastRunwayBand: 'GREEN', phase: 'EARLY_SEASON' });
    const events = generateFinancialThresholdEvents(state, 5, 1, 'AMBER', 15);
    expect(events[0].choices).toHaveLength(2);
  });

  test('red card has 3 choices', () => {
    const state = makeState({ lastRunwayBand: 'AMBER', phase: 'MID_SEASON' });
    const events = generateFinancialThresholdEvents(state, 10, 1, 'RED', 7);
    expect(events[0].choices).toHaveLength(3);
  });

  test('critical card has 3 choices including emergency board funding', () => {
    const state = makeState({ lastRunwayBand: 'RED', phase: 'LATE_SEASON' });
    const events = generateFinancialThresholdEvents(state, 15, 1, 'CRITICAL', 3);
    const choices = events[0].choices;
    expect(choices).toHaveLength(3);
    const boardChoice = choices.find(c => c.id === 'board-emergency');
    expect(boardChoice).toBeDefined();
    expect(boardChoice!.budgetEffect).toBeGreaterThan(0);
  });

  test('event id includes season and week', () => {
    const state = makeState({ lastRunwayBand: 'GREEN', phase: 'EARLY_SEASON' });
    const events = generateFinancialThresholdEvents(state, 12, 3, 'AMBER', 15);
    expect(events[0].id).toContain('S3');
    expect(events[0].id).toContain('W12');
  });
});
