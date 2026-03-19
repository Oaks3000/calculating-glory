/**
 * ScoutNetworkSlideOver
 *
 * Opened when the player clicks the Scout Network core unit.
 *
 * State machine reflected in the UI:
 *   NO_MISSION   → pick position/priority, start mission
 *   SEARCHING    → "Scout is out, results next week"
 *   TARGET_FOUND → player card + wage offer + negotiate (math challenge)
 *   BID_PENDING  → "Bid submitted, transfer completes when window opens"
 *   BID_REJECTED → player card + "Negotiation failed — try again"
 */

import { useState } from 'react';
import {
  GameState,
  GameCommand,
  Position,
  formatMoney,
  getScoutedPotential,
  scoutNoiseRange,
  getScoutLevel,
  nextWindowLabel,
  getScoutFee,
} from '@calculating-glory/domain';
import { SlideOver } from '../shared/SlideOver';
import { MathChallengeCard } from '../social-feed/MathChallengeCard';
import { generateChallenge } from '../social-feed/generateChallenge';

interface ScoutNetworkSlideOverProps {
  isOpen:   boolean;
  onClose:  () => void;
  state:    GameState;
  dispatch: (command: GameCommand) => { error?: string };
}

const POSITIONS: Position[]         = ['GK', 'DEF', 'MID', 'FWD'];
const ATTR_OPTIONS                  = [null, 'attack', 'defence', 'teamwork'] as const;
type  AttrPriority                  = typeof ATTR_OPTIONS[number];
const ATTR_LABELS: Record<string, string> = {
  attack: 'Attacking',
  defence: 'Defensive',
  teamwork: 'Teamwork',
};

