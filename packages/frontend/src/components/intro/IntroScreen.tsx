import { useState, useEffect } from 'react';
import { GameState, GameCommand, formatMoney, toPence } from '@calculating-glory/domain';
import { CommandCentre } from '../command-centre/CommandCentre';
import { NpcMessage } from './NpcMessage';
import { MathsChallenge } from './MathsChallenge';
import { markIntroCompleted } from '../../lib/introState';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  state: GameState;
  events: import('@calculating-glory/domain').GameEvent[];
  dispatch: (command: GameCommand) => { error?: string };
  onComplete: () => void;
}

// ── Step → spotlight mapping ──────────────────────────────────────────────────
//
// Each step names which CommandCentre section should be revealed at full
// brightness while everything else is dimmed. null = nothing spotlighted
// (all sections dimmed). Section IDs match the CommandCentre contract.

const STEP_SPOTLIGHT: Record<number, string | null> = {
  0:  null,             // title screen — full dark
  1:  null,             // Val intro — orient before revealing anything
  2:  'financial-bar',  // Val: "This is your financial overview"
  3:  'financial-bar',  // Val: "keep this bar green"
  4:  'squad',          // Kev: squad reality check
  5:  'data-tiles',     // Marcus: "get revenue moving"
  6:  'hub-tiles',      // Dani: "the stadium needs work"
  7:  'hub-tiles',      // Dani: "each building does something"
  8:  null,             // Dani: "no rush today"
  9:  'squad',          // Kev: "X players on the books, capacity for 24"
  10: null,             // Val: "I always do" (short quip)
  11: 'hub-tiles',      // Kev: "transfer window's open, free agent pool"
  12: 'inbox',          // Marcus: presents sponsor deal
  13: 'financial-bar',  // Val: pre-season attendance context
};

// ── NPC avatars ───────────────────────────────────────────────────────────────

const NPC = {
  val:    { name: 'Val Okoro',   role: 'Finance Director',    avatar: '📊' },
  kev:    { name: 'Kev Mulligan',role: 'Head of Football',    avatar: '⚽' },
  marcus: { name: 'Marcus Webb', role: 'Commercial Director', avatar: '📣' },
  dani:   { name: 'Dani Lopes',  role: 'Head of Operations',  avatar: '🔧' },
};

// ── Sponsor deal constants ────────────────────────────────────────────────────

const OPTION_A_AMOUNT = toPence(2000);   // £2,000 flat fee
const OPTION_B_AMOUNT = toPence(2700);   // £2,700 per-attendance (pre-calculated)

// ── Component ─────────────────────────────────────────────────────────────────

