import { create } from "zustand";

type SessionState = {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  rateLimited: boolean;
  setRateLimited: (rateLimited: boolean) => void;
};

export const useSession = create<SessionState>((set) => ({
  theme: "dark",
  setTheme: (theme) => set({ theme }),
  rateLimited: false,
  setRateLimited: (rateLimited) => set({ rateLimited }),
}));
