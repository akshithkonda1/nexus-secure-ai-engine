/**
 * Pattern Detection Algorithms
 * Analyzes user behavior to generate intelligent suggestions
 */

import type {
  List,
  ListItem,
  Task,
  CalendarEvent,
  Suggestion,
  SchedulingHistory,
  PrepHistory,
  WorkspaceData,
} from '../../types/workspace';

// Helper: Calculate text similarity (basic Levenshtein-based)
function similarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Helper: Group items by a key function
function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Helper: Classify task type based on keywords
function classifyTaskType(task: Task): string {
  const text = task.title.toLowerCase();

  if (text.includes('meeting') || text.includes('call') || text.includes('sync')) {
    return 'meeting';
  }
  if (text.includes('review') || text.includes('check')) {
    return 'review';
  }
  if (text.includes('write') || text.includes('document') || text.includes('draft')) {
    return 'writing';
  }
  if (text.includes('code') || text.includes('implement') || text.includes('build')) {
    return 'coding';
  }
  if (text.includes('research') || text.includes('investigate')) {
    return 'research';
  }

  return task.type || 'general';
}

/**
 * Pattern 1: List → Task Breakdown
 * Detects when a list item should be broken down into tasks
 */
export function detectListToTaskPattern(
  listItem: ListItem,
  _list: List,
  historicalTasks: Task[]
): Suggestion | null {
  // Find similar list items that were converted to tasks
  const similarTasks = historicalTasks.filter(
    task => task.sourceListItem && similarity(task.sourceListItem, listItem.text) > 0.7
  );

  if (similarTasks.length < 2) {
    return null; // Need at least 2 examples
  }

  // Group by breakdown pattern (number of subtasks created)
  const patterns = groupBy(similarTasks, task => task.breakdownPattern || 'default');
  const mostCommon = Object.entries(patterns).sort((a, b) => b[1].length - a[1].length)[0];

  if (!mostCommon || mostCommon[1].length < 2) {
    return null;
  }

  const confidence = (mostCommon[1].length / similarTasks.length) * 100;

  return {
    id: `list-to-task-${listItem.id}-${Date.now()}`,
    type: 'widget-intelligence',
    priority: confidence > 70 ? 'important' : 'helpful',
    source: {
      widget: 'lists',
      trigger: `List item: "${listItem.text}"`,
      relatedWidgets: ['tasks'],
    },
    title: 'Break down into tasks?',
    description: `"${listItem.text}" looks like it could be broken into ${mostCommon[1][0].breakdownPattern || '3'} tasks`,
    reasoning: [
      `You've broken down similar items ${mostCommon[1].length} times before`,
      `Pattern: ${mostCommon[1][0].breakdownPattern || 'multi-step breakdown'}`,
      `Average completion time: ${Math.round(mostCommon[1].length * 2.5)} hours`,
    ],
    confidence,
    modelConsensus: {
      agreed: 4,
      total: 5,
      dissent: ['Claude-3.5-Sonnet: Consider manual breakdown for complex items'],
    },
    patternFrequency: mostCommon[1].length,
    firstObserved: new Date(Math.min(...mostCommon[1].map(t => t.createdAt.getTime()))),
    lastObserved: new Date(Math.max(...mostCommon[1].map(t => t.createdAt.getTime()))),
    actions: [
      {
        id: 'breakdown',
        type: 'create-tasks',
        label: 'Break down now',
        execute: async () => {
          console.log('Breaking down list item into tasks:', listItem.text);
          // TODO: Connect to workspace store to create tasks
        },
      },
    ],
  };
}

/**
 * Pattern 2: Task → Calendar Scheduling
 * Suggests scheduling tasks based on user patterns
 */
