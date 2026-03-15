/**
 * GeometryDrillCard — self-contained interactive geometry challenge.
 *
 * Rendered inside TrainingFocusSlideOver when the Training Ground is
 * level 1+.  Shows a stadium-themed geometry question with:
 *   - progressive hints (up to 3, one at a time)
 *   - numeric answer input + submit
 *   - correct / wrong feedback + full explanation on completion
 *
 * Does not dispatch RECORD_MATH_ATTEMPT — that tracking integration
 * is a follow-up task.
 */

import { useState } from 'react';
import { MathChallenge } from '../social-feed/generateChallenge';

interface GeometryDrillCardProps {
  challenge: MathChallenge;
  /** Called when the player wants a fresh challenge */
  onRefresh: () => void;
}

const TOPIC_ICONS: Record<string, string> = {
  geometry: '📐',
};

export function GeometryDrillCard({ challenge, onRefresh }: GeometryDrillCardProps) {
  const [input,     setInput]     = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [result,    setResult]    = useState<'correct' | 'wrong' | null>(null);

  function handleSubmit() {
    if (result === 'correct') return;
    const parsed = parseFloat(input.replace(/,/g, '').trim());
    if (isNaN(parsed)) return;
    // Tolerance: accept answers within 0.5 of the expected value to handle
    // rounding edge cases (e.g. student rounds differently on a multi-step)
    const correct = Math.abs(parsed - challenge.answer) <= 0.5;
    setResult(correct ? 'correct' : 'wrong');
  }

  function handleTryAgain() {
    setInput('');
    setResult(null);
  }

  function handleNextDrill() {
    setInput('');
    setHintIndex(0);
    setResult(null);
    onRefresh();
  }

  const canHint = hintIndex < 3 && result !== 'correct';

  return (
    <div className="rounded-card border border-pitch-green/30 bg-pitch-green/5 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-pitch-green/20">
        <div className="flex items-center gap-2">
          <span className="text-base">📐</span>
          <span className="text-xs font-semibold text-pitch-green uppercase tracking-wide">
            Groundskeeper's Drill
          </span>
        </div>
        <span className="text-xs2 text-txt-muted data-font">
          {'★'.repeat(challenge.difficulty)}{'☆'.repeat(3 - challenge.difficulty)}
        </span>
      </div>

      {/* Context quote */}
      <div className="px-4 pt-3 pb-0">
        <p className="text-xs text-txt-muted italic leading-relaxed border-l-2 border-pitch-green/30 pl-3">
          "{challenge.context}"
        </p>
      </div>

      {/* Question */}
      <div className="px-4 pt-3 pb-0">
        <p className="text-sm text-txt-primary leading-relaxed">{challenge.question}</p>
      </div>

      {/* Progressive hints */}
      {hintIndex > 0 && (
        <div className="mx-4 mt-3 flex flex-col gap-1.5 bg-bg-raised rounded-tag p-2.5">
          {challenge.hints.slice(0, hintIndex).map((hint, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-pitch-green text-xs2 shrink-0 mt-0.5 font-semibold">
                Hint {i + 1}:
              </span>
              <span className="text-xs text-txt-muted">{hint}</span>
            </div>
          ))}
        </div>
      )}

      {/* Correct state — explanation */}
      {result === 'correct' && (
        <div className="mx-4 mt-3 rounded-tag bg-pitch-green/15 border border-pitch-green/40 px-3 py-2.5">
          <p className="text-xs font-semibold text-pitch-green mb-0.5">Correct! ✓</p>
          <p className="text-xs2 text-txt-muted">{challenge.explanation}</p>
        </div>
      )}

      {/* Wrong state */}
      {result === 'wrong' && (
        <div className="mx-4 mt-3 rounded-tag bg-red-500/10 border border-red-500/30 px-3 py-2">
          <p className="text-xs font-semibold text-red-400">Not quite — check your working.</p>
        </div>
      )}

      {/* Input row */}
      <div className="px-4 pt-3 pb-4">
        {result !== 'correct' ? (
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={`Answer${challenge.unit ? ` (${challenge.unit.trim()})` : ''}`}
              className="flex-1 bg-bg-raised border border-bg-raised/80 rounded-tag px-3 py-2
                         text-sm text-txt-primary placeholder:text-txt-muted
                         focus:outline-none focus:border-pitch-green/50"
            />
            {canHint && (
              <button
                onClick={() => setHintIndex(h => Math.min(h + 1, 3))}
                className="px-3 py-2 rounded-tag border border-warn-amber/40 text-warn-amber
                           text-xs hover:bg-warn-amber/10 transition-colors shrink-0"
              >
                Hint
              </button>
            )}
            {result === 'wrong' ? (
              <button
                onClick={handleTryAgain}
                className="px-3 py-2 rounded-tag border border-data-blue/40 text-data-blue
                           text-xs hover:bg-data-blue/10 transition-colors shrink-0"
              >
                Retry
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="px-3 py-2 rounded-tag bg-pitch-green/20 border border-pitch-green/40
                           text-pitch-green text-xs hover:bg-pitch-green/30 transition-colors
                           disabled:opacity-40 disabled:cursor-default shrink-0"
              >
                Submit
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleNextDrill}
            className="w-full py-2 rounded-tag bg-pitch-green/20 border border-pitch-green/40
                       text-pitch-green text-sm hover:bg-pitch-green/30 transition-colors"
          >
            Next drill →
          </button>
        )}
      </div>
    </div>
  );
}
