import React, { useMemo } from "react";

import { SunMedium, MonitorSmartphone, Moon } from "lucide-react";
import { motion } from "framer-motion";

import { useProfile } from "@/features/profile/ProfileProvider";
import { RyuzenLogoBadge } from "@/components/RyuzenBrandmark";
import { useTheme, ThemeMode } from "@/hooks/useTheme";

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
export default function Header() {
  const { profile } = useProfile();
  const { theme, setTheme } = useTheme();

  const initials = useMemo(() => {
    const name = profile?.fullName;
    if (!name) return "AI";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.fullName]);

  const themeOptions: { value: ThemeMode; label: string; icon: JSX.Element }[] = [
    { value: "light", label: "Light", icon: <SunMedium className="h-4 w-4" /> },
    { value: "system", label: "System", icon: <MonitorSmartphone className="h-4 w-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
  ];

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 px-4 backdrop-blur-xl lg:pl-[var(--sidebar-width)]">
        <div className="mx-auto flex h-[var(--header-height)] items-center justify-between px-2 sm:px-4 md:px-6">

          {/* LEFT — BRAND + TEXT */}
          <div className="flex items-center gap-3">
          <RyuzenLogoBadge size={48} />

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                Ryuzen Platform
              </p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                Understandable intelligence, by design
              </p>
            </div>
          </div>

          {/* RIGHT — THEME, PROFILE */}
          <div className="flex items-center gap-3">

            {/* Theme Switch */}
            <div className="hidden rounded-full border border-[var(--border-strong)] 
                bg-[color-mix(in_srgb,var(--panel-elevated)_86%,transparent)] 
                p-1 shadow-inner shadow-black/10 md:flex">
              {themeOptions.map((option) => {
                const isActive = option.value === theme;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className="relative flex items-center gap-1 rounded-full px-3 py-1.5 
                      text-sm font-medium text-[var(--text-secondary)] transition"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="theme-toggle"
                        className="absolute inset-0 rounded-full 
                          bg-[color-mix(in_srgb,var(--accent-primary)_18%,transparent)]"
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

            {/* PROFILE ICON */}
            <button
              className="relative h-11 w-11 overflow-hidden rounded-full border
                border-[var(--border-strong)]
                bg-[color-mix(in_srgb,var(--panel-elevated)_70%,transparent)]
                shadow-lg shadow-black/30 transition hover:-translate-y-[1px] 
                hover:shadow-cyan-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-transparent to-purple-500/25" />
              <span className="relative flex h-full w-full items-center justify-center 
                text-[var(--text-primary)]">
                {initials}
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