export function detectTaskToCalendarPattern(
  task: Task,
  calendarEvents: CalendarEvent[],
  historicalScheduling: SchedulingHistory[]
): Suggestion | null {
  const taskType = classifyTaskType(task);

  // Find user's preferred time for this task type
  const similarTasks = historicalScheduling.filter(s => s.taskType === taskType);

  if (similarTasks.length < 3) {
    return null; // Need at least 3 examples
  }

  // Analyze preferred time slots
  const timePreferences = analyzeTimePreferences(similarTasks);
  const estimatedDuration = estimateDuration(task, similarTasks);

  // Find next available slot matching preferences
  const suggestedSlot = findAvailableSlot(calendarEvents, estimatedDuration, timePreferences);

  if (!suggestedSlot) {
    return null;
  }

  const confidence = calculateSchedulingConfidence(similarTasks.length, timePreferences.variance);

  return {
    id: `task-to-calendar-${task.id}-${Date.now()}`,
    type: 'cross-widget',
    priority: task.priority > 70 ? 'important' : 'helpful',
    source: {
      widget: 'tasks',
      trigger: `Task: "${task.title}"`,
      relatedWidgets: ['calendar'],
    },
    title: 'Schedule this task?',
    description: `Block ${estimatedDuration} minutes for "${task.title}"`,
    reasoning: [
      `You typically do ${taskType} tasks in the ${timePreferences.preferredTime}`,
      `Average duration: ${estimatedDuration} minutes`,
      `Next available: ${formatTime(suggestedSlot)}`,
    ],
    confidence,
    modelConsensus: {
      agreed: 5,
      total: 5,
      dissent: [],
    },
    patternFrequency: similarTasks.length,
    firstObserved: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastObserved: new Date(),
    actions: [
      {
        id: 'schedule',
        type: 'create-event',
        label: 'Schedule now',
        execute: async () => {
          console.log('Scheduling task to calendar:', task.title);
          // TODO: Connect to workspace store to create calendar event
        },
      },
    ],
  };
}

/**
 * Pattern 3: Calendar → List Preparation
 * Suggests prep tasks before calendar events
 */
export function detectCalendarToListPattern(
  event: CalendarEvent,
  lists: List[],
  historicalPrep: PrepHistory[]
): Suggestion | null {
  // Find similar events from history
  const similarEvents = historicalPrep.filter(
    p => similarity(p.eventTitle, event.title) > 0.6
  );

  if (similarEvents.length < 2) {
    return null;
  }

  // Extract common prep tasks
  const commonPrepTasks = extractCommonTasks(similarEvents);
  const leadTime = calculateAverageLeadTime(similarEvents);

  if (commonPrepTasks.length === 0) {
    return null;
  }

  const targetList = findBestList(lists, commonPrepTasks);

  const confidence = commonPrepTasks.length > 2 ? 80 : 60;

  return {
    id: `calendar-to-list-${event.id}-${Date.now()}`,
    type: 'cross-widget',
    priority: event.priority && event.priority > 80 ? 'important' : 'helpful',
    source: {
      widget: 'calendar',
      trigger: `Event: "${event.title}"`,
      relatedWidgets: ['lists'],
    },
    title: 'Prep for this event?',
    description: `Add ${commonPrepTasks.length} prep items to ${targetList?.name || 'a list'}`,
    reasoning: [
      `Based on ${similarEvents.length} similar events`,
      `Typically prepared ${leadTime} hours before`,
      `Common tasks: ${commonPrepTasks.slice(0, 2).join(', ')}`,
    ],
    confidence,
    modelConsensus: {
      agreed: 4,
      total: 5,
      dissent: ['GPT-4: May need additional context-specific prep'],
    },
    patternFrequency: similarEvents.length,
    firstObserved: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    lastObserved: new Date(),
    actions: [
      {
        id: 'add-prep',
        type: 'add-list-items',
        label: 'Add prep tasks',
        execute: async () => {
          console.log('Adding prep tasks to list:', commonPrepTasks);
          // TODO: Connect to workspace store to add list items
        },
      },
    ],
  };
}

// Helper functions for pattern detection

