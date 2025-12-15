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
    <header className="flex items-center justify-between border-b border-[var(--line-subtle)] pb-5">
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link to="/" className="hover:opacity-80">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="text-[var(--text-primary)]">{title}</span>
      </div>
      <button
        type="button"
        onClick={() => setMode(nextMode)}
        className="flex items-center gap-2 rounded-lg border border-[var(--line-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
      >
        {resolved === "dark" ? <Moon className="h-4 w-4" aria-hidden /> : <SunMedium className="h-4 w-4" aria-hidden />}
        <span className="capitalize">{mode === "system" ? `${resolved} (system)` : resolved}</span>
      </button>
    </header>
  );
}
