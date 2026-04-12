import { GameState } from '@calculating-glory/domain';
import { SquadAuditTable } from '../SquadAuditTable';

interface SquadSectionProps {
  state: GameState;
}

export function SquadSection({ state }: SquadSectionProps) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto px-4 pb-4">
      <SquadAuditTable state={state} />
    </div>
  );
}
