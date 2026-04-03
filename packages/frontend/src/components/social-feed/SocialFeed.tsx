import { useState, useEffect, useRef } from 'react';
import { GameState, GameCommand, GameEvent, PendingClubEvent, CurriculumLevel, checkMastery, curriculumDisplayName, CURRICULUM_LEVELS, MAX_DIFFICULTY_BY_LEVEL } from '@calculating-glory/domain';
import { ChatBubble } from './ChatBubble';
import { NegotiationKeyboard } from './NegotiationKeyboard';
import { MathChallengeCard } from './MathChallengeCard';
import { generateChallenge, MathChallenge, TopicPerformance, ChallengeTopic } from './generateChallenge';
import { generateEventChallenge, formatBudgetEffect } from './generateEventChallenge';
import { InboxView } from './InboxView';

// ── Types ─────────────────────────────────────────────────────────────────────

type SocialView = 'inbox' | 'thread';

type MessageKind = 'npc' | 'player' | 'challenge' | 'system' | 'fallback-choices';

interface Message {
  id: string;
  kind: MessageKind;
  text?: string;
  challenge?: MathChallenge;
  hintIndex?: number;
  sender?: string;
  fallbackEvent?: PendingClubEvent;
  excludeChoiceId?: string;
}

interface LinkedEvent {
  event: PendingClubEvent;
  mathChoiceId: string;
}

// ── NPC copy ──────────────────────────────────────────────────────────────────

const NPC_NAME = 'Agent Rodriguez';
const PRACTICE_NPC = 'Marcus Webb';

const NPC_TRANSITIONS = [
  "Right boss, here's the next one. Pay attention, this one's trickier.",
  "Good. Let's keep the momentum going. Next situation:",
  "The board are impressed so far. One more:",
  "Right, new scenario. Think it through carefully:",
];

const NPC_CORRECT = [
  "Spot on! That's exactly the kind of sharp thinking that wins promotions.",
  "Perfect. The numbers don't lie, and neither do you, boss.",
  "Brilliant. I'll send that straight to the board.",
  "Exactly right. Your Business Acumen just went up a notch.",
];

const NPC_WRONG = [
  "Not quite. Let me give you a clue to get you back on track.",
  "Close, but not right. Here's a hint:",
  "That's not it. Think about the method. Here's where to start:",
];

const NPC_HINT3 = [
  "Here's the full working so you can see exactly where to start next time.",
  "Let me walk you through it step by step. Study this and you'll nail it.",
];

const NPC_CONSEQUENCE = [
  "Your Business Acumen rating has improved. The board are starting to trust your judgement.",
  "That's on record. Your analytical skills are getting sharper every week.",
  "Filed. The board can see you know your numbers, and that matters come contract time.",
];

const PRACTICE_CORRECT = [
  "That's it. Keep that method in your head for when it counts.",
  "Exactly right. You'll nail that one in a real negotiation.",
  "Spot on. Run through another if you want to cement it.",
];

const PRACTICE_CONSEQUENCE = [
  "Your understanding of this topic is improving. I can see it in the numbers.",
  "Solid work. That kind of preparation makes a difference in the boardroom.",
];

