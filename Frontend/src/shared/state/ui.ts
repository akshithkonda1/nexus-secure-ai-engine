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


export type SystemPane = "source" | "audit" | "encryption";

export interface LibraryItem {
  id: string;
  title: string;
  createdAt: string;
  summary: string;
}

interface UIState {
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  isSystemDrawerOpen: boolean;
  systemPane: SystemPane;
  setSystemPane: (pane: SystemPane) => void;
  openSystemDrawer: (pane?: SystemPane) => void;
  closeSystemDrawer: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  libraryItems: LibraryItem[];
  addLibraryItem: (item: LibraryItem) => void;
  removeLibraryItem: (id: string) => void;
  resetLibrary: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isProfileModalOpen: false,
      openProfileModal: () => set({ isProfileModalOpen: true }),
      closeProfileModal: () => set({ isProfileModalOpen: false }),
      isSystemDrawerOpen: false,
      systemPane: "source",
      setSystemPane: (pane) => set({ systemPane: pane }),
      openSystemDrawer: (pane) =>
        set({
          isSystemDrawerOpen: true,
          systemPane: pane ?? get().systemPane,
        }),
      closeSystemDrawer: () => set({ isSystemDrawerOpen: false }),
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      libraryItems: [],
      addLibraryItem: (item) => {
        const existing = get().libraryItems.filter((entry) => entry.id !== item.id);
        set({ libraryItems: [...existing, item] });
      },
      removeLibraryItem: (id) => {
        set({ libraryItems: get().libraryItems.filter((entry) => entry.id !== id) });
      },
      resetLibrary: () => set({ libraryItems: [] }),
    }),
    {
      name: "nexus.ui",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : createMemoryStorage()
      ),
      version: 1,
      migrate: (persistedState, version) => {
        if (!persistedState) {
          return persistedState as UIState;
        }

        if (version === 0 || (persistedState as { systemPane?: string }).systemPane) {
          const legacyState = persistedState as UIState & { systemPane?: string };
          const pane = legacyState.systemPane;
          if (pane === "library" || pane === "projects" || pane === "models") {
            return { ...legacyState, systemPane: "source" } as UIState;
          }
          if (pane === "audit" || pane === "encryption" || pane === "source") {
            return { ...legacyState, systemPane: pane } as UIState;
          }
          return { ...legacyState, systemPane: "source" } as UIState;
        }

        return persistedState as UIState;
      },
      partialize: (state) => ({
        systemPane: state.systemPane,
        sidebarCollapsed: state.sidebarCollapsed,
        libraryItems: state.libraryItems,
      }),
    }
  )
);
