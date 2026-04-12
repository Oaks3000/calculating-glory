import React, { useState } from 'react';
import {
  GameState,
  GameEvent,
  GameCommand,
  PendingClubEvent,
  generateNpcMessages,
  computeWeeklyFinancials,
  formatMoney,
  isTransferWindowOpen,
  NpcMessage,
} from '@calculating-glory/domain';
import { NewsTicker } from '../command-centre/NewsTicker';
import { SlideOver } from '../shared/SlideOver';
import { SocialFeed } from '../social-feed/SocialFeed';
import { LearningProgressSlideOver } from '../command-centre/LearningProgressSlideOver';
import { PendingEventCard } from '../command-centre/PendingEventCard';

// ── NPC display config ────────────────────────────────────────────────────────

interface NpcDisplayConfig {
  id: string;
  name: string;
  role: string;
  avatarClass: string;
  nameClass: string;
}

const NPC_CAST: NpcDisplayConfig[] = [
  { id: 'val',    name: 'Val Okoro',    role: 'Finance Director',   avatarClass: 'bg-warn-amber/20 text-warn-amber',   nameClass: 'text-warn-amber'   },
  { id: 'kev',    name: 'Kev Mulligan', role: 'Head of Football',   avatarClass: 'bg-data-blue/20 text-data-blue',     nameClass: 'text-data-blue'    },
  { id: 'marcus', name: 'Marcus Webb',  role: 'Commercial Director',avatarClass: 'bg-pitch-green/20 text-pitch-green', nameClass: 'text-pitch-green'  },
  { id: 'dani',   name: 'Dani Osei',    role: 'Head of Operations', avatarClass: 'bg-alert-red/20 text-alert-red',     nameClass: 'text-alert-red'    },
];

// ── Utility formatters ────────────────────────────────────────────────────────

function fmtMoney(pence: number): string {
  const p = Math.abs(pence);
  if (p >= 1_000_000_00) return `£${(pence / 1_000_000_00).toFixed(1)}m`;
  if (p >= 1_000_00)     return `£${Math.round(pence / 1_000_00)}k`;
  return `£${Math.round(pence / 100)}`;
}

function fmtRunway(weeks: number): string {
  if (weeks === Infinity) return '∞';
  if (weeks > 99) return '99+w';
  return `${Math.floor(weeks)}w`;
}

// ── Priority pip colour ───────────────────────────────────────────────────────

type PipColour = 'red' | 'amber' | 'blue' | 'green';

const PIP_CLASSES: Record<PipColour, string> = {
  red:   'bg-alert-red',
  amber: 'bg-warn-amber',
  blue:  'bg-data-blue',
  green: 'bg-pitch-green',
};

function Pip({ colour }: { colour: PipColour }) {
  return (
    <div className={`w-2 h-2 rounded-sm shrink-0 mt-1.5 ${PIP_CLASSES[colour]}`} />
  );
}

// ── Zone spotlight overlay ────────────────────────────────────────────────────

function SpotlightOverlay({ zoneId, spotlight }: { zoneId: string; spotlight?: string | null }) {
  if (spotlight === undefined) return null;
  const visible = spotlight === null || spotlight === zoneId;
  return (
    <div
      className="absolute inset-0 bg-bg-deep/85 backdrop-blur-sm pointer-events-none z-10 transition-opacity duration-700"
      style={{ opacity: visible ? 0 : 1 }}
    />
  );
}

// ── Zone wrapper ──────────────────────────────────────────────────────────────

function Zone({
  id,
  children,
  className = '',
  spotlight,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  spotlight?: string | null;
}) {
  return (
    <div className={`relative flex flex-col overflow-hidden border-r border-bg-raised/40 last:border-r-0 ${className}`}>
      <SpotlightOverlay zoneId={id} spotlight={spotlight} />
      {children}
    </div>
  );
}

// ── Compact league table ──────────────────────────────────────────────────────

