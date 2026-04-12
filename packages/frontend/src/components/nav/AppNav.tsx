import { ActiveSection } from '../../App';
import { ActiveView } from '../shared/ViewToggle';

interface AppNavProps {
  activeSection: ActiveSection;
  onSectionChange: (s: ActiveSection) => void;
  activeView: ActiveView;
  onViewChange: (v: ActiveView) => void;
  unresolvedCount: number;
}

const TOP_ITEMS: { section: ActiveSection; icon: string; label: string }[] = [
  { section: 'overview',  icon: '⊞',  label: 'Overview' },
  { section: 'inbox',     icon: '📥', label: 'Inbox' },
  { section: 'squad',     icon: '👥', label: 'Squad' },
  { section: 'transfers', icon: '🔄', label: 'Transfers' },
  { section: 'finances',  icon: '💰', label: 'Finances' },
  { section: 'backroom',  icon: '🧑‍💼', label: 'Backroom' },
];

export function AppNav({ activeSection, onSectionChange, activeView, onViewChange, unresolvedCount }: AppNavProps) {
  const isCommand = activeView === 'command';

  return (
    <nav className="hidden lg:flex flex-col w-48 bg-bg-surface border-r border-bg-raised shrink-0">
      {/* Top section nav */}
      <div className="flex flex-col py-2 flex-1">
        {TOP_ITEMS.map(({ section, icon, label }) => {
          const isActive = isCommand && activeSection === section;
          const showBadge = section === 'inbox' && unresolvedCount > 0;
          return (
            <button
              key={section}
              onClick={() => { onViewChange('command'); onSectionChange(section); }}
              className={[
                'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150 border-l-2 text-left',
                isActive
                  ? 'bg-bg-raised text-txt-primary border-data-blue'
                  : 'text-txt-muted hover:text-txt-primary border-transparent hover:bg-bg-raised/40',
              ].join(' ')}
            >
              <span className="text-base leading-none shrink-0">{icon}</span>
              <span className="truncate">{label}</span>
              {showBadge && (
                <span className="ml-auto bg-data-blue/20 text-data-blue text-xs2 font-semibold px-1.5 py-0.5 rounded-tag">
                  {unresolvedCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: Stadium */}
      <div className="border-t border-bg-raised py-2">
        <button
          onClick={() => onViewChange('stadium')}
          className={[
            'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150 border-l-2 w-full text-left',
            activeView === 'stadium'
              ? 'bg-bg-raised text-txt-primary border-data-blue'
              : 'text-txt-muted hover:text-txt-primary border-transparent hover:bg-bg-raised/40',
          ].join(' ')}
        >
          <span className="text-base leading-none shrink-0">🏟</span>
          <span className="truncate">Stadium</span>
        </button>
      </div>
    </nav>
  );
}
