/**
 * Natural Language Event Parser
 * Parses strings like "Meeting tomorrow 2pm" into structured event data
 */

export type ParsedEvent = {
  title: string;
  date: Date;
  startTime: { hour: number; minute: number };
  endTime: { hour: number; minute: number };
  duration: number;  // minutes
  type?: 'work' | 'family' | 'personal' | 'meeting' | 'other';
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  confidence: number;  // 0-1 confidence score
  suggestions?: string[];  // Improvement suggestions
};

// Time pattern regexes
const TIME_PATTERNS = {
  // "2pm", "2:30pm", "14:00", "2 pm"
  standard: /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?(?:\s|$)/gi,
  // "noon", "midnight"
  named: /\b(noon|midnight|morning|afternoon|evening|night)\b/gi,
  // "at 2", "@ 3pm"
  atTime: /(?:at|@)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/gi,
};

// Date pattern regexes
const DATE_PATTERNS = {
  // "tomorrow", "today", "yesterday"
  relative: /\b(today|tomorrow|yesterday|day after tomorrow)\b/gi,
  // "next Monday", "this Friday"
  weekday: /\b(this|next|last)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
  // "Jan 15", "January 15th", "15 Jan"
  monthDay: /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/gi,
  // "1/15", "01/15/2024"
  numeric: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g,
  // "in 2 days", "in a week"
  inDays: /\bin\s+(\d+|a|an|one|two|three|four|five|six|seven)\s+(day|week|month)s?\b/gi,
};

// Duration patterns
const DURATION_PATTERNS = {
  // "for 1 hour", "for 30 minutes", "for 1.5 hours"
  explicit: /\bfor\s+(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)s?\b/gi,
  // "1h", "30m", "1h30m"
  shorthand: /\b(\d+)\s*h(?:our)?s?\s*(?:(\d+)\s*m(?:in)?s?)?\b/gi,
};

// Event type keywords
const TYPE_KEYWORDS: Record<string, 'work' | 'family' | 'personal' | 'meeting' | 'other'> = {
  meeting: 'meeting',
  standup: 'meeting',
  sync: 'meeting',
  call: 'meeting',
  interview: 'meeting',
  review: 'meeting',
  '1:1': 'meeting',
  'one-on-one': 'meeting',
  work: 'work',
  project: 'work',
  deadline: 'work',
  task: 'work',
  presentation: 'work',
  family: 'family',
  dinner: 'family',
  birthday: 'family',
  anniversary: 'family',
  personal: 'personal',
  gym: 'personal',
  workout: 'personal',
  doctor: 'personal',
  dentist: 'personal',
  appointment: 'personal',
  lunch: 'personal',
  coffee: 'personal',
  break: 'personal',
};

// Location prepositions
const LOCATION_PATTERNS = /\b(?:at|in|@)\s+([A-Z][a-zA-Z\s]+(?:Room|Office|Building|Cafe|Restaurant|Park|Hall|Center|Centre)?)/g;

// Attendee patterns
const ATTENDEE_PATTERNS = /\bwith\s+([A-Z][a-z]+(?:\s+(?:and|,)\s+[A-Z][a-z]+)*)/g;

// Word to number mapping
const WORD_TO_NUM: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

// Day name to index mapping
const DAY_NAMES: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

// Month name to index mapping
const MONTH_NAMES: Record<string, number> = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
};

/**
 * Parse a natural language string into event data
 */
