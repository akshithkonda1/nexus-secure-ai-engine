/**
 * Holiday Intelligence Service
 * Provides US federal holidays, cultural observances, and contextual awareness
 */

import type { Holiday, HolidayCategory, ExtendedWeekend, PersonalDate } from '../../types/workspace';

// ============================================================
// HOLIDAY CALCULATION HELPERS
// ============================================================

/**
 * Get the Nth occurrence of a weekday in a month
 * @param year - Year
 * @param month - Month (0-11)
 * @param weekday - Day of week (0=Sunday, 1=Monday, etc.)
 * @param nth - Which occurrence (1st, 2nd, 3rd, etc.) Use -1 for last
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();

  // Calculate first occurrence of the weekday
  let dayOfMonth = 1 + ((weekday - firstWeekday + 7) % 7);

  if (nth === -1) {
    // Last occurrence - find all occurrences and get the last one
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    while (dayOfMonth + 7 <= daysInMonth) {
      dayOfMonth += 7;
    }
  } else {
    // Add weeks for nth occurrence
    dayOfMonth += (nth - 1) * 7;
  }

  return new Date(year, month, dayOfMonth);
}

/**
 * Calculate Easter Sunday using the Anonymous Gregorian algorithm
 */
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month, day);
}

// ============================================================
// US FEDERAL HOLIDAYS
// ============================================================

/**
 * Get all US Federal holidays for a given year
 * These are the 11 official federal holidays where banks/government are closed
 */
export function getUSFederalHolidays(year: number): Holiday[] {
  return [
    {
      id: `new-years-${year}`,
      name: "New Year's Day",
      date: new Date(year, 0, 1),
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '🎆',
      description: 'Start of the new year',
    },
    {
      id: `mlk-day-${year}`,
      name: 'Martin Luther King Jr. Day',
      date: getNthWeekdayOfMonth(year, 0, 1, 3), // 3rd Monday of January
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '✊',
      description: 'Honors Dr. Martin Luther King Jr.',
    },
    {
      id: `presidents-day-${year}`,
      name: "Presidents' Day",
      date: getNthWeekdayOfMonth(year, 1, 1, 3), // 3rd Monday of February
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '🇺🇸',
      description: 'Honors all US presidents',
    },
    {
      id: `memorial-day-${year}`,
      name: 'Memorial Day',
      date: getNthWeekdayOfMonth(year, 4, 1, -1), // Last Monday of May
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '🎖️',
      description: 'Honors those who died in military service',
    },
    {
      id: `juneteenth-${year}`,
      name: 'Juneteenth',
      date: new Date(year, 5, 19),
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '✊',
      description: 'Commemorates the emancipation of enslaved people',
    },
    {
      id: `independence-day-${year}`,
      name: 'Independence Day',
      date: new Date(year, 6, 4),
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '🎇',
      description: 'Fourth of July - US Independence',
    },
    {
      id: `labor-day-${year}`,
      name: 'Labor Day',
      date: getNthWeekdayOfMonth(year, 8, 1, 1), // 1st Monday of September
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '👷',
      description: 'Honors the American labor movement',
    },
    {
      id: `columbus-day-${year}`,
      name: 'Columbus Day',
      date: getNthWeekdayOfMonth(year, 9, 1, 2), // 2nd Monday of October
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '🌎',
      description: 'Also observed as Indigenous Peoples\' Day',
    },
    {
      id: `veterans-day-${year}`,
      name: 'Veterans Day',
      date: new Date(year, 10, 11),
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '🎖️',
      description: 'Honors all who served in the US Armed Forces',
    },
    {
      id: `thanksgiving-${year}`,
      name: 'Thanksgiving',
      date: getNthWeekdayOfMonth(year, 10, 4, 4), // 4th Thursday of November
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '🦃',
      description: 'Day of giving thanks',
    },
    {
      id: `christmas-${year}`,
      name: 'Christmas Day',
      date: new Date(year, 11, 25),
      category: 'federal',
      isWorkOff: true,
      recurring: true,
      emoji: '🎄',
      description: 'Celebration of Christmas',
    },
  ];
}

// ============================================================
// CULTURAL & OBSERVANCE HOLIDAYS
// ============================================================

/**
 * Get cultural and observance holidays/events for a given year
 */
