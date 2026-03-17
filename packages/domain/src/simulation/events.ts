/**
 * Club Event Generation
 *
 * Generates 0-3 pending club events per week using a seeded RNG.
 * Selection is driven by two layers:
 *   1. State-driven filtering (budget, reputation conditions)
 *   2. Prerequisite filtering (branching based on resolved event history)
 * Plus cooldown checks to avoid repetition.
 *
 * Key property: same seed + same state → same events (deterministic),
 * but different resolved histories → different events (divergence).
 */

import { GameState, PendingClubEvent } from '../types/game-state-updated';
import { CLUB_EVENT_TEMPLATES, ClubEventTemplate } from '../data/club-events';
import { createRng } from './rng';
import { LEAGUE_TWO_TEAMS } from '../data/league-two-teams';

/**
 * Check whether a template's prerequisite has been met in the resolved history.
 * History entries are stored as "templateId:choiceId".
 */
function prerequisiteMet(
  template: ClubEventTemplate,
  resolvedEventHistory: string[]
): boolean {
  if (!template.prerequisite) return true;
  const key = `${template.prerequisite.eventId}:${template.prerequisite.choiceId}`;
  return resolvedEventHistory.includes(key);
}

/**
 * Check whether a template's state conditions are satisfied.
 */
function conditionsMet(template: ClubEventTemplate, state: GameState): boolean {
  if (!template.conditions) return true;
  const { minBudget, maxBudget, minReputation, maxReputation } = template.conditions;
  if (minBudget !== undefined && state.club.transferBudget < minBudget) return false;
  if (maxBudget !== undefined && state.club.transferBudget > maxBudget) return false;
  if (minReputation !== undefined && state.club.reputation < minReputation) return false;
  if (maxReputation !== undefined && state.club.reputation > maxReputation) return false;
  return true;
}

/**
 * Check whether an event is on cooldown.
 * We look for the template id in both pending events (fired this season
 * but not yet resolved) and the resolved history (fired in previous weeks).
 * We use a simple heuristic: if ANY resolved history entry matches the
 * templateId and the event has a cooldown, we skip it unless enough weeks
 * have passed. Because we don't store the week in resolvedEventHistory,
 * we conservatively check pending events by templateId instead — if the
 * event is currently pending it definitely can't fire again.
 * For resolved events the cooldown is approximated by counting occurrences
 * vs the cooldown in "slots" (coarse but deterministic).
 */
function isOnCooldown(
  template: ClubEventTemplate,
  state: GameState,
  currentWeek: number
): boolean {
  if (!template.cooldownWeeks) return false;

  // If event is currently pending, it cannot fire again
  const currentlyPending = state.pendingEvents.some(
    e => e.templateId === template.id && !e.resolved
  );
  if (currentlyPending) return true;

  // For resolved events: check if the event was resolved recently.
  // resolvedEventHistory stores "templateId:choiceId".
  // To determine recency, we use the event's week stored in the pending
  // event ID format: "evt-S{season}-W{week}-{index}".
  // Since we don't have the exact week in the history string, we use a
  // simple slot-based cooldown: count how many times the template appears
  // in resolvedEventHistory. If it appears and current week is within
  // cooldown of the most recent occurrence, skip it.
  // We approximate by checking if total resolved count combined with
  // pending events count satisfies the cooldown window.
  const resolvedCount = state.resolvedEventHistory.filter(entry =>
    entry.startsWith(`${template.id}:`)
  ).length;

  if (resolvedCount === 0) return false;

  // Approximate: if the event has been resolved at all and we are within
  // cooldownWeeks of the start of the season (currentWeek <= cooldownWeeks),
  // treat it as on cooldown. This is conservative but correct for typical
  // single-season play.
  if (currentWeek <= template.cooldownWeeks) return true;

  return false;
}

/**
 * Get all templates eligible to fire in the given state.
 * Used for testing.
 */
export function getEligibleEvents(state: GameState): ClubEventTemplate[] {
  return CLUB_EVENT_TEMPLATES.filter(template => {
    // Must have prerequisite met (or no prerequisite)
    if (!prerequisiteMet(template, state.resolvedEventHistory)) return false;
    // For templates WITH prerequisites: they're follow-ups, always include
    // if prerequisite met (regardless of conditions/cooldown)
    if (template.prerequisite) return true;
    // Standalone: check conditions and cooldown
    if (!conditionsMet(template, state)) return false;
    return true;
  });
}

/**
 * Generate 0-3 pending club events for the given week.
 * Deterministic: same seed + season + week + state → same output.
 */
