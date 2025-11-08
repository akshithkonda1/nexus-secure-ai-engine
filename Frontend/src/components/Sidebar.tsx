import {
  BarChart3,
  FileText,
  History,
  Layers,
  MessageCircle,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { label: "Chat", path: "/chat", icon: MessageCircle },
  { label: "Sessions", path: "/sessions", icon: Layers },
  { label: "Templates", path: "/templates", icon: Sparkles },
  { label: "Documents", path: "/docs", icon: FileText },
  { label: "Metrics", path: "/metrics", icon: BarChart3 },
  { label: "History", path: "/history", icon: History },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

type SidebarProps = {
  active: string;
  onNavigate: (path: string) => void;
};

export const Sidebar = ({ active, onNavigate }: SidebarProps) => {
  return (
    <aside className="fixed inset-y-16 left-0 z-40 hidden w-16 flex-col items-center border-r border-border/70 px-2 py-8 lg:flex">
      <nav className="flex w-full flex-1 flex-col items-center gap-3">
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = active.startsWith(path);

          return (
            <button
              key={path}
              type="button"
              onClick={() => onNavigate(path)}
              aria-current={isActive ? "page" : undefined}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 ${
                isActive
                  ? "border-accent/60 bg-accent/20 text-accent shadow-glow"
                  : "border-transparent bg-card/70 text-muted hover:border-border/60 hover:bg-card"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-xl border border-border/60 bg-card/95 px-3 py-1 text-sm font-medium text-foreground shadow-soft backdrop-blur group-hover:flex">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="mt-6 w-full px-1">
        <ThemeToggle />
      </div>
    </aside>
  );
};

export default Sidebar;
