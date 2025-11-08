export type AuditEvent = {
  ts: number;
  type: string;
  meta?: Record<string, unknown>;
};

const AUDIT_KEY = "nexus.audit";
const MAX_EVENTS = 500;

function readAudit(): AuditEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AuditEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to parse audit log", err);
    return [];
  }
}

function writeAudit(events: AuditEvent[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
}

export function logEvent(type: string, meta?: Record<string, unknown>) {
  const events = readAudit();
  const next: AuditEvent = { ts: Date.now(), type, meta };
  const updated = [next, ...events].slice(0, MAX_EVENTS);
  writeAudit(updated);
}

export function getAuditEvents(): AuditEvent[] {
  return readAudit();
}
