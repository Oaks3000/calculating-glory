import { useState } from 'react';
import { GameState, formatMoney, CurriculumLevel, CURRICULUM_LEVELS } from '@calculating-glory/domain';

interface Props {
  state: GameState;
  hasSave: boolean;
  onContinue: () => void;
  onNewGame: (level: CurriculumLevel, clubName: string, stadiumName: string) => void;
}

type MenuStep = 'main' | 'yearGroup' | 'clubSetup';

function phaseLabel(phase: GameState['phase']): string {
  switch (phase) {
    case 'PRE_SEASON':    return 'Pre-Season';
    case 'EARLY_SEASON':  return 'Early Season';
    case 'MID_SEASON':    return 'Mid Season';
    case 'LATE_SEASON':   return 'Late Season';
    case 'SEASON_END':    return 'Season End';
    default:              return 'In Progress';
  }
}

/** Strip common football suffixes and append "Park" as a stadium name suggestion. */
function suggestStadiumName(clubName: string): string {
  const stripped = clubName
    .replace(/\s*(F\.?C\.?|A\.?F\.?C\.?|United|City|Town|Rovers|Wanderers|Athletic|Albion|Rangers|Celtic)\s*$/i, '')
    .trim();
  return stripped ? `${stripped} Park` : '';
}

const LEVEL_ORDER: CurriculumLevel[] = ['YEAR_7', 'YEAR_8'];

const INPUT_CLASS =
  'w-full rounded-card border border-bg-raised bg-bg-surface px-4 py-3 text-sm text-txt-primary ' +
  'placeholder:text-txt-muted/50 focus:outline-none focus:border-data-blue/60 transition-colors duration-150';

