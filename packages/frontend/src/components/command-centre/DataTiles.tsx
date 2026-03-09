import { useEffect, useRef, useState } from 'react';
import { GameState } from '@calculating-glory/domain';
import { formatMoney } from '@calculating-glory/domain';

interface DataTilesProps {
  state: GameState;
  gridMode?: boolean;
  onBackroomClick?: () => void;
}

interface Tile {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'flat';
  color?: string;
  animateClass?: string;
  onClick?: () => void;
}

function TrendArrow({ trend }: { trend?: 'up' | 'down' | 'flat' }) {
  if (!trend || trend === 'flat') return <span className="text-txt-muted">→</span>;
  return trend === 'up'
    ? <span className="text-pitch-green">↑</span>
    : <span className="text-alert-red">↓</span>;
}

function DataTile({ label, value, sub, trend, color, animateClass, onClick }: Tile) {
  return (
    <div
      className={[
        'card flex flex-col gap-1 min-w-[120px]',
        animateClass ?? '',
        onClick ? 'cursor-pointer hover:border hover:border-data-blue/40 transition-colors' : '',
      ].join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <span className="text-xs text-txt-muted uppercase tracking-wide">{label}</span>
      <div className={`data-font text-lg font-semibold ${color ?? 'text-txt-primary'} flex items-center gap-1`}>
        {value}
        <TrendArrow trend={trend} />
      </div>
      {sub && <span className="text-xs2 text-txt-muted">{sub}</span>}
    </div>
  );
}

/** Track prev value and return an animation class on change (cleared after animation ends). */
function useRepFlash(reputation: number): string {
  const prevRef   = useRef<number | null>(null);
  const [cls, setCls] = useState('');

  useEffect(() => {
    if (prevRef.current === null) {
      prevRef.current = reputation;
      return;
    }
    if (reputation === prevRef.current) return;

    const next = reputation > prevRef.current ? 'animate-rep-flash-up' : 'animate-rep-flash-down';
    prevRef.current = reputation;
    setCls(next);

    const id = setTimeout(() => setCls(''), 700);
    return () => clearTimeout(id);
  }, [reputation]);

  return cls;
}

export function DataTiles({ state, gridMode, onBackroomClick }: DataTilesProps) {
  const { club, league, boardConfidence, currentWeek, businessAcumen } = state;

  const playerEntry = league.entries.find(e => e.clubId === club.id);
  const position = playerEntry?.position ?? '—';
  const totalEntries = league.entries.length;

  // Weekly wage bill
  const wageBill = club.squad.reduce((s, p) => s + p.wage, 0)
    + club.staff.reduce((s, st) => s + st.salary, 0);

  // Acumen average
  const acumenAvg = Math.round(
    (businessAcumen.financial + businessAcumen.statistical + businessAcumen.strategic) / 3
  );

  // Reputation change animation
  const repFlashClass = useRepFlash(club.reputation);

  const tiles: Tile[] = [
    {
      label: 'Transfer Budget',
      value: formatMoney(club.transferBudget),
      trend: club.transferBudget > 10000000 ? 'flat' : 'down',
      color: club.transferBudget < 5000000 ? 'text-alert-red' : 'text-pitch-green',
    },
    {
      label: 'Wage Bill',
      value: formatMoney(wageBill),
      sub: `/ wk  ·  budget ${formatMoney(club.wageBudget)}`,
      trend: wageBill > club.wageBudget * 0.9 ? 'down' : 'flat',
      color: wageBill > club.wageBudget ? 'text-alert-red' : 'text-txt-primary',
    },
    {
      label: 'League Position',
      value: `${position}${position !== '—' ? `/${totalEntries}` : ''}`,
      trend: (position as number) <= 8 ? 'up' : (position as number) >= 18 ? 'down' : 'flat',
      color: (position as number) <= 3 ? 'text-pitch-green' : (position as number) >= 22 ? 'text-alert-red' : 'text-data-blue',
    },
    {
      label: 'Board Confidence',
      value: `${boardConfidence}%`,
      trend: boardConfidence >= 60 ? 'up' : boardConfidence < 40 ? 'down' : 'flat',
      color: boardConfidence >= 60 ? 'text-pitch-green' : boardConfidence < 40 ? 'text-alert-red' : 'text-warn-amber',
    },
    {
      label: 'Week',
      value: `${currentWeek} / 46`,
      sub: state.phase.replace('_', ' '),
    },
    {
      label: 'Business Acumen',
      value: '★'.repeat(acumenAvg) + '☆'.repeat(5 - acumenAvg),
      sub: `Fin ${businessAcumen.financial}★  Stat ${businessAcumen.statistical}★  Strat ${businessAcumen.strategic}★`,
      color: 'text-warn-amber',
    },
    {
      label: 'Backroom Team',
      value: `${club.squad.length}`,
      sub: `${club.staff.length} staff · tap to manage`,
      trend: club.squad.length < 18 ? 'down' : 'flat',
      color: club.squad.length < 18 ? 'text-alert-red' : 'text-txt-primary',
      onClick: onBackroomClick,
    },
    {
      label: 'Reputation',
      value: `${club.reputation}`,
      sub: 'out of 100',
      animateClass: repFlashClass,
    },
  ];

  return (
    <div className={gridMode ? 'grid grid-cols-4 gap-2' : 'flex flex-wrap gap-3'}>
      {tiles.map(tile => (
        <DataTile key={tile.label} {...tile} />
      ))}
    </div>
  );
}
