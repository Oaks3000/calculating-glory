const INTRO_KEY = 'cg-intro-v1-completed';
const MODE_KEY  = 'cg-onboarding-mode-v1';

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
