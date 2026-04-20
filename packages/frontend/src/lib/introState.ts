const INTRO_KEY     = 'cg-intro-v1-completed';
const MODE_KEY      = 'cg-onboarding-mode-v1';
const GLOSSARY_KEY  = 'cg-glossary-seen-v1';

export type OnboardingMode = 'guided' | 'skip';

export function isIntroCompleted(): boolean {
  try {
    return localStorage.getItem(INTRO_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markIntroCompleted(): void {
  try {
    localStorage.setItem(INTRO_KEY, 'true');
  } catch {
    // unavailable — carry on
  }
}

export function clearIntroCompleted(): void {
  try {
    localStorage.removeItem(INTRO_KEY);
  } catch {
    // unavailable — carry on
  }
}

// Existing saves with no recorded preference default to 'skip' so they don't
// see the guided UI appear out of nowhere.
export function getOnboardingMode(): OnboardingMode {
  try {
    const raw = localStorage.getItem(MODE_KEY);
    return raw === 'guided' ? 'guided' : 'skip';
  } catch {
    return 'skip';
  }
}

export function setOnboardingMode(mode: OnboardingMode): void {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // unavailable — carry on
  }
}

// ── Glossary: which jargon terms the player has seen the full explainer for.
// Stored as a JSON array of term ids. The TermInfo component shows the full
// NPC explainer the first time each term is tapped, and a short popup after.

function readSeenTerms(): Set<string> {
  try {
    const raw = localStorage.getItem(GLOSSARY_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

export function hasSeenTerm(id: string): boolean {
  return readSeenTerms().has(id);
}

export function markTermSeen(id: string): void {
  try {
    const seen = readSeenTerms();
    if (seen.has(id)) return;
    seen.add(id);
    localStorage.setItem(GLOSSARY_KEY, JSON.stringify([...seen]));
  } catch {
    // unavailable — carry on
  }
}
