import { create } from "zustand";

export type ThemeChoice = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

type ThemeState = {
  theme: ThemeChoice;
  resolvedTheme: "light" | "dark";
  setTheme: (choice: ThemeChoice) => void;
  init: () => void;
};

function detectSystemDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function readStoredTheme(): ThemeChoice {
  if (typeof window === "undefined") {
    return "system";
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore storage read errors
  }
  return "system";
}

function readInitialResolvedTheme(): "light" | "dark" {
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("dark")) {
      return "dark";
    }
  }
  return detectSystemDark() ? "dark" : "light";
}

function applyTheme(choice: ThemeChoice): "light" | "dark" {
  const isDark = choice === "dark" || (choice === "system" && detectSystemDark());

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.dataset.theme = isDark ? "dark" : "light";

    const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (meta) {
      meta.content = isDark ? "#0B0B0D" : "#FFFFFF";
    }
  }

  return isDark ? "dark" : "light";
}

let initialized = false;
let unsubscribeSystemListener: (() => void) | undefined;

export const useTheme = create<ThemeState>((set, get) => ({
  theme: typeof window === "undefined" ? "system" : readStoredTheme(),
  resolvedTheme: readInitialResolvedTheme(),
  setTheme: (choice) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, choice);
      } catch {
        // ignore storage errors
      }
    }
    const resolved = applyTheme(choice);
    set({ theme: choice, resolvedTheme: resolved });
  },
  init: () => {
    if (initialized) {
      return;
    }
    initialized = true;

    if (typeof window === "undefined") {
      return;
    }

    const stored = readStoredTheme();
    const resolved = applyTheme(stored);
    set({ theme: stored, resolvedTheme: resolved });

    if (typeof window.matchMedia === "function") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (get().theme === "system") {
          const nextResolved = applyTheme("system");
          set({ resolvedTheme: nextResolved });
        }
      };

      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", handleChange);
        unsubscribeSystemListener = () => {
          mql.removeEventListener("change", handleChange);
        };
      } else if (typeof mql.addListener === "function") {
        mql.addListener(handleChange);
        unsubscribeSystemListener = () => {
          mql.removeListener(handleChange);
        };
      }
    }
  },
}));

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    initialized = false;
    if (unsubscribeSystemListener) {
      unsubscribeSystemListener();
      unsubscribeSystemListener = undefined;
    }
  });
}
