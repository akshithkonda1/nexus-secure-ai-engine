import { NavLink } from "react-router-dom";
import { Bot, FileText, History, Layers, Settings, Sparkles, Home as HomeIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type SidebarProps = {
  active?: string;
  onNavigate?: (path: string) => void;
  variant?: "desktop" | "mobile";
};

const links = [
  { to: "/home", label: "Home", Icon: HomeIcon },
  { to: "/chat", label: "Chat", Icon: Bot },
  { to: "/sessions", label: "Sessions", Icon: Layers },
  { to: "/templates", label: "Templates", Icon: Sparkles },
  { to: "/documents", label: "Documents", Icon: FileText },
  { to: "/history", label: "History", Icon: History },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export function Sidebar({ active = "/home", onNavigate, variant = "desktop" }: SidebarProps) {
  const widthClass = variant === "mobile" ? "w-full" : "min-w-[200px]";
  return (
    <aside
      className={`border-r border-border/60 bg-[rgb(var(--panel))] px-4 py-6 shadow-[0_10px_28px_rgba(0,0,0,0.22)] ${widthClass}`}
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <div className="text-[11px] uppercase tracking-[0.2em] text-subtle px-2">Navigate</div>
          <nav className="mt-3 space-y-1">
            {links.map(({ to, label, Icon }) => {
              const isActive = active === to || (to !== "/" && active.startsWith(to));
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => onNavigate?.(to)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                    isActive
                      ? "border-transparent bg-[color:var(--brand)] text-white shadow-[0_14px_30px_rgba(0,0,0,0.3)]"
                      : "border-border/60 text-subtle hover:bg-surface/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
