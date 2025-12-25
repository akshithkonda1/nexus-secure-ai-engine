/**
 * Calendar Content Component
 * Pure content for Calendar window (no shell)
 */

import { Clock3 } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

type CalendarContentProps = {
  className?: string;
};

export default function CalendarContent({ className }: CalendarContentProps) {
  const events = useWorkspace(state => state.calendarEvents);

  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get today's and upcoming events
  const upcomingEvents = events
    .filter(event => new Date(event.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 10);

  return (
    <div className={`flex h-full flex-col gap-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Time authority</p>
        <span className="rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--text-muted)]">
          Synced
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {upcomingEvents.length === 0 ? (
          <p className="text-center text-sm text-[var(--text-muted)]">
            No upcoming events
          </p>
        ) : (
          upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 rounded-xl bg-[var(--layer-muted)]/80 px-3 py-2 text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-surface)] text-[var(--muted)] shadow-sm ring-1 ring-[var(--line-subtle)]/40">
                <Clock3 className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-tight">{event.title}</p>
                {event.attendees && event.attendees.length > 0 && (
                  <p className="text-xs text-[var(--text-muted)]">
                    {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                  </p>
                )}
                <p className="text-xs text-[var(--muted)]">{formatTime(event.start)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
