import { GameState, computeWeeklyFinancials, formatMoney } from '@calculating-glory/domain';

interface Props {
  state: GameState;
}

interface RunwayStyle {
  barClass: string;
  textClass: string;
  pulse: boolean;
}

function getRunwayStyle(runway: number, isSurplus: boolean): RunwayStyle {
  if (isSurplus) {
    return { barClass: 'bg-data-blue', textClass: 'text-data-blue', pulse: false };
  }
  if (runway >= 20) {
    return { barClass: 'bg-pitch-green', textClass: 'text-pitch-green', pulse: false };
  }
  if (runway >= 10) {
    return { barClass: 'bg-warn-amber', textClass: 'text-warn-amber', pulse: false };
  }
  if (runway >= 5) {
    return { barClass: 'bg-alert-red', textClass: 'text-alert-red', pulse: false };
  }
  return { barClass: 'bg-alert-red', textClass: 'text-alert-red', pulse: true };
}

export function FinancialHealthBar({ state }: Props) {
  const { weeklyIncome, weeklyWages, runway } = computeWeeklyFinancials(state);
  const budget = state.club.transferBudget;
  const burn = weeklyWages - weeklyIncome;
  const isSurplus = burn <= 0;

  const runwayWeeks = isSurplus ? Infinity : Math.min(Math.floor(runway), 99);
  const { barClass, textClass, pulse } = getRunwayStyle(runway, isSurplus);

  // Bar fills proportionally up to 52 weeks (one full season = full bar)
  const fillPct = isSurplus ? 100 : Math.min((runway / 52) * 100, 100);

  const burnLabel = isSurplus
    ? `+${formatMoney(-burn)}/wk`
    : `${formatMoney(burn)}/wk`;

  const runwayLabel = isSurplus ? 'Surplus' : `${runwayWeeks} wks`;

  return (
    <div className="mx-4 mt-1 px-3 py-1.5 bg-bg-surface rounded-card flex items-center gap-3 text-sm">

      {/* Budget */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-txt-muted text-xs uppercase tracking-wide leading-none">Budget</span>
        <span className="text-txt-primary font-mono font-semibold tabular-nums">{formatMoney(budget)}</span>
      </div>

      <div className="h-3.5 w-px bg-bg-raised shrink-0" />

      {/* Burn rate */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-txt-muted text-xs uppercase tracking-wide leading-none">Burn</span>
        <span className={`font-mono font-semibold tabular-nums ${isSurplus ? 'text-data-blue' : 'text-txt-primary'}`}>
          {burnLabel}
        </span>
      </div>

      <div className="h-3.5 w-px bg-bg-raised shrink-0" />

      {/* Runway bar */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex-1 h-1.5 bg-bg-raised rounded-full overflow-hidden min-w-[60px]">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${barClass} ${pulse ? 'animate-pulse' : ''}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <span className={`font-mono font-semibold text-xs shrink-0 tabular-nums ${textClass} ${runway < 10 && !isSurplus ? 'font-bold' : ''}`}>
          {runwayLabel}
        </span>
      </div>

    </div>
  );
}
