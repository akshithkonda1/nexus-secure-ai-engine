import React from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  FileText,
  Inbox,
  LayoutDashboard,
  MessageCircle,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { requestBillingUpgrade, requestProjectCreation } from "@/lib/actions";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const primaryNav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/outbox", label: "Workspace", icon: Inbox },
  { to: "/templates", label: "Templates", icon: Sparkles },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/history", label: "Activity", icon: ScrollText },
];

const supportNav = [
  { to: "/governance", label: "Governance", icon: ShieldCheck },
  { to: "/guides", label: "Guides", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        id="app-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[rgba(var(--border),0.6)] bg-[rgba(var(--sidebar),0.92)] px-6 pb-8 pt-10 text-[rgb(var(--text))] shadow-[var(--shadow-soft)] transition-transform dark:bg-[rgba(var(--sidebar),0.85)]",
          "lg:static lg:bg-[rgba(var(--sidebar),0.75)] lg:shadow-none",
          "-translate-x-full lg:translate-x-0",
          isOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
              Nexus
            </p>
            <h1 className="mt-1 text-xl font-semibold">
              Secure AI Debate Engine
            </h1>
          </div>
          <span className="inline-flex items-center rounded-full bg-[rgba(var(--brand),0.12)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-transparent [background:linear-gradient(120deg,#009EFF,#9360FF)] bg-clip-text">
            BETA
          </span>
        </div>

        <nav className="mt-10 space-y-8 text-sm font-medium">
          <div className="space-y-1">
            {primaryNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors",
                    "hover:bg-[rgba(var(--brand),0.08)]",
                    isActive
                      ? "bg-[rgba(var(--brand),0.12)] text-brand shadow-[var(--shadow-soft)]"
                      : "text-[rgb(var(--subtle))]",
                  )
                }
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-[rgba(var(--surface),0.85)] text-brand shadow-sm">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 text-left tracking-tight">{label}</span>
                <span className="opacity-0 transition group-hover:opacity-100">
                  →
                </span>
              </NavLink>
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">
              Workspace
            </p>
            {supportNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-[rgb(var(--subtle))] transition hover:bg-[rgba(var(--panel),0.65)]",
                    isActive &&
                      "bg-[rgba(var(--surface),0.95)] text-brand shadow-[var(--shadow-soft)]",
                  )
                }
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-[rgba(var(--surface),0.82)] text-[rgb(var(--subtle))]">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 text-left tracking-tight">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-3xl bg-[linear-gradient(140deg,rgba(var(--brand),0.85)_0%,rgba(var(--brand-soft),0.75)_100%)] p-5 text-[rgb(var(--on-accent))] shadow-[var(--shadow-lift)]">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--on-accent),0.7)]">
              Plan
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[rgb(var(--on-accent))]">
              Professional
            </h3>
            <p className="mt-1 text-sm text-[rgba(var(--on-accent),0.82)]">
              Unlock orchestration across teams with unlimited workspaces.
            </p>
            <button
              type="button"
              className="mt-4 btn btn-primary btn-neo ripple rounded-2xl"
              onClick={() => requestBillingUpgrade()}
            >
              <Zap className="size-4" /> Upgrade
            </button>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.85)] p-4 text-xs text-[rgb(var(--subtle))]">
            <p className="font-semibold text-[rgb(var(--text))]">Nexus HQ</p>
            <p className="mt-1 leading-relaxed">
              Compliance-friendly workspace for secure agent collaboration. Last
              synced 2 mins ago.
            </p>
            <button
              type="button"
              onClick={() => requestProjectCreation()}
              className="mt-3 btn btn-primary btn-neo ripple text-xs uppercase tracking-[0.2em]"
            >
              <Sparkles className="size-3.5" /> New project
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
