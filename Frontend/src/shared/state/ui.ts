import { create } from "zustand";

export type SystemPane = "library" | "projects" | "models";

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  profileModalOpen: boolean;
  systemDrawerOpen: boolean;
  activeSystemPane: SystemPane;
  libraryItems: LibraryItem[];
  setSidebarCollapsed: (value: boolean) => void;
  setProfileModalOpen: (value: boolean) => void;
  setSystemDrawerOpen: (value: boolean) => void;
  setActiveSystemPane: (pane: SystemPane) => void;
  setLibraryItems: (items: LibraryItem[]) => void;
  addLibraryItem: (item: LibraryItem) => void;
  clearLibrary: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  profileModalOpen: false,
  systemDrawerOpen: true,
  activeSystemPane: "library",
  libraryItems: [],
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
  setProfileModalOpen: (value) => set({ profileModalOpen: value }),
  setSystemDrawerOpen: (value) => set({ systemDrawerOpen: value }),
  setActiveSystemPane: (pane) => set({ activeSystemPane: pane }),
  setLibraryItems: (items) => set({ libraryItems: items }),
  addLibraryItem: (item) => set((state) => ({ libraryItems: [item, ...state.libraryItems] })),
  clearLibrary: () => set({ libraryItems: [] }),
}));
