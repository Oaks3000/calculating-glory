import { useState } from 'react';
import { GameState, GameCommand, formatMoney } from '@calculating-glory/domain';

interface ForcedOutScreenProps {
  state: GameState;
  dispatch: (command: GameCommand) => { error?: string };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function ForcedOutScreen({ state, dispatch }: ForcedOutScreenProps) {
  const [step, setStep] = useState<'ousted' | 'offer'>('ousted');
  const [error, setError]   = useState<string | null>(null);

  const fo = state.forcedOut;
  if (!fo) return null;

  function handleAccept() {
    const result = dispatch({ type: 'ACCEPT_TAKEOVER' });
    if (result.error) setError(result.error);
  }

  // ── Step 1: Ousted ─────────────────────────────────────────────────────────
  if (step === 'ousted') {
    return (
      <div className="min-h-screen bg-bg-deep text-txt-primary flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full space-y-6">

          {/* Icon + headline */}
          <div className="text-center space-y-3">
            <div className="text-6xl">🔴</div>
            <h1 className="text-3xl font-bold text-alert-red tracking-tight">
              The Board Has Had Enough
            </h1>
            <p className="text-txt-muted text-sm">
              Season {state.season} · Week {state.currentWeek}
            </p>
          </div>

          {/* Situation summary */}
          <div className="card border border-alert-red/30 bg-alert-red/5 space-y-3">
            <p className="text-txt-primary text-sm leading-relaxed">
              You took <span className="font-semibold text-txt-primary">{fo.previousClubName}</span> into
              the season with ambitions of survival. Instead you find yourself{' '}
              <span className="text-alert-red font-semibold">{ordinal(fo.previousPosition)} in the table</span>,
              with just{' '}
              <span className="text-alert-red font-semibold">{formatMoney(state.club.transferBudget)}</span> left
              in the kitty.
            </p>
            <p className="text-txt-primary text-sm leading-relaxed">
              The board has voted unanimously: you're out. Security has already changed the locks.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-xs2 text-txt-muted uppercase tracking-wide mb-1">Position</p>
              <p className="text-2xl font-bold data-font text-alert-red">{ordinal(fo.previousPosition)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs2 text-txt-muted uppercase tracking-wide mb-1">Week</p>
              <p className="text-2xl font-bold data-font text-txt-primary">{state.currentWeek}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs2 text-txt-muted uppercase tracking-wide mb-1">Budget Left</p>
              <p className="text-2xl font-bold data-font text-warn-amber">{formatMoney(state.club.transferBudget)}</p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setStep('offer')}
            className="w-full py-3 rounded-tag bg-data-blue text-white font-semibold text-sm hover:bg-data-blue/80 active:scale-95 transition-all"
          >
            See what comes next →
          </button>

        </div>
      </div>
    );
  }

  // ── Step 2: Takeover offer ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-deep text-txt-primary flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-6">

        {/* Headline */}
        <div className="text-center space-y-3">
          <div className="text-6xl">📋</div>
          <h1 className="text-2xl font-bold text-txt-primary tracking-tight">
            An Urgent Offer
          </h1>
          <p className="text-txt-muted text-sm">
            Word travels fast in football.
          </p>
        </div>

        {/* Narrative */}
        <div className="card border border-data-blue/30 bg-data-blue/5 space-y-2">
          <p className="text-txt-primary text-sm leading-relaxed">
            <span className="font-semibold text-data-blue">{fo.takeoverClubName}</span> — bottom of the
            league, board in crisis, fans revolting — have been told their manager has walked out.
            They need someone to steady the ship. Immediately.
          </p>
          <p className="text-txt-primary text-sm leading-relaxed">
            It's not glamorous. The budget is almost nothing. The squad is rough.
            But it's a job — and your reputation as an owner who{' '}
            <span className="text-data-blue font-semibold">knows the numbers</span> has followed you.
          </p>
        </div>

        {/* What you inherit */}
        <div className="space-y-2">
          <p className="text-xs2 text-txt-muted uppercase tracking-wide">What you're walking into</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <p className="text-xs2 text-txt-muted mb-1">Starting Budget</p>
              <p className="text-lg font-bold data-font text-warn-amber">{formatMoney(5_000_000)}</p>
            </div>
            <div className="card text-center">
              <p className="text-xs2 text-txt-muted mb-1">League Position</p>
              <p className="text-lg font-bold data-font text-alert-red">
                {ordinal(state.league.entries.find(e => e.clubId === fo.takeoverClubId)?.position ?? 24)}
              </p>
            </div>
          </div>
        </div>

        {/* Business acumen carry-over callout */}
        <div className="flex items-start gap-3 bg-pitch-green/10 border border-pitch-green/30 rounded-card p-3">
          <span className="text-lg">🎓</span>
          <div>
            <p className="text-xs2 font-semibold text-pitch-green uppercase tracking-wide mb-0.5">
              Knowledge carries over
            </p>
            <p className="text-xs2 text-txt-muted">
              Your Business Acumen — built through every deal and decision — comes with you. It's the one
              thing the board at {fo.previousClubName} couldn't take away.
            </p>
          </div>
        </div>

        {/* Win condition */}
        <div className="flex items-start gap-3 bg-warn-amber/10 border border-warn-amber/30 rounded-card p-3">
          <span className="text-lg">🎯</span>
          <div>
            <p className="text-xs2 font-semibold text-warn-amber uppercase tracking-wide mb-0.5">
              Win condition
            </p>
            <p className="text-xs2 text-txt-muted">
              Survive. Finish the season outside the bottom three and you've redeemed yourself.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-alert-red text-xs2 text-center">{error}</p>
        )}

        {/* CTAs */}
        <div className="space-y-2">
          <button
            onClick={handleAccept}
            className="w-full py-3 rounded-tag bg-pitch-green text-white font-semibold text-sm hover:bg-pitch-green/80 active:scale-95 transition-all"
          >
            Accept — take over {fo.takeoverClubName}
          </button>
          <button
            onClick={() => setStep('ousted')}
            className="w-full py-2 rounded-tag text-txt-muted text-xs2 hover:text-txt-primary transition-colors"
          >
            ← Back
          </button>
        </div>

      </div>
    </div>
  );
}
