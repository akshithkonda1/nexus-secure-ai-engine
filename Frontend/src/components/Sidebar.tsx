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
    <aside className="relative hidden h-screen w-[86px] flex-col items-center border-r border-[rgba(255,255,255,0.16)] bg-gradient-to-b from-white/80 via-white/60 to-white/30 px-3 py-6 backdrop-blur dark:from-[#0b0f16]/80 dark:via-[#0b0f16]/60 dark:to-[#0b0f16]/30 md:flex">
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
                  : "border-[rgba(0,0,0,0.08)] bg-white/70 hover:border-[color:var(--brand)] dark:border-white/10 dark:bg-white/5"
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
    </aside>
  );
}
