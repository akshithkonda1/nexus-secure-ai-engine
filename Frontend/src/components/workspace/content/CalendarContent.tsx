/**
 * Calendar Content Component
 * Full-featured calendar with Month/Week/Day/Year views
 */

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import type { CalendarEvent } from '../../../types/workspace';

type ViewMode = 'day' | 'week' | 'month' | 'year';

type CalendarContentProps = {
  className?: string;
};

type CalendarDay = {
  day: number;
  isCurrentMonth: boolean;
  date: Date;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CalendarContent({ className }: CalendarContentProps) {
  const events = useWorkspace(state => state.calendarEvents);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Helper functions
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  // Get events for a month
  const getEventsForMonth = (year: number, month: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  };

  // Calculate calendar days for month view
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

  // Get week days for week view
  const weekDays = useMemo(() => {
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

  // Navigation
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day': newDate.setDate(currentDate.getDate() - 1); break;
      case 'week': newDate.setDate(currentDate.getDate() - 7); break;
      case 'month': newDate.setMonth(currentDate.getMonth() - 1); break;
      case 'year': newDate.setFullYear(currentDate.getFullYear() - 1); break;
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'day': newDate.setDate(currentDate.getDate() + 1); break;
      case 'week': newDate.setDate(currentDate.getDate() + 7); break;
      case 'month': newDate.setMonth(currentDate.getMonth() + 1); break;
      case 'year': newDate.setFullYear(currentDate.getFullYear() + 1); break;
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Get title based on view mode
  const getTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    switch (viewMode) {
      case 'day':
        return `${MONTH_NAMES[month]} ${currentDate.getDate()}, ${year}`;
      case 'week': {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${year}`;
        } else {
          return `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} - ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${year}`;
        }
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

  // Render event dots for a day in month view
  const renderEventDots = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const maxDots = 3;
    const displayEvents = dayEvents.slice(0, maxDots);
    const remainingCount = dayEvents.length - maxDots;

    if (dayEvents.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-0.5 mt-0.5">
        {displayEvents.map((event, idx) => (
          <div
            key={idx}
            className={`h-1.5 w-1.5 rounded-full ${getEventColor(event.type)}`}
          />
        ))}
        {remainingCount > 0 && (
          <span className="text-[8px] text-[var(--text-muted)]">+{remainingCount}</span>
        )}
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className="flex flex-col h-full">
        {/* Large Date Display */}
        <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-[var(--bg-elev)]/50">
          <div className="flex flex-col items-center justify-center w-20 h-20 rounded-xl bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]/50">
            <span className="text-3xl font-bold text-[var(--accent)]">{currentDate.getDate()}</span>
            <span className="text-xs font-medium text-[var(--text-muted)]">{DAY_NAMES_FULL[currentDate.getDay()]}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--text)]">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <p className="text-sm text-[var(--text-muted)]">
              {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
            </p>
          </div>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-[var(--text-muted)]/50 mb-3" />
              <p className="text-sm font-medium text-[var(--text-muted)]">No events today</p>
              <p className="text-xs text-[var(--text-muted)]/70 mt-1">Your schedule is clear</p>
            </div>
          ) : (
            dayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-elev)]/40 hover:bg-[var(--bg-elev)]/60 transition-colors"
              >
                <div className={`h-3 w-3 rounded-full mt-1 ${getEventColor(event.type)}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--text)] truncate">{event.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </span>
                  </div>
                  {event.attendees && event.attendees.length > 0 && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                    </p>
                  )}
                </div>
                <span className="text-xs font-medium text-[var(--text-muted)] capitalize px-2 py-0.5 rounded-full bg-[var(--bg-surface)]">
                  {event.type || 'event'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={`text-center py-2 rounded-lg ${
                isToday(day) ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]/50' : ''
              }`}
            >
              <p className="text-xs font-semibold text-[var(--text-muted)]">{DAY_NAMES[idx]}</p>
              <p className={`text-lg font-bold ${isToday(day) ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Week Events Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto">
          {weekDays.map((day, idx) => {
            const dayEvents = getEventsForDate(day);
            const maxVisible = 3;
            const visibleEvents = dayEvents.slice(0, maxVisible);
            const remainingCount = dayEvents.length - maxVisible;

            return (
              <div
                key={idx}
                className={`flex flex-col p-2 rounded-lg min-h-[120px] cursor-pointer hover:bg-[var(--bg-elev)]/40 transition-colors ${
                  isToday(day) ? 'bg-[var(--bg-elev)]/30' : 'bg-[var(--bg-surface)]/30'
                }`}
                onClick={() => handleDayClick(day)}
              >
                <div className="space-y-1 flex-1">
                  {visibleEvents.map((event, eventIdx) => (
                    <div
                      key={eventIdx}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate text-white ${getEventColor(event.type)}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <p className="text-[10px] text-[var(--text-muted)] px-1">+{remainingCount} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((day) => (
            <div key={day} className="text-center py-2">
              <span className="text-xs font-semibold text-[var(--text-muted)]">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {calendarDays.map((calDay, idx) => {
            const today = isToday(calDay.date);
            const isSelected = selectedDate && isSameDay(calDay.date, selectedDate);

            return (
              <div
                key={idx}
                className={`
                  relative flex flex-col items-center p-1 rounded-lg cursor-pointer transition-all
                  aspect-square min-h-[48px]
                  ${!calDay.isCurrentMonth ? 'opacity-40' : ''}
                  ${today ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]/50' : 'hover:bg-[var(--bg-elev)]'}
                  ${isSelected && !today ? 'bg-[var(--bg-elev)] ring-1 ring-[var(--line-subtle)]' : ''}
                `}
                onClick={() => handleDayClick(calDay.date)}
              >
                <span className={`
                  text-sm font-medium
                  ${today ? 'text-[var(--accent)] font-bold' : 'text-[var(--text)]'}
                  ${!calDay.isCurrentMonth ? 'text-[var(--text-muted)]' : ''}
                `}>
                  {calDay.day}
                </span>
                {renderEventDots(calDay.date)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Year View
  const renderYearView = () => {
    const year = currentDate.getFullYear();

    return (
      <div className="grid grid-cols-3 gap-4 h-full overflow-y-auto py-2">
        {MONTH_NAMES.map((monthName, monthIdx) => {
          const monthEvents = getEventsForMonth(year, monthIdx);
          const isCurrentMonth = new Date().getMonth() === monthIdx && new Date().getFullYear() === year;

          return (
            <div
              key={monthIdx}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all
                ${isCurrentMonth ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]/50' : 'bg-[var(--bg-elev)]/40 hover:bg-[var(--bg-elev)]/60'}
              `}
              onClick={() => handleMonthClick(monthIdx)}
            >
              <span className={`text-sm font-semibold ${isCurrentMonth ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                {monthName}
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-1">
                {monthEvents.length} {monthEvents.length === 1 ? 'event' : 'events'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render current view
  const renderView = () => {
    switch (viewMode) {
      case 'day': return renderDayView();
      case 'week': return renderWeekView();
      case 'month': return renderMonthView();
      case 'year': return renderYearView();
    }
  };

  // Count total events for footer
  const totalEvents = events.length;

  return (
    <div className={`flex flex-col h-full gap-3 ${className ?? ''}`}>
      {/* Header with Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrevious}
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-[var(--bg-elev)] transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4 text-[var(--text)]" />
          </button>

          <h2 className="min-w-[200px] text-center text-base font-semibold text-[var(--text)]">
            {getTitle()}
          </h2>

          <button
            onClick={navigateNext}
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-[var(--bg-elev)] transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4 text-[var(--text)]" />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Today
        </button>
      </div>

      {/* View Mode Selector */}
      <div className="flex gap-1 rounded-lg bg-[var(--bg-elev)]/50 p-1 w-fit">
        {(['day', 'week', 'month', 'year'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all
              ${viewMode === mode
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-surface)]'
              }
            `}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-hidden">
        {renderView()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--line-subtle)]/20">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">
            {totalEvents} {totalEvents === 1 ? 'event' : 'events'} total
          </span>
        </div>
        <span className="rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--text-muted)]">
          Synced
        </span>
      </div>
    </div>
  );
}
