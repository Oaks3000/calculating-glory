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
import { getTeamsForDivision } from '../data/division-teams';
import { avgSquadMorale, isUnsettled } from './morale';
import { computeOverallRating } from '../types/player';

/**
 * Check whether a template's prerequisite has been met.
 *
 * Handles three checks:
 *   1. Basic history match ("templateId:choiceId" in resolvedEventHistory)
 *   2. delayWeeks: the prerequisite must have been resolved at least delayWeeks ago
 *   3. mathsQuality: if set, the predecessor's maths outcome must match
 */
function prerequisiteMet(
  template: ClubEventTemplate,
  resolvedEventHistory: string[],
  currentWeek: number,
  resolvedEventWeeks: Record<string, number>,
  mathsOutcomes: Record<string, 'correct' | 'wrong'>
): boolean {
  if (!template.prerequisite) return true;

  const { eventId, choiceId, mathsQuality } = template.prerequisite;
  const key = `${eventId}:${choiceId}`;

  // 1. Must have been resolved
  if (!resolvedEventHistory.includes(key)) return false;

  // 2. delayWeeks: only fire after the required delay has passed
  if (template.delayWeeks !== undefined && template.delayWeeks > 0) {
    const resolvedWeek = resolvedEventWeeks[key];
    if (resolvedWeek === undefined) return false;
    if (currentWeek < resolvedWeek + template.delayWeeks) return false;
  }

  // 3. mathsQuality: only fire if maths quality matches
  if (mathsQuality !== undefined) {
    const quality = mathsOutcomes[eventId];
    if (quality !== mathsQuality) return false;
  }

  return true;
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
  const resolvedEventWeeks = state.resolvedEventWeeks ?? {};
  const mathsOutcomes = state.mathsOutcomes ?? {};
  return CLUB_EVENT_TEMPLATES.filter(template => {
    if (!prerequisiteMet(template, state.resolvedEventHistory, state.currentWeek, resolvedEventWeeks, mathsOutcomes)) return false;
    if (template.prerequisite) return true;
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

  const resolvedEventWeeks = state.resolvedEventWeeks ?? {};
  const mathsOutcomes = state.mathsOutcomes ?? {};

  // Filter to eligible templates
  const eligible = CLUB_EVENT_TEMPLATES.filter(template => {
    if (!prerequisiteMet(template, state.resolvedEventHistory, week, resolvedEventWeeks, mathsOutcomes)) return false;
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
    ? state.club.squad.reduce((best, p) => computeOverallRating(p) > computeOverallRating(best) ? p : best)
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
      npc: template.npc,
      chainId: template.chainId,
      hopNumber: template.hopNumber,
      chainLength: template.chainLength,
      mathsChallenge: template.mathsChallenge,
      bankTopic: template.bankTopic,
      choices: template.choices.map(c => ({
        id: c.id,
        label: c.label,
        description: c.description,
        budgetEffect: c.budgetEffect,
        reputationEffect: c.reputationEffect,
        performanceEffect: c.performanceEffect,
        requiresMath: c.requiresMath,
        mathsCorrectBudgetEffect: c.mathsCorrectBudgetEffect,
        mathsWrongBudgetEffect: c.mathsWrongBudgetEffect,
      })),
      resolved: false,
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
  const targets = state.club.squad.filter(p => computeOverallRating(p) >= 55);
  if (targets.length === 0) return [];

  // Check if a poach event is already pending (one at a time)
  const poachPending = state.pendingEvents.some(
    e => e.templateId === 'npc-poach' && !e.resolved
  );
  if (poachPending) return [];

  // Pick a random target, weighted by overallRating × unsettled multiplier.
  // Unsettled players (morale < 20) are 3× more likely to be approached.
  const UNSETTLED_POACH_MULT = 3;
  const weightOf = (p: typeof targets[0]) =>
    computeOverallRating(p) * (isUnsettled(p) ? UNSETTLED_POACH_MULT : 1);
  const totalWeight = targets.reduce((sum, p) => sum + weightOf(p), 0);
  let pick = rng.next() * totalWeight;
  const target = targets.find(p => {
    pick -= weightOf(p);
    return pick <= 0;
  }) ?? targets[targets.length - 1];

  // Roll per-player chance
  if (rng.next() > poachChance(computeOverallRating(target))) return [];

  // Pick a random NPC club (not the player's own club)
  const npcClubs = getTeamsForDivision(state.division).filter(t => t.id !== state.club.id);
  const npcClub = npcClubs[rng.nextInt(0, npcClubs.length - 1)];

  const fee = offeredFee(target.wage, computeOverallRating(target));
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
      playerName: target.name,
      playerPosition: target.position,
      playerOverall: computeOverallRating(target),
      playerWage: target.wage,
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
        description: `Turn down the offer. ${target.name} stays, but may be unsettled.`,
        moraleEffect: -15,
      },
      {
        id: 'counter',
        label: `Counter at ${counterFeeStr}`,
        description: `Demand 50% more. ${npcClub.name} agrees. ${target.name} moves on for a premium fee.`,
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

// ── Morale threshold events ────────────────────────────────────────────────────

const MORALE_TEMPLATE_IDS = {
  UNREST:         'morale-unrest',
  LOSING_FAITH:   'morale-losing-faith',
  UNSETTLED:      'morale-unsettled-player',
} as const;

/**
 * Generate 0–1 morale-based threshold events for the current week.
 * Uses `state.moraleEventCooldowns` for precise week-based cooldowns.
 *
 * Priority order (only one fires per week):
 *   1. Individual unsettled player (morale < 20) — minor
 *   2. Squad avg morale < 30 — "Dressing Room Unrest"  — major
 *   3. Squad avg morale < 40 for 3+ consecutive weeks  — "Losing Faith" — major
 */
export function generateMoraleThresholdEvents(
  state: GameState,
  week: number,
  season: number
): PendingClubEvent[] {
  if (state.phase === 'PRE_SEASON' || state.phase === 'SEASON_END') return [];
  if (state.club.squad.length === 0) return [];

  const cooldowns = state.moraleEventCooldowns ?? {};

  function onCooldown(templateId: string): boolean {
    if (state.pendingEvents.some(e => e.templateId === templateId && !e.resolved)) return true;
    const expires = cooldowns[templateId] ?? 0;
    return week < expires;
  }

  const avg = avgSquadMorale(state.club.squad);

  // ── 1. Individual unsettled player ────────────────────────────────────────
  if (!onCooldown(MORALE_TEMPLATE_IDS.UNSETTLED)) {
    const unsettledPlayers = state.club.squad.filter(p => isUnsettled(p));
    if (unsettledPlayers.length > 0) {
      // Pick the most unsettled player
      const target = unsettledPlayers.reduce((a, b) => a.morale < b.morale ? a : b);
      const event: PendingClubEvent = {
        id: `evt-S${season}-W${week}-morale-unsettled`,
        templateId: MORALE_TEMPLATE_IDS.UNSETTLED,
        week,
        title: `${target.name} is unsettled`,
        description: `${target.name}'s morale has dropped to ${target.morale}. They're visibly disengaged in training. You need to act before it infects the rest of the dressing room.`,
        severity: 'minor',
        choices: [
          {
            id: 'team-talk',
            label: 'Pull them aside for a talk',
            description: `Spend time with ${target.name} one-on-one. Morale boost of +15, but it takes up coaching time.`,
            moraleEffect: 15,
          },
          {
            id: 'pay-rise',
            label: 'Offer a pay rise',
            description: `Bump ${target.name}'s weekly wage. Costs more but secures their commitment.`,
            moraleEffect: 20,
            budgetEffect: -Math.round(target.wage * 0.15 * 10), // 10 weeks' uplift upfront
          },
          {
            id: 'list',
            label: 'Put them on the transfer list',
            description: `Signal to the market that ${target.name} is available. Morale stays low but a sale may be coming.`,
            moraleEffect: -5,
          },
        ],
        resolved: false,
        metadata: { poachTargetPlayerId: target.id },
      };
      return [event];
    }
  }

  // ── 2. Dressing room unrest (avg < 30) ────────────────────────────────────
  if (!onCooldown(MORALE_TEMPLATE_IDS.UNREST) && avg < 30) {
    const event: PendingClubEvent = {
      id: `evt-S${season}-W${week}-morale-unrest`,
      templateId: MORALE_TEMPLATE_IDS.UNREST,
      week,
      title: 'Dressing room unrest',
      description: `Squad morale has collapsed to ${Math.round(avg)}. Players are openly questioning the direction of the club. You need to act immediately.`,
      severity: 'major',
      choices: [
        {
          id: 'emergency-talk',
          label: 'Emergency team meeting',
          description: 'Address the squad directly. Costs £3,000 in bonuses and extra sessions, but lifts morale by +15 across the board.',
          budgetEffect: -300000,
          moraleEffect: 15,
        },
        {
          id: 'reshuffle-training',
          label: 'Reshuffle training schedule',
          description: 'Change the training focus and inject some variety. Morale nudged up by +8, no cost.',
          moraleEffect: 8,
        },
        {
          id: 'do-nothing',
          label: 'Hold firm. Results will turn it around',
          description: "Say nothing publicly. The squad interprets silence as indifference.",
          reputationEffect: -5,
        },
      ],
      resolved: false,
    };
    return [event];
  }

  // ── 3. Losing faith (avg < 40 for 3+ consecutive weeks) ──────────────────
  if (
    !onCooldown(MORALE_TEMPLATE_IDS.LOSING_FAITH) &&
    avg < 40 &&
    (state.lowMoraleWeeks ?? 0) >= 3
  ) {
    const event: PendingClubEvent = {
      id: `evt-S${season}-W${week}-morale-losing-faith`,
      templateId: MORALE_TEMPLATE_IDS.LOSING_FAITH,
      week,
      title: 'Players are losing faith in the manager',
      description: `Squad morale has been below 40 for ${state.lowMoraleWeeks} consecutive weeks. Senior players have been seen talking to their agents. The board is watching.`,
      severity: 'major',
      choices: [
        {
          id: 'vote-confidence',
          label: 'Issue a public vote of confidence',
          description: 'The board publicly backs the manager. Morale edges up +10, but if results don\'t improve the next board review will be brutal.',
          moraleEffect: 10,
          reputationEffect: 3,
        },
        {
          id: 'change-emphasis',
          label: 'Change the team\'s training emphasis',
          description: 'Visibly change approach, different formations, fresh drills. Morale +6 across the squad.',
          moraleEffect: 6,
        },
        {
          id: 'sack-hint',
          label: 'Hint that changes may be coming',
          description: 'Signal the manager is under pressure. Players respond positively to accountability (+8 morale) but the manager\'s authority is damaged.',
          moraleEffect: 8,
          reputationEffect: -3,
        },
      ],
      resolved: false,
    };
    return [event];
  }

  return [];
}

// ── Financial threshold event IDs ────────────────────────────────────────────

export const FINANCIAL_THRESHOLD_TEMPLATE_IDS = new Set([
  'val-runway-amber',
  'val-runway-red',
  'val-runway-critical',
  'val-runway-recovery',
]);

// Band severity order: higher index = better financial health
const BAND_ORDER = ['CRITICAL', 'RED', 'AMBER', 'GREEN', 'SURPLUS'] as const;
type RunwayBand = 'SURPLUS' | 'GREEN' | 'AMBER' | 'RED' | 'CRITICAL';

function bandIndex(b: RunwayBand): number {
  return BAND_ORDER.indexOf(b);
}

/**
 * Generate 0–1 Val Okoro inbox cards when the runway band crosses a threshold.
 *
 * Fires on:
 *   - deterioration:  SURPLUS/GREEN → AMBER, AMBER → RED, RED → CRITICAL
 *   - recovery:       CRITICAL/RED → AMBER or better
 *
 * "Once per crossing" — skips if an unresolved financial threshold card is already pending.
 */
export function generateFinancialThresholdEvents(
  state: GameState,
  week: number,
  season: number,
  currentBand: RunwayBand,
  runway: number
): PendingClubEvent[] {
  if (state.phase === 'PRE_SEASON' || state.phase === 'SEASON_END') return [];

  const previousBand: RunwayBand = state.lastRunwayBand ?? currentBand;
  if (previousBand === currentBand) return [];

  // Don't stack — skip if an unresolved financial threshold card is already in the inbox
  if (state.pendingEvents.some(
    e => FINANCIAL_THRESHOLD_TEMPLATE_IDS.has(e.templateId) && !e.resolved
  )) return [];

  const prevIdx = bandIndex(previousBand);
  const currIdx = bandIndex(currentBand);
  const deteriorating = currIdx < prevIdx;
  const recovering    = currIdx > prevIdx;

  const runwayDisplay = isFinite(runway) ? `${Math.round(runway)} weeks` : 'a surplus';

  if (deteriorating) {
    if (currentBand === 'AMBER') {
      return [{
        id: `evt-S${season}-W${week}-val-runway-amber`,
        templateId: 'val-runway-amber',
        week,
        title: 'Financial warning — amber zone',
        description: `Our runway is down to ${runwayDisplay} at current burn rate. We're not in crisis yet, but if the wage bill stays where it is we'll be in the red within a few months. Time to keep a close eye on the spend.`,
        severity: 'minor',
        npc: 'val',
        choices: [
          {
            id: 'acknowledge',
            label: 'Noted. I\'ll watch the wage bill',
            description: 'Acknowledge the warning. No immediate action required.',
          },
          {
            id: 'review-wages',
            label: 'Ask Val for a full wage review',
            description: 'Request a detailed breakdown to identify where savings can be made.',
            reputationEffect: -2,
          },
        ],
        resolved: false,
      }];
    }

    if (currentBand === 'RED') {
      return [{
        id: `evt-S${season}-W${week}-val-runway-red`,
        templateId: 'val-runway-red',
        week,
        title: 'Financial alert — red zone',
        description: `Runway has dropped to ${runwayDisplay}. At current burn rate we're less than 10 weeks from running dry. We need to make some decisions, either cut costs or bring money in.`,
        severity: 'major',
        npc: 'val',
        choices: [
          {
            id: 'sell-player',
            label: 'I\'ll look at selling a player',
            description: 'Commit to listing a player. Transfer income could buy several more months of runway.',
            reputationEffect: -3,
          },
          {
            id: 'cut-wages',
            label: 'Start wage negotiations',
            description: 'Attempt to renegotiate contracts. Some players may push back.',
            moraleEffect: -5,
          },
          {
            id: 'hold-nerve',
            label: 'Hold for now. Form will turn it around',
            description: 'Results on the pitch drive morale and attendance. Risky if form doesn\'t improve.',
          },
        ],
        resolved: false,
      }];
    }

    if (currentBand === 'CRITICAL') {
      return [{
        id: `evt-S${season}-W${week}-val-runway-critical`,
        templateId: 'val-runway-critical',
        week,
        title: 'URGENT — less than 5 weeks of cash',
        description: `Runway has collapsed to ${runwayDisplay}. I'm not being dramatic. We are weeks from not being able to pay wages. Emergency action is needed now.`,
        severity: 'major',
        npc: 'val',
        choices: [
          {
            id: 'emergency-sale',
            label: 'Authorise an emergency player sale',
            description: 'Accept below-value offers to generate cash fast. The market knows you\'re desperate.',
            reputationEffect: -5,
            budgetEffect: 0,
          },
          {
            id: 'board-emergency',
            label: 'Request emergency board funding',
            description: 'The board may step in, but they\'ll expect results and will monitor everything more closely.',
            reputationEffect: -8,
            budgetEffect: 50000_00, // £50k emergency injection
          },
          {
            id: 'hope',
            label: 'Hold on. We just need one big result',
            description: 'The gambler\'s last stand. If things don\'t turn around, this is how clubs get taken over.',
          },
        ],
        resolved: false,
      }];
    }
  }

  if (recovering) {
    const newBandLabel = currentBand === 'SURPLUS' ? 'a surplus' :
                         currentBand === 'GREEN'   ? 'the green zone' :
                         'the amber zone';
    return [{
      id: `evt-S${season}-W${week}-val-runway-recovery`,
      templateId: 'val-runway-recovery',
      week,
      title: 'Financial update — runway improving',
      description: `Good news, we\'re back in ${newBandLabel} (${runwayDisplay} runway). The finances are looking more stable. Keep it up.`,
      severity: 'minor',
      npc: 'val',
      choices: [
        {
          id: 'acknowledge',
          label: 'Good to hear',
          description: 'Note the improvement and continue as planned.',
        },
      ],
      resolved: false,
    }];
  }

  return [];
}

// ── Dani facility observation IDs ─────────────────────────────────────────────

export const DANI_OBSERVATION_TEMPLATE_IDS = new Set([
  'dani-facility-observation',
]);

// Per-facility observation copy — Dani's voice: practical, dry, observational.
// Each entry: { title, observation } where [TEAM] is replaced at runtime.
const FACILITY_OBSERVATIONS: Record<string, { title: string; observation: string }> = {
  TRAINING_GROUND: {
    title: '[TEAM] invest in their Training Ground',
    observation: `I've been watching [TEAM] in training. They've put money into the facilities, structured pitches, proper equipment. You can see it in how their sessions run. Doesn't make bad players good, but it makes good players better. Worth keeping in mind.`,
  },
  MEDICAL_CENTER: {
    title: '[TEAM] upgrade their Medical Centre',
    observation: `[TEAM] have a proper Medical Centre now. Physio on site, decent recovery equipment. They're coming back from knocks faster than they should. We're managing injuries with what we've got, which is fine until it isn't.`,
  },
  YOUTH_ACADEMY: {
    title: '[TEAM] open a Youth Academy',
    observation: `[TEAM] have put money into an Academy. Won't pay off this season, probably not next either. But they're thinking three or four years ahead. If we want our own pipeline of players eventually, it starts with something like that.`,
  },
  STADIUM: {
    title: '[TEAM] expand the stadium',
    observation: `[TEAM] are adding seats. More capacity means more matchday revenue, simple as that. The atmosphere will be better too, which matters more than people think. We'd need the fanbase to justify it, but it's on the list.`,
  },
  CLUB_COMMERCIAL: {
    title: '[TEAM] build out their Commercial Centre',
    observation: `[TEAM] have a proper commercial operation now, sponsorship deals, kit partnerships, media rights. They're pulling in money we can't compete with yet. That kind of infrastructure takes time to build, but it compounds.`,
  },
  FOOD_AND_BEVERAGE: {
    title: '[TEAM] overhaul their catering',
    observation: `[TEAM] have sorted their matchday catering. Sounds trivial but fans spend money before and after games, not just on tickets. Their revenue per head on matchdays has apparently gone up noticeably. Small things add up.`,
  },
  FAN_ZONE: {
    title: '[TEAM] open a Fan Zone',
    observation: `[TEAM] have built out a fan zone, bar area, merchandise, somewhere to gather before games. The pre-match atmosphere is different. Fans stay longer, spend more, feel more connected to the club. It's a slow build but the intent is clear.`,
  },
  GROUNDS_SECURITY: {
    title: '[TEAM] sort out their front-of-house',
    observation: `[TEAM] have upgraded their ticketing and turnstiles. Less queuing, better crowd flow. It's unglamorous work but when it's wrong everyone notices. When it's right, no one says anything, which is kind of the point.`,
  },
  SCOUT_NETWORK: {
    title: '[TEAM] invest in their Scout Network',
    observation: `[TEAM] are building out their scouting operation, more coverage, better data on players. They'll know about good free agents before we do if we're not careful. Scouting is one of those things where the gap compounds quietly.`,
  },
};

/**
 * Generate 0–1 Dani Lopes inbox observation about a rival club's facility
 * investment. Fires roughly once every 6–8 weeks, seeded so it's deterministic.
 *
 * One unresolved observation at a time — doesn't stack.
 * Skips PRE_SEASON and SEASON_END.
 */
export function generateDaniFacilityObservationEvents(
  state: GameState,
  week: number,
  season: number,
  seed: string
): PendingClubEvent[] {
  if (state.phase === 'PRE_SEASON' || state.phase === 'SEASON_END') return [];
  if (week === 0) return [];

  // Don't stack — skip if an unresolved observation is already in the inbox
  if (state.pendingEvents.some(
    e => DANI_OBSERVATION_TEMPLATE_IDS.has(e.templateId) && !e.resolved
  )) return [];

  // Seeded gate: roughly 1-in-7 chance per week (≈ once every 6–8 weeks)
  const rng = createRng(`${seed}-S${season}-W${week}-dani-obs`);
  if (rng.next() > 1 / 7) return [];

  // Pick a rival NPC team from the league (exclude the player's club)
  const npcEntries = state.league.entries.filter(e => e.clubId !== state.club.id);
  if (npcEntries.length === 0) return [];
  const teamEntry = npcEntries[Math.floor(rng.next() * npcEntries.length)];
  const teamName = teamEntry.clubName;

  // Pick a facility to observe — excludes CLUB_OFFICE (too administrative)
  const observableFacilities = Object.keys(FACILITY_OBSERVATIONS);
  const facilityKey = observableFacilities[Math.floor(rng.next() * observableFacilities.length)];
  const obs = FACILITY_OBSERVATIONS[facilityKey];

  const title = obs.title.replace('[TEAM]', teamName);
  const description = obs.observation.replace(/\[TEAM\]/g, teamName);

  return [{
    id: `evt-S${season}-W${week}-dani-obs`,
    templateId: 'dani-facility-observation',
    week,
    title,
    description,
    severity: 'minor',
    npc: 'dani',
    choices: [
      {
        id: 'noted',
        label: 'Noted. I\'ll keep an eye on it',
        description: 'File it away. No immediate action required.',
      },
    ],
    resolved: false,
  }];
}

// ── NPC match reaction messages ──────────────────────────────────────────────

export const NPC_REACTION_TEMPLATE_IDS = new Set([
  'npc-match-reaction',
]);

interface MatchContext {
  result: 'W' | 'D' | 'L';
  goalsFor: number;
  goalsAgainst: number;
  opponentName: string;
  form: ('W' | 'D' | 'L')[];
  leaguePosition: number;
}

// Kev — football-obsessed, warm, occasionally over-enthusiastic
const KEV_REACTIONS = {
  big_win: [
    "That's what I'm talking about. {goals} goals, boss. The lads put on a show against {opponent}. If we can keep this up, we'll be in the conversation come April.",
    "Brilliant. Absolutely brilliant. {opponent} didn't know what hit them. This is the kind of result that changes a season.",
    "The boys were outstanding today. {goals} goals and they ran {opponent} ragged. You could hear the crowd lifting them. More of that, please.",
  ],
  win: [
    "Job done against {opponent}. Not always pretty but three points is three points. The lads are starting to believe.",
    "Good result. {opponent} are no mugs either. I'm pleased with that.",
    "Solid win. The squad's in a good place right now. Keep backing them and they'll keep delivering.",
  ],
  draw: [
    "Frustrating one, that. We had chances against {opponent} but couldn't find the finish. Not the end of the world, but draws don't win leagues.",
    "A point. Could've been three, could've been none. {opponent} made it hard for us. We go again next week.",
  ],
  loss: [
    "Tough day. {opponent} were the better side and I won't pretend otherwise. We need to regroup.",
    "Disappointing. The players know it too. Sometimes it goes against you. The important thing is how we respond.",
  ],
  bad_loss: [
    "That was painful. {goals_against} goals conceded. I've spoken to the lads, they know that's not acceptable. We need to sort the defence out sharpish.",
    "Won't sugarcoat it. {opponent} took us apart. I'm angry, the players are angry. We owe the fans better than that.",
  ],
  winning_streak: [
    "That's {streak} in a row now. Don't say it out loud in case we jinx it, but this run of form is exactly what promotion pushes are made of.",
    "Another win. {streak} straight. The confidence in the dressing room is sky high. Even the reserves are training like their lives depend on it.",
  ],
  losing_streak: [
    "I'm not going to panic and neither should you, but {streak} losses on the bounce is... it's not great. The lads need a lift.",
    "We're in a rut. {streak} losses. Heads are dropping and I can see it in training. We might need to do something, a new face, a tactical change, something.",
  ],
};

// Val — sharp, commercial, never wastes words
const VAL_REACTIONS = {
  big_win: [
    "Nice result. Gate receipts will be healthy after that. Winning breeds attendance.",
    "Good for the spreadsheet, that. Wins like this against {opponent} keep the sponsors interested.",
  ],
  loss: [
    "I've seen the attendance figures trend after runs like this. People stop showing up. Results matter to the bottom line, not just the table.",
  ],
  bad_loss: [
    "I'm already fielding calls from the board. Results like that against {opponent} don't just cost points, they cost confidence. And confidence costs money.",
  ],
  winning_streak: [
    "The commercial team have had three sponsorship enquiries this week. Funny how that works. Win games, make money. Keep it going.",
  ],
  losing_streak: [
    "Two season ticket holders have asked for refunds. I talked them down, but if this run continues I won't be able to. Results affect revenue. Fix it.",
  ],
};

// Marcus — warm, enthusiastic, fan-focused
const MARCUS_REACTIONS = {
  big_win: [
    "Boss! The social media numbers after that game are through the roof. {goals} goals against {opponent}! The fans are buzzing, I've got enquiries about hospitality packages already.",
    "What a result! The fan forum is going wild. This is exactly the kind of performance that builds a fanbase. People will remember days like this.",
  ],
  loss: [
    "The fan mood's taken a hit after {opponent}. I'll put something positive on the socials but the best PR is a result on Saturday.",
  ],
  winning_streak: [
    "The fans are singing your name on the forums. {streak} wins in a row! I'm putting together a matchday special offer to ride the wave. Momentum is everything.",
  ],
  losing_streak: [
    "I'll be honest, the fan engagement numbers are down. People go quiet when results are bad. A win would do more than any marketing campaign right now.",
  ],
};

function pickReaction(templates: string[], rng: { next: () => number }): string {
  return templates[Math.floor(rng.next() * templates.length)];
}

function fillReaction(
  template: string,
  ctx: MatchContext,
  streak?: number,
): string {
  return template
    .replace(/\{opponent\}/g, ctx.opponentName)
    .replace(/\{goals\}/g, String(ctx.goalsFor))
    .replace(/\{goals_against\}/g, String(ctx.goalsAgainst))
    .replace(/\{streak\}/g, String(streak ?? 0));
}

/**
 * Generate 0–1 NPC reaction inbox cards after notable match results.
 *
 * Notable = big win (3+ goals), bad loss (3+ conceded), or form streak (3+ W/L).
 * Each NPC has a distinct voice. Only one reacts per week (seeded pick).
 * Won't stack — skips if an unresolved reaction card is already pending.
 * Roughly 60% chance of firing on a notable result (to avoid every week).
 */
export function generateNpcMatchReactionEvents(
  state: GameState,
  week: number,
  season: number,
  seed: string,
  matchResult: MatchContext,
): PendingClubEvent[] {
  if (state.phase === 'PRE_SEASON' || state.phase === 'SEASON_END') return [];

  // Don't stack
  if (state.pendingEvents.some(
    e => NPC_REACTION_TEMPLATE_IDS.has(e.templateId) && !e.resolved
  )) return [];

  const rng = createRng(`${seed}-S${season}-W${week}-npc-reaction`);

  // Determine the form streak length
  const form = matchResult.form;
  const lastResult = form[form.length - 1];
  let streak = 0;
  for (let i = form.length - 1; i >= 0; i--) {
    if (form[i] === lastResult) streak++;
    else break;
  }

  // Classify the result
  type Scenario = 'big_win' | 'win' | 'draw' | 'loss' | 'bad_loss' | 'winning_streak' | 'losing_streak';
  let scenario: Scenario | null = null;

  if (streak >= 3 && lastResult === 'W') scenario = 'winning_streak';
  else if (streak >= 3 && lastResult === 'L') scenario = 'losing_streak';
  else if (matchResult.result === 'W' && matchResult.goalsFor >= 3) scenario = 'big_win';
  else if (matchResult.result === 'L' && matchResult.goalsAgainst >= 3) scenario = 'bad_loss';
  else if (matchResult.result === 'W') scenario = 'win';
  else if (matchResult.result === 'L') scenario = 'loss';
  else if (matchResult.result === 'D') scenario = 'draw';

  if (!scenario) return [];

  // Only fire on notable results (skip ordinary wins/draws/losses ~60% of the time)
  const isNotable = ['big_win', 'bad_loss', 'winning_streak', 'losing_streak'].includes(scenario);
  if (!isNotable && rng.next() > 0.4) return [];

  // Pick which NPC reacts (weighted by scenario relevance)
  type NpcId = 'kev' | 'val' | 'marcus';
  const candidates: { npc: NpcId; templates: string[] }[] = [];

  // Kev always has something to say about football
  const kevPool = KEV_REACTIONS[scenario as keyof typeof KEV_REACTIONS];
  if (kevPool) candidates.push({ npc: 'kev', templates: kevPool });

  // Val speaks up on big results and streaks
  const valPool = VAL_REACTIONS[scenario as keyof typeof VAL_REACTIONS];
  if (valPool) candidates.push({ npc: 'val', templates: valPool });

  // Marcus reacts to fan-facing moments
  const marcusPool = MARCUS_REACTIONS[scenario as keyof typeof MARCUS_REACTIONS];
  if (marcusPool) candidates.push({ npc: 'marcus', templates: marcusPool });

  if (candidates.length === 0) return [];

  // Kev gets higher weight for football scenarios
  const weighted: typeof candidates = [];
  for (const c of candidates) {
    weighted.push(c);
    if (c.npc === 'kev') weighted.push(c); // double weight for Kev
  }

  const picked = weighted[Math.floor(rng.next() * weighted.length)];
  const template = pickReaction(picked.templates, rng);
  const text = fillReaction(template, matchResult, streak);

  const NPC_NAMES: Record<NpcId, string> = {
    kev: 'Kev Mulligan',
    val: 'Val Okoro',
    marcus: 'Marcus Webb',
  };

  const scenarioTitles: Record<Scenario, string> = {
    big_win: `${NPC_NAMES[picked.npc]} on the big win`,
    win: `${NPC_NAMES[picked.npc]} on the result`,
    draw: `${NPC_NAMES[picked.npc]} on the draw`,
    loss: `${NPC_NAMES[picked.npc]} on the defeat`,
    bad_loss: `${NPC_NAMES[picked.npc]} on the heavy defeat`,
    winning_streak: `${NPC_NAMES[picked.npc]} on the winning run`,
    losing_streak: `${NPC_NAMES[picked.npc]} on the losing run`,
  };

  return [{
    id: `evt-S${season}-W${week}-npc-reaction`,
    templateId: 'npc-match-reaction',
    week,
    title: scenarioTitles[scenario],
    description: text,
    severity: 'minor',
    npc: picked.npc,
    choices: [
      {
        id: 'noted',
        label: scenario.includes('win') || scenario === 'draw'
          ? 'Thanks. Let\'s keep pushing'
          : 'Understood. We\'ll turn it around',
        description: 'Acknowledge and move on.',
      },
    ],
    resolved: false,
  }];
}