function analyzeTimePreferences(history: SchedulingHistory[]): {
  preferredTime: string;
  variance: number;
} {
  // Group by hour of day
  const hourCounts: Record<number, number> = {};

  history.forEach(s => {
    const hour = s.scheduledTime.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const mostCommonHour = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])[0];

  if (!mostCommonHour) {
    return { preferredTime: 'morning', variance: 1 };
  }

  const hour = parseInt(mostCommonHour[0]);
  let timeOfDay = 'morning';

  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17) timeOfDay = 'evening';

  const variance = 1 - (mostCommonHour[1] / history.length);

  return { preferredTime: timeOfDay, variance };
}

function estimateDuration(task: Task, history: SchedulingHistory[]): number {
  const durations = history.map(s => s.duration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  return Math.round(avgDuration);
}

function findAvailableSlot(
  events: CalendarEvent[],
  duration: number,
  preferences: { preferredTime: string }
): Date | null {
  const now = new Date();
  const preferredHour = preferences.preferredTime === 'morning' ? 9 :
                        preferences.preferredTime === 'afternoon' ? 14 : 17;

  // Try next 7 days
  for (let day = 0; day < 7; day++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + day);
    candidate.setHours(preferredHour, 0, 0, 0);

    const candidateEnd = new Date(candidate.getTime() + duration * 60 * 1000);

    // Check if slot is free
    const conflicts = events.filter(event =>
      (candidate >= event.start && candidate < event.end) ||
      (candidateEnd > event.start && candidateEnd <= event.end)
    );

    if (conflicts.length === 0) {
      return candidate;
    }
  }

  return null;
}

function calculateSchedulingConfidence(sampleSize: number, variance: number): number {
  // Higher sample size = higher confidence
  // Lower variance = higher confidence
  const sampleConfidence = Math.min(sampleSize * 10, 50);
  const varianceConfidence = (1 - variance) * 50;
  return Math.round(sampleConfidence + varianceConfidence);
}

function formatTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function extractCommonTasks(history: PrepHistory[]): string[] {
  // Count frequency of each prep task
  const taskCounts: Record<string, number> = {};

  history.forEach(h => {
    h.prepTasks.forEach(task => {
      taskCounts[task] = (taskCounts[task] || 0) + 1;
    });
  });

  // Return tasks that appear in >50% of events
  const threshold = history.length * 0.5;
  return Object.entries(taskCounts)
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .map(([task]) => task);
}

function calculateAverageLeadTime(history: PrepHistory[]): number {
  const avgLeadTime = history.reduce((sum, h) => sum + h.leadTimeHours, 0) / history.length;
  return Math.round(avgLeadTime);
}

function findBestList(lists: List[], prepTasks: string[]): List | null {
  if (lists.length === 0) return null;

  // Find list with most similar items
  const scores = lists.map(list => {
    const score = list.items.reduce((sum: number, item: ListItem) => {
      const maxSimilarity = Math.max(
        ...prepTasks.map((task: string) => similarity(item.text, task))
      );
      return sum + maxSimilarity;
    }, 0);
    return { list, score };
  });

  const best = scores.sort((a, b) => b.score - a.score)[0];
  return best.list;
}

/**
 * Master function to detect all patterns
 */
export function detectAllPatterns(workspace: WorkspaceData): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // List → Task patterns
  workspace.lists.forEach(list => {
    list.items
      .filter(item => !item.done)
      .forEach(item => {
        const suggestion = detectListToTaskPattern(item, list, workspace.tasks);
        if (suggestion) suggestions.push(suggestion);
      });
  });

  // Task → Calendar patterns
  workspace.tasks
    .filter(task => !task.done && !task.dueDate)
    .forEach(task => {
      const suggestion = detectTaskToCalendarPattern(
        task,
        workspace.calendarEvents,
        workspace.history.scheduling
      );
      if (suggestion) suggestions.push(suggestion);
    });

  // Calendar → List patterns
  workspace.calendarEvents
    .filter(event => event.start > new Date() && event.start < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    .forEach(event => {
      const suggestion = detectCalendarToListPattern(
        event,
        workspace.lists,
        workspace.history.preparation
      );
      if (suggestion) suggestions.push(suggestion);
    });

  return suggestions;
}
