import { useState } from 'react';
import { GameState, GameCommand, formatMoney, toPence } from '@calculating-glory/domain';
import { OwnerOffice } from '../owner-office/OwnerOffice';
import { NpcMessage } from './NpcMessage';
import { MathsChallenge } from './MathsChallenge';
import { markIntroCompleted } from '../../lib/introState';
import { NPCS } from '../../lib/npcs';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  state: GameState;
  events: import('@calculating-glory/domain').GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  onComplete: () => void;
}

// ── Step → backdrop spotlight ────────────────────────────────────────────────
//
// The intro is scoped down to an ambition-first cold-open. Kev opens with the
// why, Val reframes money as the enabler, then we drop straight into the first
// concrete pre-season decision (Marcus' sponsor deal + maths challenge).

const STEP_SPOTLIGHT: Record<number, string | null> = {
  0: null,              // title screen (full takeover)
  1: null,              // Kev: ambition
  2: 'header-stats',    // Val: money as enabler
  3: 'decisions-zone',  // Kev: squad honest picture
  4: 'decisions-zone',  // Marcus: sponsor pitch
  5: 'header-stats',    // Val: attendance context
  // 6: maths challenge — spotlight hidden via challenge UI
  7: null,              // Val: maths result
  8: 'decisions-zone',  // Choice buttons
  9: 'decisions-zone',  // Marcus: deal confirmed
  10: null,             // Kev: let's go
};

const LAST_STEP = 10;

// ── Sponsor deal constants ────────────────────────────────────────────────────

const OPTION_A_AMOUNT = toPence(2000);   // £2,000 flat fee
const OPTION_B_AMOUNT = toPence(2700);   // £2,700 per-attendance (pre-calculated)

// ── Component ─────────────────────────────────────────────────────────────────

