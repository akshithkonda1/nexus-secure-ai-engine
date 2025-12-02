export type WorkspaceListItem = {
  id: string;
  text: string;
  done?: boolean;
};

export type WorkspaceList = {
  id: string;
  title: string;
  items: WorkspaceListItem[];
};

export type CalendarEvent = {
  date: string; // ISO date string
  type: "urgent" | "meeting" | "event" | "multi";
  title: string;
};

export type WorkspaceConnectorStatus = "connected" | "warning" | "error";

export type WorkspaceConnector = {
  id: string;
  name: string;
  status: WorkspaceConnectorStatus;
  lastSync: string;
};

export type TaskItem = {
  id: string;
  title: string;
  source?: string;
};

export type WorkspaceSchedule = {
  hour: string;
  focus: string;
  items: TaskItem[];
};

export type ToronSignal = {
  id: string;
  payload: Record<string, unknown>;
  timestamp: number;
};
