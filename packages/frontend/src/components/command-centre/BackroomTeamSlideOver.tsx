import { GameState, GameCommand, Staff, StaffRole, Manager, MANAGER_PERSONAS } from '@calculating-glory/domain';
import { formatMoney } from '@calculating-glory/domain';

// ── Role display config ───────────────────────────────────────────────────────

interface RoleConfig {
  role: StaffRole;
  icon: string;
  label: string;
  /** Hiring fee in pence (one-off wage impact proxy) */
  hireSalary: number;
  bonusLabel: string;
}

const ROLE_CONFIG: RoleConfig[] = [
  {
    role: 'FITNESS_COACH',
    icon: '🏃',
    label: 'Fitness Coach',
    hireSalary: 300000, // £3,000/wk
    bonusLabel: 'Player fitness & injury prevention',
  },
  {
    role: 'PHYSIO',
    icon: '🩺',
    label: 'Club Physio',
    hireSalary: 250000,
    bonusLabel: 'Injury recovery speed',
  },
  {
    role: 'ATTACKING_COACH',
    icon: '⚽',
    label: 'Set-Piece Coach',
    hireSalary: 350000,
    bonusLabel: 'Goals from set-pieces',
  },
  {
    role: 'DEFENSIVE_COACH',
    icon: '🛡',
    label: 'Defensive Coach',
    hireSalary: 350000,
    bonusLabel: 'Goals conceded reduction',
  },
  {
    role: 'YOUTH_COACH',
    icon: '🌱',
    label: 'Youth Scout',
    hireSalary: 200000,
    bonusLabel: 'Youth player development',
  },
];

// ── Star rating helper ────────────────────────────────────────────────────────

/** Convert quality 0-100 to 1–5 stars (same pattern as Business Acumen). */
function toStars(quality: number): number {
  return Math.max(1, Math.round(quality / 20));
}

function StarRating({ quality }: { quality: number }) {
  const stars = toStars(quality);
  return (
    <span className="text-warn-amber data-font text-sm tracking-wider">
      {'★'.repeat(stars)}
      <span className="opacity-30">{'★'.repeat(5 - stars)}</span>
    </span>
  );
}

// ── Staff row ─────────────────────────────────────────────────────────────────

interface StaffRowProps {
  config: RoleConfig;
  member: Staff | undefined;
  canAfford: boolean;
  onHire: () => void;
}

