import { create } from "zustand";

type User = { name: string; handle: string; avatarUrl?: string };

type SessionState = {
  user: User;
  setUser: (user: Partial<User>) => void;
};

export const useSession = create<SessionState>((set) => ({
  user: { name: "John Doe", handle: "@nexus", avatarUrl: "/assets/avatar-placeholder.png" },
  setUser: (user) =>
    set((state) => ({
      user: { ...state.user, ...user },
    })),
}));
