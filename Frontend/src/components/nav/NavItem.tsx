import { NavLink } from "react-router-dom";
import { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type Props = {
  to: string;
  icon: ReactNode;
  label: string;
  onNavigate?: () => void;
};

export default function NavItem({ to, icon, label, onNavigate }: Props) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "nav-pill",
          isActive && "is-active",
        )
      }
      aria-label={label}
    >
      <span
        className="shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border border-slate-200/60 bg-white/60 text-slate-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-200"
      >
        {icon}
      </span>
      <span className="text-sm font-medium tracking-tight">{label}</span>
    </NavLink>
  );
}
