import { motion } from "framer-motion";
import { Command, Paintbrush2 } from "lucide-react";

import logo from "@/assets/ryuzen-dragon.svg";
import { useTheme } from "@/theme/useTheme";
import { useUI } from "@/state/ui";

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { toggleTheme, resolvedTheme } = useTheme();
  const { openCommandCenter } = useUI();

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
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_70%,transparent)] px-3 py-2 shadow-sm">
            <img src={logo} alt="Ryuzen" className="h-8 w-8" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen OS V2</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Unified Control</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="group flex items-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_70%,transparent)] px-3 py-2 text-[var(--text-secondary)] shadow-inner transition hover:text-[var(--text-primary)]"
          >
            <Paintbrush2 className="h-4 w-4" />
            <span className="text-sm font-semibold">{resolvedTheme === "dark" ? "Dark" : "Light"}</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(124,93,255,0.35)" }}
            whileTap={{ scale: 0.99 }}
            onClick={openCommandCenter}
            className="group relative flex items-center gap-2 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-gradient-to-r from-[color-mix(in_srgb,var(--accent-secondary)_80%,transparent)] via-[color-mix(in_srgb,var(--accent-primary)_70%,transparent)] to-[color-mix(in_srgb,var(--accent-secondary)_70%,transparent)] px-4 py-2 text-[var(--text-primary)] shadow-[0_10px_40px_rgba(124,93,255,0.36)]"
          >
            <span className="absolute inset-0 opacity-0 mix-blend-screen blur-xl transition group-hover:opacity-100" aria-hidden />
            <Command className="h-4 w-4" />
            <span className="text-sm font-semibold">Command Center</span>
            <span className="animate-pulse text-xs text-[var(--text-secondary)]">●</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
