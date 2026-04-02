/**
 * ClubCommercialSlideOver — Val Chen's commercial operations panel.
 *
 * Groups all four commercial facilities into a single screen:
 *   💰 Commercial Centre   — sponsorship, kit sales, media rights
 *   🍔 Food & Beverage     — matchday catering revenue
 *   🎉 Fan Zone            — atmosphere → reputation
 *   🎟 Grounds & Security  — ticketing, parking, attendance boost
 *
 * Opens when any commercial facility is clicked in the Stadium View.
 * Each facility card shows current level, benefit, upgrade cost,
 * and an upgrade button. Val contextualises each one.
 *
 * @see StadiumView — routing: COMMERCIAL_TYPES → setCommercialOpen(true)
 */

import { FacilityType, GameState, GameCommand, FACILITY_CONFIG, formatMoney, computeWeeklyFinancials } from '@calculating-glory/domain';
import { SlideOver } from '../shared/SlideOver';
import { LevelPips } from '../shared/FacilityCard';

// ── Val's contextual copy per facility ────────────────────────────────────────

const VAL_COPY: Record<FacilityType, string[]> = {
  CLUB_COMMERCIAL: [
    'This is where the real money comes from. Sponsorship, kit deals, TV rights — every upgrade multiplies the weekly take.',
    'At level 3 we unlock media suite access. Broadcast rights alone could double our commercial income.',
    'World-class commercial operation. Rival clubs will be envious.',
  ],
  FOOD_AND_BEVERAGE: [
    "Fans spend before and after the match. Even a basic burger van turns a profit on matchday.",
    "A proper catering setup adds up. Eighty fans each spending an extra fiver — that's real money.",
    'Fine dining in the hospitality boxes is pure margin. Worth every penny.',
  ],
  FAN_ZONE: [
    'Happy fans bring their friends. A fan zone builds the matchday experience and lifts our reputation.',
    'This one pays off slowly — but reputation compounds. Every point up means better attendances.',
    'An international fan zone. The club is a brand now.',
  ],
  GROUNDS_SECURITY: [
    'Boring but essential. Poor turnstile flow costs us attendance. Every empty seat is lost revenue.',
    'Better infrastructure means we can handle bigger crowds — and charge more for them.',
    'Seamless entry, great parking, reliable ticketing. Fans come back when the experience is smooth.',
  ],
  // Unused but required by Record type
  STADIUM: [],
  TRAINING_GROUND: [],
  MEDICAL_CENTER: [],
  YOUTH_ACADEMY: [],
  CLUB_OFFICE: [],
  SCOUT_NETWORK: [],
};

const COMMERCIAL_TYPES: FacilityType[] = [
  'CLUB_COMMERCIAL',
  'FOOD_AND_BEVERAGE',
  'FAN_ZONE',
  'GROUNDS_SECURITY',
];

