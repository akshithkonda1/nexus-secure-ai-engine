import { nanoid } from "nanoid";
import type { ToronMessage, ToronSession } from "@/state/toron/toronSessionTypes";

// Basic validators keep UI defensive and predictable.
export const safeString = (value: unknown, fallback = "unknown"): string => {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
};

export const safeBool = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  return fallback;
};

export const safeArray = <T>(value: unknown, fallback: T[] = []): T[] =>
  Array.isArray(value) ? value : fallback;

export const safeObject = <T extends Record<string, unknown>>(value: unknown, fallback: T): T => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as T;
  }
  return fallback;
};

const isValidDate = (date: Date | null): date is Date => Boolean(date && !Number.isNaN(date.getTime()));

export const safeDate = (value?: unknown): Date | null => {
  if (value === null || value === undefined) return null;
  try {
    const date = value instanceof Date ? value : new Date(value as string | number);
    return isValidDate(date) ? date : null;
  } catch {
    return null;
  }
};

export const safeTimestamp = (value?: unknown): string => {
  if (value === null || value === undefined) return "unknown";
  const date = safeDate(value);
  if (!date) return "recently";
  return date.toISOString();
};

const rtf = typeof Intl !== "undefined" ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }) : null;

export const safeFormatDistance = (value?: unknown): string => {
  const date = safeDate(value);
  if (!date) return value === null || value === undefined ? "unknown" : "recently";
  try {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (!rtf) return minutes === 0 ? "just now" : `${minutes}m ago`;
    if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
    const hours = Math.round(minutes / 60);
    return rtf.format(-hours, "hour");
  } catch {
    return "recently";
  }
};

export const safeMessage = (raw: unknown): ToronMessage => {
  const baseId = nanoid();
  const obj = safeObject(raw as Record<string, unknown>, { id: baseId } as Record<string, unknown>);
  const timestamp = safeTimestamp(obj.timestamp);
  return {
    id: safeString(obj.id, baseId),
    role: (obj.role === "user" || obj.role === "assistant" || obj.role === "system") ? obj.role : "assistant",
    content: safeString(obj.content, ""),
    model: safeString(obj.model, "unknown-model"),
    timestamp,
  };
};

export const safeSession = (raw: unknown): ToronSession => {
  const fallbackId = nanoid();
  const obj = safeObject(raw as Record<string, unknown>, { sessionId: fallbackId } as Record<string, unknown>);
  return {
    sessionId: safeString(obj.sessionId, fallbackId),
    title: safeString(obj.title, "Untitled Session"),
    createdAt: safeTimestamp(obj.createdAt ?? obj.created_at),
    updatedAt: safeTimestamp(obj.updatedAt ?? obj.updated_at),
    messages: safeArray(obj.messages, []).map(safeMessage),
  };
};

export const safeSessionRecord = (raw: unknown): Record<string, ToronSession> => {
  const source = safeObject<Record<string, unknown>>(raw, {} as Record<string, unknown>);
  return Object.entries(source).reduce<Record<string, ToronSession>>((acc, [key, value]) => {
    const safe = safeSession({ ...(value as Record<string, unknown>), sessionId: key });
    acc[safe.sessionId] = safe;
    return acc;
  }, {});
};
