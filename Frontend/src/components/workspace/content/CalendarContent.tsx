/**
 * Calendar Content Component
 * Pure content for Calendar window (no shell)
 */

import { Clock3 } from 'lucide-react';

const agenda = [
  { time: '09:30', title: 'Design sync', detail: '3 teammates' },
  { time: '12:00', title: 'Client window', detail: 'Calm check-in' },
  { time: '15:30', title: 'Focus block', detail: 'Reserved' },
];

type CalendarContentProps = {
  className?: string;
};

export default function CalendarContent({ className }: CalendarContentProps) {
  return (
    <div className={`flex h-full flex-col gap-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Time authority</p>
        <span className="rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--text-muted)]">
          Synced
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {agenda.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-xl bg-[var(--layer-muted)]/80 px-3 py-2 text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-surface)] text-[var(--muted)] shadow-sm ring-1 ring-[var(--line-subtle)]/40">
              <Clock3 className="h-4 w-4" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold leading-tight">{item.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{item.detail}</p>
              <p className="text-xs text-[var(--muted)]">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
