export interface StoredProfile {
  displayName: string;
  avatarDataUrl: string | null;
  updatedAt: string;
}

export interface ProfilePersistenceResult {
  profile: StoredProfile;
  reclaimed: boolean;
  avatarDropped: boolean;
}

export const PROFILE_STORAGE_QUOTA_ERROR = "profile:storage-quota-exceeded";

const PROFILE_KEY = "nexus.profile";
const AUDIT_KEY = "nexus.audit";
const CHATS_KEY = "nexus.chats";
const PROJECTS_KEY = "nexus.projects";

const defaultProfile: StoredProfile = {
  displayName: "Guest of Nexus",
  avatarDataUrl: null,
  updatedAt: new Date(0).toISOString(),
};

export function getStoredProfile(): StoredProfile {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return defaultProfile;
    }
    const parsed = JSON.parse(raw) as StoredProfile;
    if (!parsed.displayName) {
      return defaultProfile;
    }
    return {
      displayName: parsed.displayName,
      avatarDataUrl: parsed.avatarDataUrl ?? null,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Failed to parse profile", error);
    return defaultProfile;
  }
}

export function setStoredProfile(profile: StoredProfile): ProfilePersistenceResult {
  if (typeof window === "undefined") {
    return { profile, reclaimed: false, avatarDropped: false };
  }

  const { localStorage } = window;
  const serialized = JSON.stringify(profile);
  const previousValue = localStorage.getItem(PROFILE_KEY);
  let previousRemoved = false;
  let lastError: unknown;

  const tryPersist = (value: string): boolean => {
    try {
      localStorage.setItem(PROFILE_KEY, value);
      return true;
    } catch (error) {
      if (!isQuotaExceeded(error)) {
        throw error;
      }
      lastError = error;
      return false;
    }
  };

  const removePreviousOnce = () => {
    if (previousRemoved) {
      return;
    }
    try {
      localStorage.removeItem(PROFILE_KEY);
      previousRemoved = true;
    } catch (error) {
      console.warn("Failed to remove previous profile during persistence", error);
      previousRemoved = true;
    }
  };

  if (tryPersist(serialized)) {
    return { profile, reclaimed: false, avatarDropped: false };
  }

  removePreviousOnce();

  if (tryPersist(serialized)) {
    return { profile, reclaimed: false, avatarDropped: false };
  }

  const reclaimStrategies: (() => boolean)[] = [
    () => trimAuditTrail(),
    () => trimChats(),
    () => dropInactiveChats(),
    () => clearProjects(),
    () => clearAuditTrail(),
    () => clearChats(),
  ];

  let reclaimed = false;

  for (const strategy of reclaimStrategies) {
    try {
      const changed = strategy();
      if (!changed) {
        continue;
      }
      reclaimed = true;
    } catch (strategyError) {
      console.warn("Profile storage reclaim strategy failed", strategyError);
      continue;
    }

    if (tryPersist(serialized)) {
      return { profile, reclaimed, avatarDropped: false };
    }
    removePreviousOnce();
  }

  if (profile.avatarDataUrl) {
    const minimizedProfile: StoredProfile = {
      ...profile,
      avatarDataUrl: null,
      updatedAt: new Date().toISOString(),
    };
    const minimizedSerialized = JSON.stringify(minimizedProfile);

    if (tryPersist(minimizedSerialized)) {
      return { profile: minimizedProfile, reclaimed, avatarDropped: true };
    }
    removePreviousOnce();
    if (tryPersist(minimizedSerialized)) {
      return { profile: minimizedProfile, reclaimed, avatarDropped: true };
    }
  }

  if (previousRemoved && previousValue !== null) {
    try {
      localStorage.setItem(PROFILE_KEY, previousValue);
    } catch (restoreError) {
      console.warn("Failed to restore previous profile after quota error", restoreError);
    }
  }

  throw new Error(PROFILE_STORAGE_QUOTA_ERROR, { cause: lastError });
}

export function clearStoredAvatar(): StoredProfile {
  const profile = getStoredProfile();
  const updated: StoredProfile = {
    ...profile,
    avatarDataUrl: null,
    updatedAt: new Date().toISOString(),
  };
  const result = setStoredProfile(updated);
  return result.profile;
}

