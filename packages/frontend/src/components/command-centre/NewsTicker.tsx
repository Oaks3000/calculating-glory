import { GameEvent, MatchSimulatedEvent } from '@calculating-glory/domain';
import { LeagueTableEntry } from '@calculating-glory/domain';

interface NewsTickerProps {
  events: GameEvent[];
  clubId: string;
  leagueEntries: LeagueTableEntry[];
}

function buildHeadlines(
  events: GameEvent[],
  clubId: string,
  nameMap: Map<string, string>
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
    } else if (e.type === 'NPC_PLAYER_SIGNED') {
      headlines.push(`${e.npcClubName} sign ${e.player.name}`);
    } else if (e.type === 'TRANSFER_COMPLETED') {
      headlines.push(`Transfer: ${e.player.name} joins the squad`);
    } else if (e.type === 'PLAYER_SOLD') {
      headlines.push(`Departure: Player sold for ${(e.fee / 100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })}`);
    } else if (e.type === 'FACILITY_UPGRADED') {
      headlines.push(`Facility upgraded: ${e.facilityType} → Level ${e.level}`);
    } else if (e.type === 'SEASON_ENDED') {
      const status = e.promoted ? '🏆 PROMOTED!' : e.relegated ? '⚠ RELEGATED' : 'Season complete';
      headlines.push(`${status} — Final position: ${e.finalPosition}`);
    }
  }

  // Most recent first, max 30
  return headlines.slice(-30).reverse();
}

export function NewsTicker({ events, clubId, leagueEntries }: NewsTickerProps) {
  const nameMap = new Map<string, string>(leagueEntries.map(e => [e.clubId, e.clubName]));
  const headlines = buildHeadlines(events, clubId, nameMap);

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
