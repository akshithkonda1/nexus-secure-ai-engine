import { useMemo } from "react";
import { motion } from "framer-motion";
import { Paperclip, Mic, Sparkles } from "lucide-react";
import { useSession } from "@/shared/state/session";
import { useTheme } from "@/stores/themeStore";

export default function UserBar() {
  const themeChoice = useTheme((state) => state.theme);
  const resolvedTheme = useTheme((state) => state.resolvedTheme);
  const setTheme = useTheme((state) => state.setTheme);

  const toggle = () => {
    const applied = resolvedTheme;
    setTheme(applied === "dark" ? "light" : "dark");
  };

  const { user } = useSession();
  const displayName = (user?.name ?? "John Doe").trim();
  const handle = user?.handle ?? "@nexus";
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [displayName],
  );

  const border = "var(--border)";
  const panel = "var(--panel)";
  const text = "var(--text)";
  const muted = "var(--muted)";

  const baseBtn =
    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2";

  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="User controls"
      className="px-4 py-4 lg:px-8"
      style={{
        color: text,
        borderTop: `1px solid ${border}`,
        background: "transparent",
      }}
      data-theme-choice={themeChoice}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold select-none"
            style={{ background: panel, color: text }}
          >
            {initials}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold" style={{ color: text }}>
              {displayName}
            </p>
            <p className="text-xs" style={{ color: muted }}>
              {handle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className={baseBtn + " uppercase tracking-wide"}
            aria-label="Toggle color theme"
            style={{
              background: panel,
              color: text,
              border: `1px solid ${border}`,
            }}
          >
            {resolvedTheme === "dark" ? "LIGHT MODE" : "DARK MODE"}
          </button>

          <button
            type="button"
            className={baseBtn}
            aria-label="Attach file"
            style={{ border: `1px solid ${border}`, color: text, background: "transparent" }}
          >
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            Attach
          </button>

          <button
            type="button"
            className={baseBtn}
            aria-label="Record voice note"
            style={{ border: `1px solid ${border}`, color: text, background: "transparent" }}
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            Voice
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-trustBlue bg-trustBlue px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/60 focus-visible:ring-offset-2"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Prompt Browser
          </button>
        </div>
      </div>
    </motion.footer>
  );
}
