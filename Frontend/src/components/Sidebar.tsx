import { NavLink, useLocation } from "react-router-dom";
import { RyuzenBrandmark } from "@/components/RyuzenBrandmark";
import homeIcon from "@/assets/icons/home.svg";
import toronIcon from "@/assets/icons/toron.svg";
import workspaceIcon from "@/assets/icons/workspace.svg";
import documentsIcon from "@/assets/icons/documents.svg";
import historyIcon from "@/assets/icons/history.svg";
import settingsIcon from "@/assets/icons/settings.svg";
import { useFeedback } from "@/state/feedback";

const navItems = [
  { label: "Home", href: "/", icon: homeIcon },
  { label: "Toron", href: "/toron", icon: toronIcon },
  { label: "Workspace", href: "/workspace", icon: workspaceIcon },
  { label: "Projects", href: "/projects", icon: workspaceIcon },
  { label: "Documents", href: "/documents", icon: documentsIcon },
  { label: "History", href: "/history", icon: historyIcon },
  { label: "Settings", href: "/settings", icon: settingsIcon },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { openModal } = useFeedback();

  return (
    <aside className="relative z-30 hidden h-screen border-r border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_88%,transparent)] px-5 py-6 shadow-2xl shadow-black/50 lg:block">
      <div className="flex items-center gap-3 px-2 pb-8">
        <RyuzenBrandmark
          size={32}
          className="rounded-full shadow-[0_0_20px_rgba(0,200,255,0.45)]"
        />
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
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt={`${item.label} icon`}
                      className="h-5 w-5 object-contain opacity-90 group-hover:opacity-100"
                      draggable={false}
                    />
                  )}
                </span>
                <span className="text-sm font-semibold tracking-tight">{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_88%,transparent)] p-4 shadow-inner shadow-black/20">
        <button
          type="button"
          onClick={openModal}
          className="relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--accent-secondary)_35%,var(--border-soft))] bg-[color-mix(in_srgb,var(--panel-elevated)_82%,transparent)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px] hover:shadow-[0_12px_35px_rgba(34,211,238,0.28)]"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent-secondary)_20%,transparent)] text-[color-mix(in_srgb,var(--accent-secondary)_95%,var(--text-primary))] shadow-inner shadow-black/30">
              ✨
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold">Send Feedback</p>
              <p className="text-xs text-[var(--text-secondary)]">Share thoughts anonymously.</p>
            </div>
          </div>
          <span
            className="absolute inset-px rounded-xl border border-[color-mix(in_srgb,var(--accent-primary)_30%,transparent)] blur-[1.5px]"
            aria-hidden
          />
        </button>
      </div>
    </aside>
  );
}
