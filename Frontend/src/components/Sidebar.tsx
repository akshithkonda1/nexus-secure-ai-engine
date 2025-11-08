import { type ReactNode, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  MessageCircle,
  Folder,
  Sparkles,
  FileText,
  BarChart3,
  History as HistoryIcon,
  Settings as SettingsIcon,
  SunMoon,
} from "lucide-react";

type SidebarProps = {
  active?: string;
  onNavigate?: (path: string) => void;
  variant?: "desktop" | "mobile";
};
type NavItem = { label: string; to: string; icon: ReactNode };

export function Sidebar({ active = "/", onNavigate, variant = "desktop" }: SidebarProps) {
  const items = useMemo<NavItem[]>(
    () => [
      { label: "Chat", to: "/chat", icon: <MessageCircle className="h-5 w-5" /> },
      { label: "Sessions", to: "/sessions", icon: <Folder className="h-5 w-5" /> },
      { label: "Templates", to: "/templates", icon: <Sparkles className="h-5 w-5" /> },
      { label: "Documents", to: "/documents", icon: <FileText className="h-5 w-5" /> },
      { label: "Metrics", to: "/metrics", icon: <BarChart3 className="h-5 w-5" /> },
      { label: "History", to: "/history", icon: <HistoryIcon className="h-5 w-5" /> },
      { label: "Settings", to: "/settings", icon: <SettingsIcon className="h-5 w-5" /> },
    ],
    []
  );

  const widthClass = variant === "mobile" ? "w-full" : "w-[76px]";
  const isActivePath = (path: string) => active === path || (path !== "/" && active.startsWith(`${path}/`));

  const toggleTheme = () => {
    const root = document.documentElement;
    const dark = root.classList.toggle("dark", !root.classList.contains("dark"));
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  return (
    <aside
      className={`h-screen ${widthClass} bg-[rgb(var(--panel))] border-r border-border/60 py-3 flex flex-col items-center gap-2`}
    >
      <div className="h-9 w-9 rounded-xl bg-prism grid place-items-center text-[10px] font-semibold shadow">Nx</div>
      <nav className="mt-1 flex flex-col items-center gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => onNavigate?.(item.to)}
            title={item.label}
            className={({ isActive }) => {
              const selected = isActive || isActivePath(item.to);
              const base = "h-10 w-10 rounded-xl grid place-items-center transition";
              return selected
                ? `${base} bg-surface/70 ring-2 ring-[var(--brand)]`
                : `${base} hover:bg-surface/60`;
            }}
          >
            <span className="sr-only">{item.label}</span>
            {item.icon}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pb-2">
        <button title="Toggle theme" onClick={toggleTheme} className="h-10 w-10 rounded-xl grid place-items-center hover:bg-surface/60">
          <SunMoon className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
