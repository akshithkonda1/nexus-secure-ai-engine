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

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const title = useMemo(() => TITLE_MAP[activePath] ?? "Nexus.ai", [activePath]);

  return (
    <header
      className="sticky top-0 z-30 border-b border-[rgba(180,200,255,0.45)] bg-gradient-to-r from-[rgba(247,250,255,0.85)] via-[rgba(226,238,255,0.75)] to-[rgba(247,250,255,0.7)] backdrop-blur dark:border-white/10 dark:bg-[#0b0f16]/70"
    >
      <div className="mx-auto flex h-20 w-full items-center justify-between gap-6 px-4 sm:px-10">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-[rgb(var(--text)/0.45)]">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden h-8 w-8 items-center justify-center rounded-2xl border border-transparent bg-white/70 text-[rgb(var(--text))] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] dark:bg-white/10 md:inline-flex"
              aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              aria-pressed={sidebarExpanded}
            >
              {sidebarExpanded ? <PanelLeft className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
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
              className="h-11 w-full rounded-2xl border border-transparent bg-white/60 pl-12 pr-4 text-sm text-[rgb(var(--text))] shadow-inner outline-none transition focus:border-[color:var(--brand)] focus:shadow-soft dark:bg-white/5"
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setTheme((mode) => (mode === "dark" ? "light" : "dark"))}
          className={cn(
            "relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white/80 text-[rgb(var(--text))] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] dark:border-white/10 dark:bg-white/5"
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
