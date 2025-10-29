import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { queryClient } from "../../../services/api/client";
import { NexusMode, NexusTheme, createModeChangeEvent, persistSession, readPersistedSession, useSessionStore } from "../../state/session";

interface ThemeContextValue {
  mode: NexusMode;
  theme: NexusTheme;
  setMode: (mode: NexusMode) => void;
  setTheme: (theme: NexusTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "nexus.theme";
const MODE_STORAGE_KEY = "nexus.mode";

function applyHtmlAttributes(theme: NexusTheme, mode: NexusMode, reducedMotion: boolean): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.dataset.theme = theme;
  html.dataset.mode = mode;
  html.dataset.reducedMotion = reducedMotion ? "true" : "false";
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [ready, setReady] = useState(false);
  const mode = useSessionStore((state) => state.mode);
  const theme = useSessionStore((state) => state.theme);
  const setMode = useSessionStore((state) => state.setMode);
  const setTheme = useSessionStore((state) => state.setTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const storedSnapshot = readPersistedSession();

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as NexusTheme | null;
    const storedMode = window.localStorage.getItem(MODE_STORAGE_KEY) as NexusMode | null;

    const resolvedTheme = storedTheme ?? storedSnapshot?.theme ?? (prefersDark ? "dark" : "light");
    const resolvedMode = storedMode ?? storedSnapshot?.mode ?? "student";

    if (storedSnapshot) {
      useSessionStore.setState((state) => ({
        ...state,
        ...storedSnapshot,
        mode: resolvedMode,
        theme: resolvedTheme,
      }));
    } else {
      useSessionStore.setState((state) => ({
        ...state,
        mode: resolvedMode,
        theme: resolvedTheme,
      }));
    }

    applyHtmlAttributes(resolvedTheme, resolvedMode, prefersReducedMotion);
    setReady(true);

    const mediaListener = (event: MediaQueryListEvent) => {
      if (event.matches) {
        applyHtmlAttributes("dark", resolvedMode, prefersReducedMotion);
        setTheme("dark");
      }
    };

    const reducedMotionListener = (event: MediaQueryListEvent) => {
      applyHtmlAttributes(theme, mode, event.matches);
    };

    const darkMedia = window.matchMedia?.("(prefers-color-scheme: dark)");
    const reducedMedia = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    darkMedia?.addEventListener("change", mediaListener);
    reducedMedia?.addEventListener("change", reducedMotionListener);

    return () => {
      darkMedia?.removeEventListener("change", mediaListener);
      reducedMedia?.removeEventListener("change", reducedMotionListener);
    };
  }, [mode, setTheme, theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    applyHtmlAttributes(theme, mode, prefersReducedMotion);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    persistSession({
      mode,
      theme,
      activeChatId: useSessionStore.getState().activeChatId,
      openChatIds: useSessionStore.getState().openChatIds,
    });
  }, [mode, theme]);

  useEffect(() => {
    const unsubscribe = useSessionStore.subscribe((state) => {
      persistSession({
        mode: state.mode,
        theme: state.theme,
        activeChatId: state.activeChatId,
        openChatIds: state.openChatIds,
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    createModeChangeEvent(mode);
  }, [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      theme,
      setMode,
      setTheme,
    }),
    [mode, theme, setMode, setTheme],
  );

  if (!ready) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${mode}-${theme}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ minHeight: "100vh" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return context;
}
