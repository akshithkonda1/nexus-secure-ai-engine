/**
 * Calendar Event Intelligence Service
 * Conflict detection, smart suggestions, and event templates
 */

import type { CalendarEvent, EventTemplate, RecurrencePattern } from '../../types/workspace';

// ============================================================
// CONFLICT DETECTION
// ============================================================

export type ConflictType = 'overlap' | 'back-to-back' | 'double-booked' | 'travel-time';

export type EventConflict = {
  id: string;
  type: ConflictType;
  severity: 'high' | 'medium' | 'low';
  events: CalendarEvent[];
  message: string;
  suggestion?: string;
};

/**
 * Check for conflicts between a new event and existing events
 */
export function detectConflicts(
  newEvent: Partial<CalendarEvent>,
  existingEvents: CalendarEvent[],
  options?: {
    travelTimeMinutes?: number;  // Buffer for travel between events
    ignoreEventId?: string;      // Ignore this event (for edits)
  }
): EventConflict[] {
  const conflicts: EventConflict[] = [];

  if (!newEvent.start || !newEvent.end) return conflicts;

  const newStart = new Date(newEvent.start);
  const newEnd = new Date(newEvent.end);
  const travelBuffer = (options?.travelTimeMinutes || 0) * 60 * 1000;

  for (const event of existingEvents) {
    // Skip the event being edited
    if (options?.ignoreEventId && event.id === options.ignoreEventId) continue;

    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Check if events are on the same day
    if (
      eventStart.toDateString() !== newStart.toDateString() &&
      eventEnd.toDateString() !== newStart.toDateString()
    ) continue;

    // Direct overlap (high severity)
    if (
      (newStart < eventEnd && newEnd > eventStart) ||
      (eventStart < newEnd && eventEnd > newStart)
    ) {
      conflicts.push({
        id: `conflict-${event.id}`,
        type: 'overlap',
        severity: 'high',
        events: [event],
        message: `Overlaps with "${event.title}" (${formatTimeRange(eventStart, eventEnd)})`,
        suggestion: suggestAlternativeTime(newStart, newEnd, existingEvents),
      });
    }
    // Back-to-back (low severity - just informational)
    else if (
      Math.abs(newStart.getTime() - eventEnd.getTime()) < 5 * 60 * 1000 ||
      Math.abs(eventStart.getTime() - newEnd.getTime()) < 5 * 60 * 1000
    ) {
      conflicts.push({
        id: `backtoback-${event.id}`,
        type: 'back-to-back',
        severity: 'low',
        events: [event],
        message: `Back-to-back with "${event.title}"`,
        suggestion: 'Consider adding buffer time between meetings',
      });
    }
    // Travel time conflict (if locations differ)
    else if (
      travelBuffer > 0 &&
      event.location && newEvent.location &&
      event.location !== newEvent.location
    ) {
      const gap = Math.min(
        Math.abs(newStart.getTime() - eventEnd.getTime()),
        Math.abs(eventStart.getTime() - newEnd.getTime())
      );

      if (gap < travelBuffer) {
        conflicts.push({
          id: `travel-${event.id}`,
          type: 'travel-time',
          severity: 'medium',
          events: [event],
          message: `Only ${Math.round(gap / 60000)} min gap with "${event.title}" at different location`,
          suggestion: `Need ${options?.travelTimeMinutes} min travel time`,
        });
      }
    }
  }

  // Check for double-booking (multiple overlaps)
  const overlaps = conflicts.filter(c => c.type === 'overlap');
  if (overlaps.length > 1) {
    conflicts.unshift({
      id: 'double-booked',
      type: 'double-booked',
      severity: 'high',
      events: overlaps.flatMap(c => c.events),
      message: `Double-booked: conflicts with ${overlaps.length} events`,
    });
  }

  return conflicts;
}

/**
 * Suggest an alternative time slot
 */
