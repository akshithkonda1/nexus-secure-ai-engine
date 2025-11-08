import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  MessageCircle,
  Layers,
  FileText,
  History,
  Settings,
  Sparkle
} from "lucide-react";

const NAVIGATION = [
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/templates", label: "Templates", icon: Layers },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings }
];

type SidebarProps = {
  active: string;
  onNavigate: (path: string) => void;
};

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <motion.aside
      className="relative hidden h-screen w-[86px] flex-col items-center border-r border-[rgb(var(--border)/0.6)] bg-[rgb(var(--surface)/0.92)] px-3 py-6 backdrop-blur dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.68)] md:flex"
      layout
    >
      <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand)] text-white shadow-glow">
        <Sparkle className="h-5 w-5" />
      </div>
      <nav className="flex flex-1 flex-col items-center gap-2">
        {NAVIGATION.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.to || active.startsWith(`${item.to}/`);
          return (
            <button
              key={item.to}
              onClick={() => onNavigate(item.to)}
              className={clsx(
                "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border text-[rgb(var(--text))] transition",
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
            </button>
          );
        })}
      </nav>
    </motion.aside>
  );
}