function StaffRow({ config, member, canAfford, onHire }: StaffRowProps) {
  const isHired = !!member;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-bg-raised last:border-0">
      {/* Icon */}
      <span className="text-2xl w-8 text-center shrink-0">{config.icon}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-txt-primary">{config.label}</span>
          {isHired && (
            <span className="badge bg-pitch-green/15 text-pitch-green text-xs2">Hired</span>
          )}
        </div>
        <div className="text-xs2 text-txt-muted mt-0.5">{config.bonusLabel}</div>
        {isHired && (
          <div className="flex items-center gap-3 mt-1">
            <StarRating quality={member!.quality} />
            <span className="text-xs2 text-txt-muted font-mono">
              {member!.name}
            </span>
          </div>
        )}
      </div>

      {/* Right side: cost + action */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs2 font-mono text-txt-muted">
          {formatMoney(isHired ? member!.salary : config.hireSalary)}<span className="text-txt-muted/50">/wk</span>
        </span>
        {isHired ? (
          <div className="flex items-center gap-1">
            <StarRating quality={member!.quality} />
          </div>
        ) : (
          <button
            onClick={onHire}
            disabled={!canAfford}
            className={[
              'text-xs px-2 py-0.5 rounded-tag font-semibold transition-colors',
              canAfford
                ? 'bg-data-blue/20 text-data-blue hover:bg-data-blue/30'
                : 'bg-bg-raised text-txt-muted cursor-not-allowed opacity-60',
            ].join(' ')}
          >
            {canAfford ? 'Hire' : 'No budget'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface BackroomTeamSlideOverProps {
  state: GameState;
  dispatch: (command: GameCommand) => { error?: string };
  onError: (msg: string) => void;
}

// ── Manager row ──────────────────────────────────────────────────────────────

function ManagerRow({ manager }: { manager: Manager | null }) {
  if (!manager) {
    return (
      <div className="flex items-center gap-3 py-3 opacity-60">
        <span className="text-2xl w-8 text-center shrink-0">🧑‍💼</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-txt-muted">Manager</span>
          <div className="text-xs2 text-txt-muted mt-0.5">No manager appointed</div>
        </div>
      </div>
    );
  }

  const { tactical, motivation, experience } = manager.attributes;
  const persona = MANAGER_PERSONAS[manager.archetype];

  // Confidence thresholds
  const confidenceLabel =
    manager.confidence >= 75 ? { text: 'Confident', colour: 'text-pitch-green' } :
    manager.confidence >= 45 ? { text: 'Settled',   colour: 'text-txt-muted'  } :
    manager.confidence >= 20 ? { text: 'Unsettled', colour: 'text-warn-amber' } :
                               { text: 'Under pressure', colour: 'text-alert-red' };

  return (
    <div className="py-3 flex gap-3">
      <span className="text-2xl w-8 text-center shrink-0">🧑‍💼</span>
      <div className="flex-1 min-w-0">
        {/* Name + hired badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-txt-primary">{manager.name}</span>
          <span className="badge bg-pitch-green/15 text-pitch-green text-xs2">Hired</span>
        </div>

        {/* Archetype pill */}
        <div className="mt-1">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-sm ${persona.avatarClass}`}>
            {persona.label}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mt-1.5 text-xs2 text-txt-muted flex-wrap">
          <span>⚔️ Tactical {tactical}</span>
          <span>📣 Motivation {motivation}</span>
          <span>📋 Experience {experience}</span>
        </div>

        {/* Confidence bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs2 text-txt-muted">Manager confidence</span>
            <span className={`text-xs2 font-medium ${confidenceLabel.colour}`}>
              {confidenceLabel.text}
            </span>
          </div>
          <div className="h-1 bg-bg-raised rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                manager.confidence >= 75 ? 'bg-pitch-green' :
                manager.confidence >= 45 ? 'bg-warn-amber/60' :
                manager.confidence >= 20 ? 'bg-warn-amber' :
                'bg-alert-red'
              }`}
              style={{ width: `${manager.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Wage + experience stars */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs2 font-mono text-txt-muted">
          {formatMoney(manager.wage)}<span className="text-txt-muted/50">/wk</span>
        </span>
        <StarRating quality={experience} />
      </div>
    </div>
  );
}

// ── Impact summary ───────────────────────────────────────────────────────────

function ImpactSummary({ club }: { club: GameState['club'] }) {
  // Staff avg quality → +0.00 to +0.12
  const staffBoost = club.staff.length > 0
    ? (club.staff.reduce((sum, s) => sum + s.quality, 0) / club.staff.length / 100) * 0.12
    : 0;

  // Manager experience → +0.00 to +0.06
  const mgrBoost = club.manager
    ? (club.manager.attributes.experience / 100) * 0.06
    : 0;

  const totalBoost = staffBoost + mgrBoost;
  const maxBoost = 0.18; // 0.12 + 0.06

  const pctOfMax = Math.round((totalBoost / maxBoost) * 100);

  return (
    <div className="px-4 py-2 bg-bg-raised/50 border-b border-bg-raised/50 shrink-0">
      <span className="text-xs text-txt-muted uppercase tracking-wide">Match impact</span>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-1.5 bg-bg-raised rounded-full overflow-hidden">
          <div
            className="h-full bg-pitch-green rounded-full transition-all"
            style={{ width: `${pctOfMax}%` }}
          />
        </div>
        <span className="text-xs font-mono text-pitch-green shrink-0">
          +{(totalBoost * 100).toFixed(1)}%
        </span>
      </div>
      <div className="flex gap-3 mt-1 text-xs2 text-txt-muted">
        <span>Staff: +{(staffBoost * 100).toFixed(1)}%</span>
        <span>Manager: +{(mgrBoost * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function BackroomTeamSlideOver({ state, dispatch, onError }: BackroomTeamSlideOverProps) {
  const { club } = state;

  // Total backroom wage cost (staff + manager)
  const backroomWages = club.staff.reduce((s, st) => s + st.salary, 0)
    + (club.manager?.wage ?? 0);

  function handleHire(config: RoleConfig) {
    const result = dispatch({
      type: 'HIRE_STAFF',
      clubId: club.id,
      staffId: `${config.role.toLowerCase()}-hire`,
    });
    if (result?.error) onError(result.error as string);
  }

  return (
    <div className="flex flex-col h-full">

      {/* Summary bar */}
      <div className="px-4 py-3 bg-bg-raised border-b border-bg-raised/50 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-txt-muted uppercase tracking-wide">Staff hired</span>
            <p className="text-lg font-semibold text-txt-primary data-font">
              {club.staff.length} <span className="text-txt-muted text-sm font-normal">/ {ROLE_CONFIG.length}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-txt-muted uppercase tracking-wide">Backroom wages</span>
            <p className="text-lg font-semibold text-warn-amber data-font">
              {formatMoney(backroomWages)}<span className="text-txt-muted text-sm font-normal">/wk</span>
            </p>
          </div>
        </div>
      </div>

      {/* Impact summary bar */}
      <ImpactSummary club={club} />

      {/* Manager */}
      <div className="px-4 border-b border-bg-raised">
        <ManagerRow manager={club.manager} />
      </div>

      {/* Staff list */}
      <div className="flex-1 overflow-y-auto px-4">
        {ROLE_CONFIG.map(config => {
          const member = club.staff.find(s => s.role === config.role);
          const canAfford = club.transferBudget >= config.hireSalary * 4; // 4-week buffer
          return (
            <StaffRow
              key={config.role}
              config={config}
              member={member}
              canAfford={!member && canAfford}
              onHire={() => handleHire(config)}
            />
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-4 py-3 border-t border-bg-raised shrink-0">
        <p className="text-xs2 text-txt-muted">
          Staff quality and manager experience boost your match modifier. Hire all five roles and appoint a strong manager to maximise the +18% ceiling.
        </p>
        <p className="text-xs2 text-txt-muted/60 mt-1">
          Budget check uses 4-week salary buffer. Wages are deducted weekly.
        </p>
      </div>
    </div>
  );
}
