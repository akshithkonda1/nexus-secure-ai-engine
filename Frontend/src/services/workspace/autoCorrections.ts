/**
 * Auto-Correction Service
 * Applies AI-recommended corrections to workspace conflicts
 */

import type {
  Conflict,
  Task,
  CalendarEvent,
  List,
  WorkspaceData,
  AutoCorrection,
} from '../../types/workspace';

/**
 * Generate auto-corrections for detected conflicts
 */
export async function generateAutoCorrections(
  conflicts: Conflict[],
  workspace: WorkspaceData
): Promise<AutoCorrection[]> {
  const corrections: AutoCorrection[] = [];

  for (const conflict of conflicts) {
    if (conflict.type === 'schedule') {
      corrections.push(...generateScheduleCorrections(conflict, workspace));
    } else if (conflict.type === 'priority') {
      corrections.push(...generatePriorityCorrections(conflict, workspace));
    }
  }

  return corrections;
}

/**
 * Generate corrections for schedule conflicts
 */
function generateScheduleCorrections(
  conflict: Conflict,
  workspace: WorkspaceData
): AutoCorrection[] {
  const corrections: AutoCorrection[] = [];

  // Find which event to reschedule based on priority
  const items = [...conflict.items].sort((a, b) => b.priority - a.priority);
  const keep = items[0];
  const reschedule = items[1];

  if (reschedule.source === 'calendar') {
    const event = workspace.calendarEvents.find(e => e.id === reschedule.id);
    if (!event) return corrections;

    corrections.push({
      id: `correction-${conflict.id}`,
      conflictId: conflict.id,
      type: 'reschedule',
      targetId: reschedule.id,
      targetType: 'calendar',
      action: {
        type: 'update',
        field: 'start',
        oldValue: event.start,
        newValue: conflict.recommendation.suggestedTime || event.start,
      },
      reason: `Conflicts with higher priority ${keep.type}: "${keep.title}"`,
      confidence: conflict.recommendation.confidence,
      requiresConfirmation: conflict.severity === 'critical',
    });

    // Also update end time
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
    const newStart = conflict.recommendation.suggestedTime || new Date(event.start);
    const newEnd = new Date(newStart.getTime() + duration);

    corrections.push({
      id: `correction-${conflict.id}-end`,
      conflictId: conflict.id,
      type: 'reschedule',
      targetId: reschedule.id,
      targetType: 'calendar',
      action: {
        type: 'update',
        field: 'end',
        oldValue: event.end,
        newValue: newEnd,
      },
      reason: 'Update end time to match new start time',
      confidence: conflict.recommendation.confidence,
      requiresConfirmation: false,
    });
  }

  return corrections;
}

/**
 * Generate corrections for priority conflicts
 */
function generatePriorityCorrections(
  conflict: Conflict,
  workspace: WorkspaceData
): AutoCorrection[] {
  const corrections: AutoCorrection[] = [];

  const taskItem = conflict.items.find(item => item.source === 'tasks');
  const eventItem = conflict.items.find(item => item.source === 'calendar');

  if (!taskItem || !eventItem) return corrections;

  const task = workspace.tasks.find(t => t.id === taskItem.id);
  const event = workspace.calendarEvents.find(e => e.id === eventItem.id);

  if (!task || !event) return corrections;

  // Create time block for high priority task
  const suggestedTime = conflict.recommendation.suggestedTime || new Date(event.start);

  corrections.push({
    id: `correction-${conflict.id}-task`,
    conflictId: conflict.id,
    type: 'allocate-time',
    targetId: task.id,
    targetType: 'task',
    action: {
      type: 'create',
      field: 'calendarEvent',
      newValue: {
        title: task.title,
        start: suggestedTime,
        end: new Date(suggestedTime.getTime() + 60 * 60 * 1000), // 1 hour
        type: task.type,
        priority: task.priority,
        sourceTaskId: task.id,
      },
    },
    reason: `Allocate time for high priority task (${task.priority}/100)`,
    confidence: conflict.recommendation.confidence,
    requiresConfirmation: true,
  });

  // Optionally reschedule lower priority event
  if (event.priority && event.priority < 50) {
    corrections.push({
      id: `correction-${conflict.id}-event`,
      conflictId: conflict.id,
      type: 'reschedule',
      targetId: event.id,
      targetType: 'calendar',
      action: {
        type: 'update',
        field: 'start',
        oldValue: event.start,
        newValue: new Date(suggestedTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      },
      reason: `Lower priority event (${event.priority}/100) rescheduled`,
      confidence: conflict.recommendation.confidence * 0.8,
      requiresConfirmation: true,
    });
  }

  return corrections;
}

/**
 * Apply a single auto-correction to the workspace
 */
export async function applyCorrection(
  correction: AutoCorrection,
  workspace: WorkspaceData,
  updateFunctions: {
    updateTask: (id: string, updates: Partial<Task>) => void;
    updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
    addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
    updateList: (id: string, updates: Partial<List>) => void;
  }
): Promise<boolean> {
  try {
    if (correction.action.type === 'update') {
      if (correction.targetType === 'calendar') {
        updateFunctions.updateCalendarEvent(correction.targetId, {
          [correction.action.field]: correction.action.newValue,
        });
      } else if (correction.targetType === 'task') {
        updateFunctions.updateTask(correction.targetId, {
          [correction.action.field]: correction.action.newValue,
        });
      }
    } else if (correction.action.type === 'create') {
      if (correction.action.field === 'calendarEvent' && typeof correction.action.newValue === 'object') {
        updateFunctions.addCalendarEvent(correction.action.newValue);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to apply correction:', error);
    return false;
  }
}

/**
 * Apply multiple corrections in batch
 */
export async function applyCorrections(
  corrections: AutoCorrection[],
  workspace: WorkspaceData,
  updateFunctions: {
    updateTask: (id: string, updates: Partial<Task>) => void;
    updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
    addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
    updateList: (id: string, updates: Partial<List>) => void;
  }
): Promise<{ applied: number; failed: number }> {
  let applied = 0;
  let failed = 0;

  for (const correction of corrections) {
    const success = await applyCorrection(correction, workspace, updateFunctions);
    if (success) {
      applied++;
    } else {
      failed++;
    }
  }

  return { applied, failed };
}

/**
 * Preview what changes a correction will make
 */
export function previewCorrection(correction: AutoCorrection): string {
  if (correction.action.type === 'update') {
    return `Update ${correction.targetType} ${correction.action.field}: ${formatValue(correction.action.oldValue)} → ${formatValue(correction.action.newValue)}`;
  } else if (correction.action.type === 'create') {
    return `Create new ${correction.action.field} for ${correction.targetType}`;
  }
  return 'Unknown correction';
}

function formatValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
