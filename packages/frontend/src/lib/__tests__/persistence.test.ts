import { describe, it, expect, beforeEach } from 'vitest';
import { saveEvents, loadEvents, clearSave } from '../persistence';
import type { GameEvent } from '@calculating-glory/domain';

const STORAGE_KEY = 'cg-events-v1';

// jsdom provides a real localStorage implementation
beforeEach(() => {
  localStorage.clear();
});

describe('saveEvents', () => {
  it('serialises events to localStorage under the versioned key', () => {
    const events = [{ type: 'GAME_STARTED' }] as unknown as GameEvent[];
    saveEvents(events);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(events));
  });

  it('overwrites a previous save', () => {
    const first  = [{ type: 'GAME_STARTED' }] as unknown as GameEvent[];
    const second = [{ type: 'GAME_STARTED' }, { type: 'WEEK_ADVANCED' }] as unknown as GameEvent[];
    saveEvents(first);
    saveEvents(second);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(second));
  });

  it('handles an empty event array', () => {
    saveEvents([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
  });
});

describe('loadEvents', () => {
  it('returns null when nothing is stored', () => {
    expect(loadEvents()).toBeNull();
  });

  it('returns the stored events after a save', () => {
    const events = [{ type: 'GAME_STARTED' }, { type: 'WEEK_ADVANCED' }] as unknown as GameEvent[];
    saveEvents(events);
    expect(loadEvents()).toEqual(events);
  });

  it('returns null when stored data is not valid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{{');
    expect(loadEvents()).toBeNull();
  });

  it('round-trips complex event objects', () => {
    const events = [
      { type: 'GAME_STARTED', clubId: 'test-fc', budget: 50_000_000 },
      { type: 'MATCH_SIMULATED', homeGoals: 2, awayGoals: 1 },
    ] as unknown as GameEvent[];
    saveEvents(events);
    expect(loadEvents()).toEqual(events);
  });
});

describe('clearSave', () => {
  it('removes the saved events', () => {
    saveEvents([{ type: 'GAME_STARTED' }] as unknown as GameEvent[]);
    clearSave();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('is a no-op when nothing is stored', () => {
    expect(() => clearSave()).not.toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('round-trip', () => {
  it('save → load → clear → load returns null', () => {
    const events = [{ type: 'GAME_STARTED' }] as unknown as GameEvent[];
    saveEvents(events);
    expect(loadEvents()).toEqual(events);
    clearSave();
    expect(loadEvents()).toBeNull();
  });
});
