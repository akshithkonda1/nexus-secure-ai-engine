import { genId } from '../lib/id';
import { readConfig } from './config';
export type SessionRow = { id: string; title: string; memory: string; updatedAt: number; archivedAt: number|null; deletedAt: number|null };
const LS_SESSIONS = 'nexus_sessions_v2';
const LS_MESSAGES_PREFIX = 'nexus_msgs_';

function purge(rows: SessionRow[]) {
  const { retentionDays } = readConfig();
  const ms = Math.max(1, retentionDays) * 86400000;
  const now = Date.now();
  const kept = rows.filter(r => !((r.archivedAt && now - r.archivedAt >= ms) || (r.deletedAt && now - r.deletedAt >= ms)));
  if (kept.length !== rows.length) localStorage.setItem(LS_SESSIONS, JSON.stringify(kept));
  return kept;
}
function load(): SessionRow[] {
  const rows = JSON.parse(localStorage.getItem(LS_SESSIONS) || '[]');
  return purge(rows).sort((a: any, b: any) => b.updatedAt - a.updatedAt);
}
export const SessionService = {
  list: () => load().filter(r => !r.archivedAt && !r.deletedAt),
  listArchived: () => load().filter(r => !!r.archivedAt && !r.deletedAt),
  listDeleted: () => load().filter(r => !!r.deletedAt),
  create(title = 'New chat') {
    const rows = load();
    const s: SessionRow = { id: genId(), title, memory: '', updatedAt: Date.now(), archivedAt: null, deletedAt: null };
    rows.unshift(s);
    localStorage.setItem(LS_SESSIONS, JSON.stringify(rows));
    localStorage.setItem(LS_MESSAGES_PREFIX + s.id, JSON.stringify([]));
    return s;
  },
  update(id: string, patch: Partial<SessionRow>) {
    const rows = load().map(r => r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r);
    localStorage.setItem(LS_SESSIONS, JSON.stringify(rows));
    return rows.find(r => r.id === id);
  },
  archive: (id: string) => SessionService.update(id, { archivedAt: Date.now(), deletedAt: null }),
  restore: (id: string) => SessionService.update(id, { archivedAt: null, deletedAt: null }),
  softDelete: (id: string) => SessionService.update(id, { deletedAt: Date.now() }),
  remove(id: string) {
    const rows = load().filter(r => r.id !== id);
    localStorage.setItem(LS_SESSIONS, JSON.stringify(rows));
    localStorage.removeItem(LS_MESSAGES_PREFIX + id);
  },
  messages: (id: string) => JSON.parse(localStorage.getItem(LS_MESSAGES_PREFIX + id) || '[]'),
  saveMessages: (id: string, msgs: any[]) => { localStorage.setItem(LS_MESSAGES_PREFIX + id, JSON.stringify(msgs)); SessionService.update(id, {}); },
};