export function parseEventString(input: string): ParsedEvent | null {
  if (!input || input.trim().length < 2) {
    return null;
  }

  const normalizedInput = input.trim();
  const lowerInput = normalizedInput.toLowerCase();

  // Parse components
  const date = parseDate(lowerInput) || new Date();
  const times = parseTimes(lowerInput);
  const duration = parseDuration(lowerInput);
  const type = parseType(lowerInput);
  const location = parseLocation(normalizedInput);
  const attendees = parseAttendees(normalizedInput);
  const isAllDay = /\ball\s*day\b/i.test(lowerInput);

  // Extract title (remove parsed components)
  const title = extractTitle(normalizedInput, {
    date,
    times,
    duration,
    location,
    attendees,
  });

  // Calculate confidence
  const confidence = calculateConfidence({
    hasTitle: title.length > 0,
    hasDate: parseDate(lowerInput) !== null,
    hasTime: times.start !== null,
    hasDuration: duration !== null,
    titleQuality: title.length >= 3 && title.length <= 100 ? 1 : 0.5,
  });

  // Build result
  const startTime = times.start || { hour: 9, minute: 0 };
  const eventDuration = duration || (times.end ?
    calculateDurationFromTimes(times.start || { hour: 9, minute: 0 }, times.end) : 60);
  const endTime = times.end || calculateEndTime(startTime, eventDuration);

  return {
    title: title || 'New Event',
    date,
    startTime,
    endTime,
    duration: eventDuration,
    type,
    location,
    attendees,
    isAllDay,
    confidence,
    suggestions: generateSuggestions({ title, date, times, duration }),
  };
}

/**
 * Parse date from input
 */
function parseDate(input: string): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check relative dates
  if (/\btoday\b/i.test(input)) {
    return today;
  }
  if (/\btomorrow\b/i.test(input)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  if (/\byesterday\b/i.test(input)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }
  if (/\bday after tomorrow\b/i.test(input)) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter;
  }

  // Check "in X days/weeks"
  const inDaysMatch = input.match(/\bin\s+(\d+|a|an|one|two|three|four|five|six|seven)\s+(day|week|month)s?\b/i);
  if (inDaysMatch) {
    const count = WORD_TO_NUM[inDaysMatch[1].toLowerCase()] || parseInt(inDaysMatch[1]) || 1;
    const unit = inDaysMatch[2].toLowerCase();
    const result = new Date(today);

    switch (unit) {
      case 'day':
        result.setDate(result.getDate() + count);
        break;
      case 'week':
        result.setDate(result.getDate() + (count * 7));
        break;
      case 'month':
        result.setMonth(result.getMonth() + count);
        break;
    }
    return result;
  }

  // Check weekday patterns
  const weekdayMatch = input.match(/\b(this|next|last)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  if (weekdayMatch) {
    const modifier = weekdayMatch[1]?.toLowerCase();
    const dayName = weekdayMatch[2].toLowerCase();
    const targetDay = DAY_NAMES[dayName];

    if (targetDay !== undefined) {
      const result = new Date(today);
      const currentDay = today.getDay();
      let daysToAdd = targetDay - currentDay;

      if (modifier === 'next') {
        daysToAdd += 7;
      } else if (modifier === 'last') {
        daysToAdd -= 7;
      } else if (daysToAdd <= 0) {
        // "this" or no modifier - if day already passed, go to next week
        daysToAdd += 7;
      }

      result.setDate(result.getDate() + daysToAdd);
      return result;
    }
  }

  // Check month/day patterns
  const monthDayMatch = input.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
  if (monthDayMatch) {
    const monthName = monthDayMatch[1].toLowerCase().slice(0, 3);
    const day = parseInt(monthDayMatch[2]);
    const month = MONTH_NAMES[monthName];

    if (month !== undefined && day >= 1 && day <= 31) {
      const result = new Date(today.getFullYear(), month, day);
      // If date is in the past, assume next year
      if (result < today) {
        result.setFullYear(result.getFullYear() + 1);
      }
      return result;
    }
  }

  // Check numeric date patterns (M/D or M/D/Y)
  const numericMatch = input.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (numericMatch) {
    const month = parseInt(numericMatch[1]) - 1;
    const day = parseInt(numericMatch[2]);
    let year = numericMatch[3] ? parseInt(numericMatch[3]) : today.getFullYear();

    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day);
    }
  }

  return null;
}

