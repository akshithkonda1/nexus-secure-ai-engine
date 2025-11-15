import React, { useMemo } from "react";
import { Bell, Command, Search, Sparkles } from "lucide-react";
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
import { useTheme } from "@/shared/ui/theme/ThemeProvider";

type HeaderProps = {
  onOpenCommandCenter?: () => void;
  onOpenProfile?: () => void;
};

export function Header({ onOpenCommandCenter, onOpenProfile }: HeaderProps = {}) {
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const navigate = useNavigate();
  const { profile, loading } = useProfile();
  const unreadNotifications = useUnreadNotificationsCount();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
    <header
      className={cn(
        "sticky top-0 z-30 border-b bg-[rgb(var(--surface))] text-[rgb(var(--text))] backdrop-blur-xl transition-colors duration-300",
        isDark
          ? "border-zora-border/80 bg-[color:color-mix(in_srgb,var(--zora-space)_84%,transparent)] shadow-zora-soft"
          : "border-[rgba(var(--border),0.45)] shadow-[0_12px_32px_rgba(15,23,42,0.08)]",
      )}
    >
      <div className="flex h-20 items-center gap-4 px-5 md:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => onOpenCommandCenter?.()}
          className={cn(
            "group inline-flex items-center gap-3 rounded-full border px-2.5 py-2 text-[rgb(var(--text))] transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(16,185,129,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-emerald),0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            isDark
              ? "border-[rgba(var(--accent-emerald),0.6)] bg-[color:color-mix(in_srgb,var(--zora-space)_75%,transparent)] shadow-[0_12px_40px_rgba(12,180,129,0.25)]"
              : "border-[rgba(var(--accent-emerald),0.55)] bg-[rgba(var(--surface),0.92)] shadow-[0_12px_32px_rgba(16,185,129,0.25)]",
          )}
          aria-label="Open Command Center"
        >
          <span className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-[rgba(var(--accent-emerald),0.55)] bg-[radial-gradient(circle_at_30%_20%,rgba(var(--accent-emerald),0.9),rgba(56,189,248,0.35))] shadow-[0_0_22px_rgba(16,185,129,0.35)]">
            <span className="absolute inset-0 animate-[pulse_3.5s_ease-in-out_infinite] bg-[radial-gradient(circle,rgba(var(--accent-emerald),0.18),transparent_68%)]" aria-hidden />
            <span className="relative size-3 rounded-full bg-[rgba(var(--surface),0.92)] shadow-[0_0_12px_rgba(148,255,199,0.65)]" />
          </span>
          <span className="pr-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.85)]">
            Command Center
          </span>
        </button>

        <div className="flex flex-1 items-center gap-3">
          <div
            className={cn(
              "relative hidden max-w-md flex-1 items-center overflow-hidden rounded-[24px] border px-4 py-2 backdrop-blur-xl transition-colors duration-300 sm:flex",
              isDark
                ? "border-zora-border bg-[color:color-mix(in_srgb,var(--zora-soft)_78%,transparent)] text-zora-white shadow-zora-soft"
                : "border-[rgba(var(--border),0.55)] bg-[rgb(var(--surface))] text-[rgb(var(--text))] shadow-sm",
            )}
          >
            <Search
              className={cn(
                "mr-3 size-4 transition-colors duration-300",
                isDark ? "text-zora-muted" : "text-[rgba(var(--subtle),0.7)]",
              )}
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search sessions, documents, or commands"
              className={cn(
                "input h-9 flex-1 border-0 bg-transparent pl-0 pr-0 text-[rgb(var(--text))] placeholder:text-[rgba(var(--subtle),0.75)] focus:outline-none focus:ring-0",
                isDark && "text-zora-white placeholder:text-zora-muted",
              )}
            />
            <span
              className={cn(
                "hidden items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 sm:inline-flex",
                isDark
                  ? "bg-[color:color-mix(in_srgb,var(--zora-space)_82%,transparent)] text-zora-muted shadow-none"
                  : "bg-[rgb(var(--surface))] text-[rgba(var(--subtle),0.7)] shadow-sm",
              )}
            >
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
            className={cn(
              "relative inline-flex size-10 items-center justify-center rounded-full border text-[rgba(var(--subtle),0.9)] transition hover:scale-[1.01] active:scale-[0.99]",
              isDark
                ? "border-zora-border bg-[color:color-mix(in_srgb,var(--zora-space)_80%,transparent)] text-zora-muted shadow-zora-soft hover:bg-zora-deep hover:text-zora-white"
                : "border-[rgba(var(--border),0.55)] bg-[rgb(var(--surface))] shadow-sm hover:bg-[rgba(var(--surface),0.85)] hover:text-[rgb(var(--text))]",
            )}
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
              "hidden items-center gap-3 rounded-[18px] border px-3 py-2.5 text-left text-sm font-medium transition lg:flex",
              isDark
                ? "border-zora-border bg-[color:color-mix(in_srgb,var(--zora-soft)_75%,transparent)] text-zora-white shadow-zora-soft hover:bg-zora-deep hover:text-zora-white"
                : "border-[rgba(var(--border),0.55)] bg-[rgb(var(--surface))] text-[rgb(var(--text))] shadow-sm hover:bg-[rgba(var(--surface),0.9)] hover:text-[rgb(var(--text))]",
            )}
            onClick={() => {
              requestProfileOpen();
              onOpenProfile?.();
            }}
            disabled={loading}
          >
            <span
              className={cn(
                "inline-flex size-9 items-center justify-center overflow-hidden rounded-xl shadow-zora-soft",
                isDark
                  ? "bg-[color:color-mix(in_srgb,var(--zora-space)_82%,transparent)] text-zora-white"
                  : "bg-[rgba(var(--surface),0.85)] text-[rgb(var(--text))] shadow-sm",
              )}
            >
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
              <span
                className={cn(
                  "text-xs font-normal",
                  isDark ? "text-zora-muted" : "text-[rgba(var(--subtle),0.75)]",
                )}
              >
                {profile?.role ?? "Secure workspace"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
