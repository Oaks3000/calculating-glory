const INTRO_KEY = 'cg-intro-v1-completed';

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
