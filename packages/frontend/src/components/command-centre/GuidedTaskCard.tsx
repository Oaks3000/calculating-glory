import { GuidedTask, GuidedTaskId } from '../../lib/guidedTasks';
import { NPC_COLOUR_CLASSES } from '../../lib/npcs';

interface Props {
  tasks: GuidedTask[];
  onTaskClick: (id: GuidedTaskId) => void;
}

export function GuidedTaskCard({ tasks, onTaskClick }: Props) {
  const completed = tasks.filter(t => t.done).length;
  const total = tasks.length;

  return (
    <div className="bg-bg-surface border border-bg-raised rounded-card overflow-hidden">
      <div className="px-4 py-3 border-b border-bg-raised flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-txt-muted font-semibold">
            First week at the club
          </div>
          <div className="text-sm text-txt-primary mt-0.5">
            Four things to get sorted — the rest of the season builds on these.
          </div>
        </div>
        <div className="text-xs font-mono text-txt-muted shrink-0 ml-3">
          {completed}/{total}
        </div>
      </div>

      <ul className="divide-y divide-bg-raised">
        {tasks.map(task => {
          const c = NPC_COLOUR_CLASSES[task.npc.colour];
          return (
            <li key={task.id}>
              <button
                onClick={() => onTaskClick(task.id)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg-raised/60 transition-colors"
              >
                <div
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5',
                    task.done ? 'bg-pitch-green text-white' : `${c.bgSubtle} ring-2 ${c.ring}`,
                  ].join(' ')}
                >
                  {task.done ? '✓' : task.npc.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm font-semibold ${task.done ? 'text-txt-muted line-through' : 'text-txt-primary'}`}>
                      {task.title}
                    </span>
                    <span className={`text-xs2 ${c.text} shrink-0`}>
                      {task.npc.name.split(' ')[0]}
                    </span>
                  </div>
                  {!task.done && (
                    <p className="text-xs text-txt-muted leading-snug mt-0.5">
                      {task.blurb}
                    </p>
                  )}
                </div>
                {!task.done && (
                  <div className="text-txt-muted text-lg shrink-0">→</div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
