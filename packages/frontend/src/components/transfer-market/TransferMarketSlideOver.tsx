import { useState } from 'react';
import {
  GameState,
  GameCommand,
  Player,
  Position,
  formatMoney,
  FORMATION_CONFIG,
} from '@calculating-glory/domain';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TransferMarketSlideOverProps {
  state: GameState;
  dispatch: (cmd: GameCommand) => { error?: string };
  onError: (msg: string) => void;
}

type Tab = 'free-agents' | 'my-squad';
type SortKey = 'rating' | 'attack' | 'defence' | 'wage';

// ─── Formation gap panel ───────────────────────────────────────────────────────

interface FormationGapPanelProps {
  state: GameState;
}

const POSITION_ORDER: Position[] = ['GK', 'DEF', 'MID', 'FWD'];

function FormationGapPanel({ state }: FormationGapPanelProps) {
  const formation = state.club.preferredFormation;
  if (!formation) return null;

  const config = FORMATION_CONFIG[formation];
  const squadByPosition = POSITION_ORDER.reduce<Record<Position, number>>((acc, pos) => {
    acc[pos] = state.club.squad.filter(p => p.position === pos).length;
    return acc;
  }, { GK: 0, DEF: 0, MID: 0, FWD: 0 });

  return (
    <div className="bg-bg-raised rounded-card border border-white/5 px-4 py-2.5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-txt-muted">Formation target</span>
        <span className="text-xs font-semibold text-txt-primary">{config.label}</span>
      </div>
      <div className="flex gap-3">
        {POSITION_ORDER.map(pos => {
          const target = config.slots[pos];
          const have = squadByPosition[pos];
          const gap = have - target;
          const isShort = gap < 0;
          const isSurplus = gap > 0;
          return (
            <div key={pos} className="flex flex-col items-center gap-0.5 flex-1">
              <span className="text-[10px] text-txt-muted">{pos}</span>
              <span className={`text-sm font-bold ${isShort ? 'text-alert-red' : isSurplus ? 'text-warn-amber' : 'text-pitch-green'}`}>
                {have}/{target}
              </span>
              <span className={`text-[10px] font-semibold ${isShort ? 'text-alert-red' : isSurplus ? 'text-warn-amber' : 'text-pitch-green'}`}>
                {isShort ? `−${Math.abs(gap)}` : isSurplus ? `+${gap}` : '✓'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Position badge colours ────────────────────────────────────────────────────

const POSITION_COLOUR: Record<Position, string> = {
  GK:  'bg-warn-amber/20 text-warn-amber border border-warn-amber/40',
  DEF: 'bg-data-blue/20 text-data-blue border border-data-blue/40',
  MID: 'bg-pitch-green/20 text-pitch-green border border-pitch-green/40',
  FWD: 'bg-alert-red/20 text-alert-red border border-alert-red/40',
};

// ─── Attribute bar ─────────────────────────────────────────────────────────────

interface AttrBarProps {
  label: string;
  value: number;
  colour: string;
}

function AttrBar({ label, value, colour }: AttrBarProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-txt-muted w-7 shrink-0">{label}</span>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden" style={{ width: 80 }}>
        <div
          className={`h-full rounded-full ${colour}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] text-txt-muted w-5 text-right">{value}</span>
    </div>
  );
}

// ─── Free Agent Card ───────────────────────────────────────────────────────────

interface FreeAgentCardProps {
  player: Player;
  canAfford: boolean;
  hasSquadRoom: boolean;
  onSign: (wage: number) => void;
}

function FreeAgentCard({ player, canAfford, hasSquadRoom, onSign }: FreeAgentCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [signed, setSigned] = useState(false);

  function handleConfirm() {
    onSign(player.wage);
    setSigned(true);
    setConfirming(false);
  }

  const canSign = canAfford && hasSquadRoom && !signed;

  return (
    <div className="bg-bg-raised rounded-card border border-white/5 p-3 flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-txt-primary text-sm truncate">{player.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${POSITION_COLOUR[player.position]}`}>
              {player.position}
            </span>
          </div>
          <span className="text-xs text-txt-muted">Age {player.age} · {formatMoney(player.wage)}/wk</span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-data-blue font-bold text-sm">{player.overallRating}</span>
          <div className="text-[10px] text-txt-muted">OVR</div>
        </div>
      </div>

      {/* Attribute bars */}
      <div className="flex flex-col gap-0.5">
        <AttrBar label="ATK" value={player.attributes.attack}   colour="bg-alert-red" />
        <AttrBar label="DEF" value={player.attributes.defence}  colour="bg-data-blue" />
        <AttrBar label="TMW" value={player.attributes.teamwork} colour="bg-pitch-green" />
        <AttrBar label="CHA" value={player.attributes.charisma} colour="bg-warn-amber" />
        <AttrBar label="POT" value={player.attributes.publicPotential} colour="bg-purple-400" />
      </div>

      {/* Action row */}
      {signed ? (
        <div className="text-xs text-pitch-green font-semibold">Signed!</div>
      ) : confirming ? (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-txt-muted">
            Sign {player.name} at {formatMoney(player.wage)}/wk?
          </span>
          <button
            onClick={handleConfirm}
            className="px-2 py-0.5 bg-pitch-green/20 text-pitch-green border border-pitch-green/40 rounded hover:bg-pitch-green/30 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-2 py-0.5 bg-white/5 text-txt-muted border border-white/10 rounded hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          disabled={!canSign}
          onClick={() => setConfirming(true)}
          className={`w-full text-xs py-1.5 rounded transition-colors ${
            canSign
              ? 'bg-pitch-green/20 text-pitch-green border border-pitch-green/40 hover:bg-pitch-green/30'
              : 'bg-white/5 text-txt-muted border border-white/10 cursor-not-allowed opacity-60'
          }`}
        >
          {!hasSquadRoom ? 'Squad full' : !canAfford ? 'Over budget' : 'Sign'}
        </button>
      )}
    </div>
  );
}

// ─── Squad Player Card ─────────────────────────────────────────────────────────

interface SquadPlayerCardProps {
  player: Player;
  currentWeek: number;
  onRelease: () => void;
}

function SquadPlayerCard({ player, currentWeek, onRelease }: SquadPlayerCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [released, setReleased] = useState(false);

  const isFreeAgent = player.contractExpiresWeek === 0;
  const isExpired = !isFreeAgent && currentWeek >= player.contractExpiresWeek;
  const releaseFee = (!isFreeAgent && !isExpired && player.contractExpiresWeek > currentWeek)
    ? Math.round((player.contractExpiresWeek - currentWeek) * player.wage * 0.5)
    : 0;

  function contractBadge() {
    if (isFreeAgent) {
      return <span className="text-[10px] bg-pitch-green/20 text-pitch-green border border-pitch-green/40 px-1.5 py-0.5 rounded">Free agent</span>;
    }
    if (isExpired) {
      return <span className="text-[10px] bg-pitch-green/20 text-pitch-green border border-pitch-green/40 px-1.5 py-0.5 rounded">Out of contract</span>;
    }
    const weeksLeft = player.contractExpiresWeek - currentWeek;
    return <span className="text-[10px] text-txt-muted">Wk {player.contractExpiresWeek} ({weeksLeft}wk left)</span>;
  }

  function releaseLabel() {
    if (releaseFee > 0) return `Release (${formatMoney(releaseFee)} fee)`;
    return 'Release (free)';
  }

  function handleConfirm() {
    onRelease();
    setReleased(true);
    setConfirming(false);
  }

  return (
    <div className="bg-bg-raised rounded-card border border-white/5 p-3 flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-txt-primary text-sm truncate">{player.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${POSITION_COLOUR[player.position]}`}>
              {player.position}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-txt-muted">Age {player.age} · {formatMoney(player.wage)}/wk</span>
            {contractBadge()}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-data-blue font-bold text-sm">{player.overallRating}</span>
          <div className="text-[10px] text-txt-muted">OVR</div>
        </div>
      </div>

      {/* Attribute bars */}
      <div className="flex flex-col gap-0.5">
        <AttrBar label="ATK" value={player.attributes.attack}   colour="bg-alert-red" />
        <AttrBar label="DEF" value={player.attributes.defence}  colour="bg-data-blue" />
        <AttrBar label="TMW" value={player.attributes.teamwork} colour="bg-pitch-green" />
        <AttrBar label="CHA" value={player.attributes.charisma} colour="bg-warn-amber" />
        <AttrBar label="POT" value={player.attributes.publicPotential} colour="bg-purple-400" />
      </div>

      {/* Release action */}
      {released ? (
        <div className="text-xs text-warn-amber font-semibold">Released</div>
      ) : confirming ? (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-txt-muted">
            Release {player.name}{releaseFee > 0 ? ` (${formatMoney(releaseFee)} compensation)` : ' for free'}?
          </span>
          <button
            onClick={handleConfirm}
            className="px-2 py-0.5 bg-alert-red/20 text-alert-red border border-alert-red/40 rounded hover:bg-alert-red/30 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-2 py-0.5 bg-white/5 text-txt-muted border border-white/10 rounded hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="w-full text-xs py-1.5 rounded bg-alert-red/10 text-alert-red border border-alert-red/30 hover:bg-alert-red/20 transition-colors"
        >
          {releaseLabel()}
        </button>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TransferMarketSlideOver({ state, dispatch, onError }: TransferMarketSlideOverProps) {
  const [activeTab, setActiveTab] = useState<Tab>('free-agents');
  const [positionFilter, setPositionFilter] = useState<Position | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('rating');

  const currentTotalWages = state.club.squad.reduce((sum, p) => sum + p.wage, 0);
  const remainingWageBudget = state.club.wageBudget - currentTotalWages;
  const squadCount = state.club.squad.length;
  const squadCapacity = state.club.squadCapacity;

  // ── Filter + sort free agents ──────────────────────────────────────────────

  function filterPlayers<T extends Player>(players: T[]): T[] {
    return players
      .filter(p => positionFilter === 'ALL' || p.position === positionFilter)
      .sort((a, b) => {
        switch (sortKey) {
          case 'rating':  return b.overallRating - a.overallRating;
          case 'attack':  return b.attributes.attack - a.attributes.attack;
          case 'defence': return b.attributes.defence - a.attributes.defence;
          case 'wage':    return b.wage - a.wage;
          default: return 0;
        }
      });
  }

  const filteredFreeAgents = filterPlayers(state.freeAgentPool ?? []);
  const filteredSquad = filterPlayers(state.club.squad);

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSign(playerId: string, wage: number) {
    const result = dispatch({ type: 'SIGN_FREE_AGENT', playerId, offeredWage: wage });
    if (result.error) onError(result.error);
  }

  function handleRelease(playerId: string) {
    const result = dispatch({ type: 'RELEASE_PLAYER', playerId });
    if (result.error) onError(result.error);
  }

  const POSITIONS: (Position | 'ALL')[] = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];
  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'rating',  label: 'Rating ↓' },
    { value: 'attack',  label: 'Attack ↓' },
    { value: 'defence', label: 'Defence ↓' },
    { value: 'wage',    label: 'Wage ↓' },
  ];

  return (
    <div className="flex flex-col h-full gap-3">

      {/* ── Budget / squad bar ─────────────────────────────────────────────── */}
      <div className="bg-bg-raised rounded-card border border-white/5 px-4 py-2 flex items-center gap-4 text-sm flex-wrap">
        <span className="text-txt-muted">
          Wage budget: <span className="text-pitch-green font-semibold">{formatMoney(remainingWageBudget)}</span> remaining
        </span>
        <span className="text-white/20">|</span>
        <span className="text-txt-muted">
          Squad: <span className={squadCount >= squadCapacity ? 'text-alert-red font-semibold' : 'text-data-blue font-semibold'}>
            {squadCount}/{squadCapacity}
          </span>
        </span>
      </div>

      {/* ── Formation gap panel ───────────────────────────────────────────── */}
      <FormationGapPanel state={state} />

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1">
        {(['free-agents', 'my-squad'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-sm rounded-card transition-colors ${
              activeTab === tab
                ? 'bg-data-blue/20 text-data-blue border border-data-blue/40'
                : 'text-txt-muted hover:text-txt-primary border border-white/5 hover:border-white/10'
            }`}
          >
            {tab === 'free-agents' ? `Free Agents (${(state.freeAgentPool ?? []).length})` : `My Squad (${squadCount})`}
          </button>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Position filters */}
        <div className="flex gap-1">
          {POSITIONS.map(pos => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                positionFilter === pos
                  ? 'bg-data-blue/20 text-data-blue border border-data-blue/40'
                  : 'text-txt-muted border border-white/5 hover:border-white/10'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="ml-auto bg-bg-raised text-txt-muted text-xs border border-white/10 rounded px-2 py-0.5 focus:outline-none"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* ── Player list ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {activeTab === 'free-agents' ? (
          filteredFreeAgents.length === 0 ? (
            <div className="text-txt-muted text-sm text-center py-8">No free agents match your filters.</div>
          ) : (
            filteredFreeAgents.map(player => (
              <FreeAgentCard
                key={player.id}
                player={player}
                canAfford={player.wage <= remainingWageBudget}
                hasSquadRoom={squadCount < squadCapacity}
                onSign={wage => handleSign(player.id, wage)}
              />
            ))
          )
        ) : (
          filteredSquad.length === 0 ? (
            <div className="text-txt-muted text-sm text-center py-8">No players match your filters.</div>
          ) : (
            filteredSquad.map(player => (
              <SquadPlayerCard
                key={player.id}
                player={player}
                currentWeek={state.currentWeek}
                onRelease={() => handleRelease(player.id)}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}
