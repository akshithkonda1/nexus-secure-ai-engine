import { create } from "zustand";

type UIState = {
  profileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
};

export const useUIState = create<UIState>(set => ({
  profileOpen: false,
  openProfile: () => set({ profileOpen: true }),
  closeProfile: () => set({ profileOpen: false })
}));
