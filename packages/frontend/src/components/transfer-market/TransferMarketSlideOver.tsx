import { useState } from 'react';
import {
  GameState,
  GameCommand,
  Player,
  Position,
  Formation,
  formatMoney,
  FORMATION_CONFIG,
  LEAGUE_TWO_TEAMS,
  getScoutedPotential,
  scoutNoiseRange,
  getScoutLevel,
  computeOverallRating,
  isTransferWindowOpen,
  selectManagerXI,
} from '@calculating-glory/domain';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TransferMarketSlideOverProps {
  state: GameState;
  dispatch: (cmd: GameCommand) => { error?: string };
  onError: (msg: string) => void;
}

type Tab = 'free-agents' | 'my-squad';
type SortKey = 'rating' | 'attack' | 'defence' | 'wage';
type PlayerWillingness = 'eager' | 'neutral' | 'reluctant';
/** formation = manage mode (list + sell/release); list = flat list; lineup = manager's selected XI */
type SquadViewMode = 'formation' | 'list' | 'lineup';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Deterministic NPC interest count (0–3) based on player id. */
function getNpcInterestCount(playerId: string): number {
  let h = 0;
  for (let i = 0; i < playerId.length; i++) {
    h = (Math.imul(31, h) + playerId.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 4;
}

/**
 * Whether a reluctant player rejects a "hold firm" approach.
 * 0 NPC clubs → never rejects (reluctance was wage-only).
 * 1 NPC club  → 50/50 (deterministic from id).
 * 2+ NPC clubs → always rejects (they had better options).
 */
function willRejectHoldFirm(playerId: string, npcInterest: number): boolean {
  if (npcInterest === 0) return false;
  if (npcInterest >= 2) return true;
  // 1 rival club: coin-flip seeded on player id
  let h = 0;
  for (let i = 0; i < playerId.length; i++) {
    h = (Math.imul(17, h) + playerId.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 2) === 0;
}

/**
 * How keen a free agent is to join, based on your league position and the wage
 * you're offering relative to their asking wage.
 */
function computeWillingness(
  player: Player,
  offeredWage: number,
  tablePosition: number,
): PlayerWillingness {
  const wageRatio = offeredWage / Math.max(1, player.wage);
  if (tablePosition <= 6 && wageRatio >= 1.0) return 'eager';
  if (tablePosition >= 18 || wageRatio < 0.9) return 'reluctant';
  return 'neutral';
}

const WILLINGNESS_CONFIG: Record<PlayerWillingness, { label: string; colour: string; icon: string }> = {
  eager:    { label: 'Keen to join',  colour: 'text-pitch-green',  icon: '★' },
  neutral:  { label: 'Considering',   colour: 'text-warn-amber',   icon: '~' },
  reluctant:{ label: 'Hesitant',      colour: 'text-alert-red',    icon: '?' },
};

/** Reason a reluctant player is hesitant — shown in the counter-offer card. */
function getReluctanceReason(
  player: Player,
  tablePosition: number,
  npcInterest: number,
): string {
  if (npcInterest >= 2) return `${npcInterest} clubs are after them. They know their value.`;
  if (npcInterest === 1) return 'Another club is watching. They\'re not feeling any urgency.';
  if (tablePosition >= 18) return 'They\'re not convinced by the league position. Hard to blame them.';
  const wageRatio = player.wage / Math.max(1, player.wage);
  if (wageRatio < 0.9) return 'The offer is below what they had in mind.';
  return 'They want to think it over. Not an easy sell.';
}

/** Seeded signing celebration line from Val or Marcus. */
const SIGNING_LINES: { name: string; colour: string; line: string }[] = [
  { name: 'Marcus Webb',  colour: 'text-pitch-green', line: 'Smart business. Good player at a fair price.' },
  { name: 'Val Webb',     colour: 'text-data-blue',   line: 'Good signing. That\'ll strengthen the side nicely.' },
  { name: 'Marcus Webb',  colour: 'text-pitch-green', line: 'That\'s a solid addition. The squad needed it.' },
  { name: 'Val Webb',     colour: 'text-data-blue',   line: 'Pleased with that one. He\'ll fit in well.' },
  { name: 'Marcus Webb',  colour: 'text-pitch-green', line: 'The numbers work. Good call.' },
  { name: 'Val Webb',     colour: 'text-data-blue',   line: 'Exactly what we needed. Well done.' },
  { name: 'Marcus Webb',  colour: 'text-pitch-green', line: 'Happy with that. Adds real depth.' },
  { name: 'Val Webb',     colour: 'text-data-blue',   line: 'That\'s the right player at the right time.' },
];

function getSigningLine(playerId: string): { name: string; colour: string; line: string } {
  let h = 0;
  for (let i = 0; i < playerId.length; i++) {
    h = (Math.imul(13, h) + playerId.charCodeAt(i)) | 0;
  }
  return SIGNING_LINES[Math.abs(h) % SIGNING_LINES.length];
}

/**
 * Pick a rival club name deterministically from a list of club names.
 * Used to name the club that "beat you" to a signing.
 */
function getRivalClubName(playerId: string, clubNames: string[]): string {
  if (clubNames.length === 0) return 'a rival club';
  let h = 0;
  for (let i = 0; i < playerId.length; i++) {
    h = (Math.imul(23, h) + playerId.charCodeAt(i)) | 0;
  }
  return clubNames[Math.abs(h) % clubNames.length];
}

// ─── Formation gap panel ───────────────────────────────────────────────────────

// ─── Pitch Grid ────────────────────────────────────────────────────────────────
// Replaces SquadFormationView. Renders players in spatial formation rows
// (FWD at top → GK at bottom), with circle slots, vacant gaps, and a depth rail.

const PITCH_ROW_ORDER: Position[] = ['FWD', 'MID', 'DEF', 'GK'];

function ovrBorderClass(ovr: number): string {
  if (ovr >= 70) return 'border-pitch-green/50';
  if (ovr >= 55) return 'border-warn-amber/50';
  return 'border-alert-red/40';
}

function ovrTextClass(ovr: number): string {
  if (ovr >= 70) return 'text-pitch-green';
  if (ovr >= 55) return 'text-warn-amber';
  return 'text-alert-red';
}

interface PitchGridProps {
  squad: Player[];
  formation: Formation;
  currentWeek: number;
  clubId: string;
  scoutLevel: number;
  listedPlayerIds: string[];
  isWindowOpen: boolean;
  /** 'manage': players expand to full card with list/release actions */
  mode: 'manage' | 'lineup';
  /** Players the manager has selected for the XI (lineup mode only) */
  managerXI?: Player[];
  onFillPosition: (pos: Position) => void;
  onRelease: (playerId: string) => void;
  onList: (playerId: string) => void;
  onUnlist: (playerId: string) => void;
}

function PitchGrid({
  squad, formation, currentWeek, clubId, scoutLevel, listedPlayerIds, isWindowOpen,
  mode, managerXI, onFillPosition, onRelease, onList, onUnlist,
}: PitchGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const config = FORMATION_CONFIG[formation];
  if (!config) return null;

  // In lineup mode, use the manager's XI to determine which players fill slots
  const xiSet = new Set((managerXI ?? []).map(p => p.id));
  const xi = mode === 'lineup' ? (managerXI ?? []) : squad;

  // Surplus = players in squad not placed in any formation slot
  const formationPlayers = PITCH_ROW_ORDER.flatMap(pos => {
    const inPos = (mode === 'lineup' ? xi : squad)
      .filter(p => p.position === pos)
      .sort((a, b) => computeOverallRating(b) - computeOverallRating(a));
    return inPos.slice(0, config.slots[pos]);
  });
  const formationPlayerIds = new Set(formationPlayers.map(p => p.id));
  const depth = squad.filter(p => !formationPlayerIds.has(p.id));

  return (
    <div className="flex flex-col gap-3">
      {/* ── Pitch ── */}
      <div className="bg-pitch-green/5 rounded-xl border border-white/5 p-3 flex flex-col gap-3">
        {PITCH_ROW_ORDER.map(pos => {
          const target = config.slots[pos];
          const available = (mode === 'lineup' ? xi : squad)
            .filter(p => p.position === pos)
            .sort((a, b) => computeOverallRating(b) - computeOverallRating(a));
          const placed = available.slice(0, target);
          const vacantCount = Math.max(0, target - placed.length);
          const have = squad.filter(p => p.position === pos).length;
          const gap = have - target;
          const isShort = gap < 0;
          const isSurplus = gap > 0;

          return (
            <div key={pos} className="flex flex-col gap-1.5">
              {/* Row label + gap indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-bg-raised text-txt-muted border-white/10 w-8 text-center">{pos}</span>
                <span className={`text-[10px] font-semibold ${isShort ? 'text-alert-red' : isSurplus ? 'text-warn-amber' : 'text-pitch-green'}`}>
                  {isShort ? `−${Math.abs(gap)} needed` : isSurplus ? `+${gap} surplus` : '✓'}
                </span>
              </div>

              {/* Slot row */}
              <div className="flex flex-wrap gap-2 justify-start">
                {placed.map(player => {
                  const ovr = computeOverallRating(player);
                  const isExpanded = expandedId === player.id;
                  const isListed = listedPlayerIds.includes(player.id);
                  const isInXI = mode === 'lineup' ? xiSet.has(player.id) : true;

                  return (
                    <div key={player.id} className="flex flex-col gap-1">
                      {/* Circle chip */}
                      <button
                        onClick={() => mode === 'manage' ? setExpandedId(isExpanded ? null : player.id) : undefined}
                        className={`relative w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center transition-colors ${ovrBorderClass(ovr)} ${
                          mode === 'manage' ? 'hover:bg-white/5 cursor-pointer' : 'cursor-default'
                        } ${isExpanded ? 'bg-white/5' : 'bg-bg-raised'} ${
                          mode === 'lineup' && !isInXI ? 'opacity-50' : ''
                        }`}
                      >
                        <span className={`text-sm font-bold leading-none ${ovrTextClass(ovr)}`}>{ovr}</span>
                        <span className="text-[8px] text-txt-muted leading-tight w-14 truncate text-center px-1">
                          {player.name.split(' ').pop()}
                        </span>
                        {isListed && (
                          <span className="absolute -top-1 -right-1 text-[9px] bg-warn-amber/20 text-warn-amber border border-warn-amber/40 rounded-full w-4 h-4 flex items-center justify-center leading-none">
                            £
                          </span>
                        )}
                      </button>

                      {/* Expanded card */}
                      {isExpanded && mode === 'manage' && (
                        <div className="w-48">
                          <SquadPlayerCard
                            player={player}
                            currentWeek={currentWeek}
                            clubId={clubId}
                            scoutLevel={scoutLevel}
                            isListed={isListed}
                            isWindowOpen={isWindowOpen}
                            onRelease={() => { onRelease(player.id); setExpandedId(null); }}
                            onList={() => { onList(player.id); setExpandedId(null); }}
                            onUnlist={() => { onUnlist(player.id); setExpandedId(null); }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Vacant slots */}
                {Array.from({ length: vacantCount }).map((_, i) => (
                  <button
                    key={`vacant-${pos}-${i}`}
                    onClick={() => onFillPosition(pos)}
                    className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex flex-col items-center justify-center hover:border-white/40 transition-colors bg-bg-raised"
                  >
                    <span className="text-[10px] text-txt-muted font-semibold">+</span>
                    <span className="text-[8px] text-data-blue">{pos}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Depth rail ── */}
      {depth.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] text-txt-muted font-semibold uppercase tracking-wide">
            {mode === 'lineup' ? 'Bench' : 'Squad Depth'}
          </span>
          <div className="flex flex-wrap gap-2">
            {depth.map(player => {
              const ovr = computeOverallRating(player);
              const isListed = listedPlayerIds.includes(player.id);
              const isExpanded = expandedId === player.id;
              return (
                <div key={player.id} className="flex flex-col gap-1">
                  <button
                    onClick={() => mode === 'manage' ? setExpandedId(isExpanded ? null : player.id) : undefined}
                    className={`relative w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center opacity-60 transition-colors ${ovrBorderClass(ovr)} ${
                      mode === 'manage' ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'
                    } bg-bg-raised`}
                  >
                    <span className={`text-xs font-bold leading-none ${ovrTextClass(ovr)}`}>{ovr}</span>
                    <span className="text-[8px] text-txt-muted leading-tight w-12 truncate text-center px-1">
                      {player.name.split(' ').pop()}
                    </span>
                    {isListed && (
                      <span className="absolute -top-1 -right-1 text-[9px] bg-warn-amber/20 text-warn-amber border border-warn-amber/40 rounded-full w-4 h-4 flex items-center justify-center leading-none">
                        £
                      </span>
                    )}
                  </button>
                  {isExpanded && mode === 'manage' && (
                    <div className="w-48">
                      <SquadPlayerCard
                        player={player}
                        currentWeek={currentWeek}
                        clubId={clubId}
                        scoutLevel={scoutLevel}
                        isListed={isListed}
                        isWindowOpen={isWindowOpen}
                        onRelease={() => { onRelease(player.id); setExpandedId(null); }}
                        onList={() => { onList(player.id); setExpandedId(null); }}
                        onUnlist={() => { onUnlist(player.id); setExpandedId(null); }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
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

// ─── Scouted Potential Bar ──────────────────────────────────────────────────────

function PotBar({ player, scoutLevel }: { player: Player; scoutLevel: number }) {
  const noise = scoutNoiseRange(scoutLevel);
  const value = getScoutedPotential(player, scoutLevel);

  // Label prefix signals confidence: ~ = rough, ≈ = close, no prefix = exact
  const prefix = noise >= 9 ? '~' : noise >= 3 ? '≈' : '';
  const label  = `${prefix}POT`;
  const colour = noise === 0 ? 'text-purple-400' : noise <= 6 ? 'text-purple-400/70' : 'text-purple-400/40';

  return (
    <div className="flex items-center gap-1">
      <span className={`text-[10px] w-7 shrink-0 ${colour}`}>{label}</span>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden" style={{ width: 80 }}>
        <div
          className={`h-full rounded-full bg-purple-400 ${noise > 0 ? 'opacity-50' : 'opacity-100'}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`text-[10px] w-5 text-right ${colour}`}>{value}</span>
    </div>
  );
}

// ─── Free Agent Card ───────────────────────────────────────────────────────────

interface FreeAgentCardProps {
  player:         Player;
  canAfford:      boolean;
  hasSquadRoom:   boolean;
  scoutLevel:     number;
  willingness:    PlayerWillingness;
  npcInterest:    number;
  tablePosition:  number;
  rivalClubNames: string[];
  onSign: (wage: number) => void;
}

type SignStep = 'idle' | 'countering' | 'confirming' | 'done' | 'rejected';

const NPC_INTEREST_LABELS: Record<number, string> = {
  1: '1 other club watching',
  2: '2 clubs interested',
  3: '3 clubs chasing him',
};

function FreeAgentCard({
  player,
  canAfford,
  hasSquadRoom,
  scoutLevel,
  willingness,
  npcInterest,
  tablePosition,
  rivalClubNames,
  onSign,
}: FreeAgentCardProps) {
  const [step, setStep] = useState<SignStep>('idle');

  const wCfg = WILLINGNESS_CONFIG[willingness];

  // Reluctant players counter-offer at +15% wage
  const counterWage = Math.round(player.wage * 1.15);
  const counterLabel = formatMoney(counterWage);

  const canSign = canAfford && hasSquadRoom;

  function handleSignClick() {
    if (willingness === 'reluctant') {
      setStep('countering');
    } else {
      setStep('confirming');
    }
  }

  function handleAcceptCounter() {
    onSign(counterWage);
    setStep('done');
  }

  function handleAcceptOriginal() {
    onSign(player.wage);
    setStep('done');
  }

  function handleHoldFirm() {
    if (willRejectHoldFirm(player.id, npcInterest)) {
      setStep('rejected');
    } else {
      onSign(player.wage);
      setStep('done');
    }
  }

  function handleCancel() {
    setStep('idle');
  }

  return (
    <div className={`bg-bg-raised rounded-card border p-3 flex flex-col gap-2 ${
      npcInterest >= 2 ? 'border-warn-amber/30' : 'border-white/5'
    }`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-txt-primary text-sm truncate">{player.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${POSITION_COLOUR[player.position]}`}>
              {player.position}
            </span>
            {/* Willingness badge */}
            <span className={`text-[10px] font-semibold ${wCfg.colour}`}>
              {wCfg.icon} {wCfg.label}
            </span>
          </div>
          <span className="text-xs text-txt-muted">Age {player.age} · {formatMoney(player.wage)}/wk</span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-data-blue font-bold text-sm">{computeOverallRating(player)}</span>
          <div className="text-[10px] text-txt-muted">OVR</div>
        </div>
      </div>

      {/* NPC interest rumour */}
      {npcInterest > 0 && (
        <div className="text-[10px] text-warn-amber bg-warn-amber/5 border border-warn-amber/20 rounded px-2 py-1">
          📰 RUMOUR · {NPC_INTEREST_LABELS[npcInterest] ?? `${npcInterest} clubs interested`}
        </div>
      )}

      {/* Attribute bars */}
      <div className="flex flex-col gap-0.5">
        <AttrBar label="ATK" value={player.attributes.attack}   colour="bg-alert-red" />
        <AttrBar label="DEF" value={player.attributes.defence}  colour="bg-data-blue" />
        <AttrBar label="TMW" value={player.attributes.teamwork} colour="bg-pitch-green" />
        <AttrBar label="CHA" value={player.attributes.charisma} colour="bg-warn-amber" />
        <PotBar player={player} scoutLevel={scoutLevel} />
      </div>

      {/* Action row */}
      {step === 'done' ? (
        /* ── Signing celebration ─────────────────────────────────────────── */
        (() => {
          const signingLine = getSigningLine(player.id);
          return (
            <div className="flex flex-col gap-1.5 bg-pitch-green/5 border border-pitch-green/30 rounded px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-pitch-green font-bold text-xs uppercase tracking-wide">DEAL DONE ✓</span>
                {npcInterest > 0 && (
                  <span className="text-[10px] text-txt-muted">You beat {npcInterest === 1 ? '1 club' : `${npcInterest} clubs`} to it.</span>
                )}
              </div>
              <p className="text-[10px] text-txt-muted italic">
                <span className={`font-semibold not-italic ${signingLine.colour}`}>{signingLine.name}:</span>{' '}
                "{signingLine.line}"
              </p>
            </div>
          );
        })()
      ) : step === 'rejected' ? (
        /* ── Outbid — name the rival club ───────────────────────────────── */
        (() => {
          const rival = getRivalClubName(player.id, rivalClubNames);
          return (
            <div className="text-xs text-alert-red bg-alert-red/5 border border-alert-red/20 rounded px-2 py-1.5">
              <span className="font-semibold">Gone.</span>{' '}
              {npcInterest >= 2
                ? `${rival} moved faster. ${player.name} had too many options.`
                : `${rival} made their move. ${player.name} signed elsewhere.`}
            </div>
          );
        })()
      ) : step === 'countering' ? (
        /* ── Reluctant counter-offer with reason ────────────────────────── */
        <div className="flex flex-col gap-2 text-xs">
          <div className="bg-alert-red/5 border border-alert-red/20 rounded px-2 py-1.5 text-txt-muted">
            <span className="text-alert-red font-semibold">Counter-offer!</span>{' '}
            {getReluctanceReason(player, tablePosition, npcInterest)}{' '}
            They want {counterLabel}/wk to commit.
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAcceptCounter}
              className="px-2 py-1 bg-warn-amber/20 text-warn-amber border border-warn-amber/40 rounded hover:bg-warn-amber/30 transition-colors"
            >
              Accept {counterLabel}/wk
            </button>
            <button
              onClick={handleHoldFirm}
              className="px-2 py-1 bg-pitch-green/10 text-pitch-green border border-pitch-green/30 rounded hover:bg-pitch-green/20 transition-colors"
            >
              Hold firm at {formatMoney(player.wage)}/wk
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-0.5 bg-white/5 text-txt-muted border border-white/10 rounded hover:bg-white/10 transition-colors"
            >
              Walk away
            </button>
          </div>
          <div className="text-txt-muted text-[10px]">
            Holding firm risks them choosing another club — but saves on wages.
          </div>
        </div>
      ) : step === 'confirming' ? (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-txt-muted">
            Sign {player.name} at {formatMoney(player.wage)}/wk?
            {npcInterest > 0 && (
              <span className="text-warn-amber"> Move fast — others are watching.</span>
            )}
          </span>
          <button
            onClick={handleAcceptOriginal}
            className="px-2 py-0.5 bg-pitch-green/20 text-pitch-green border border-pitch-green/40 rounded hover:bg-pitch-green/30 transition-colors"
          >
            Yes
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-0.5 bg-white/5 text-txt-muted border border-white/10 rounded hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          disabled={!canSign}
          onClick={handleSignClick}
          className={`w-full text-xs py-1.5 rounded transition-colors ${
            canSign
              ? npcInterest >= 2
                ? 'bg-warn-amber/20 text-warn-amber border border-warn-amber/40 hover:bg-warn-amber/30'
                : 'bg-pitch-green/20 text-pitch-green border border-pitch-green/40 hover:bg-pitch-green/30'
              : 'bg-white/5 text-txt-muted border border-white/10 cursor-not-allowed opacity-60'
          }`}
        >
          {!hasSquadRoom
            ? 'Squad full'
            : !canAfford
            ? 'Over budget'
            : npcInterest >= 2
            ? 'Sign before it\'s too late'
            : 'Sign'}
        </button>
      )}
    </div>
  );
}

// ─── Squad Player Card ─────────────────────────────────────────────────────────

interface SquadPlayerCardProps {
  player: Player;
  currentWeek: number;
  clubId: string;
  scoutLevel: number;
  isListed: boolean;
  /** Whether the transfer window is currently open — gates listing. */
  isWindowOpen: boolean;
  onRelease: () => void;
  onList: () => void;
  onUnlist: () => void;
}

type SquadAction = 'idle' | 'confirm-release';

/** Players with OVR >= 65 and morale >= 70 are considered fan favourites. */
function isFanFavourite(player: Player): boolean {
  return computeOverallRating(player) >= 65 && (player.morale ?? 0) >= 70;
}

function SquadPlayerCard({
  player, currentWeek, scoutLevel, isListed, isWindowOpen, onRelease, onList, onUnlist,
}: SquadPlayerCardProps) {
  const [action, setAction] = useState<SquadAction>('idle');
  const [done, setDone] = useState<'released' | 'listed' | 'unlisted' | null>(null);

  const isFreeAgent = player.contractExpiresWeek === 0;
  const isExpired = !isFreeAgent && currentWeek >= player.contractExpiresWeek;
  const releaseFee = (!isFreeAgent && !isExpired && player.contractExpiresWeek > currentWeek)
    ? Math.round((player.contractExpiresWeek - currentWeek) * player.wage * 0.5)
    : 0;

  const fanFav = isFanFavourite(player);

  function contractBadge() {
    if (isFreeAgent) return <span className="text-[10px] bg-pitch-green/20 text-pitch-green border border-pitch-green/40 px-1.5 py-0.5 rounded">Free agent</span>;
    if (isExpired) return <span className="text-[10px] bg-pitch-green/20 text-pitch-green border border-pitch-green/40 px-1.5 py-0.5 rounded">Out of contract</span>;
    const weeksLeft = player.contractExpiresWeek - currentWeek;
    return <span className="text-[10px] text-txt-muted" title={`Contract expires week ${player.contractExpiresWeek}`}>Contract: {weeksLeft}w left</span>;
  }

  return (
    <div className={`bg-bg-raised rounded-card border p-3 flex flex-col gap-2 ${fanFav ? 'border-purple-500/30' : 'border-white/5'}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-txt-primary text-sm truncate">{player.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${POSITION_COLOUR[player.position]}`}>{player.position}</span>
            {fanFav && <span className="text-[10px] text-purple-400 font-semibold">♥ Fan favourite</span>}
            {isListed && <span className="text-[10px] text-warn-amber font-semibold bg-warn-amber/10 border border-warn-amber/30 px-1.5 py-0.5 rounded">£ Listed</span>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-txt-muted">Age {player.age} · {formatMoney(player.wage)}/wk</span>
            {contractBadge()}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-data-blue font-bold text-sm">{computeOverallRating(player)}</span>
          <div className="text-[10px] text-txt-muted">OVR</div>
        </div>
      </div>

      {/* Attribute bars */}
      <div className="flex flex-col gap-0.5">
        <AttrBar label="ATK" value={player.attributes.attack}   colour="bg-alert-red" />
        <AttrBar label="DEF" value={player.attributes.defence}  colour="bg-data-blue" />
        <AttrBar label="TMW" value={player.attributes.teamwork} colour="bg-pitch-green" />
        <AttrBar label="CHA" value={player.attributes.charisma} colour="bg-warn-amber" />
        <PotBar player={player} scoutLevel={scoutLevel} />
      </div>

      {/* Actions */}
      {done === 'released' ? (
        <div className="text-xs text-warn-amber font-semibold">Released{fanFav ? ' — the fans won\'t forget.' : ''}</div>
      ) : done === 'listed' ? (
        <div className="text-xs text-warn-amber font-semibold">{player.name} is on the transfer list. Bids will arrive when the window opens.</div>
      ) : done === 'unlisted' ? (
        <div className="text-xs text-txt-muted">Listing withdrawn. {player.name} is no longer for sale.</div>
      ) : action === 'confirm-release' ? (
        <div className="flex flex-col gap-1.5 text-xs">
          {fanFav && (
            <div className="text-[10px] text-purple-400 bg-purple-500/5 border border-purple-500/20 rounded px-2 py-1">
              ♥ {player.name} is a fan favourite — releasing them will hurt morale.
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-txt-muted">
              Release {player.name}{releaseFee > 0 ? ` (${formatMoney(releaseFee)} fee)` : ' for free'}?
            </span>
            <button onClick={() => { onRelease(); setDone('released'); setAction('idle'); }} className="px-2 py-0.5 bg-alert-red/20 text-alert-red border border-alert-red/40 rounded hover:bg-alert-red/30 transition-colors">Yes</button>
            <button onClick={() => setAction('idle')} className="px-2 py-0.5 bg-white/5 text-txt-muted border border-white/10 rounded hover:bg-white/10 transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {/* Transfer listing row */}
          {isListed ? (
            <button
              onClick={() => { onUnlist(); setDone('unlisted'); }}
              className="w-full text-xs py-1.5 rounded bg-warn-amber/10 text-warn-amber border border-warn-amber/30 hover:bg-warn-amber/20 transition-colors"
            >
              Withdraw listing
            </button>
          ) : (
            <button
              onClick={isWindowOpen ? () => { onList(); setDone('listed'); } : undefined}
              disabled={!isWindowOpen}
              title={isWindowOpen ? undefined : 'Transfer window is closed'}
              className={`w-full text-xs py-1.5 rounded border transition-colors ${
                isWindowOpen
                  ? 'bg-pitch-green/10 text-pitch-green border-pitch-green/30 hover:bg-pitch-green/20'
                  : 'bg-white/5 text-txt-muted border-white/10 opacity-50 cursor-not-allowed'
              }`}
            >
              {isWindowOpen ? 'List for sale' : 'List for sale (window closed)'}
            </button>
          )}
          {/* Release row */}
          <button
            onClick={() => setAction('confirm-release')}
            className="w-full text-xs py-1.5 rounded bg-alert-red/10 text-alert-red border border-alert-red/30 hover:bg-alert-red/20 transition-colors"
          >
            {releaseFee > 0 ? `Release (${formatMoney(releaseFee)} fee)` : 'Release (free)'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Deadline day banner ───────────────────────────────────────────────────────

function DeadlineDayBanner({ week, phase }: { week: number; phase: string }) {
  if (!isTransferWindowOpen(week, phase)) return null;

  // Last week of summer window (week 4) or January window (week 24)
  const isDeadlineDay = week === 4 || week === 24;
  // Second-to-last week — approaching deadline
  const isUrgent = week === 3 || week === 23;

  if (isDeadlineDay) {
    return (
      <div className="bg-alert-red/10 border border-alert-red/50 rounded-card px-4 py-2.5 flex items-center gap-3">
        <span className="text-alert-red font-bold text-sm uppercase tracking-wide animate-pulse">
          DEADLINE DAY
        </span>
        <span className="text-xs text-txt-muted flex-1">
          Transfer window closes at the end of this week — all signings must be finalised now.
        </span>
      </div>
    );
  }

  if (isUrgent) {
    return (
      <div className="bg-warn-amber/10 border border-warn-amber/40 rounded-card px-4 py-2 flex items-center gap-3">
        <span className="text-warn-amber font-bold text-xs uppercase tracking-wide">
          WINDOW CLOSING
        </span>
        <span className="text-xs text-txt-muted flex-1">
          Transfer window shuts in 2 weeks — don't leave your business too late.
        </span>
      </div>
    );
  }

  return null;
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TransferMarketSlideOver({ state, dispatch, onError }: TransferMarketSlideOverProps) {
  const [activeTab, setActiveTab] = useState<Tab>('free-agents');
  const [positionFilter, setPositionFilter] = useState<Position | 'ALL'>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [squadViewMode, setSquadViewMode] = useState<SquadViewMode>('formation');

  const currentTotalWages = state.club.squad.reduce((sum, p) => sum + p.wage, 0);
  // wageReserve fallback: some saves use `wageReserve`, others expose it directly on club
  const wageReserve = (state.club as any).wageReserve ?? 0;
  const wageRunway = currentTotalWages > 0 ? wageReserve / currentTotalWages : Infinity;
  const squadCount = state.club.squad.length;
  const squadCapacity = state.club.squadCapacity;
  const scoutLevel = getScoutLevel(state.club.facilities);

  // Current league position (1–24). If table not yet populated, default to mid-table.
  const leagueEntry = state.league.entries.find(e => e.clubId === state.club.id);
  const tablePosition = leagueEntry?.position ?? 12;

  // Rival club names (excluding player's own club) — used to name competitors in transfer drama.
  const rivalClubNames = state.league.entries
    .filter(e => e.clubId !== state.club.id)
    .map(e => e.clubName);

  // ── Filter + sort free agents ──────────────────────────────────────────────

  function filterPlayers<T extends Player>(players: T[]): T[] {
    return players
      .filter(p => positionFilter === 'ALL' || p.position === positionFilter)
      .sort((a, b) => {
        switch (sortKey) {
          case 'rating':  return computeOverallRating(b) - computeOverallRating(a);
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

  function handleListPlayer(playerId: string) {
    const result = dispatch({ type: 'LIST_PLAYER_FOR_SALE', playerId });
    if (result.error) onError(result.error);
  }

  function handleUnlistPlayer(playerId: string) {
    const result = dispatch({ type: 'UNLIST_PLAYER', playerId });
    if (result.error) onError(result.error);
  }

  const isWindowOpen = isTransferWindowOpen(state.currentWeek, state.phase);
  const listedPlayerIds = state.club.listedPlayerIds ?? [];

  // Manager's XI — used for the lineup view
  const managerTactical = state.club.manager?.attributes.tactical ?? 20;
  const managerXI = state.club.preferredFormation
    ? selectManagerXI(state.club.squad, state.club.preferredFormation, managerTactical, String(state.currentWeek))
    : state.club.squad;

  function handleFillPosition(pos: Position) {
    setPositionFilter(pos);
    setActiveTab('free-agents');
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

      {/* ── Deadline day / urgency banner ────────────────────────────────── */}
      <DeadlineDayBanner week={state.currentWeek} phase={state.phase} />

      {/* ── Budget / squad bar ─────────────────────────────────────────────── */}
      <div className="bg-bg-raised rounded-card border border-white/5 px-4 py-2 flex items-center gap-4 text-sm flex-wrap">
        <span className="text-txt-muted">
          Wage runway: <span className={wageRunway < 8 ? 'text-alert-red font-semibold' : 'text-pitch-green font-semibold'}>{wageRunway === Infinity || !isFinite(wageRunway) ? '∞' : `${Math.floor(wageRunway)}w`}</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="text-txt-muted">
          Squad: <span className={squadCount >= squadCapacity ? 'text-alert-red font-semibold' : 'text-data-blue font-semibold'}>
            {squadCount}/{squadCapacity}
          </span>
        </span>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
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
        {/* View mode toggle — only visible on My Squad tab */}
        {activeTab === 'my-squad' && (
          <div className="ml-auto flex gap-1">
            {([
              { id: 'formation', label: '⊞ Manage' },
              { id: 'lineup',    label: '▶ Lineup' },
              { id: 'list',      label: '≡ List'   },
            ] as { id: SquadViewMode; label: string }[]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSquadViewMode(id)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  squadViewMode === id
                    ? 'bg-white/10 text-txt-primary border border-white/20'
                    : 'text-txt-muted border border-white/5 hover:border-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
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
                canAfford={(currentTotalWages + player.wage) > 0 ? wageReserve / (currentTotalWages + player.wage) >= 8 : true}
                hasSquadRoom={squadCount < squadCapacity}
                scoutLevel={scoutLevel}
                willingness={computeWillingness(player, player.wage, tablePosition)}
                npcInterest={getNpcInterestCount(player.id)}
                tablePosition={tablePosition}
                rivalClubNames={rivalClubNames}
                onSign={wage => handleSign(player.id, wage)}
              />
            ))
          )
        ) : (squadViewMode === 'formation' || squadViewMode === 'lineup') && state.club.preferredFormation ? (
          <>
            {squadViewMode === 'lineup' && (
              <div className="bg-bg-raised rounded-card border border-white/5 px-3 py-2 text-xs text-txt-muted">
                <span className="font-semibold text-txt-primary">Manager's XI</span>
                {state.club.manager ? (
                  <span className="ml-2">{state.club.manager.name} · Tactical {state.club.manager.attributes.tactical}/100</span>
                ) : (
                  <span className="ml-2 text-warn-amber">No manager hired — selection quality is poor</span>
                )}
              </div>
            )}
            <PitchGrid
              squad={state.club.squad}
              formation={state.club.preferredFormation}
              currentWeek={state.currentWeek}
              clubId={state.club.id}
              scoutLevel={scoutLevel}
              listedPlayerIds={listedPlayerIds}
              isWindowOpen={isWindowOpen}
              mode={squadViewMode === 'lineup' ? 'lineup' : 'manage'}
              managerXI={squadViewMode === 'lineup' ? managerXI : undefined}
              onFillPosition={handleFillPosition}
              onRelease={handleRelease}
              onList={handleListPlayer}
              onUnlist={handleUnlistPlayer}
            />
          </>
        ) : (
          filteredSquad.length === 0 ? (
            <div className="text-txt-muted text-sm text-center py-8">No players match your filters.</div>
          ) : (
            filteredSquad.map(player => (
              <SquadPlayerCard
                key={player.id}
                player={player}
                currentWeek={state.currentWeek}
                clubId={state.club.id}
                scoutLevel={scoutLevel}
                isListed={listedPlayerIds.includes(player.id)}
                isWindowOpen={isWindowOpen}
                onRelease={() => handleRelease(player.id)}
                onList={() => handleListPlayer(player.id)}
                onUnlist={() => handleUnlistPlayer(player.id)}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}
