/**
 * Match Diagnostics
 *
 * Surfaces the contributing factors behind a match result so the player
 * can connect their decisions to what happened on the pitch. Mirrors the
 * weights in match.ts:calculateTeamModifier and clubToTeam — if those
 * change, the diagnostics here should change too.
 *
 * Used by PostMatchScreen to render a "Why we won / why we lost" panel.
 */

import { Club } from '../types/club';
import { clubToTeam } from './match';

export type FactorSign = 'positive' | 'negative' | 'neutral';

export interface MatchFactor {
  sign: FactorSign;
  /** Short label, player-facing (e.g. "Squad morale"). */
  label: string;
  /** One-line explanation, player-facing (e.g. "+4% team output (avg 78/100)"). */
  detail: string;
  /** Magnitude in modifier units, used for ranking. e.g. 0.05 = 5% team output. */
  weight: number;
}

/**
 * Diagnose why a match landed where it did, from the player's club state.
 *
 * Returns up to `topN` factors ordered by absolute weight (loudest first).
 * Doesn't reach into opponent strength — focuses on player-controllable
 * inputs because those are what the player can actually act on.
 */
export function diagnoseMatch(
  club: Club,
  isHome: boolean,
  topN: number = 3,
): MatchFactor[] {
  const factors: MatchFactor[] = [];

  // ── Squad morale ──────────────────────────────────────────────────────────
  // morale.ts contribution: ((avgMorale / 100) − 0.5) × 0.10  →  ±0.05
  if (club.squad.length > 0) {
    const avgMorale =
      club.squad.reduce((s, p) => s + p.morale, 0) / club.squad.length;
    const moraleDelta = ((avgMorale / 100) - 0.5) * 0.10;
    if (Math.abs(moraleDelta) >= 0.015) {
      factors.push({
        sign: moraleDelta > 0 ? 'positive' : 'negative',
        label: 'Squad morale',
        detail: `${formatPct(moraleDelta)} team output (avg ${Math.round(avgMorale)}/100)`,
        weight: Math.abs(moraleDelta),
      });
    }
  }

  // ── Manager presence & experience ─────────────────────────────────────────
  // No manager → tactical=20 baseline (XI noise ±16) + miss the +0.06 max XP boost
  if (!club.manager) {
    factors.push({
      sign: 'negative',
      label: 'No manager in the dugout',
      detail: 'XI selection runs on a tactical baseline — players get misjudged',
      weight: 0.06,
    });
  } else {
    const xpDelta = (club.manager.attributes.experience / 100) * 0.06;
    if (xpDelta >= 0.03) {
      factors.push({
        sign: 'positive',
        label: 'Manager experience',
        detail: `${club.manager.name} — ${formatPct(xpDelta)} team output (XP ${club.manager.attributes.experience}/100)`,
        weight: xpDelta,
      });
    }
  }

  // ── Recent form ───────────────────────────────────────────────────────────
  // form.ts contribution: per W +0.02, per L −0.02 across last 5
  const last5 = club.form.slice(-5);
  if (last5.length >= 3) {
    const wins = last5.filter(r => r === 'W').length;
    const losses = last5.filter(r => r === 'L').length;
    const draws = last5.length - wins - losses;
    const formDelta = wins * 0.02 - losses * 0.02;
    if (Math.abs(formDelta) >= 0.04) {
      factors.push({
        sign: formDelta > 0 ? 'positive' : 'negative',
        label: 'Recent form',
        detail: `${wins}W ${draws}D ${losses}L in last 5 — ${formatPct(formDelta)} team output`,
        weight: Math.abs(formDelta),
      });
    }
  }

  // ── Training Ground ───────────────────────────────────────────────────────
  // Primary performance lever: (level / 5) × 0.50  →  up to +50%
  const tg = club.facilities.find(f => f.type === 'TRAINING_GROUND');
  if (tg) {
    const tgBoost = (tg.level / 5) * 0.50;
    if (tg.level <= 1) {
      factors.push({
        sign: 'negative',
        label: 'Training Ground',
        detail: `Level ${tg.level} only — capped at +${Math.round(tgBoost * 100)}% team output (max +50%)`,
        weight: 0.50 - tgBoost,
      });
    } else if (tg.level >= 4) {
      factors.push({
        sign: 'positive',
        label: 'Training Ground',
        detail: `Level ${tg.level} — +${Math.round(tgBoost * 100)}% team output`,
        weight: tgBoost,
      });
    }
  }

  // ── Squad teamwork ────────────────────────────────────────────────────────
  // (avgTeamwork / 100) × 0.08
  if (club.squad.length > 0) {
    const avgTeamwork =
      club.squad.reduce((s, p) => s + p.attributes.teamwork, 0) / club.squad.length;
    const teamworkDelta = (avgTeamwork / 100) * 0.08;
    if (avgTeamwork >= 70) {
      factors.push({
        sign: 'positive',
        label: 'Squad chemistry',
        detail: `Avg teamwork ${Math.round(avgTeamwork)}/100 — +${Math.round(teamworkDelta * 100)}% team output`,
        weight: teamworkDelta,
      });
    } else if (avgTeamwork <= 40) {
      factors.push({
        sign: 'negative',
        label: 'Low squad chemistry',
        detail: `Avg teamwork ${Math.round(avgTeamwork)}/100 — only +${Math.round(teamworkDelta * 100)}% team output`,
        weight: 0.08 - teamworkDelta,
      });
    }
  }

  // ── Backroom staff ────────────────────────────────────────────────────────
  // (avgQuality / 100) × 0.12
  if (club.staff.length > 0) {
    const avgQuality =
      club.staff.reduce((s, x) => s + x.quality, 0) / club.staff.length;
    const staffDelta = (avgQuality / 100) * 0.12;
    if (avgQuality >= 70) {
      factors.push({
        sign: 'positive',
        label: 'Backroom staff',
        detail: `${club.staff.length} hires, avg quality ${Math.round(avgQuality)}/100 — +${Math.round(staffDelta * 100)}% team output`,
        weight: staffDelta,
      });
    } else if (club.staff.length < 3) {
      factors.push({
        sign: 'negative',
        label: 'Thin backroom staff',
        detail: `Only ${club.staff.length}/5 hires — leaving up to +12% team output on the table`,
        weight: 0.12 - staffDelta,
      });
    }
  } else {
    factors.push({
      sign: 'negative',
      label: 'No backroom staff',
      detail: 'Up to +12% team output unclaimed without staff',
      weight: 0.12,
    });
  }

  // ── Home atmosphere ───────────────────────────────────────────────────────
  // FAN_ZONE: (level / 5) × 0.05, expected-goals home-only
  if (isHome) {
    const fz = club.facilities.find(f => f.type === 'FAN_ZONE');
    if (fz && fz.level >= 3) {
      const bonus = (fz.level / 5) * 0.05;
      factors.push({
        sign: 'positive',
        label: 'Home atmosphere',
        detail: `Fan Zone level ${fz.level} — +${(bonus * 100).toFixed(1)}% expected goals at home`,
        weight: bonus,
      });
    }
  }

  // ── Squad attack/defence balance ──────────────────────────────────────────
  // Pulls actual team strengths via clubToTeam — surfaces the imbalance the
  // opposition will exploit.
  const team = clubToTeam(club, 'diagnostic');
  const balance = team.attackStrength - team.defenceStrength;
  if (Math.abs(balance) >= 8) {
    const attackHeavy = balance > 0;
    factors.push({
      sign: 'neutral',
      label: attackHeavy ? 'Attack-led squad' : 'Defence-led squad',
      detail: `Attack ${Math.round(team.attackStrength)} vs Defence ${Math.round(team.defenceStrength)} — ${attackHeavy ? 'we score, but we leak' : 'we hold, but we struggle to break through'}`,
      weight: Math.abs(balance) / 100,
    });
  }

  return factors.sort((a, b) => b.weight - a.weight).slice(0, topN);
}

function formatPct(modifierDelta: number): string {
  const pct = modifierDelta * 100;
  const rounded = Math.abs(pct) < 1 ? pct.toFixed(1) : Math.round(pct).toString();
  return `${pct >= 0 ? '+' : ''}${rounded}%`;
}
