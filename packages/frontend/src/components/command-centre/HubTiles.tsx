import { GameState } from '@calculating-glory/domain';

interface HubTilesProps {
  state: GameState;
  onOpenSocialFeed: () => void;
  onOpenIsometric: () => void;
}

export interface HubTileProps {
  icon: string;
  label: string;
  sub: string;
  hasEvent: boolean;
  onClick: () => void;
}

export function HubTile({ icon, label, sub, hasEvent, onClick }: HubTileProps) {
  return (
    <button
      onClick={onClick}
      className={['tile-btn flex-1', hasEvent ? 'has-event' : ''].join(' ')}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-txt-primary">{label}</span>
      <span className="text-xs2 text-txt-muted text-center">{sub}</span>
      {hasEvent && (
        <span className="badge bg-data-blue/20 text-data-blue text-xs2">
          Action needed
        </span>
      )}
    </button>
  );
}

export function HubTiles({ state, onOpenSocialFeed, onOpenIsometric }: HubTilesProps) {
  const maxFacilityLevel = Math.max(...state.club.facilities.map(f => f.level));
  // Only badge when a brand-new facility (level 0) can be built for the first time.
  // Routine level-ups are expected and don't warrant an action signal.
  const canUnlockNew = state.club.facilities.some(
    f => f.level === 0 && !(f.constructionWeeksRemaining ?? 0) && f.upgradeCost <= state.club.transferBudget
  );
  const canUpgrade = state.club.facilities.some(
    f => f.level > 0 && f.level < 5 && !(f.constructionWeeksRemaining ?? 0) && f.upgradeCost <= state.club.transferBudget
  );

  return (
    <div className="flex gap-3">
      <HubTile
        icon="💬"
        label="Social Feed"
        sub="Chat with agents & board"
        hasEvent={false}
        onClick={onOpenSocialFeed}
      />
      <HubTile
        icon="🏟"
        label="Club Blueprint"
        sub={
          canUnlockNew ? 'New facility available'
            : canUpgrade ? 'Upgrade available'
            : `Facilities Lv${maxFacilityLevel}`
        }
        hasEvent={canUnlockNew}
        onClick={onOpenIsometric}
      />
    </div>
  );
}
