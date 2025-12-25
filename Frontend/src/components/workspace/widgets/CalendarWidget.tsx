import { Calendar, Clock } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface CalendarWidgetProps {
  className?: string;
}

export default function CalendarWidget({ className }: CalendarWidgetProps) {
  const { calendarEvents } = useWorkspace();
  const { openWindow } = useWindowManager();

  // Sort events by start time
  const upcomingEvents = [...calendarEvents]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5); // Show next 5 events

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatEventTime = (start: Date) => {
    return `${formatTime(start)}`;
  };

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between cursor-pointer hover:bg-[var(--bg-elev)]/30 -mx-2 -mt-2 px-2 pt-2 pb-1 rounded-t-xl transition-colors"
        onClick={() => openWindow('calendar')}
        title="Click to expand"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Calendar</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Time authority</span>
      </header>

      {/* Events list */}
      <div className="space-y-2">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 rounded-lg bg-[var(--bg-elev)]/40 p-3 transition-colors hover:bg-[var(--bg-elev)]/60"
          >
            {/* Time indicator with color */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: event.color || '#3b82f6' }}
              />
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">
                  {formatEventTime(event.start)}
                </span>
              </div>
            </div>

            {/* Event details */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--text)]">
                {event.title}
              </h3>
              {event.description && (
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}

        {calendarEvents.length === 0 && (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No upcoming events
          </div>
        )}
      </div>
    </section>
  );
}
