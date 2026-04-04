import {
  GameState,
  generateSeasonFixtures,
  getWeekFixtures,
  LeagueTable,
  avgSquadMorale,
  MatchSimulatedEvent,
} from '@calculating-glory/domain';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PreMatchOverlayProps {
  state: GameState;
  onKickOff: () => void;
  onCancel: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const colour =
    result === 'W' ? 'bg-pitch-green' :
    result === 'D' ? 'bg-warn-amber' :
    'bg-alert-red';
  const label = result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss';
  return (
    <span title={label} className={`w-4 h-4 rounded-full ${colour} inline-block`} />
  );
}

function FormRow({ form, label }: { form: ('W' | 'D' | 'L')[]; label: string }) {
  const last5 = form.slice(-5);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-txt-muted w-20 shrink-0 text-right">{label}</span>
      <div className="flex gap-1">
        {last5.length === 0
          ? <span className="text-xs text-txt-muted">No results yet</span>
          : last5.map((r, i) => <FormDot key={i} result={r} />)
        }
      </div>
    </div>
  );
}

// ── NPC pre-match teasers ─────────────────────────────────────────────────────

// Seeded pick: deterministic per week+season so the same game always shows the same line.
function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

const KEV_TEASERS = [
  "Right. Phones on silent, eyes on me.",
  "I've seen worse squads hold on for a point. We're fine.",
  "I'm not saying it's easy. I'm saying we've done harder.",
  "Big one today. No reason to panic. Some reason to panic.",
  "They're decent. We're decent. May the best decent team win.",
  "I've got a feeling about this one. Could be heartburn.",
  "Whatever happens today, I'll be here. That's both a promise and a threat.",
  "Win this and the rest of the week feels different. Trust me.",
];

const MARCUS_TEASERS = [
  "You know, match days are great for concession revenue. Focus on the football though.",
  "I did a quick analysis. Our expected points from this fixture are... well, let's just play.",
  "Three points here and I can start planning that expansion proposal. No pressure.",
  "Win or lose, the merchandise stall does better on match day. But let's win.",
  "I ran the numbers. A win here lifts our commercial projections meaningfully. Meaningfully.",
  "The board's watching. Not in a scary way. Well. A little scary.",
];

function getNpcTeaser(
  week: number,
  season: number,
  isSixPointer: boolean,
  myForm: ('W' | 'D' | 'L')[],
): { name: string; colour: string; line: string } {
  const seed = week * 31 + season * 7;
  // Kev for big/emotional moments; Marcus otherwise
  const recentLosses = myForm.slice(-3).filter(r => r === 'L').length;
  const useKev = isSixPointer || recentLosses >= 2 || week % 2 === 0;
  if (useKev) {
    return { name: 'Kev Mulligan', colour: 'text-data-blue', line: seededPick(KEV_TEASERS, seed) };
  }
  return { name: 'Marcus Webb', colour: 'text-pitch-green', line: seededPick(MARCUS_TEASERS, seed) };
}

// ── Morale indicator ──────────────────────────────────────────────────────────

function getMoraleLabel(morale: number): { label: string; colour: string } {
  if (morale >= 75) return { label: 'High morale', colour: 'text-pitch-green' };
  if (morale >= 50) return { label: 'Steady', colour: 'text-txt-muted' };
  if (morale >= 30) return { label: 'Unsettled', colour: 'text-warn-amber' };
  return { label: 'Low spirits', colour: 'text-alert-red' };
}

// ── Season milestone banner ────────────────────────────────────────────────────

const MILESTONE_CONFIG: Record<number, { label: string; colour: string; bg: string; sub: string }> = {
  23: { label: 'HALFWAY POINT',  colour: 'text-data-blue',   bg: 'bg-data-blue/10 border-data-blue/30',   sub: 'The season is exactly half done. Where do you stand?' },
  37: { label: 'THE RUN-IN',     colour: 'text-warn-amber',  bg: 'bg-warn-amber/10 border-warn-amber/30', sub: '10 games to go — every point counts now.' },
  46: { label: 'FINAL DAY',      colour: 'text-alert-red',   bg: 'bg-alert-red/10 border-alert-red/30',   sub: 'The last game of the season. Everything still to play for.' },
};

// ── Six-pointer detection ─────────────────────────────────────────────────────