export function IntroScreen({ state, events, dispatch, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [mathsCorrect, setMathsCorrect] = useState<boolean | null>(null);
  const [choice, setChoice] = useState<'A' | 'B' | null>(null);
  // Drives the fade-in animation key — incremented each step so the panel
  // re-animates even when the same NPC speaks twice in a row.
  const [animKey, setAnimKey] = useState(0);

  const clubName = state.club.name;
  const runwayWeeks = Math.floor(
    state.club.transferBudget /
    Math.max(1,
      state.club.squad.reduce((s, p) => s + p.wage, 0) +
      state.club.staff.reduce((s, p) => s + p.salary, 0) +
      (state.club.manager?.wage ?? 0)
    )
  );

  function advance() {
    setStep(s => s + 1);
    setAnimKey(k => k + 1);
  }

  function handleMathsResult(correct: boolean) {
    setMathsCorrect(correct);
    setStep(15);
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
    setStep(17);
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
      case 1: return (
        <NpcMessage {...NPC.val} delay>
          Morning. I'm Val — I handle the money at {clubName}. I should warn you: the previous owner didn't leave us in great shape. Let me show you where we stand.
        </NpcMessage>
      );
      case 2: return (
        <NpcMessage {...NPC.val} delay>
          This is your financial overview. The number on the left is how much cash we have. The number on the right is how many weeks it'll last at our current spending rate. Right now we've got roughly <strong>{runwayWeeks} weeks</strong> of runway. That sounds like a lot, but it goes fast when you're paying wages, maintaining facilities, and trying to win football matches.
        </NpcMessage>
      );
      case 3: return (
        <NpcMessage {...NPC.val} delay>
          Rule number one of this job: <strong>keep this bar green.</strong> If it turns amber, be careful. If it turns red... well, let's not find out.
        </NpcMessage>
      );
      case 4: return (
        <NpcMessage {...NPC.kev} delay>
          Alright boss. I'm Kev — I look after the football side. The squad I've got is... well, it's what it is. We'll need to be smart in the market. I'll handle tactics and training — you just make sure I've got something to work with.
        </NpcMessage>
      );
      case 5: return (
        <NpcMessage {...NPC.marcus} delay>
          Hey! Marcus here. Commercial and fan engagement. I've got some ideas to get revenue moving but we'll need to invest a bit to make money. I'll bring you opportunities — you decide what's worth backing.
        </NpcMessage>
      );
      case 6: return (
        <NpcMessage {...NPC.dani} delay>
          Dani. I run the day-to-day — facilities, suppliers, logistics. The stadium needs work. I'll keep you posted on what's urgent and what can wait. Just so you know: everything takes longer and costs more than Marcus thinks it will.
        </NpcMessage>
      );
      case 7: return (
        <NpcMessage {...NPC.dani} delay>
          See those buildings behind me? Each one does something for the club — generates revenue, improves the squad, keeps the fans happy. Upgrading them costs money, but it's how you build something that sustains itself.
        </NpcMessage>
      );
      case 8: return (
        <NpcMessage {...NPC.dani} delay>
          No rush on any of that today. Let's focus on getting through pre-season first.
        </NpcMessage>
      );
      case 9: return (
        <NpcMessage {...NPC.kev} delay>
          Right, let me give you the honest picture. We've got {state.club.squad.length} players on the books. Most of them are... okay. League Two level, just about. We've got capacity for 24, so there's room to bring people in. But every signing costs wages, and Val's going to have something to say about that.
        </NpcMessage>
      );
      case 10: return (
        <NpcMessage {...NPC.val} delay>
          I always do.
        </NpcMessage>
      );
      case 11: return (
        <NpcMessage {...NPC.kev} delay>
          The transfer window's open for the first few weeks of the season. We've also got a free agent pool — players without a club. Some bargains, some traps. I'll flag who I think is worth looking at, but the budget calls are yours.
        </NpcMessage>
      );
      case 12: return (
        <NpcMessage {...NPC.marcus} delay>
          Boss, before the season starts, I've got something that needs a decision. A local company has offered to sponsor our pre-season friendlies — three warm-up matches, their branding on the programme and pitch-side boards. They're offering two options:
          <ul className="mt-2 space-y-1 text-xs text-txt-muted">
            <li><strong className="text-txt-primary">Option A:</strong> Flat fee — {formatMoney(OPTION_A_AMOUNT)} for all three matches. Simple, guaranteed money.</li>
            <li><strong className="text-txt-primary">Option B:</strong> Per-attendance deal — £0.60 per fan per match. More money if attendance is good, less if it isn't.</li>
          </ul>
        </NpcMessage>
      );
      case 13: return (
        <NpcMessage {...NPC.val} delay>
          Our pre-season friendlies typically attract between 1,200 and 1,800 fans. Last year averaged about 1,500 across the three games.
        </NpcMessage>
      );
      case 14: return (
        <div className="animate-fade-in">
          <MathsChallenge onResult={handleMathsResult} />
        </div>
      );
      case 15: return mathsCorrect !== null ? (
        <NpcMessage {...NPC.val} delay>
          {mathsCorrect
            ? `That's right — £2,700 versus the flat £2,000. Option B looks better on paper, but attendance isn't guaranteed. Your call.`
            : `I make it £2,700 — 1,500 fans, times 3 matches, times 60p each. So Option B is worth more if attendance holds up. But it's a gamble.`}
        </NpcMessage>
      ) : null;
      case 16: return choice === null ? (
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
      case 17: return choice !== null ? (
        <NpcMessage {...NPC.marcus} delay>
          Done. I'll let them know. {choice === 'B' ? "Fingers crossed on the attendance." : "Nice and clean."}
        </NpcMessage>
      ) : null;
      case 18: return choice !== null ? (
        <NpcMessage {...NPC.val} delay>
          First decision made. Let's see how it plays out. Now — let's get the squad ready for the season.
        </NpcMessage>
      ) : null;
      default: return null;
    }
  }

  const currentMessage = renderCurrentMessage();
  const showContinue = shouldShowContinue(step, mathsCorrect, choice);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-bg-deep">

      {/* ── Command Centre backdrop — sections revealed by spotlight ─────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <CommandCentre
            state={state}
            events={events}
            dispatch={() => ({})}
            isLoading={false}
            onNavigateToStadium={() => {}}
            introSpotlight={spotlight}
          />
        </div>
      </div>

      {/* ── Dark gradient scrim — heavier at bottom where the panel sits ─────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/60 to-transparent pointer-events-none" />

      {/* ── Beat 1, Step 0: Arrival title ───────────────────────────────────── */}
      {step === 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 cursor-pointer"
          onClick={advance}
        >
          <div className="animate-fade-in space-y-3">
            <p className="text-txt-muted text-sm uppercase tracking-widest">Day One</p>
            <h1 className="text-3xl font-bold text-txt-primary leading-tight">
              Welcome to<br />{clubName}.
            </h1>
            <p className="text-lg text-txt-muted">You are the new owner.</p>
          </div>
          <p className="absolute bottom-10 text-xs text-txt-muted/50 animate-pulse">
            Tap to continue
          </p>
        </div>
      )}

      {/* ── Steps 1+: Single-message panel anchored to the bottom ───────────── */}
      {step >= 1 && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col">
          {/* Message card — shows only the current step */}
          {currentMessage && (
            <div
              key={animKey}
              className="px-4 pt-4 max-w-lg mx-auto w-full animate-fade-in"
            >
              {currentMessage}
            </div>
          )}

          {/* Continue / finish button */}
          {showContinue && (
            <div className="px-4 pb-6 pt-3 max-w-lg mx-auto w-full">
              <button
                onClick={step >= 18 ? handleComplete : advance}
                className="w-full bg-data-blue hover:bg-data-blue/90 active:scale-[0.99]
                           text-white font-semibold text-sm rounded-card py-3 px-6
                           transition-all duration-150 animate-fade-in"
              >
                {step >= 18 ? "Let's go →" : 'Continue →'}
              </button>
            </div>
          )}

          {/* Extra bottom padding when no button (e.g. maths challenge / choice) */}
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
  if (step === 14) return false;          // maths challenge handles its own flow
  if (step === 15 && mathsCorrect === null) return false; // waiting for maths
  if (step === 16 && choice === null) return false;       // waiting for choice
  if (step === 17 && choice === null) return false;       // waiting for choice
  return true;
}
