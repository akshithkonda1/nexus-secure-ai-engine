import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
};


export type NexusMode = "student" | "business" | "nexusos";
export type NexusTheme = "light" | "dark";

const THEME_KEY = "nexus.theme";
const MODE_KEY = "nexus.mode";

interface SessionState {
  mode: NexusMode;
  theme: NexusTheme;
  activeChatId: string | null;
  openChatIds: string[];
  setMode: (mode: NexusMode) => void;
  setTheme: (theme: NexusTheme) => void;
  setActiveChatId: (chatId: string | null) => void;
  addOpenChatId: (chatId: string) => void;
  closeOpenChatId: (chatId: string) => void;
  reorderOpenChats: (chatIds: string[]) => void;
}

const resolveInitialTheme = (): NexusTheme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const persisted = window.localStorage.getItem(THEME_KEY) as NexusTheme | null;
  if (persisted === "light" || persisted === "dark") {
    return persisted;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
};

const resolveInitialMode = (): NexusMode => {
  if (typeof window === "undefined") {
    return "nexusos";
  }

  const persisted = window.localStorage.getItem(MODE_KEY) as NexusMode | null;
  if (persisted === "student" || persisted === "business" || persisted === "nexusos") {
    return persisted;
  }

  return "nexusos";
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      mode: resolveInitialMode(),
      theme: resolveInitialTheme(),
      activeChatId: null,
      openChatIds: [],
      setMode: (mode) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(MODE_KEY, mode);
        }
        set({ mode });
      },
      setTheme: (theme) => {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(THEME_KEY, theme);
        }
        set({ theme });
      },
      setActiveChatId: (activeChatId) => set({ activeChatId }),
      addOpenChatId: (chatId) => {
        const existing = get().openChatIds;
        if (existing.includes(chatId)) {
          set({ activeChatId: chatId });
          return;
        }
        set({ openChatIds: [...existing, chatId], activeChatId: chatId });
      },
      closeOpenChatId: (chatId) => {
        const filtered = get().openChatIds.filter((id) => id !== chatId);
        let nextActive = get().activeChatId;
        if (nextActive === chatId) {
          nextActive = filtered.length > 0 ? filtered[filtered.length - 1] : null;
        }
        set({ openChatIds: filtered, activeChatId: nextActive });
      },
      reorderOpenChats: (chatIds) => {
        set({ openChatIds: chatIds });
      },
    }),
    {
      name: "nexus.session",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : createMemoryStorage()
      ),
      partialize: (state) => ({
        mode: state.mode,
        theme: state.theme,
        activeChatId: state.activeChatId,
        openChatIds: state.openChatIds,
      }),
    }
  )
);
