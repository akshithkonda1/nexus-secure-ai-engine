const DB_NAME = "nexus-zora-cache";
const STORE_NAME = "kv";
const DB_VERSION = 1;

const isBrowser = typeof window !== "undefined";
const hasIndexedDB = () => isBrowser && typeof window.indexedDB !== "undefined";

let dbPromise: Promise<IDBDatabase> | null = null;
let indexedDbFailed = false;

const getDb = async (): Promise<IDBDatabase> => {
  if (!hasIndexedDB() || indexedDbFailed) {
    throw new Error("IndexedDB unavailable");
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        indexedDbFailed = true;
        reject(request.error ?? new Error("Failed to open IndexedDB"));
      };
    });
  }
  return dbPromise;
};

const runTransaction = async <T>(
  mode: IDBTransactionMode,
  runner: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await getDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);

    let value: T | undefined;
    let resolved = false;

    try {
      const request = runner(store);
      request.onsuccess = () => {
        value = request.result as T;
      };
      request.onerror = () => {
        if (resolved) return;
        resolved = true;
        reject(request.error ?? new Error("IndexedDB request failed"));
      };
    } catch (error) {
      reject(error);
      return;
    }

    tx.oncomplete = () => {
      if (resolved) return;
      resolved = true;
      resolve(value as T);
    };
    tx.onerror = () => {
      if (resolved) return;
      resolved = true;
      reject(tx.error ?? new Error("IndexedDB transaction failed"));
    };
    tx.onabort = () => {
      if (resolved) return;
      resolved = true;
      reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    };
  });
};

const getLocalStorage = () => {
  if (!isBrowser) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const localStorageFallback = async <T>(
  action: "get" | "set" | "remove",
  key: string,
  value?: T,
) => {
  const ls = getLocalStorage();
  if (!ls) return action === "get" ? null : undefined;
  try {
    if (action === "get") {
      const raw = ls.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    }
    if (action === "set") {
      ls.setItem(key, JSON.stringify(value));
      return;
    }
    ls.removeItem(key);
  } catch {
    if (action === "get") return null;
  }
  return undefined;
};

export async function getItem<T>(key: string): Promise<T | null> {
  if (!isBrowser) return null;
  try {
    const value = await runTransaction<T | null>("readonly", (store) => store.get(key));
    if (value === undefined) {
      return null;
    }
    return value;
  } catch {
    return (await localStorageFallback<T>("get", key)) as T | null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  if (!isBrowser) return;
  try {
    await runTransaction<IDBValidKey>("readwrite", (store) => store.put(value, key));
  } catch {
    indexedDbFailed = true;
    await localStorageFallback("set", key, value);
  }
}

export async function removeItem(key: string): Promise<void> {
  if (!isBrowser) return;
  try {
    await runTransaction("readwrite", (store) => store.delete(key));
  } catch {
    indexedDbFailed = true;
    await localStorageFallback("remove", key);
  }
}

export async function clear(): Promise<void> {
  if (!isBrowser) return;
  try {
    await runTransaction("readwrite", (store) => store.clear());
  } catch {
    indexedDbFailed = true;
    const ls = getLocalStorage();
    ls?.clear();
  }
}

type LimitOptions = {
  /** Maximum number of items to keep. Works when value is an array. */
  maxEntries?: number;
};

export async function setItemWithLimit<T>(
  key: string,
  value: T,
  options: LimitOptions,
): Promise<void> {
  let nextValue = value;
  if (Array.isArray(value) && typeof options.maxEntries === "number") {
    nextValue = value.slice(0, options.maxEntries) as unknown as T;
  }
  await setItem(key, nextValue);
}
