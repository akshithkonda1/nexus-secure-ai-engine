import { create } from "zustand";
import { PricingTierId } from "@/config/pricing";
import { computeLockedUntil } from "@/shared/lib/lock";

export type ThemePreference = "light" | "dark";
export type ModePreference = "student" | "business" | "nexusos";

const STORAGE_KEY = "nexus.session";

type PersistedSession = {
  plan: PricingTierId;
  firstInstallISO: string;
  lockedUntilISO?: string;
};

const DEFAULT_PLAN: PricingTierId = "free";

const nowISO = () => new Date().toISOString();

const readPersisted = (): PersistedSession => {
  if (typeof window === "undefined") {
    return {
      plan: DEFAULT_PLAN,
      firstInstallISO: nowISO()
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        plan: DEFAULT_PLAN,
        firstInstallISO: nowISO()
      };
    }
    const parsed = JSON.parse(raw) as PersistedSession;
    return {
      plan: parsed.plan ?? DEFAULT_PLAN,
      firstInstallISO: parsed.firstInstallISO ?? nowISO(),
      lockedUntilISO: parsed.lockedUntilISO
    };
  } catch (error) {
    console.warn("Unable to read session storage", error);
    return {
      plan: DEFAULT_PLAN,
      firstInstallISO: nowISO()
    };
  }
};

const persistSession = (payload: PersistedSession) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Unable to persist session storage", error);
  }
};

export type SessionState = {
  activeChatId?: string;
  theme: ThemePreference;
  mode: ModePreference;
  plan: PricingTierId;
  firstInstallISO: string;
  lockedUntilISO: string;
  setActiveChatId: (id?: string) => void;
  setTheme: (theme: ThemePreference) => void;
  setMode: (mode: ModePreference) => void;
  setPlan: (plan: PricingTierId) => void;
  setLockedUntilISO: (iso: string) => void;
};

export const useSessionStore = create<SessionState>((set, get) => {
  const persisted = readPersisted();
  const firstInstallISO = persisted.firstInstallISO || nowISO();
  const lockedUntilISO = computeLockedUntil({
    firstInstallISO,
    lockedUntilISO: persisted.lockedUntilISO
  });

  const baseState = {
    activeChatId: undefined,
    theme: "light" as ThemePreference,
    mode: "nexusos" as ModePreference,
    plan: persisted.plan,
    firstInstallISO,
    lockedUntilISO
  } satisfies Omit<SessionState, "setActiveChatId" | "setTheme" | "setMode" | "setPlan" | "setLockedUntilISO">;

  if (typeof window !== "undefined") {
    persistSession({ plan: baseState.plan, firstInstallISO, lockedUntilISO });
  }

  return {
    ...baseState,
    setActiveChatId: (activeChatId) => set({ activeChatId }),
    setTheme: (theme) => set({ theme }),
    setMode: (mode) => set({ mode }),
    setPlan: (plan) => {
      set((state) => {
        const nextLocked = computeLockedUntil({
          firstInstallISO: state.firstInstallISO,
          lockedUntilISO: state.lockedUntilISO
        });
        return { plan, lockedUntilISO: nextLocked };
      });
      const next = get();
      persistSession({
        plan: next.plan,
        firstInstallISO: next.firstInstallISO,
        lockedUntilISO: next.lockedUntilISO
      });
    },
    setLockedUntilISO: (iso) => {
      set({ lockedUntilISO: iso });
      const next = get();
      persistSession({
        plan: next.plan,
        firstInstallISO: next.firstInstallISO,
        lockedUntilISO: iso
      });
    }
  };
});
