import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ============================================================================
// TYPES - Comprehensive & Future-Proof
// ============================================================================

export type ListItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type List = {
  id: string;
  name: string;
  items: ListItem[];
  createdAt: Date;
  updatedAt: Date;
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  priority: number; // 0-100
  type?: 'work' | 'personal' | 'family' | 'meeting' | 'other';
  sourceListItem?: string;
  breakdownPattern?: string;
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date;
  tags?: string[];
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type?: 'meeting' | 'work' | 'personal' | 'family' | 'other';
  location?: string;
  description?: string;
  attendees?: string[];
  reminder?: number;
  recurring?: boolean;
  recurrence?: RecurrencePattern;
  isAllDay?: boolean;
  timezone?: string;
  templateId?: string;
  priority?: number;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type RecurrencePattern = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  occurrences?: number;
};

export type ConnectorType =
  | 'github' | 'gitlab' | 'bitbucket'
  | 'linear' | 'jira' | 'asana' | 'trello' | 'monday' | 'clickup'
  | 'notion' | 'airtable'
  | 'slack' | 'teams' | 'discord' | 'telegram' | 'zoom'
  | 'figma'
  | 'gdrive' | 'dropbox' | 'box' | 'onedrive'
  | 'google' | 'apple' | 'microsoft' | 'facebook' | 'twitter'
  | 'hubspot' | 'salesforce'
  | 'stripe' | 'shopify'
  | 'aws' | 'gcp' | 'azure'
  | 'canvas'
  | 'custom';

