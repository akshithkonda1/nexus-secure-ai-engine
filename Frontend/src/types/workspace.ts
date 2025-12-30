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

// Window State (for window manager compatibility)
export type WindowState = {
  id: string;
  type: WindowType;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  isPinned: boolean;
  position: Position;
  size: Size;
  zIndex: number;
  canDrag: boolean;
  canResize: boolean;
  canClose: boolean;
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

// Recurrence pattern for recurring events
export type RecurrencePattern = {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;          // Every N days/weeks/months/years
  daysOfWeek?: number[];     // 0-6 for weekly (0=Sunday)
  dayOfMonth?: number;       // 1-31 for monthly
  endDate?: Date;            // When recurrence ends
  occurrences?: number;      // Max number of occurrences
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  priority?: number;
  type?: 'work' | 'family' | 'personal' | 'meeting' | 'other';
  attendees?: string[];
  location?: string;
  description?: string;
  recurring?: boolean;
  recurrence?: RecurrencePattern;  // Detailed recurrence config
  reminder?: number; // minutes before
  color?: string;
  isAllDay?: boolean;              // All-day event flag
  timezone?: string;               // IANA timezone (e.g., "America/New_York")
  templateId?: string;             // Reference to event template
};

// Event template for quick creation
export type EventTemplate = {
  id: string;
  name: string;                    // e.g., "Weekly Standup"
  title: string;                   // Default event title
  duration: number;                // Duration in minutes
  type: 'work' | 'family' | 'personal' | 'meeting' | 'other';
  location?: string;
  description?: string;
  attendees?: string[];
  recurrence?: RecurrencePattern;
  color?: string;
  isDefault?: boolean;             // Built-in template
};

// Holiday Types
export type HolidayCategory =
  | 'federal'      // US Federal holidays (banks/gov closed)
  | 'cultural'     // Cultural celebrations
  | 'religious'    // Religious observances
  | 'personal'     // Birthdays, anniversaries
  | 'observance';  // Awareness days, unofficial

export type Holiday = {
  id: string;
  name: string;
  date: Date;
  category: HolidayCategory;
  isWorkOff?: boolean;       // Most people have day off
  recurring?: boolean;       // Happens every year
  emoji?: string;            // Display emoji
  description?: string;      // Brief description
};

export type PersonalDate = {
  id: string;
  name: string;              // e.g., "Mom's Birthday"
  type: 'birthday' | 'anniversary' | 'memorial' | 'custom';
  month: number;             // 0-11
  day: number;               // 1-31
  year?: number;             // Optional birth/start year
  person?: string;           // Person's name
  reminder?: number;         // Days before to remind
  notes?: string;
};

export type ExtendedWeekend = {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  holidays: Holiday[];
  suggestion?: string;       // Contextual suggestion
};

// Connector Type - All 34 supported platforms
export type ConnectorType =
  // Development & Version Control (3)
  | 'github'
  | 'gitlab'
  | 'bitbucket'
  // Project Management (6)
  | 'linear'
  | 'jira'
  | 'asana'
  | 'trello'
  | 'monday'
  | 'clickup'
  // Documentation & Knowledge (2)
  | 'notion'
  | 'airtable'
  // Communication (5)
  | 'slack'
  | 'teams'
  | 'discord'
  | 'telegram'
  | 'zoom'
  // Design (1)
  | 'figma'
  // Cloud Storage (4)
  | 'gdrive'
  | 'dropbox'
  | 'box'
  | 'onedrive'
  // Social & Identity (5)
  | 'google'
  | 'apple'
  | 'microsoft'
  | 'facebook'
  | 'twitter'
  // CRM & Sales (2)
  | 'hubspot'
  | 'salesforce'
  // Commerce & Payments (2)
  | 'stripe'
  | 'shopify'
  // Cloud Infrastructure (3)
  | 'aws'
  | 'gcp'
  | 'azure'
  // Education (1)
  | 'canvas'
  // Custom
  | 'custom';

// Connector Categories
export const CONNECTOR_CATEGORIES = {
  DEVELOPMENT: 'Development',
  PROJECT_MANAGEMENT: 'Project Management',
  DOCUMENTATION: 'Documentation',
  COMMUNICATION: 'Communication',
  DESIGN: 'Design',
  STORAGE: 'Storage',
  SOCIAL: 'Social',
  CRM: 'CRM',
  COMMERCE: 'Commerce',
  CLOUD: 'Cloud',
  EDUCATION: 'Education',
} as const;

export type ConnectorCategory = typeof CONNECTOR_CATEGORIES[keyof typeof CONNECTOR_CATEGORIES];

export type Connector = {
  id: string;
  name: string;
  type: ConnectorType;
  connected: boolean;
  lastSync?: Date | null;
  token?: string | null;
  metadata?: {
    workspace?: string;
    organization?: string;
    scopes?: string[];
    expiresAt?: Date;
    category?: string;
  };
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
  enabled?: boolean;
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

  // Current selections
  currentPage: string | null;
  currentBoard: string | null;

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
