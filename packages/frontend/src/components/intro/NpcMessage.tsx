import { NPC_COLOUR_CLASSES, NpcColourKey } from '../../lib/npcs';

interface Props {
  name: string;
  role: string;
  avatar: string;
  children: React.ReactNode;
  delay?: boolean;
  colour?: NpcColourKey;
}

export function NpcMessage({ name, role, avatar, children, delay = false, colour }: Props) {
  const c = colour ? NPC_COLOUR_CLASSES[colour] : null;
  return (
    <div className={`flex gap-3 ${delay ? 'animate-fade-in' : ''}`}>
      <div
        className={[
          'w-8 h-8 rounded-full bg-bg-raised flex items-center justify-center text-base shrink-0 mt-0.5',
          c ? `ring-2 ${c.ring}` : '',
        ].join(' ').trim()}
      >
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-xs font-semibold ${c ? c.name : 'text-txt-primary'}`}>{name}</span>
          <span className="text-xs2 text-txt-muted">{role}</span>
        </div>
        <div
          className={[
            'bg-bg-raised rounded-bubble rounded-tl-tag px-3 py-2 text-sm text-txt-primary leading-relaxed',
            c ? `border-l-4 ${c.border}` : '',
          ].join(' ').trim()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