export function getCulturalHolidays(year: number): Holiday[] {
  const easter = getEasterSunday(year);

  return [
    // Valentine's Day
    {
      id: `valentines-${year}`,
      name: "Valentine's Day",
      date: new Date(year, 1, 14),
      category: 'cultural',
      isWorkOff: false,
      recurring: true,
      emoji: '❤️',
      description: 'Day of love and affection',
    },
    // St. Patrick's Day
    {
      id: `st-patricks-${year}`,
      name: "St. Patrick's Day",
      date: new Date(year, 2, 17),
      category: 'cultural',
      isWorkOff: false,
      recurring: true,
      emoji: '☘️',
      description: 'Irish cultural celebration',
    },
    // Easter
    {
      id: `easter-${year}`,
      name: 'Easter Sunday',
      date: easter,
      category: 'religious',
      isWorkOff: false,
      recurring: true,
      emoji: '🐣',
      description: 'Christian celebration of resurrection',
    },
    // Good Friday (2 days before Easter)
    {
      id: `good-friday-${year}`,
      name: 'Good Friday',
      date: new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000),
      category: 'religious',
      isWorkOff: false,
      recurring: true,
      emoji: '✝️',
      description: 'Christian observance before Easter',
    },
    // Mother's Day
    {
      id: `mothers-day-${year}`,
      name: "Mother's Day",
      date: getNthWeekdayOfMonth(year, 4, 0, 2), // 2nd Sunday of May
      category: 'cultural',
      isWorkOff: false,
      recurring: true,
      emoji: '💐',
      description: 'Honors mothers and motherhood',
    },
    // Father's Day
    {
      id: `fathers-day-${year}`,
      name: "Father's Day",
      date: getNthWeekdayOfMonth(year, 5, 0, 3), // 3rd Sunday of June
      category: 'cultural',
      isWorkOff: false,
      recurring: true,
      emoji: '👔',
      description: 'Honors fathers and fatherhood',
    },
    // Halloween
    {
      id: `halloween-${year}`,
      name: 'Halloween',
      date: new Date(year, 9, 31),
      category: 'cultural',
      isWorkOff: false,
      recurring: true,
      emoji: '🎃',
      description: 'Spooky celebration',
    },
    // Black Friday (day after Thanksgiving)
    {
      id: `black-friday-${year}`,
      name: 'Black Friday',
      date: new Date(getNthWeekdayOfMonth(year, 10, 4, 4).getTime() + 24 * 60 * 60 * 1000),
      category: 'observance',
      isWorkOff: false,
      recurring: true,
      emoji: '🛍️',
      description: 'Major shopping day after Thanksgiving',
    },
    // Christmas Eve
    {
      id: `christmas-eve-${year}`,
      name: 'Christmas Eve',
      date: new Date(year, 11, 24),
      category: 'cultural',
      isWorkOff: false,
      recurring: true,
      emoji: '🎄',
      description: 'Evening before Christmas',
    },
    // New Year's Eve
    {
      id: `new-years-eve-${year}`,
      name: "New Year's Eve",
      date: new Date(year, 11, 31),
      category: 'cultural',
      isWorkOff: false,
      recurring: true,
      emoji: '🥳',
      description: 'Last day of the year',
    },
  ];
}

// ============================================================
// HOLIDAY RETRIEVAL
// ============================================================

/**
 * Get all holidays for a given year
 */