function getSixPointerLabel(
  myPos: number,
  opponentPos: number,
  league: LeagueTable,
): string | null {
  const promoBottom  = league.automaticPromotion;       // 3
  const playoffBottom = league.playoffPositions[3];     // 7
  const relegStart   = league.relegation[0];            // 22

  const bothInPromo    = myPos <= playoffBottom && opponentPos <= playoffBottom;
  const bothNearRelev  = myPos >= relegStart - 2 && opponentPos >= relegStart - 2;
  const closePromo     = myPos <= playoffBottom + 2 && opponentPos <= promoBottom + 1;
  const closeToDrop    = Math.abs(myPos - relegStart) <= 3 && Math.abs(opponentPos - relegStart) <= 3;

  if (myPos <= promoBottom && opponentPos <= promoBottom) return 'TOP-OF-THE-TABLE CLASH';
  if (bothInPromo)   return 'PROMOTION SIX-POINTER';
  if (closePromo)    return 'HUGE PLAYOFF BATTLE';
  if (bothNearRelev) return 'RELEGATION BATTLE';
  if (closeToDrop)   return 'MUST-NOT-LOSE FIXTURE';
  return null;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PreMatchOverlay({ state, onKickOff, onCancel }: PreMatchOverlayProps) {
  const nextWeek = state.currentWeek + 1;

  // Compute next week's fixture for the player's club
  const teamIds = state.league.entries.map(e => e.clubId);
  const seed = `calculating-glory-mvp-v1-w${nextWeek}`;
  const allFixtures = generateSeasonFixtures({ teamIds, season: state.season, seed });
  const weekFixtures = getWeekFixtures(allFixtures, nextWeek);
  const myFixture = weekFixtures?.fixtures.find(
    f => f.homeTeamId === state.club.id || f.awayTeamId === state.club.id,
  );

  const isHome = myFixture?.homeTeamId === state.club.id;
  const opponentId = isHome ? myFixture?.awayTeamId : myFixture?.homeTeamId;
  const opponentEntry = state.league.entries.find(e => e.clubId === opponentId);
  const opponentName = opponentEntry?.clubName ?? 'Unknown';

  const myEntry = state.league.entries.find(e => e.clubId === state.club.id);
  const myPos = myEntry?.position ?? 0;
  const opponentPos = opponentEntry?.position ?? 0;
  const myForm = myEntry?.form ?? [];
  const opponentForm = opponentEntry?.form ?? [];

  const milestone = MILESTONE_CONFIG[nextWeek] ?? null;
  const sixPointer = myPos > 0 && opponentPos > 0
    ? getSixPointerLabel(myPos, opponentPos, state.league)
    : null;

  const morale = avgSquadMorale(state.club.squad);
  const moraleLabel = getMoraleLabel(morale);
  const formation = state.club.preferredFormation;
  const teaser = getNpcTeaser(nextWeek, state.season, !!sixPointer, myForm);

  // Head-to-head: find the most recent previous match vs this opponent
  const prevMatch = opponentId ? (() => {
    const matches = (state.events as MatchSimulatedEvent[])
      .filter(e =>
        (e as any).type === 'MATCH_SIMULATED' &&
        (e.homeTeamId === state.club.id || e.awayTeamId === state.club.id) &&
        (e.homeTeamId === opponentId || e.awayTeamId === opponentId),
      );
    const prev = matches[matches.length - 1];
    if (!prev) return null;
    const isHome = prev.homeTeamId === state.club.id;
    const pGoals = isHome ? prev.homeGoals : prev.awayGoals;
    const oGoals = isHome ? prev.awayGoals : prev.homeGoals;
    const result: 'W' | 'D' | 'L' = pGoals > oGoals ? 'W' : pGoals < oGoals ? 'L' : 'D';
    const weekNum = parseInt((prev.matchId ?? '0').split('-W')[1] ?? '0');
    const seasonNum = parseInt((prev.matchId ?? '0').replace('S', '').split('-')[0] ?? '1');
    return { pGoals, oGoals, result, week: weekNum, season: seasonNum };
  })() : null;

  return (
    <div className="fixed inset-0 bg-bg-deep flex flex-col z-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-bg-raised">
        <span className="text-xs font-bold text-txt-muted uppercase tracking-widest">
          Match Day — Week {nextWeek}
        </span>
        <button
          onClick={onCancel}
          className="text-xs text-txt-muted hover:text-txt-primary transition-colors"
        >
          ✕ Cancel
        </button>
      </div>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">

        {/* Milestone banner */}
        {milestone && (
          <div className={`w-full max-w-sm rounded-card border px-4 py-2.5 text-center ${milestone.bg}`}>
            <p className={`text-xs font-bold uppercase tracking-widest ${milestone.colour}`}>
              {milestone.label}
            </p>
            <p className="text-xs text-txt-muted mt-0.5">{milestone.sub}</p>
          </div>
        )}

        {/* Six-pointer badge */}
        {!milestone && sixPointer && (
          <div className="w-full max-w-sm rounded-card border border-alert-red/30 bg-alert-red/5 px-4 py-2 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-alert-red">{sixPointer}</p>
          </div>
        )}

        {/* Teams header */}
        <div className="flex items-center gap-6 w-full max-w-sm">
          <div className="flex-1 text-right">
            <p className={`font-bold text-base ${isHome ? 'text-txt-primary' : 'text-txt-muted'}`}>
              {state.club.name}
            </p>
            <p className="text-xs text-txt-muted">
              {isHome ? 'Home' : 'Away'}{myPos > 0 ? ` · ${myPos}${ordinal(myPos)}` : ''}
            </p>
            {formation && (
              <span className="inline-block mt-1 text-xs font-mono bg-bg-raised text-txt-muted px-2 py-0.5 rounded">
                {formation}
              </span>
            )}
          </div>

          <div className="text-center shrink-0">
            <div className="text-2xl font-bold text-txt-muted">vs</div>
          </div>

          <div className="flex-1 text-left">
            <p className={`font-bold text-base ${!isHome ? 'text-txt-primary' : 'text-txt-muted'}`}>
              {opponentName}
            </p>
            <p className="text-xs text-txt-muted">
              {!isHome ? 'Home' : 'Away'}{opponentPos > 0 ? ` · ${opponentPos}${ordinal(opponentPos)}` : ''}
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm border-t border-bg-raised" />

        {/* Form rows */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <p className="text-xs font-semibold text-txt-muted uppercase tracking-wider text-center">Recent form</p>
          <FormRow form={myForm} label={state.club.name} />
          <FormRow form={opponentForm} label={opponentName} />
        </div>

        {/* Head-to-head history */}
        {prevMatch && (
          <div className="w-full max-w-sm text-center">
            <p className="text-[10px] text-txt-muted uppercase tracking-wider mb-0.5">Last time you met</p>
            <p className={`text-xs font-semibold ${
              prevMatch.result === 'W' ? 'text-pitch-green' :
              prevMatch.result === 'L' ? 'text-alert-red' : 'text-warn-amber'
            }`}>
              {prevMatch.result === 'W' ? 'You won' : prevMatch.result === 'L' ? 'You lost' : 'You drew'}{' '}
              {prevMatch.pGoals}–{prevMatch.oGoals}
              {prevMatch.season !== state.season && ` · S${prevMatch.season} W${prevMatch.week}`}
              {prevMatch.season === state.season && ` · Week ${prevMatch.week}`}
            </p>
          </div>
        )}

        {/* Squad morale + flavour row */}
        <div className="flex items-center justify-between w-full max-w-sm">
          <p className="text-sm text-txt-muted max-w-[60%]">
            {getFlavorText(myForm, opponentForm, isHome, !!sixPointer)}
          </p>
          <div className="text-right shrink-0">
            <p className="text-xs text-txt-muted uppercase tracking-wider">Squad</p>
            <p className={`text-xs font-semibold ${moraleLabel.colour}`}>{moraleLabel.label}</p>
          </div>
        </div>

        {/* NPC teaser */}
        <div className="w-full max-w-sm rounded-card bg-bg-raised border border-bg-raised px-4 py-3">
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${teaser.colour}`}>
            {teaser.name}
          </p>
          <p className="text-sm text-txt-primary italic">"{teaser.line}"</p>
        </div>
      </div>

      {/* ── Kick off button ────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-6 border-t border-bg-raised flex flex-col gap-2">
        <button
          onClick={onKickOff}
          className="w-full py-4 rounded-card bg-pitch-green text-bg-deep text-base font-bold
                     hover:bg-pitch-green/80 active:scale-95 transition-all duration-150 tracking-wide"
        >
          KICK OFF →
        </button>
        <p className="text-center text-xs text-txt-muted">
          Kev will be watching from the stands
        </p>
      </div>
    </div>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────

function ordinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

function getFlavorText(
  myForm: ('W' | 'D' | 'L')[],
  opponentForm: ('W' | 'D' | 'L')[],
  isHome: boolean,
  isSixPointer: boolean,
): string {
  const recent3 = myForm.slice(-3);
  const opp3 = opponentForm.slice(-3);
  const myWins = recent3.filter(r => r === 'W').length;
  const myLosses = recent3.filter(r => r === 'L').length;
  const oppWins = opp3.filter(r => r === 'W').length;

  if (isSixPointer) return 'This one could define your season. No pressure.';
  if (myWins === 3) return 'You\'re on fire — can you make it four in a row?';
  if (myLosses === 3) return 'The players need you behind them today.';
  if (oppWins === 3) return 'They\'re in great form. A big test for the squad.';
  if (isHome) return 'The fans expect a performance at home today.';
  return 'Nothing to lose on the road. Go and get something.';
}
