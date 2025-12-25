/**
 * Workspace Type Definitions
 * Ryuzen Workspace Cognitive OS
 */

// Window Types
export type WindowType = 'lists' | 'calendar' | 'connectors' | 'tasks' | 'custom';

export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type StateHistory = {
  timestamp: Date;
  state: unknown;
  action: string;
};

export type Window = {
  id: string;
  type: WindowType;

  // Spatial properties
  position: Position;
  size: Size;
  zIndex: number;

  // State
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isPinned: boolean;

  // Behavior
  persistAcrossModes: boolean;
  canDrag: boolean;
  canResize: boolean;
  canClose: boolean;

  // Content-specific state
  state: unknown;
  history: StateHistory[];

  // Toron integration
  aiAssisted: boolean;
  suggestionLevel: 'off' | 'low' | 'medium' | 'high';
};

export type Layout = {
  name: string;
  windows: {
    id: string;
    position: Position;
    size: Size;
  }[];
};

// Toron Types
export type TierResult = {
  tier: number;
  name: string;
  models: ModelResponse[];
  output: unknown;
};

export type ModelResponse = {
  model: string;
  response: unknown;
  confidence: number;
};

export type Consensus = {
  agreement: number; // 0-100
  modelsAgreed: string[];
  modelsDisagreed: string[];
};

export type Dissent = {
  model: string;
  reasoning: string;
};

export type ToronQueryRequest = {
  query: string;
  scope?: 'widgets' | 'analyze-mode';
  depth?: number; // 1-8 for tiers
  models?: 'all' | 'fast' | 'balanced';
  context?: Record<string, unknown>;
};

export type ToronQueryResponse = {
  query: string;
  tiers: TierResult[];
  consensus: Consensus;
  dissent: Dissent[];
  confidence: number;
  timestamp: string;
};

// Widget Data Types
export type ListItem = {
  id: string;
  text: string;
  done: boolean;
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
  type?: 'work' | 'family' | 'personal' | 'other';
  sourceListItem?: string;
  breakdownPattern?: string;
  createdAt: Date;
  dueDate?: Date;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  priority?: number;
  type?: 'work' | 'family' | 'personal' | 'meeting' | 'other';
  attendees?: string[];
};

export type Connector = {
  id: string;
  name: string;
  type: 'github' | 'linear' | 'notion' | 'slack' | 'other';
  connected: boolean;
  lastSync?: Date;
};

// Focus Mode Data (Private by default)
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
};

export type Board = {
  id: string;
  name: string;
  columns: BoardColumn[];
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
};

export type FlowAction = {
  id: string;
  type: string;
  config: Record<string, unknown>;
};

// Suggestion Types
export type PatternType =
  | 'list-to-task-breakdown'
  | 'task-to-calendar-scheduling'
  | 'calendar-to-list-preparation'
  | 'cross-widget-integration';

export type Action = {
  id: string;
  type: string;
  label: string;
  execute: () => Promise<void>;
};

export type ActionPayload = Omit<Action, 'execute'>;

export type Suggestion = {
  id: string;
  type: 'widget-intelligence' | 'integration-workflow' | 'cross-widget';
  priority: 'critical' | 'important' | 'helpful' | 'optional';

  source: {
    widget: WindowType;
    trigger: string;
    relatedWidgets: WindowType[];
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

  actions: Action[];
};

export type SuggestionPayload = Omit<Suggestion, 'actions'> & {
  actions: ActionPayload[];
};

// Analyze Mode Types
export type PermissionScope = 'analysis' | 'session' | 'always';

export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ConflictItem = {
  source: 'calendar' | 'tasks' | 'lists';
  id: string;
  title: string;
  time?: Date;
  priority: number;
  type?: string;
};

export type ConflictAnalysis = {
  modelsConsulted: number;
  consensus: number;
  reasoning: string[];
  humanCentricScore: number;
};

export type ConflictRecommendation = {
  action: string;
  suggestedTime?: Date;
  confidence: number;
};

export type Conflict = {
  id: string;
  type: 'schedule' | 'priority' | 'resource';
  severity: ConflictSeverity;
  items: ConflictItem[];
  analysis: ConflictAnalysis;
  recommendation: ConflictRecommendation;
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

// Workspace State
export type WorkspaceData = {
  // Widget data (always accessible)
  lists: List[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  connectors: Connector[];

  // Focus mode data (only for Analyze mode with permission)
  pages: Page[];
  notes: Note[];
  boards: Board[];
  flows: Flow[];

  // Intelligence
  suggestions: Suggestion[];
  analyses: AnalysisResult[];

  // History for pattern detection
  history: {
    scheduling: SchedulingHistory[];
    preparation: PrepHistory[];
  };
};

export type WorkspaceDataPayload = Omit<WorkspaceData, 'suggestions'> & {
  suggestions: SuggestionPayload[];
};

export type SchedulingHistory = {
  taskType: string;
  scheduledTime: Date;
  duration: number;
  completed: boolean;
};

export type PrepHistory = {
  eventTitle: string;
  prepTasks: string[];
  leadTimeHours: number;
};
