import { useEffect, useMemo, useState } from "react";
import {
  Moon,
  Sun,
  Search,
  Sparkle,
  ChevronRight,
  PanelLeft,
  PanelLeftOpen
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useAuth } from "@/state/useAuth";

type TopbarProps = {
  activePath: string;
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
};

const TITLE_MAP: Record<string, string> = {
  "/": "Home Hub",
  "/chat": "Conversational Studio",
  "/templates": "Prompt Templates",
  "/documents": "Knowledge Vault",
  "/history": "Audit Trail",
  "/settings": "Control Center"
};

export function Topbar({ activePath, sidebarExpanded, onToggleSidebar }: TopbarProps) {
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
  const { user } = useAuth();
  const profile = useMemo(
    () => ({ ...user, role: "Workspace Admin" }),
    [user]
  );

  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-white/30 backdrop-blur-2xl transition-colors duration-300 dark:border-white/10 dark:bg-[#0b101d]/40">
      <div className="mx-auto flex h-24 w-full max-w-[1600px] items-center justify-between gap-8 px-[var(--page-padding)]">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] text-[rgb(var(--text)/0.45)]">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden h-9 w-9 items-center justify-center rounded-2xl border border-transparent bg-white/70 text-[rgb(var(--text))] shadow-[0_10px_30px_rgba(15,23,42,0.12)] transition-all duration-300 hover:border-[color:var(--brand)]/60 hover:text-[color:var(--brand)] dark:bg-white/10 md:inline-flex"
              aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              aria-pressed={sidebarExpanded}
            >
              {sidebarExpanded ? <PanelLeft className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <Sparkle className="h-4 w-4 text-[color:var(--brand)]" />
            Nexus.ai
            <ChevronRight className="h-3 w-3" />
            <span className="tracking-tight">{title}</span>
          </div>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[rgb(var(--text)/0.28)]" />
            <input
              type="search"
              placeholder="Search sessions, documents, actions…"
              className="h-12 w-full rounded-3xl border border-white/40 bg-white/60 pl-14 pr-4 text-sm font-medium text-[rgb(var(--text))] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition-all duration-300 focus:border-[color:var(--brand)]/60 focus:shadow-[0_18px_48px_rgba(64,110,255,0.16)] dark:border-white/10 dark:bg-white/10 dark:text-white"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              setLock("manual");
              setTheme((mode) => (mode === "dark" ? "light" : "dark"));
            }}
            className={cn(
              "relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-white/70 text-[rgb(var(--text))] shadow-[0_12px_32px_rgba(15,23,42,0.16)] transition-all duration-300 hover:border-[color:var(--brand)]/60 hover:text-[color:var(--brand)] dark:border-white/10 dark:bg-white/10 dark:text-white"
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
          <ProfileMenu user={profile} />
        </div>
      </div>
    </header>
  );
}
