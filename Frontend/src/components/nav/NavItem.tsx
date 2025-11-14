import { NavLink } from "react-router-dom";
import { ReactNode } from "react";

import { useSidebar } from "@/components/layout/sidebar/SidebarContext";

type NavItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  onNavigate?: () => void;
};

export default function NavItem({ to, icon, label, onNavigate }: NavItemProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="group relative">
      <NavLink
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          ["nav-pill", "pr-3", collapsed ? "justify-center" : "", isActive ? "is-active" : ""]
            .filter(Boolean)
            .join(" ")
        }
        aria-label={label}
      >
        <span className="nav-icon">{icon}</span>
        {!collapsed && <span className="ml-1 text-sm font-medium">{label}</span>}
      </NavLink>

      {collapsed && (
        <div
          role="tooltip"
          style={{ zIndex: 60 }}
          className="pointer-events-none absolute left-[64px] top-1/2 -translate-y-1/2 translate-x-1 rounded-[18px] border border-zora-border bg-[color:color-mix(in_srgb,var(--zora-space)_82%,transparent)] px-3 py-1.5 text-sm font-medium text-zora-white opacity-0 shadow-zora-soft backdrop-blur-xl transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100"
        >
          {label}
        </div>
      )}
    </div>
  );
}