/**
 * Parse times from input
 */
function parseTimes(input: string): { start: { hour: number; minute: number } | null; end: { hour: number; minute: number } | null } {
  const times: { hour: number; minute: number }[] = [];

  // Check for named times first
  if (/\bnoon\b/i.test(input)) {
    times.push({ hour: 12, minute: 0 });
  }
  if (/\bmidnight\b/i.test(input)) {
    times.push({ hour: 0, minute: 0 });
  }
  if (/\bmorning\b/i.test(input) && times.length === 0) {
    times.push({ hour: 9, minute: 0 });
  }
  if (/\bafternoon\b/i.test(input) && times.length === 0) {
    times.push({ hour: 14, minute: 0 });
  }
  if (/\bevening\b/i.test(input) && times.length === 0) {
    times.push({ hour: 18, minute: 0 });
  }
  if (/\bnight\b/i.test(input) && times.length === 0) {
    times.push({ hour: 20, minute: 0 });
  }

  // Parse standard time patterns
  const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?(?:\s|$|,|-|to)/gi;
  let match;

  while ((match = timeRegex.exec(input)) !== null) {
    let hour = parseInt(match[1]);
    const minute = match[2] ? parseInt(match[2]) : 0;
    const meridiem = match[3]?.toLowerCase().replace(/\./g, '');

    // Handle 12-hour format
    if (meridiem === 'pm' && hour < 12) {
      hour += 12;
    } else if (meridiem === 'am' && hour === 12) {
      hour = 0;
    } else if (!meridiem && hour <= 12) {
      // Guess AM/PM based on common patterns
      // Hours 1-6 without meridiem are usually PM (work hours)
      // Hours 7-11 without meridiem could be AM
      if (hour >= 1 && hour <= 6) {
        hour += 12;
      }
    }

    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      times.push({ hour, minute });
    }
  }

  // Check for time ranges ("2pm to 3pm", "2-3pm")
  const rangeMatch = input.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (rangeMatch) {
    let startHour = parseInt(rangeMatch[1]);
    const startMinute = rangeMatch[2] ? parseInt(rangeMatch[2]) : 0;
    const startMeridiem = rangeMatch[3]?.toLowerCase();

    let endHour = parseInt(rangeMatch[4]);
    const endMinute = rangeMatch[5] ? parseInt(rangeMatch[5]) : 0;
    const endMeridiem = (rangeMatch[6] || rangeMatch[3])?.toLowerCase();

    // Apply meridiem
    if (endMeridiem === 'pm' && endHour < 12) endHour += 12;
    if (endMeridiem === 'am' && endHour === 12) endHour = 0;
    if (startMeridiem === 'pm' && startHour < 12) startHour += 12;
    if (startMeridiem === 'am' && startHour === 12) startHour = 0;

    // If no meridiem and end < start, adjust
    if (!startMeridiem && !endMeridiem && endHour < startHour) {
      endHour += 12;
    }

    return {
      start: { hour: startHour, minute: startMinute },
      end: { hour: endHour, minute: endMinute },
    };
  }

  return {
    start: times[0] || null,
    end: times[1] || null,
  };
}

/**
 * Parse duration from input
 */
function parseDuration(input: string): number | null {
  // Check "for X hours/minutes"
  const forMatch = input.match(/\bfor\s+(\d+(?:\.\d+)?)\s*(hour|hr|minute|min)s?\b/i);
  if (forMatch) {
    const value = parseFloat(forMatch[1]);
    const unit = forMatch[2].toLowerCase();

    if (unit.startsWith('hour') || unit.startsWith('hr')) {
      return Math.round(value * 60);
    }
    return Math.round(value);
  }

  // Check shorthand "1h", "30m", "1h30m"
  const shortMatch = input.match(/\b(\d+)\s*h(?:our)?s?(?:\s*(\d+)\s*m(?:in)?s?)?\b/i);
  if (shortMatch) {
    const hours = parseInt(shortMatch[1]);
    const minutes = shortMatch[2] ? parseInt(shortMatch[2]) : 0;
    return hours * 60 + minutes;
  }

  const minOnlyMatch = input.match(/\b(\d+)\s*m(?:in)?(?:ute)?s?\b/i);
  if (minOnlyMatch && !input.match(/\bh(?:our)?s?\b/i)) {
    return parseInt(minOnlyMatch[1]);
  }

  return null;
}

