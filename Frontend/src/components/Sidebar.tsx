import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  Home,
  MessageCircle,
  Layers,
  FileText,
  History as HistoryIcon,
  Settings,
  Sparkle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const NAVIGATION = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/templates", label: "Templates", icon: Layers },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/history", label: "History", icon: HistoryIcon },
  { to: "/settings", label: "Settings", icon: Settings }
];

type SidebarProps = {
  active: string;
  expanded: boolean;
  onNavigate: (path: string) => void;
  onToggle: () => void;
};

export function Sidebar({ active, expanded, onNavigate, onToggle }: SidebarProps) {
  return (
    <aside
      className="relative hidden h-screen w-[86px] flex-col items-center border-r border-[rgb(var(--border)/0.6)] bg-[rgb(var(--surface)/0.92)] px-3 py-6 backdrop-blur dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.68)] md:flex"
    >
      <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand)] text-white shadow-glow">
        <Sparkle className="h-5 w-5" />
      </div>

      <nav className={clsx("flex flex-1 flex-col items-center gap-2", expanded && "items-stretch")}> 
        {NAVIGATION.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.to === "/"
              ? active === "/"
              : active === item.to || active.startsWith(`${item.to}/`);

          return (
            <button
              key={item.to}
              onClick={() => onNavigate(item.to)}
              className={clsx(
                "relative flex h-12 items-center overflow-hidden rounded-2xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/60 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-[#0b0f16]",
                expanded ? "w-full justify-start gap-3 px-4" : "w-12 justify-center",
                isActive
                  ? "border-transparent bg-[color:var(--brand)] text-white shadow-glow"
                  : "border-[rgb(var(--border)/0.55)] bg-[rgb(var(--surface)/0.82)] hover:border-[color:var(--brand)] dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.54)]"
              )}
              aria-label={item.label}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-[color:var(--brand)]"
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                />
              )}
              <Icon className="relative h-5 w-5" />
              {expanded ? (
                <span className="relative z-10 font-medium">{item.label}</span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={clsx("mt-auto flex w-full justify-center pt-6", expanded && "justify-between px-1")}> 
        {expanded && <div className="text-xs font-medium uppercase tracking-[0.3em] text-[rgb(var(--text)/0.4)]">Layout</div>}
        <button
          onClick={onToggle}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white/80 px-4 text-sm font-semibold text-[rgb(var(--text))] shadow-sm transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] dark:border-white/10 dark:bg-white/10"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-pressed={expanded}
        >
          {expanded && <span className="text-xs font-medium uppercase tracking-[0.32em]">Collapse</span>}
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