export function MenuScreen({ state, hasSave, onContinue, onNewGame }: Props) {
  const [menuStep, setMenuStep]         = useState<MenuStep>('main');
  const [selected, setSelected]         = useState<CurriculumLevel>('YEAR_7');
  const [clubName, setClubName]         = useState('');
  const [stadiumName, setStadiumName]   = useState('');
  const [stadiumEdited, setStadiumEdited] = useState(false);

  function handleClubNameChange(value: string) {
    setClubName(value);
    // Auto-fill stadium name unless the player has already edited it themselves
    if (!stadiumEdited) {
      setStadiumName(suggestStadiumName(value));
    }
  }

  function handleStadiumNameChange(value: string) {
    setStadiumEdited(true);
    setStadiumName(value);
  }

  function handleStartGame() {
    const finalClub    = clubName.trim()    || 'Calculating Glory FC';
    const finalStadium = stadiumName.trim() || suggestStadiumName(finalClub) || 'Glory Park';
    onNewGame(selected, finalClub, finalStadium);
  }

  // ── Step: club name + stadium name ────────────────────────────────────────
  if (menuStep === 'clubSetup') {
    const canStart = clubName.trim().length > 0;
    return (
      <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <button
            onClick={() => setMenuStep('yearGroup')}
            className="text-xs text-txt-muted hover:text-txt-primary mb-6 flex items-center gap-1 transition-colors duration-150"
          >
            ← Back
          </button>

          <h2 className="text-xl font-bold text-txt-primary mb-1">Name your club</h2>
          <p className="text-sm text-txt-muted mb-6 leading-relaxed">
            This is your club. Make it yours.
          </p>

          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-txt-muted uppercase tracking-widest mb-2">
                Club name
              </label>
              <input
                type="text"
                value={clubName}
                onChange={e => handleClubNameChange(e.target.value)}
                placeholder="e.g. Riverside United FC"
                maxLength={40}
                className={INPUT_CLASS}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-muted uppercase tracking-widest mb-2">
                Stadium name
              </label>
              <input
                type="text"
                value={stadiumName}
                onChange={e => handleStadiumNameChange(e.target.value)}
                placeholder="e.g. Riverside Park"
                maxLength={40}
                className={INPUT_CLASS}
              />
              {!stadiumEdited && clubName.trim() && stadiumName && (
                <p className="text-xs text-txt-muted/60 mt-1.5 pl-1">
                  Suggested from your club name — tap to change
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className={`w-full font-semibold text-sm rounded-card py-3 transition-all duration-150
              ${canStart
                ? 'bg-data-blue hover:bg-data-blue/90 active:scale-[0.99] text-white'
                : 'bg-bg-raised text-txt-muted cursor-not-allowed'
              }`}
          >
            Start game →
          </button>
        </div>
      </div>
    );
  }

  // ── Step: year group ──────────────────────────────────────────────────────
  if (menuStep === 'yearGroup') {
    return (
      <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <button
            onClick={() => setMenuStep('main')}
            className="text-xs text-txt-muted hover:text-txt-primary mb-6 flex items-center gap-1 transition-colors duration-150"
          >
            ← Back
          </button>

          <h2 className="text-xl font-bold text-txt-primary mb-1">Choose your year group</h2>
          <p className="text-sm text-txt-muted mb-6 leading-relaxed">
            This sets your maths difficulty and starting budget. You can always start again.
          </p>

          <div className="flex flex-col gap-2 mb-6">
            {LEVEL_ORDER.map(level => {
              const config = CURRICULUM_LEVELS[level];
              const isSelected = selected === level;
              return (
                <button
                  key={level}
                  onClick={() => setSelected(level)}
                  className={`px-4 py-3 rounded-card border text-left transition-all duration-150
                    ${isSelected
                      ? 'border-data-blue bg-data-blue/10 text-txt-primary'
                      : 'border-bg-raised bg-bg-surface text-txt-muted hover:border-data-blue/40 hover:text-txt-primary'
                    }`}
                >
                  <div className="font-semibold text-sm">{config.displayName}</div>
                  <div className="text-xs mt-0.5 opacity-70">{config.displayName} maths level</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setMenuStep('clubSetup')}
            className="w-full bg-data-blue hover:bg-data-blue/90 active:scale-[0.99] text-white
                       font-semibold text-sm rounded-card py-3 transition-all duration-150"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // ── Step: main menu ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center px-6">

      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-[0.3em] text-data-blue mb-3 font-semibold">
          Football Finance Simulator
        </div>
        <h1 className="text-5xl font-bold text-txt-primary tracking-tight leading-none mb-4">
          Calculating<br />Glory
        </h1>
        <p className="text-txt-muted text-sm max-w-xs mx-auto leading-relaxed">
          You're the owner. Every decision comes back to money. Keep the bar green.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">

        {hasSave && (
          <button
            onClick={onContinue}
            className="w-full bg-data-blue hover:bg-data-blue/90 active:scale-[0.98] text-white
                       rounded-card px-6 py-4 text-left transition-all duration-150 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-base leading-tight">Continue</div>
                <div className="text-blue-200 text-xs mt-0.5 font-mono">
                  {state.club.name}
                  {' · '}
                  {phaseLabel(state.phase)}
                  {['EARLY_SEASON', 'MID_SEASON', 'LATE_SEASON'].includes(state.phase) ? ` · Wk ${state.currentWeek}` : ''}
                  {' · '}
                  S{state.season}
                </div>
              </div>
              <div className="text-white/60 group-hover:text-white/90 transition-colors text-lg">→</div>
            </div>
            <div className="mt-2 text-blue-200/70 text-xs font-mono">
              Budget: {formatMoney(state.club.transferBudget)}
            </div>
          </button>
        )}

        <button
          onClick={() => setMenuStep('yearGroup')}
          className={`w-full rounded-card px-6 py-4 text-left transition-all duration-150 group
            ${hasSave
              ? 'bg-bg-surface hover:bg-bg-raised border border-bg-raised text-txt-primary'
              : 'bg-data-blue hover:bg-data-blue/90 active:scale-[0.98] text-white'
            }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-base leading-tight">New Game</div>
              <div className={`text-xs mt-0.5 ${hasSave ? 'text-txt-muted' : 'text-blue-200'}`}>
                {hasSave ? 'Overwrites your current save' : 'Start your first season'}
              </div>
            </div>
            <div className={`text-lg transition-colors ${hasSave ? 'text-txt-muted group-hover:text-txt-primary' : 'text-white/60 group-hover:text-white/90'}`}>→</div>
          </div>
        </button>

      </div>

      <div className="mt-16 text-txt-muted text-xs text-center opacity-40">
        Calculating Glory
      </div>

    </div>
  );
}
