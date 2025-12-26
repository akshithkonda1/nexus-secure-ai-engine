/**
 * Calendar Widget Component
 * Compact calendar preview with current date and upcoming events
 */

import { Calendar, ChevronRight } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import { useWindowManager } from '../../../hooks/useWindowManager';

export interface CalendarWidgetProps {
  className?: string;
}

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarWidget({ className = '' }: CalendarWidgetProps) {
  const calendarEvents = useWorkspace((state) => state.calendarEvents);
  const openWindow = useWindowManager((state) => state.openWindow);

  const today = new Date();
  const todayDay = today.getDate();
  const todayDayName = DAY_NAMES[today.getDay()];
  const todayMonth = MONTH_NAMES_SHORT[today.getMonth()];
  const todayYear = today.getFullYear();

  // Helper: Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Helper: Get event color by type
  const getEventColor = (type?: string) => {
    switch (type) {
      case 'meeting': return 'bg-purple-500';
      case 'work': return 'bg-blue-500';
      case 'personal': return 'bg-green-500';
      case 'family': return 'bg-orange-500';
      default: return 'bg-indigo-500';
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Format date for display (Today, Tomorrow, or date)
  const formatDate = (date: Date) => {
    const eventDate = new Date(date);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isSameDay(eventDate, today)) return 'Today';
    if (isSameDay(eventDate, tomorrow)) return 'Tomorrow';

    return eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get today's events
  const todayEvents = calendarEvents.filter(event =>
    isSameDay(new Date(event.start), today)
  );

  // Get upcoming events (next 7 days, excluding past events today)
  const upcomingEvents = calendarEvents
    .filter(event => {
      const eventDate = new Date(event.start);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return eventDate >= today && eventDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3);

  const handleOpenCalendar = () => {
    openWindow('calendar');
  };

  return (
    <section
      onClick={handleOpenCalendar}
      className={`flex cursor-pointer flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl transition-all hover:bg-[var(--bg-surface)]/80 ${className}`}
      role="button"
      aria-label="Open calendar"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Calendar</h2>
        </div>
        {upcomingEvents.length > 0 && (
          <span className="text-xs text-[var(--text-muted)]">
            {upcomingEvents.length} upcoming
          </span>
        )}
      </header>

      {/* Current Date Card */}
      <div className="rounded-xl border border-[var(--line-subtle)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            {todayMonth} {todayYear}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCalendar();
            }}
            className="text-[10px] font-medium text-[var(--accent)] hover:underline"
          >
            View all
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-[var(--accent)]/10 p-2 ring-1 ring-[var(--accent)]/30">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-[var(--accent)]">{todayDay}</span>
            <span className="text-xs font-medium text-[var(--accent)]">{todayDayName}</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-[var(--text)]">
              {todayEvents.length} {todayEvents.length === 1 ? 'event' : 'events'} today
            </p>
            {todayEvents.length > 0 && (
              <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                Next: {todayEvents[0].title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 ? (
        <div className="space-y-2">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-2 rounded-lg p-2 transition-colors hover:bg-[var(--bg-elev)]"
            >
              <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${getEventColor(event.type)}`} />

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-xs font-semibold text-[var(--text)]">
                  {event.title}
                </h3>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatDate(event.start)}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">•</span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatTime(event.start)}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Calendar className="mb-2 h-8 w-8 text-[var(--text-muted)] opacity-50" />
          <p className="text-xs text-[var(--text-muted)]">No upcoming events</p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)] opacity-75">
            Your schedule is clear
          </p>
        </div>
      )}

      {/* Footer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpenCalendar();
        }}
        className="flex items-center justify-center gap-1 text-xs font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent)]/80"
      >
        View full calendar
        <ChevronRight className="h-3 w-3" />
      </button>
    </section>
  );
}
