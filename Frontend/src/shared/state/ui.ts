import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SystemPane = "library" | "projects" | "models" | "audit" | "encryption";

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
      systemPane: "library",
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
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        systemPane: state.systemPane,
        sidebarCollapsed: state.sidebarCollapsed,
        libraryItems: state.libraryItems,
      }),
    }
  )
);
