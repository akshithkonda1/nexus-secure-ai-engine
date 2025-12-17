import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Layout, Settings } from "lucide-react";
import { cn, bg, text, border, patterns } from "../utils/theme";

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Toron", to: "/toron", icon: MessageSquare },
  { label: "Workspace", to: "/workspace", icon: Layout },
];

// Dragon logo SVG component with gradient
function DragonLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
      <path
        d="M20 4C18 4 16 5 15 7L12 12C11 14 10 16 11 18C11.5 19 12.5 19.5 14 19.5C14 20 14 21 15 22C16 23 17.5 23.5 19 23.5C19 25 19.5 27 21 28.5C22.5 30 25 31 27 30.5C28.5 30 29.5 28.5 30 27C30.5 25.5 30.5 24 30 22.5C31 22 32 21 32.5 19.5C33 18 33 16 31.5 14.5C30 13 28 12.5 26 13C26 11.5 25.5 10 24 9C22.5 8 21 7.5 20 4Z"
        fill="currentColor"
      />
      {/* Dragon eye */}
      <circle cx="23" cy="15" r="1.5" fill="var(--bg-app)" />
      {/* Dragon details */}
      <path
        d="M15 19C15.5 18 16 17 17 16.5M20 23.5C21 24 22 24.5 23 24.5M27 28C28 27 28.5 26 29 25"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

type SidebarProps = {
  collapsed?: boolean;
};

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-between px-5 py-6 transition-colors",
        bg.surface,
        text.primary,
        collapsed && "items-center"
      )}
    >
      <div className="space-y-8">
        {/* Logo and Brand */}
        <div className={cn("flex items-center gap-3 px-2", collapsed && "justify-center")}>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm",
            bg.accent,
            text.inverse
          )}>
            <DragonLogo />
          </div>
          {!collapsed && <span className={cn("text-lg font-semibold tracking-tight", text.primary)}>Ryuzen</span>}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to} title={item.label} aria-label={item.label}>
                <div className={patterns.navItem(active)}>
                  <span
                    className={cn(
                      "absolute left-0 h-full w-1 rounded-r-full transition-colors",
                      active ? "bg-[var(--accent)]" : "bg-transparent"
                    )}
                    aria-hidden
                  />
                  <Icon
                    className={cn(
                      collapsed ? "h-5 w-5" : "ml-3 h-5 w-5",
                      active ? text.primary : "text-[var(--muted)] group-hover:text-[var(--text)]"
                    )}
                    aria-hidden
                  />
                  {!collapsed && <span className="tracking-normal">{item.label}</span>}
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <nav className={cn("border-t pt-6 transition-colors", border.subtle, collapsed && "w-full")}>
        <NavLink to="/settings">
          <div className={patterns.navItem(location.pathname === "/settings")}>
            <span
              className={cn(
                "absolute left-0 h-full w-1 rounded-r-full transition-colors",
                location.pathname === "/settings" ? "bg-[var(--accent)]" : "bg-transparent"
              )}
              aria-hidden
            />
            <Settings
              className={cn(
                collapsed ? "h-5 w-5" : "ml-3 h-5 w-5",
                location.pathname === "/settings" ? text.primary : "text-[var(--muted)] group-hover:text-[var(--text)]"
              )}
              aria-hidden
            />
            {!collapsed && <span>Settings</span>}
          </div>
        </NavLink>
      </nav>
    </div>
  );
}
