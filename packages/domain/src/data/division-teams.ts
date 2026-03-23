/**
 * Division-aware team pool lookup.
 *
 * Returns the correct set of 23 NPC opponent clubs for a given division.
 */

import { LEAGUE_TWO_TEAMS, LeagueTwoTeam } from './league-two-teams';
import { LEAGUE_ONE_TEAMS } from './league-one-teams';
import { CHAMPIONSHIP_TEAMS } from './championship-teams';
import { PREMIER_LEAGUE_TEAMS } from './premier-league-teams';
import { Division } from '../types/game-state-updated';

export function getTeamsForDivision(division: Division): LeagueTwoTeam[] {
  switch (division) {
    case 'PREMIER_LEAGUE':
      return PREMIER_LEAGUE_TEAMS;
    case 'CHAMPIONSHIP':
      return CHAMPIONSHIP_TEAMS;
    case 'LEAGUE_ONE':
      return LEAGUE_ONE_TEAMS;
    case 'LEAGUE_TWO':
    default:
      return LEAGUE_TWO_TEAMS;
  }
}
