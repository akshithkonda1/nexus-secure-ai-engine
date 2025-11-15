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
import zoraLogo from "@/assets/zora-logo.svg";
import zoraMark from "@/assets/zora-mark.svg";

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
    <header className="sticky top-0 z-30 border-b border-[color:rgba(148,163,184,0.28)] bg-[radial-gradient(circle_at_12%_-40%,rgba(167,139,250,0.36),transparent_62%),radial-gradient(circle_at_88%_20%,rgba(56,189,248,0.28),transparent_60%),linear-gradient(90deg,rgba(9,14,28,0.92),rgba(11,18,34,0.78))] backdrop-blur-2xl shadow-[0_12px_40px_rgba(4,9,20,0.55)]">
      <div className="flex h-20 items-center gap-4 px-5 md:px-8 lg:px-12">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full border border-zora-border bg-[color:color-mix(in_srgb,var(--zora-space)_80%,transparent)] text-zora-muted shadow-zora-soft transition hover:bg-zora-deep hover:text-zora-white hover:scale-[1.01] active:scale-[0.99] lg:hidden"
          onClick={() => onToggleSidebar?.()}
          aria-label="Toggle navigation"
        >
          <Menu className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="hidden items-center gap-3 rounded-2xl border border-white/5 bg-[color:color-mix(in_srgb,var(--zora-space)_70%,transparent)] px-3 py-2 text-left text-sm text-zora-white shadow-[0_18px_48px_rgba(13,19,39,0.45)] transition hover:border-white/10 hover:bg-[color:color-mix(in_srgb,var(--zora-deep)_78%,transparent)] hover:shadow-[0_18px_48px_rgba(36,99,235,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(62,228,255,0.6)] sm:flex"
        >
          <span className="relative inline-flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(62,228,255,0.6),rgba(13,19,39,0.85))]">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(167,139,250,0.4),transparent_60%)] mix-blend-screen" aria-hidden="true" />
            <img
              src={zoraMark}
              alt="Zora mark"
              className="relative h-6 w-6 drop-shadow-[0_0_16px_rgba(62,228,255,0.5)]"
            />
          </span>
          <span className="flex flex-col leading-tight">
            <img src={zoraLogo} alt="Zora" className="h-4 w-auto" />
            <span className="text-[11px] font-medium uppercase tracking-[0.32em] text-[rgba(191,219,254,0.7)]">
              Cosmic Intelligence
            </span>
          </span>
        </button>

        <div className="flex flex-1 items-center gap-3">
          <div className="relative hidden max-w-md flex-1 items-center overflow-hidden rounded-[24px] border border-[rgba(99,102,241,0.28)] bg-[radial-gradient(circle_at_18%_15%,rgba(62,228,255,0.16),transparent_70%),color-mix(in_srgb,var(--zora-soft)_82%,transparent)] px-4 py-2 shadow-[0_20px_54px_rgba(8,12,28,0.55)] backdrop-blur-xl sm:flex">
            <Search
              className="mr-3 size-4 text-zora-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search sessions, documents, or commands"
              className="input h-9 flex-1 border-0 bg-transparent pl-0 pr-0 text-zora-white placeholder:text-zora-muted"
            />
            <span className="hidden items-center gap-1 rounded-full bg-[color:color-mix(in_srgb,var(--zora-space)_82%,transparent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zora-muted sm:inline-flex">
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
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-zora-border bg-[color:color-mix(in_srgb,var(--zora-space)_80%,transparent)] text-zora-muted shadow-zora-soft transition hover:bg-zora-deep hover:text-zora-white hover:scale-[1.01] active:scale-[0.99]"
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
            className="hidden h-12 w-px rounded-full bg-[color:rgba(148,163,184,0.28)] lg:block"
            aria-hidden="true"
          />
          <button
            type="button"
            className={cn(
              "hidden items-center gap-3 rounded-[18px] border border-zora-border bg-[color:color-mix(in_srgb,var(--zora-soft)_75%,transparent)] px-3 py-2.5 text-left text-sm font-medium text-zora-white shadow-zora-soft transition hover:bg-zora-deep hover:text-zora-white",
              "lg:flex",
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
              <span className="text-xs font-normal text-zora-muted">
                {profile?.role ?? "Secure workspace"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