/**
 * Parse event type from keywords
 */
function parseType(input: string): 'work' | 'family' | 'personal' | 'meeting' | 'other' | undefined {
  const words = input.toLowerCase().split(/\s+/);

  for (const word of words) {
    const type = TYPE_KEYWORDS[word];
    if (type) return type;
  }

  // Check for multi-word patterns
  if (/\bone[- ]on[- ]one\b/i.test(input)) return 'meeting';
  if (/\b1:1\b/i.test(input)) return 'meeting';

  return undefined;
}

/**
 * Parse location from input
 */
function parseLocation(input: string): string | undefined {
  // Match "at [Location]" or "in [Location]"
  const match = input.match(/\b(?:at|in|@)\s+([A-Z][a-zA-Z0-9\s]+?)(?:\s+(?:at|on|with|for|from|tomorrow|today|next|this)|\s*$)/i);
  if (match) {
    const location = match[1].trim();
    // Filter out time-related words
    if (!/^\d|^(noon|midnight|morning|afternoon|evening|night)/i.test(location)) {
      return location;
    }
  }
  return undefined;
}

/**
 * Parse attendees from input
 */
function parseAttendees(input: string): string[] | undefined {
  const match = input.match(/\bwith\s+([A-Z][a-z]+(?:(?:\s+and\s+|,\s*)[A-Z][a-z]+)*)/);
  if (match) {
    const names = match[1].split(/\s+and\s+|,\s*/);
    return names.filter(n => n.length > 0);
  }
  return undefined;
}

/**
 * Extract title by removing parsed components
 */
