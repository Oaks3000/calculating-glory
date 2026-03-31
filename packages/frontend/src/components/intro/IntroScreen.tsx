import { useState } from 'react';
import { GameState, GameCommand, FacilityType, formatMoney, toPence } from '@calculating-glory/domain';
import { CommandCentre } from '../command-centre/CommandCentre';
import { IsometricBlueprint } from '../isometric/IsometricBlueprint';
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

// ── Step → backdrop mode ────────────────────────────────────────────────────
//
// 'command' steps show the Command Centre backdrop with spotlight.
// 'stadium' steps show the isometric stadium with a highlighted facility.

type BackdropMode = 'command' | 'stadium';

interface StepConfig {
  backdrop: BackdropMode;
  /** Command Centre section spotlight (only used when backdrop === 'command') */
  spotlight?: string | null;
  /** Facility to highlight (only used when backdrop === 'stadium') */
  facility?: FacilityType | null;
}

// Steps 0–5: CC backdrop (Val, Kev, Marcus intros)
// Steps 6–11: Stadium backdrop (Dani's tour — 6 steps for 4 facilities + intro/close)
// Steps 12+: CC backdrop (Kev transfers, Marcus sponsor deal, maths)

const STEP_CONFIG: Record<number, StepConfig> = {
  0:  { backdrop: 'command', spotlight: null },
  1:  { backdrop: 'command', spotlight: null },
  2:  { backdrop: 'command', spotlight: 'financial-bar' },
  3:  { backdrop: 'command', spotlight: 'financial-bar' },
  4:  { backdrop: 'command', spotlight: 'squad' },
  5:  { backdrop: 'command', spotlight: 'data-tiles' },
  // Dani's stadium tour
  6:  { backdrop: 'stadium', facility: null },              // Dani intro — full stadium visible
  7:  { backdrop: 'stadium', facility: 'TRAINING_GROUND' }, // Training Ground
  8:  { backdrop: 'stadium', facility: 'MEDICAL_CENTER' },  // Medical Centre
  9:  { backdrop: 'stadium', facility: 'SCOUT_NETWORK' },   // Scout Network
  10: { backdrop: 'stadium', facility: 'STADIUM' },         // Stadium itself
  11: { backdrop: 'stadium', facility: null },               // Trade-off closing
  // Back to Command Centre
  12: { backdrop: 'command', spotlight: 'squad' },           // Kev: squad details
  13: { backdrop: 'command', spotlight: null },               // Val: "I always do"
  14: { backdrop: 'command', spotlight: 'hub-tiles' },       // Kev: transfer window
  15: { backdrop: 'command', spotlight: 'inbox' },           // Marcus: sponsor deal
  16: { backdrop: 'command', spotlight: 'financial-bar' },   // Val: attendance context
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
    setStep(18);
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
    setStep(20);
    setAnimKey(k => k + 1);
  }

  function handleComplete() {
    markIntroCompleted();
    onComplete();
  }

  const config = STEP_CONFIG[step];
  const backdrop = config?.backdrop ?? 'command';
  const spotlight = backdrop === 'command' ? (config?.spotlight ?? null) : null;
  const highlightFacility = backdrop === 'stadium' ? (config?.facility ?? null) : null;

  // ── Render the message for the current step ───────────────────────────────
  function renderCurrentMessage() {
    switch (step) {
      case 1: return (
        <NpcMessage {...NPC.val} delay>
          Morning. I'm Val. I handle the money at {clubName}. I should warn you: the previous owner didn't leave us in great shape. Let me show you where we stand.
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
          Alright boss. I'm Kev. I look after the football side. The squad I've got is... well, it's what it is. We'll need to be smart in the market. I'll handle tactics and training, you just make sure I've got something to work with.
        </NpcMessage>
      );
      case 5: return (
        <NpcMessage {...NPC.marcus} delay>
          Hey! Marcus here. Commercial and fan engagement. I've got some ideas to get revenue moving but we'll need to invest a bit to make money. I'll bring you opportunities, you decide what's worth backing.
        </NpcMessage>
      );

      // ── Dani's stadium tour (steps 6–11) ──────────────────────────────────
      case 6: return (
        <NpcMessage {...NPC.dani} delay>
          Dani. I run the day-to-day. Facilities, suppliers, logistics. Come with me, I'll show you what we're working with.
        </NpcMessage>
      );
      case 7: return (
        <NpcMessage {...NPC.dani} delay>
          This is the Training Ground. Keeps your players improving week on week. Without it, they're just running around the car park. Worth the investment if you want results on the pitch.
        </NpcMessage>
      );
      case 8: return (
        <NpcMessage {...NPC.dani} delay>
          Medical Centre. Reduces injuries and speeds up recovery. Lose your best striker for six weeks and you'll wish you'd spent the money here.
        </NpcMessage>
      );
      case 9: return (
        <NpcMessage {...NPC.dani} delay>
          Scout Network. Right now we're basically guessing how good players are. Build this up and you'll see their true potential before you sign them. Saves you buying duds.
        </NpcMessage>
      );
      case 10: return (
        <NpcMessage {...NPC.dani} delay>
          And this is the Stadium itself. Bigger stands, better atmosphere, more fans through the gate. More fans means more revenue. Simple maths, really.
        </NpcMessage>
      );
      case 11: return (
        <NpcMessage {...NPC.dani} delay>
          You won't be able to afford everything. Not even close. Pick one or two to start, see what difference they make, and go from there. The others will wait.
        </NpcMessage>
      );

      // ── Back to Command Centre (steps 12+) ────────────────────────────────
      case 12: return (
        <NpcMessage {...NPC.kev} delay>
          Right, let me give you the honest picture. We've got {state.club.squad.length} players on the books. Most of them are... okay. League Two level, just about. We've got capacity for 24, so there's room to bring people in. But every signing costs wages, and Val's going to have something to say about that.
        </NpcMessage>
      );
      case 13: return (
        <NpcMessage {...NPC.val} delay>
          I always do.
        </NpcMessage>
      );
      case 14: return (
        <NpcMessage {...NPC.kev} delay>
          The transfer window's open for the first few weeks of the season. We've also got a free agent pool, players without a club. Some bargains, some traps. I'll flag who I think is worth looking at, but the budget calls are yours.
        </NpcMessage>
      );
      case 15: return (
        <NpcMessage {...NPC.marcus} delay>
          Boss, before the season starts, I've got something that needs a decision. A local company has offered to sponsor our pre-season friendlies, three warm-up matches, their branding on the programme and pitch-side boards. They're offering two options:
          <ul className="mt-2 space-y-1 text-xs text-txt-muted">
            <li><strong className="text-txt-primary">Option A:</strong> Flat fee, {formatMoney(OPTION_A_AMOUNT)} for all three matches. Simple, guaranteed money.</li>
            <li><strong className="text-txt-primary">Option B:</strong> Per-attendance deal, £0.60 per fan per match. More money if attendance is good, less if it isn't.</li>
          </ul>
        </NpcMessage>
      );
      case 16: return (
        <NpcMessage {...NPC.val} delay>
          Our pre-season friendlies typically attract between 1,200 and 1,800 fans. Last year averaged about 1,500 across the three games.
        </NpcMessage>
      );
      case 17: return (
        <div className="animate-fade-in">
          <MathsChallenge onResult={handleMathsResult} />
        </div>
      );
      case 18: return mathsCorrect !== null ? (
        <NpcMessage {...NPC.val} delay>
          {mathsCorrect
            ? `That's right. £2,700 versus the flat £2,000. Option B looks better on paper, but attendance isn't guaranteed. Your call.`
            : `I make it £2,700, 1,500 fans, times 3 matches, times 60p each. So Option B is worth more if attendance holds up. But it's a gamble.`}
        </NpcMessage>
      ) : null;
      case 19: return choice === null ? (
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
      case 20: return choice !== null ? (
        <NpcMessage {...NPC.marcus} delay>
          Done. I'll let them know. {choice === 'B' ? "Fingers crossed on the attendance." : "Nice and clean."}
        </NpcMessage>
      ) : null;
      case 21: return choice !== null ? (
        <NpcMessage {...NPC.val} delay>
          First decision made. Let's see how it plays out. Now, let's get the squad ready for the season.
        </NpcMessage>
      ) : null;
      default: return null;
    }
  }

  const currentMessage = renderCurrentMessage();
  const showContinue = shouldShowContinue(step, mathsCorrect, choice);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-bg-deep">

      {/* ── Backdrop: Command Centre OR Stadium ──────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {backdrop === 'command' ? (
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
        ) : (
          <div className="flex flex-col h-full items-center justify-center">
            <IsometricBlueprint
              state={state}
              dispatch={() => ({})}
              onError={() => {}}
              highlightFacility={highlightFacility}
            />
          </div>
        )}
      </div>

      {/* ── Dark gradient scrim — heavier at bottom where the panel sits ─────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/60 to-transparent pointer-events-none" />

      {/* ── Beat 1, Step 0: Arrival title ───────────────────────────────────── */}
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
            <p className="text-lg text-txt-muted">You are the new owner.</p>
          </div>
          <p className="absolute bottom-10 text-xs text-txt-muted/50 animate-pulse">
            Tap to continue
          </p>
        </div>
      )}

      {/* ── Steps 1+: Single-message panel anchored to the bottom ───────────── */}
      {step >= 1 && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col z-20">
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
                onClick={step >= 21 ? handleComplete : advance}
                className="w-full bg-data-blue hover:bg-data-blue/90 active:scale-[0.99]
                           text-white font-semibold text-sm rounded-card py-3 px-6
                           transition-all duration-150 animate-fade-in"
              >
                {step >= 21 ? "Let's go →" : 'Continue →'}
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
  if (step === 17) return false;          // maths challenge handles its own flow
  if (step === 18 && mathsCorrect === null) return false; // waiting for maths
  if (step === 19 && choice === null) return false;       // waiting for choice
  if (step === 20 && choice === null) return false;       // waiting for choice
  return true;
}
