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
    <header className="sticky top-0 z-30 border-b border-[rgba(var(--border),0.45)] bg-[rgb(var(--surface))] text-[rgb(var(--text))] backdrop-blur-xl shadow-sm transition-colors duration-300 dark:border-[color:rgba(148,163,184,0.28)] dark:bg-[color:color-mix(in_srgb,var(--zora-space)_84%,transparent)] dark:shadow-zora-soft">
      <div className="flex h-20 items-center gap-4 px-5 md:px-8 lg:px-12">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(var(--border),0.55)] bg-[rgb(var(--surface))] text-[rgba(var(--subtle),0.9)] shadow-sm transition hover:bg-[rgba(var(--surface),0.85)] hover:text-[rgb(var(--text))] hover:scale-[1.01] active:scale-[0.99] lg:hidden dark:border-zora-border dark:bg-[color:color-mix(in_srgb,var(--zora-space)_80%,transparent)] dark:text-zora-muted dark:shadow-zora-soft dark:hover:bg-zora-deep dark:hover:text-zora-white"
          onClick={() => onToggleSidebar?.()}
          aria-label="Toggle navigation"
        >
          <Menu className="size-4" />
        </button>

        <div className="hidden flex-col sm:flex">
         </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="relative hidden max-w-md flex-1 items-center overflow-hidden rounded-[24px] border border-[rgba(var(--border),0.55)] bg-[rgb(var(--surface))] px-4 py-2 shadow-sm backdrop-blur-xl transition-colors duration-300 sm:flex dark:border-zora-border dark:bg-[color:color-mix(in_srgb,var(--zora-soft)_78%,transparent)] dark:shadow-zora-soft">
            <Search
              className="mr-3 size-4 text-[rgba(var(--subtle),0.7)] transition-colors duration-300 dark:text-zora-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search sessions, documents, or commands"
              className="input h-9 flex-1 border-0 bg-transparent pl-0 pr-0 text-[rgb(var(--text))] placeholder:text-[rgba(var(--subtle),0.75)] focus:outline-none focus:ring-0 dark:text-zora-white dark:placeholder:text-zora-muted"
            />
            <span className="hidden items-center gap-1 rounded-full bg-[rgb(var(--surface))] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.7)] transition-colors duration-300 shadow-sm sm:inline-flex dark:bg-[color:color-mix(in_srgb,var(--zora-space)_82%,transparent)] dark:text-zora-muted dark:shadow-none">
              <Command className="size-3" /> K
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              requestNewPrompt();
              navigate("/chat");
            }}
            className="btn btn-primary shadow-zora-glow"
          >
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
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-[rgba(var(--border),0.55)] bg-[rgb(var(--surface))] text-[rgba(var(--subtle),0.9)] shadow-sm transition hover:bg-[rgba(var(--surface),0.85)] hover:text-[rgb(var(--text))] hover:scale-[1.01] active:scale-[0.99] dark:border-zora-border dark:bg-[color:color-mix(in_srgb,var(--zora-space)_80%,transparent)] dark:text-zora-muted dark:shadow-zora-soft dark:hover:bg-zora-deep dark:hover:text-zora-white"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {unreadNotifications > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-[rgba(var(--accent-rose),0.95)] text-[10px] font-semibold text-[rgb(var(--on-accent))] shadow-[0_0_0_1px_rgba(12,16,24,0.08)]">
                {unreadNotifications}
              </span>
            ) : null}
          </button>
          <ThemeToggle className="hidden lg:inline-flex" />
          <div
            className="hidden h-12 w-px rounded-full bg-[rgba(var(--border),0.4)] transition-colors duration-300 lg:block dark:bg-[color:rgba(148,163,184,0.28)]"
            aria-hidden="true"
          />
          <button
            type="button"
            className={cn(
              "hidden items-center gap-3 rounded-[18px] border border-[rgba(var(--border),0.55)] bg-[rgb(var(--surface))] px-3 py-2.5 text-left text-sm font-medium text-[rgb(var(--text))] shadow-sm transition hover:bg-[rgba(var(--surface),0.9)] hover:text-[rgb(var(--text))]",
              "lg:flex",
              "dark:border-zora-border dark:bg-[color:color-mix(in_srgb,var(--zora-soft)_75%,transparent)] dark:text-zora-white dark:shadow-zora-soft dark:hover:bg-zora-deep dark:hover:text-zora-white",
            )}
            onClick={() => {
              requestProfileOpen();
              onOpenProfile?.();
            }}
            disabled={loading}
          >
            <span className="inline-flex size-9 items-center justify-center overflow-hidden rounded-xl bg-[color:color-mix(in_srgb,var(--zora-space)_82%,transparent)] text-zora-white shadow-zora-soft">
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
              <span className="text-xs font-normal text-[rgba(var(--subtle),0.75)] dark:text-zora-muted">
                {profile?.role ?? "Secure workspace"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
