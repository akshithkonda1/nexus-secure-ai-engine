import { useSyncExternalStore } from "react";

export type Session = { id: string; title: string; template?: string | null; updatedAt: number };
const KEY = "nexus.sessions.v1";
const storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null;

function read(): Session[] {
  if (!storage) return [];
  try { return JSON.parse(storage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(list: Session[]) {
  if (!storage) return;
  storage.setItem(KEY, JSON.stringify(list));
  emit();
}

let cache = read();
const subs = new Set<() => void>();
function emit() {
  cache = read();
  subs.forEach((s) => s());
}

export const sessionStore = {
  use() {
    const snapshot = () => cache;
    const subscribe = (cb: () => void) => {
      subs.add(cb);
      return () => subs.delete(cb);
    };
    const state = useSyncExternalStore(subscribe, snapshot, snapshot);

    return {
      sessions: [...state].sort((a, b) => b.updatedAt - a.updatedAt),
      createSession(input: { title: string; template?: string | null }) {
        const id = crypto.randomUUID();
        write([...read(), { id, title: input.title, template: input.template ?? null, updatedAt: Date.now() }]);
        return id;
      },
      removeSession(id: string) {
        write(read().filter((s) => s.id !== id));
      },
      getById(id: string) {
        return read().find((s) => s.id === id);
      },
      updateTitle(id: string, title: string) {
        write(read().map((s) => (s.id === id ? { ...s, title, updatedAt: Date.now() } : s)));
      },
      async importTranscript(): Promise<string | null> {
        if (!storage) return null;
        return new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".txt,.md,.json";
          input.onchange = () => {
            const f = input.files?.[0];
            if (!f) return resolve(null);
            const base = f.name.replace(/\.[^.]+$/, "");
            const id = crypto.randomUUID();
            write([...read(), { id, title: `Imported: ${base}`, template: "import", updatedAt: Date.now() }]);
            resolve(id);
          };
          input.click();
        });
      },
    };
  },
};
