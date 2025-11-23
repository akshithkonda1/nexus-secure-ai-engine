import { NavLink, useLocation } from "react-router-dom";
import ryuzenDragon from "@/assets/ryuzen-dragon.svg";
import { ToronIcon } from "@/components/icons/ToronIcon";
import { WorkspaceIcon } from "@/components/icons/WorkspaceIcon";
import { DocumentsIcon } from "@/components/icons/DocumentsIcon";
import { HistoryIcon } from "@/components/icons/HistoryIcon";
import { SettingsIcon } from "@/components/icons/SettingsIcon";
import { Home as HomeIcon } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: <HomeIcon className="h-4 w-4" /> },
  { label: "Toron", href: "/toron", icon: <ToronIcon /> },
  { label: "Workspace", href: "/workspace", icon: <WorkspaceIcon /> },
  { label: "Documents", href: "/documents", icon: <DocumentsIcon /> },
  { label: "History", href: "/history", icon: <HistoryIcon /> },
  { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="relative z-30 hidden h-screen border-r border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_88%,transparent)] px-5 py-6 shadow-2xl shadow-black/50 lg:block">
      <div className="flex items-center gap-3 px-2 pb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] shadow-lg shadow-cyan-500/20">
          <img src={ryuzenDragon} alt="Ryuzen" className="h-7 w-7" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen</p>
          <p className="text-base font-semibold text-[var(--text-primary)]">Navigation</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className="group block rounded-2xl"
            >
              <div
                className={`glow-border flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] px-4 py-3 transition ${isActive ? "bg-[color-mix(in_srgb,var(--accent-secondary)_16%,var(--panel-elevated))] text-[var(--text-primary)] border-[color-mix(in_srgb,var(--accent-secondary)_40%,transparent)]" : "bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] text-[var(--text-secondary)] hover:-translate-y-[1px] hover:text-[var(--text-primary)]"}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] text-[var(--text-primary)] shadow-inner shadow-black/30">
                  {item.icon}
                </span>
                <span className="text-sm font-semibold tracking-tight">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
