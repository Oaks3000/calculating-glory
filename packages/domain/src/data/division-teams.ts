/**
 * Division-aware team pool lookup.
 *
 * Returns the correct set of 23 NPC opponent clubs for a given division.
 * Championship and Premier League are not yet implemented — they fall back
 * to League One (placeholder; will be replaced when those divisions are built).
 */

import { LEAGUE_TWO_TEAMS, LeagueTwoTeam } from './league-two-teams';
import { LEAGUE_ONE_TEAMS } from './league-one-teams';
import { Division } from '../types/game-state-updated';

export function getTeamsForDivision(division: Division): LeagueTwoTeam[] {
  switch (division) {
    case 'LEAGUE_ONE':
    case 'CHAMPIONSHIP':
    case 'PREMIER_LEAGUE':
      return LEAGUE_ONE_TEAMS;
    case 'LEAGUE_TWO':
    default:
      return LEAGUE_TWO_TEAMS;
  }
}
