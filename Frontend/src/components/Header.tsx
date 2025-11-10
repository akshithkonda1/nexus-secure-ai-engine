import React, { useMemo } from "react";
import { Bell, Command, Menu, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useProfile } from "@/features/profile/ProfileProvider";
import { requestNewPrompt, requestNotifications, requestProfileOpen } from "@/lib/actions";
import { cn } from "@/shared/lib/cn";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

type HeaderProps = {
  onToggleSidebar?: () => void;
  onOpenProfile?: () => void;
};

export function Header({ onToggleSidebar, onOpenProfile }: HeaderProps = {}) {
  const today = new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date());
  const navigate = useNavigate();
  const { profile, loading } = useProfile();

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
          className="flex size-10 items-center justify-center rounded-xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] text-[rgb(var(--subtle))] shadow-sm transition hover:text-brand dark:bg-[rgba(var(--panel),0.6)] lg:hidden"
          onClick={() => onToggleSidebar?.()}
          aria-label="Toggle navigation"
        >
          <Menu className="size-4" />
        </button>

        <div className="hidden flex-col sm:flex">
          <span className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)]">Welcome</span>
          <span className="text-lg font-semibold tracking-tight text-[rgb(var(--text))]">AI Control Center</span>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="relative hidden max-w-md flex-1 items-center overflow-hidden rounded-2xl border border-[rgba(var(--border),0.65)] bg-[rgba(var(--surface),0.92)] px-4 py-2 shadow-sm dark:border-[rgba(var(--border),0.4)] dark:bg-[rgba(var(--panel),0.7)] sm:flex">
            <Search className="mr-3 size-4 text-[rgba(var(--subtle),0.8)]" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search sessions, documents, or commands"
              className="h-9 flex-1 border-0 bg-transparent text-sm text-[rgb(var(--text))] outline-none placeholder:text-[rgba(var(--subtle),0.7)]"
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
            className="inline-flex items-center gap-2 rounded-2xl bg-[rgba(var(--brand),0.12)] px-4 py-2 text-sm font-semibold text-brand transition hover:bg-[rgba(var(--brand),0.2)]"
          >
            <Sparkles className="size-4" /> New prompt
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden flex-col text-right md:flex">
            <span className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.6)]">Today</span>
            <span className="text-sm font-medium text-[rgb(var(--text))]">{today}</span>
          </div>
          <button
            type="button"
            onClick={() => requestNotifications()}
            className="relative flex size-10 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.92)] text-[rgb(var(--subtle))] shadow-sm transition hover:text-brand dark:bg-[rgba(var(--panel),0.6)]"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-[rgba(var(--brand),1)] text-[10px] font-semibold text-[rgb(var(--on-accent))] shadow-[0_0_0_1px_rgba(12,16,24,0.08)]">
              3
            </span>
          </button>
          <ThemeToggle className="hidden lg:inline-flex" />
          <div className="hidden h-12 w-px rounded-full bg-[rgba(var(--border),0.7)] lg:block" aria-hidden="true" />
          <button
            type="button"
            className={cn(
              "hidden items-center gap-3 rounded-2xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] px-3 py-2 text-left text-sm font-medium text-[rgb(var(--text))] shadow-sm transition hover:border-brand hover:text-brand dark:bg-[rgba(var(--panel),0.7)]",
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
                <img src={profile.avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
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
