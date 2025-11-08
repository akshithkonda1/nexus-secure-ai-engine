import { Moon, Sun, Rocket, Search } from "lucide-react";
import { useEffect, useState } from "react";

export function Topbar({ onOpenConsole }: { onOpenConsole: () => void }) {
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  useEffect(() => {
    const el = document.documentElement;
    if (theme === "light") el.classList.remove("dark");
    else el.classList.add("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--surface)/.72)] bg-[rgb(var(--surface)/.95)] border-b"
      style={{ borderColor: `rgb(var(--border))` }}>
      <div className="mx-auto flex h-16 items-center gap-3 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative w-full max-w-[720px]">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-[rgb(var(--subtle))]" />
            <input
              placeholder="Search workspace, sessions, commands…"
              className="w-full rounded-xl border bg-[rgb(var(--panel))] pl-10 pr-3 py-2 text-sm outline-none"
              style={{ borderColor: `rgb(var(--border))` }}
            />
          </div>
        </div>

        <button className="btn hidden md:inline-flex" onClick={onOpenConsole}>
          <Rocket className="h-4.5 w-4.5" />
          Launch Console
        </button>

        <button
          className="btn-secondary inline-flex items-center gap-2 rounded-xl px-3 py-2"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"} mode</span>
        </button>
      </div>
    </header>
  );
}
