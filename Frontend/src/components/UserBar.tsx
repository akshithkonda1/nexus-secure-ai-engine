import { memo } from "react";
import { motion } from "framer-motion";
import { Paperclip, Mic, Sparkles } from "lucide-react";
import { useSession } from "@/shared/state/session";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";

function UserBarComponent() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-t border-app-border bg-[color:var(--surface-elevated)] px-4 py-4 text-app-text backdrop-blur lg:px-8"
      aria-label="User controls"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-app-border bg-[color:var(--surface-elevated)] text-base font-semibold text-silver">
            AK
          </div>
          <div>
            <p className="text-sm font-semibold text-silver">Akshith Konda</p>
            <p className="text-xs text-app-text opacity-70">@nexus</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-app-border px-3 py-1.5 text-xs uppercase tracking-wide text-app-text transition hover:border-trustBlue/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Activate light mode" : "Activate dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-app-border px-3 py-1.5 text-xs font-medium text-app-text transition hover:border-trustBlue/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Attach
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-app-border px-3 py-1.5 text-xs font-medium text-app-text transition hover:border-trustBlue/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]"
            aria-label="Record voice note"
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            Voice
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-trustBlue bg-trustBlue px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Prompt Browser
          </button>
        </div>
      </div>
    </motion.footer>
  );
}

export const UserBar = memo(UserBarComponent);
