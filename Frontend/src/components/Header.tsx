import React, { useMemo, useState } from "react";
import { Command, Menu, Search, Sparkles, Network } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useProfile } from "@/features/profile/ProfileProvider";
import {
  requestNewPrompt,
  requestNotifications,
  requestProfileOpen,
} from "@/lib/actions";
import { NotificationBell } from "@/components/shell/NotificationBell";
import RyuzenCommandCenterOverlay from "@/components/command-center/RyuzenCommandCenterOverlay";
import { cn } from "@/shared/lib/cn";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import ryuzenDragon from "@/assets/ryuzen-dragon.svg";
import { useTheme, ThemeMode } from "@/hooks/useTheme";
import { useUI } from "@/state/ui";

interface HeaderProps {
  onOpenProfile: () => void;
}

const themeOptions: { value: ThemeMode; label: string; icon: JSX.Element }[] = [
  { value: "light", label: "Light", icon: <SunMedium className="h-4 w-4" /> },
  { value: "system", label: "System", icon: <MonitorSmartphone className="h-4 w-4" /> },
  { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
];

  if (!RyuzenCommandCenterOverlay) {
    console.error("Overlay import failed");
    return null;
  }

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
    <header className="fixed left-0 right-0 top-0 z-40 px-4 backdrop-blur-xl lg:pl-[var(--sidebar-width)]">
      <div className="mx-auto flex h-[var(--header-height)] items-center justify-between px-2 sm:px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] shadow-lg shadow-cyan-500/15">
            <img src={ryuzenDragon} alt="Ryuzen" className="h-8 w-8 drop-shadow-[0_6px_18px_rgba(92,240,255,0.45)]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Ryuzen Command OS</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">Toron Control Surface</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_86%,transparent)] p-1 shadow-inner shadow-black/10 md:flex">
            {themeOptions.map((option) => {
              const isActive = option.value === theme;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className="relative flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition"
                >
                  {isActive && (
                    <motion.span
                      layoutId="theme-toggle"
                      className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_18%,transparent)]"
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1">
                    {option.icon}
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: "0 12px 40px rgba(52,224,161,0.35)" }}
            whileTap={{ scale: 0.98 }}
            onClick={openCommandCenter}
            className="relative flex items-center gap-2 rounded-full border border-emerald-300/40 bg-gradient-to-r from-emerald-400/30 via-cyan-400/30 to-sky-400/30 px-4 py-2 text-sm font-semibold text-emerald-50 shadow-[0_10px_35px_rgba(56,189,248,0.3)]"
          >
            <Sparkles className="h-4 w-4" />
            Command Center
            <span className="absolute inset-0 -z-10 rounded-full blur-xl bg-emerald-400/30" aria-hidden="true" />
          </motion.button>

          <button
            onClick={onOpenProfile}
            className="relative h-11 w-11 overflow-hidden rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_70%,transparent)] shadow-lg shadow-black/30 transition hover:-translate-y-[1px] hover:shadow-cyan-500/20"
            aria-label="Open profile"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-transparent to-purple-500/25" />
            <span className="relative flex h-full w-full items-center justify-center text-[var(--text-primary)]">RY</span>
          </button>
        </div>
      </div>
    </header>
  );
}
