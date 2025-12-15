import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Layout, Settings, Sun, Moon, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Toron", to: "/toron", icon: MessageSquare },
  { label: "Workspace", to: "/workspace", icon: Layout },
];

export default function Sidebar() {
  const location = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <aside className="flex w-64 flex-col justify-between gap-6 rounded-3xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-4 py-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--layer-active)]">
            <div className="text-lg font-bold text-[var(--text-strong)]">RZ</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-[var(--text-strong)]">Ryuzen</span>
            <button className="rounded-md p-1 hover:bg-[var(--layer-muted)]">
              <ChevronLeft className="h-4 w-4 text-[var(--text-muted)]" />
            </button>
            <button className="rounded-md p-1 hover:bg-[var(--layer-muted)]">
              <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        <div className="px-2">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
            <kbd className="rounded bg-[var(--layer-surface)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">⌘K</kbd>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--layer-active)] text-[var(--text-strong)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 border-t border-[var(--line-subtle)] pt-4">
        <nav className="flex flex-col gap-1 px-2">
          <NavLink
            to="/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              location.pathname === "/settings"
                ? "bg-[var(--layer-active)] text-[var(--text-strong)]"
                : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Settings className="h-[18px] w-[18px]" aria-hidden />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 px-2">
          <button
            onClick={toggleTheme}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              theme === "light"
                ? "bg-[var(--layer-active)] text-[var(--text-strong)]"
                : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)]"
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </button>
          <button
            onClick={toggleTheme}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              theme === "dark"
                ? "bg-[var(--layer-active)] text-[var(--text-strong)]"
                : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)]"
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] text-sm font-semibold text-white">
            EC
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--text-strong)]">Emilia Caitin</div>
            <div className="text-xs text-[var(--text-muted)]">hey@nuance.agency</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