export function IntroScreen({ state, events, dispatch, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [mathsCorrect, setMathsCorrect] = useState<boolean | null>(null);
  const [choice, setChoice] = useState<'A' | 'B' | null>(null);
  const [animKey, setAnimKey] = useState(0);

  const clubName = state.club.name;

  function advance() {
    setStep(s => s + 1);
    setAnimKey(k => k + 1);
  }

  function handleMathsResult(correct: boolean) {
    setMathsCorrect(correct);
    setStep(7);
    setAnimKey(k => k + 1);
  }

  function handleChoice(picked: 'A' | 'B') {
    setChoice(picked);
    const amount = picked === 'A' ? OPTION_A_AMOUNT : OPTION_B_AMOUNT;
    dispatch({
      type: 'ACCEPT_INTRO_SPONSOR_DEAL',
      clubId: state.club.id,
      choice: picked,
      amount,
    });
    setStep(9);
    setAnimKey(k => k + 1);
  }

  function handleComplete() {
    markIntroCompleted();
    onComplete();
  }

  const spotlight = STEP_SPOTLIGHT[step] ?? null;

  // ── Render the message for the current step ───────────────────────────────
  function renderCurrentMessage() {
    switch (step) {
      // ── Beat 1: Kev — what are we chasing? ─────────────────────────────
      case 1: return (
        <NpcMessage {...NPCS.kev} delay>
          Right, boss. I'm Kev — I run the football side. What do you want from this season? Survival, a cup run, promotion? Whatever it is, the lads in the dressing room need to hear it, and the fans in the stand need to believe it. I've got the tactics. You've got the decisions.
        </NpcMessage>
      );
      // ── Beat 2: Val — money is the enabler, not the headline ───────────
      case 2: return (
        <NpcMessage {...NPCS.val} delay>
          Morning. Val Okoro, Finance. Love the ambition — and I'm the one who makes sure it's fundable. None of it, the signings, the stadium, the cup runs, happens without cash. I track it so you can chase it. Keep us out of the red and there's no ceiling on what {clubName} can do.
        </NpcMessage>
      );
      // ── Beat 3: Kev — the squad you've inherited ───────────────────────
      case 3: return (
        <NpcMessage {...NPCS.kev} delay>
          Honest picture: {state.club.squad.length} players on the books, most of them mid-table League Two at best. Room to bring {24 - state.club.squad.length} more in, and the free-agent pool's worth a proper look. Get me one signing the fans can get excited about, and we can chase something real.
        </NpcMessage>
      );
      // ── Beat 4: Marcus — pre-season sponsor pitch ──────────────────────
      case 4: return (
        <NpcMessage {...NPCS.marcus} delay>
          Marcus Webb, Commercial. Before a ball's kicked I've got a deal on the table — a local firm wants their logo on our pre-season friendlies. Three warm-up matches, programme and pitch-side boards. Not glamorous, but it's how we fund the ambition. Two options:
          <ul className="mt-2 space-y-1 text-xs text-txt-muted">
            <li><strong className="text-txt-primary">Option A:</strong> Flat fee, {formatMoney(OPTION_A_AMOUNT)} for all three matches. Guaranteed.</li>
            <li><strong className="text-txt-primary">Option B:</strong> £0.60 per fan per match. More if attendance is good, less if it isn't.</li>
          </ul>
        </NpcMessage>
      );
      // ── Beat 5: Val — attendance context ───────────────────────────────
      case 5: return (
        <NpcMessage {...NPCS.val} delay>
          Our pre-season friendlies typically pull in 1,200–1,800. Last year averaged about 1,500 across the three games.
        </NpcMessage>
      );
      // ── Beat 6: maths challenge (no NPC bubble) ────────────────────────
      case 6: return (
        <div className="animate-fade-in">
          <MathsChallenge onResult={handleMathsResult} />
        </div>
      );
      // ── Beat 7: Val — maths result ─────────────────────────────────────
      case 7: return mathsCorrect !== null ? (
        <NpcMessage {...NPCS.val} delay>
          {mathsCorrect
            ? `That's right. £2,700 versus the flat £2,000. Option B looks better on paper — but attendance isn't guaranteed. Your call.`
            : `I make it £2,700. 1,500 fans, three matches, 60p each. Option B's worth more if attendance holds up. But it's a gamble.`}
        </NpcMessage>
      ) : null;
      // ── Beat 8: choice buttons (no NPC bubble) ────────────────────────
      case 8: return choice === null ? (
        <div className="animate-fade-in space-y-2">
          <p className="text-xs text-txt-muted px-1">Which deal do you want?</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleChoice('A')}
              className="bg-bg-surface hover:bg-bg-raised border border-bg-raised hover:border-data-blue/40
                         rounded-card px-4 py-3 text-left transition-all duration-150 group"
            >
              <div className="text-sm font-semibold text-txt-primary">Option A</div>
              <div className="text-xs text-txt-muted mt-0.5">
                {formatMoney(OPTION_A_AMOUNT)} guaranteed
              </div>
            </button>
            <button
              onClick={() => handleChoice('B')}
              className="bg-bg-surface hover:bg-bg-raised border border-bg-raised hover:border-data-blue/40
                         rounded-card px-4 py-3 text-left transition-all duration-150 group"
            >
              <div className="text-sm font-semibold text-txt-primary">Option B</div>
              <div className="text-xs text-txt-muted mt-0.5">
                £0.60/fan · est. {formatMoney(OPTION_B_AMOUNT)}
              </div>
            </button>
          </div>
        </div>
      ) : null;
      // ── Beat 9: Marcus — deal locked in ────────────────────────────────
      case 9: return choice !== null ? (
        <NpcMessage {...NPCS.marcus} delay>
          Done. I'll let them know. {choice === 'B' ? 'Fingers crossed on the attendance.' : 'Nice and clean.'}
        </NpcMessage>
      ) : null;
      // ── Beat 10: Kev — handoff to pre-season ───────────────────────────
      case 10: return choice !== null ? (
        <NpcMessage {...NPCS.kev} delay>
          First decision made. Let's get pre-season sorted — formation, manager, then a look at the squad. The fans are watching.
        </NpcMessage>
      ) : null;
      default: return null;
    }
  }

  const currentMessage = renderCurrentMessage();
  const showContinue = shouldShowContinue(step, mathsCorrect, choice);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-bg-deep">

      {/* ── Backdrop — Owner's Office with zone spotlight ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <OwnerOffice
            state={state}
            events={events}
            dispatch={() => ({})}
            isLoading={false}
            onNavigateToStadium={() => {}}
            onError={() => {}}
            introSpotlight={spotlight}
          />
        </div>
      </div>

      {/* ── Dark gradient scrim for readability ───────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/60 to-transparent pointer-events-none" />

      {/* ── Beat 0: Arrival title ───────────────────────────────────────── */}
      {step === 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 cursor-pointer z-20"
          onClick={advance}
        >
          <div className="animate-fade-in space-y-3">
            <p className="text-txt-muted text-sm uppercase tracking-widest">Day One</p>
            <h1 className="text-3xl font-bold text-txt-primary leading-tight">
              Welcome to<br />{clubName}.
            </h1>
            <p className="text-lg text-txt-muted">Time to chase some glory.</p>
          </div>
          <p className="absolute bottom-10 text-xs text-txt-muted/50 animate-pulse">
            Tap to continue
          </p>
        </div>
      )}

      {/* ── Beats 1+: single-message panel anchored to bottom ───────────── */}
      {step >= 1 && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col z-20">
          {currentMessage && (
            <div
              key={animKey}
              className="px-4 pt-4 max-w-lg mx-auto w-full animate-fade-in"
            >
              {currentMessage}
            </div>
          )}

          {showContinue && (
            <div className="px-4 pb-6 pt-3 max-w-lg mx-auto w-full">
              <button
                onClick={step >= LAST_STEP ? handleComplete : advance}
                className="w-full bg-data-blue hover:bg-data-blue/90 active:scale-[0.99]
                           text-white font-semibold text-sm rounded-card py-3 px-6
                           transition-all duration-150 animate-fade-in"
              >
                {step >= LAST_STEP ? "Let's go →" : 'Continue →'}
              </button>
            </div>
          )}

          {!showContinue && <div className="pb-6" />}
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function shouldShowContinue(
  step: number,
  mathsCorrect: boolean | null,
  choice: 'A' | 'B' | null,
): boolean {
  if (step === 0) return false;           // handled by full-screen click
  if (step === 6) return false;           // maths challenge handles its own flow
  if (step === 7 && mathsCorrect === null) return false;
  if (step === 8 && choice === null) return false;
  if (step === 9 && choice === null) return false;
  return true;
}
