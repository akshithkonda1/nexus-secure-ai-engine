import { create } from "zustand";
import type { PlanKey } from "@/config/pricing";

type Session = {
  user?: { id: string; name: string; email: string } | null;
  plan: PlanKey;
  firstInstallISO?: string;
  lockedUntilISO?: string;
  setPlan: (p: PlanKey) => void;
  setUser: (u: Session["user"]) => void;
};

export const useSession = create<Session>((set) => ({
  user: null,
  plan: "free",
  setPlan: (p) => set({ plan: p }),
  setUser: (u) => set({ user: u }),
}));
