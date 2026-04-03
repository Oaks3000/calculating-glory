import { GameEvent, MatchSimulatedEvent, MoraleTickerEvent, Player, PendingClubEvent, avgSquadMorale, isUnsettled } from '@calculating-glory/domain';
import { LeagueTableEntry } from '@calculating-glory/domain';

// ── Ordinal helper ──────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

interface NewsTickerProps {
  events: GameEvent[];
  clubId: string;
  clubName: string;
  stadiumName: string;
  leagueEntries: LeagueTableEntry[];
  squad: Player[];
  freeAgents?: Player[];
  pendingEvents?: PendingClubEvent[];
  currentWeek?: number;
}

// ── Season arc headlines ────────────────────────────────────────────────────
//
// Narrative headlines derived from the current state of the season.
// Fire on streak milestones, zone entries, and new best-result records.
// Added to the tail of the ticker so they appear alongside match scores.

function buildSeasonArcHeadlines(
  events: GameEvent[],
  clubId: string,
  clubName: string,
  leagueEntries: LeagueTableEntry[],
  currentWeek?: number,
): string[] {
  if (!currentWeek || currentWeek < 3) return [];

  const headlines: string[] = [];
  const nameMap = new Map(leagueEntries.map(e => [e.clubId, e.clubName]));

  // ── Compute form from events ─────────────────────────────────────────────
  const playerMatches = (events.filter(e =>
    e.type === 'MATCH_SIMULATED' &&
    (e as MatchSimulatedEvent).homeTeamId === clubId ||
    (e.type === 'MATCH_SIMULATED' && (e as MatchSimulatedEvent).awayTeamId === clubId)
  ) as MatchSimulatedEvent[]);

  if (playerMatches.length < 3) return headlines;

  type Result = 'W' | 'D' | 'L';
  const results: Result[] = playerMatches.map(m => {
    const isHome = m.homeTeamId === clubId;
    const p = isHome ? m.homeGoals : m.awayGoals;
    const o = isHome ? m.awayGoals : m.homeGoals;
    return p > o ? 'W' : p < o ? 'L' : 'D';
  });

  // Current streak
  const latest = results[results.length - 1];
  let streak = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i] === latest) streak++;
    else break;
  }

  // ── Win streak milestones (3 / 5 / 7+) ──────────────────────────────────
  if (latest === 'W') {
    if (streak === 3) headlines.push(`🔥 ${clubName} on a 3-game winning run — momentum building`);
    else if (streak === 5) headlines.push(`🔥 Five straight wins — ${clubName} are flying`);
    else if (streak === 7) headlines.push(`🔥 Seven in a row — one of the best runs in the division`);
    else if (streak >= 9) headlines.push(`🔥 ${streak}-game winning run — extraordinary form from ${clubName}`);
  }

  // ── Loss streak milestones ───────────────────────────────────────────────
  if (latest === 'L') {
    if (streak === 3) headlines.push(`⚠ 3 straight defeats — the run has to end`);
    else if (streak === 5) headlines.push(`⚠ Five straight defeats — crisis point for ${clubName}`);
    else if (streak >= 7) headlines.push(`⚠ ${streak} games without a win — alarm bells ringing at ${clubName}`);
  }

  // ── Unbeaten run (mix of W/D, no L for 5+) ──────────────────────────────
  if (latest !== 'L') {
    let unbeaten = 0;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i] !== 'L') unbeaten++;
      else break;
    }
    if (unbeaten >= 5 && streak < 3) {
      // Only show if not already covered by a win-streak headline
      headlines.push(`${clubName} unbeaten in ${unbeaten} — solid and hard to beat`);
    }
  }

  // ── New season-best win (fires on the week it happens) ──────────────────
  const lastMatch = playerMatches[playerMatches.length - 1];
  const lastIsHome = lastMatch.homeTeamId === clubId;
  const lastP = lastIsHome ? lastMatch.homeGoals : lastMatch.awayGoals;
  const lastO = lastIsHome ? lastMatch.awayGoals : lastMatch.homeGoals;
  const lastDiff = lastP - lastO;

  if (lastDiff >= 3) {
    // Check if this is the biggest margin of the season
    const margins = playerMatches.slice(0, -1).map(m => {
      const ih = m.homeTeamId === clubId;
      return (ih ? m.homeGoals : m.awayGoals) - (ih ? m.awayGoals : m.homeGoals);
    });
    const prevBest = margins.length > 0 ? Math.max(...margins) : 0;
    if (lastDiff > prevBest) {
      const opponentId = lastIsHome ? lastMatch.awayTeamId : lastMatch.homeTeamId;
      const opponentName = nameMap.get(opponentId) ?? 'opposition';
      headlines.push(`★ SEASON BEST — ${lastP}–${lastO} vs ${opponentName} — ${clubName}'s biggest win this season`);
    }
  }

  // ── Zone banners (fires on weeks divisible by 5 to avoid every-week spam) ─
  const playerEntry = leagueEntries.find(e => e.clubId === clubId);
  if (playerEntry && currentWeek % 5 === 0) {
    const pos   = playerEntry.position;
    const total = leagueEntries.length;
    const autoPromo   = 3;
    const playoffEdge = 7;
    const dropZone    = total - 1; // bottom 2 start here

    if (pos <= autoPromo) {
      headlines.push(`🏆 ${clubName} in the automatic promotion places — ${ordinal(pos)} in League Two`);
    } else if (pos <= playoffEdge) {
      headlines.push(`⚔️ Playoff contenders — ${clubName} sit ${ordinal(pos)} in the table`);
    } else if (pos >= dropZone) {
      headlines.push(`⚠ ${clubName} in the drop zone — ${ordinal(pos)} — every point is crucial`);
    }
  }

  return headlines;
}

