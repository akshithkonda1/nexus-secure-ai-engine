import { useEffect, useMemo, useState } from "react";
import { Moon, Sun, Search, Sparkle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TopbarProps = {
  activePath: string;
};

const TITLE_MAP: Record<string, string> = {
  "/chat": "Conversational Studio",
  "/templates": "Prompt Templates",
  "/documents": "Knowledge Vault",
  "/history": "Audit Trail",
  "/settings": "Control Center"
};

export function Topbar({ activePath }: TopbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [lock, setLock] = useState<"system" | "manual">(() => {
    if (typeof window === "undefined") return "system";
    const storedLock = localStorage.getItem("theme-lock");
    if (storedLock === "manual" || storedLock === "system") return storedLock;
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "light" || storedTheme === "dark" ? "manual" : "system";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
    localStorage.setItem("theme-lock", lock);
    window.dispatchEvent(new CustomEvent("nexus-theme-change", { detail: theme }));
  }, [theme, lock]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("theme-lock", lock);
  }, [lock]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncWithSystem = (event?: MediaQueryListEvent) => {
      const matches = event?.matches ?? media.matches;
      if (lock === "system") {
        setTheme(matches ? "dark" : "light");
      }
    };
    syncWithSystem();
    const listener = (event: MediaQueryListEvent) => syncWithSystem(event);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", listener);
    } else {
      // Safari < 14 fallback
      // eslint-disable-next-line deprecation/deprecation
      media.addListener(listener);
    }
    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", listener);
      } else {
        // eslint-disable-next-line deprecation/deprecation
        media.removeListener(listener);
      }
    };
  }, [lock]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key === "theme" && (event.newValue === "light" || event.newValue === "dark")) {
        setTheme(event.newValue);
      }
      if (event.key === "theme-lock" && (event.newValue === "manual" || event.newValue === "system")) {
        setLock(event.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const title = useMemo(() => TITLE_MAP[activePath] ?? "Nexus.ai", [activePath]);

  return (
    <header
      className="sticky top-0 z-30 border-b border-[rgb(var(--border)/0.65)] bg-[rgb(var(--surface)/0.9)] backdrop-blur dark:border-[rgb(var(--border)/0.55)] dark:bg-[rgb(var(--surface)/0.72)]"
    >
      <div className="mx-auto flex h-20 w-full items-center justify-between gap-6 px-4 sm:px-10">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[rgb(var(--text)/0.45)]">
            <Sparkle className="h-4 w-4 text-[color:var(--brand)]" />
            Nexus.ai
            <ChevronRight className="h-3 w-3" />
            <span>{title}</span>
          </div>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text)/0.35)]" />
            <input
              type="search"
              placeholder="Search sessions, documents, actions…"
              className="h-11 w-full rounded-2xl border border-[rgb(var(--border)/0.45)] bg-[rgb(var(--surface)/0.78)] pl-12 pr-4 text-sm text-[rgb(var(--text))] shadow-inner outline-none transition focus:border-[color:var(--brand)] focus:shadow-soft dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.55)]"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setLock("manual");
            setTheme((mode) => (mode === "dark" ? "light" : "dark"));
          }}
          className={cn(
            "relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[rgb(var(--border)/0.55)] bg-[rgb(var(--surface)/0.86)] text-[rgb(var(--text))] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.6)]"
          )}
          aria-label="Toggle theme"
        >
          <motion.span
            key={theme}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.span>
        </motion.button>
      </div>
    </header>
  );
}