const BENEFIT_LABEL: Record<string, string> = {
  revenue:    'weekly revenue',
  reputation: 'reputation',
  attendance: 'attendance',
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ClubCommercialSlideOverProps {
  isOpen:   boolean;
  /** Which facility was tapped — used to scroll/highlight that card */
  activeType?: FacilityType | null;
  state:    GameState;
  dispatch: (cmd: GameCommand) => { error?: string };
  onError:  (msg: string) => void;
  onClose:  () => void;
}

export function ClubCommercialSlideOver({
  isOpen,
  activeType,
  state,
  dispatch,
  onError,
  onClose,
}: ClubCommercialSlideOverProps) {
  const { club } = state;
  const { weeklyIncome, weeklyWages } = computeWeeklyFinancials(state);

  function handleUpgrade(facilityType: FacilityType) {
    const result = dispatch({
      type:         'UPGRADE_FACILITY',
      clubId:       club.id,
      facilityType,
    });
    if (result.error) onError(result.error);
  }

  // Total commercial facilities at level 1+
  const builtCount = COMMERCIAL_TYPES.filter(t =>
    (club.facilities.find(f => f.type === t)?.level ?? 0) >= 1,
  ).length;

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="💰 Commercial Operations">
      <div className="p-4 flex flex-col gap-5">

        {/* ── Val header ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 bg-warn-amber/5 border border-warn-amber/15 rounded-card px-3 py-3">
          <div className="shrink-0 w-8 h-8 rounded-full bg-warn-amber/20 border border-warn-amber/30
                          flex items-center justify-center text-xs font-bold text-warn-amber">
            V
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-warn-amber leading-tight">Val Chen</p>
            <p className="text-xs text-txt-muted leading-relaxed mt-0.5">
              {builtCount === 0
                ? "We're leaving money on the table. None of our commercial facilities are operational yet."
                : builtCount < 3
                ? `${builtCount} of 4 commercial facilities active. The rest are untapped revenue.`
                : 'Commercial operation is running. Keep investing — every level compounds.'}
            </p>
          </div>
        </div>

        {/* ── Revenue summary strip ────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-bg-raised rounded-card px-3 py-2.5">
            <p className="text-[10px] text-txt-muted uppercase tracking-wide">Budget</p>
            <p className="text-sm font-semibold text-pitch-green data-font mt-0.5">
              {formatMoney(club.transferBudget)}
            </p>
          </div>
          <div className="bg-bg-raised rounded-card px-3 py-2.5">
            <p className="text-[10px] text-txt-muted uppercase tracking-wide">Income/wk</p>
            <p className="text-sm font-semibold text-data-blue data-font mt-0.5">
              {formatMoney(weeklyIncome)}
            </p>
          </div>
          <div className="bg-bg-raised rounded-card px-3 py-2.5">
            <p className="text-[10px] text-txt-muted uppercase tracking-wide">Burn/wk</p>
            <p className="text-sm font-semibold text-txt-primary data-font mt-0.5">
              {formatMoney(weeklyWages)}
            </p>
          </div>
        </div>

        {/* ── Facility cards ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          {COMMERCIAL_TYPES.map(facilityType => {
            const facility   = club.facilities.find(f => f.type === facilityType);
            const meta       = FACILITY_CONFIG[facilityType];
            const level      = facility?.level ?? 0;
            const isBuilding = (facility?.constructionWeeksRemaining ?? 0) > 0;
            const isMaxLevel = level >= 5;
            const canAfford  = (facility?.upgradeCost ?? Infinity) <= club.transferBudget;
            const canUpgrade = !isMaxLevel && !isBuilding && canAfford;
            const isActive   = facilityType === activeType;

            // Pick Val copy by level band
            const copies = VAL_COPY[facilityType];
            const copyIdx = Math.min(Math.floor(level / 2), copies.length - 1);
            const valQuote = copies[copyIdx] ?? '';

            return (
              <div
                key={facilityType}
                id={`commercial-${facilityType}`}
                className={[
                  'bg-bg-raised rounded-card border p-4 flex flex-col gap-3 transition-colors duration-200',
                  isActive
                    ? 'border-warn-amber/40'
                    : isMaxLevel
                    ? 'border-pitch-green/20'
                    : canAfford && !isBuilding && level < 5
                    ? 'border-data-blue/20'
                    : 'border-transparent',
                ].join(' ')}
              >
                {/* Header row */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-txt-primary">{meta.label}</h3>
                      {isMaxLevel && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded
                                         bg-pitch-green/20 text-pitch-green">MAX</span>
                      )}
                      {isBuilding && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded
                                         bg-warn-amber/20 text-warn-amber">BUILDING</span>
                      )}
                    </div>
                    <p className="text-xs2 text-txt-muted mt-0.5">{meta.description}</p>
                  </div>
                  <LevelPips level={level} />
                </div>

                {/* Benefit + level */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-txt-muted">Level {level}</span>
                  <span className="text-txt-muted/40">·</span>
                  <span className="text-data-blue">
                    +{meta.improvementPerLevel * level}% {BENEFIT_LABEL[meta.benefitType] ?? meta.benefitType}
                  </span>
                  {level < 5 && (
                    <>
                      <span className="text-txt-muted/40">→</span>
                      <span className="text-txt-muted">
                        +{meta.improvementPerLevel * (level + 1)}% at Lv {level + 1}
                      </span>
                    </>
                  )}
                </div>

                {/* Val's quote for this facility */}
                {valQuote && (
                  <p className="text-xs2 text-txt-muted/70 italic border-l-2 border-warn-amber/25 pl-2">
                    "{valQuote}"
                  </p>
                )}

                {/* Construction state */}
                {isBuilding && (
                  <div className="flex items-center gap-2 text-xs text-warn-amber">
                    <span>🏗</span>
                    <span>
                      Under construction — {facility!.constructionWeeksRemaining} week
                      {facility!.constructionWeeksRemaining === 1 ? '' : 's'} remaining
                    </span>
                  </div>
                )}

                {/* Upgrade footer */}
                {!isMaxLevel && !isBuilding && (
                  <div className="flex items-center justify-between pt-2 border-t border-bg-surface">
                    <div>
                      <span className="text-xs2 text-txt-muted">
                        {level === 0 ? 'Build cost: ' : 'Upgrade cost: '}
                      </span>
                      <span className={`text-xs font-semibold data-font ${canAfford ? 'text-txt-primary' : 'text-alert-red'}`}>
                        {formatMoney(facility?.upgradeCost ?? 0)}
                      </span>
                      {!canAfford && (
                        <span className="text-xs2 text-alert-red ml-1">(insufficient funds)</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleUpgrade(facilityType)}
                      disabled={!canUpgrade}
                      className={[
                        'px-3 py-1.5 rounded-tag text-xs font-semibold transition-all duration-150',
                        canUpgrade
                          ? 'bg-data-blue text-white hover:bg-data-blue/80 active:scale-95'
                          : 'bg-bg-surface text-txt-muted cursor-not-allowed',
                      ].join(' ')}
                    >
                      {level === 0 ? 'Build' : 'Upgrade'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </SlideOver>
  );
}