function CompactLeague({
  entries,
  playerClubId,
  onViewAll,
}: {
  entries: import('@calculating-glory/domain').LeagueTableEntry[];
  playerClubId: string;
  onViewAll: () => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-card border border-bg-raised px-3 py-3 text-xs2 text-txt-muted italic">
        Season not started
      </div>
    );
  }

  const playerIdx = entries.findIndex(e => e.clubId === playerClubId);
  const playerEntry = playerIdx >= 0 ? entries[playerIdx] : null;

  // Build neighbourhood: top 3 + player ±1 (deduplicated, sorted)
  const idxSet = new Set<number>([0, 1, 2].filter(i => i < entries.length));
  if (playerIdx >= 0) {
    if (playerIdx > 0)                   idxSet.add(playerIdx - 1);
    idxSet.add(playerIdx);
    if (playerIdx < entries.length - 1)  idxSet.add(playerIdx + 1);
  }
  const sortedIndices = [...idxSet].sort((a, b) => a - b);

  // Precompute rows with gap markers — no mutable variable inside JSX
  type Row = { key: string; entry: typeof entries[0]; isPlayer: boolean; showGap: boolean };
  const rows: Row[] = sortedIndices.reduce<Row[]>((acc, idx) => {
    const entry = entries[idx];
    if (!entry) return acc;
    const prev = acc[acc.length - 1];
    const prevOrigIdx = prev ? sortedIndices[acc.length - 1] : -1;
    const showGap = prev !== undefined && idx > prevOrigIdx + 1;
    acc.push({ key: entry.clubId, entry, isPlayer: entry.clubId === playerClubId, showGap });
    return acc;
  }, []);

  return (
    <div className="rounded-card border border-bg-raised overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-bg-raised/40 border-b border-bg-raised">
        <span className="text-xs2 font-semibold text-txt-muted uppercase tracking-wider">League</span>
        {playerEntry && (
          <span className="text-xs2 text-data-blue font-semibold">
            {playerEntry.position}/{entries.length}
          </span>
        )}
      </div>

      <table className="w-full text-xs data-font">
        <tbody>
          {rows.map(({ key, entry, isPlayer, showGap }) => (
            <React.Fragment key={key}>
              {showGap && (
                <tr>
                  <td colSpan={4} className="py-0.5 px-3">
                    <div className="border-t border-dashed border-bg-raised/60" />
                  </td>
                </tr>
              )}
              <tr
                className={[
                  'border-b border-bg-raised/30 last:border-b-0',
                  isPlayer ? 'bg-data-blue/10 text-txt-primary font-semibold' : 'text-txt-muted',
                ].join(' ')}
              >
                <td className="py-1.5 pl-3 pr-2 w-7 text-right tabular-nums">{entry.position}</td>
                <td className="py-1.5 truncate max-w-[100px]">
                  {isPlayer ? `▶ ${entry.clubName}` : entry.clubName}
                </td>
                <td className="py-1.5 pr-2 text-right tabular-nums w-6">{entry.played}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums w-8 font-bold text-txt-primary">
                  {entry.points}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <button
        onClick={onViewAll}
        className="w-full py-1.5 text-xs2 text-data-blue hover:text-data-blue/80 border-t border-bg-raised/40 transition-colors"
      >
        View full table →
      </button>
    </div>
  );
}

// ── Full league table modal ───────────────────────────────────────────────────

function LeagueModal({
  entries,
  playerClubId,
  onClose,
}: {
  entries: import('@calculating-glory/domain').LeagueTableEntry[];
  playerClubId: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-bg-deep/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="card max-w-sm w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-txt-muted uppercase tracking-wider">Full League Table</h2>
          <button onClick={onClose} className="text-txt-muted hover:text-txt-primary text-sm">✕</button>
        </div>
        <table className="w-full text-xs data-font">
          <thead>
            <tr className="text-txt-muted border-b border-bg-raised">
              <th className="text-right pr-2 pb-1 w-6">#</th>
              <th className="text-left pb-1">Club</th>
              <th className="text-right pr-1 pb-1 w-6">P</th>
              <th className="text-right pr-2 pb-1 w-8">GD</th>
              <th className="text-right pr-2 pb-1 w-8">Pts</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => {
              const isPlayer = entry.clubId === playerClubId;
              return (
                <tr
                  key={entry.clubId}
                  className={[
                    'border-b border-bg-raised/50',
                    isPlayer ? 'bg-data-blue/10 text-txt-primary font-semibold' : 'text-txt-muted',
                  ].join(' ')}
                >
                  <td className="text-right pr-2 py-1 tabular-nums">{entry.position}</td>
                  <td className="py-1 truncate max-w-[120px]">{isPlayer ? `▶ ${entry.clubName}` : entry.clubName}</td>
                  <td className="text-right pr-1 py-1 tabular-nums">{entry.played}</td>
                  <td className={['text-right pr-2 py-1 tabular-nums', entry.goalDifference > 0 ? 'text-pitch-green' : entry.goalDifference < 0 ? 'text-alert-red' : ''].join(' ')}>
                    {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                  </td>
                  <td className="text-right pr-2 py-1 font-bold tabular-nums text-txt-primary">{entry.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Staff panel ───────────────────────────────────────────────────────────────

interface StaffStatus {
  hasAlert: boolean;
  status: string;
}

function deriveStaffStatus(npcId: string, state: GameState): StaffStatus {
  const { weeklyWages, weeklyIncome } = computeWeeklyFinancials(state);
  const runway = weeklyWages > weeklyIncome
    ? state.club.wageReserve / (weeklyWages - weeklyIncome)
    : Infinity;

  const unresolvedEvents = state.pendingEvents.filter(e => !e.resolved);
  const hasTransferEvents = unresolvedEvents.some(
    e => e.metadata?.eventKind === 'poach' || e.metadata?.eventKind === 'bid'
  );
  const hasMathChallenge = unresolvedEvents.some(e => e.choices.some(c => c.requiresMath));
  const constructing = state.club.facilities.some(f => (f.constructionWeeksRemaining ?? 0) > 0);
  const avgMorale = state.club.squad.length > 0
    ? state.club.squad.reduce((s, p) => s + (p.morale ?? 50), 0) / state.club.squad.length
    : 50;

  switch (npcId) {
    case 'val':
      if (runway < 5)  return { hasAlert: true,  status: 'urgent: wage reserves critical' };
      if (runway < 10) return { hasAlert: true,  status: 'wage reserves running low' };
      return { hasAlert: false, status: 'finances on track' };

    case 'kev':
      if (hasTransferEvents) return { hasAlert: true, status: 'transfer activity to discuss' };
      return { hasAlert: false, status: 'watching the market' };

    case 'marcus':
      if (hasMathChallenge)  return { hasAlert: true,  status: 'training session ready' };
      if (avgMorale < 40)    return { hasAlert: true,  status: 'squad morale needs attention' };
      return { hasAlert: false, status: 'squad in good shape' };

    case 'dani':
      if (constructing) return { hasAlert: true, status: 'construction in progress' };
      return { hasAlert: false, status: 'stadium all good' };

    default:
      return { hasAlert: false, status: 'available' };
  }
}

// ── Agenda panel ──────────────────────────────────────────────────────────────

interface AgendaItem {
  weekLabel: string;
  text: string;
}

function buildAgendaItems(state: GameState): AgendaItem[] {
  const items: AgendaItem[] = [];
  const currentWeek = state.currentWeek;

  // Next match (always show if season is active)
  if (currentWeek < 46) {
    const nextWeek = currentWeek + 1;
    items.push({
      weekLabel: `W${nextWeek}`,
      text: 'League Two fixture',
    });
  }

  // Transfer window closing
  const windowOpen = isTransferWindowOpen(currentWeek, state.phase);
  if (windowOpen) {
    // Summer window: weeks 1–6; January window: weeks 24–28
    const phase = state.phase;
    let closingWeek: number | null = null;
    if (phase === 'PRE_SEASON' || (phase === 'EARLY_SEASON' && currentWeek <= 6)) {
      closingWeek = 6;
    } else if (phase === 'MID_SEASON' && currentWeek >= 24 && currentWeek <= 28) {
      closingWeek = 28;
    }
    if (closingWeek !== null) {
      const weeksLeft = closingWeek - currentWeek;
      items.push({
        weekLabel: `W${closingWeek}`,
        text: `Transfer window closes (${weeksLeft}w)`,
      });
    }
  }

  // Board ultimatum deadline
  if (state.boardUltimatum) {
    const { deadlineWeek, minimumPosition } = state.boardUltimatum;
    items.push({
      weekLabel: `W${deadlineWeek}`,
      text: `Board deadline — reach pos ${minimumPosition}`,
    });
  }

  // Construction milestones
  for (const facility of state.club.facilities) {
    const weeksLeft = facility.constructionWeeksRemaining ?? 0;
    if (weeksLeft > 0) {
      const completionWeek = currentWeek + weeksLeft;
      items.push({
        weekLabel: `W${completionWeek}`,
        text: `${facilityLabel(facility.type)} construction complete`,
      });
    }
  }

  // Contract expiries within 10 weeks
  for (const player of state.club.squad) {
    const expires = player.contractExpiresWeek;
    if (expires !== undefined && expires > currentWeek && expires <= currentWeek + 10) {
      items.push({
        weekLabel: `W${expires}`,
        text: `${player.name.split(' ').pop() ?? player.name} contract expires`,
      });
    }
  }

  // Sort by week
  items.sort((a, b) => {
    const wa = parseInt(a.weekLabel.slice(1), 10);
    const wb = parseInt(b.weekLabel.slice(1), 10);
    return wa - wb;
  });

  return items.slice(0, 6);
}

function facilityLabel(type: string): string {
  const labels: Record<string, string> = {
    TRAINING_GROUND: 'Training Ground',
    MEDICAL_CENTRE: 'Medical Centre',
    SCOUT_NETWORK: 'Scout Network',
    YOUTH_ACADEMY: 'Youth Academy',
    COMMERCIAL_CENTRE: 'Commercial Centre',
    FAN_ZONE: 'Fan Zone',
    STADIUM: 'Stadium',
    GROUNDS_SECURITY: 'Grounds & Security',
    FOOD_BEVERAGE: 'Food & Beverage',
    CLUB_OFFICE: 'Club Office',
  };
  return labels[type] ?? type;
}

// ── InboxCard (inline, non-preview) ──────────────────────────────────────────

interface InboxFeedProps {
  state: GameState;
  events: GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  dismissed: Set<number>;
  onDismiss: (idx: number) => void;
  onError: (msg: string) => void;
  onMathChallenge: (event: PendingClubEvent) => void;
  npcMessages: NpcMessage[];
}

const NPC_MSG_CONFIG = {
  VAL:    { initial: 'V', avatarClass: 'bg-warn-amber/20 text-warn-amber',   nameClass: 'text-warn-amber',   name: 'Val Okoro'    },
  KEV:    { initial: 'K', avatarClass: 'bg-data-blue/20 text-data-blue',     nameClass: 'text-data-blue',    name: 'Kev Mulligan' },
  MARCUS: { initial: 'M', avatarClass: 'bg-pitch-green/20 text-pitch-green', nameClass: 'text-pitch-green',  name: 'Marcus Webb'  },
  DANI:   { initial: 'D', avatarClass: 'bg-alert-red/20 text-alert-red',     nameClass: 'text-alert-red',    name: 'Dani Osei'    },
};

function InboxFeed({
  state,
  events: _events,
  dispatch,
  dismissed,
  onDismiss,
  onError,
  onMathChallenge,
  npcMessages,
}: InboxFeedProps) {
  const unresolvedDecisions = state.pendingEvents.filter(e => !e.resolved);
  const isEmpty = unresolvedDecisions.length === 0 && npcMessages.length === 0;

  return (
    <div className="flex flex-col gap-2">
      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="text-2xl">✓</span>
          <span className="text-xs text-pitch-green font-semibold">All clear</span>
          <span className="text-xs2 text-txt-muted">No decisions waiting</span>
        </div>
      )}

      {/* Decisions — all of them, inline expansion */}
      {unresolvedDecisions.map(evt => (
        <PendingEventCard
          key={evt.id}
          event={evt}
          dispatch={dispatch}
          onError={onError}
          onMathChallenge={onMathChallenge}
        />
      ))}

      {/* NPC messages */}
      {npcMessages.length > 0 && (
        <>
          {unresolvedDecisions.length > 0 && (
            <div className="border-t border-bg-raised/60" />
          )}
          <p className="text-xs2 text-txt-muted uppercase tracking-wider">From the Team</p>
          {npcMessages.map(msg => {
            const cfg = NPC_MSG_CONFIG[msg.sender];
            const isDismissed = typeof msg.id === 'number' ? dismissed.has(msg.id) : false;
            if (isDismissed) return null;
            return (
              <div
                key={msg.id}
                className="flex items-start gap-2 px-3 py-2 rounded-card bg-bg-surface/80 border border-bg-raised/40 group relative"
              >
                <button
                  onClick={() => typeof msg.id === 'number' && onDismiss(msg.id)}
                  className="absolute top-1 right-1.5 text-txt-muted/30 hover:text-txt-muted opacity-0 group-hover:opacity-100 transition-opacity text-xs2 leading-none"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${cfg.avatarClass}`}>
                  {cfg.initial}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-xs2 font-semibold mb-0.5 ${cfg.nameClass}`}>{cfg.name}</p>
                  <p className="text-xs leading-relaxed text-txt-primary">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface OwnerOfficeProps {
  state: GameState;
  events: GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  isLoading: boolean;
  onNavigateToStadium: () => void;
  onError: (msg: string) => void;
  onPreMatch?: () => void;
  /**
   * Intro spotlight. When undefined = no intro active.
   * null = intro active, everything dimmed.
   * string = the named zone is revealed; others are dimmed.
   *
   * Zone IDs: 'header-stats' | 'decisions-zone' | 'pitch-zone' | 'people-zone'
   */
  introSpotlight?: string | null;
}

// ── Main component ────────────────────────────────────────────────────────────

export function OwnerOffice({
  state,
  events,
  dispatch,
  isLoading,
  onNavigateToStadium,
  onError,
  onPreMatch,
  introSpotlight,
}: OwnerOfficeProps) {
  const [dismissed, setDismissed]         = useState<Set<number>>(new Set());
  const [socialOpen, setSocialOpen]       = useState(false);
  const [socialLinked, setSocialLinked]   = useState<PendingClubEvent | null>(null);
  const [practiceOpen, setPracticeOpen]   = useState(false);
  const [learningOpen, setLearningOpen]   = useState(false);
  const [leagueModalOpen, setLeaguModal]  = useState(false);

  function handleDismiss(idx: number) {
    setDismissed(prev => new Set([...prev, idx]));
  }

  function handleMathChallenge(event: PendingClubEvent) {
    setSocialLinked(event);
    setSocialOpen(true);
  }

  function handleSocialClose() {
    setSocialOpen(false);
    setSocialLinked(null);
  }

  const npcMessages = generateNpcMessages(state, events);
  const { weeklyWages, weeklyIncome, runway } = computeWeeklyFinancials(state);
  const burnPerWeek = weeklyWages;

  const playerEntry   = state.league.entries.find(e => e.clubId === state.club.id);
  const playerPos     = playerEntry?.position ?? 0;
  const totalClubs    = state.league.entries.length;

  const runwayVal = weeklyWages > weeklyIncome
    ? state.club.wageReserve / (weeklyWages - weeklyIncome)
    : Infinity;
  const runwayColour =
    runwayVal === Infinity  ? 'text-pitch-green'
    : runwayVal >= 20       ? 'text-pitch-green'
    : runwayVal >= 10       ? 'text-data-blue'
    : runwayVal >= 5        ? 'text-warn-amber'
    : 'text-alert-red';

  const unresolved = state.pendingEvents.filter(e => !e.resolved);
  const canAdvance = !isLoading && unresolved.length === 0 && state.currentWeek < 46;
  const nextWeekLabel =
    state.currentWeek >= 46 ? 'Season Complete'
    : isLoading             ? 'Simulating…'
    : unresolved.length > 0 ? `Resolve ${unresolved.length} item${unresolved.length !== 1 ? 's' : ''} first`
    : `▶ NEXT WEEK`;

  function handleNextWeek() {
    if (!canAdvance) return;
    if (onPreMatch) {
      onPreMatch();
      return;
    }
    const nextWeek = state.currentWeek + 1;
    const result = dispatch({
      type: 'SIMULATE_WEEK',
      week: nextWeek,
      season: state.season,
      seed: `calculating-glory-mvp-v1-w${nextWeek}`,
    });
    if (result.error) onError(result.error);
  }

  const agendaItems = buildAgendaItems(state);
  const phaseLabel = state.phase.replace(/_/g, ' ').toLowerCase();

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-bg-deep">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-bg-surface border-b border-bg-raised gap-4">

        {/* Identity */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <div className="w-8 h-8 rounded-card bg-bg-raised border border-bg-raised/80 flex items-center justify-center text-xs font-bold text-txt-muted shrink-0">
            {state.club.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-txt-primary tracking-tight truncate max-w-[160px]">
              {state.club.name}
            </h1>
            <p className="text-xs2 text-txt-muted capitalize">
              S{state.season} · W{state.currentWeek} · {phaseLabel}
            </p>
          </div>
        </div>

        {/* 5 vital stats */}
        <div
          className="relative hidden sm:flex items-stretch divide-x divide-bg-raised border border-bg-raised rounded-card overflow-hidden shrink-0"
          id="header-stats"
        >
          <SpotlightOverlay zoneId="header-stats" spotlight={introSpotlight} />
          {[
            { label: 'Budget',   value: fmtMoney(state.club.transferBudget),  colour: '' },
            { label: 'Burn/wk', value: fmtMoney(burnPerWeek),                 colour: burnPerWeek > weeklyIncome ? 'text-alert-red' : 'text-txt-primary' },
            { label: 'Board',   value: `${state.boardConfidence}%`,           colour: state.boardConfidence >= 60 ? 'text-pitch-green' : state.boardConfidence >= 40 ? 'text-warn-amber' : 'text-alert-red' },
            { label: 'Position', value: `${playerPos}/${totalClubs}`,          colour: playerPos <= 3 ? 'text-pitch-green' : playerPos >= totalClubs - 3 ? 'text-alert-red' : 'text-txt-primary' },
            { label: 'Runway',  value: fmtRunway(runwayVal),                  colour: runwayColour },
          ].map(stat => (
            <div key={stat.label} className="px-3 py-1.5 text-center min-w-[56px]">
              <div className={`text-xs font-bold tabular-nums data-font ${stat.colour || 'text-txt-primary'}`}>
                {stat.value}
              </div>
              <div className="text-xs2 text-txt-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Stadium nav */}
        <button
          onClick={onNavigateToStadium}
          className="shrink-0 px-3 py-1.5 rounded-card text-xs text-txt-muted border border-bg-raised hover:text-txt-primary hover:border-bg-raised/80 transition-colors"
        >
          Stadium →
        </button>
      </header>

      {/* ── Ticker ───────────────────────────────────────────────────────── */}
      <div className="shrink-0">
        <NewsTicker
          events={events}
          clubId={state.club.id}
          clubName={state.club.name}
          stadiumName={state.club.stadium.name}
          leagueEntries={state.league.entries}
          squad={state.club.squad}
          freeAgents={state.freeAgentPool ?? []}
          pendingEvents={state.pendingEvents}
          currentWeek={state.currentWeek}
          currentSeason={state.season}
          clubRecords={state.clubRecords}
        />
      </div>

      {/* ── Three zones ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Decisions & News ──────────────────────────────────────── */}
        <Zone id="decisions-zone" className="w-1/3 min-w-0" spotlight={introSpotlight}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-bg-raised/40 shrink-0">
            <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
              📥 Decisions &amp; News
            </span>
            {unresolved.length > 0 && (
              <span className="text-xs2 font-bold bg-warn-amber/15 text-warn-amber px-2 py-0.5 rounded-tag">
                {unresolved.length} action{unresolved.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <InboxFeed
              state={state}
              events={events}
              dispatch={dispatch}
              dismissed={dismissed}
              onDismiss={handleDismiss}
              onError={onError}
              onMathChallenge={handleMathChallenge}
              npcMessages={npcMessages}
            />
          </div>
        </Zone>

        {/* ── Centre: Pitch & League ──────────────────────────────────────── */}
        <Zone id="pitch-zone" className="w-1/3 min-w-0" spotlight={introSpotlight}>
          <div className="flex items-center px-4 py-2.5 border-b border-bg-raised/40 shrink-0">
            <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
              ⚽ Pitch &amp; League
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">

            {/* Next match card */}
            <div className="rounded-card border border-bg-raised bg-bg-surface/60 p-4 text-center">
              <p className="text-xs2 text-txt-muted uppercase tracking-wider mb-1">
                Next Match — Week {state.currentWeek + 1}
              </p>
              <p className="text-sm font-bold text-txt-primary mb-1">
                {state.club.name}
              </p>
              <p className="text-xs2 text-txt-muted">League Two · Fixture</p>
              {state.club.form.length > 0 && (
                <div className="flex justify-center gap-1 mt-2">
                  {state.club.form.slice(-5).map((r, i) => (
                    <span
                      key={i}
                      className={[
                        'text-xs2 font-bold w-5 h-5 flex items-center justify-center rounded-sm',
                        r === 'W' ? 'bg-pitch-green/20 text-pitch-green' :
                        r === 'D' ? 'bg-warn-amber/20 text-warn-amber' :
                        'bg-alert-red/20 text-alert-red',
                      ].join(' ')}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Compact league table */}
            <CompactLeague
              entries={state.league.entries}
              playerClubId={state.club.id}
              onViewAll={() => setLeaguModal(true)}
            />

          </div>

          {/* Next Week button — anchored at bottom */}
          <div className="shrink-0 px-4 pb-4 pt-2 border-t border-bg-raised/40">
            <button
              onClick={handleNextWeek}
              disabled={!canAdvance}
              className={[
                'w-full py-3 rounded-card font-bold text-sm tracking-widest uppercase transition-all duration-200 data-font',
                canAdvance
                  ? 'bg-data-blue text-white hover:bg-data-blue/80 active:scale-[0.98] shadow-lg shadow-data-blue/20'
                  : 'bg-bg-raised text-txt-muted cursor-not-allowed',
              ].join(' ')}
            >
              {nextWeekLabel}
            </button>
            {!canAdvance && unresolved.length > 0 && (
              <p className="text-center text-xs2 text-txt-muted mt-1.5">
                Clear decisions before advancing
              </p>
            )}
          </div>
        </Zone>

        {/* ── Right: People & Time ────────────────────────────────────────── */}
        <Zone id="people-zone" className="w-1/3 min-w-0" spotlight={introSpotlight}>
          <div className="flex items-center px-4 py-2.5 border-b border-bg-raised/40 shrink-0">
            <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">
              👥 People &amp; Time
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">

            {/* Staff panel */}
            <div className="rounded-card border border-bg-raised overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-bg-raised/40 border-b border-bg-raised">
                <span className="text-xs2 font-semibold text-txt-muted uppercase tracking-wider">Your Staff</span>
                <span className="text-xs2 text-txt-muted">permanent cast</span>
              </div>
              {NPC_CAST.map(npc => {
                const { hasAlert, status } = deriveStaffStatus(npc.id, state);
                return (
                  <div
                    key={npc.id}
                    className="flex items-start gap-3 px-3 py-2.5 border-b border-bg-raised/30 last:border-b-0 hover:bg-bg-raised/20 transition-colors cursor-pointer"
                    title="Chat coming soon"
                  >
                    <div className={`w-2 h-2 rounded-sm shrink-0 mt-1.5 ${hasAlert ? 'bg-warn-amber' : 'bg-bg-raised border border-bg-raised/80'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-txt-primary">{npc.name}</p>
                      <p className="text-xs2 text-txt-muted">{npc.role}</p>
                      <p className="text-xs2 text-txt-muted/70 italic mt-0.5">"{status}"</p>
                    </div>
                    <span className="text-xs2 text-data-blue shrink-0 mt-0.5" title="Chat coming soon">💬</span>
                  </div>
                );
              })}
            </div>

            {/* Agenda panel */}
            <div className="rounded-card border border-bg-raised overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-bg-raised/40 border-b border-bg-raised">
                <span className="text-xs2 font-semibold text-txt-muted uppercase tracking-wider">This Week's Agenda</span>
                <span className="text-xs2 text-txt-muted">read-only</span>
              </div>
              {agendaItems.length === 0 ? (
                <div className="px-3 py-3 text-xs2 text-txt-muted italic">Nothing scheduled</div>
              ) : (
                agendaItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 border-b border-bg-raised/30 last:border-b-0">
                    <span className="shrink-0 border border-bg-raised px-1.5 py-0.5 text-xs2 font-bold text-txt-muted rounded-sm data-font">
                      {item.weekLabel}
                    </span>
                    <span className="text-xs2 text-txt-muted/80 leading-relaxed">{item.text}</span>
                  </div>
                ))
              )}
            </div>

            {/* Practice shortcut */}
            <button
              onClick={() => setPracticeOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-card border border-bg-raised bg-bg-surface/40 hover:bg-bg-raised/30 transition-colors text-left"
            >
              <span className="text-sm">🎯</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-txt-primary">Practice</p>
                <p className="text-xs2 text-txt-muted">Drill with Marcus Webb</p>
              </div>
              <span className="text-xs2 text-txt-muted">→</span>
            </button>

            {/* Learning Progress shortcut */}
            <button
              onClick={() => setLearningOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-card border border-bg-raised bg-bg-surface/40 hover:bg-bg-raised/30 transition-colors text-left"
            >
              <span className="text-sm">📚</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-txt-primary">Learning Progress</p>
                <p className="text-xs2 text-txt-muted">Business acumen & curriculum</p>
              </div>
              <span className="text-xs2 text-txt-muted">→</span>
            </button>

          </div>
        </Zone>

      </div>

      {/* ── Slide-overs ──────────────────────────────────────────────────── */}
      <SlideOver
        isOpen={socialOpen}
        onClose={handleSocialClose}
        title={socialLinked ? 'Negotiate — Agent Rodriguez' : 'Chats'}
      >
        {socialOpen && (
          <SocialFeed
            state={state}
            events={events}
            dispatch={dispatch}
            linkedEvent={socialLinked}
            onNegotiationComplete={handleSocialClose}
          />
        )}
      </SlideOver>

      <SlideOver
        isOpen={practiceOpen}
        onClose={() => setPracticeOpen(false)}
        title="Practice — Marcus Webb"
      >
        {practiceOpen && (
          <SocialFeed
            state={state}
            events={events}
            dispatch={dispatch}
            practiceMode
          />
        )}
      </SlideOver>

      <SlideOver
        isOpen={learningOpen}
        onClose={() => setLearningOpen(false)}
        title="Learning Progress"
      >
        {learningOpen && (
          <LearningProgressSlideOver state={state} events={events} />
        )}
      </SlideOver>

      {/* ── League modal ─────────────────────────────────────────────────── */}
      {leagueModalOpen && (
        <LeagueModal
          entries={state.league.entries}
          playerClubId={state.club.id}
          onClose={() => setLeaguModal(false)}
        />
      )}

    </div>
  );
}
