import { create } from "zustand";

export type NexusMode = "student" | "business" | "nexusos";
export type NexusTheme = "light" | "dark";

export interface SessionState {
  mode: NexusMode;
  theme: NexusTheme;
  activeChatId: string | null;
  openChatIds: string[];
  setMode: (mode: NexusMode) => void;
  setTheme: (theme: NexusTheme) => void;
  setActiveChatId: (chatId: string | null) => void;
  openChat: (chatId: string) => void;
  closeChat: (chatId: string) => void;
  replaceOpenChats: (chatIds: string[]) => void;
}

const DEFAULT_STATE: Pick<SessionState, "mode" | "theme" | "activeChatId" | "openChatIds"> = {
  mode: "student",
  theme: "light",
  activeChatId: null,
  openChatIds: [],
};

export const SESSION_STORAGE_KEY = "nexus.session";

export const useSessionStore = create<SessionState>((set) => ({
  ...DEFAULT_STATE,
  setMode: (mode) => set({ mode }),
  setTheme: (theme) => set({ theme }),
  setActiveChatId: (chatId) => set({ activeChatId: chatId }),
  openChat: (chatId) =>
    set((state) => {
      if (state.openChatIds.includes(chatId)) {
        return { activeChatId: chatId };
      }
      return { openChatIds: [...state.openChatIds, chatId], activeChatId: chatId };
    }),
  closeChat: (chatId) =>
    set((state) => {
      const filtered = state.openChatIds.filter((id) => id !== chatId);
      const nextActive = state.activeChatId === chatId ? filtered.at(-1) ?? null : state.activeChatId;
      return { openChatIds: filtered, activeChatId: nextActive };
    }),
  replaceOpenChats: (chatIds) => set({ openChatIds: [...new Set(chatIds)] }),
}));

export type SessionSnapshot = Pick<SessionState, "mode" | "theme" | "activeChatId" | "openChatIds">;

export function readPersistedSession(): SessionSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<SessionSnapshot>;
    if (!parsed) return null;
    const snapshot: SessionSnapshot = {
      mode: parsed.mode === "business" || parsed.mode === "nexusos" ? parsed.mode : "student",
      theme: parsed.theme === "dark" ? "dark" : "light",
      activeChatId: typeof parsed.activeChatId === "string" ? parsed.activeChatId : null,
      openChatIds: Array.isArray(parsed.openChatIds)
        ? parsed.openChatIds.filter((id): id is string => typeof id === "string")
        : [],
    };
    return snapshot;
  } catch (error) {
    console.warn("Failed to parse stored session", error);
    return null;
  }
}

export function persistSession(snapshot: SessionSnapshot): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
}

export function createModeChangeEvent(mode: NexusMode): void {
  if (typeof window === "undefined") return;
  const event = new CustomEvent<NexusMode>("nexus:mode-change", { detail: mode });
  window.dispatchEvent(event);
}
