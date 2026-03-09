import { useState } from 'react';
import {
  GameState,
  GameEvent,
  assessReadinessForProgression,
  getAllCurriculumLevels,
  setCurriculumLevel,
  CurriculumLevel,
  ProgressionEvidence,
  CURRICULUM_LEVELS,
} from '@calculating-glory/domain';

// ── Criterion row ─────────────────────────────────────────────────────────────

interface CriterionRowProps {
  label: string;
  met: boolean;
  value: number;
  required: number;
  format: (n: number) => string;
  higherIsBetter?: boolean;
}

function CriterionRow({ label, met, value, required, format, higherIsBetter = true }: CriterionRowProps) {
  const fillPct = higherIsBetter
    ? Math.min(100, (value / required) * 100)
    : Math.min(100, (required / Math.max(value, 0.01)) * 100);

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-bg-raised last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono shrink-0 ${met ? 'text-pitch-green' : 'text-alert-red'}`}>
            {met ? '✓' : '✗'}
          </span>
          <span className="text-xs text-txt-primary">{label}</span>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xs font-mono ${met ? 'text-pitch-green' : 'text-txt-muted'}`}>
            {format(value)}
          </span>
          <span className="text-xs2 text-txt-muted/60 ml-1">/ {format(required)}</span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-bg-raised rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${met ? 'bg-pitch-green' : 'bg-data-blue/60'}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  );
}

// ── Topic chips ───────────────────────────────────────────────────────────────

const TOPIC_LABELS: Record<string, string> = {
  BASIC_ARITHMETIC:    'Arithmetic',
  DECIMALS:            'Decimals',
  PERCENTAGES:         'Percentages',
  SIMPLE_FRACTIONS:    'Fractions',
  RATIOS:              'Ratios',
  BASIC_ALGEBRA:       'Algebra',
  DATA_INTERPRETATION: 'Data',
  COMPOUND_PERCENTAGES:'Compound %',
  NEGATIVE_NUMBERS:    'Negatives',
  SIMULTANEOUS_EQUATIONS: 'Simultaneous Eq.',
  PROBABILITY:         'Probability',
  SEQUENCES:           'Sequences',
  TRIGONOMETRY:        'Trigonometry',
  QUADRATIC_EQUATIONS: 'Quadratics',
  ADVANCED_PROBABILITY:'Adv. Probability',
  STATISTICAL_ANALYSIS:'Statistics',
  GRAPH_INTERPRETATION:'Graphs',
};

// ── Level selector (teacher control) ─────────────────────────────────────────

interface LevelSelectorProps {
  current: CurriculumLevel;
  onChange: (level: CurriculumLevel) => void;
}

