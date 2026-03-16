import { Formation, FORMATION_CONFIG, FormationConfig } from '@calculating-glory/domain';

interface FormationPickerProps {
  selected: Formation | null;
  onSelect: (f: Formation) => void;
}

const STYLE_BADGE: Record<string, string> = {
  Balanced:   'bg-data-blue/15 text-data-blue',
  Attacking:  'bg-pitch-green/15 text-pitch-green',
  Controlled: 'bg-warn-amber/15 text-warn-amber',
  'Wing Play':'bg-[#CE93D8]/15 text-[#CE93D8]',
  Defensive:  'bg-txt-muted/15 text-txt-muted',
  Counter:    'bg-alert-red/15 text-alert-red',
};

const FORMATIONS: Formation[] = ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2', '4-5-1'];

function SlotDots({ slots }: { slots: FormationConfig['slots'] }) {
  return (
    <div className="flex items-center gap-2 mt-3">
      {(['GK', 'DEF', 'MID', 'FWD'] as const).map(pos => (
        <div key={pos} className="flex flex-col items-center gap-0.5">
          <div className="flex gap-0.5">
            {Array.from({ length: slots[pos] }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-txt-muted/40"
              />
            ))}
          </div>
          <span className="text-xs2 text-txt-muted/60">{pos}</span>
        </div>
      ))}
    </div>
  );
}

export function FormationPicker({ selected, onSelect }: FormationPickerProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-txt-primary mb-1">Preferred Formation</h3>
      <p className="text-xs text-txt-muted mb-4">
        Sets your recruitment strategy. Your manager picks the XI — this tells them what shape you want to play.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FORMATIONS.map(id => {
          const cfg = FORMATION_CONFIG[id];
          const isSelected = selected === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={[
                'text-left rounded-card p-4 border transition-all',
                isSelected
                  ? 'bg-data-blue/10 border-data-blue shadow-[0_0_0_1px_rgba(68,138,255,0.4)]'
                  : 'bg-bg-raised border-white/5 hover:border-white/20',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-bold text-txt-primary font-mono">{cfg.label}</span>
                {isSelected && (
                  <span className="text-xs text-data-blue font-semibold">✓</span>
                )}
              </div>
              <span className={`text-xs2 font-medium px-1.5 py-0.5 rounded-tag ${STYLE_BADGE[cfg.style] ?? 'bg-txt-muted/15 text-txt-muted'}`}>
                {cfg.style}
              </span>
              <p className="text-xs text-txt-muted mt-2 leading-relaxed line-clamp-3">
                {cfg.description}
              </p>
              <SlotDots slots={cfg.slots} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