function suggestAlternativeTime(
  desiredStart: Date,
  desiredEnd: Date,
  existingEvents: CalendarEvent[]
): string {
  const duration = desiredEnd.getTime() - desiredStart.getTime();
  const dayStart = new Date(desiredStart);
  dayStart.setHours(8, 0, 0, 0);
  const dayEnd = new Date(desiredStart);
  dayEnd.setHours(18, 0, 0, 0);

  // Get all events for this day
  const dayEvents = existingEvents
    .filter(e => new Date(e.start).toDateString() === desiredStart.toDateString())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Find free slots
  const freeSlots: { start: Date; end: Date }[] = [];
  let slotStart = dayStart;

  for (const event of dayEvents) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    if (eventStart > slotStart) {
      freeSlots.push({ start: new Date(slotStart), end: eventStart });
    }
    slotStart = eventEnd > slotStart ? eventEnd : slotStart;
  }

  if (slotStart < dayEnd) {
    freeSlots.push({ start: slotStart, end: dayEnd });
  }

  // Find a slot that fits
  for (const slot of freeSlots) {
    const slotDuration = slot.end.getTime() - slot.start.getTime();
    if (slotDuration >= duration) {
      return `Try ${formatTime(slot.start)} instead`;
    }
  }

  return 'No free slots today - try a different day';
}

// ============================================================
// SMART SUGGESTIONS
// ============================================================

export type SmartSuggestion = {
  id: string;
  type: 'attendee' | 'location' | 'time' | 'duration' | 'template';
  value: string;
  confidence: number;
  reason: string;
};

/**
 * Generate smart suggestions based on event history and patterns
 */
export function generateSmartSuggestions(
  partialEvent: Partial<CalendarEvent>,
  eventHistory: CalendarEvent[],
  options?: {
    maxSuggestions?: number;
  }
): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];
  const maxSuggestions = options?.maxSuggestions || 5;

  const title = partialEvent.title?.toLowerCase() || '';

  // Analyze patterns from history
  const patterns = analyzeEventPatterns(eventHistory);

  // Suggest attendees based on event type/title
  if (title && !partialEvent.attendees?.length) {
    const matchingAttendees = findMatchingAttendees(title, eventHistory);
    matchingAttendees.slice(0, 3).forEach((a, i) => {
      suggestions.push({
        id: `attendee-${i}`,
        type: 'attendee',
        value: a.name,
        confidence: a.confidence,
        reason: `Usually attends similar events`,
      });
    });
  }

  // Suggest location based on event type
  if (title && !partialEvent.location) {
    const matchingLocations = findMatchingLocations(title, eventHistory);
    matchingLocations.slice(0, 2).forEach((l, i) => {
      suggestions.push({
        id: `location-${i}`,
        type: 'location',
        value: l.location,
        confidence: l.confidence,
        reason: `Common location for "${l.matchedKeyword}" events`,
      });
    });
  }

  // Suggest optimal time based on patterns
  if (partialEvent.type && !partialEvent.start) {
    const preferredTimes = patterns.preferredTimesByType[partialEvent.type];
    if (preferredTimes?.length > 0) {
      suggestions.push({
        id: 'time-preference',
        type: 'time',
        value: `${preferredTimes[0]}:00`,
        confidence: 0.7,
        reason: `You usually schedule ${partialEvent.type} events around this time`,
      });
    }
  }

  // Suggest duration based on event type
  if (partialEvent.type && !partialEvent.end && partialEvent.start) {
    const avgDuration = patterns.averageDurationByType[partialEvent.type];
    if (avgDuration) {
      suggestions.push({
        id: 'duration-suggestion',
        type: 'duration',
        value: `${avgDuration} min`,
        confidence: 0.75,
        reason: `Your ${partialEvent.type} events are usually ${avgDuration} minutes`,
      });
    }
  }

  return suggestions.slice(0, maxSuggestions);
}

/**
 * Analyze event patterns from history
 */
