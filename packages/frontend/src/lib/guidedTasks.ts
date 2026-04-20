import { GameState, GameEvent } from '@calculating-glory/domain';
import { NPCS, Npc } from './npcs';

export type GuidedTaskId = 'sponsor' | 'manager' | 'signing' | 'facility';

export interface GuidedTask {
  id: GuidedTaskId;
  npc: Npc;
  title: string;
  blurb: string;
  done: boolean;
}

// Derive the four guided-pre-season task statuses from the event log. Every
// signal we need is already fired by existing domain handlers — no new
// reducer state is introduced for this feature.
export function getGuidedTasks(state: GameState, events: GameEvent[]): GuidedTask[] {
  const clubId = state.club.id;
  const inClub = (e: GameEvent): e is Extract<GameEvent, { clubId: string }> =>
    'clubId' in e && (e as { clubId?: string }).clubId === clubId;

  const sponsorDone = events.some(
    e => e.type === 'BUDGET_UPDATED' && inClub(e) && e.reason.startsWith('intro-sponsor-deal-option-')
  );
  const managerDone = state.club.manager !== null
    || events.some(e => e.type === 'MANAGER_HIRED' && inClub(e));
  const signingDone = events.some(
    e => (e.type === 'TRANSFER_COMPLETED' || e.type === 'FREE_AGENT_SIGNED') && inClub(e)
  );
  const facilityDone = events.some(e => e.type === 'FACILITY_UPGRADE_STARTED' && inClub(e));

  return [
    {
      id: 'sponsor',
      npc: NPCS.marcus,
      title: 'Lock in the pre-season sponsor',
      blurb: 'Local firm wants their logo on our shirts. Not glamorous — but it funds the ambition.',
      done: sponsorDone,
    },
    {
      id: 'manager',
      npc: NPCS.kev,
      title: 'Appoint a manager',
      blurb: 'Pick a gaffer who matches how you want us to play. Promotion-chasers need a different voice to survivalists.',
      done: managerDone,
    },
    {
      id: 'signing',
      npc: NPCS.kev,
      title: 'Sign a player the fans can get excited about',
      blurb: 'The squad we inherited is mid-table at best. One standout signing changes the conversation.',
      done: signingDone,
    },
    {
      id: 'facility',
      npc: NPCS.dani,
      title: 'Put money into a facility',
      blurb: 'Every trophy this club ever won started with a training pitch that worked. Your first statement of intent.',
      done: facilityDone,
    },
  ];
}