export function updateStoredProfile(partial: Partial<StoredProfile>): StoredProfile {
  const current = getStoredProfile();
  const updated: StoredProfile = {
    ...current,
    ...partial,
    updatedAt: new Date().toISOString(),
  };
  const result = setStoredProfile(updated);
  return result.profile;
}

function isQuotaExceeded(error: unknown): boolean {
  if (!error) {
    return false;
  }

  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return error.name === "QuotaExceededError" || error.code === 22 || error.code === 1014;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("quota") || message.includes("storage") || message.includes("exceeded");
  }

  return false;
}

function trimAuditTrail(limit = 200): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const { localStorage } = window;
  const raw = localStorage.getItem(AUDIT_KEY);
  if (!raw) {
    return false;
  }

  try {
    const events = JSON.parse(raw) as unknown[];
    if (!Array.isArray(events)) {
      localStorage.removeItem(AUDIT_KEY);
      return true;
    }

    if (events.length <= limit) {
      return false;
    }

    const trimmed = events.slice(0, limit);
    try {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn("Failed to persist trimmed audit trail", error);
      localStorage.removeItem(AUDIT_KEY);
    }
    return true;
  } catch (error) {
    console.warn("Failed to trim audit trail", error);
    localStorage.removeItem(AUDIT_KEY);
    return true;
  }
}

function trimChats(maxThreads = 12, maxMessagesPerThread = 40): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const { localStorage } = window;
  const raw = localStorage.getItem(CHATS_KEY);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(CHATS_KEY);
      return true;
    }

    let mutated = false;

    const trimmedMessages = parsed.map((thread) => {
      if (!Array.isArray(thread?.messages)) {
        mutated = true;
        return { ...thread, messages: [] };
      }
      const messages = thread.messages as unknown[];
      if (messages.length > maxMessagesPerThread) {
        mutated = true;
        return { ...thread, messages: messages.slice(-maxMessagesPerThread) };
      }
      return thread;
    });

    const active = trimmedMessages.filter((thread) => thread?.state === "active");
    const archived = trimmedMessages.filter((thread) => thread?.state === "archived");
    const trashed = trimmedMessages.filter((thread) => thread?.state === "trashed");

    const shouldReorderByState = active.length > 0 && (archived.length > 0 || trashed.length > 0);
    let ordered = shouldReorderByState ? [...active, ...archived, ...trashed] : trimmedMessages;
    if (shouldReorderByState) {
      mutated = true;
    }

    if (ordered.length > maxThreads) {
      mutated = true;
      ordered = ordered.slice(0, maxThreads);
    }

    if (!mutated) {
      return false;
    }

    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(ordered));
    } catch (error) {
      console.warn("Failed to persist trimmed chats", error);
      localStorage.removeItem(CHATS_KEY);
    }

    return true;
  } catch (error) {
    console.warn("Failed to trim chats", error);
    localStorage.removeItem(CHATS_KEY);
    return true;
  }
}

function dropInactiveChats(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const { localStorage } = window;
  const raw = localStorage.getItem(CHATS_KEY);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(CHATS_KEY);
      return true;
    }

    const active = parsed.filter((thread) => thread?.state === "active");
    if (active.length === parsed.length) {
      return false;
    }

    const fallback = parsed.length > 0 ? [parsed[0]] : [];
    const next = active.length > 0 ? active : fallback;

    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn("Failed to persist active chats", error);
      localStorage.removeItem(CHATS_KEY);
    }

    return true;
  } catch (error) {
    console.warn("Failed to drop inactive chats", error);
    localStorage.removeItem(CHATS_KEY);
    return true;
  }
}

function clearProjects(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const { localStorage } = window;
  if (localStorage.getItem(PROJECTS_KEY) === null) {
    return false;
  }
  localStorage.removeItem(PROJECTS_KEY);
  return true;
}

function clearAuditTrail(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const { localStorage } = window;
  if (localStorage.getItem(AUDIT_KEY) === null) {
    return false;
  }
  localStorage.removeItem(AUDIT_KEY);
  return true;
}

function clearChats(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const { localStorage } = window;
  if (localStorage.getItem(CHATS_KEY) === null) {
    return false;
  }
  localStorage.removeItem(CHATS_KEY);
  return true;
}