export function generateWeekEvents(
  state: GameState,
  week: number,
  season: number,
  seed: string
): PendingClubEvent[] {
  const rng = createRng(`${seed}-S${season}-W${week}-events`);

  // Filter to eligible templates
  const eligible = CLUB_EVENT_TEMPLATES.filter(template => {
    if (!prerequisiteMet(template, state.resolvedEventHistory)) return false;
    if (template.prerequisite) {
      // Follow-up event: include if not already pending and not recently resolved
      const alreadyPending = state.pendingEvents.some(
        e => e.templateId === template.id && !e.resolved
      );
      if (alreadyPending) return false;
      // Check if already resolved (follow-ups should only fire once per path)
      const alreadyResolved = state.resolvedEventHistory.some(entry =>
        entry.startsWith(`${template.id}:`)
      );
      if (alreadyResolved) return false;
      return true;
    }
    // Standalone: check conditions and cooldown
    if (!conditionsMet(template, state)) return false;
    if (isOnCooldown(template, state, week)) return false;
    return true;
  });

  if (eligible.length === 0) return [];

  // Decide how many events to generate (0-3)
  const roll = rng.next();
  let count: number;
  if (roll < 0.2) {
    count = 0;
  } else if (roll < 0.5) {
    count = 1;
  } else if (roll < 0.8) {
    count = 2;
  } else {
    count = 3;
  }

  count = Math.min(count, eligible.length);
  if (count === 0) return [];

  // Seeded shuffle then take first `count`
  const shuffled = [...eligible];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const picked = shuffled.slice(0, count);

  // Find the squad's highest-rated player for player-specific events
  const starPlayer = state.club.squad.length > 0
    ? state.club.squad.reduce((best, p) => p.overallRating > best.overallRating ? p : best)
    : null;

  // Hydrate into PendingClubEvent objects
  return picked.map((template, index): PendingClubEvent => {
    // Personalise the player-unhappy event with the actual star player's name
    let title       = template.title;
    let description = template.description;
    if (template.id === 'player-unhappy' && starPlayer) {
      title       = `${starPlayer.name} Wants More Wages`;
      description = `${starPlayer.name} has asked for a wage increase. You need to decide how to respond.`;
    }

    return ({
    id: `evt-S${season}-W${week}-${index}`,
    templateId: template.id,
    week,
    title,
    description,
    severity: template.severity,
    choices: template.choices.map(c => ({
      id: c.id,
      label: c.label,
      description: c.description,
      budgetEffect: c.budgetEffect,
      reputationEffect: c.reputationEffect,
      performanceEffect: c.performanceEffect,
      requiresMath: c.requiresMath
    })),
    resolved: false
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// NPC Poaching
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Per-week chance of an NPC approaching each squad player.
 * Rate scales with player quality: a 70-rated player has twice the chance of a 50-rated one.
 */
const POACH_BASE_RATE = 0.06; // 6% base per player per week for a 50-OVR player
const POACH_RATING_SCALE = 0.004; // +0.4% per rating point above 50

function poachChance(overallRating: number): number {
  return POACH_BASE_RATE + Math.max(0, overallRating - 50) * POACH_RATING_SCALE;
}

/**
 * Offered fee is 8–12 weeks' wages, scaled by player rating.
 * Higher-rated players attract bigger bids.
 */
function offeredFee(wage: number, overallRating: number): number {
  const weekMultiplier = 8 + Math.floor((overallRating - 40) / 10);
  return Math.round(wage * Math.min(weekMultiplier, 16));
}

/**
 * Generate 0–1 NPC poach attempt for this week (deterministic).
 * At most one poach event fires per week to avoid inbox overload.
 *
 * Targeting logic:
 * - Only players with overallRating >= 55 can be approached
 * - Strongest NPC club (not already in state as player's club) makes the bid
 * - The specific player is chosen probabilistically (higher rating = higher weight)
 */
export function generatePoachAttempts(
  state: GameState,
  week: number,
  season: number,
  seed: string
): PendingClubEvent[] {
  const rng = createRng(`${seed}-S${season}-W${week}-poach`);

  // Only fire during the season, not pre-season
  if (state.phase === 'PRE_SEASON' || state.phase === 'SEASON_END') return [];

  // Squad must have at least one attractive player (OVR ≥ 55)
  const targets = state.club.squad.filter(p => p.overallRating >= 55);
  if (targets.length === 0) return [];

  // Check if a poach event is already pending (one at a time)
  const poachPending = state.pendingEvents.some(
    e => e.templateId === 'npc-poach' && !e.resolved
  );
  if (poachPending) return [];

  // Pick a random target, weighted by overallRating
  const totalWeight = targets.reduce((sum, p) => sum + p.overallRating, 0);
  let pick = rng.next() * totalWeight;
  const target = targets.find(p => {
    pick -= p.overallRating;
    return pick <= 0;
  }) ?? targets[targets.length - 1];

  // Roll per-player chance
  if (rng.next() > poachChance(target.overallRating)) return [];

  // Pick a random NPC club (not the player's own club)
  const npcClubs = LEAGUE_TWO_TEAMS.filter(t => t.id !== state.club.id);
  const npcClub = npcClubs[rng.nextInt(0, npcClubs.length - 1)];

  const fee = offeredFee(target.wage, target.overallRating);
  const feeStr = (fee / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  });
  const counterFee = Math.round(fee * 1.5);
  const counterFeeStr = (counterFee / 100).toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  });

  const poachEvent: PendingClubEvent = {
    id: `evt-S${season}-W${week}-poach`,
    templateId: 'npc-poach',
    week,
    title: `${npcClub.name} want ${target.name}`,
    description: `${npcClub.name} have submitted a formal bid of ${feeStr} for ${target.name}. How do you respond?`,
    severity: 'major',
    metadata: {
      poachTargetPlayerId: target.id,
      npcClubId: npcClub.id,
      npcClubName: npcClub.name,
      offeredFee: fee,
    },
    choices: [
      {
        id: 'accept',
        label: 'Accept the bid',
        description: `Sell ${target.name} to ${npcClub.name} for ${feeStr}. The funds land immediately.`,
        budgetEffect: fee,
        reputationEffect: 3,
        playerLeaves: true,
      },
      {
        id: 'reject',
        label: 'Reject the bid',
        description: `Turn down the offer. ${target.name} stays — but may be unsettled.`,
        moraleEffect: -15,
      },
      {
        id: 'counter',
        label: `Counter at ${counterFeeStr}`,
        description: `Demand 50% more. ${npcClub.name} agrees — ${target.name} moves on for a premium fee.`,
        budgetEffect: counterFee,
        reputationEffect: 5,
        playerLeaves: true,
      },
      {
        id: 'ignore',
        label: 'Say nothing',
        description: `Don't respond at all. The bid lapses, but ${target.name} is left in the dark and is very unhappy.`,
        moraleEffect: -25,
        reputationEffect: -5,
      },
    ],
    resolved: false,
  };

  return [poachEvent];
}
