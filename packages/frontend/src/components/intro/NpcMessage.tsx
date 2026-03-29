interface Props {
  name: string;
  role: string;
  avatar: string;
  children: React.ReactNode;
  delay?: boolean;
}

export function NpcMessage({ name, role, avatar, children, delay = false }: Props) {
  return (
    <div className={`flex gap-3 ${delay ? 'animate-fade-in' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-bg-raised flex items-center justify-center text-base shrink-0 mt-0.5">
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-semibold text-txt-primary">{name}</span>
          <span className="text-xs2 text-txt-muted">{role}</span>
        </div>
        <div className="bg-bg-raised rounded-bubble rounded-tl-tag px-3 py-2 text-sm text-txt-primary leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
