export interface ListItem {
  id: string;
  user_id: string;
  title: string;
  type: string;
  created_at?: string;
  updated_at?: string;
}

export interface TaskItem {
  id: string;
  user_id: string;
  title: string;
  status: string;
  list_id?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarItem {
  id: string;
  user_id: string;
  source: "google" | "apple" | "microsoft" | "canvas";
  title: string;
  start: string;
  end: string;
  all_day?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ContentItem {
  id: string;
  user_id: string;
  content: string;
  type: "page" | "note" | "board" | "flow";
  links?: string[];
  toron_metadata?: Record<string, unknown>;
}

export interface ToronInsight {
  title: string;
  description: string;
  severity?: "info" | "warning" | "critical";
}
