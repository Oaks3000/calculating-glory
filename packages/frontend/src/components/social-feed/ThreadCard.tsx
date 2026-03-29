interface ThreadCardProps {
  icon: string;
  title: string;
  sender: string;
  preview: string;
  isUrgent?: boolean;
  badge?: string;
  onClick: () => void;
}

export function ThreadCard({ icon, title, sender, preview, isUrgent, badge, onClick }: ThreadCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-start gap-3 px-3 py-3 rounded-card
                 bg-bg-raised hover:bg-data-blue/10 border border-bg-raised
                 hover:border-data-blue/30 transition-all duration-150 group"
    >
      {/* Avatar */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-bg-base flex items-center justify-center text-base">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-xs font-semibold text-txt-primary truncate group-hover:text-data-blue transition-colors">
            {title}
          </span>
          {isUrgent && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-alert-red" />
          )}
          {badge && !isUrgent && (
            <span className="shrink-0 text-xs2 font-medium text-warn-amber bg-warn-amber/10 px-1.5 py-0.5 rounded-tag">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs2 text-txt-muted truncate">{sender}</p>
        <p className="text-xs2 text-txt-muted truncate mt-0.5 opacity-70">{preview}</p>
      </div>
    </button>
  );
}
