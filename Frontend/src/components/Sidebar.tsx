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
    <motion.aside
      className={clsx(
        "relative hidden h-screen flex-col items-center border-r border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] px-3 py-6 shadow-sm md:flex",
        expanded ? "w-[240px]" : "w-[88px]"
      )}
      layout
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
    >
      <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand)] text-white shadow-md">
        <Sparkle className="h-5 w-5" />
      </div>

      <nav className={clsx("flex flex-1 flex-col items-center gap-4", expanded && "items-stretch")}> 
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
                "relative flex items-center overflow-hidden rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-[color:rgba(var(--ring)/.35)]",
                expanded ? "w-full justify-start gap-3 px-4 py-2.5" : "h-12 w-12 justify-center",
                isActive
                  ? "border-transparent bg-[color:var(--brand)] text-white shadow-md"
                  : "border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] text-[color:rgba(var(--text)/0.7)] hover:bg-[rgb(var(--panel))] hover:text-[rgb(var(--text))]"
              )}
              aria-label={item.label}
            >
              <Icon className="relative h-5 w-5" />
              {expanded ? (
                <span className="relative z-10 font-medium tracking-tight">{item.label}</span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-3 py-1 text-sm text-[color:rgba(var(--text)/0.7)] transition hover:text-[rgb(var(--text))]"
      >
        {expanded ? (
          <>
            <ChevronLeft className="h-4 w-4" />
            Collapse
          </>
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    </motion.aside>
  );
}
