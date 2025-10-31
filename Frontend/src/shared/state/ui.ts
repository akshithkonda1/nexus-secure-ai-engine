import { create } from "zustand";

type SystemTab = "library" | "projects" | "audit" | "encryption";

type UIState = {
  isProfileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  systemTab: SystemTab;
  setSystemTab: (tab: SystemTab) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isProfileOpen: false,
  setProfileOpen: (isProfileOpen) => set({ isProfileOpen }),
  systemTab: "library",
  setSystemTab: (systemTab) => set({ systemTab })
}));
