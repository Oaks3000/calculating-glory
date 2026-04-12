import { useState } from 'react';
import { GameState, GameCommand, computeWeeklyFinancials, formatMoney, isTransferWindowOpen } from '@calculating-glory/domain';
import { FinancialHealthBar } from '../../shared/FinancialHealthBar';

/** Clamp a number between min and max. */
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

interface FinancesSectionProps {
  state: GameState;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
}

export function FinancesSection({ state, dispatch, onError }: FinancesSectionProps) {
  const { club } = state;
  const windowOpen = isTransferWindowOpen(state.currentWeek, state.phase);
  const total = club.transferBudget + club.infrastructureBudget + club.wageReserve;

  const [transfer, setTransfer] = useState(club.transferBudget);
  const [infra, setInfra] = useState(club.infrastructureBudget);
  const [wages, setWages] = useState(club.wageReserve);

  const hasChanges =
    transfer !== club.transferBudget ||
    infra !== club.infrastructureBudget ||
    wages !== club.wageReserve;

  const { weeklyWages } = computeWeeklyFinancials(state);
  const runwayWeeks = weeklyWages > 0 ? Math.floor(wages / weeklyWages) : Infinity;
  const runwayColor =
    runwayWeeks === Infinity ? 'text-pitch-green'
    : runwayWeeks >= 20 ? 'text-pitch-green'
    : runwayWeeks >= 10 ? 'text-data-blue'
    : runwayWeeks >= 5 ? 'text-warn-amber'
    : 'text-alert-red';

  function handleSliderChange(pool: 'transfer' | 'infra' | 'wages', newValue: number) {
    const clamped = clamp(Math.round(newValue), 0, total);
    const remaining = total - clamped;

    if (pool === 'transfer') {
      const otherTotal = infra + wages;
      if (otherTotal === 0) { setTransfer(clamped); setInfra(0); setWages(remaining); }
      else {
        setTransfer(clamped);
        setInfra(Math.round((infra / otherTotal) * remaining));
        setWages(remaining - Math.round((infra / otherTotal) * remaining));
      }
    } else if (pool === 'infra') {
      const otherTotal = transfer + wages;
      if (otherTotal === 0) { setInfra(clamped); setTransfer(0); setWages(remaining); }
      else {
        setInfra(clamped);
        setTransfer(Math.round((transfer / otherTotal) * remaining));
        setWages(remaining - Math.round((transfer / otherTotal) * remaining));
      }
    } else {
      const otherTotal = transfer + infra;
      if (otherTotal === 0) { setWages(clamped); setTransfer(remaining); setInfra(0); }
      else {
        setWages(clamped);
        setTransfer(Math.round((transfer / otherTotal) * remaining));
        setInfra(remaining - Math.round((transfer / otherTotal) * remaining));
      }
    }
  }

  function handleConfirm() {
    const adjusted = total - transfer - infra;
    const result = dispatch({ type: 'SET_BUDGET_ALLOCATION', transfer, infrastructure: infra, wages: adjusted });
    if (result?.error) onError(result.error as string);
    else setWages(adjusted);
  }

  function handleReset() {
    setTransfer(club.transferBudget);
    setInfra(club.infrastructureBudget);
    setWages(club.wageReserve);
  }

  const pools = [
    { key: 'transfer' as const, label: 'Transfer Fund',    icon: '🔄', desc: 'Buy players, scout fees, sale proceeds',   value: transfer, color: 'bg-data-blue',    textColor: 'text-data-blue' },
    { key: 'infra'    as const, label: 'Infrastructure',   icon: '🏗️', desc: 'Facility upgrades and construction',        value: infra,    color: 'bg-warn-amber',   textColor: 'text-warn-amber' },
    { key: 'wages'   as const, label: 'Wage Reserve',     icon: '💰', desc: 'Weekly player, staff & manager salaries',   value: wages,    color: 'bg-pitch-green',  textColor: 'text-pitch-green' },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">

      {/* Financial health bar */}
      <FinancialHealthBar state={state} />

      <div className="px-4 py-3 flex flex-col gap-4">

        {/* Total + stacked bar */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs text-txt-muted uppercase tracking-wide">Total available funds</span>
              <p className="text-xl font-bold text-txt-primary data-font mt-0.5">{formatMoney(total)}</p>
            </div>
            {/* Wage runway callout */}
            <div className="text-right">
              <span className="text-xs text-txt-muted uppercase tracking-wide">Wage runway</span>
              <p className={`text-xl font-bold data-font mt-0.5 ${runwayColor}`}>
                {runwayWeeks === Infinity ? 'Surplus' : `≈${runwayWeeks}w`}
              </p>
              <span className="text-xs2 text-txt-muted">at current burn</span>
            </div>
          </div>

          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            {pools.map(p => (
              <div
                key={p.key}
                className={`${p.color} transition-all duration-200`}
                style={{ width: total > 0 ? `${(p.value / total) * 100}%` : '33%' }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {pools.map(p => (
              <span key={p.key} className={`text-xs2 ${p.textColor} font-mono`}>
                {total > 0 ? Math.round((p.value / total) * 100) : 33}%
              </span>
            ))}
          </div>
        </div>

        {/* Window status */}
        {!windowOpen && (
          <div className="px-4 py-2 bg-warn-amber/10 border border-warn-amber/20 rounded-card">
            <p className="text-xs2 text-warn-amber font-semibold">
              Transfer window closed — allocation is locked until the next window.
            </p>
          </div>
        )}

        {/* Sliders */}
        {pools.map(p => {
          const isWages = p.key === 'wages';
          const sliderRunway = isWages && weeklyWages > 0
            ? Math.floor(p.value / weeklyWages)
            : null;

          return (
            <div key={p.key} className="card">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-semibold text-txt-primary">{p.label}</span>
                {isWages && sliderRunway !== null && (
                  <span className={`ml-auto text-xs font-mono font-semibold ${runwayColor}`}>
                    ≈{sliderRunway}w runway
                  </span>
                )}
              </div>
              <p className="text-xs2 text-txt-muted mb-2">{p.desc}</p>

              <input
                type="range"
                min={0}
                max={total}
                step={Math.max(1, Math.round(total / 100))}
                value={p.value}
                disabled={!windowOpen}
                onChange={e => handleSliderChange(p.key, Number(e.target.value))}
                className={`w-full h-2 rounded-full appearance-none cursor-pointer
                  ${windowOpen ? 'accent-txt-primary' : 'opacity-40 cursor-not-allowed'}
                  [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:bg-txt-primary [&::-webkit-slider-thumb]:shadow-md`}
              />

              <div className="flex items-center justify-between mt-1">
                <span className={`text-sm font-mono font-semibold ${p.textColor}`}>
                  {formatMoney(p.value)}
                </span>
                <span className="text-xs2 text-txt-muted font-mono">
                  {total > 0 ? Math.round((p.value / total) * 100) : 0}%
                </span>
              </div>
            </div>
          );
        })}

        {/* Footer actions */}
        {windowOpen ? (
          <div className="flex gap-2 pb-2">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex-1 text-xs px-3 py-2 rounded-tag font-semibold
                bg-bg-raised text-txt-muted hover:text-txt-primary transition-colors
                disabled:opacity-40"
            >
              Reset
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasChanges}
              className="flex-1 text-xs px-3 py-2 rounded-tag font-semibold transition-colors
                bg-data-blue/20 text-data-blue hover:bg-data-blue/30
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Confirm allocation
            </button>
          </div>
        ) : (
          <p className="text-xs2 text-txt-muted text-center pb-2">
            Budget allocation can be changed during transfer windows (weeks 1–4 and 21–24).
          </p>
        )}

      </div>
    </div>
  );
}
