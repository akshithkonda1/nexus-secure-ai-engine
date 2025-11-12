import React from "react";
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
import NavItem from "@/components/nav/NavItem";

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
  const handleNavigate = () => {
    onClose?.();
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "glass-surface fixed inset-y-4 left-4 z-50 flex w-[min(18rem,calc(100%-2rem))] max-w-[20rem] flex-col gap-8 overflow-hidden p-6 text-slate-800 shadow-glass transition-transform duration-200 dark:text-slate-100",
          "lg:static lg:inset-auto lg:left-auto lg:top-auto lg:h-full lg:w-full lg:max-w-none lg:rounded-none lg:border-l-0 lg:border-t-0 lg:border-b-0 lg:border-r lg:border-slate-200/60 lg:bg-white/55 lg:p-8 lg:shadow-none lg:dark:border-slate-800/60 lg:dark:bg-slate-900/45",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Nexus
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Secure AI Debate Engine
            </h1>
          </div>
          <span className="inline-flex items-center rounded-2xl border border-slate-200/60 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-glass dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-200">
            BETA
          </span>
        </div>

        <nav className="space-y-8 text-sm font-medium">
          <div className="space-y-2">
            {primaryNav.map(({ to, label, icon: Icon }) => (
              <NavItem
                key={to}
                to={to}
                icon={<Icon className="size-4" />}
                label={label}
                onNavigate={handleNavigate}
              />
            ))}
          </div>

          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">
              Workspace
            </p>
            {supportNav.map(({ to, label, icon: Icon }) => (
              <NavItem
                key={to}
                to={to}
                icon={<Icon className="size-4" />}
                label={label}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-3xl bg-gradient-to-br from-nexus-blue/90 via-nexus-mpurple/80 to-nexus-azure/90 p-5 text-white shadow-glass">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/70">
              Plan
            </p>
            <h3 className="mt-2 text-lg font-semibold">Professional</h3>
            <p className="mt-1 text-sm text-white/80">
              Unlock orchestration across teams with unlimited workspaces.
            </p>
            <button
              type="button"
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 text-sm font-semibold shadow-glass backdrop-blur-xs transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              onClick={() => requestBillingUpgrade()}
            >
              <Zap className="size-4" /> Upgrade
            </button>
          </div>
          <div className="rounded-3xl border border-slate-200/70 bg-white/65 p-4 text-xs text-slate-600 shadow-glass backdrop-blur-xs dark:border-slate-800/60 dark:bg-slate-900/55 dark:text-slate-300">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Nexus HQ</p>
            <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
              Compliance-friendly workspace for secure agent collaboration. Last synced 2 mins ago.
            </p>
            <button
              type="button"
              onClick={() => requestProjectCreation()}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-glass transition hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-blue/60 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/70"
            >
              <Sparkles className="size-4" /> New project
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
