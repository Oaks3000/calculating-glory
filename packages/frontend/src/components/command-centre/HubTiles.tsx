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
  const unresolvedEvents = state.pendingEvents.filter(e => !e.resolved);
  const maxFacilityLevel = Math.max(...state.club.facilities.map(f => f.level));
  const canUpgrade = state.club.facilities.some(
    f => f.level < 5 && f.upgradeCost <= state.club.transferBudget
  );

  return (
    <div className="flex gap-3">
      <HubTile
        icon="💬"
        label="Social Feed"
        sub={
          unresolvedEvents.length > 0
            ? `${unresolvedEvents.length} event${unresolvedEvents.length > 1 ? 's' : ''} waiting`
            : 'Chat with agents & board'
        }
        hasEvent={unresolvedEvents.length > 0}
        onClick={onOpenSocialFeed}
      />
      <HubTile
        icon="🏟"
        label="Club Blueprint"
        sub={canUpgrade ? 'Upgrade available' : `Facilities Lv${maxFacilityLevel}`}
        hasEvent={canUpgrade}
        onClick={onOpenIsometric}
      />
    </div>
  );
}