function buildMoraleHeadlines(squad: Player[]): string[] {
  if (squad.length === 0) return [];
  const headlines: string[] = [];

  // Avg morale band messages (live state — always relevant while condition holds)
  const avg = avgSquadMorale(squad);
  if (avg >= 75) {
    headlines.push('Dressing room atmosphere excellent — squad fully motivated');
  } else if (avg < 25) {
    headlines.push('⚠ Crisis talks needed — squad morale has collapsed');
  } else if (avg < 35) {
    headlines.push('Serious morale concerns in the camp');
  }

  // Unsettled player callouts
  const unsettled = squad.filter(p => isUnsettled(p));
  if (unsettled.length >= 3) {
    headlines.push(`${unsettled.length} players showing signs of unrest`);
  } else if (unsettled.length === 2) {
    headlines.push(`${unsettled[0].name} and ${unsettled[1].name} showing signs of unrest`);
  } else if (unsettled.length === 1) {
    headlines.push(`${unsettled[0].name} showing signs of unrest`);
  }

  return headlines;
}

// ── Transfer rumours ────────────────────────────────────────────────────────
//
// Free agents with high NPC interest appear as rumours before any deal is done.
// Uses the same deterministic hash as getNpcInterestCount in TransferMarketSlideOver.

function getNpcInterestForTicker(playerId: string): number {
  let h = 0;
  for (let i = 0; i < playerId.length; i++) {
    h = (Math.imul(31, h) + playerId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 4;
}

function buildPoachHeadlines(pendingEvents: PendingClubEvent[]): string[] {
  return pendingEvents
    .filter(e => e.templateId === 'npc-poach' && !e.resolved && e.metadata?.playerName)
    .map(e => `🚨 BREAKING · ${e.metadata!.npcClubName} submit formal bid for ${e.metadata!.playerName} — decision pending`);
}

function buildRumourHeadlines(freeAgents: Player[], clubName: string): string[] {
  // Only surface the top 3 most-wanted agents (npcInterest >= 2), max 3 rumours
  const hotAgents = freeAgents
    .map(p => ({ p, interest: getNpcInterestForTicker(p.id) }))
    .filter(x => x.interest >= 2)
    .sort((a, b) => b.interest - a.interest)
    .slice(0, 3);

  return hotAgents.map(({ p, interest }) => {
    const clubs = interest === 3 ? 'three clubs' : 'two clubs';
    const posLabel = p.position === 'GK' ? 'goalkeeper' :
                     p.position === 'DEF' ? 'defender' :
                     p.position === 'MID' ? 'midfielder' : 'forward';
    return `📰 RUMOUR · ${p.name} attracting interest — ${clubs} tracking the ${posLabel}, including ${clubName}`;
  });
}

function buildHeadlines(
  events: GameEvent[],
  clubId: string,
  clubName: string,
  stadiumName: string,
  nameMap: Map<string, string>,
  squad: Player[],
  leagueEntries: LeagueTableEntry[],
  currentWeek?: number
): string[] {
  const headlines: string[] = [];

  for (const e of events) {
    if (e.type === 'MATCH_SIMULATED') {
      const m = e as MatchSimulatedEvent;
      const home = nameMap.get(m.homeTeamId) ?? m.homeTeamId;
      const away = nameMap.get(m.awayTeamId) ?? m.awayTeamId;
      const isPlayer = m.homeTeamId === clubId || m.awayTeamId === clubId;
      const score = `${m.homeGoals}–${m.awayGoals}`;
      headlines.push(isPlayer ? `★ ${home} ${score} ${away}` : `${home} ${score} ${away}`);
    } else if (e.type === 'MORALE_TICKER_EVENT') {
      headlines.push((e as MoraleTickerEvent).headline);
    } else if (e.type === 'NPC_PLAYER_SIGNED') {
      headlines.push(`${e.npcClubName} sign ${e.player.name}`);
    } else if (e.type === 'FREE_AGENT_SIGNED') {
      const count = e.npcInterestCount ?? 0;
      if (count >= 2) {
        headlines.push(`${clubName} sign ${e.player.name} — beat ${count} clubs to the deal`);
      } else if (count === 1) {
        headlines.push(`${clubName} pip rivals to sign ${e.player.name}`);
      } else {
        headlines.push(`${clubName} sign ${e.player.name} as a free agent`);
      }
    } else if (e.type === 'TRANSFER_COMPLETED') {
      headlines.push(`${clubName} complete transfer: ${e.player.name} arrives`);
    } else if (e.type === 'PLAYER_SOLD') {
      const fee = (e.fee / 100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
      if (e.playerName && e.npcClubName) {
        headlines.push(`${e.playerName} leaves ${clubName} to join ${e.npcClubName} for ${fee}`);
      } else {
        headlines.push(`${clubName}: Departure confirmed — player sold for ${fee}`);
      }
    } else if (e.type === 'FACILITY_UPGRADED') {
      headlines.push(`${clubName} invest at ${stadiumName}: ${e.facilityType} upgraded to Level ${e.level}`);
    } else if (e.type === 'SEASON_ENDED') {
      const status = e.promoted ? '🏆 PROMOTED!' : e.relegated ? '⚠ RELEGATED' : 'Season complete';
      headlines.push(`${clubName}: ${status} — Final position: ${e.finalPosition}`);
    }
  }

  // Most recent events first, max 30; live morale state appended at the end
  // Milestone week context (live state — shown for the week leading up to and including the milestone)
  const milestoneHeadlines: string[] = [];
  if (currentWeek !== undefined) {
    if (currentWeek === 22 || currentWeek === 23) {
      milestoneHeadlines.push(`Halfway through the season — how are ${clubName} measuring up?`);
    } else if (currentWeek === 36 || currentWeek === 37) {
      milestoneHeadlines.push(`The run-in begins — 10 games left for ${clubName} to make their mark`);
    } else if (currentWeek === 45 || currentWeek === 46) {
      milestoneHeadlines.push(`⚠ FINAL DAY — everything is still to play for at ${stadiumName}`);
    }
  }

  const arcHeadlines = buildSeasonArcHeadlines(events, clubId, clubName, leagueEntries, currentWeek);
  return [...headlines.slice(-30).reverse(), ...buildMoraleHeadlines(squad), ...milestoneHeadlines, ...arcHeadlines];
}

export function NewsTicker({ events, clubId, clubName, stadiumName, leagueEntries, squad, freeAgents, pendingEvents, currentWeek }: NewsTickerProps) {
  const nameMap = new Map<string, string>(leagueEntries.map(e => [e.clubId, e.clubName]));
  const eventHeadlines = buildHeadlines(events, clubId, clubName, stadiumName, nameMap, squad, leagueEntries, currentWeek);
  const rumourHeadlines = freeAgents && freeAgents.length > 0 ? buildRumourHeadlines(freeAgents, clubName) : [];
  const poachHeadlines = pendingEvents ? buildPoachHeadlines(pendingEvents) : [];
  const headlines = [...poachHeadlines, ...eventHeadlines, ...rumourHeadlines];

  if (headlines.length === 0) return null;

  // Duplicate the list so the CSS animation loops seamlessly
  const tickerContent = [...headlines, ...headlines].join('   ·   ');

  return (
    <div className="card overflow-hidden py-2">
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-data-blue uppercase tracking-widest shrink-0 px-1">
          LIVE
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div
            className="whitespace-nowrap text-xs data-font text-txt-muted animate-ticker"
            style={{ display: 'inline-block' }}
          >
            {tickerContent}
          </div>
        </div>
      </div>
    </div>
  );
}
