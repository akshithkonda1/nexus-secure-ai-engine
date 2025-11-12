import React, { useMemo } from "react";
import { Bell, Command, Menu, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useUnreadNotificationsCount } from "@/features/notifications/useNotifications";
import { useProfile } from "@/features/profile/ProfileProvider";
import {
  requestNewPrompt,
  requestNotifications,
  requestProfileOpen,
} from "@/lib/actions";
import { cn } from "@/shared/lib/cn";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

type HeaderProps = {
  onToggleSidebar?: () => void;
  onOpenProfile?: () => void;
};

export function Header({ onToggleSidebar, onOpenProfile }: HeaderProps = {}) {
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const unreadNotifications = useUnreadNotificationsCount();

  const initials = useMemo(() => {
    const name = profile?.fullName;
    if (!name) return "AI";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.fullName]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/60 backdrop-blur-xl transition-colors dark:border-slate-800/60 dark:bg-slate-900/40">
      <div className="flex h-20 items-center gap-4 px-5 md:px-8 lg:px-12">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/70 text-slate-600 shadow-glass backdrop-blur-xs transition hover:bg-white/80 hover:text-nexus-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-blue/60 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/70 lg:hidden"
          onClick={() => onToggleSidebar?.()}
          aria-label="Toggle navigation"
        >
          <Menu className="size-4" />
        </button>

        <div className="hidden flex-col sm:flex">
         </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="relative hidden max-w-md flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-2 shadow-glass backdrop-blur-xs transition focus-within:ring-2 focus-within:ring-nexus-blue/60 dark:border-slate-800/70 dark:bg-slate-900/60 sm:flex">
            <Search
              className="size-4 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search sessions, documents, or commands"
              className="h-9 flex-1 border-0 bg-transparent pl-0 pr-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
            />
            <span className="hidden items-center gap-1 rounded-full border border-slate-200/60 bg-white/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-300 sm:inline-flex">
              <Command className="size-3" /> K
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              requestNewPrompt();
              navigate("/chat");
            }}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-4 text-sm font-semibold text-slate-700 shadow-glass backdrop-blur-xs transition hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-blue/60 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900/70"
          >
            <span className="h-2 w-2 rounded-full bg-gradient-to-br from-nexus-blue to-nexus-mpurple" aria-hidden="true" />
            <Sparkles className="size-4" /> New prompt
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden flex-col text-right md:flex">
            <span className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.6)]">
              Today
            </span>
            <span className="text-sm font-medium text-[rgb(var(--text))]">
              {today}
            </span>
          </div>
          <button
            type="button"
            onClick={() => requestNotifications()}
            className="relative inline-flex size-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/70 text-slate-600 shadow-glass backdrop-blur-xs transition hover:bg-white/80 hover:text-nexus-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-blue/60 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/70"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {unreadNotifications > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-[#EF3B4C] text-[10px] font-semibold text-white shadow-[0_0_0_1px_rgba(12,16,24,0.08)]">
                {unreadNotifications}
              </span>
            ) : null}
          </button>
          <ThemeToggle className="hidden lg:inline-flex" />
          <div
            className="hidden h-12 w-px rounded-full bg-[rgba(var(--border),0.7)] lg:block"
            aria-hidden="true"
          />
          <button
            type="button"
            className={cn(
              "hidden items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-glass backdrop-blur-xs transition hover:bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-nexus-blue/60 dark:border-slate-800/70 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-900/70",
              "lg:flex",
            )}
            onClick={() => {
              requestProfileOpen();
              onOpenProfile?.();
            }}
            disabled={loading}
          >
            <span className="inline-flex size-9 items-center justify-center overflow-hidden rounded-xl bg-[rgba(var(--brand),0.12)] text-brand">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </span>
            <span className="leading-tight">
              {profile?.fullName ?? "Workspace admin"}
              <br />
              <span className="text-xs font-normal text-[rgba(var(--subtle),0.7)]">
                {profile?.role ?? "Secure workspace"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
