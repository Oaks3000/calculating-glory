import { GameState } from '@calculating-glory/domain';
import { formatMoney } from '@calculating-glory/domain';
import { TermInfo } from '../shared/TermInfo';
import { GlossaryTermId } from '../../lib/glossary';

interface HeadlineStatsProps {
  state: GameState;
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'flat') return <span className="text-txt-muted">→</span>;
  return trend === 'up'
    ? <span className="text-pitch-green">↑</span>
    : <span className="text-alert-red">↓</span>;
}

interface StatCardProps {
  label: string;
  termId?: GlossaryTermId;
  value: string;
  trend: 'up' | 'down' | 'flat';
  color: string;
}

function StatCard({ label, termId, value, trend, color }: StatCardProps) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="text-xs text-txt-muted uppercase tracking-wide">
        {termId
          ? <TermInfo termId={termId} label={label} size="inline" />
          : label}
      </span>
      <div className={`text-2xl font-bold flex items-center gap-1 ${color}`}>
        {value}
        <TrendArrow trend={trend} />
      </div>
    </div>
  );
}

export function HeadlineStats({ state }: HeadlineStatsProps) {
  const { club, league, boardConfidence } = state;

  const playerEntry = league.entries.find(e => e.clubId === club.id);
  const position = playerEntry?.position ?? '—';
  const totalEntries = league.entries.length;

  const positionTrend: 'up' | 'down' | 'flat' =
    (position as number) <= 8 ? 'up' : (position as number) >= 18 ? 'down' : 'flat';
  const positionColor =
    (position as number) <= 3 ? 'text-pitch-green'
    : (position as number) >= 22 ? 'text-alert-red'
    : 'text-data-blue';

  const confidenceTrend: 'up' | 'down' | 'flat' =
    boardConfidence >= 60 ? 'up' : boardConfidence < 40 ? 'down' : 'flat';
  const confidenceColor =
    boardConfidence >= 60 ? 'text-pitch-green'
    : boardConfidence < 40 ? 'text-alert-red'
    : 'text-warn-amber';

  const budgetTrend: 'up' | 'down' | 'flat' =
    club.transferBudget > 10_000_000 ? 'flat' : 'down';
  const budgetColor =
    club.transferBudget < 5_000_000 ? 'text-alert-red' : 'text-pitch-green';

  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard
        label="Position"
        value={position !== '—' ? `${position}/${totalEntries}` : '—'}
        trend={positionTrend}
        color={positionColor}
      />
      <StatCard
        label="Confidence"
        termId="board-confidence"
        value={`${boardConfidence}%`}
        trend={confidenceTrend}
        color={confidenceColor}
      />
      <StatCard
        label="Budget"
        termId="transfer-budget"
        value={formatMoney(club.transferBudget)}
        trend={budgetTrend}
        color={budgetColor}
      />
    </div>
  );
}
