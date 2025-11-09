import { useMemo } from "react";
import { Search, Sparkle, ChevronRight, PanelLeft, PanelLeftOpen } from "lucide-react";
import { motion } from "framer-motion";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  const title = useMemo(() => TITLE_MAP[activePath] ?? "Nexus.ai", [activePath]);
  const profile = useMemo(
    () => ({
      name: "Morgan Vega",
      email: "morgan.vega@nexus.ai",
      role: "Workspace Admin"
    }),
    []
  );

  return (
    <header className="sticky top-0 z-30 border-b border-[color:rgba(var(--border))] bg-[rgb(var(--surface))]/85 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-6 px-4 sm:px-8 lg:px-12">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[color:rgba(var(--text)/0.55)]">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden h-8 w-8 items-center justify-center rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--text))] transition sm:flex"
              aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              aria-pressed={sidebarExpanded}
            >
              {sidebarExpanded ? <PanelLeft className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
            <Sparkle className="h-4 w-4 text-[color:var(--brand)]" />
            Nexus
            <ChevronRight className="h-3 w-3" />
            <span className="tracking-tight">{title}</span>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:rgba(var(--text)/0.45)]" />
            <input
              type="search"
              placeholder="Search sessions, documents, actions…"
              className="h-11 w-full rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] pl-12 pr-4 text-sm text-[rgb(var(--text))] outline-none focus:ring-2 focus:ring-[color:rgba(var(--ring)/.35)]"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <motion.div layout className="hidden md:block">
            <ThemeToggle />
          </motion.div>
          <ProfileMenu user={profile} />
        </div>
      </div>
    </header>
  );
}
