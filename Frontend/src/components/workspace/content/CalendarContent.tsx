/**
 * Calendar Content Component
 * Full-featured calendar with Month/Week/Day/Year views, CRUD operations,
 * holiday intelligence, and contextual awareness
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
  Sparkles,
  Gift,
  Star,
  Plane,
  Info,
  Cake,
  Zap,
  AlertTriangle,
  Copy,
  Sun,
  Moon,
  Globe,
  Layout,
  Lightbulb,
  Check,
} from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';
import type { CalendarEvent, Holiday, ExtendedWeekend, RecurrencePattern, EventTemplate } from '../../../types/workspace';
import {
  getHolidaysForDate,
  getHolidaysForMonth,
  isFederalHoliday,
  getExtendedWeekends,
  getUpcomingExtendedWeekends,
  getDateContext,
  getTripPlanningContext,
  getPersonalHolidays,
} from '../../../services/calendar/holidays';
import { parseEventString, formatParsedEvent, type ParsedEvent } from '../../../services/calendar/eventParser';
import {
  detectConflicts,
  generateSmartSuggestions,
  DEFAULT_TEMPLATES,
  createEventFromTemplate,
  formatRecurrence,
  type EventConflict,
  type SmartSuggestion,
} from '../../../services/calendar/eventIntelligence';
import CalendarSyncSettings from './CalendarSyncSettings';

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
  isAllDay: boolean;
  timezone: string;
  recurrenceFrequency: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceInterval: number;
  recurrenceDays: number[];
  recurrenceEndType: 'never' | 'date' | 'count';
  recurrenceEndDate: string;
  recurrenceCount: number;
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Common timezones for quick selection
const COMMON_TIMEZONES = [
  { value: 'local', label: 'Local Time' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (no DST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' },
];

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
  isAllDay: false,
  timezone: 'local',
  recurrenceFrequency: 'none',
  recurrenceInterval: 1,
  recurrenceDays: [],
  recurrenceEndType: 'never',
  recurrenceEndDate: '',
  recurrenceCount: 10,
};

export default function CalendarContent({ className }: CalendarContentProps) {
  // Store connections
  const events = useWorkspace(state => state.calendarEvents);
  const addCalendarEvent = useWorkspace(state => state.addCalendarEvent);
  const updateCalendarEvent = useWorkspace(state => state.updateCalendarEvent);
  const deleteCalendarEvent = useWorkspace(state => state.deleteCalendarEvent);
  const personalDates = useWorkspace(state => state.personalDates);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>(INITIAL_FORM_DATA);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick add state
  const [quickAddInput, setQuickAddInput] = useState('');
  const [parsedEvent, setParsedEvent] = useState<ParsedEvent | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Templates state
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);

  // Conflict detection state
  const [currentConflicts, setCurrentConflicts] = useState<EventConflict[]>([]);

  // Smart suggestions state
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);

  // Sync settings state
  const [showSyncSettings, setShowSyncSettings] = useState(false);

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
  // HOLIDAY INTELLIGENCE
  // ============================================================

  // Get holidays for current month
  const monthHolidays = useMemo(() => {
    return getHolidaysForMonth(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Get personal holidays for current year
  const personalHolidays = useMemo(() => {
    return getPersonalHolidays(personalDates, currentDate.getFullYear());
  }, [personalDates, currentDate]);

  // Get extended weekends for current month
  const extendedWeekends = useMemo(() => {
    return getExtendedWeekends(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Get upcoming extended weekends (next 3 months)
  const upcomingExtendedWeekends = useMemo(() => {
    return getUpcomingExtendedWeekends(new Date(), 3);
  }, []);

  // Get context for selected date
  const selectedDateContext = useMemo(() => {
    if (!selectedDate) return null;
    return getDateContext(selectedDate, personalDates);
  }, [selectedDate, personalDates]);

  // Helper to check if date is part of extended weekend
  const isPartOfExtendedWeekend = useCallback((date: Date): ExtendedWeekend | null => {
    for (const ew of extendedWeekends) {
      if (date >= ew.startDate && date <= ew.endDate) {
        return ew;
      }
    }
    return null;
  }, [extendedWeekends]);

  // Get all holidays for a specific date (including personal)
  const getAllHolidaysForDate = useCallback((date: Date): Holiday[] => {
    const holidays = getHolidaysForDate(date);
    const personal = personalHolidays.filter(h =>
      h.date.getMonth() === date.getMonth() && h.date.getDate() === date.getDate()
    );
    return [...holidays, ...personal];
  }, [personalHolidays]);

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
      isAllDay: event.isAllDay || false,
      timezone: event.timezone || 'local',
      recurrenceFrequency: event.recurrence?.frequency || 'none',
      recurrenceInterval: event.recurrence?.interval || 1,
      recurrenceDays: event.recurrence?.daysOfWeek || [],
      recurrenceEndType: event.recurrence?.endDate ? 'date' :
                         event.recurrence?.occurrences ? 'count' : 'never',
      recurrenceEndDate: event.recurrence?.endDate ?
                         formatDateForInput(new Date(event.recurrence.endDate)) : '',
      recurrenceCount: event.recurrence?.occurrences || 10,
    });
    setEditingEventId(event.id);
    setFormError(null);
    setCurrentConflicts([]);
    setSmartSuggestions([]);
    setShowEventForm(true);
  };

  // ============================================================
  // QUICK ADD HANDLERS
  // ============================================================

  const handleQuickAddChange = (value: string) => {
    setQuickAddInput(value);
    if (value.trim().length >= 3) {
      const parsed = parseEventString(value);
      setParsedEvent(parsed);
    } else {
      setParsedEvent(null);
    }
  };

  const handleQuickAddSubmit = () => {
    if (!parsedEvent) return;

    const startDateTime = new Date(parsedEvent.date);
    startDateTime.setHours(parsedEvent.startTime.hour, parsedEvent.startTime.minute);

    const endDateTime = new Date(parsedEvent.date);
    endDateTime.setHours(parsedEvent.endTime.hour, parsedEvent.endTime.minute);

    addCalendarEvent({
      title: parsedEvent.title,
      start: startDateTime,
      end: endDateTime,
      type: parsedEvent.type,
      location: parsedEvent.location,
      attendees: parsedEvent.attendees,
      isAllDay: parsedEvent.isAllDay,
    });

    setQuickAddInput('');
    setParsedEvent(null);
    setShowQuickAdd(false);
  };

  const handleQuickAddEdit = () => {
    if (!parsedEvent) return;

    // Pre-fill the form with parsed data
    const dateStr = formatDateForInput(parsedEvent.date);
    const startTime = `${String(parsedEvent.startTime.hour).padStart(2, '0')}:${String(parsedEvent.startTime.minute).padStart(2, '0')}`;
    const endTime = `${String(parsedEvent.endTime.hour).padStart(2, '0')}:${String(parsedEvent.endTime.minute).padStart(2, '0')}`;

    setFormData({
      ...INITIAL_FORM_DATA,
      title: parsedEvent.title,
      date: dateStr,
      startTime,
      endTime,
      type: parsedEvent.type || 'work',
      location: parsedEvent.location || '',
      attendees: parsedEvent.attendees?.join(', ') || '',
      isAllDay: parsedEvent.isAllDay || false,
    });

    setQuickAddInput('');
    setParsedEvent(null);
    setShowQuickAdd(false);
    setShowEventForm(true);
  };

  // ============================================================
  // TEMPLATE HANDLERS
  // ============================================================

  const handleTemplateSelect = (template: EventTemplate) => {
    const eventData = createEventFromTemplate(template, currentDate);

    setFormData({
      ...INITIAL_FORM_DATA,
      title: eventData.title,
      date: formatDateForInput(eventData.start),
      startTime: formatTimeForInput(eventData.start),
      endTime: formatTimeForInput(eventData.end),
      type: eventData.type || 'work',
      location: eventData.location || '',
      description: eventData.description || '',
      attendees: eventData.attendees?.join(', ') || '',
      recurring: eventData.recurring || false,
      recurrenceFrequency: eventData.recurrence?.frequency || 'none',
      recurrenceInterval: eventData.recurrence?.interval || 1,
      recurrenceDays: eventData.recurrence?.daysOfWeek || [],
    });

    setSelectedTemplate(template);
    setShowTemplates(false);
    setShowEventForm(true);
  };

  // ============================================================
  // CONFLICT DETECTION
  // ============================================================

  // Check for conflicts when form data changes
  useEffect(() => {
    if (!showEventForm || !formData.date || !formData.startTime || !formData.endTime) {
      setCurrentConflicts([]);
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setCurrentConflicts([]);
      return;
    }

    const conflicts = detectConflicts(
      { start: startDateTime, end: endDateTime, location: formData.location },
      events,
      { ignoreEventId: editingEventId || undefined, travelTimeMinutes: 15 }
    );

    setCurrentConflicts(conflicts);
  }, [formData.date, formData.startTime, formData.endTime, formData.location, showEventForm, events, editingEventId]);

  // Generate smart suggestions when form is opened
  useEffect(() => {
    if (!showEventForm || !formData.title) {
      setSmartSuggestions([]);
      return;
    }

    const suggestions = generateSmartSuggestions(
      { title: formData.title, type: formData.type },
      events,
      { maxSuggestions: 3 }
    );

    setSmartSuggestions(suggestions);
  }, [formData.title, formData.type, showEventForm, events]);

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

    if (!formData.isAllDay && formData.endTime <= formData.startTime) {
      setFormError('End time must be after start time');
      return;
    }

    // Create Date objects
    let startDateTime: Date;
    let endDateTime: Date;

    if (formData.isAllDay) {
      startDateTime = new Date(`${formData.date}T00:00:00`);
      endDateTime = new Date(`${formData.date}T23:59:59`);
    } else {
      startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    }

    // Build recurrence pattern if recurring
    let recurrence: RecurrencePattern | undefined;
    if (formData.recurrenceFrequency !== 'none') {
      recurrence = {
        frequency: formData.recurrenceFrequency,
        interval: formData.recurrenceInterval,
        daysOfWeek: formData.recurrenceDays.length > 0 ? formData.recurrenceDays : undefined,
        endDate: formData.recurrenceEndType === 'date' && formData.recurrenceEndDate
          ? new Date(formData.recurrenceEndDate)
          : undefined,
        occurrences: formData.recurrenceEndType === 'count'
          ? formData.recurrenceCount
          : undefined,
      };
    }

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
      recurring: formData.recurrenceFrequency !== 'none',
      recurrence,
      isAllDay: formData.isAllDay,
      timezone: formData.timezone !== 'local' ? formData.timezone : undefined,
      templateId: selectedTemplate?.id,
    };

    if (editingEventId) {
      updateCalendarEvent(editingEventId, eventData);
    } else {
      addCalendarEvent(eventData);
    }

    setSelectedTemplate(null);
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
  // RENDER EVENT & HOLIDAY INDICATORS
  // ============================================================

  const renderEventDots = (date: Date) => {
    const dayEvents = getEventsForDate(date);
    const holidays = getAllHolidaysForDate(date);
    const extWeekend = isPartOfExtendedWeekend(date);
    const maxDots = 3;
    const displayEvents = dayEvents.slice(0, maxDots);
    const remainingCount = dayEvents.length - maxDots;

    const hasHoliday = holidays.length > 0;
    const hasFederalHoliday = holidays.some(h => h.category === 'federal');
    const hasPersonalDate = holidays.some(h => h.category === 'personal');

    if (dayEvents.length === 0 && !hasHoliday && !extWeekend) return null;

    return (
      <div className="flex flex-wrap items-center justify-center gap-0.5 mt-0.5">
        {/* Holiday indicator */}
        {hasFederalHoliday && (
          <span className="text-[10px]" title={holidays.find(h => h.category === 'federal')?.name}>
            {holidays.find(h => h.category === 'federal')?.emoji || '🎉'}
          </span>
        )}
        {hasPersonalDate && !hasFederalHoliday && (
          <span className="text-[10px]" title={holidays.find(h => h.category === 'personal')?.name}>
            {holidays.find(h => h.category === 'personal')?.emoji || '🎂'}
          </span>
        )}
        {/* Extended weekend indicator */}
        {extWeekend && !hasFederalHoliday && (
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Extended weekend" />
        )}
        {/* Event dots */}
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

  // Render contextual suggestions panel
  const renderContextPanel = () => {
    if (!showContextPanel || upcomingExtendedWeekends.length === 0) return null;

    return (
      <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-[var(--text)]">Trip Opportunities</span>
          <button
            onClick={() => setShowContextPanel(false)}
            className="ml-auto p-1 rounded hover:bg-[var(--bg-elev)] transition-colors"
          >
            <X className="h-3 w-3 text-[var(--text-muted)]" />
          </button>
        </div>
        <div className="space-y-2">
          {upcomingExtendedWeekends.slice(0, 2).map((ew, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <Plane className="h-3 w-3 text-amber-500" />
              <span>
                <span className="font-medium text-[var(--text)]">{ew.holidays[0]?.name}</span>
                {' - '}
                {ew.totalDays}-day weekend ({ew.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================
  // VIEW RENDERERS
  // ============================================================

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    const dayHolidays = getAllHolidaysForDate(currentDate);
    const dateContext = getDateContext(currentDate, personalDates);
    const extWeekend = isPartOfExtendedWeekend(currentDate);

    return (
      <div className="flex flex-col h-full">
        {/* Large Date Display */}
        <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-[var(--bg-elev)]/50">
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl ring-2 ${
            dayHolidays.some(h => h.category === 'federal')
              ? 'bg-amber-500/20 ring-amber-500/50'
              : 'bg-[var(--accent)]/20 ring-[var(--accent)]/50'
          }`}>
            <span className={`text-3xl font-bold ${
              dayHolidays.some(h => h.category === 'federal') ? 'text-amber-500' : 'text-[var(--accent)]'
            }`}>{currentDate.getDate()}</span>
            <span className="text-xs font-medium text-[var(--text-muted)]">{DAY_NAMES_FULL[currentDate.getDay()]}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--text)]">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            {dayHolidays.length > 0 ? (
              <div className="flex items-center gap-1.5 mt-1">
                {dayHolidays.map((h, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-400">
                    {h.emoji} {h.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'} scheduled
              </p>
            )}
          </div>
          <button
            onClick={() => openNewEventForm(currentDate)}
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>

        {/* Holiday/Context Info */}
        {(dayHolidays.length > 0 || extWeekend) && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            {dayHolidays.map((holiday, idx) => (
              <div key={idx} className="flex items-start gap-2 mb-2 last:mb-0">
                <span className="text-lg">{holiday.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{holiday.name}</p>
                  {holiday.description && (
                    <p className="text-xs text-[var(--text-muted)]">{holiday.description}</p>
                  )}
                  {holiday.isWorkOff && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600 dark:text-green-400">
                      <Star className="h-3 w-3" /> Day off for most
                    </span>
                  )}
                </div>
              </div>
            ))}
            {extWeekend && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-500/20">
                <Plane className="h-4 w-4 text-amber-500" />
                <p className="text-xs text-[var(--text-muted)]">
                  Part of a <span className="font-medium text-[var(--text)]">{extWeekend.totalDays}-day weekend</span> - {extWeekend.suggestion}
                </p>
              </div>
            )}
          </div>
        )}

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
            const dayHolidays = getAllHolidaysForDate(calDay.date);
            const hasFederalHoliday = dayHolidays.some(h => h.category === 'federal');
            const extWeekend = isPartOfExtendedWeekend(calDay.date);

            return (
              <div
                key={idx}
                className={`
                  relative flex flex-col items-center p-1 rounded-lg cursor-pointer transition-all
                  aspect-square min-h-[48px]
                  ${!calDay.isCurrentMonth ? 'opacity-40' : ''}
                  ${today ? 'bg-[var(--accent)]/20 ring-2 ring-[var(--accent)]/50' : ''}
                  ${hasFederalHoliday && !today ? 'bg-amber-500/15 ring-1 ring-amber-500/30' : ''}
                  ${extWeekend && !hasFederalHoliday && !today ? 'bg-amber-500/5' : ''}
                  ${!today && !hasFederalHoliday && !extWeekend ? 'hover:bg-[var(--bg-elev)]' : ''}
                  ${isSelected && !today ? 'ring-2 ring-[var(--accent)]' : ''}
                `}
                onClick={() => handleDayClick(calDay.date)}
                title={dayHolidays.length > 0 ? dayHolidays.map(h => h.name).join(', ') : undefined}
              >
                <span className={`
                  text-sm font-medium
                  ${today ? 'text-[var(--accent)] font-bold' : ''}
                  ${hasFederalHoliday && !today ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}
                  ${!today && !hasFederalHoliday ? 'text-[var(--text)]' : ''}
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
          const monthHols = getHolidaysForMonth(year, monthIdx);
          const federalHolidayCount = monthHols.filter(h => h.category === 'federal').length;
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
              {federalHolidayCount > 0 && (
                <span className="text-[10px] text-amber-500 mt-0.5 flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5" />
                  {federalHolidayCount} {federalHolidayCount === 1 ? 'holiday' : 'holidays'}
                </span>
              )}
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
  // QUICK ADD BAR
  // ============================================================

  const renderQuickAdd = () => {
    if (!showQuickAdd) return null;

    return (
      <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-[var(--accent)]/10 to-purple-500/10 border border-[var(--accent)]/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--text)]">Quick Add</span>
          <button
            onClick={() => { setShowQuickAdd(false); setQuickAddInput(''); setParsedEvent(null); }}
            className="ml-auto p-1 rounded hover:bg-[var(--bg-elev)] transition-colors"
          >
            <X className="h-3 w-3 text-[var(--text-muted)]" />
          </button>
        </div>

        <input
          type="text"
          value={quickAddInput}
          onChange={(e) => handleQuickAddChange(e.target.value)}
          placeholder='Try "Team meeting tomorrow 2pm" or "Lunch with John next Friday"'
          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && parsedEvent) {
              e.preventDefault();
              handleQuickAddSubmit();
            }
          }}
        />

        {/* Parsed Preview */}
        {parsedEvent && (
          <div className="mt-2 p-2 rounded-lg bg-[var(--bg-elev)]/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text)]">{parsedEvent.title}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {parsedEvent.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {!parsedEvent.isAllDay && (
                    <> at {parsedEvent.startTime.hour % 12 || 12}:{String(parsedEvent.startTime.minute).padStart(2, '0')} {parsedEvent.startTime.hour < 12 ? 'AM' : 'PM'}</>
                  )}
                  {parsedEvent.isAllDay && ' (all day)'}
                </p>
                {parsedEvent.suggestions && parsedEvent.suggestions.length > 0 && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    Tip: {parsedEvent.suggestions[0]}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-[var(--bg-surface)]">
                  {Math.round(parsedEvent.confidence * 100)}% confident
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleQuickAddSubmit}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
              >
                <Check className="h-3 w-3" />
                Create Event
              </button>
              <button
                onClick={handleQuickAddEdit}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                Edit Details
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // TEMPLATES PANEL
  // ============================================================

  const renderTemplates = () => {
    if (!showTemplates) return null;

    return (
      <div className="mb-3 p-3 rounded-xl bg-[var(--bg-elev)]/50 border border-[var(--line-subtle)]">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--text)]">Event Templates</span>
          <button
            onClick={() => setShowTemplates(false)}
            className="ml-auto p-1 rounded hover:bg-[var(--bg-surface)] transition-colors"
          >
            <X className="h-3 w-3 text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DEFAULT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="flex flex-col items-start p-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)]/80 transition-colors text-left"
            >
              <span className="text-xs font-medium text-[var(--text)]">{template.name}</span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {template.duration} min • {template.type}
                {template.recurrence && ' • Recurring'}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================
  // EVENT FORM MODAL
  // ============================================================

  const renderEventForm = () => {
    if (!showEventForm) return null;

    const handleRecurrenceDayToggle = (day: number) => {
      const newDays = formData.recurrenceDays.includes(day)
        ? formData.recurrenceDays.filter(d => d !== day)
        : [...formData.recurrenceDays, day];
      handleFormChange('recurrenceDays', newDays as unknown as string);
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) closeEventForm(); }}
      >
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--bg-surface)] border border-[var(--line-subtle)] shadow-2xl">
          {/* Form Header */}
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-[var(--line-subtle)] bg-[var(--bg-surface)] z-10">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              {editingEventId ? 'Edit Event' : 'Add Event'}
              {selectedTemplate && (
                <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                  from "{selectedTemplate.name}"
                </span>
              )}
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
            {/* Conflict Warnings */}
            {currentConflicts.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {currentConflicts.length} Conflict{currentConflicts.length > 1 ? 's' : ''} Detected
                  </span>
                </div>
                <div className="space-y-1">
                  {currentConflicts.slice(0, 2).map((conflict) => (
                    <p key={conflict.id} className="text-xs text-[var(--text-muted)]">
                      • {conflict.message}
                      {conflict.suggestion && (
                        <span className="text-amber-500"> ({conflict.suggestion})</span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Suggestions */}
            {smartSuggestions.length > 0 && !editingEventId && (
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-3 w-3 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {smartSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => {
                        if (suggestion.type === 'location') {
                          handleFormChange('location', suggestion.value);
                        } else if (suggestion.type === 'attendee') {
                          const current = formData.attendees;
                          handleFormChange('attendees', current ? `${current}, ${suggestion.value}` : suggestion.value);
                        }
                      }}
                      className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 transition-colors"
                      title={suggestion.reason}
                    >
                      + {suggestion.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* All-Day Toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-[var(--bg-elev)]/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.isAllDay}
                onChange={(e) => handleFormChange('isAllDay', e.target.checked)}
                className="w-4 h-4 rounded border-[var(--line-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                All-day event
              </span>
            </label>

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

            {/* Time (hidden for all-day events) */}
            {!formData.isAllDay && (
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
            )}

            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Globe className="h-4 w-4 text-[var(--text-muted)]" />
                Time Zone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleFormChange('timezone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
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

            {/* Recurrence */}
            <div className="space-y-2 p-3 rounded-lg bg-[var(--bg-elev)]/30">
              <label className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Repeat className="h-4 w-4 text-[var(--text-muted)]" />
                Repeat
              </label>
              <select
                value={formData.recurrenceFrequency}
                onChange={(e) => handleFormChange('recurrenceFrequency', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              {/* Recurrence Options */}
              {formData.recurrenceFrequency !== 'none' && (
                <div className="space-y-3 pt-2 border-t border-[var(--line-subtle)]/30">
                  {/* Interval */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">Every</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.recurrenceInterval}
                      onChange={(e) => handleFormChange('recurrenceInterval', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 rounded bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                    />
                    <span className="text-xs text-[var(--text-muted)]">
                      {formData.recurrenceFrequency === 'daily' ? 'day(s)' :
                       formData.recurrenceFrequency === 'weekly' ? 'week(s)' :
                       formData.recurrenceFrequency === 'monthly' ? 'month(s)' : 'year(s)'}
                    </span>
                  </div>

                  {/* Days of week for weekly */}
                  {formData.recurrenceFrequency === 'weekly' && (
                    <div className="space-y-1">
                      <span className="text-xs text-[var(--text-muted)]">On days:</span>
                      <div className="flex gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleRecurrenceDayToggle(idx)}
                            className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                              formData.recurrenceDays.includes(idx)
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-[var(--bg-elev)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* End condition */}
                  <div className="space-y-2">
                    <span className="text-xs text-[var(--text-muted)]">Ends:</span>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recurrenceEnd"
                          checked={formData.recurrenceEndType === 'never'}
                          onChange={() => handleFormChange('recurrenceEndType', 'never')}
                          className="text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                        <span className="text-xs text-[var(--text)]">Never</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recurrenceEnd"
                          checked={formData.recurrenceEndType === 'date'}
                          onChange={() => handleFormChange('recurrenceEndType', 'date')}
                          className="text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                        <span className="text-xs text-[var(--text)]">On date</span>
                        {formData.recurrenceEndType === 'date' && (
                          <input
                            type="date"
                            value={formData.recurrenceEndDate}
                            onChange={(e) => handleFormChange('recurrenceEndDate', e.target.value)}
                            className="ml-2 px-2 py-1 rounded bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                          />
                        )}
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recurrenceEnd"
                          checked={formData.recurrenceEndType === 'count'}
                          onChange={() => handleFormChange('recurrenceEndType', 'count')}
                          className="text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                        <span className="text-xs text-[var(--text)]">After</span>
                        {formData.recurrenceEndType === 'count' && (
                          <>
                            <input
                              type="number"
                              min="1"
                              max="365"
                              value={formData.recurrenceCount}
                              onChange={(e) => handleFormChange('recurrenceCount', parseInt(e.target.value) || 10)}
                              className="w-16 px-2 py-1 rounded bg-[var(--bg-elev)] border border-[var(--line-subtle)] text-[var(--text)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            />
                            <span className="text-xs text-[var(--text)]">occurrences</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}
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
                rows={2}
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
                <option value="0">No reminder</option>
                <option value="5">5 minutes before</option>
                <option value="10">10 minutes before</option>
                <option value="15">15 minutes before</option>
                <option value="30">30 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>

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
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity ${
                    currentConflicts.some(c => c.severity === 'high')
                      ? 'bg-amber-500'
                      : 'bg-[var(--accent)]'
                  }`}
                >
                  {editingEventId ? 'Save Changes' : 'Create Event'}
                  {currentConflicts.some(c => c.severity === 'high') && ' (with conflicts)'}
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
      <div className="flex items-center justify-between">
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
        {/* Holiday count for month */}
        {viewMode === 'month' && monthHolidays.length > 0 && (
          <span className="text-xs text-amber-500 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {monthHolidays.filter(h => h.category === 'federal').length} holidays this month
          </span>
        )}
      </div>

      {/* Quick Add Bar */}
      {renderQuickAdd()}

      {/* Templates Panel */}
      {renderTemplates()}

      {/* Contextual Suggestions Panel */}
      {renderContextPanel()}

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
          {/* Quick Add Button */}
          <button
            onClick={() => { setShowQuickAdd(true); setShowTemplates(false); }}
            className={`flex items-center gap-1 p-1.5 rounded-lg transition-colors ${
              showQuickAdd ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-[var(--bg-elev)] text-[var(--text-muted)]'
            }`}
            title="Quick add with natural language"
          >
            <Zap className="h-4 w-4" />
          </button>
          {/* Templates Button */}
          <button
            onClick={() => { setShowTemplates(true); setShowQuickAdd(false); }}
            className={`flex items-center gap-1 p-1.5 rounded-lg transition-colors ${
              showTemplates ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-[var(--bg-elev)] text-[var(--text-muted)]'
            }`}
            title="Event templates"
          >
            <Copy className="h-4 w-4" />
          </button>
          {/* Add Event Button */}
          <button
            onClick={() => openNewEventForm()}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[var(--bg-elev)] transition-colors text-[var(--accent)]"
            title="Add event"
          >
            <Plus className="h-4 w-4" />
          </button>
          {/* Sync Settings Button */}
          <button
            onClick={() => setShowSyncSettings(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-elev)] transition-colors text-[var(--text-muted)]"
            title="Calendar Sync Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Event Form Modal */}
      {renderEventForm()}

      {/* Calendar Sync Settings Modal */}
      <CalendarSyncSettings
        isOpen={showSyncSettings}
        onClose={() => setShowSyncSettings(false)}
        onSync={(externalEvents) => {
          // Import external events into local calendar
          externalEvents.forEach(event => {
            addCalendarEvent({
              title: event.title,
              start: event.start,
              end: event.end,
              isAllDay: event.isAllDay,
              location: event.location,
              description: event.description,
              attendees: event.attendees?.map((a: { email: string }) => a.email),
            });
          });
        }}
      />
    </div>
  );
}
