import { useState } from 'react';
import { GameState, GameCommand, Formation, formatMoney } from '@calculating-glory/domain';
import { FormationPicker } from './FormationPicker';
import { InheritedSquad } from './InheritedSquad';

interface PreSeasonScreenProps {
  state: GameState;
  dispatch: (command: GameCommand) => { error?: string };
}

type Step = 'formation' | 'squad';

export function PreSeasonScreen({ state, dispatch }: PreSeasonScreenProps) {
  const [step, setStep] = useState<Step>('formation');
  const [pendingFormation, setPendingFormation] = useState<Formation | null>(
    state.club.preferredFormation
  );
  const [error, setError] = useState<string | null>(null);

  const { club } = state;
  const totalWages = club.squad.reduce((s, p) => s + p.wage, 0);

  function confirmFormation() {
    if (!pendingFormation) return;
    const result = dispatch({ type: 'SET_FORMATION', formation: pendingFormation });
    if (result.error) {
      setError(result.error);
    } else {
      setStep('squad');
    }
  }

  function beginSeason() {
    const result = dispatch({ type: 'START_SEASON', season: 1 });
    if (result.error) setError(result.error);
  }

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
            Budget: <span className="text-txt-primary font-mono">{formatMoney(club.transferBudget)}</span>
            <span className="mx-2 text-white/10">|</span>
            Weekly wages: <span className="text-txt-primary font-mono">{formatMoney(totalWages)}/wk</span>
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-bg-surface border-b border-white/5 px-4 py-2">
        <div className="max-w-2xl mx-auto flex gap-1">
          {(['formation', 'squad'] as Step[]).map((s, i) => (
            <button
              key={s}
              onClick={() => step === 'squad' && s === 'formation' ? setStep(s) : undefined}
              className={[
                'flex items-center gap-2 px-3 py-1.5 rounded-tag text-xs font-medium transition-colors',
                step === s
                  ? 'bg-data-blue/20 text-data-blue'
                  : i < (['formation', 'squad'] as Step[]).indexOf(step)
                    ? 'text-txt-muted hover:text-txt-primary cursor-pointer'
                    : 'text-txt-muted/40 cursor-default',
              ].join(' ')}
            >
              <span className="w-4 h-4 rounded-full border flex items-center justify-center text-xs2 border-current">
                {i + 1}
              </span>
              {s === 'formation' ? 'Formation' : 'Your Squad'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

          {step === 'formation' && (
            <>
              {/* Narrative */}
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

          {step === 'squad' && (
            <>
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
