import { create } from "zustand";

interface UIState {
  isCommandCenterOpen: boolean;
  openCommandCenter: () => void;
  closeCommandCenter: () => void;
}

export const useUI = create<UIState>((set) => ({
  isCommandCenterOpen: false,
  openCommandCenter: () => set({ isCommandCenterOpen: true }),
  closeCommandCenter: () => set({ isCommandCenterOpen: false }),
}));
