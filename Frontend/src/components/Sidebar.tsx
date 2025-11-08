import { NavLink } from "react-router-dom";
import {
  MessageSquare,
  Layers,
  FileText,
  BarChart3,
  History as HistoryIcon,
  Settings as Cog,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const item = "flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/5 transition-colors";
const active = "bg-white/10 text-white shadow-soft border border-white/10";

const links = [
  { to: "/chat", label: "Chat", Icon: MessageSquare },
  { to: "/sessions", label: "Sessions", Icon: Layers },
  { to: "/templates", label: "Templates", Icon: Sparkles },
  { to: "/documents", label: "Documents", Icon: FileText },
  { to: "/metrics", label: "Metrics", Icon: BarChart3 },
  { to: "/history", label: "History", Icon: HistoryIcon },
  { to: "/settings", label: "Settings", Icon: Cog },
];

type SidebarProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: (path: string) => void;
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
}
