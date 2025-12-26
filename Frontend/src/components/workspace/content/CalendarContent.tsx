/**
 * Calendar Content Component
 * Full-featured calendar with Month/Week/Day/Year views and complete CRUD operations
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  X,
  MapPin,
  Users,
  Bell,
  Repeat,
  FileText,
  Trash2,
  Settings,
} from 'lucide-react';
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

type EventFormData = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'meeting' | 'work' | 'personal' | 'family';
  location: string;
  description: string;
  attendees: string;
  reminder: string;
  recurring: boolean;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const INITIAL_FORM_DATA: EventFormData = {
  title: '',
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  type: 'work',
  location: '',
  description: '',
  attendees: '',
  reminder: '15',
  recurring: false,
};

export default function CalendarContent({ className }: CalendarContentProps) {
  // Store connections
  const events = useWorkspace(state => state.calendarEvents);
  const addCalendarEvent = useWorkspace(state => state.addCalendarEvent);
  const updateCalendarEvent = useWorkspace(state => state.updateCalendarEvent);
  const deleteCalendarEvent = useWorkspace(state => state.deleteCalendarEvent);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>(INITIAL_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

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

  const getEventColorBorder = (type?: string) => {
    switch (type) {
      case 'meeting': return 'border-purple-500';
      case 'work': return 'border-blue-500';
      case 'personal': return 'border-green-500';
      case 'family': return 'border-orange-500';
      default: return 'border-indigo-500';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (date: Date): string => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // ============================================================
  // EVENT FILTERING
  // ============================================================

  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events]);

  const getEventsForMonth = useCallback((year: number, month: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  }, [events]);

  // ============================================================
  // CALENDAR CALCULATIONS
  // ============================================================

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

    // Next month leading days (to reach 42 days = 6 weeks)
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

  // ============================================================
  // NAVIGATION
  // ============================================================

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

  // ============================================================
  // EVENT FORM HANDLERS
  // ============================================================

  const openNewEventForm = (date?: Date) => {
    const targetDate = date || currentDate;
    setFormData({
      ...INITIAL_FORM_DATA,
      date: formatDateForInput(targetDate),
    });
    setEditingEventId(null);
    setFormError(null);
    setShowEventForm(true);
  };

  const openEditEventForm = (event: CalendarEvent) => {
    setFormData({
      title: event.title,
      date: formatDateForInput(new Date(event.start)),
      startTime: formatTimeForInput(new Date(event.start)),
      endTime: formatTimeForInput(new Date(event.end)),
      type: (event.type as EventFormData['type']) || 'work',
      location: event.location || '',
      description: event.description || '',
      attendees: event.attendees?.join(', ') || '',
      reminder: String(event.reminder || 15),
      recurring: event.recurring || false,
    });
    setEditingEventId(event.id);
    setFormError(null);
    setShowEventForm(true);
  };

  const closeEventForm = () => {
    setShowEventForm(false);
    setEditingEventId(null);
    setFormData(INITIAL_FORM_DATA);
    setFormError(null);
  };

  const handleFormChange = (field: keyof EventFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setFormError('Event title is required');
      return;
    }

    if (!formData.date) {
      setFormError('Date is required');
      return;
    }

    if (formData.endTime <= formData.startTime) {
      setFormError('End time must be after start time');
      return;
    }

    // Create Date objects
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    // Prepare event data
    const eventData = {
      title: formData.title.trim(),
      start: startDateTime,
      end: endDateTime,
      type: formData.type,
      location: formData.location.trim() || undefined,
      description: formData.description.trim() || undefined,
      attendees: formData.attendees
        ? formData.attendees.split(',').map(a => a.trim()).filter(Boolean)
        : undefined,
      reminder: parseInt(formData.reminder) || undefined,
      recurring: formData.recurring,
    };

    if (editingEventId) {
      updateCalendarEvent(editingEventId, eventData);
    } else {
      addCalendarEvent(eventData);
    }

    closeEventForm();
  };

  const handleDeleteEvent = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteCalendarEvent(eventId);
      if (editingEventId === eventId) {
        closeEventForm();
      }
    }
  };

  // Keyboard shortcut for ESC to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEventForm) {
        closeEventForm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEventForm]);

  // ============================================================
  // DAY CLICK HANDLERS
  // ============================================================

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
    setViewMode('day');
  };

  const handleMonthClick = (month: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month);
    setCurrentDate(newDate);
    setViewMode('month');
  };

  // ============================================================
  // RENDER EVENT DOTS
  // ============================================================

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

  // ============================================================
  // VIEW RENDERERS
  // ============================================================

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
          <button
            onClick={() => openNewEventForm(currentDate)}
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-[var(--text-muted)]/50 mb-3" />
              <p className="text-sm font-medium text-[var(--text-muted)]">No events today</p>
              <p className="text-xs text-[var(--text-muted)]/70 mt-1">Your schedule is clear</p>
              <button
                onClick={() => openNewEventForm(currentDate)}
                className="mt-4 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Create an event
              </button>
            </div>
          ) : (
            dayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => openEditEventForm(event)}
                className={`flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-elev)]/40 hover:bg-[var(--bg-elev)]/60 transition-colors cursor-pointer border-l-4 ${getEventColorBorder(event.type)}`}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[var(--text)] truncate">{event.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3 w-3 text-[var(--text-muted)]" />
                      <span className="text-xs text-[var(--text-muted)] truncate">{event.location}</span>
                    </div>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="h-3 w-3 text-[var(--text-muted)]" />
                      <span className="text-xs text-[var(--text-muted)]">
                        {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--text-muted)] capitalize px-2 py-0.5 rounded-full bg-[var(--bg-surface)]">
                    {event.type || 'event'}
                  </span>
                  <button
                    onClick={(e) => handleDeleteEvent(event.id, e)}
                    className="p-1 rounded hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                    title="Delete event"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

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
                      onClick={(e) => { e.stopPropagation(); openEditEventForm(event); }}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate text-white cursor-pointer hover:opacity-80 ${getEventColor(event.type)}`}
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

  const renderView = () => {
    switch (viewMode) {
      case 'day': return renderDayView();
      case 'week': return renderWeekView();
      case 'month': return renderMonthView();
      case 'year': return renderYearView();
    }
  };

  // ============================================================
  // EVENT FORM MODAL
  // ============================================================

  const renderEventForm = () => {
    if (!showEventForm) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) closeEventForm(); }}
      >
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--bg-surface)] border border-[var(--line-subtle)] shadow-2xl">
          {/* Form Header */}
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[var(--line-subtle)] bg-[var(--bg-surface)]">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              {editingEventId ? 'Edit Event' : 'Add Event'}
            </h2>
            <button
              onClick={closeEventForm}
              className="p-1 rounded-lg hover:bg-[var(--bg-elev)] transition-colors"
            >
              <X className="h-5 w-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
            {/* Error Message */}
            {formError && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-sm text-red-400">
                {formError}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text)]">
                Event Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Team Meeting"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleFormChange('date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                  Start Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleFormChange('startTime', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                  End Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleFormChange('endTime', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            </div>

            {/* Event Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text)]">Event Type</label>
              <div className="flex flex-wrap gap-2">
                {(['meeting', 'work', 'personal', 'family'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleFormChange('type', type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                      formData.type === type
                        ? `${getEventColor(type)} text-white`
                        : 'bg-[var(--bg-elev)] text-[var(--text-muted)] hover:bg-[var(--bg-elev)]/80'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="Conference Room A"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--text-muted)]" />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Add event details..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
              />
            </div>

            {/* Attendees */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--text-muted)]" />
                Attendees
              </label>
              <input
                type="text"
                value={formData.attendees}
                onChange={(e) => handleFormChange('attendees', e.target.value)}
                placeholder="john@example.com, jane@example.com"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              <p className="text-xs text-[var(--text-muted)]">Separate multiple emails with commas</p>
            </div>

            {/* Reminder */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Bell className="h-4 w-4 text-[var(--text-muted)]" />
                Reminder
              </label>
              <select
                value={formData.reminder}
                onChange={(e) => handleFormChange('reminder', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="5">5 minutes before</option>
                <option value="10">10 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>

            {/* Recurring */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) => handleFormChange('recurring', e.target.checked)}
                className="w-4 h-4 rounded border-[var(--line-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Repeat className="h-4 w-4 text-[var(--text-muted)]" />
                Recurring event
              </span>
            </label>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--line-subtle)]">
              <div>
                {editingEventId && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(editingEventId)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeEventForm}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-elev)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                >
                  {editingEventId ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => openNewEventForm()}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[var(--bg-elev)] transition-colors text-[var(--accent)]"
            title="Add event"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 rounded-lg hover:bg-[var(--bg-elev)] transition-colors text-[var(--text-muted)]"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Event Form Modal */}
      {renderEventForm()}
    </div>
  );
}
