interface ChatBubbleProps {
  sender: 'npc' | 'player';
  name?: string;
  message: string;
  timestamp?: string;
}

export function ChatBubble({ sender, name, message, timestamp }: ChatBubbleProps) {
  const isNpc = sender === 'npc';

  return (
    <div className={`flex flex-col gap-0.5 ${isNpc ? 'items-start' : 'items-end'}`}>
      {name && (
        <span className="text-xs2 text-txt-muted px-1">{name}</span>
      )}
      <div
        className={[
          'max-w-[70%] px-3 py-2 text-sm leading-relaxed',
          isNpc
            ? 'bg-[#F0F2F5] text-[#0B1622] rounded-[20px] rounded-tl-sm'
            : 'bg-data-blue text-white rounded-[20px] rounded-tr-sm',
        ].join(' ')}
        style={{ animation: 'fadeIn 0.25s ease-out' }}
      >
        {message}
      </div>
      {timestamp && (
        <span className="text-xs2 text-txt-muted px-1">{timestamp}</span>
      )}
    </div>
  );
}
