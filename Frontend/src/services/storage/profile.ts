const PROFILE_KEY = "nexus.profile";

export type Profile = {
  displayName: string;
  avatarUrl?: string;
  updatedAt: number;
};

const DEFAULT_PROFILE: Profile = {
  displayName: "Nexus Researcher",
  avatarUrl: undefined,
  updatedAt: Date.now()
};

export function getProfile(): Profile {
  if (typeof window === "undefined") {
    return DEFAULT_PROFILE;
  }
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Profile;
    return {
      ...DEFAULT_PROFILE,
      ...parsed
    };
  } catch (error) {
    console.warn("Failed to parse profile", error);
    return DEFAULT_PROFILE;
  }
}

export async function setProfile(profile: Omit<Profile, "updatedAt">): Promise<Profile> {
  const next: Profile = { ...profile, updatedAt: Date.now() };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  }
  return next;
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
