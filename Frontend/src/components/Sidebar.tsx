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

const Sidebar = ({ active, onNavigate }: SidebarProps) => {
  return (
    <aside className="aside fixed bottom-0 left-0 top-16 hidden w-[76px] flex-col items-center gap-3 py-4 lg:flex">
      <nav className="flex flex-1 flex-col items-center gap-3">
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = active.startsWith(path);

          return (
            <button
              key={path}
              type="button"
              onClick={() => onNavigate(path)}
              title={label}
              aria-current={isActive ? "page" : undefined}
              className={`group relative grid h-12 w-12 place-items-center rounded-xl border border-border/20 text-subtle transition-all duration-200 hover:border-brand/30 hover:text-white/90 hover:shadow-glow ${
                isActive
                  ? "bg-brand/15 text-white/90 border-brand/40"
                  : "bg-[rgb(var(--surface))]"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </nav>
      <div className="mt-auto w-full px-2 pb-2 [&>button]:bg-[rgb(var(--panel))] [&>button]:border-border/30 [&>button]:text-subtle [&>button:hover]:border-lilac/30">
        <ThemeToggle />
      </div>
    </aside>
  );
};

export default Sidebar;