export type Connector = {
  id: string;
  name: string;
  type: ConnectorType;
  connected: boolean;
  token?: string | null;
  lastSync?: Date | null;
  metadata?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Page = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Note = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Board = {
  id: string;
  name: string;
  columns: BoardColumn[];
  createdAt: Date;
  updatedAt: Date;
};

export type BoardColumn = {
  id: string;
  name: string;
  cards: BoardCard[];
};

export type BoardCard = {
  id: string;
  title: string;
  description?: string;
};

export type Flow = {
  id: string;
  name: string;
  trigger: string;
  actions: FlowAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FlowAction = {
  id: string;
  type: string;
  config?: Record<string, unknown>;
};

export type PersonalDate = {
  id: string;
  name: string;
  type: 'birthday' | 'anniversary' | 'memorial' | 'custom';
  month: number;
  day: number;
  year?: number;
  person?: string;
  reminder?: number;
  notes?: string;
};

export type AnalysisResult = {
  conflicts: Conflict[];
  optimizations: Optimization[];
  autoCorrections: AutoCorrection[];
  summary: {
    totalIssues: number;
    criticalCount: number;
    suggestionsCount: number;
    timestamp: Date;
  };
};

export type Conflict = {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  items: ConflictItem[];
  recommendation: {
    action: string;
    suggestedTime?: Date;
    confidence: number;
  };
  analysis: {
    consensus: number;
    modelsConsulted: number;
    reasoning: string[];
    humanCentricScore: number;
  };
};

export type ConflictItem = {
  id: string;
  title: string;
  type: string;
  time?: Date;
  priority: number;
  source?: 'calendar' | 'tasks' | 'lists';
};

export type Optimization = {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
};

export type AutoCorrection = {
  id: string;
  type: 'calendar-update' | 'task-merge' | 'route-optimization';
  action: string;
  changes: unknown[];
  status: 'pending-confirmation' | 'applied' | 'reverted';
  reversible: boolean;
  confidence: number;
};

export type PermissionScope = 'analysis' | 'session' | 'always';

export type Suggestion = {
  id: string;
  type: 'widget-intelligence' | 'integration-workflow' | 'cross-widget';
  priority: 'critical' | 'important' | 'helpful' | 'optional';
  source: {
    widget: string;
    trigger: string;
    relatedWidgets: string[];
  };
  title: string;
  description: string;
  reasoning: string[];
  confidence: number;
  modelConsensus: {
    agreed: number;
    total: number;
    dissent: string[];
  };
  patternFrequency: number;
  firstObserved: Date;
  lastObserved: Date;
  actions: SuggestionAction[];
};

export type SuggestionAction = {
  id: string;
  type: string;
  label: string;
  execute: () => void;
};

// ============================================================================
// STORE STATE
// ============================================================================

type WorkspaceState = {
  // Data
  lists: List[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  connectors: Connector[];
  pages: Page[];
  notes: Note[];
  boards: Board[];
  flows: Flow[];
  personalDates: PersonalDate[];
  analyses: AnalysisResult[];
  suggestions: Suggestion[];

  // UI State
  currentPage: string | null;
  currentBoard: string | null;
  analyzePermission: PermissionScope | null;
  analyzePermissionGrantedAt: Date | null;

  // Metadata
  version: number;
  lastModified: Date;

  // ========================================================================
  // LIST OPERATIONS
  // ========================================================================

  addList: (name: string) => void;
  deleteList: (listId: string) => void;
  addListItem: (listId: string, text: string) => void;
  toggleListItem: (listId: string, itemId: string) => void;
  deleteListItem: (listId: string, itemId: string) => void;
  updateListItem: (listId: string, itemId: string, text: string) => void;

  // ========================================================================
  // TASK OPERATIONS
  // ========================================================================

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  toggleTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;

  // ========================================================================
  // CALENDAR OPERATIONS
  // ========================================================================

  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCalendarEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (eventId: string) => void;

  // ========================================================================
  // CONNECTOR OPERATIONS
  // ========================================================================

  addConnector: (connector: Partial<Connector>) => void;
  removeConnector: (connectorId: string) => void;
  updateConnectorPAT: (connectorId: string, token: string) => void;
  toggleConnector: (connectorId: string) => void;
  syncConnector: (connectorId: string) => void;

  // ========================================================================
  // PAGE OPERATIONS
  // ========================================================================

  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  setCurrentPage: (pageId: string | null) => void;

  // ========================================================================
  // NOTE OPERATIONS
  // ========================================================================

  addNote: (content: string) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;

  // ========================================================================
  // BOARD OPERATIONS
  // ========================================================================

  addBoard: (name: string) => void;
  deleteBoard: (boardId: string) => void;
  setCurrentBoard: (boardId: string | null) => void;
  addColumn: (boardId: string, name: string) => void;
  addCard: (boardId: string, columnId: string, title: string) => void;
  moveCard: (boardId: string, cardId: string, toColumnId: string) => void;

  // ========================================================================
  // FLOW OPERATIONS
  // ========================================================================

  addFlow: (name: string, trigger: string) => void;
  toggleFlow: (flowId: string) => void;
  deleteFlow: (flowId: string) => void;
  addFlowAction: (flowId: string, action: Omit<FlowAction, 'id'>) => void;

  // ========================================================================
  // PERSONAL DATE OPERATIONS
  // ========================================================================

  addPersonalDate: (date: Omit<PersonalDate, 'id'>) => void;
  updatePersonalDate: (id: string, updates: Partial<PersonalDate>) => void;
  deletePersonalDate: (id: string) => void;

  // ========================================================================
  // SUGGESTION OPERATIONS
  // ========================================================================

  addSuggestion: (suggestion: Suggestion) => void;
  dismissSuggestion: (id: string) => void;
  acceptSuggestion: (id: string) => void;
  getSuggestionsByWidget: (widget: string) => Suggestion[];

  // ========================================================================
  // ANALYZE OPERATIONS
  // ========================================================================

  hasAnalyzePermission: () => boolean;
  grantAnalyzePermission: (scope: PermissionScope) => void;
  revokeAnalyzePermission: () => void;
  addAnalysis: (result: AnalysisResult) => void;
  clearAnalyses: () => void;

  // ========================================================================
  // UTILITY OPERATIONS
  // ========================================================================

  clearAll: () => void;
  exportData: () => ExportableState;
  importData: (data: Partial<ExportableState>) => void;
};

type ExportableState = Pick<WorkspaceState,
  | 'lists'
  | 'tasks'
  | 'calendarEvents'
  | 'connectors'
  | 'pages'
  | 'notes'
  | 'boards'
  | 'flows'
  | 'personalDates'
  | 'version'
  | 'lastModified'
>;

// ============================================================================
// HELPERS
// ============================================================================

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const now = (): Date => new Date();

// ============================================================================
// DEFAULT STATE
// ============================================================================

const getDefaultState = () => ({
  lists: [
    {
      id: 'default-list-1',
      name: 'Research',
      items: [
        { id: '1-1', text: 'Read market analysis', done: false, createdAt: now(), updatedAt: now() },
        { id: '1-2', text: 'Review competitors', done: true, createdAt: now(), updatedAt: now() },
      ],
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'default-list-2',
      name: 'Delivery',
      items: [
        { id: '2-1', text: 'Ship MVP', done: false, createdAt: now(), updatedAt: now() }
      ],
      createdAt: now(),
      updatedAt: now(),
    },
  ] as List[],
  tasks: [
    { id: 'task-1', title: 'Quick add', done: false, priority: 75, type: 'work' as const, createdAt: now(), updatedAt: now() },
    { id: 'task-2', title: 'Set milestone', done: false, priority: 50, type: 'work' as const, createdAt: now(), updatedAt: now() },
    { id: 'task-3', title: 'Review blockers', done: true, priority: 25, type: 'work' as const, createdAt: now(), updatedAt: now() },
  ] as Task[],
  calendarEvents: [] as CalendarEvent[],
  connectors: [] as Connector[],
  pages: [
    { id: 'default-page', title: 'Welcome', content: '# Welcome\n\nStart writing...', createdAt: now(), updatedAt: now() },
  ] as Page[],
  notes: [] as Note[],
  boards: [
    {
      id: 'default-board',
      name: 'Project Board',
      columns: [
        { id: 'col-1', name: 'To Do', cards: [] },
        { id: 'col-2', name: 'In Progress', cards: [] },
        { id: 'col-3', name: 'Done', cards: [] },
      ],
      createdAt: now(),
      updatedAt: now(),
    },
  ] as Board[],
  flows: [] as Flow[],
  personalDates: [] as PersonalDate[],
  analyses: [] as AnalysisResult[],
  suggestions: [] as Suggestion[],
  currentPage: 'default-page',
  currentBoard: 'default-board',
  analyzePermission: null as PermissionScope | null,
  analyzePermissionGrantedAt: null as Date | null,
  version: 1,
  lastModified: now(),
});

// ============================================================================
// CREATE STORE
// ============================================================================

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    immer((set, get) => ({
      ...getDefaultState(),

      // ========================================================================
      // LIST OPERATIONS
      // ========================================================================

      addList: (name: string) =>
        set((state) => {
          state.lists.push({
            id: generateId(),
            name,
            items: [],
            createdAt: now(),
            updatedAt: now(),
          });
          state.lastModified = now();
        }),

      deleteList: (listId: string) =>
        set((state) => {
          state.lists = state.lists.filter(l => l.id !== listId);
          state.lastModified = now();
        }),

      addListItem: (listId: string, text: string) =>
        set((state) => {
          const list = state.lists.find(l => l.id === listId);
          if (list) {
            list.items.push({
              id: generateId(),
              text,
              done: false,
              createdAt: now(),
              updatedAt: now(),
            });
            list.updatedAt = now();
            state.lastModified = now();
          }
        }),

      toggleListItem: (listId: string, itemId: string) =>
        set((state) => {
          const list = state.lists.find(l => l.id === listId);
          if (list) {
            const item = list.items.find(i => i.id === itemId);
            if (item) {
              item.done = !item.done;
              item.updatedAt = now();
              list.updatedAt = now();
              state.lastModified = now();
            }
          }
        }),

      deleteListItem: (listId: string, itemId: string) =>
        set((state) => {
          const list = state.lists.find(l => l.id === listId);
          if (list) {
            list.items = list.items.filter(i => i.id !== itemId);
            list.updatedAt = now();
            state.lastModified = now();
          }
        }),

      updateListItem: (listId: string, itemId: string, text: string) =>
        set((state) => {
          const list = state.lists.find(l => l.id === listId);
          if (list) {
            const item = list.items.find(i => i.id === itemId);
            if (item) {
              item.text = text;
              item.updatedAt = now();
              list.updatedAt = now();
              state.lastModified = now();
            }
          }
        }),

      // ========================================================================
      // TASK OPERATIONS
      // ========================================================================

      addTask: (task) =>
        set((state) => {
          state.tasks.push({
            ...task,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
          });
          state.lastModified = now();
        }),

      toggleTask: (taskId: string) =>
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            task.done = !task.done;
            task.updatedAt = now();
            state.lastModified = now();
          }
        }),

      updateTask: (taskId: string, updates: Partial<Task>) =>
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (task) {
            Object.assign(task, { ...updates, updatedAt: now() });
            state.lastModified = now();
          }
        }),

      deleteTask: (taskId: string) =>
        set((state) => {
          state.tasks = state.tasks.filter(t => t.id !== taskId);
          state.lastModified = now();
        }),

      // ========================================================================
      // CALENDAR OPERATIONS
      // ========================================================================

      addCalendarEvent: (event) =>
        set((state) => {
          state.calendarEvents.push({
            ...event,
            id: generateId(),
            start: event.start instanceof Date ? event.start : new Date(event.start),
            end: event.end instanceof Date ? event.end : new Date(event.end),
            createdAt: now(),
            updatedAt: now(),
          });
          state.lastModified = now();
        }),

      updateCalendarEvent: (eventId: string, updates: Partial<CalendarEvent>) =>
        set((state) => {
          const event = state.calendarEvents.find(e => e.id === eventId);
          if (event) {
            Object.assign(event, {
              ...updates,
              start: updates.start
                ? (updates.start instanceof Date ? updates.start : new Date(updates.start))
                : event.start,
              end: updates.end
                ? (updates.end instanceof Date ? updates.end : new Date(updates.end))
                : event.end,
              updatedAt: now(),
            });
            state.lastModified = now();
          }
        }),

      deleteCalendarEvent: (eventId: string) =>
        set((state) => {
          state.calendarEvents = state.calendarEvents.filter(e => e.id !== eventId);
          state.lastModified = now();
        }),

      // ========================================================================
      // CONNECTOR OPERATIONS
      // ========================================================================

      addConnector: (connector) =>
        set((state) => {
          state.connectors.push({
            id: connector.id || generateId(),
            name: connector.name || 'New Connector',
            type: connector.type || 'custom',
            connected: connector.connected ?? false,
            token: connector.token || null,
            lastSync: connector.lastSync || null,
            metadata: connector.metadata || {},
            createdAt: now(),
            updatedAt: now(),
          });
          state.lastModified = now();
        }),

      removeConnector: (connectorId: string) =>
        set((state) => {
          state.connectors = state.connectors.filter(c => c.id !== connectorId);
          state.lastModified = now();
        }),

      updateConnectorPAT: (connectorId: string, token: string) =>
        set((state) => {
          const connector = state.connectors.find(c => c.id === connectorId);
          if (connector) {
            connector.token = token;
            connector.updatedAt = now();
            state.lastModified = now();
          }
        }),

      toggleConnector: (connectorId: string) =>
        set((state) => {
          const connector = state.connectors.find(c => c.id === connectorId);
          if (connector) {
            connector.connected = !connector.connected;
            connector.lastSync = connector.connected ? now() : connector.lastSync;
            connector.updatedAt = now();
            state.lastModified = now();
          }
        }),

      syncConnector: (connectorId: string) =>
        set((state) => {
          const connector = state.connectors.find(c => c.id === connectorId);
          if (connector) {
            connector.lastSync = now();
            connector.updatedAt = now();
            state.lastModified = now();
          }
        }),

      // ========================================================================
      // PAGE OPERATIONS
      // ========================================================================

      addPage: (page) =>
        set((state) => {
          const newPage = {
            ...page,
            id: generateId(),
            createdAt: now(),
            updatedAt: now(),
          };
          state.pages.push(newPage);
          state.currentPage = newPage.id;
          state.lastModified = now();
        }),

      updatePage: (pageId: string, updates: Partial<Page>) =>
        set((state) => {
          const page = state.pages.find(p => p.id === pageId);
          if (page) {
            Object.assign(page, { ...updates, updatedAt: now() });
            state.lastModified = now();
          }
        }),

      deletePage: (pageId: string) =>
        set((state) => {
          state.pages = state.pages.filter(p => p.id !== pageId);
          if (state.currentPage === pageId) {
            state.currentPage = state.pages[0]?.id || null;
          }
          state.lastModified = now();
        }),

      setCurrentPage: (pageId: string | null) =>
        set((state) => {
          state.currentPage = pageId;
        }),

      // ========================================================================
      // NOTE OPERATIONS
      // ========================================================================

      addNote: (content: string) =>
        set((state) => {
          state.notes.push({
            id: generateId(),
            content,
            createdAt: now(),
            updatedAt: now(),
          });
          state.lastModified = now();
        }),

      updateNote: (noteId: string, content: string) =>
        set((state) => {
          const note = state.notes.find(n => n.id === noteId);
          if (note) {
            note.content = content;
            note.updatedAt = now();
            state.lastModified = now();
          }
        }),

      deleteNote: (noteId: string) =>
        set((state) => {
          state.notes = state.notes.filter(n => n.id !== noteId);
          state.lastModified = now();
        }),

      // ========================================================================
      // BOARD OPERATIONS
      // ========================================================================

      addBoard: (name: string) =>
        set((state) => {
          const newBoard: Board = {
            id: generateId(),
            name,
            columns: [
              { id: generateId(), name: 'To Do', cards: [] },
              { id: generateId(), name: 'In Progress', cards: [] },
              { id: generateId(), name: 'Done', cards: [] },
            ],
            createdAt: now(),
            updatedAt: now(),
          };
          state.boards.push(newBoard);
          state.currentBoard = newBoard.id;
          state.lastModified = now();
        }),

      deleteBoard: (boardId: string) =>
        set((state) => {
          state.boards = state.boards.filter(b => b.id !== boardId);
          if (state.currentBoard === boardId) {
            state.currentBoard = state.boards[0]?.id || null;
          }
          state.lastModified = now();
        }),

      setCurrentBoard: (boardId: string | null) =>
        set((state) => {
          state.currentBoard = boardId;
        }),

      addColumn: (boardId: string, name: string) =>
        set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (board) {
            board.columns.push({ id: generateId(), name, cards: [] });
            board.updatedAt = now();
            state.lastModified = now();
          }
        }),

      addCard: (boardId: string, columnId: string, title: string) =>
        set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (board) {
            const column = board.columns.find(c => c.id === columnId);
            if (column) {
              column.cards.push({
                id: generateId(),
                title,
              });
              board.updatedAt = now();
              state.lastModified = now();
            }
          }
        }),

      moveCard: (boardId: string, cardId: string, toColumnId: string) =>
        set((state) => {
          const board = state.boards.find(b => b.id === boardId);
          if (!board) return;

          let cardToMove: BoardCard | undefined;

          // Remove card from current column
          for (const column of board.columns) {
            const cardIndex = column.cards.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
              cardToMove = column.cards[cardIndex];
              column.cards.splice(cardIndex, 1);
              break;
            }
          }

          // Add card to target column
          if (cardToMove) {
            const targetColumn = board.columns.find(c => c.id === toColumnId);
            if (targetColumn) {
              targetColumn.cards.push(cardToMove);
              board.updatedAt = now();
              state.lastModified = now();
            }
          }
        }),

      // ========================================================================
      // FLOW OPERATIONS
      // ========================================================================

      addFlow: (name: string, trigger: string) =>
        set((state) => {
          state.flows.push({
            id: generateId(),
            name,
            trigger,
            actions: [],
            enabled: false,
            createdAt: now(),
            updatedAt: now(),
          });
          state.lastModified = now();
        }),

      toggleFlow: (flowId: string) =>
        set((state) => {
          const flow = state.flows.find(f => f.id === flowId);
          if (flow) {
            flow.enabled = !flow.enabled;
            flow.updatedAt = now();
            state.lastModified = now();
          }
        }),

      deleteFlow: (flowId: string) =>
        set((state) => {
          state.flows = state.flows.filter(f => f.id !== flowId);
          state.lastModified = now();
        }),

      addFlowAction: (flowId: string, action: Omit<FlowAction, 'id'>) =>
        set((state) => {
          const flow = state.flows.find(f => f.id === flowId);
          if (flow) {
            flow.actions.push({
              ...action,
              id: generateId(),
            });
            flow.updatedAt = now();
            state.lastModified = now();
          }
        }),

      // ========================================================================
      // PERSONAL DATE OPERATIONS
      // ========================================================================

      addPersonalDate: (date) =>
        set((state) => {
          state.personalDates.push({
            ...date,
            id: generateId(),
          });
          state.lastModified = now();
        }),

      updatePersonalDate: (id: string, updates: Partial<PersonalDate>) =>
        set((state) => {
          const date = state.personalDates.find(d => d.id === id);
          if (date) {
            Object.assign(date, updates);
            state.lastModified = now();
          }
        }),

      deletePersonalDate: (id: string) =>
        set((state) => {
          state.personalDates = state.personalDates.filter(d => d.id !== id);
          state.lastModified = now();
        }),

      // ========================================================================
      // SUGGESTION OPERATIONS
      // ========================================================================

      addSuggestion: (suggestion: Suggestion) =>
        set((state) => {
          state.suggestions.push(suggestion);
        }),

      dismissSuggestion: (id: string) =>
        set((state) => {
          state.suggestions = state.suggestions.filter(s => s.id !== id);
        }),

      acceptSuggestion: (id: string) => {
        const suggestion = get().suggestions.find(s => s.id === id);
        if (suggestion && suggestion.actions.length > 0) {
          suggestion.actions[0].execute();
        }
        set((state) => {
          state.suggestions = state.suggestions.filter(s => s.id !== id);
        });
      },

      getSuggestionsByWidget: (widget: string) => {
        return get().suggestions.filter(s => s.source.widget === widget);
      },

      // ========================================================================
      // ANALYZE OPERATIONS
      // ========================================================================

      hasAnalyzePermission: () => {
        const { analyzePermission, analyzePermissionGrantedAt } = get();

        if (!analyzePermission) return false;

        if (analyzePermission === 'analysis') {
          return false;
        }

        if (analyzePermission === 'session' && analyzePermissionGrantedAt) {
          const hoursSinceGrant =
            (Date.now() - new Date(analyzePermissionGrantedAt).getTime()) / (1000 * 60 * 60);
          return hoursSinceGrant < 24;
        }

        return analyzePermission === 'always';
      },

      grantAnalyzePermission: (scope: PermissionScope) =>
        set((state) => {
          state.analyzePermission = scope;
          state.analyzePermissionGrantedAt = now();
        }),

      revokeAnalyzePermission: () =>
        set((state) => {
          state.analyzePermission = null;
          state.analyzePermissionGrantedAt = null;
        }),

      addAnalysis: (result: AnalysisResult) =>
        set((state) => {
          state.analyses.push(result);
          state.lastModified = now();
        }),

      clearAnalyses: () =>
        set((state) => {
          state.analyses = [];
        }),

      // ========================================================================
      // UTILITY OPERATIONS
      // ========================================================================

      clearAll: () =>
        set(() => getDefaultState()),

      exportData: () => {
        const state = get();
        return {
          lists: state.lists,
          tasks: state.tasks,
          calendarEvents: state.calendarEvents,
          connectors: state.connectors,
          pages: state.pages,
          notes: state.notes,
          boards: state.boards,
          flows: state.flows,
          personalDates: state.personalDates,
          version: state.version,
          lastModified: state.lastModified,
        };
      },

      importData: (data: Partial<ExportableState>) =>
        set((state) => {
          if (data.lists) state.lists = data.lists;
          if (data.tasks) state.tasks = data.tasks;
          if (data.calendarEvents) state.calendarEvents = data.calendarEvents;
          if (data.connectors) state.connectors = data.connectors;
          if (data.pages) state.pages = data.pages;
          if (data.notes) state.notes = data.notes;
          if (data.boards) state.boards = data.boards;
          if (data.flows) state.flows = data.flows;
          if (data.personalDates) state.personalDates = data.personalDates;
          state.lastModified = now();
        }),
    })),
    {
      name: 'ryuzen-workspace-v1',
      storage: createJSONStorage(() => localStorage, {
        reviver: (_key, value) => {
          // Revive Date objects from ISO strings
          if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) return date;
          }
          return value;
        },
      }),
      partialize: (state) => ({
        lists: state.lists,
        tasks: state.tasks,
        calendarEvents: state.calendarEvents,
        connectors: state.connectors,
        pages: state.pages,
        notes: state.notes,
        boards: state.boards,
        flows: state.flows,
        personalDates: state.personalDates,
        analyses: state.analyses,
        analyzePermission: state.analyzePermission,
        analyzePermissionGrantedAt: state.analyzePermissionGrantedAt,
        version: state.version,
        lastModified: state.lastModified,
      }),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          return {
            ...(persistedState as object),
            version: 1,
          };
        }
        return persistedState as WorkspaceState;
      },
    }
  )
);

// ============================================================================
// SELECTORS (for optimized component rendering)
// ============================================================================

export const useListsOnly = () => useWorkspaceStore(state => state.lists);
export const useTasksOnly = () => useWorkspaceStore(state => state.tasks);
export const useCalendarOnly = () => useWorkspaceStore(state => state.calendarEvents);
export const useConnectorsOnly = () => useWorkspaceStore(state => state.connectors);
export const usePagesOnly = () => useWorkspaceStore(state => state.pages);
export const useNotesOnly = () => useWorkspaceStore(state => state.notes);
export const useBoardsOnly = () => useWorkspaceStore(state => state.boards);
export const useFlowsOnly = () => useWorkspaceStore(state => state.flows);
