export type StoredProfile = {
  name: string;
  email: string;
  photoDataUrl?: string;
  accountId: string;
  plan?: string;
};

const DB_NAME = "nexus_profile";
const STORE_NAME = "profile";
const KEY = "profile";
const DB_VERSION = 1;

function hasIndexedDB(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open profile store"));
  });
}

async function withStore(mode: IDBTransactionMode) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);
  return { db, tx, store };
}

export async function loadProfile(): Promise<StoredProfile | null> {
  if (!hasIndexedDB()) {
    return null;
  }
  try {
    const { db, tx, store } = await withStore("readonly");
    return await new Promise<StoredProfile | null>((resolve, reject) => {
      const request = store.get(KEY);
      request.onsuccess = () => {
        const result = request.result as ({ id: string } & StoredProfile) | undefined;
        if (!result) {
          resolve(null);
          return;
        }
        const { id: _id, ...profile } = result;
        resolve(profile);
      };
      request.onerror = () => reject(request.error ?? new Error("Failed to load profile"));
      tx.oncomplete = () => db.close();
      tx.onabort = () => db.close();
    });
  } catch (err) {
    console.error("loadProfile failed", err);
    return null;
  }
}

export async function saveProfile(profile: StoredProfile): Promise<void> {
  if (!hasIndexedDB()) {
    console.warn("IndexedDB unavailable; skipping profile save.");
    return;
  }
  const payload = { ...profile, id: KEY };
  const { db, tx, store } = await withStore("readwrite");
  await new Promise<void>((resolve, reject) => {
    const request = store.put(payload);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Failed to save profile"));
    tx.oncomplete = () => db.close();
    tx.onabort = () => db.close();
  });
}

export function clearProfile(): Promise<void> {
  if (!hasIndexedDB()) {
    return Promise.resolve();
  }
  return withStore("readwrite").then(({ db, tx, store }) => new Promise<void>((resolve, reject) => {
    const request = store.delete(KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Failed to clear profile"));
    tx.oncomplete = () => db.close();
    tx.onabort = () => db.close();
  }));
}
