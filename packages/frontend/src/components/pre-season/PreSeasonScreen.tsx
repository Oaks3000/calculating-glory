import { useState } from 'react';
import { GameState, GameCommand, Formation, Manager, formatMoney } from '@calculating-glory/domain';
import { FormationPicker } from './FormationPicker';
import { InheritedSquad } from './InheritedSquad';
import { ManagerPicker } from './ManagerPicker';
import { TermInfo } from '../shared/TermInfo';

interface PreSeasonScreenProps {
  state: GameState;
  dispatch: (command: GameCommand) => { error?: string };
}

type Step = 'formation' | 'manager' | 'squad';

const STEP_LABELS: Record<Step, string> = {
  formation: 'Formation',
  manager: 'Appoint Manager',
  squad: 'Your Squad',
};

const STEPS: Step[] = ['formation', 'manager', 'squad'];

export function PreSeasonScreen({ state, dispatch }: PreSeasonScreenProps) {
  const [step, setStep] = useState<Step>('formation');
  const [pendingFormation, setPendingFormation] = useState<Formation | null>(
    state.club.preferredFormation
  );
  const [pendingManager, setPendingManager] = useState<Manager | null>(
    state.club.manager
  );
  const [error, setError] = useState<string | null>(null);

  const { club } = state;
  const totalWages = club.squad.reduce((s, p) => s + p.wage, 0)
    + club.staff.reduce((s, st) => s + st.salary, 0)
    + (club.manager ? club.manager.wage : 0);
  const wageRunway = totalWages > 0 ? Math.floor(club.wageReserve / totalWages) : Infinity;

  function confirmFormation() {
    if (!pendingFormation) return;
    const result = dispatch({ type: 'SET_FORMATION', formation: pendingFormation });
    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      setStep('manager');
    }
  }

  function confirmManager() {
    if (!pendingManager) return;
    const result = dispatch({ type: 'HIRE_MANAGER', managerId: pendingManager.id });
    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      setStep('squad');
    }
  }

  function skipManager() {
    setError(null);
    setStep('squad');
  }

  function beginSeason() {
    const result = dispatch({ type: 'START_SEASON', season: 1 });
    if (result.error) setError(result.error);
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col">
      {/* Header */}
      <div className="bg-bg-surface border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-warn-amber animate-pulse" />
            <span className="text-xs font-semibold text-warn-amber uppercase tracking-widest">
              Pre-Season
            </span>
          </div>
          <h1 className="text-xl font-bold text-txt-primary">{club.name}</h1>
          <p className="text-sm text-txt-muted mt-0.5">
            <TermInfo termId="transfer-budget" label="Budget" size="inline" />
            : <span className="text-txt-primary font-mono">{formatMoney(club.transferBudget)}</span>
            <span className="mx-2 text-white/10">|</span>
            Weekly wages: <span className="text-txt-primary font-mono">{formatMoney(totalWages)}/wk</span>
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-bg-surface border-b border-white/5 px-4 py-2">
        <div className="max-w-2xl mx-auto flex gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i < stepIndex ? setStep(s) : undefined}
              className={[
                'flex items-center gap-2 px-3 py-1.5 rounded-tag text-xs font-medium transition-colors',
                step === s
                  ? 'bg-data-blue/20 text-data-blue'
                  : i < stepIndex
                    ? 'text-txt-muted hover:text-txt-primary cursor-pointer'
                    : 'text-txt-muted/40 cursor-default',
              ].join(' ')}
            >
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-xs2 border-current">
                {i + 1}
              </span>
              {STEP_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          {/* ── Formation ── */}
          {step === 'formation' && (
            <>
              <div className="bg-bg-surface rounded-card p-5 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">🏟️</div>
                  <div>
                    <h2 className="text-base font-bold text-txt-primary mb-2">
                      Welcome to the Football League
                    </h2>
                    <p className="text-sm text-txt-muted leading-relaxed">
                      You've just been promoted from the non-leagues. The club's been on a shoestring
                      for years — the squad you've inherited is the proof. Most of them are too old,
                      too raw, or just not good enough for League Two.
                    </p>
                    <p className="text-sm text-txt-muted leading-relaxed mt-2">
                      You've got <span className="text-txt-primary font-medium">{formatMoney(club.transferBudget)}</span> to
                      spend and 8 empty squad slots. Use them wisely. The drop back down is only 46 games away.
                    </p>
                  </div>
                </div>
              </div>

              <FormationPicker
                selected={pendingFormation}
                onSelect={setPendingFormation}
              />

              {error && (
                <p className="text-sm text-alert-red bg-alert-red/10 rounded-card px-4 py-2">{error}</p>
              )}

              <button
                onClick={confirmFormation}
                disabled={!pendingFormation}
                className={[
                  'w-full py-3 rounded-card font-semibold text-sm transition-all',
                  pendingFormation
                    ? 'bg-data-blue text-white hover:bg-data-blue/90'
                    : 'bg-bg-raised text-txt-muted/40 cursor-not-allowed',
                ].join(' ')}
              >
                {pendingFormation ? `Confirm ${pendingFormation} →` : 'Pick a formation to continue'}
              </button>
            </>
          )}

          {/* ── Manager ── */}
          {step === 'manager' && (
            <>
              <div className="bg-bg-surface rounded-card p-5 border border-white/5">
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-0.5">🤝</div>
                  <div>
                    <h2 className="text-base font-bold text-txt-primary mb-2">
                      Appoint a Manager
                    </h2>
                    <p className="text-sm text-txt-muted leading-relaxed">
                      You're the owner — you set the strategy, budget and formation. The manager
                      turns your instructions into results on the pitch. A good tactical manager
                      makes your training focus count; a strong motivator keeps morale up through
                      a long season.
                    </p>
                    <p className="text-sm text-txt-muted leading-relaxed mt-2">
                      <TermInfo termId="runway" label="Wage runway" size="inline" />
                      :{' '}
                      <span className={wageRunway >= 8 ? 'text-txt-primary font-medium' : 'text-alert-red font-medium'}>
                        {wageRunway === Infinity ? '∞' : `${wageRunway}w runway`}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <ManagerPicker
                managers={state.managerPool}
                selected={pendingManager}
                onSelect={setPendingManager}
                wageReserve={club.wageReserve}
                currentTotalWages={totalWages}
              />

              {error && (
                <p className="text-sm text-alert-red bg-alert-red/10 rounded-card px-4 py-2">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={skipManager}
                  className="flex-1 py-3 rounded-card font-semibold text-sm bg-bg-raised text-txt-muted hover:text-txt-primary transition-all"
                >
                  Skip for now
                </button>
                <button
                  onClick={confirmManager}
                  disabled={!pendingManager}
                  className={[
                    'flex-1 py-3 rounded-card font-semibold text-sm transition-all',
                    pendingManager
                      ? 'bg-data-blue text-white hover:bg-data-blue/90'
                      : 'bg-bg-raised text-txt-muted/40 cursor-not-allowed',
                  ].join(' ')}
                >
                  {pendingManager ? `Appoint ${pendingManager.name.split(' ')[1]} →` : 'Select a manager'}
                </button>
              </div>
            </>
          )}

          {/* ── Squad ── */}
          {step === 'squad' && (
            <>
              {club.manager && (
                <div className="bg-bg-surface rounded-card px-4 py-3 border border-white/5 flex items-center gap-3">
                  <div className="text-lg">🤝</div>
                  <div className="text-sm text-txt-muted">
                    Manager:{' '}
                    <span className="text-txt-primary font-medium">{club.manager.name}</span>
                    <span className="mx-1.5 text-white/20">·</span>
                    {formatMoney(club.manager.wage)}/wk
                  </div>
                </div>
              )}

              <InheritedSquad
                squad={club.squad}
                formation={club.preferredFormation}
              />

              {error && (
                <p className="text-sm text-alert-red bg-alert-red/10 rounded-card px-4 py-2">{error}</p>
              )}

              <div className="bg-bg-surface rounded-card p-4 border border-white/5 text-sm text-txt-muted">
                <p>
                  Transfers open once the season kicks off. For now — take a good look at what you're working with.
                </p>
              </div>

              <button
                onClick={beginSeason}
                className="w-full py-3 rounded-card font-semibold text-sm bg-pitch-green text-white hover:bg-pitch-green/90 transition-all"
              >
                Begin Season →
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