export function ScoutNetworkSlideOver({
  isOpen, onClose, state, dispatch,
}: ScoutNetworkSlideOverProps) {
  const { club, scoutMission } = state;
  const scoutLevel = getScoutLevel(club.facilities);
  const scoutFee   = getScoutFee(scoutLevel);
  const noiseRange = scoutNoiseRange(scoutLevel);

  // ── Form state (NO_MISSION view) ────────────────────────────────────────────
  const [position,   setPosition]   = useState<Position>('MID');
  const [attrPri,    setAttrPri]    = useState<AttrPriority>(null);
  const [budgetCeil, setBudgetCeil] = useState(
    Math.floor(club.transferBudget / 2 / 100) * 100  // half current budget, rounded
  );

  // ── Negotiate / math challenge state ────────────────────────────────────────
  const [showChallenge, setShowChallenge]   = useState(false);
  const [hintIndex,     setHintIndex]       = useState(0);
  const [userAnswer,    setUserAnswer]      = useState('');
  const [challengeIdx,  setChallengeIdx]    = useState(0);
  const [offeredWage,   setOfferedWage]     = useState(
    scoutMission?.target?.wage ?? 150_000
  );
  const [error, setError] = useState<string | null>(null);

  const challenge = generateChallenge(state, challengeIdx, undefined, 'ratios');

  function handleStartMission() {
    if (budgetCeil <= 0) { setError('Set a budget ceiling above zero'); return; }
    const result = dispatch({
      type: 'START_SCOUT_MISSION',
      position,
      attributePriority: attrPri,
      budgetCeiling: budgetCeil * 100, // UI is in pounds
    });
    if (result.error) setError(result.error);
    else setError(null);
  }

  function handleCancel() {
    const result = dispatch({ type: 'CANCEL_SCOUT_MISSION' });
    if (result.error) setError(result.error);
    else { setError(null); setShowChallenge(false); setUserAnswer(''); setHintIndex(0); }
  }

  function handleNegotiateClick() {
    setOfferedWage(scoutMission?.target?.wage ?? 150_000);
    setUserAnswer('');
    setHintIndex(0);
    setShowChallenge(true);
  }

  function handleSubmitAnswer() {
    const parsed  = parseFloat(userAnswer);
    const correct = !isNaN(parsed) && Math.abs(parsed - challenge.answer) < 0.05;

    dispatch({
      type:           'RECORD_MATH_ATTEMPT',
      studentId:      club.id,
      topic:          challenge.topic,
      difficulty:     challenge.difficulty,
      answer:         userAnswer,
      expectedAnswer: String(challenge.answer),
      startTime:      Date.now() - 5000,
      endTime:        Date.now(),
    });

    const result = dispatch({
      type:              'PLACE_SCOUT_BID',
      negotiationPassed: correct,
      offeredWage,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      setShowChallenge(false);
      setUserAnswer('');
      setHintIndex(0);
      if (!correct) setChallengeIdx(prev => prev + 1); // fresh challenge next time
    }
  }

  // ── Shared header ────────────────────────────────────────────────────────────
  function ScoutHeader() {
    return (
      <div className="px-4 py-3 bg-bg-raised border-b border-bg-raised/50 shrink-0 flex items-center justify-between">
        <div>
          <p className="text-xs2 text-txt-muted uppercase tracking-wide">Scout Level</p>
          <p className="text-2xl font-black data-font text-pitch-green">{scoutLevel}</p>
        </div>
        <div className="text-right">
          <p className="text-xs2 text-txt-muted uppercase tracking-wide">Potential reading</p>
          <p className="text-sm font-semibold text-warn-amber">
            {noiseRange === 0 ? 'Exact' : `±${noiseRange} noise`}
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // VIEW: No active mission
  // ────────────────────────────────────────────────────────────────────────────
  if (!scoutMission) {
    return (
      <SlideOver isOpen={isOpen} onClose={onClose} title="🔭 Scout Network">
        <div className="flex flex-col h-full">
          <ScoutHeader />

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

            {/* Scout fee callout */}
            <div className="card bg-bg-raised border border-bg-raised/50">
              <p className="text-xs2 text-txt-muted uppercase tracking-wide mb-1">Mission cost</p>
              <p className="text-lg font-bold data-font text-data-blue">
                {formatMoney(scoutFee)}
              </p>
              <p className="text-xs2 text-txt-muted mt-0.5">
                Paid upfront. Scout finds a target next week.
              </p>
            </div>

            {/* Position picker */}
            <div>
              <p className="text-xs text-txt-muted uppercase tracking-wide mb-2">Position needed</p>
              <div className="grid grid-cols-4 gap-1.5">
                {POSITIONS.map(pos => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={[
                      'py-2 rounded-card border text-sm font-bold transition-colors',
                      position === pos
                        ? 'bg-data-blue/20 border-data-blue text-data-blue'
                        : 'bg-bg-raised border-bg-raised/50 text-txt-muted hover:border-data-blue/40',
                    ].join(' ')}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Attribute priority */}
            <div>
              <p className="text-xs text-txt-muted uppercase tracking-wide mb-2">
                Attribute priority <span className="normal-case text-txt-muted/60">(optional)</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ATTR_OPTIONS.map(opt => (
                  <button
                    key={opt ?? 'none'}
                    onClick={() => setAttrPri(opt)}
                    className={[
                      'px-3 py-1.5 rounded-tag border text-xs font-semibold transition-colors',
                      attrPri === opt
                        ? 'bg-pitch-green/20 border-pitch-green text-pitch-green'
                        : 'bg-bg-raised border-bg-raised/50 text-txt-muted hover:border-pitch-green/40',
                    ].join(' ')}
                  >
                    {opt === null ? 'Any' : ATTR_LABELS[opt]}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget ceiling */}
            <div>
              <p className="text-xs text-txt-muted uppercase tracking-wide mb-1">
                Max transfer fee (£)
              </p>
              <input
                type="number"
                min={0}
                step={1000}
                value={Math.round(budgetCeil / 100)}
                onChange={e => setBudgetCeil(Number(e.target.value) * 100)}
                className="w-full bg-bg-raised border border-bg-raised/50 rounded-card px-3 py-2 text-sm text-txt-primary data-font focus:outline-none focus:border-data-blue/60"
              />
              <p className="text-xs2 text-txt-muted mt-1">
                Available: {formatMoney(club.transferBudget)}
              </p>
            </div>

            {error && (
              <p className="text-xs text-warn-red bg-warn-red/10 border border-warn-red/30 rounded-card px-3 py-2">
                {error}
              </p>
            )}

            {/* CTA */}
            <button
              onClick={handleStartMission}
              disabled={scoutFee > club.transferBudget}
              className="btn-primary w-full disabled:opacity-40"
            >
              Start Scout Mission — {formatMoney(scoutFee)}
            </button>

            {scoutFee > club.transferBudget && (
              <p className="text-xs2 text-txt-muted text-center -mt-2">
                Insufficient budget for scout fee
              </p>
            )}
          </div>
        </div>
      </SlideOver>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // VIEW: SEARCHING
  // ────────────────────────────────────────────────────────────────────────────
  if (scoutMission.status === 'SEARCHING') {
    return (
      <SlideOver isOpen={isOpen} onClose={onClose} title="🔭 Scout Network">
        <div className="flex flex-col h-full">
          <ScoutHeader />
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

            <div className="card bg-data-blue/5 border border-data-blue/30 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg animate-pulse">🔍</span>
                <p className="text-sm font-semibold text-data-blue">Scout is searching…</p>
              </div>
              <p className="text-xs2 text-txt-muted">
                Looking for a{' '}
                <span className="text-txt-primary font-semibold">
                  {scoutMission.attributePriority
                    ? `${ATTR_LABELS[scoutMission.attributePriority]} `
                    : ''}
                  {scoutMission.position}
                </span>{' '}
                with a max fee of{' '}
                <span className="text-txt-primary font-semibold">
                  {formatMoney(scoutMission.budgetCeiling)}
                </span>.
              </p>
              <p className="text-xs2 text-txt-muted border-t border-data-blue/20 pt-2">
                Results arrive next week.
              </p>
            </div>

            {error && (
              <p className="text-xs text-warn-red bg-warn-red/10 border border-warn-red/30 rounded-card px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleCancel}
              className="btn-secondary w-full text-warn-red border-warn-red/40 hover:bg-warn-red/10"
            >
              Cancel Mission
            </button>

          </div>
        </div>
      </SlideOver>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // VIEWS: TARGET_FOUND / BID_REJECTED
  // ────────────────────────────────────────────────────────────────────────────
  if (scoutMission.status === 'TARGET_FOUND' || scoutMission.status === 'BID_REJECTED') {
    const target       = scoutMission.target!;
    const scoutedPot   = getScoutedPotential(target, scoutLevel);
    const potPrefix    = noiseRange >= 10 ? '~' : noiseRange >= 3 ? '≈' : '';
    const askingPrice  = scoutMission.askingPrice!;
    const canAfford    = askingPrice <= club.transferBudget;
    const currentTotalWages = club.squad.reduce((s, p) => s + p.wage, 0);
    const wageRoomLeft = club.wageBudget - currentTotalWages;
    const wageOfferedPounds = Math.round(offeredWage / 100);

    return (
      <SlideOver isOpen={isOpen} onClose={onClose} title="🔭 Scout Network">
        <div className="flex flex-col h-full">
          <ScoutHeader />
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

            {/* Status banner */}
            {scoutMission.status === 'BID_REJECTED' && (
              <div className="card bg-warn-red/10 border border-warn-red/30">
                <p className="text-xs font-semibold text-warn-red">
                  Negotiation failed — the player wasn't convinced. Try again.
                </p>
              </div>
            )}

            {/* Target player card */}
            <div className="card bg-bg-raised border border-bg-raised/50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-txt-primary">{target.name}</p>
                  <p className="text-xs2 text-txt-muted mt-0.5">
                    Age {target.age} · {target.position} · {scoutMission.targetNpcClubName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black data-font text-data-blue">
                    {target.overallRating}
                  </p>
                  <p className="text-xs2 text-txt-muted">OVR</p>
                </div>
              </div>

              {/* Attributes */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                {[
                  { label: 'ATK', val: target.attributes.attack },
                  { label: 'DEF', val: target.attributes.defence },
                  { label: 'TWK', val: target.attributes.teamwork },
                ].map(({ label, val }) => (
                  <div key={label} className="bg-bg-deep rounded-tag py-1.5">
                    <p className="text-xs2 text-txt-muted">{label}</p>
                    <p className="text-sm font-bold data-font text-txt-primary">{val}</p>
                  </div>
                ))}
              </div>

              {/* Potential */}
              <div className="flex items-center justify-between border-t border-bg-raised/50 pt-2">
                <p className="text-xs2 text-txt-muted">Scouted potential</p>
                <p className="text-sm font-bold data-font text-warn-amber">
                  {potPrefix}{scoutedPot}
                  {noiseRange > 0 && (
                    <span className="text-xs2 text-txt-muted font-normal ml-1">
                      (±{noiseRange})
                    </span>
                  )}
                </p>
              </div>

              {/* Asking price */}
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs2 text-txt-muted">Asking price</p>
                <p className={[
                  'text-sm font-bold data-font',
                  canAfford ? 'text-pitch-green' : 'text-warn-red',
                ].join(' ')}>
                  {formatMoney(askingPrice)}
                </p>
              </div>

              {/* Current wage */}
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs2 text-txt-muted">Current wage</p>
                <p className="text-sm font-bold data-font text-txt-primary">
                  {formatMoney(target.wage)}/wk
                </p>
              </div>
            </div>

            {/* Transfer window note */}
            <div className="card bg-warn-amber/5 border border-warn-amber/20">
              <p className="text-xs2 text-txt-muted">
                <span className="text-warn-amber font-semibold">Transfer window: </span>
                A successful bid is held until the window opens
                ({nextWindowLabel(state.currentWeek)}). Scouting and
                negotiating can happen any time.
              </p>
            </div>

            {/* Wage offer input */}
            {!showChallenge && (
              <div>
                <p className="text-xs text-txt-muted uppercase tracking-wide mb-1">
                  Wage offer (£/week)
                </p>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={wageOfferedPounds}
                  onChange={e => setOfferedWage(Number(e.target.value) * 100)}
                  className="w-full bg-bg-raised border border-bg-raised/50 rounded-card px-3 py-2 text-sm text-txt-primary data-font focus:outline-none focus:border-data-blue/60"
                />
                <p className="text-xs2 text-txt-muted mt-1">
                  Wage room: {formatMoney(wageRoomLeft)}/wk remaining
                </p>
              </div>
            )}

            {/* Math challenge */}
            {showChallenge && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-txt-muted uppercase tracking-wide">
                  Negotiate the transfer — solve to proceed
                </p>
                <MathChallengeCard challenge={challenge} hintIndex={hintIndex} />

                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Your answer"
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmitAnswer()}
                    className="flex-1 bg-bg-raised border border-bg-raised/50 rounded-card px-3 py-2 text-sm text-txt-primary data-font focus:outline-none focus:border-data-blue/60"
                  />
                  {hintIndex < 3 && (
                    <button
                      onClick={() => setHintIndex(h => Math.min(h + 1, 3))}
                      className="btn-secondary text-xs px-3"
                    >
                      Hint
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer}
                    className="btn-primary flex-1 disabled:opacity-40"
                  >
                    Submit Answer
                  </button>
                  <button
                    onClick={() => { setShowChallenge(false); setUserAnswer(''); setHintIndex(0); }}
                    className="btn-secondary px-4"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-warn-red bg-warn-red/10 border border-warn-red/30 rounded-card px-3 py-2">
                {error}
              </p>
            )}

            {/* CTA row */}
            {!showChallenge && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleNegotiateClick}
                  disabled={!canAfford || offeredWage > wageRoomLeft}
                  className="btn-primary w-full disabled:opacity-40"
                >
                  {scoutMission.status === 'BID_REJECTED' ? 'Try Again' : 'Negotiate Transfer'}
                </button>
                {!canAfford && (
                  <p className="text-xs2 text-warn-red text-center">
                    Budget too low for asking price
                  </p>
                )}
                {offeredWage > wageRoomLeft && canAfford && (
                  <p className="text-xs2 text-warn-red text-center">
                    Wage offer exceeds remaining wage room
                  </p>
                )}
                <button onClick={handleCancel} className="btn-secondary w-full text-xs">
                  Abandon Mission
                </button>
              </div>
            )}
          </div>
        </div>
      </SlideOver>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // VIEW: BID_PENDING
  // ────────────────────────────────────────────────────────────────────────────
  const target      = scoutMission.target!;
  const scoutedPot  = getScoutedPotential(target, scoutLevel);
  const potPrefix   = noiseRange >= 10 ? '~' : noiseRange >= 3 ? '≈' : '';

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="🔭 Scout Network">
      <div className="flex flex-col h-full">
        <ScoutHeader />
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Status banner */}
          <div className="card bg-pitch-green/10 border border-pitch-green/30">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-pitch-green">✓</span>
              <p className="text-sm font-semibold text-pitch-green">Bid submitted</p>
            </div>
            <p className="text-xs2 text-txt-muted">
              Transfer will complete when the{' '}
              <span className="text-warn-amber font-semibold">
                {nextWindowLabel(state.currentWeek)}
              </span>{' '}
              opens.
            </p>
          </div>

          {/* Target summary card */}
          <div className="card bg-bg-raised border border-bg-raised/50">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-txt-primary">{target.name}</p>
                <p className="text-xs2 text-txt-muted mt-0.5">
                  Age {target.age} · {target.position} · {scoutMission.targetNpcClubName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black data-font text-data-blue">
                  {target.overallRating}
                </p>
                <p className="text-xs2 text-txt-muted">OVR</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-bg-raised/50 pt-2">
              <p className="text-xs2 text-txt-muted">Scouted potential</p>
              <p className="text-sm font-bold data-font text-warn-amber">
                {potPrefix}{scoutedPot}
              </p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs2 text-txt-muted">Agreed fee</p>
              <p className="text-sm font-bold data-font text-pitch-green">
                {formatMoney(scoutMission.askingPrice!)}
              </p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs2 text-txt-muted">Agreed wage</p>
              <p className="text-sm font-bold data-font text-pitch-green">
                {formatMoney(scoutMission.offeredWage!)}/wk
              </p>
            </div>
          </div>

          <button onClick={handleCancel} className="btn-secondary w-full text-xs text-warn-red border-warn-red/40 hover:bg-warn-red/10">
            Pull Out of Deal
          </button>

        </div>
      </div>
    </SlideOver>
  );
}
