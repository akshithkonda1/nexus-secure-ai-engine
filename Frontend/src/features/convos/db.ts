import { Conversation } from "./types";

const DB_NAME = "nexus_chat";
const DB_VERSION = 1;
const STORE = "convos";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: "id" });
        s.createIndex("status", "status", { unique: false });
        s.createIndex("updatedAt", "updatedAt", { unique: false });
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
    const r = s.get(id);
    r.onsuccess = () => resolve(r.result as Conversation | undefined);
    r.onerror = () => reject(r.error);
    t.oncomplete = () => db.close();
  });
}

export async function putConversation(c: Conversation) {
  const { db, t, s } = await tx("readwrite");
  return new Promise<void>((resolve, reject) => {
    const r = s.put(c);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
    t.oncomplete = () => db.close();
  });
}

export async function deleteConversation(id: string) {
  const { db, t, s } = await tx("readwrite");
  return new Promise<void>((resolve, reject) => {
    const r = s.delete(id);
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
    t.oncomplete = () => db.close();
  });
}

export async function listConversations() {
  const { db, t, s } = await tx("readonly");
  return new Promise<Conversation[]>((resolve, reject) => {
    const r = s.getAll();
    r.onsuccess = () => {
      const items = (r.result as Conversation[]).sort((a,b)=>b.updatedAt-a.updatedAt);
      resolve(items);
    };
    r.onerror = () => reject(r.error);
    t.oncomplete = () => db.close();
  });
}

export async function emptyTrash() {
  const all = await listConversations();
  await Promise.all(all.filter(c=>c.status==="trash").map(c=>deleteConversation(c.id)));
}
