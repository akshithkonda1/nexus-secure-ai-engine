import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Moon, SunMedium } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

const labels: Record<string, string> = {
  "/": "Home",
  "/toron": "Toron",
  "/workspace": "Workspace",
  "/settings": "Settings",
};

export default function TopBar() {
  const location = useLocation();
  const { mode, resolved, setMode } = useTheme();

  const title = useMemo(() => labels[location.pathname] ?? "", [location.pathname]);
  const nextMode = resolved === "dark" ? "light" : "dark";

  return (
    <header className="flex items-center justify-between border-b border-[var(--line-subtle)] pb-6">
      <div className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
        <Link to="/" className="rounded-lg px-2 py-1 transition hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]">
          Home
        </Link>
        <ChevronRight className="h-[18px] w-[18px]" aria-hidden />
        <span className="text-[var(--text-primary)]">{title}</span>
      </div>
      <button
        type="button"
        onClick={() => setMode(nextMode)}
        className="flex items-center gap-2.5 rounded-xl border border-[var(--line-subtle)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
      >
        {resolved === "dark" ? (
          <Moon className="h-[18px] w-[18px]" aria-hidden />
        ) : (
          <SunMedium className="h-[18px] w-[18px]" aria-hidden />
        )}
        <span className="capitalize">{mode === "system" ? `${resolved} (system)` : resolved}</span>
      </button>
    </header>
  );
}
