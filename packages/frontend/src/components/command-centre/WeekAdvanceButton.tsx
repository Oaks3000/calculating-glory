import { PendingClubEvent, GameCommand } from '@calculating-glory/domain';

interface WeekAdvanceButtonProps {
  pendingEvents: PendingClubEvent[];
  currentWeek: number;
  season: number;
  isLoading: boolean;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
}

export function WeekAdvanceButton({
  pendingEvents,
  currentWeek,
  season,
  isLoading,
  dispatch,
  onError,
}: WeekAdvanceButtonProps) {
  const unresolved = pendingEvents.filter(e => !e.resolved);
  const isDisabled = isLoading || unresolved.length > 0 || currentWeek >= 46;

  const label =
    currentWeek >= 46
      ? 'Season Complete'
      : isLoading
      ? 'Simulating…'
      : unresolved.length > 0
      ? `Resolve ${unresolved.length} event${unresolved.length > 1 ? 's' : ''} first`
      : `Advance to Week ${currentWeek + 1}`;

  function handleClick() {
    const result = dispatch({
      type: 'SIMULATE_WEEK',
      week: currentWeek + 1,
      season,
      seed: `calculating-glory-mvp-v1-w${currentWeek + 1}`,
    });
    if (result.error) onError(result.error);
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={[
        'px-6 py-3 rounded-card font-semibold text-sm transition-all duration-200',
        'data-font tracking-wide',
        isDisabled
          ? 'bg-bg-raised text-txt-muted cursor-not-allowed'
          : 'bg-data-blue text-white hover:bg-data-blue/80 active:scale-95 shadow-lg shadow-data-blue/20',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