function LevelSelector({ current, onChange }: LevelSelectorProps) {
  const [open, setOpen] = useState(false);
  const levels = getAllCurriculumLevels();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-card
                   bg-bg-raised border border-bg-raised hover:border-data-blue/40
                   text-xs text-txt-muted transition-colors"
      >
        <span>Change level</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-bg-surface border border-bg-raised
                        rounded-card overflow-hidden shadow-xl z-10">
          {levels.map(l => (
            <button
              key={l.level}
              onClick={() => { onChange(l.level); setOpen(false); }}
              className={[
                'w-full text-left px-3 py-2 text-xs transition-colors',
                l.level === current
                  ? 'bg-data-blue/15 text-data-blue font-semibold'
                  : 'text-txt-muted hover:bg-bg-raised hover:text-txt-primary',
              ].join(' ')}
            >
              {l.displayName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Evidence section ──────────────────────────────────────────────────────────

function EvidenceSection({ evidence }: { evidence: ProgressionEvidence }) {
  const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
  const dp2 = (v: number) => v.toFixed(2);

  return (
    <div className="px-4">
      <CriterionRow
        label="Overall accuracy"
        met={evidence.overallAccuracy.met}
        value={evidence.overallAccuracy.value}
        required={evidence.overallAccuracy.required}
        format={pct}
      />
      <CriterionRow
        label="Hard problem accuracy"
        met={evidence.hardProblemAccuracy.met}
        value={evidence.hardProblemAccuracy.value}
        required={evidence.hardProblemAccuracy.required}
        format={pct}
      />
      <CriterionRow
        label="Hints used per problem"
        met={evidence.hintsUsage.met}
        value={evidence.hintsUsage.value}
        required={evidence.hintsUsage.required}
        format={dp2}
        higherIsBetter={false}
      />
      <CriterionRow
        label="Speed vs. expected"
        met={evidence.timeEfficiency.met}
        value={evidence.timeEfficiency.value}
        required={evidence.timeEfficiency.required}
        format={v => `${v.toFixed(1)}×`}
        higherIsBetter={false}
      />
      <CriterionRow
        label="Topic consistency"
        met={evidence.topicConsistency.met}
        value={evidence.topicConsistency.value}
        required={evidence.topicConsistency.required}
        format={pct}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface LearningProgressSlideOverProps {
  state: GameState;
  events: GameEvent[];
}

export function LearningProgressSlideOver({ state, events }: LearningProgressSlideOverProps) {
  const [curriculumLevel, setCurrLevel] = useState<CurriculumLevel>(state.curriculum.level);

  const config  = CURRICULUM_LEVELS[curriculumLevel];
  const assessment = assessReadinessForProgression(events);
  const { evidence, readinessScore, recommendations, nextLevel } = assessment;
  const hasData = evidence.sampleSize >= 20;

  function handleLevelChange(level: CurriculumLevel) {
    setCurrLevel(level);
    setCurriculumLevel(level);
  }

  const allLevels: CurriculumLevel[] = ['YEAR_7', 'YEAR_8', 'YEAR_9', 'GCSE_FOUNDATION', 'GCSE_HIGHER'];
  const levelIndex = allLevels.indexOf(curriculumLevel);

  return (
    <div className="flex flex-col h-full pb-4">

      {/* ── Current level header ──────────────────────────────────────────── */}
      <div className="px-4 py-4 bg-bg-raised border-b border-bg-raised/50 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-txt-muted uppercase tracking-wide mb-0.5">Current Level</p>
            <p className="text-xl font-bold text-txt-primary">{config.displayName}</p>
            <p className="text-xs2 text-txt-muted">{config.leagueLevel.replace('_', ' ')} · {config.topics.length} topics active</p>
          </div>
          {/* Level pip track */}
          <div className="flex gap-1.5 items-center">
            {allLevels.map((l, i) => (
              <div
                key={l}
                className={[
                  'rounded-full transition-all',
                  i < levelIndex ? 'w-2 h-2 bg-pitch-green' :
                  i === levelIndex ? 'w-3 h-3 bg-data-blue ring-2 ring-data-blue/30' :
                  'w-2 h-2 bg-bg-surface',
                ].join(' ')}
              />
            ))}
          </div>
        </div>

        {/* Progress toward next level */}
        {nextLevel && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs2 text-txt-muted">
                Progress → {CURRICULUM_LEVELS[nextLevel].displayName}
              </span>
              <span className={`text-xs2 font-mono ${
                readinessScore >= 80 ? 'text-pitch-green' :
                readinessScore >= 50 ? 'text-warn-amber' : 'text-txt-muted'
              }`}>
                {Math.round(readinessScore)}%
              </span>
            </div>
            <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  readinessScore >= 100 ? 'bg-pitch-green' :
                  readinessScore >= 60  ? 'bg-warn-amber' : 'bg-data-blue/70'
                }`}
                style={{ width: `${Math.min(100, readinessScore)}%` }}
              />
            </div>
          </div>
        )}
        {!nextLevel && (
          <p className="text-xs text-pitch-green font-medium">
            ★ Highest level reached
          </p>
        )}
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Readiness criteria */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider px-4 pb-1 pt-2">
            Readiness criteria {hasData ? `· ${evidence.sampleSize} problems` : ''}
          </p>

          {!hasData ? (
            <div className="mx-4 my-2 px-3 py-3 rounded-card bg-bg-raised border border-bg-raised/50 text-center">
              <p className="text-xs text-txt-muted">
                Complete {Math.max(0, 20 - evidence.sampleSize)} more problems to unlock your assessment
              </p>
              <div className="mt-2 h-1 bg-bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-data-blue/60 rounded-full"
                  style={{ width: `${(evidence.sampleSize / 20) * 100}%` }}
                />
              </div>
              <p className="text-xs2 text-txt-muted/60 mt-1">{evidence.sampleSize} / 20 problems</p>
            </div>
          ) : (
            <EvidenceSection evidence={evidence} />
          )}
        </div>

        {/* Recommendations */}
        {hasData && recommendations.length > 0 && (
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2">
              Recommendations
            </p>
            <div className="flex flex-col gap-1">
              {recommendations.map((rec, i) => (
                <p key={i} className="text-xs2 text-txt-muted/90 leading-relaxed">
                  {rec}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Active topics */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2">
            Active Topics
          </p>
          <div className="flex flex-wrap gap-1.5">
            {config.topics.map(t => (
              <span
                key={t}
                className="badge bg-data-blue/10 text-data-blue/80 text-xs2"
              >
                {TOPIC_LABELS[t] ?? t}
              </span>
            ))}
          </div>
        </div>

        {/* Unlocked features */}
        <div className="px-4 pt-2 pb-4">
          <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2">
            Features at this level
          </p>
          <div className="flex flex-col gap-1">
            {Object.entries(config.features).map(([key, enabled]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`text-xs2 shrink-0 ${enabled ? 'text-pitch-green' : 'text-txt-muted/30'}`}>
                  {enabled ? '✓' : '○'}
                </span>
                <span className={`text-xs2 ${enabled ? 'text-txt-muted' : 'text-txt-muted/40'}`}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Teacher control footer ────────────────────────────────────────── */}
      <div className="px-4 pt-3 border-t border-bg-raised shrink-0">
        <p className="text-xs2 text-txt-muted/60 mb-2">Teacher — change curriculum level:</p>
        <LevelSelector current={curriculumLevel} onChange={handleLevelChange} />
      </div>

    </div>
  );
}
