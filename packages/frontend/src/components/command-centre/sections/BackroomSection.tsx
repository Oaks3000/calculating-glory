import { GameState, GameCommand } from '@calculating-glory/domain';
import { BackroomTeamSlideOver } from '../BackroomTeamSlideOver';

interface BackroomSectionProps {
  state: GameState;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
}

export function BackroomSection({ state, dispatch, onError }: BackroomSectionProps) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <BackroomTeamSlideOver state={state} dispatch={dispatch} onError={onError} />
    </div>
  );
}
