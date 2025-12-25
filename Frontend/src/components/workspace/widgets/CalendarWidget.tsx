import { Calendar, Clock } from "lucide-react";

export interface CalendarWidgetProps {
  className?: string;
}

const sampleEvents = [
  { id: '1', title: 'Team Standup', description: 'Daily sync', time: '09:00', color: '#3b82f6' },
  { id: '2', title: 'Code Review', description: 'PR #42', time: '11:30', color: '#8b5cf6' },
  { id: '3', title: 'Lunch Break', description: 'Team lunch', time: '12:30', color: '#10b981' },
];

export default function CalendarWidget({ className = "" }: CalendarWidgetProps) {
  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Calendar</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Time authority</span>
      </header>

      <div className="space-y-2">
        {sampleEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 rounded-lg bg-[var(--bg-elev)]/40 p-3 transition-colors hover:bg-[var(--bg-elev)]/60"
          >
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: event.color }}
              />
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">{event.time}</span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-medium text-[var(--text)]">{event.title}</h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
