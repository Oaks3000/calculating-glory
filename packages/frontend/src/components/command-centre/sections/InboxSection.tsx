import { GameEvent, GameCommand, PendingClubEvent, LeagueTableEntry } from '@calculating-glory/domain';
import { InboxHistory } from '../InboxHistory';

interface InboxSectionProps {
  pendingEvents: PendingClubEvent[];
  events: GameEvent[];
  clubId: string;
  leagueEntries: LeagueTableEntry[];
  currentWeek: number;
  dismissed: Set<number>;
  onDismiss: (idx: number) => void;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
  onMathChallenge: (event: PendingClubEvent) => void;
}

export function InboxSection(props: InboxSectionProps) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <InboxHistory {...props} />
    </div>
  );
}
