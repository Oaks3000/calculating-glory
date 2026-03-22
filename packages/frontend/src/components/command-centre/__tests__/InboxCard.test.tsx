import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InboxCard } from '../InboxCard';
import type { GameEvent, PendingClubEvent, LeagueTableEntry } from '@calculating-glory/domain';

// ── Mock PendingEventCard so InboxCard tests aren't about decision rendering ──
vi.mock('../PendingEventCard', () => ({
  PendingEventCard: ({ event }: { event: PendingClubEvent }) => (
    <div data-testid="pending-event-card">{event.title}</div>
  ),
}));

// ── Shared fixtures ───────────────────────────────────────────────────────────

const CLUB_ID = 'test-club';

function makeLeagueEntry(overrides: Partial<LeagueTableEntry> = {}): LeagueTableEntry {
  return {
    clubId: CLUB_ID,
    clubName: 'Test FC',
    position: 1,
    played: 5,
    won: 3,
    drawn: 1,
    lost: 1,
    goalsFor: 8,
    goalsAgainst: 4,
    goalDifference: 4,
    points: 10,
    form: ['W', 'W', 'D', 'L', 'W'],
    ...overrides,
  };
}

function makeMatchEvent(
  homeTeamId: string,
  awayTeamId: string,
  homeGoals = 2,
  awayGoals = 1,
): GameEvent {
  return {
    type: 'MATCH_SIMULATED',
    timestamp: Date.now(),
    matchId: `m-${Math.random()}`,
    homeTeamId,
    awayTeamId,
    homeGoals,
    awayGoals,
    seed: 'test-seed',
  } as GameEvent;
}

function makePendingEvent(overrides: Partial<PendingClubEvent> = {}): PendingClubEvent {
  return {
    id: 'evt-1',
    templateId: 'WAGE_DEMAND',
    title: 'Player demands pay rise',
    description: 'Your star player wants more money.',
    severity: 'minor',
    week: 5,
    resolved: false,
    choices: [
      {
        id: 'accept',
        label: 'Accept',
        description: 'Give the raise.',
        budgetEffect: -50000,
      },
    ],
    ...overrides,
  } as PendingClubEvent;
}

const defaultProps = {
  pendingEvents: [] as PendingClubEvent[],
  events: [] as GameEvent[],
  clubId: CLUB_ID,
  leagueEntries: [makeLeagueEntry()],
  currentWeek: 5,
  dismissed: new Set<number>(),
  onDismiss: vi.fn(),
  dispatch: vi.fn().mockReturnValue({}),
  onError: vi.fn(),
  onMathChallenge: vi.fn(),
  onViewAll: vi.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InboxCard — empty state', () => {
  it('shows "All clear" when there are no decisions, matches, or news', () => {
    // Week 0 produces no news (seed too low) — use no events and no news
    render(<InboxCard {...defaultProps} currentWeek={0} events={[]} />);
    expect(screen.getByText(/All clear/i)).toBeInTheDocument();
  });
});

describe('InboxCard — pending decisions', () => {
  it('renders a PendingEventCard for each unresolved decision', () => {
    const events = [makePendingEvent({ id: 'e1', title: 'Event One' }), makePendingEvent({ id: 'e2', title: 'Event Two' })];
    render(<InboxCard {...defaultProps} pendingEvents={events} />);
    const cards = screen.getAllByTestId('pending-event-card');
    expect(cards).toHaveLength(2);
    expect(screen.getByText('Event One')).toBeInTheDocument();
    expect(screen.getByText('Event Two')).toBeInTheDocument();
  });

  it('does not render resolved decisions', () => {
    const events = [
      makePendingEvent({ id: 'e1', title: 'Unresolved', resolved: false }),
      makePendingEvent({ id: 'e2', title: 'Resolved',   resolved: true }),
    ];
    render(<InboxCard {...defaultProps} pendingEvents={events} />);
    const cards = screen.getAllByTestId('pending-event-card');
    expect(cards).toHaveLength(1);
    expect(screen.getByText('Unresolved')).toBeInTheDocument();
    expect(screen.queryByText('Resolved')).not.toBeInTheDocument();
  });

  it('shows "N need action" badge when unresolved decisions exist', () => {
    const events = [makePendingEvent(), makePendingEvent({ id: 'e2' })];
    render(<InboxCard {...defaultProps} pendingEvents={events} />);
    expect(screen.getByText('2 need action')).toBeInTheDocument();
  });

  it('hides the action badge when there are no unresolved decisions', () => {
    render(<InboxCard {...defaultProps} pendingEvents={[]} />);
    expect(screen.queryByText(/need action/i)).not.toBeInTheDocument();
  });
});

describe('InboxCard — notable matches', () => {
  it('shows "Latest Results" section when the club has played a match', () => {
    const matchEvents: GameEvent[] = [makeMatchEvent(CLUB_ID, 'opponent', 2, 1)];
    render(<InboxCard {...defaultProps} events={matchEvents} />);
    expect(screen.getByText(/Latest Results/i)).toBeInTheDocument();
  });

  it('calls onDismiss with the correct index when a match dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    const matchEvents: GameEvent[] = [makeMatchEvent(CLUB_ID, 'opponent', 2, 1)];
    render(<InboxCard {...defaultProps} events={matchEvents} onDismiss={onDismiss} />);
    const dismissBtns = screen.getAllByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissBtns[0]);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(typeof onDismiss.mock.calls[0][0]).toBe('number');
  });
});

describe('InboxCard — footer', () => {
  it('calls onViewAll when "View full inbox" is clicked', () => {
    const onViewAll = vi.fn();
    render(<InboxCard {...defaultProps} onViewAll={onViewAll} />);
    fireEvent.click(screen.getByText(/View full inbox/i));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('shows "+N more" badge when overflow items exist beyond the 4-item preview', () => {
    // 5 match events involving the club → 5 notable matches; PREVIEW_LIMIT = 4
    const matchEvents: GameEvent[] = Array.from({ length: 5 }, (_, i) =>
      makeMatchEvent(CLUB_ID, `opponent-${i}`, 2, 1),
    );
    render(<InboxCard {...defaultProps} events={matchEvents} />);
    expect(screen.getByText(/\+\d+ more/)).toBeInTheDocument();
  });

  it('does not show "+N more" when items fit within the preview limit', () => {
    render(<InboxCard {...defaultProps} events={[makeMatchEvent(CLUB_ID, 'opp', 1, 0)]} />);
    expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });
});
