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
    <header className="sticky top-0 z-30 border-b border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.82)] backdrop-blur-xl">
      <div className="flex h-20 items-center gap-4 px-5 md:px-8 lg:px-12">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] text-[rgba(var(--subtle),0.85)] shadow-sm transition hover:border-[rgba(var(--brand),0.5)] hover:text-[rgb(var(--text))] lg:hidden"
          onClick={() => onToggleSidebar?.()}
          aria-label="Toggle navigation"
        >
          <Menu className="size-4" />
        </button>

        <div className="hidden flex-col sm:flex">
         </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="relative hidden max-w-md flex-1 items-center overflow-hidden rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.9)] px-4 py-2 shadow-sm sm:flex">
            <Search
              className="mr-3 size-4 text-[rgba(var(--subtle),0.8)]"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search sessions, documents, or commands"
              className="input h-9 flex-1 border-0 bg-transparent pl-0 pr-0 text-[rgb(var(--text))] placeholder:text-[rgba(var(--subtle),0.7)]"
            />
            <span className="hidden items-center gap-1 rounded-full bg-[rgba(var(--panel),0.65)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.8)] sm:inline-flex">
              <Command className="size-3" /> K
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              requestNewPrompt();
              navigate("/chat");
            }}
            className="inline-flex items-center justify-center rounded-[var(--radius-button)] px-4 py-2.5 bg-[rgb(var(--brand))] text-[rgb(var(--on-accent))] font-semibold shadow-[0_0_34px_rgba(0,133,255,0.28)] transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-[0_0_40px_rgba(0,133,255,0.35)] hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99]"
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
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-[rgba(var(--border),0.55)] bg-[rgba(var(--panel),0.72)] text-[rgba(var(--subtle),0.85)] shadow-[0_18px_40px_rgba(15,23,42,0.25)] transition hover:bg-[rgba(var(--panel),0.85)] hover:shadow-[0_0_32px_rgba(0,133,255,0.35)] hover:scale-[1.01] active:scale-[0.99]"
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
            className="hidden h-12 w-px rounded-full bg-[rgba(var(--border),0.7)] lg:block"
            aria-hidden="true"
          />
          <button
            type="button"
            className={cn(
              "hidden items-center gap-3 rounded-[var(--radius-button)] border border-[rgba(var(--border),0.55)] bg-[rgba(var(--panel),0.68)] px-3 py-2.5 text-left text-sm font-medium text-[rgb(var(--text))] shadow-[var(--shadow-soft)] transition hover:bg-[rgba(var(--panel),0.8)] hover:border-[rgba(var(--brand),0.5)] hover:text-[rgb(var(--text))]",
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
