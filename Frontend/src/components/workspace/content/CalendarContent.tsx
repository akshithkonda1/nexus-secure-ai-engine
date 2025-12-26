/**
 * Calendar Content Component
 * Full-featured calendar with Day/Week/Month/Year views
 */

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus, Settings } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import type { CalendarEvent } from '../../../types/workspace';

type ViewMode = 'day' | 'week' | 'month' | 'year';

type CalendarDay = {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
};

type CalendarContentProps = {
  className?: string;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CalendarContent({ className }: CalendarContentProps) {
  const events = useWorkspace(state => state.calendarEvents);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Helper: Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Helper: Check if date is today
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
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

  // Helper: Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Helper: Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, tomorrow)) return 'Tomorrow';

    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(new Date(event.start), date));
  };

  // Get events for a specific month
  const getEventsForMonth = (year: number, month: number): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  };

  // Generate calendar grid for month view (42 days)
  const calendarDays = useMemo((): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Previous month trailing days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month leading days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  }, [currentDate]);

  // Generate week days for week view
  const weekDays = useMemo((): Date[] => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  }, [currentDate]);

  // Navigation functions
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(currentDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get header title based on view mode
  const getHeaderTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    switch (viewMode) {
      case 'day':
        return `${MONTH_NAMES[month]} ${currentDate.getDate()}, ${year}`;
      case 'week': {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${MONTH_NAMES[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${year}`;
        }
        return `${MONTH_NAMES_SHORT[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${MONTH_NAMES_SHORT[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${year}`;
      }
      case 'month':
        return `${MONTH_NAMES[month]} ${year}`;
      case 'year':
        return `${year}`;
    }
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    setViewMode('day');
  };

  // Handle month click in year view
  const handleMonthClick = (month: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month);
    setCurrentDate(newDate);
    setViewMode('month');
  };

  // Count total events
  const totalEvents = events.length;

  // Render Month View
  const renderMonthView = () => (
    <div className="flex flex-col gap-1">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_NAMES.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-[var(--text-muted)]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((calDay, index) => {
          const dayEvents = getEventsForDate(calDay.date);
          const today = isToday(calDay.date);
          const selected = selectedDate && isSameDay(calDay.date, selectedDate);

          return (
            <button
              key={index}
              onClick={() => handleDayClick(calDay.date)}
              className={`
                relative flex aspect-square flex-col items-center justify-start rounded-lg p-1 transition-all
                ${calDay.isCurrentMonth ? 'text-[var(--text)]' : 'text-[var(--text-muted)] opacity-40'}
                ${today ? 'ring-2 ring-[var(--accent)]/50 bg-[var(--accent)]/20' : ''}
                ${selected && !today ? 'bg-[var(--bg-elev)] ring-1 ring-[var(--line-subtle)]' : ''}
                hover:bg-[var(--bg-elev)]
              `}
            >
              <span className={`text-sm font-medium ${today ? 'text-[var(--accent)]' : ''}`}>
                {calDay.day}
              </span>

              {/* Event Dots */}
              {dayEvents.length > 0 && (
                <div className="mt-auto flex items-center gap-0.5">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-1.5 rounded-full ${getEventColor(event.type)}`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="ml-0.5 text-[8px] text-[var(--text-muted)]">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Render Day View
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return (
      <div className="flex flex-col gap-4">
        {/* Large Date Display */}
        <div className="flex items-center gap-4 rounded-xl bg-[var(--bg-elev)] p-4">
          <div className={`flex h-20 w-20 flex-col items-center justify-center rounded-xl ${isToday(currentDate) ? 'bg-[var(--accent)] text-white' : 'bg-[var(--layer-muted)]'}`}>
            <span className="text-3xl font-bold">{currentDate.getDate()}</span>
            <span className="text-xs font-medium opacity-80">
              {DAY_NAMES[currentDate.getDay()]}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--text)]">
              {DAY_NAMES_FULL[currentDate.getDay()]}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getDate()}, {currentDate.getFullYear()}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
            </p>
          </div>
        </div>

        {/* Events List */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="mb-3 h-12 w-12 text-[var(--text-muted)] opacity-50" />
              <p className="text-sm font-medium text-[var(--text-muted)]">No events today</p>
              <p className="mt-1 text-xs text-[var(--text-muted)] opacity-75">Your schedule is clear</p>
            </div>
          ) : (
            dayEvents.map(event => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-xl bg-[var(--layer-muted)]/80 p-3 transition-colors hover:bg-[var(--layer-muted)]"
              >
                <div className={`mt-1 h-3 w-3 rounded-full ${getEventColor(event.type)}`} />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-[var(--text)]">{event.title}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </span>
                  </div>
                  {event.attendees && event.attendees.length > 0 && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => (
    <div className="flex flex-col gap-2">
      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const today = isToday(date);

          return (
            <div
              key={index}
              className={`flex flex-col rounded-lg border p-2 ${
                today
                  ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10'
                  : 'border-[var(--line-subtle)] bg-[var(--bg-elev)]/50'
              }`}
            >
              {/* Day Header */}
              <div className="mb-2 text-center">
                <div className="text-xs font-medium text-[var(--text-muted)]">
                  {DAY_NAMES[date.getDay()]}
                </div>
                <div className={`text-lg font-bold ${today ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                  {date.getDate()}
                </div>
              </div>

              {/* Events */}
              <div className="flex-1 space-y-1 overflow-y-auto">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="rounded bg-[var(--layer-muted)] p-1.5"
                  >
                    <div className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${getEventColor(event.type)}`} />
                      <span className="truncate text-[10px] font-medium text-[var(--text)]">
                        {event.title}
                      </span>
                    </div>
                    <span className="text-[9px] text-[var(--text-muted)]">
                      {formatTime(event.start)}
                    </span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <button
                    onClick={() => handleDayClick(date)}
                    className="w-full rounded bg-[var(--layer-muted)]/50 py-0.5 text-[10px] text-[var(--text-muted)] hover:bg-[var(--layer-muted)]"
                  >
                    +{dayEvents.length - 3} more
                  </button>
                )}
                {dayEvents.length === 0 && (
                  <p className="py-2 text-center text-[10px] text-[var(--text-muted)] opacity-50">
                    No events
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Year View
  const renderYearView = () => {
    const year = currentDate.getFullYear();

    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {MONTH_NAMES.map((monthName, monthIndex) => {
          const monthEvents = getEventsForMonth(year, monthIndex);
          const isCurrentMonth = new Date().getMonth() === monthIndex && new Date().getFullYear() === year;

          return (
            <button
              key={monthIndex}
              onClick={() => handleMonthClick(monthIndex)}
              className={`flex flex-col items-center rounded-xl p-4 transition-all hover:bg-[var(--bg-elev)] ${
                isCurrentMonth
                  ? 'ring-2 ring-[var(--accent)]/50 bg-[var(--accent)]/10'
                  : 'bg-[var(--layer-muted)]/50'
              }`}
            >
              <span className={`text-sm font-semibold ${isCurrentMonth ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                {monthName.slice(0, 3)}
              </span>
              <span className="mt-1 text-xs text-[var(--text-muted)]">
                {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
              </span>

              {/* Mini event indicator */}
              {monthEvents.length > 0 && (
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: Math.min(monthEvents.length, 5) }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-1 rounded-full ${getEventColor(monthEvents[i]?.type)}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex h-full flex-col gap-4 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrevious}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-elev)] text-[var(--text-muted)] transition-colors hover:bg-[var(--layer-muted)] hover:text-[var(--text)]"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <h2 className="min-w-[180px] text-center text-lg font-semibold text-[var(--text)]">
            {getHeaderTitle()}
          </h2>

          <button
            onClick={navigateNext}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--bg-elev)] text-[var(--text-muted)] transition-colors hover:bg-[var(--layer-muted)] hover:text-[var(--text)]"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={goToToday}
            className="ml-2 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--accent)]/90"
          >
            Today
          </button>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-1 rounded-lg bg-[var(--bg-elev)] p-1">
          {(['day', 'week', 'month', 'year'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'year' && renderYearView()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--line-subtle)] pt-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">
            {totalEvents} {totalEvents === 1 ? 'event' : 'events'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
            aria-label="Add event"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
