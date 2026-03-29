/**
 * GameState → GameStateVariables extractor.
 * Called at runtime before resolving a question template.
 */
import { GameState } from '../../types/game-state-updated';
import { GameStateVariables } from './types';

function dp1(n: number) { return Math.round(n * 10) / 10; }
function dp2(n: number) { return Math.round(n * 100) / 100; }

export function extractVariables(state: GameState): GameStateVariables {
  const { club, league, boardConfidence, currentWeek, season } = state;

  const entry = league.entries.find(e => e.clubId === club.id);
  const played       = entry?.played       ?? 0;
  const won          = entry?.won          ?? 0;
  const drawn        = entry?.drawn        ?? 0;
  const lost         = entry?.lost         ?? 0;
  const points       = entry?.points       ?? 0;
  const goalsFor     = entry?.goalsFor     ?? 0;
  const goalsAgainst = entry?.goalsAgainst ?? 0;
  const leaguePosition = entry?.position   ?? 12;

  const safePlayed = Math.max(played, 1);

  const wageBillWeeklyPounds = Math.round(
    (club.squad.reduce((s, p) => s + p.wage, 0) +
     club.staff.reduce((s, st) => s + st.salary, 0)) / 100
  );
  const wageBudgetWeeklyPounds = Math.round(club.wageBudget / 100);

  return {
    transferBudgetPounds: Math.round(club.transferBudget / 100),
    transferBudgetK:      Math.round(club.transferBudget / 100_000),
    transferBudgetM:      dp1(club.transferBudget / 100_000_000),

    wageBudgetWeeklyPounds,
    wageBillWeeklyPounds,
    wageHeadroomPounds: wageBudgetWeeklyPounds - wageBillWeeklyPounds,

    played, won, drawn, lost, points, goalsFor, goalsAgainst,
    leaguePosition,
    gamesRemaining:    46 - played,
    maxPointsPossible: played * 3,

    boardConfidence: boardConfidence ?? 50,
    currentWeek,
    season,

    winRatePct:          played > 0 ? Math.round((won / safePlayed) * 100) : 0,
    pointsPerGame:       played > 0 ? dp1(points / safePlayed) : 0,
    goalsForPerGame:     played > 0 ? dp2(goalsFor / safePlayed) : 0,
    goalsAgainstPerGame: played > 0 ? dp2(goalsAgainst / safePlayed) : 0,
  };
}
