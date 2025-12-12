import { NavLink, useLocation } from "react-router-dom";
import { Clock3, FileText, Folder, Grid, Home, Settings, Sparkles } from "lucide-react";

import { RyuzenLogoBadge } from "@/components/RyuzenBrandmark";
import { useFeedback } from "@/state/feedback";

const primaryNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Toron", href: "/toron", icon: Sparkles, isToron: true },
  { label: "Workspace", href: "/workspace", icon: Grid },
  { label: "Projects", href: "/projects", icon: Folder },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "History", href: "/history", icon: Clock3 },
];

const secondaryNavItems = [{ label: "Settings", href: "/settings", icon: Settings }];

export function Sidebar() {
  const { pathname } = useLocation();
  const { openModal } = useFeedback();

  return (
    <aside className="relative z-30 hidden h-screen border-r border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_88%,transparent)] px-5 py-6 shadow-2xl shadow-black/50 lg:block">
      <div className="flex items-center gap-3 px-2 pb-8">
        <RyuzenLogoBadge size={48} />
        <div className="leading-tight">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">RYUZEN Operations</p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">RYUZEN OS V2 – Unified Control</p>
        </div>
      </div>

      <nav className="space-y-2">
        {primaryNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const iconSize = item.isToron ? 22 : 20;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className="group block rounded-full"
            >
              <div
                className={`relative flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition duration-100 ${
                  isActive
                    ? "bg-[linear-gradient(140deg,color-mix(in_srgb,var(--panel-elevated)_90%,transparent),color-mix(in_srgb,var(--panel-strong)_86%,transparent))] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "text-[color-mix(in_srgb,var(--text-secondary)_94%,transparent)] hover:text-[var(--text-primary)]"
                }`}
                style={{
                  boxShadow: isActive
                    ? item.isToron
                      ? "0 10px 28px rgba(107, 232, 255, 0.16)"
                      : "0 10px 28px rgba(124, 93, 255, 0.12)"
                    : undefined,
                }}
              >
                <span
                  className={`flex items-center transition duration-100 ${
                    item.isToron
                      ? "text-[color-mix(in_srgb,var(--accent-secondary)_95%,var(--text-primary))] drop-shadow-[0_0_12px_rgba(107,232,255,0.35)]"
                      : "text-[color-mix(in_srgb,var(--text-secondary)_92%,transparent)]"
                  } ${isActive ? "text-[var(--text-primary)]" : ""}`}
                >
                  <Icon strokeWidth={1.6} size={iconSize} />
                </span>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <span className="pointer-events-none absolute inset-px -z-10 rounded-full bg-[radial-gradient(circle_at_50%_120%,color-mix(in_srgb,var(--accent-secondary)_12%,transparent),transparent)]" />
                )}
                {isActive && item.isToron && (
                  <span className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-[color-mix(in_srgb,var(--accent-secondary)_24%,transparent)]" />
                )}
              </div>
            </NavLink>
          );
        })}

        <div className="pt-3" />

        {secondaryNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              className="group block rounded-full"
            >
              <div
                className={`relative flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-semibold transition duration-100 ${
                  isActive
                    ? "bg-[linear-gradient(140deg,color-mix(in_srgb,var(--panel-elevated)_90%,transparent),color-mix(in_srgb,var(--panel-strong)_86%,transparent))] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "text-[color-mix(in_srgb,var(--text-secondary)_94%,transparent)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="flex items-center text-[color-mix(in_srgb,var(--text-secondary)_92%,transparent)] transition duration-100">
                  <Icon strokeWidth={1.6} size={20} />
                </span>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <span className="pointer-events-none absolute inset-px -z-10 rounded-full bg-[radial-gradient(circle_at_50%_120%,color-mix(in_srgb,var(--accent-secondary)_12%,transparent),transparent)]" />
                )}
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
