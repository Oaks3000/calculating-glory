import { MathChallenge } from './generateChallenge';

interface MathChallengeCardProps {
  challenge: MathChallenge;
  hintIndex: number; // 0 = no hints shown yet
}

const TOPIC_LABELS: Record<string, string> = {
  percentage: 'Percentages',
  decimals: 'Decimals',
  ratios: 'Ratios',
  algebra: 'Algebra',
  statistics: 'Statistics',
};

const DIFFICULTY_STARS = ['', '★', '★★', '★★★'];

export function MathChallengeCard({ challenge, hintIndex }: MathChallengeCardProps) {
  return (
    <div className="mx-3 my-1 bg-data-blue/10 border border-data-blue/30 rounded-card p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="badge bg-data-blue/20 text-data-blue text-xs2">
          {TOPIC_LABELS[challenge.topic] ?? challenge.topic}
        </span>
        <span className="text-warn-amber text-xs2 data-font">
          {DIFFICULTY_STARS[challenge.difficulty]}
        </span>
      </div>

      {/* Question */}
      <p className="text-sm text-txt-primary leading-relaxed">{challenge.question}</p>

      {/* Progressive hints */}
      {hintIndex > 0 && (
        <div className="flex flex-col gap-1 border-t border-data-blue/20 pt-2">
          {challenge.hints.slice(0, hintIndex).map((hint, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-data-blue text-xs2 shrink-0 mt-0.5">
                Hint {i + 1}:
              </span>
              <span className="text-xs text-txt-muted">{hint}</span>
            </div>
          ))}
        </div>
      )}

      {/* Full explanation if all hints used */}
      {hintIndex >= 3 && (
        <div className="bg-pitch-green/10 border border-pitch-green/30 rounded-tag px-2 py-1">
          <span className="text-xs2 text-pitch-green font-semibold">Answer: </span>
          <span className="text-xs2 text-txt-primary data-font">
            {challenge.answer}{challenge.unit} — {challenge.explanation}
          </span>
        </div>
      )}
    </div>
  );
}
