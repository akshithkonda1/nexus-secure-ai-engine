import { create } from "zustand";

type ModeState = {
  mode: "basic" | "advanced";
  toggleMode: () => void;
};

export const useModeStore = create<ModeState>((set, get) => ({
  mode: "basic",
  toggleMode: () => set({ mode: get().mode === "basic" ? "advanced" : "basic" }),
}));
