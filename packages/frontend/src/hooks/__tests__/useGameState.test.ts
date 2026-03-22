import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mocks ────────────────────────────────────────────────────────────────────
// vi.mock factories are hoisted — they cannot close over variables declared
// in this file. Use inline literals in the factory; configure mocks in beforeEach.

vi.mock('../../lib/initialGame', () => ({
  loadOrCreateGameState:  vi.fn(() => ({ state: { club: {} }, events: [] })),
  createInitialGameState: vi.fn(() => ({ state: { club: {}, fresh: true }, events: [] })),
}));

vi.mock('@calculating-glory/domain', () => ({
  buildState:    vi.fn(() => ({ club: {} })),
  handleCommand: vi.fn(() => ({ events: [{ type: 'WEEK_ADVANCED' }] })),
}));

vi.mock('../../lib/persistence', () => ({
  saveEvents: vi.fn(),
  clearSave:  vi.fn(),
}));

// ── Imports (after mocks) ────────────────────────────────────────────────────

import { useGameState } from '../useGameState';
import { buildState, handleCommand } from '@calculating-glory/domain';
import { saveEvents, clearSave } from '../../lib/persistence';
import { createInitialGameState } from '../../lib/initialGame';

// ── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(handleCommand).mockReturnValue({ events: [{ type: 'WEEK_ADVANCED' }] } as any);
  vi.mocked(buildState).mockReturnValue({ club: {} } as any);
  vi.mocked(createInitialGameState).mockReturnValue({ state: { club: {}, fresh: true } as any, events: [] });
});

describe('useGameState', () => {
  it('initialises with state and events from loadOrCreateGameState', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.state).toBeDefined();
    expect(result.current.events).toEqual([]);
  });

  it('starts with isLoading = false', () => {
    const { result } = renderHook(() => useGameState());
    expect(result.current.isLoading).toBe(false);
  });

  describe('dispatch', () => {
    it('calls handleCommand with the command and current state', () => {
      const { result } = renderHook(() => useGameState());
      const cmd = { type: 'ADVANCE_WEEK' } as any;
      act(() => { result.current.dispatch(cmd); });
      expect(handleCommand).toHaveBeenCalledWith(cmd, result.current.state);
    });

    it('appends returned events to the log on success', () => {
      const { result } = renderHook(() => useGameState());
      act(() => { result.current.dispatch({ type: 'ADVANCE_WEEK' } as any); });
      expect(result.current.events).toEqual([{ type: 'WEEK_ADVANCED' }]);
    });

    it('calls buildState with the updated event log', () => {
      const { result } = renderHook(() => useGameState());
      act(() => { result.current.dispatch({ type: 'ADVANCE_WEEK' } as any); });
      expect(buildState).toHaveBeenCalledWith([{ type: 'WEEK_ADVANCED' }]);
    });

    it('calls saveEvents with the updated event log', () => {
      const { result } = renderHook(() => useGameState());
      act(() => { result.current.dispatch({ type: 'ADVANCE_WEEK' } as any); });
      expect(saveEvents).toHaveBeenCalledWith([{ type: 'WEEK_ADVANCED' }]);
    });

    it('returns an empty object on success', () => {
      const { result } = renderHook(() => useGameState());
      let ret: { error?: string } = {};
      act(() => { ret = result.current.dispatch({ type: 'ADVANCE_WEEK' } as any); });
      expect(ret).toEqual({});
    });

    it('returns the error message when handleCommand errors', () => {
      vi.mocked(handleCommand).mockReturnValueOnce({ error: new Error('Insufficient funds') } as any);
      const { result } = renderHook(() => useGameState());
      let ret: { error?: string } = {};
      act(() => { ret = result.current.dispatch({ type: 'ADVANCE_WEEK' } as any); });
      expect(ret.error).toBe('Insufficient funds');
    });

    it('does not append events or save on error', () => {
      vi.mocked(handleCommand).mockReturnValueOnce({ error: new Error('Nope') } as any);
      const { result } = renderHook(() => useGameState());
      act(() => { result.current.dispatch({ type: 'ADVANCE_WEEK' } as any); });
      expect(result.current.events).toEqual([]);
      expect(saveEvents).not.toHaveBeenCalled();
    });
  });

  describe('resetGame', () => {
    it('calls clearSave', () => {
      const { result } = renderHook(() => useGameState());
      act(() => { result.current.resetGame(); });
      expect(clearSave).toHaveBeenCalledTimes(1);
    });

    it('calls createInitialGameState', () => {
      const { result } = renderHook(() => useGameState());
      act(() => { result.current.resetGame(); });
      expect(createInitialGameState).toHaveBeenCalledTimes(1);
    });

    it('resets events back to empty after prior dispatches', () => {
      const { result } = renderHook(() => useGameState());
      act(() => { result.current.dispatch({ type: 'ADVANCE_WEEK' } as any); });
      expect(result.current.events).toHaveLength(1);
      act(() => { result.current.resetGame(); });
      expect(result.current.events).toEqual([]);
    });

    it('resets state to the fresh game state', () => {
      const { result } = renderHook(() => useGameState());
      act(() => { result.current.resetGame(); });
      expect(result.current.state).toEqual({ club: {}, fresh: true });
    });
  });
});
