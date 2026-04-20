import { useState, useEffect } from 'react';
import { GLOSSARY, GlossaryTermId } from '../../lib/glossary';
import { NPCS, NPC_COLOUR_CLASSES } from '../../lib/npcs';
import { hasSeenTerm, markTermSeen } from '../../lib/introState';
import { NpcMessage } from '../intro/NpcMessage';

interface Props {
  termId: GlossaryTermId;
  // Override the displayed label. Defaults to the glossary's canonical term.
  label?: string;
  // Visual size. Inline for dense strips, default for body copy.
  size?: 'inline' | 'default';
  className?: string;
}

// Tappable label + ⓘ icon. First tap opens a full NPC explainer (with "goes up
// when / goes down when" rows). Subsequent taps show a compact popup with the
// short definition. "First time" is tracked per-term in localStorage.
export function TermInfo({ termId, label, size = 'default', className }: Props) {
  const term = GLOSSARY[termId];
  const [open, setOpen] = useState(false);
  const [firstTime, setFirstTime] = useState(false);

  // Close on Escape while any popup is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    setFirstTime(!hasSeenTerm(termId));
    markTermSeen(termId);
    setOpen(true);
  }

  const iconSize = size === 'inline' ? 'w-3.5 h-3.5 text-[9px]' : 'w-4 h-4 text-[10px]';
  const colour = NPC_COLOUR_CLASSES[NPCS[term.npc].colour];

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={[
          'inline-flex items-center gap-1 group hover:text-txt-primary transition-colors',
          className ?? '',
        ].join(' ').trim()}
      >
        <span>{label ?? term.term}</span>
        <span
          className={[
            iconSize,
            'inline-flex items-center justify-center rounded-full border font-bold',
            colour.bgSubtle,
            colour.text,
            'border-current/40 group-hover:border-current',
          ].join(' ')}
          aria-label={`What is ${term.term}?`}
        >
          ?
        </span>
      </button>

      {open && (
        <TermPopup
          termId={termId}
          firstTime={firstTime}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ── Popup ────────────────────────────────────────────────────────────────────

interface PopupProps {
  termId: GlossaryTermId;
  firstTime: boolean;
  onClose: () => void;
}

function TermPopup({ termId, firstTime, onClose }: PopupProps) {
  const term = GLOSSARY[termId];
  const npc = NPCS[term.npc];
  const colour = NPC_COLOUR_CLASSES[npc.colour];
  const [expanded, setExpanded] = useState(firstTime);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-bg-deep/70 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-bg-surface border border-bg-raised rounded-card overflow-hidden shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header — term + close */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bg-raised">
          <div>
            <div className="text-xs2 uppercase tracking-widest text-txt-muted">Explainer</div>
            <div className="text-base font-bold text-txt-primary">{term.term}</div>
          </div>
          <button
            onClick={onClose}
            className="text-txt-muted hover:text-txt-primary text-lg w-8 h-8 flex items-center justify-center"
            aria-label="Close explainer"
          >
            ✕
          </button>
        </div>

        {/* Body — NPC voice */}
        <div className="p-4 space-y-3">
          <NpcMessage name={npc.name} role={npc.role} avatar={npc.avatar} colour={npc.colour}>
            {expanded ? term.full : term.short}
          </NpcMessage>

          {expanded && (
            <div className="space-y-2 pt-1">
              <div className={`flex items-start gap-2 text-xs ${colour.bgSubtle} border-l-4 ${colour.border} rounded-tag px-3 py-2`}>
                <span className="text-pitch-green font-bold shrink-0">↑</span>
                <div>
                  <span className="font-semibold text-txt-primary">Goes up when </span>
                  <span className="text-txt-muted">{term.upWhen}</span>
                </div>
              </div>
              <div className={`flex items-start gap-2 text-xs ${colour.bgSubtle} border-l-4 ${colour.border} rounded-tag px-3 py-2`}>
                <span className="text-alert-red font-bold shrink-0">↓</span>
                <div>
                  <span className="font-semibold text-txt-primary">Goes down when </span>
                  <span className="text-txt-muted">{term.downWhen}</span>
                </div>
              </div>
            </div>
          )}

          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className={`w-full text-xs ${colour.text} hover:underline py-1 text-center`}
            >
              Show full explainer →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
