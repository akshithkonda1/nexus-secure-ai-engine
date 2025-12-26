/**
 * Calendar Widget Component
 * Compact calendar widget with current date, upcoming events, and click-to-expand
 */

import { Calendar, ChevronRight } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface CalendarWidgetProps {
  className?: string;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarWidget({ className = "" }: CalendarWidgetProps) {
  const calendarEvents = useWorkspace((state) => state.calendarEvents);
  const openWindow = useWindowManager((state) => state.openWindow);

  const today = new Date();
  const dayNumber = today.getDate();
  const dayName = DAY_NAMES[today.getDay()];
  const monthName = MONTH_NAMES[today.getMonth()];
  const year = today.getFullYear();

  // Helper functions
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDateRelative = (date: Date) => {
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

  const getEventColor = (type?: string) => {
    switch (type) {
      case 'meeting': return 'bg-purple-500';
      case 'work': return 'bg-blue-500';
      case 'personal': return 'bg-green-500';
      case 'family': return 'bg-orange-500';
      default: return 'bg-indigo-500';
    }
  };

  // Get today's events
  const todayEvents = calendarEvents.filter((event) => {
    const eventDate = new Date(event.start);
    return isSameDay(eventDate, today);
  }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Get upcoming events (next 7 days, excluding today)
  const upcomingEvents = calendarEvents
    .filter((event) => {
      const eventDate = new Date(event.start);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return eventDate > today && eventDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 3);

  // Combine today's events and upcoming for display (max 3 total)
  const displayEvents = [...todayEvents, ...upcomingEvents].slice(0, 3);

  const handleWidgetClick = () => {
    openWindow('calendar');
  };

  const handleViewAllClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWindow('calendar');
  };

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl cursor-pointer hover:bg-[var(--bg-surface)]/75 transition-colors ${className}`}
      onClick={handleWidgetClick}
      title="Click to open calendar"
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Calendar</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {displayEvents.length > 0 ? `${displayEvents.length} upcoming` : 'No events'}
        </span>
      </header>

      {/* Current Date Display */}
      <div className="rounded-xl border border-[var(--line-subtle)]/30 p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {monthName} {year}
          </span>
          <button
            onClick={handleViewAllClick}
            className="text-xs font-medium text-[var(--accent)] hover:underline"
          >
            View all
          </button>
        </div>

        {/* Today's Date Card */}
        <div className="flex items-center gap-3 rounded-lg bg-[var(--accent)]/10 p-3 ring-1 ring-[var(--accent)]/30">
          <div className="flex flex-col items-center justify-center min-w-[52px]">
            <span className="text-2xl font-bold text-[var(--accent)]">{dayNumber}</span>
            <span className="text-xs font-medium text-[var(--text-muted)]">{dayName}</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-[var(--text)]">
              {todayEvents.length === 0
                ? 'No events today'
                : `${todayEvents.length} ${todayEvents.length === 1 ? 'event' : 'events'} today`
              }
            </p>
            {todayEvents.length > 0 && todayEvents[0] && (
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                Next: {todayEvents[0].title} at {formatTime(todayEvents[0].start)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Events List */}
      {displayEvents.length > 0 ? (
        <div className="space-y-2">
          {displayEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-2 rounded-lg p-2 hover:bg-[var(--bg-elev)]/40 transition-colors"
            >
              <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${getEventColor(event.type)}`} />

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-[var(--text)] truncate">
                  {event.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatDateRelative(event.start)}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">•</span>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {formatTime(event.start)}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-3 w-3 text-[var(--text-muted)] flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Calendar className="h-8 w-8 text-[var(--text-muted)]/50 mb-2" />
          <p className="text-xs font-medium text-[var(--text-muted)]">No upcoming events</p>
          <p className="text-[10px] text-[var(--text-muted)]/70 mt-1">Your schedule is clear</p>
        </div>
      )}

      {/* Footer - View Full Calendar */}
      <button
        onClick={handleViewAllClick}
        className="flex items-center justify-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline pt-1"
      >
        View full calendar
        <ChevronRight className="h-3 w-3" />
      </button>
    </section>
  );
}
