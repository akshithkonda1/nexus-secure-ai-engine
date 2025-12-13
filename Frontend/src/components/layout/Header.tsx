import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { RyuzenLogoBadge } from "@/components/RyuzenBrandmark";
import { AuroraToggle } from "@/components/layout/AuroraToggle";
import { ProfileModal } from "@/components/layout/ProfileModal";

const userProfile = {
  name: "Ryuzen Operator",
  id: "user-2049",
  plan: "Nebula Pro",
  email: "operator@ryuzen.io",
  isOAuth: false,
};

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] to-transparent" />
      <div className="relative flex h-[var(--header-height)] items-center justify-between border-b border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)] px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_70%,transparent)] text-[var(--text-secondary)] shadow-inner transition hover:text-[var(--text-primary)] lg:hidden"
            aria-label="Toggle navigation"
          >
            <span className="text-lg font-semibold">≡</span>
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_70%,transparent)] px-3 py-2 shadow-sm">
            <RyuzenLogoBadge size={48} />
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">RYUZEN Operations</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">RYUZEN OS V2 – Unified Control</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AuroraToggle />

          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => {
                setOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className="flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_70%,transparent)] px-2 py-1 text-left shadow-sm transition hover:-translate-y-[1px]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent-secondary)_35%,transparent)] text-sm font-semibold text-[var(--text-primary)]">
                {userProfile.name.slice(0, 2).toUpperCase()}
              </span>
              <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
            </button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                >
                  <div className="bg-gradient-to-r from-[color-mix(in_srgb,var(--accent-secondary)_12%,transparent)] via-transparent to-transparent px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Profile</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{userProfile.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">ID: {userProfile.id}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Plan: {userProfile.plan}</p>
                  </div>
                  <div className="space-y-1 border-t border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] p-3">
                    <DropdownAction label="Account" description="Profile, security, and routing" />
                    <DropdownAction label="Preferences" description="Theme, focus, and shortcuts" />
                    <DropdownAction label="Control center" description="Privacy, telemetry, visibility" />
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_95%,transparent)] px-4 py-3">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">Profile modal</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">World-class view</p>
                    </div>
                    <button
                      className="rounded-full border border-[var(--border-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
                      onClick={() => {
                        setProfileOpen(true);
                        setOpen(false);
                      }}
                    >
                      Open
                    </button>
                  </div>
                  <button className="flex w-full items-center gap-2 bg-[color-mix(in_srgb,var(--panel-strong)_96%,transparent)] px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[color-mix(in_srgb,var(--accent-secondary)_16%,transparent)]">
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      </div>
    </header>
  );
}

function DropdownAction({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-xl px-2 py-2">
      <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
      <p className="text-xs text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
