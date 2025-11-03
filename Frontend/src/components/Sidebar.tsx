import { memo, type ReactNode, useMemo } from "react";
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

function SidebarComponent({ onNavigate, variant }: SidebarProps) {
  const items = useMemo<NavItem[]>(
    () => [
      { label: "AI Debate", to: "/chat", icon: <MessageCircle className={navIconClasses} aria-hidden="true" /> },
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
        variant === "desktop" ? "w-64 border-r border-app-border" : "w-full"
      } bg-surface px-4 pb-6 pt-8 text-app-text shadow-card backdrop-blur`}
    >
      <nav aria-label="Primary" className="space-y-6">
        <div className="rounded-2xl border border-app-border bg-[color:var(--surface-elevated)] p-4 text-sm leading-relaxed text-app-text">
          <p className="font-semibold text-silver">Nexus.ai</p>
          <p className="mt-1 text-app-text opacity-70">
            The AI firewall that orchestrates trust, telemetry, and real-time guardrails.
          </p>
        </div>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-trustBlue/10 text-white shadow-card"
                      : "text-app-text hover:scale-[1.02] hover:bg-[color:var(--surface-elevated)] hover:text-app-text"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]`
                }
                onClick={onNavigate}
              >
                {({ isActive }) => (
                  <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-trustBlue/10 text-trustBlue">
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
      <div className="mt-6 rounded-2xl border border-app-border bg-[color:var(--surface-elevated)] p-4 text-xs text-app-text">
        <p className="font-semibold text-silver">Dynasty Reliability</p>
        <p className="mt-1 leading-relaxed opacity-80">
          Monitor telemetry, documents, and history with confidence. Every route inherits enterprise guardrails.
        </p>
      </div>
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);
