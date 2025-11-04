import { type ReactNode, useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  MessageCircle,
  Folder,
  Sparkles,
  FileText,
  BarChart3,
  History,
  Settings as SettingsIcon,
} from "lucide-react";

const navIconClasses = "h-5 w-5";

type SidebarProps = {
  onNavigate?: () => void;
  variant: "desktop" | "mobile";
};

type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
};

export function Sidebar({ onNavigate, variant }: SidebarProps) {
  const items = useMemo<NavItem[]>(
    () => [
     
      { label: "Chat", to: "/chat", icon: <MessageCircle className={navIconClasses} aria-hidden="true" /> },
      { label: "Sessions", to: "/projects", icon: <Folder className={navIconClasses} aria-hidden="true" /> },
      { label: "Templates", to: "/templates", icon: <Sparkles className={navIconClasses} aria-hidden="true" /> },
      { label: "Documents", to: "/documents", icon: <FileText className={navIconClasses} aria-hidden="true" /> },
      { label: "Telemetry", to: "/telemetry", icon: <BarChart3 className={navIconClasses} aria-hidden="true" /> },
      { label: "History", to: "/history", icon: <History className={navIconClasses} aria-hidden="true" /> },
      { label: "Settings", to: "/settings", icon: <SettingsIcon className={navIconClasses} aria-hidden="true" /> },
    ],
    [],
  );

  return (
    <aside
      className={`flex h-full flex-col justify-between ${
        variant === "desktop" ? "w-64 border-r border-white/10" : "w-full"
      } bg-black/85 px-4 pb-6 pt-8 text-silver shadow-2xl backdrop-blur`}
    >
      <nav aria-label="Primary">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-silver/80 hover:scale-105 hover:bg-white/5 hover:text-white"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black`
                }
                onClick={onNavigate}
              >
                {({ isActive }) => (
                  <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-trustBlue">
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {isActive ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-trustBlue"
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-6 rounded-xl bg-gradient-to-br from-white/5 via-white/5 to-transparent p-4 text-xs text-silver/80">
        <p className="font-semibold text-silver">Unlimited Beta</p>
        <p className="mt-1 leading-relaxed">
          Explore Nexus.ai with unrestricted debates. Your feedback helps orchestrate trustworthy AI decisions.
        </p>
      </div>
    </aside>
  );
}