const DIFFICULTY_UNLOCK = [
  "The board are impressed — tougher challenges incoming.",
  "You're ready for harder problems. Let's step it up.",
  "Sharp thinking. Time to raise the stakes.",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function uid() {
  return `msg-${Date.now()}-${Math.random()}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPerformance(state: GameState): TopicPerformance {
  return state.businessAcumen.recentPerformance;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface SocialFeedProps {
  state: GameState;
  events: GameEvent[];
  dispatch: (cmd: GameCommand) => { error?: string };
  linkedEvent?: PendingClubEvent | null;
  practiceMode?: boolean;
  /** Called after a negotiation is resolved and consequence is shown. */
  onNegotiationComplete?: () => void;
}

export function SocialFeed({ state, events, dispatch, linkedEvent, practiceMode, onNegotiationComplete }: SocialFeedProps) {
  const [view, setView]                             = useState<SocialView>(linkedEvent ? 'thread' : 'inbox');
  const [messages, setMessages]                     = useState<Message[]>([]);
  const [currentChallenge, setCurrentChallenge]     = useState<MathChallenge | null>(null);
  const [challengeHints, setChallengeHints]         = useState(0);
  const [keyboardValue, setKeyboardValue]           = useState('');
  const [challengeIndex, setChallengeIndex]         = useState(0);
  const [awaitingAnswer, setAwaitingAnswer]         = useState(false);
  const [solved, setSolved]                         = useState(false);
  const [awaitingFallback, setAwaitingFallback]     = useState(false);
  const [activeLinkedEvent, setActiveLinkedEvent]   = useState<LinkedEvent | null>(null);
  const [practiceTopicOverride, setPracticeTopic]   = useState<ChallengeTopic | null>(null);
  const [wasNegotiation, setWasNegotiation]         = useState(false);
  const [masteryNudge, setMasteryNudge]             = useState<CurriculumLevel | null>(null);
  // Progressive session difficulty: starts at D1, unlocks D2/D3 as player demonstrates mastery
  const [sessionDifficulty, setSessionDifficulty]   = useState<1 | 2 | 3>(1);
  const [correctAtDiff, setCorrectAtDiff]           = useState(0);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const seededRef   = useRef(false);

  const curriculumMax = MAX_DIFFICULTY_BY_LEVEL[state.curriculum?.level ?? 'YEAR_7'];

  function addMsg(msg: Omit<Message, 'id'>) {
    setMessages(prev => [...prev, { ...msg, id: uid() }]);
  }

  // ── Seed a negotiation thread ─────────────────────────────────────────────
  function seedNegotiation(event: PendingClubEvent) {
    const mathChoice = event.choices.find(c => c.requiresMath);
    if (!mathChoice) return;

    const challenge = generateEventChallenge(event, state);
    if (!challenge) return;

    setActiveLinkedEvent({ event, mathChoiceId: mathChoice.id });
    setMessages([]);
    setChallengeHints(0);
    setChallengeIndex(0);
    setSolved(false);
    setAwaitingAnswer(false);
    setWasNegotiation(true);

    addMsg({
      kind: 'npc',
      text: `Boss, we've got a situation that needs your head for numbers. ${challenge.context}`,
      sender: NPC_NAME,
    });

    setCurrentChallenge(challenge);

    setTimeout(() => {
      addMsg({ kind: 'npc', text: "Here's the calculation:", sender: NPC_NAME });
      setTimeout(() => {
        addMsg({ kind: 'challenge', challenge, hintIndex: 0 });
        setAwaitingAnswer(true);
      }, 400);
    }, 600);
  }

  // ── Seed a practice thread ────────────────────────────────────────────────
  function seedPractice(topic: ChallengeTopic) {
    const challenge = generateChallenge(state, 0, getPerformance(state), topic, undefined, sessionDifficulty);

    setActiveLinkedEvent(null);
    setPracticeTopic(topic);
    setMessages([]);
    setChallengeHints(0);
    setChallengeIndex(0);
    setSolved(false);
    setAwaitingAnswer(false);
    setWasNegotiation(false);

    addMsg({
      kind: 'npc',
      text: `Right, let's sharpen up your ${topic} work. ${challenge.context}`,
      sender: PRACTICE_NPC,
    });

    setCurrentChallenge(challenge);

    setTimeout(() => {
      addMsg({ kind: 'npc', text: "Here's the question:", sender: PRACTICE_NPC });
      setTimeout(() => {
        addMsg({ kind: 'challenge', challenge, hintIndex: 0 });
        setAwaitingAnswer(true);
      }, 400);
    }, 600);
  }

  // ── Auto-seed when opened directly from a Pending Decision CTA ───────────
  // Guard against React 18 StrictMode double-invoking this effect — refs
  // survive the simulated unmount/remount cycle so seeding only ever fires once.
  useEffect(() => {
    if (linkedEvent && !seededRef.current) {
      seededRef.current = true;
      setView('thread');
      seedNegotiation(linkedEvent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Answer submission ────────────────────────────────────────────────────
  function handleSubmit() {
    if (!currentChallenge || !keyboardValue || !awaitingAnswer) return;

    const userAnswer = parseFloat(keyboardValue);
    const correct    = Math.abs(userAnswer - currentChallenge.answer) < 0.05;
    const now        = Date.now();
    const npcName    = activeLinkedEvent ? NPC_NAME : PRACTICE_NPC;

    addMsg({ kind: 'player', text: `${keyboardValue}${currentChallenge.unit}` });
    setKeyboardValue('');

    dispatch({
      type: 'RECORD_MATH_ATTEMPT',
      studentId:      state.club.id,
      topic:          currentChallenge.topic,
      difficulty:     currentChallenge.difficulty,
      answer:         keyboardValue,
      expectedAnswer: String(currentChallenge.answer),
      startTime:      now - 5000,
      endTime:        now,
    });

    // Check mastery after every answer (append synthetic event to get up-to-date picture)
    if (!masteryNudge) {
      const syntheticAttempt = {
        type: 'MATH_ATTEMPT_RECORDED' as const,
        timestamp: now,
        studentId: state.club.id,
        topic: currentChallenge.topic,
        difficulty: currentChallenge.difficulty,
        correct,
        timeSpent: 5000,
      };
      const updatedEvents = [...events, syntheticAttempt];
      const currentLevel = state.curriculum?.level ?? 'YEAR_7';
      const nudgeLevel = checkMastery(updatedEvents, currentLevel);
      if (nudgeLevel) setMasteryNudge(nudgeLevel);
    }

    if (correct) {
      setAwaitingAnswer(false);
      setSolved(true);

      // ── Progressive difficulty tracking ─────────────────────────────────────
      // Only count practice-session answers (not event negotiations) toward unlock
      if (!activeLinkedEvent) {
        const diffMatches = currentChallenge.difficulty === sessionDifficulty;
        const newCount = diffMatches ? correctAtDiff + 1 : correctAtDiff;
        const canUnlock = sessionDifficulty < curriculumMax && newCount >= 3;
        if (canUnlock) {
          const next = (sessionDifficulty + 1) as 1 | 2 | 3;
          setSessionDifficulty(next);
          setCorrectAtDiff(0);
          setTimeout(() => addMsg({
            kind: 'system',
            text: `⬆ D${next} unlocked — ${pick(DIFFICULTY_UNLOCK)}`,
          }), 1200);
        } else {
          setCorrectAtDiff(diffMatches ? newCount : 0);
        }
      }

      if (activeLinkedEvent) {
        const result = dispatch({
          type:     'RESOLVE_CLUB_EVENT',
          eventId:  activeLinkedEvent.event.id,
          choiceId: activeLinkedEvent.mathChoiceId,
        });

        if (!result.error) {
          const mathChoice = activeLinkedEvent.event.choices.find(
            c => c.id === activeLinkedEvent.mathChoiceId
          );
          const effect = mathChoice?.budgetEffect;

          const consequenceText = effect !== undefined
            ? effect < 0
              ? `✓ Negotiation successful — Budget ${formatBudgetEffect(effect)} (best available deal)`
              : `✓ Deal secured — Budget ${formatBudgetEffect(effect)}`
            : '✓ Decision resolved — great work on the numbers.';

          setTimeout(() => addMsg({ kind: 'npc', text: pick(NPC_CORRECT), sender: NPC_NAME }), 300);
          setTimeout(() => addMsg({ kind: 'system', text: consequenceText }), 800);

          // Auto-close the negotiation slide-over after the player has seen the result
          if (onNegotiationComplete) {
            setTimeout(() => onNegotiationComplete(), 2500);
          }
        }
      } else {
        // Practice session
        setTimeout(() => addMsg({ kind: 'npc', text: pick(PRACTICE_CORRECT), sender: npcName }), 300);
        setTimeout(() => addMsg({ kind: 'system', text: `✓ ${pick(PRACTICE_CONSEQUENCE)}` }), 800);
      }

    } else {
      const newHints = Math.min(challengeHints + 1, 3);
      setChallengeHints(newHints);

      if (newHints >= 3) {
        setTimeout(() => addMsg({ kind: 'npc', text: pick(NPC_HINT3), sender: npcName }), 300);
        setMessages(prev =>
          prev.map(m =>
            m.kind === 'challenge' && m.challenge?.id === currentChallenge.id
              ? { ...m, hintIndex: 3 }
              : m
          )
        );
        setAwaitingAnswer(false);

        if (activeLinkedEvent) {
          setTimeout(() => {
            addMsg({
              kind:   'npc',
              text:   "Not to worry. We'll have to go with one of the other options instead. " +
                      "It'll cost us a bit more, but we can't let this drag on.",
              sender: NPC_NAME,
            });
            addMsg({
              kind:            'fallback-choices',
              fallbackEvent:   activeLinkedEvent.event,
              excludeChoiceId: activeLinkedEvent.mathChoiceId,
            });
          }, 800);
          setAwaitingFallback(true);
        } else {
          setTimeout(() => addMsg({
            kind: 'system',
            text: '⚠ Missed — study the working above so you can nail it next time.',
          }), 800);
          setSolved(true);
        }
      } else {
        const npc = activeLinkedEvent ? NPC_NAME : PRACTICE_NPC;
        setTimeout(() => addMsg({ kind: 'npc', text: pick(NPC_WRONG), sender: npc }), 300);
        setMessages(prev =>
          prev.map(m =>
            m.kind === 'challenge' && m.challenge?.id === currentChallenge.id
              ? { ...m, hintIndex: newHints }
              : m
          )
        );
      }
    }
  }

  // ── Fallback choice selected ─────────────────────────────────────────────
  function handleFallbackChoice(event: PendingClubEvent, choiceId: string) {
    const result = dispatch({ type: 'RESOLVE_CLUB_EVENT', eventId: event.id, choiceId });
    if (result.error) return;

    const choice = event.choices.find(c => c.id === choiceId);
    const effect = choice?.budgetEffect;

    const consequenceText = effect !== undefined
      ? effect < 0
        ? `⚠ Standard option taken — Budget ${formatBudgetEffect(effect)}`
        : `⚠ Alternative accepted — Budget ${formatBudgetEffect(effect)}`
      : '⚠ Decision made — moving on.';

    addMsg({ kind: 'npc', text: "Right, sorted. Let's not let it hold us back.", sender: NPC_NAME });
    setTimeout(() => addMsg({ kind: 'system', text: consequenceText }), 400);
    setTimeout(() => {
      setAwaitingFallback(false);
      setSolved(true);
    }, 600);

    // Auto-close after fallback choice consequence
    if (onNegotiationComplete) {
      setTimeout(() => onNegotiationComplete(), 2500);
    }
  }

  // ── Next challenge (practice continuation) ────────────────────────────────
  function handleNextChallenge() {
    const nextIdx   = challengeIndex + 1;
    const npcName   = PRACTICE_NPC;
    // Extract template slug from current challenge id (e.g. "ch-0-wage-pct" → "wage-pct")
    const excludeSlug = currentChallenge?.id.replace(/^ch-\d+-/, '') ?? undefined;
    const challenge = generateChallenge(
      state,
      nextIdx,
      getPerformance(state),
      practiceTopicOverride ?? undefined,
      excludeSlug,
      sessionDifficulty,
    );

    setChallengeIndex(nextIdx);
    setChallengeHints(0);
    setSolved(false);
    setWasNegotiation(false);
    setActiveLinkedEvent(null);
    setCurrentChallenge(challenge);

    const transition = NPC_TRANSITIONS[nextIdx % NPC_TRANSITIONS.length];
    addMsg({ kind: 'npc', text: transition, sender: npcName });
    setTimeout(() => addMsg({ kind: 'npc', text: challenge.context, sender: npcName }), 300);
    setTimeout(() => {
      addMsg({ kind: 'npc', text: "Here's the calculation:", sender: npcName });
      setTimeout(() => {
        addMsg({ kind: 'challenge', challenge, hintIndex: 0 });
        setAwaitingAnswer(true);
      }, 400);
    }, 900);
  }

  // ── Inbox handlers ───────────────────────────────────────────────────────
  function handleSelectNegotiation(event: PendingClubEvent) {
    setView('thread');
    seedNegotiation(event);
  }

  function handleSelectPractice(topic: ChallengeTopic) {
    setView('thread');
    seedPractice(topic);
  }

  // ── Render: Inbox ────────────────────────────────────────────────────────
  if (view === 'inbox') {
    return (
      <InboxView
        state={state}
        onSelectNegotiation={handleSelectNegotiation}
        onSelectPractice={handleSelectPractice}
        practiceOnly={practiceMode}
      />
    );
  }

  // ── Render: Thread ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* Back to inbox */}
      {!linkedEvent && (
        <div className="shrink-0 px-3 pt-3">
          <button
            onClick={() => setView('inbox')}
            className="text-xs2 text-txt-muted hover:text-txt-primary transition-colors flex items-center gap-1"
          >
            ← Back to inbox
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
        {messages.map(msg => {

          if (msg.kind === 'npc') {
            return <ChatBubble key={msg.id} sender="npc" name={msg.sender} message={msg.text!} />;
          }

          if (msg.kind === 'player') {
            return <ChatBubble key={msg.id} sender="player" message={msg.text!} />;
          }

          if (msg.kind === 'challenge' && msg.challenge) {
            return (
              <MathChallengeCard
                key={msg.id}
                challenge={msg.challenge}
                hintIndex={msg.hintIndex ?? 0}
              />
            );
          }

          if (msg.kind === 'system') {
            const isPositive = msg.text?.startsWith('✓');
            return (
              <div
                key={msg.id}
                className={`text-center text-xs2 py-1.5 px-3 rounded-tag mx-auto max-w-xs
                  ${isPositive
                    ? 'text-pitch-green bg-pitch-green/10'
                    : 'text-warn-amber bg-warn-amber/10'
                  }`}
              >
                {msg.text}
              </div>
            );
          }

          if (msg.kind === 'fallback-choices' && msg.fallbackEvent) {
            const choices = msg.fallbackEvent.choices.filter(
              c => !c.requiresMath && c.id !== msg.excludeChoiceId
            );
            return (
              <div key={msg.id} className="flex flex-col gap-2 px-1">
                <p className="text-xs text-txt-muted px-2">Choose how to proceed:</p>
                {choices.map(choice => (
                  <button
                    key={choice.id}
                    onClick={() => handleFallbackChoice(msg.fallbackEvent!, choice.id)}
                    disabled={!awaitingFallback}
                    className="text-left rounded-card px-3 py-2.5 bg-bg-raised
                               hover:bg-warn-amber/10 border border-bg-raised
                               hover:border-warn-amber/30 transition-all duration-150
                               disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span className="text-xs font-semibold text-txt-primary">{choice.label}</span>
                    <p className="text-xs2 text-txt-muted mt-0.5">{choice.description}</p>
                    {choice.budgetEffect !== undefined && (
                      <span className={`text-xs2 font-medium mt-1 block ${
                        choice.budgetEffect < 0 ? 'text-alert-red' : 'text-pitch-green'
                      }`}>
                        Budget {formatBudgetEffect(choice.budgetEffect)}
                      </span>
                    )}
                    {choice.reputationEffect !== undefined && (
                      <span className={`text-xs2 font-medium mt-0.5 block ${
                        choice.reputationEffect < 0 ? 'text-alert-red' : 'text-pitch-green'
                      }`}>
                        Rep {choice.reputationEffect > 0 ? '+' : ''}{choice.reputationEffect}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          }

          return null;
        })}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-bg-raised">
        {awaitingAnswer ? (
          <NegotiationKeyboard
            value={keyboardValue}
            onChange={setKeyboardValue}
            onSubmit={handleSubmit}
          />
        ) : awaitingFallback ? (
          <div className="p-3 text-center text-xs2 text-warn-amber">
            ↑ Choose an option above to continue
          </div>
        ) : solved ? (
          <div className="p-3 flex flex-col gap-2">
            {/* Mastery nudge — shown when student has hit the advancement threshold */}
            {masteryNudge && (
              <div className="rounded-card border border-accent-gold/40 bg-accent-gold/10 p-3 flex flex-col gap-2">
                <p className="text-xs font-semibold text-accent-gold">
                  Val Webb · Level Up?
                </p>
                <p className="text-xs2 text-txt-primary">
                  You've been nailing {curriculumDisplayName(state.curriculum?.level ?? 'YEAR_7')} maths
                  consistently. Ready to step up to {curriculumDisplayName(masteryNudge)}?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      dispatch({ type: 'UPGRADE_CURRICULUM', toLevel: masteryNudge });
                      setMasteryNudge(null);
                      addMsg({
                        kind: 'npc',
                        text: `Brilliant. We've stepped things up to ${curriculumDisplayName(masteryNudge)}. The questions will be tougher now, but so will the rewards.`,
                        sender: 'Val Webb',
                      });
                    }}
                    className="flex-1 py-1.5 rounded-card bg-accent-gold text-white text-xs font-semibold
                               hover:bg-accent-gold/80 active:scale-95 transition-all duration-150"
                  >
                    Step up to {CURRICULUM_LEVELS[masteryNudge].displayName}
                  </button>
                  <button
                    onClick={() => setMasteryNudge(null)}
                    className="px-3 py-1.5 rounded-card border border-bg-raised text-txt-muted text-xs
                               hover:text-txt-primary transition-colors"
                  >
                    Not yet
                  </button>
                </div>
              </div>
            )}
            {!linkedEvent && !wasNegotiation && (
              <button
                onClick={handleNextChallenge}
                className="w-full py-2.5 rounded-card bg-data-blue text-white font-semibold
                           text-sm hover:bg-data-blue/80 active:scale-95 transition-all duration-150"
              >
                Next Challenge →
              </button>
            )}
            {!linkedEvent && (
              <button
                onClick={() => setView('inbox')}
                className="w-full py-2 rounded-card text-txt-muted text-xs2
                           hover:text-txt-primary transition-colors"
              >
                ← Back to inbox
              </button>
            )}
          </div>
        ) : (
          <div className="p-3 text-center text-xs2 text-txt-muted">
            Loading challenge…
          </div>
        )}
      </div>
    </div>
  );
}