function analyzeEventPatterns(events: CalendarEvent[]) {
  const patterns = {
    preferredTimesByType: {} as Record<string, number[]>,
    averageDurationByType: {} as Record<string, number>,
    commonLocations: [] as { location: string; count: number }[],
    commonAttendees: [] as { name: string; count: number }[],
  };

  const locationCounts: Record<string, number> = {};
  const attendeeCounts: Record<string, number> = {};
  const durationsByType: Record<string, number[]> = {};
  const timesByType: Record<string, number[]> = {};

  for (const event of events) {
    const type = event.type || 'other';

    // Track durations
    if (event.start && event.end) {
      const duration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000;
      if (!durationsByType[type]) durationsByType[type] = [];
      durationsByType[type].push(duration);

      // Track times
      const hour = new Date(event.start).getHours();
      if (!timesByType[type]) timesByType[type] = [];
      timesByType[type].push(hour);
    }

    // Track locations
    if (event.location) {
      locationCounts[event.location] = (locationCounts[event.location] || 0) + 1;
    }

    // Track attendees
    event.attendees?.forEach(a => {
      attendeeCounts[a] = (attendeeCounts[a] || 0) + 1;
    });
  }

  // Calculate averages
  for (const type of Object.keys(durationsByType)) {
    const durations = durationsByType[type];
    patterns.averageDurationByType[type] = Math.round(
      durations.reduce((a, b) => a + b, 0) / durations.length
    );
  }

  // Find preferred times (mode)
  for (const type of Object.keys(timesByType)) {
    const times = timesByType[type];
    const timeFreq: Record<number, number> = {};
    times.forEach(t => timeFreq[t] = (timeFreq[t] || 0) + 1);
    patterns.preferredTimesByType[type] = Object.entries(timeFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  // Sort locations and attendees by frequency
  patterns.commonLocations = Object.entries(locationCounts)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);

  patterns.commonAttendees = Object.entries(attendeeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return patterns;
}

/**
 * Find attendees who commonly attend similar events
 */
function findMatchingAttendees(
  title: string,
  eventHistory: CalendarEvent[]
): { name: string; confidence: number }[] {
  const keywords = title.toLowerCase().split(/\s+/);
  const attendeeScores: Record<string, number> = {};
  const attendeeCounts: Record<string, number> = {};

  for (const event of eventHistory) {
    const eventTitle = event.title.toLowerCase();
    const matchScore = keywords.filter(k => eventTitle.includes(k)).length / keywords.length;

    if (matchScore > 0.3 && event.attendees) {
      event.attendees.forEach(a => {
        attendeeScores[a] = (attendeeScores[a] || 0) + matchScore;
        attendeeCounts[a] = (attendeeCounts[a] || 0) + 1;
      });
    }
  }

  return Object.entries(attendeeScores)
    .map(([name, score]) => ({
      name,
      confidence: Math.min(score / attendeeCounts[name] * 0.5, 1),
    }))
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Find locations commonly used for similar events
 */
function findMatchingLocations(
  title: string,
  eventHistory: CalendarEvent[]
): { location: string; confidence: number; matchedKeyword: string }[] {
  const keywords = title.toLowerCase().split(/\s+/);
  const results: { location: string; confidence: number; matchedKeyword: string }[] = [];

  for (const event of eventHistory) {
    if (!event.location) continue;

    const eventTitle = event.title.toLowerCase();
    for (const keyword of keywords) {
      if (keyword.length > 2 && eventTitle.includes(keyword)) {
        const existing = results.find(r => r.location === event.location);
        if (existing) {
          existing.confidence += 0.1;
        } else {
          results.push({
            location: event.location,
            confidence: 0.5,
            matchedKeyword: keyword,
          });
        }
      }
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

// ============================================================
// EVENT TEMPLATES
// ============================================================

/**
 * Default event templates
 */
export const DEFAULT_TEMPLATES: EventTemplate[] = [
  {
    id: 'template-standup',
    name: 'Daily Standup',
    title: 'Daily Standup',
    duration: 15,
    type: 'meeting',
    isDefault: true,
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    },
  },
  {
    id: 'template-1on1',
    name: '1:1 Meeting',
    title: '1:1 with',
    duration: 30,
    type: 'meeting',
    isDefault: true,
    recurrence: {
      frequency: 'weekly',
      interval: 1,
    },
  },
  {
    id: 'template-team-sync',
    name: 'Team Sync',
    title: 'Team Sync',
    duration: 60,
    type: 'meeting',
    isDefault: true,
  },
  {
    id: 'template-focus-time',
    name: 'Focus Time',
    title: 'Focus Time - No Meetings',
    duration: 120,
    type: 'personal',
    isDefault: true,
    description: 'Dedicated time for deep work',
  },
  {
    id: 'template-lunch',
    name: 'Lunch Break',
    title: 'Lunch',
    duration: 60,
    type: 'personal',
    isDefault: true,
  },
  {
    id: 'template-interview',
    name: 'Interview',
    title: 'Interview - ',
    duration: 45,
    type: 'meeting',
    isDefault: true,
  },
  {
    id: 'template-review',
    name: 'Review Session',
    title: 'Review:',
    duration: 30,
    type: 'work',
    isDefault: true,
  },
  {
    id: 'template-planning',
    name: 'Sprint Planning',
    title: 'Sprint Planning',
    duration: 90,
    type: 'meeting',
    isDefault: true,
    recurrence: {
      frequency: 'weekly',
      interval: 2,
    },
  },
];

/**
 * Create an event from a template
 */
export function createEventFromTemplate(
  template: EventTemplate,
  startDate: Date
): Omit<CalendarEvent, 'id'> {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + template.duration * 60 * 1000);

  return {
    title: template.title,
    start,
    end,
    type: template.type,
    location: template.location,
    description: template.description,
    attendees: template.attendees,
    recurring: !!template.recurrence,
    recurrence: template.recurrence,
    color: template.color,
    templateId: template.id,
  };
}

// ============================================================
// RECURRENCE HELPERS
// ============================================================

/**
 * Generate occurrences for a recurring event
 */
export function generateRecurrences(
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  if (!event.recurring || !event.recurrence) {
    return [event];
  }

  const occurrences: CalendarEvent[] = [];
  const { frequency, interval, daysOfWeek, dayOfMonth, endDate, occurrences: maxOccurrences } = event.recurrence;
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  const duration = eventEnd.getTime() - eventStart.getTime();

  let currentDate = new Date(eventStart);
  let count = 0;

  while (currentDate <= rangeEnd) {
    // Check end conditions
    if (endDate && currentDate > endDate) break;
    if (maxOccurrences && count >= maxOccurrences) break;

    // Check if occurrence is within range
    if (currentDate >= rangeStart) {
      // For weekly recurrence with specific days
      if (frequency === 'weekly' && daysOfWeek?.length) {
        if (daysOfWeek.includes(currentDate.getDay())) {
          occurrences.push({
            ...event,
            id: `${event.id}-${count}`,
            start: new Date(currentDate),
            end: new Date(currentDate.getTime() + duration),
          });
          count++;
        }
      } else {
        occurrences.push({
          ...event,
          id: `${event.id}-${count}`,
          start: new Date(currentDate),
          end: new Date(currentDate.getTime() + duration),
        });
        count++;
      }
    }

    // Advance to next occurrence
    switch (frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case 'weekly':
        if (daysOfWeek?.length) {
          // Move to next day of week
          currentDate.setDate(currentDate.getDate() + 1);
        } else {
          currentDate.setDate(currentDate.getDate() + (7 * interval));
        }
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval);
        if (dayOfMonth) {
          currentDate.setDate(dayOfMonth);
        }
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() + interval);
        break;
    }
  }

  return occurrences;
}

/**
 * Format recurrence pattern to human-readable string
 */
export function formatRecurrence(recurrence: RecurrencePattern): string {
  const { frequency, interval, daysOfWeek, endDate, occurrences } = recurrence;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let text = '';

  // Frequency and interval
  if (interval === 1) {
    text = frequency === 'daily' ? 'Daily' :
           frequency === 'weekly' ? 'Weekly' :
           frequency === 'monthly' ? 'Monthly' :
           'Yearly';
  } else {
    text = `Every ${interval} ${frequency.replace('ly', '')}s`;
  }

  // Days of week for weekly
  if (frequency === 'weekly' && daysOfWeek?.length) {
    if (daysOfWeek.length === 5 &&
        daysOfWeek.includes(1) && daysOfWeek.includes(2) &&
        daysOfWeek.includes(3) && daysOfWeek.includes(4) &&
        daysOfWeek.includes(5)) {
      text += ' on weekdays';
    } else {
      text += ` on ${daysOfWeek.map(d => dayNames[d]).join(', ')}`;
    }
  }

  // End condition
  if (endDate) {
    text += ` until ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } else if (occurrences) {
    text += `, ${occurrences} times`;
  }

  return text;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}
