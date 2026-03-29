import { useState } from 'react';

interface Props {
  onResult: (correct: boolean) => void;
}

const CORRECT_ANSWER = 2700; // £2,700 in pounds
const QUESTION = 'If average attendance is 1,500 per match across 3 friendlies, what is the total income from Option B at £0.60 per fan per match?';
const HINT = 'Think about it: 1,500 fans × 3 matches × £0.60 each. Work it out step by step.';

function isClose(value: number): boolean {
  return Math.abs(value - CORRECT_ANSWER) <= 100;
}

export function MathsChallenge({ onResult }: Props) {
  const [input, setInput] = useState('');
  const [attempt, setAttempt] = useState(0); // 0 = fresh, 1 = first wrong, 2 = revealed
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'revealed' | null>(null);

  function handleSubmit() {
    const raw = input.replace(/[£,\s]/g, '');
    const value = parseFloat(raw);
    if (isNaN(value)) return;

    if (Math.abs(value - CORRECT_ANSWER) < 1) {
      setFeedback('correct');
      setTimeout(() => onResult(true), 1200);
    } else if (attempt === 0) {
      setFeedback('wrong');
      setAttempt(1);
      setInput('');
    } else {
      setFeedback('revealed');
      setTimeout(() => onResult(false), 2000);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="bg-bg-surface border border-bg-raised rounded-card p-4 space-y-3">
      <p className="text-sm text-txt-primary leading-relaxed">{QUESTION}</p>

      {feedback === 'correct' && (
        <div className="text-sm text-pitch-green font-semibold animate-fade-in">
          Correct — £2,700. Option B is better on paper, but attendance isn't guaranteed.
        </div>
      )}

      {feedback === 'wrong' && (
        <div className="text-sm text-warn-amber animate-fade-in">
          Not quite. {HINT}
        </div>
      )}

      {feedback === 'revealed' && (
        <div className="text-sm text-txt-muted animate-fade-in">
          The answer is <span className="text-txt-primary font-semibold">£2,700</span> — 1,500 × 3 × £0.60. So Option B is worth more if attendance holds up.
        </div>
      )}

      {feedback !== 'correct' && feedback !== 'revealed' && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted text-sm">£</span>
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="0"
              className="w-full bg-bg-raised border border-bg-raised focus:border-data-blue outline-none
                         rounded-card pl-7 pr-3 py-2 text-sm text-txt-primary tabular-nums
                         transition-colors duration-150"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-4 py-2 rounded-card text-sm font-semibold bg-data-blue text-white
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-data-blue/90 transition-colors duration-150"
          >
            {attempt === 1 ? 'Try again' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  );
}
