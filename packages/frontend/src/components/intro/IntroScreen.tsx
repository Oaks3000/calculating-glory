import { useState, useEffect, useRef } from 'react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clubName = state.club.name;
  const runwayWeeks = Math.floor(
    state.club.transferBudget /
    Math.max(1,
      state.club.squad.reduce((s, p) => s + p.wage, 0) +
      state.club.staff.reduce((s, p) => s + p.salary, 0) +
      (state.club.manager?.wage ?? 0)
    )
  );

  // Auto-scroll messages into view
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [step]);

  function advance() {
    setStep(s => s + 1);
  }

  function handleMathsResult(correct: boolean) {
    setMathsCorrect(correct);
    setStep(15); // Val response
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
    setStep(17); // Marcus confirms
  }

  function handleComplete() {
    markIntroCompleted();
    onComplete();
  }

  const spotlight = STEP_SPOTLIGHT[step] ?? null;

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

      {/* ── Dark gradient scrim ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/70 to-transparent pointer-events-none" />

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

      {/* ── Steps 1+: Chat interface ─────────────────────────────────────────── */}
      {step >= 1 && (
        <div className="absolute inset-0 flex flex-col">
          {/* Scrollable message log */}
          <div className="flex-1 overflow-y-auto px-4 pt-8 pb-4 flex flex-col justify-end">
            <div className="space-y-4 max-w-lg mx-auto w-full">

              {/* Beat 1 — Val introduces herself */}
              {step >= 1 && (
                <NpcMessage {...NPC.val} delay={step === 1}>
                  Morning. I'm Val — I handle the money. I should warn you: the previous owner didn't leave us in great shape. Let me show you where we stand.
                </NpcMessage>
              )}

              {/* Beat 1 — Financial bar explanation */}
              {step >= 2 && (
                <NpcMessage {...NPC.val} delay={step === 2}>
                  This is your financial overview. The number on the left is how much cash we have. The number on the right is how many weeks it'll last at our current spending rate. Right now we've got roughly <strong>{runwayWeeks} weeks</strong> of runway. That sounds like a lot, but it goes fast when you're paying wages, maintaining facilities, and trying to win football matches.
                </NpcMessage>
              )}

              {/* Beat 1 — Rule one */}
              {step >= 3 && (
                <NpcMessage {...NPC.val} delay={step === 3}>
                  Rule number one of this job: <strong>keep this bar green.</strong> If it turns amber, be careful. If it turns red... well, let's not find out.
                </NpcMessage>
              )}

              {/* Beat 2 — Kev */}
              {step >= 4 && (
                <NpcMessage {...NPC.kev} delay={step === 4}>
                  Alright boss. I'm Kev — I look after the football side. The squad I've got is... well, it's what it is. We'll need to be smart in the market. I'll handle tactics and training — you just make sure I've got something to work with.
                </NpcMessage>
              )}

              {/* Beat 2 — Marcus */}
              {step >= 5 && (
                <NpcMessage {...NPC.marcus} delay={step === 5}>
                  Hey! Marcus here. Commercial and fan engagement. I've got some ideas to get revenue moving but we'll need to invest a bit to make money. I'll bring you opportunities — you decide what's worth backing.
                </NpcMessage>
              )}

              {/* Beat 2 — Dani */}
              {step >= 6 && (
                <NpcMessage {...NPC.dani} delay={step === 6}>
                  Dani. I run the day-to-day — facilities, suppliers, logistics. The stadium needs work. I'll keep you posted on what's urgent and what can wait. Just so you know: everything takes longer and costs more than Marcus thinks it will.
                </NpcMessage>
              )}

              {/* Beat 3 — Stadium prompt */}
              {step >= 7 && (
                <NpcMessage {...NPC.dani} delay={step === 7}>
                  See those buildings behind me? Each one does something for the club — generates revenue, improves the squad, keeps the fans happy. Upgrading them costs money, but it's how you build something that sustains itself.
                </NpcMessage>
              )}

              {/* Beat 3 — Stadium follow-up */}
              {step >= 8 && (
                <NpcMessage {...NPC.dani} delay={step === 8}>
                  No rush on any of that today. Let's focus on getting through pre-season first.
                </NpcMessage>
              )}

              {/* Beat 4 — Kev squad reality check */}
              {step >= 9 && (
                <NpcMessage {...NPC.kev} delay={step === 9}>
                  Right, let me give you the honest picture. We've got {state.club.squad.length} players on the books. Most of them are... okay. League Two level, just about. We've got capacity for 24, so there's room to bring people in. But every signing costs wages, and Val's going to have something to say about that.
                </NpcMessage>
              )}

              {/* Beat 4 — Val interjects */}
              {step >= 10 && (
                <NpcMessage {...NPC.val} delay={step === 10}>
                  I always do.
                </NpcMessage>
              )}

              {/* Beat 4 — Kev on transfers */}
              {step >= 11 && (
                <NpcMessage {...NPC.kev} delay={step === 11}>
                  The transfer window's open for the first few weeks of the season. We've also got a free agent pool — players without a club. Some bargains, some traps. I'll flag who I think is worth looking at, but the budget calls are yours.
                </NpcMessage>
              )}

              {/* Beat 5 — Marcus presents the deal */}
              {step >= 12 && (
                <NpcMessage {...NPC.marcus} delay={step === 12}>
                  Boss, before the season starts, I've got something that needs a decision. A local company has offered to sponsor our pre-season friendlies — three warm-up matches, their branding on the programme and pitch-side boards. They're offering two options:
                  <ul className="mt-2 space-y-1 text-xs text-txt-muted">
                    <li><strong className="text-txt-primary">Option A:</strong> Flat fee — {formatMoney(OPTION_A_AMOUNT)} for all three matches. Simple, guaranteed money.</li>
                    <li><strong className="text-txt-primary">Option B:</strong> Per-attendance deal — £0.60 per fan per match. More money if attendance is good, less if it isn't.</li>
                  </ul>
                </NpcMessage>
              )}

              {/* Beat 5 — Val gives context */}
              {step >= 13 && (
                <NpcMessage {...NPC.val} delay={step === 13}>
                  Our pre-season friendlies typically attract between 1,200 and 1,800 fans. Last year averaged about 1,500 across the three games.
                </NpcMessage>
              )}

              {/* Beat 5 — Maths challenge */}
              {step >= 14 && mathsCorrect === null && (
                <div className="animate-fade-in">
                  <MathsChallenge onResult={handleMathsResult} />
                </div>
              )}

              {/* Beat 5 — Val responds to maths */}
              {step >= 15 && mathsCorrect !== null && (
                <NpcMessage {...NPC.val} delay={step === 15}>
                  {mathsCorrect
                    ? `That's right — £2,700 versus the flat £2,000. Option B looks better on paper, but attendance isn't guaranteed. Your call.`
                    : `I make it £2,700 — 1,500 fans, times 3 matches, times 60p each. So Option B is worth more if attendance holds up. But it's a gamble.`}
                </NpcMessage>
              )}

              {/* Beat 5 — Choice buttons */}
              {step >= 16 && choice === null && (
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
              )}

              {/* Beat 5 — Marcus confirms */}
              {step >= 17 && choice !== null && (
                <NpcMessage {...NPC.marcus} delay={step === 17}>
                  Done. I'll let them know. {choice === 'B' ? "Fingers crossed on the attendance." : "Nice and clean."}
                </NpcMessage>
              )}

              {step >= 18 && choice !== null && (
                <NpcMessage {...NPC.val} delay={step === 18}>
                  First decision made. Let's see how it plays out. Now — let's get the squad ready for the season.
                </NpcMessage>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── Action bar ────────────────────────────────────────────────────── */}
          <div className="shrink-0 px-4 pb-6 pt-2 max-w-lg mx-auto w-full">
            {/* Steps that need explicit "continue" (not handled by inline interaction) */}
            {shouldShowContinue(step, mathsCorrect, choice) && (
              <button
                onClick={step >= 18 ? handleComplete : advance}
                className="w-full bg-data-blue hover:bg-data-blue/90 active:scale-[0.99]
                           text-white font-semibold text-sm rounded-card py-3 px-6
                           transition-all duration-150 animate-fade-in"
              >
                {step >= 18 ? "Let's go →" : 'Continue →'}
              </button>
            )}
          </div>
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
