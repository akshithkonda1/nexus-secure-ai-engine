import { Calendar, Clock } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface CalendarWidgetProps {
  className?: string;
}

export default function CalendarWidget({ className = "" }: CalendarWidgetProps) {
  const calendarEvents = useWorkspace((state) => state.calendarEvents);
  const openWindow = useWindowManager((state) => state.openWindow);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventColor = (type?: string) => {
    switch (type) {
      case 'meeting':
        return '#8b5cf6';
      case 'work':
        return '#3b82f6';
      case 'personal':
        return '#10b981';
      case 'family':
        return '#f59e0b';
      default:
        return '#6366f1';
    }
  };

  const handleHeaderClick = () => {
    openWindow('calendar');
  };

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      <header
        className="flex items-center justify-between cursor-pointer hover:bg-[var(--bg-elev)]/20 -mx-2 -mt-2 px-2 pt-2 pb-1 rounded-t-xl transition-colors"
        onClick={handleHeaderClick}
        title="Click to expand"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Calendar</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Time authority</span>
      </header>

      <div className="space-y-2">
        {calendarEvents.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 rounded-lg bg-[var(--bg-elev)]/40 p-3 transition-colors hover:bg-[var(--bg-elev)]/60"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getEventColor(event.type) }}
              />
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">
                  {formatTime(event.start)}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--text)]">{event.title}</h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {event.type || 'Event'}
              </p>
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
