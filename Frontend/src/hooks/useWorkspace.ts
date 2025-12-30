/**
 * Workspace State Management
 * Re-exports unified workspace store for backward compatibility
 *
 * This file maintains the same API as the original useWorkspace hook
 * while delegating to the new unified workspaceStore.
 */

import { useWorkspaceStore } from '../stores/workspaceStore';

// Re-export the main hook with the original name for backward compatibility
export const useWorkspace = useWorkspaceStore;

// Re-export all selectors for optimized component rendering
export {
  useListsOnly,
  useTasksOnly,
  useCalendarOnly,
  useConnectorsOnly,
  usePagesOnly,
  useNotesOnly,
  useBoardsOnly,
  useFlowsOnly,
} from '../stores/workspaceStore';

// Re-export all types for convenience
export type {
  ListItem,
  List,
  Task,
  CalendarEvent,
  RecurrencePattern,
  ConnectorType,
  Connector,
  Page,
  Note,
  Board,
  BoardColumn,
  BoardCard,
  Flow,
  FlowAction,
  PersonalDate,
  AnalysisResult,
  Conflict,
  ConflictItem,
  Optimization,
  AutoCorrection,
  PermissionScope,
  Suggestion,
  SuggestionAction,
} from '../stores/workspaceStore';