function extractTitle(
  input: string,
  parsed: {
    date: Date;
    times: { start: { hour: number; minute: number } | null; end: { hour: number; minute: number } | null };
    duration: number | null;
    location?: string;
    attendees?: string[];
  }
): string {
  let title = input;

  // Remove date patterns
  title = title.replace(/\b(today|tomorrow|yesterday|day after tomorrow)\b/gi, '');
  title = title.replace(/\b(this|next|last)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '');
  title = title.replace(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi, '');
  title = title.replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, '');
  title = title.replace(/\bin\s+(?:\d+|a|an|one|two|three|four|five|six|seven)\s+(?:day|week|month)s?\b/gi, '');

  // Remove time patterns
  title = title.replace(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?\s*(?:to|-)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?\b/gi, '');
  title = title.replace(/\b(?:at|@)\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?\b/gi, '');
  title = title.replace(/\b\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)\b/gi, '');
  title = title.replace(/\b(noon|midnight)\b/gi, '');

  // Remove duration patterns
  title = title.replace(/\bfor\s+\d+(?:\.\d+)?\s*(?:hour|hr|minute|min)s?\b/gi, '');
  title = title.replace(/\b\d+\s*h(?:our)?s?(?:\s*\d+\s*m(?:in)?s?)?\b/gi, '');

  // Remove location patterns
  if (parsed.location) {
    title = title.replace(new RegExp(`\\b(?:at|in|@)\\s+${parsed.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '');
  }

  // Remove attendee patterns
  if (parsed.attendees) {
    title = title.replace(/\bwith\s+[A-Z][a-z]+(?:(?:\s+and\s+|,\s*)[A-Z][a-z]+)*/g, '');
  }

  // Remove "all day"
  title = title.replace(/\ball\s*day\b/gi, '');

  // Clean up
  title = title.replace(/\s+/g, ' ').trim();
  title = title.replace(/^[,\s-]+|[,\s-]+$/g, '');

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title;
}

/**
 * Calculate duration between two times
 */
function calculateDurationFromTimes(
  start: { hour: number; minute: number },
  end: { hour: number; minute: number }
): number {
  let duration = (end.hour * 60 + end.minute) - (start.hour * 60 + start.minute);
  if (duration <= 0) {
    duration += 24 * 60; // Next day
  }
  return duration;
}

/**
 * Calculate end time from start time and duration
 */
function calculateEndTime(
  start: { hour: number; minute: number },
  durationMinutes: number
): { hour: number; minute: number } {
  const totalMinutes = start.hour * 60 + start.minute + durationMinutes;
  return {
    hour: Math.floor(totalMinutes / 60) % 24,
    minute: totalMinutes % 60,
  };
}

/**
 * Calculate confidence score
 */
function calculateConfidence(factors: {
  hasTitle: boolean;
  hasDate: boolean;
  hasTime: boolean;
  hasDuration: boolean;
  titleQuality: number;
}): number {
  let score = 0;
  let weight = 0;

  // Title (30%)
  if (factors.hasTitle) {
    score += 0.3 * factors.titleQuality;
    weight += 0.3;
  }

  // Date (25%)
  if (factors.hasDate) {
    score += 0.25;
    weight += 0.25;
  }

  // Time (25%)
  if (factors.hasTime) {
    score += 0.25;
    weight += 0.25;
  }

  // Duration (20%)
  if (factors.hasDuration) {
    score += 0.2;
    weight += 0.2;
  }

  // Normalize
  return weight > 0 ? score / weight : 0.3;
}

/**
 * Generate suggestions for improving the event
 */
function generateSuggestions(parsed: {
  title: string;
  date: Date | null;
  times: { start: { hour: number; minute: number } | null; end: { hour: number; minute: number } | null };
  duration: number | null;
}): string[] {
  const suggestions: string[] = [];

  if (!parsed.title || parsed.title.length < 3) {
    suggestions.push('Add a descriptive title');
  }

  if (!parsed.date) {
    suggestions.push('Add a date (e.g., "tomorrow", "next Monday", "Jan 15")');
  }

  if (!parsed.times.start) {
    suggestions.push('Add a time (e.g., "2pm", "at 14:00", "noon")');
  }

  if (!parsed.duration && !parsed.times.end) {
    suggestions.push('Add a duration (e.g., "for 1 hour", "30 min")');
  }

  return suggestions;
}

/**
 * Format parsed event back to a readable string
 */
export function formatParsedEvent(event: ParsedEvent): string {
  const parts: string[] = [event.title];

  // Date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(event.date);
  eventDate.setHours(0, 0, 0, 0);

  const dayDiff = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (dayDiff === 0) {
    parts.push('today');
  } else if (dayDiff === 1) {
    parts.push('tomorrow');
  } else if (dayDiff > 1 && dayDiff < 7) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    parts.push(days[eventDate.getDay()]);
  } else {
    parts.push(eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }

  // Time
  if (!event.isAllDay) {
    const formatTime = (t: { hour: number; minute: number }) => {
      const h = t.hour % 12 || 12;
      const m = t.minute > 0 ? `:${t.minute.toString().padStart(2, '0')}` : '';
      const ampm = t.hour < 12 ? 'am' : 'pm';
      return `${h}${m}${ampm}`;
    };
    parts.push(`at ${formatTime(event.startTime)}`);
  } else {
    parts.push('(all day)');
  }

  // Location
  if (event.location) {
    parts.push(`at ${event.location}`);
  }

  // Attendees
  if (event.attendees && event.attendees.length > 0) {
    parts.push(`with ${event.attendees.join(', ')}`);
  }

  return parts.join(' ');
}
