import { ActiveSection } from '../../App';

interface AppNavMobileProps {
  activeSection: ActiveSection;
  onSectionChange: (s: ActiveSection) => void;
  unresolvedCount: number;
}

const ITEMS: { section: ActiveSection; icon: string; label: string }[] = [
  { section: 'overview',  icon: '⊞',  label: 'Overview' },
  { section: 'inbox',     icon: '📥', label: 'Inbox' },
  { section: 'transfers', icon: '🔄', label: 'Transfers' },
  { section: 'finances',  icon: '💰', label: 'Finances' },
  { section: 'backroom',  icon: '🧑‍💼', label: 'Backroom' },
  { section: 'squad',     icon: '👥', label: 'Squad' },
];

export function AppNavMobile({ activeSection, onSectionChange, unresolvedCount }: AppNavMobileProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-bg-raised pb-safe z-30">
      <div className="flex">
        {ITEMS.map(({ section, icon, label }) => {
          const isActive = activeSection === section;
          const showBadge = section === 'inbox' && unresolvedCount > 0;
          return (
            <button
              key={section}
              onClick={() => onSectionChange(section)}
              className={[
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors duration-150 relative border-t-2',
                isActive
                  ? 'text-txt-primary border-data-blue'
                  : 'text-txt-muted border-transparent',
              ].join(' ')}
            >
              <span className="text-base leading-none">{icon}</span>
              <span className="text-xs2 leading-none">{label}</span>
              {showBadge && (
                <span className="absolute top-1 right-1/4 translate-x-1/2 bg-data-blue text-bg-deep text-xs2 font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unresolvedCount > 9 ? '9+' : unresolvedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