export function getAllHolidays(year: number): Holiday[] {
  return [
    ...getUSFederalHolidays(year),
    ...getCulturalHolidays(year),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get holidays for a specific month
 */
export function getHolidaysForMonth(year: number, month: number): Holiday[] {
  return getAllHolidays(year).filter(h => h.date.getMonth() === month);
}

/**
 * Get holidays for a specific date
 */
export function getHolidaysForDate(date: Date): Holiday[] {
  const year = date.getFullYear();
  return getAllHolidays(year).filter(h =>
    h.date.getDate() === date.getDate() &&
    h.date.getMonth() === date.getMonth()
  );
}

/**
 * Check if a date is a holiday
 */
export function isHoliday(date: Date): boolean {
  return getHolidaysForDate(date).length > 0;
}

/**
 * Check if a date is a federal holiday (work off)
 */
export function isFederalHoliday(date: Date): boolean {
  return getHolidaysForDate(date).some(h => h.category === 'federal');
}

// ============================================================
// EXTENDED WEEKEND DETECTION
// ============================================================

/**
 * Check if two dates are the same day
 */
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

/**
 * Get extended weekends (3+ day weekends) for a given month
 * Detects when federal holidays create long weekends
 */
export function getExtendedWeekends(year: number, month: number): ExtendedWeekend[] {
  const extendedWeekends: ExtendedWeekend[] = [];
  const federalHolidays = getUSFederalHolidays(year).filter(h => h.isWorkOff);

  // Check each federal holiday in this month
  const monthHolidays = federalHolidays.filter(h => h.date.getMonth() === month);

  for (const holiday of monthHolidays) {
    const holidayDate = holiday.date;
    const dayOfWeek = holidayDate.getDay();

    let startDate: Date;
    let endDate: Date;
    let totalDays = 3; // Minimum for extended weekend
    const holidays: Holiday[] = [holiday];

    // Monday holiday = Sat-Sun-Mon (3 days)
    if (dayOfWeek === 1) {
      startDate = new Date(holidayDate);
      startDate.setDate(startDate.getDate() - 2); // Saturday
      endDate = new Date(holidayDate); // Monday
    }
    // Friday holiday = Fri-Sat-Sun (3 days)
    else if (dayOfWeek === 5) {
      startDate = new Date(holidayDate); // Friday
      endDate = new Date(holidayDate);
      endDate.setDate(endDate.getDate() + 2); // Sunday
    }
    // Thursday holiday = Thu-Fri-Sat-Sun (4 days, many take Friday off)
    else if (dayOfWeek === 4) {
      startDate = new Date(holidayDate); // Thursday
      endDate = new Date(holidayDate);
      endDate.setDate(endDate.getDate() + 3); // Sunday
      totalDays = 4;
    }
    // Wednesday holiday = potential for 5 day with M/T or Th/F off
    else if (dayOfWeek === 3) {
      startDate = new Date(holidayDate);
      startDate.setDate(startDate.getDate() - 3); // Sunday before
      endDate = new Date(holidayDate);
      endDate.setDate(endDate.getDate() + 4); // Sunday after
      totalDays = 5; // If taking days around it
    }
    // Weekend holiday
    else if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue; // Skip pure weekend holidays
    }
    // Tuesday holiday
    else if (dayOfWeek === 2) {
      startDate = new Date(holidayDate);
      startDate.setDate(startDate.getDate() - 3); // Saturday
      endDate = new Date(holidayDate); // Tuesday
      totalDays = 4; // If taking Monday off
    }
    else {
      continue;
    }

    // Generate contextual suggestion
    let suggestion = '';
    if (totalDays >= 4) {
      suggestion = `${totalDays}-day weekend opportunity! Perfect for a trip.`;
    } else {
      suggestion = `Long weekend - great for a short getaway.`;
    }

    // Check for adjacent holidays that extend it further
    for (const otherHoliday of federalHolidays) {
      if (otherHoliday.id === holiday.id) continue;

      const diff = Math.abs(otherHoliday.date.getTime() - holidayDate.getTime());
      const daysDiff = diff / (24 * 60 * 60 * 1000);

      if (daysDiff <= 5 && daysDiff > 0) {
        holidays.push(otherHoliday);
        if (otherHoliday.date < startDate) {
          startDate = new Date(otherHoliday.date);
        }
        if (otherHoliday.date > endDate) {
          endDate = new Date(otherHoliday.date);
        }
        totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        suggestion = `${totalDays}-day extended period with multiple holidays!`;
      }
    }

    extendedWeekends.push({
      startDate,
      endDate,
      totalDays,
      holidays,
      suggestion,
    });
  }

  return extendedWeekends;
}

/**
 * Get upcoming extended weekends in the next N months
 */
export function getUpcomingExtendedWeekends(fromDate: Date, monthsAhead: number = 3): ExtendedWeekend[] {
  const weekends: ExtendedWeekend[] = [];

  for (let i = 0; i <= monthsAhead; i++) {
    const checkDate = new Date(fromDate);
    checkDate.setMonth(checkDate.getMonth() + i);

    const monthWeekends = getExtendedWeekends(
      checkDate.getFullYear(),
      checkDate.getMonth()
    );

    // Only include future weekends
    for (const weekend of monthWeekends) {
      if (weekend.startDate >= fromDate) {
        weekends.push(weekend);
      }
    }
  }

  return weekends.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

// ============================================================
// PERSONAL DATE HELPERS
// ============================================================

/**
 * Convert personal date to a holiday for a specific year
 */
export function personalDateToHoliday(personalDate: PersonalDate, year: number): Holiday {
  const age = personalDate.year ? year - personalDate.year : undefined;

  let description = personalDate.notes || '';
  if (personalDate.type === 'birthday' && age !== undefined) {
    description = `${personalDate.person || 'Someone'} turns ${age}!`;
  } else if (personalDate.type === 'anniversary' && age !== undefined) {
    description = `${age} year anniversary`;
  }

  const emojiMap: Record<PersonalDate['type'], string> = {
    birthday: '🎂',
    anniversary: '💍',
    memorial: '🕯️',
    custom: '📅',
  };

  return {
    id: `personal-${personalDate.id}-${year}`,
    name: personalDate.name,
    date: new Date(year, personalDate.month, personalDate.day),
    category: 'personal',
    isWorkOff: false,
    recurring: true,
    emoji: emojiMap[personalDate.type],
    description,
  };
}

/**
 * Get personal dates as holidays for a specific year
 */
export function getPersonalHolidays(personalDates: PersonalDate[], year: number): Holiday[] {
  return personalDates.map(pd => personalDateToHoliday(pd, year));
}

// ============================================================
// CONTEXTUAL SUGGESTIONS
// ============================================================

/**
 * Get contextual suggestion for a date based on nearby holidays
 */
export function getDateContext(date: Date, personalDates: PersonalDate[] = []): {
  holidays: Holiday[];
  personalEvents: Holiday[];
  extendedWeekend: ExtendedWeekend | null;
  suggestions: string[];
} {
  const year = date.getFullYear();
  const month = date.getMonth();
  const dayOfWeek = date.getDay();

  const holidays = getHolidaysForDate(date);
  const personalEvents = getPersonalHolidays(personalDates, year).filter(h =>
    h.date.getMonth() === month && h.date.getDate() === date.getDate()
  );

  // Check if date is part of an extended weekend
  const extendedWeekends = getExtendedWeekends(year, month);
  let extendedWeekend: ExtendedWeekend | null = null;

  for (const ew of extendedWeekends) {
    if (date >= ew.startDate && date <= ew.endDate) {
      extendedWeekend = ew;
      break;
    }
  }

  const suggestions: string[] = [];

  // Add holiday-based suggestions
  if (holidays.length > 0) {
    const federal = holidays.find(h => h.category === 'federal');
    if (federal) {
      suggestions.push(`${federal.emoji} ${federal.name} - Most offices closed`);
    }
  }

  // Add extended weekend suggestions
  if (extendedWeekend) {
    suggestions.push(extendedWeekend.suggestion || 'Extended weekend opportunity!');
  }

  // Add personal event suggestions
  if (personalEvents.length > 0) {
    for (const pe of personalEvents) {
      suggestions.push(`${pe.emoji} ${pe.name}${pe.description ? ` - ${pe.description}` : ''}`);
    }
  }

  // Weekend suggestions
  if (dayOfWeek === 5) {
    // Check if next Monday is a holiday
    const nextMonday = new Date(date);
    nextMonday.setDate(nextMonday.getDate() + 3);
    if (isFederalHoliday(nextMonday)) {
      const mondayHoliday = getHolidaysForDate(nextMonday)[0];
      suggestions.push(`📅 ${mondayHoliday.name} Monday - 3-day weekend ahead!`);
    }
  }

  return {
    holidays,
    personalEvents,
    extendedWeekend,
    suggestions,
  };
}

/**
 * Get trip planning context for a date range
 */
export function getTripPlanningContext(startDate: Date, endDate: Date): {
  daysOff: number;
  holidaysIncluded: Holiday[];
  weekendDays: number;
  workDaysNeeded: number;
  suggestion: string;
} {
  const oneDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / oneDay) + 1;

  let weekendDays = 0;
  let holidayDays = 0;
  const holidaysIncluded: Holiday[] = [];

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Count weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    }

    // Count holidays
    const dayHolidays = getHolidaysForDate(currentDate).filter(h => h.isWorkOff);
    if (dayHolidays.length > 0 && dayOfWeek !== 0 && dayOfWeek !== 6) {
      holidayDays++;
      holidaysIncluded.push(...dayHolidays);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const daysOff = weekendDays + holidayDays;
  const workDaysNeeded = Math.max(0, totalDays - daysOff);

  let suggestion = '';
  if (workDaysNeeded === 0) {
    suggestion = 'No PTO needed - this trip uses only weekends and holidays!';
  } else if (workDaysNeeded <= 2) {
    suggestion = `Only ${workDaysNeeded} day${workDaysNeeded > 1 ? 's' : ''} of PTO needed for a ${totalDays}-day trip!`;
  } else {
    suggestion = `${workDaysNeeded} days of PTO needed. Consider adjusting dates to include more holidays/weekends.`;
  }

  return {
    daysOff,
    holidaysIncluded,
    weekendDays,
    workDaysNeeded,
    suggestion,
  };
}
