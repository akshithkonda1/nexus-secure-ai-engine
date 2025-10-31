import { PRICE_LOCK } from "@/config/pricing";

const KEY_FIRST = "nexus.firstInstallISO";
const KEY_LOCK = "nexus.lockedUntilISO";

function resolveStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeGet(storage: Storage | null, key: string): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage | null, key: string, value: string) {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore storage quota/security errors so rendering can proceed.
  }
}

export function getLockedUntil(): string {
  const explicit = PRICE_LOCK.lockedUntilISO?.trim();
  if (explicit) return explicit;

  const storage = resolveStorage();
  const stored = safeGet(storage, KEY_LOCK);
  if (stored) return stored;

  const firstStored = safeGet(storage, KEY_FIRST) ?? new Date().toISOString();
  safeSet(storage, KEY_FIRST, firstStored);

  const relativeDays = PRICE_LOCK.relativeDays ?? 30;
  let baseDate = new Date(firstStored);
  if (Number.isNaN(baseDate.getTime())) {
    baseDate = new Date();
    safeSet(storage, KEY_FIRST, baseDate.toISOString());
  }

  baseDate.setDate(baseDate.getDate() + relativeDays);
  const iso = baseDate.toISOString();
  safeSet(storage, KEY_LOCK, iso);
  return iso;
}

export function isLocked(now = new Date()): { locked: boolean; untilISO: string } {
  const untilISO = getLockedUntil();
  return { locked: now < new Date(untilISO), untilISO };
}
