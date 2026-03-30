import { GameEvent, MatchSimulatedEvent, MoraleTickerEvent, Player, avgSquadMorale, isUnsettled } from '@calculating-glory/domain';
import { LeagueTableEntry } from '@calculating-glory/domain';

interface NewsTickerProps {
  events: GameEvent[];
  clubId: string;
  leagueEntries: LeagueTableEntry[];
  squad: Player[];
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

function buildHeadlines(
  events: GameEvent[],
  clubId: string,
  nameMap: Map<string, string>,
  squad: Player[]
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
    } else if (e.type === 'TRANSFER_COMPLETED') {
      headlines.push(`Transfer: ${e.player.name} joins the squad`);
    } else if (e.type === 'PLAYER_SOLD') {
      const fee = (e.fee / 100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
      if (e.playerName && e.npcClubName) {
        headlines.push(`${e.playerName} joins ${e.npcClubName} for ${fee}`);
      } else {
        headlines.push(`Departure: Player sold for ${fee}`);
      }
    } else if (e.type === 'FACILITY_UPGRADED') {
      headlines.push(`Facility upgraded: ${e.facilityType} → Level ${e.level}`);
    } else if (e.type === 'SEASON_ENDED') {
      const status = e.promoted ? '🏆 PROMOTED!' : e.relegated ? '⚠ RELEGATED' : 'Season complete';
      headlines.push(`${status} — Final position: ${e.finalPosition}`);
    }
  }

  // Most recent events first, max 30; live morale state appended at the end
  return [...headlines.slice(-30).reverse(), ...buildMoraleHeadlines(squad)];
}

export function NewsTicker({ events, clubId, leagueEntries, squad }: NewsTickerProps) {
  const nameMap = new Map<string, string>(leagueEntries.map(e => [e.clubId, e.clubName]));
  const headlines = buildHeadlines(events, clubId, nameMap, squad);

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
