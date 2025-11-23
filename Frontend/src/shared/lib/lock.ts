import { PRICE_LOCK } from "@/config/pricing";
const KEY_FIRST = "ryuzen.firstInstallISO";
const KEY_LOCK  = "ryuzen.lockedUntilISO";
export function getLockedUntil(): string {
  const explicit = PRICE_LOCK.lockedUntilISO?.trim();
  if (explicit) return explicit;
  const stored = localStorage.getItem(KEY_LOCK);
  if (stored) return stored;
  const first = localStorage.getItem(KEY_FIRST) ?? new Date().toISOString();
  localStorage.setItem(KEY_FIRST, first);
  const d = new Date(first); d.setDate(d.getDate() + (PRICE_LOCK.relativeDays ?? 30));
  const iso = d.toISOString(); localStorage.setItem(KEY_LOCK, iso); return iso;
}
export function isLocked(now = new Date()): { locked: boolean; untilISO: string } {
  const untilISO = getLockedUntil(); return { locked: now < new Date(untilISO), untilISO };
}
