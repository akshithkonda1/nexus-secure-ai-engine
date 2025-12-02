const memoryStore = {};

function hasLocalStorage() {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch (error) {
    return false;
  }
}

export function load(key, fallback) {
  if (hasLocalStorage()) {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  return Object.prototype.hasOwnProperty.call(memoryStore, key)
    ? memoryStore[key]
    : fallback;
}

export function save(key, value) {
  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  memoryStore[key] = value;
  return true;
}

export function clear(key) {
  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  delete memoryStore[key];
  return true;
}

export default { load, save, clear };
