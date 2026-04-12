import { GameState, GameCommand } from '@calculating-glory/domain';
import { TransferMarketSlideOver } from '../../transfer-market/TransferMarketSlideOver';

interface TransferSectionProps {
  state: GameState;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
}

export function TransferSection({ state, dispatch, onError }: TransferSectionProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TransferMarketSlideOver state={state} dispatch={dispatch} onError={onError} />
    </div>
  );
}
