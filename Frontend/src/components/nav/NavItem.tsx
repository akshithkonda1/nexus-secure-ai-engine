import { NavLink } from "react-router-dom";
import { ReactNode } from "react";

import { useSidebar } from "@/components/layout/sidebar/SidebarContext";
import { cn } from "@/shared/lib/cn";

type NavItemProps = {
  to: string;
  icon: ReactNode;
  label: string;
  onNavigate?: () => void;
};

export default function NavItem({ to, icon, label, onNavigate }: NavItemProps) {
  const { collapsed } = useSidebar();

  return (
    <div className="relative group/nav">
      <NavLink
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "group relative flex items-center gap-2 rounded-zora-lg border border-transparent px-4 py-2.5 font-medium tracking-tight transition-transform transition-shadow duration-200 hover:translate-y-[-1px] hover:shadow-zora-glow active:translate-y-[0]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
            collapsed ? "justify-center px-0" : "justify-start",
            isActive
              ? "border border-borderLight/10 bg-bgPrimary/4 text-[rgb(var(--text))] shadow-[0_0_0_1px_rgba(148,163,184,0.25)] hover:bg-bgPrimary/6 hover:text-[rgb(var(--text))]"
              : "text-[rgba(var(--subtle),0.85)] hover:bg-bgPrimary/4 hover:text-[rgb(var(--text))]"
          )
        }
        aria-label={label}
      >
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-[1.05rem] border border-zora-border/70 bg-bgPrimary/5 text-[rgba(var(--subtle),0.8)] shadow-[0_14px_30px_rgba(8,15,35,0.45)] backdrop-blur-xl transition-colors transition-transform duration-200",
            "group-hover:border-borderLight/15 group-hover:bg-bgPrimary/12 group-hover:text-[rgb(var(--text))]",
            "group-aria-[current=page]:border-borderLight/20 group-aria-[current=page]:bg-bgPrimary/16 group-aria-[current=page]:text-[rgb(var(--text))] group-aria-[current=page]:shadow-zora-glow"
          )}
        >
          {icon}
        </span>
        {!collapsed && <span className="ml-1 text-sm font-medium text-[rgba(var(--subtle),0.9)]">{label}</span>}
      </NavLink>

      {collapsed && (
        <div
          role="tooltip"
          style={{ zIndex: 60 }}
          className="pointer-events-none absolute left-[64px] top-1/2 -translate-y-1/2 translate-x-1 rounded-[18px] border border-zora-border bg-[color:color-mix(in_srgb,var(--zora-space)_82%,transparent)] px-3 py-1.5 text-sm font-medium text-zora-white opacity-0 shadow-zora-soft backdrop-blur-xl transition-all duration-150 group/nav-hover:translate-x-0 group/nav-hover:opacity-100 group/nav-focus-within:translate-x-0 group/nav-focus-within:opacity-100"
        >
          {label}
        </div>
      )}
    </div>
  );
}
