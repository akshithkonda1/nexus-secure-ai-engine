import { create } from "zustand";

interface UIState {
  showCommandCenter: boolean;
  openCommandCenter: () => void;
  closeCommandCenter: () => void;
  toggleCommandCenter: () => void;
}

export const useUI = create<UIState>((set) => ({
  showCommandCenter: false,
  openCommandCenter: () => set({ showCommandCenter: true }),
  closeCommandCenter: () => set({ showCommandCenter: false }),
  toggleCommandCenter: () =>
    set((state) => ({ showCommandCenter: !state.showCommandCenter })),
}));
