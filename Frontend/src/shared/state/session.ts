import { create } from "zustand";
import type { PlanKey } from "@/config/pricing";

type User = { id: string; email: string; name?: string } | null;

type State = {
  user: User;
  token: string | null;
  plan: PlanKey;
  setUser: (user: User, token?: string | null) => void;
  setPlan: (plan: PlanKey) => void;
  signOut: () => void;
};

const KEY_TOKEN = "nexus.token";
const KEY_PLAN = "nexus.plan";

const readLocal = (key: string): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeLocal = (key: string, value: string | null) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore storage errors (private mode, etc.)
  }
};

export const useSession = create<State>((set) => {
  const initialToken = readLocal(KEY_TOKEN);
  const storedPlan = readLocal(KEY_PLAN) as PlanKey | null;

  return {
    user: null,
    token: initialToken,
    plan: storedPlan && ["free", "academic", "premium", "pro"].includes(storedPlan)
      ? (storedPlan as PlanKey)
      : "free",
    setUser: (user, token) => {
      if (token !== undefined) {
        writeLocal(KEY_TOKEN, token);
        set({ user, token: token ?? null });
        return;
      }
      set({ user });
    },
    setPlan: (plan) => {
      writeLocal(KEY_PLAN, plan);
      set({ plan });
    },
    signOut: () => {
      writeLocal(KEY_TOKEN, null);
      set({ user: null, token: null });
    },
  };
});

export const useSessionStore = useSession;
