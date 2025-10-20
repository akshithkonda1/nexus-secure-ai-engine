export type Role = "user" | "assistant" | "system";
export type AuditItem = Record<string, string | number | boolean | null | undefined>;
export type ModelAnswers = Record<string, string>;

export type Message = {
  id: string;
  role: Role;
  content: string;
  html?: string;
  models?: ModelAnswers;
  audit?: AuditItem[];
};

export type ConversationStatus = "active" | "archived" | "trash";

export type Conversation = {
  id: string;
  title: string;
  status: ConversationStatus;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};

const DB_NAME = "nexus_chat";
const DB_VERSION = 1;
const STORE = "convos";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode: IDBTransactionMode) {
  const db = await openDB();
  const t = db.transaction(STORE, mode);
  const s = t.objectStore(STORE);
  return { db, t, s };
}

export async function getConversation(id: string) {
  const { db, t, s } = await tx("readonly");
  return new Promise<Conversation | undefined>((resolve, reject) => {
    const req = s.get(id);
    req.onsuccess = () => resolve(req.result as Conversation | undefined);
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

export async function putConversation(c: Conversation) {
  const { db, t, s } = await tx("readwrite");
  return new Promise<void>((resolve, reject) => {
    const req = s.put(c);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

export async function deleteConversation(id: string) {
  const { db, t, s } = await tx("readwrite");
  return new Promise<void>((resolve, reject) => {
    const req = s.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

export async function listConversations() {
  const { db, t, s } = await tx("readonly");
  return new Promise<Conversation[]>((resolve, reject) => {
    const req = s.getAll();
    req.onsuccess = () => {
      const items = (req.result as Conversation[]).sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(items);
    };
    req.onerror = () => reject(req.error);
    t.oncomplete = () => db.close();
  });
}

export async function emptyTrash() {
  const all = await listConversations();
  await Promise.all(all.filter(c => c.status === "trash").map(c => deleteConversation(c.id)));
}
