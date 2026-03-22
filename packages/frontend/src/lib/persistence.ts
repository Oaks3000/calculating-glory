/**
 * localStorage persistence for the event log.
 *
 * The event log is the single source of truth — persisting it is sufficient
 * to fully reconstruct any game state via buildState(events).
 *
 * Key is versioned (v1) so a future schema change can bump the key and
 * ignore stale saves rather than breaking on corrupt data.
 */
import { GameEvent } from '@calculating-glory/domain';

const STORAGE_KEY = 'cg-events-v1';

/**
 * Serialise the event log to localStorage.
 * Silent no-op if storage is unavailable (private browsing, quota exceeded).
 */
export function saveEvents(events: GameEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // unavailable — carry on
  }
}

/**
 * Load a previously saved event log.
 * Returns null if nothing is stored or the data is unparseable.
 */
export function loadEvents(): GameEvent[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameEvent[];
  } catch {
    return null;
  }
}

/**
 * Wipe the saved event log (used when starting a new game).
 */
export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // unavailable — carry on
  }
}
