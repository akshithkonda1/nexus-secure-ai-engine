export interface AuditEvent {
  ts: number;
  type: string;
  meta?: Record<string, unknown>;
}

const AUDIT_KEY = "nexus.audit";
const MAX_EVENTS = 500;

type Persisted = AuditEvent[];

function readEvents(): Persisted {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Persisted;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to read audit trail", error);
    return [];
  }
}

function writeEvents(events: Persisted) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
  } catch (error) {
    console.warn("Failed to persist audit trail", error);
  }
}

export function logEvent(type: string, meta?: Record<string, unknown>) {
  const events = readEvents();
  const entry: AuditEvent = { ts: Date.now(), type, meta };
  events.unshift(entry);
  writeEvents(events);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("nexus-audit-log"));
  }
}

export function listEvents(): AuditEvent[] {
  return readEvents();
}
