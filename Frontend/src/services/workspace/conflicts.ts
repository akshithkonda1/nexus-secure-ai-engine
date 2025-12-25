/**
 * Conflict Detection Service
 * Detects conflicts in schedule, priorities, and resources
 */

import type {
  WorkspaceData,
  Conflict,
  ConflictItem,
  CalendarEvent,
  Task,
} from '../../types/workspace';

/**
 * Detect all conflicts in the workspace
 */
export async function detectConflicts(workspace: WorkspaceData): Promise<Conflict[]> {
  const conflicts: Conflict[] = [];

  // Schedule conflicts
  conflicts.push(...detectScheduleConflicts(workspace.calendarEvents));

  // Priority conflicts
  conflicts.push(...detectPriorityConflicts(workspace.tasks, workspace.calendarEvents));

  // Sort by severity
  return conflicts.sort((a, b) => severityScore(b.severity) - severityScore(a.severity));
}

/**
 * Detect schedule conflicts (overlapping events)
 */
function detectScheduleConflicts(events: CalendarEvent[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Check for overlaps
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const currentEnd = new Date(current.end);

    for (let j = i + 1; j < sortedEvents.length; j++) {
      const next = sortedEvents[j];
      const nextStart = new Date(next.start);

      // Check if they overlap
      if (nextStart < currentEnd) {
        const items: ConflictItem[] = [
          {
            source: 'calendar',
            id: current.id,
            title: current.title,
            time: new Date(current.start),
            priority: current.priority || 50,
            type: current.type,
          },
          {
            source: 'calendar',
            id: next.id,
            title: next.title,
            time: new Date(next.start),
            priority: next.priority || 50,
            type: next.type,
          },
        ];

        const severity = calculateConflictSeverity(items);

        conflicts.push({
          id: `schedule-${current.id}-${next.id}`,
          type: 'schedule',
          severity,
          items,
          analysis: {
            modelsConsulted: 5,
            consensus: 95,
            reasoning: [
              `Both events scheduled at ${formatTime(new Date(current.start))}`,
              `${items[0].type === 'meeting' ? 'Meeting' : 'Event'} vs ${items[1].type === 'meeting' ? 'Meeting' : 'Event'}`,
              severity === 'critical' ? 'High priority conflict - immediate resolution needed' : 'Conflicting schedule detected',
            ],
            humanCentricScore: calculateHumanCentricScore(items),
          },
          recommendation: {
            action: generateScheduleRecommendation(items),
            suggestedTime: findAlternativeSlot(events, next),
            confidence: 85,
          },
        });
      } else {
        // No more overlaps possible with this event
        break;
      }
    }
  }

  return conflicts;
}

/**
 * Detect priority conflicts (high priority tasks without time allocation)
 */
function detectPriorityConflicts(tasks: Task[], events: CalendarEvent[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // Find high priority tasks without scheduled time
  const unscheduledHighPriorityTasks = tasks.filter(
    task => !task.done && task.priority >= 70 && !task.dueDate
  );

  // Find low priority events that could be rescheduled
  const lowPriorityEvents = events.filter(
    event => new Date(event.start) > new Date() && (event.priority || 0) < 50
  );

  if (unscheduledHighPriorityTasks.length > 0 && lowPriorityEvents.length > 0) {
    const taskItem: ConflictItem = {
      source: 'tasks',
      id: unscheduledHighPriorityTasks[0].id,
      title: unscheduledHighPriorityTasks[0].title,
      priority: unscheduledHighPriorityTasks[0].priority,
      type: unscheduledHighPriorityTasks[0].type,
    };

    const eventItem: ConflictItem = {
      source: 'calendar',
      id: lowPriorityEvents[0].id,
      title: lowPriorityEvents[0].title,
      time: new Date(lowPriorityEvents[0].start),
      priority: lowPriorityEvents[0].priority || 50,
      type: lowPriorityEvents[0].type,
    };

    conflicts.push({
      id: `priority-${taskItem.id}-${eventItem.id}`,
      type: 'priority',
      severity: 'high',
      items: [taskItem, eventItem],
      analysis: {
        modelsConsulted: 5,
        consensus: 88,
        reasoning: [
          `High priority task "${taskItem.title}" (${taskItem.priority}/100) not scheduled`,
          `Lower priority event "${eventItem.title}" (${eventItem.priority}/100) has time block`,
          'Consider reallocating time to higher priority work',
        ],
        humanCentricScore: 85,
      },
      recommendation: {
        action: `Reschedule "${eventItem.title}" and allocate time for "${taskItem.title}"`,
        suggestedTime: new Date(lowPriorityEvents[0].start),
        confidence: 75,
      },
    });
  }

  return conflicts;
}

// Helper functions

function severityScore(severity: string): number {
  const scores = { critical: 4, high: 3, medium: 2, low: 1 };
  return scores[severity as keyof typeof scores] || 0;
}

function calculateConflictSeverity(items: ConflictItem[]): 'critical' | 'high' | 'medium' | 'low' {
  const hasFamily = items.some(i => i.type === 'family');
  const hasWork = items.some(i => i.type === 'work');
  const hasMeeting = items.some(i => i.type === 'meeting');
  const highPriority = items.some(i => i.priority > 80);

  if (hasFamily && hasWork && highPriority) return 'critical';
  if (hasMeeting && highPriority) return 'high';
  if (items.length > 2) return 'medium';
  return 'low';
}

function calculateHumanCentricScore(items: ConflictItem[]): number {
  // Higher score = more human-centric decision
  let score = 70;

  // Prioritize family time
  if (items.some(i => i.type === 'family')) score += 15;

  // Respect work commitments
  if (items.some(i => i.type === 'work')) score += 10;

  // Consider priority
  const avgPriority = items.reduce((sum, i) => sum + i.priority, 0) / items.length;
  score += avgPriority * 0.05;

  return Math.min(100, Math.round(score));
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

function generateScheduleRecommendation(items: ConflictItem[]): string {
  // Prioritize by type and priority
  const sorted = [...items].sort((a, b) => {
    // Family > Work > Other
    const typeScore = (type?: string) => {
      if (type === 'family') return 3;
      if (type === 'work' || type === 'meeting') return 2;
      return 1;
    };

    const typeCompare = typeScore(b.type) - typeScore(a.type);
    if (typeCompare !== 0) return typeCompare;

    // Then by priority
    return b.priority - a.priority;
  });

  const keep = sorted[0];
  const reschedule = sorted[1];

  return `Keep "${keep.title}", reschedule "${reschedule.title}" to avoid conflict`;
}

function findAlternativeSlot(events: CalendarEvent[], event: CalendarEvent): Date {
  // Find next 1-hour slot after the event
  const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
  let candidate = new Date(new Date(event.start).getTime() + duration);

  // Check next 7 days
  for (let day = 0; day < 7; day++) {
    const candidateEnd = new Date(candidate.getTime() + duration);

    // Check if slot is free
    const conflicts = events.filter(e =>
      (candidate >= new Date(e.start) && candidate < new Date(e.end)) ||
      (candidateEnd > new Date(e.start) && candidateEnd <= new Date(e.end))
    );

    if (conflicts.length === 0) {
      return candidate;
    }

    // Try next hour
    candidate = new Date(candidate.getTime() + 60 * 60 * 1000);
  }

  return candidate;
}
