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
        "relative hidden h-screen flex-col items-center border-r border-[rgb(var(--border)/0.6)] bg-[rgb(var(--surface)/0.92)] px-3 py-6 backdrop-blur dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.68)] md:flex",
        expanded ? "w-[240px]" : "w-[86px]"
      )}
      layout
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
    >
      <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand)] text-white shadow-glow">
        <Sparkle className="h-5 w-5" />
      </div>

      <nav className={clsx("flex flex-1 flex-col items-center gap-6", expanded && "items-stretch")}> 
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
                "relative flex h-12 items-center overflow-hidden rounded-2xl border text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/60 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-offset-[#0b0f16]",
                expanded ? "w-full justify-start gap-3 px-4" : "w-12 justify-center",
                isActive
                  ? "border-transparent bg-[color:var(--brand)] text-white shadow-glow"
                  : "border-white/30 bg-white/60 text-[rgb(var(--text)/0.75)] shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white/70 hover:border-[color:var(--brand)]/60 hover:text-[rgb(var(--text))]"
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
                <span className="relative z-10 font-medium tracking-tight">{item.label}</span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
