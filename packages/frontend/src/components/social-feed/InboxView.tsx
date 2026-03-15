import { GameState, PendingClubEvent } from '@calculating-glory/domain';
import { ChallengeTopic, TopicPerformance } from './generateChallenge';
import { ThreadCard } from './ThreadCard';

// ── Topic display config ────────────────────────────────────────────────────

const TOPIC_CONFIG: Record<ChallengeTopic, { label: string; preview: string }> = {
  percentage: {
    label: 'Percentages Practice',
    preview: 'Discounts, mark-ups, and percentage change — the backbone of every deal.',
  },
  decimals: {
    label: 'Decimals & Rounding',
    preview: 'Points per game, goals per match — precision matters in football.',
  },
  ratios: {
    label: 'Ratios & Comparisons',
    preview: 'Budget ratios, break-even points — how your club stacks up.',
  },
  algebra: {
    label: 'Projections & Algebra',
    preview: 'Points tallies, confidence forecasts — plan ahead with confidence.',
  },
  statistics: {
    label: 'Stats & Averages',
    preview: 'Win rates, squad ratings, GD — read the numbers behind the game.',
  },
  geometry: {
    label: 'Geometry & Shapes',
    preview: 'Pitch dimensions, stand angles, scale drawings — the maths of the stadium.',
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

/** Return the 3 weakest topics from performance data */
function weakestTopics(perf: TopicPerformance): ChallengeTopic[] {
  const topics: ChallengeTopic[] = ['percentage', 'decimals', 'ratios', 'algebra', 'statistics', 'geometry'];
  return [...topics]
    .sort((a, b) => (perf[a] ?? 0) - (perf[b] ?? 0))
    .slice(0, 3);
}

/** Build a short preview line for a negotiation thread */
function negotiationPreview(event: PendingClubEvent): string {
  const mathChoice = event.choices.find(c => c.requiresMath);
  const stdChoice  = event.choices.find(c => !c.requiresMath && c.budgetEffect !== undefined);

  if (mathChoice?.budgetEffect !== undefined && stdChoice?.budgetEffect !== undefined) {
    const saving = Math.abs(stdChoice.budgetEffect) - Math.abs(mathChoice.budgetEffect);
    if (saving > 0) {
      const savingGBP = Math.abs(saving / 100).toLocaleString('en-GB', {
        style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
      });
      return `Solve the maths challenge to save ${savingGBP} on this deal.`;
    }
    const gainExtra = Math.abs(mathChoice.budgetEffect) - Math.abs(stdChoice.budgetEffect);
    if (gainExtra > 0) {
      const gainGBP = Math.abs(gainExtra / 100).toLocaleString('en-GB', {
        style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
      });
      return `Solve the maths challenge to earn an extra ${gainGBP}.`;
    }
  }

  return event.description.slice(0, 80) + (event.description.length > 80 ? '…' : '');
}

// ── Component ──────────────────────────────────────────────────────────────

interface InboxViewProps {
  state: GameState;
  onSelectNegotiation: (event: PendingClubEvent) => void;
  onSelectPractice: (topic: ChallengeTopic) => void;
}

export function InboxView({ state, onSelectNegotiation, onSelectPractice }: InboxViewProps) {
  const mathEvents = state.pendingEvents.filter(
    e => !e.resolved && e.choices.some(c => c.requiresMath)
  );

  const practiceTopics = weakestTopics(state.businessAcumen.recentPerformance);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-4 gap-5">

      {/* ── Active Negotiations ─────────────────────────────────────────── */}
      <section>
        <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2 px-1">
          Active Negotiations
        </p>
        {mathEvents.length === 0 ? (
          <p className="text-xs2 text-txt-muted px-2 py-3 text-center italic">
            No active negotiations — all clear for now.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {mathEvents.map(evt => (
              <ThreadCard
                key={evt.id}
                icon="💼"
                title={evt.title}
                sender="Agent Rodriguez"
                preview={negotiationPreview(evt)}
                isUrgent={evt.severity === 'major'}
                onClick={() => onSelectNegotiation(evt)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Practice Sessions ────────────────────────────────────────────── */}
      <section>
        <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2 px-1">
          Practice Sessions
        </p>
        <p className="text-xs2 text-txt-muted px-1 mb-2 leading-relaxed">
          Marcus has flagged your weakest areas. Work through these to sharpen up before your next negotiation.
        </p>
        <div className="flex flex-col gap-2">
          {practiceTopics.map(topic => (
            <ThreadCard
              key={topic}
              icon="📊"
              title={TOPIC_CONFIG[topic].label}
              sender="Marcus Webb, Club Analyst"
              preview={TOPIC_CONFIG[topic].preview}
              onClick={() => onSelectPractice(topic)}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
