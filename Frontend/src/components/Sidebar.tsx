import { NavLink, useLocation } from "react-router-dom";
import { MessageSquare, FolderOpen, FileText, FileCode, Users, Clock, Settings, HelpCircle, Sun, Moon, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "AI Chat", to: "/", icon: MessageSquare },
  { label: "Projects", to: "/projects", icon: FolderOpen },
  { label: "Templates", to: "/templates", icon: FileText },
  { label: "Documents", to: "/documents", icon: FileCode },
  { label: "Community", to: "/community", icon: Users, badge: "NEW" },
  { label: "History", to: "/history", icon: Clock },
];

const settingsItems = [
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Help", to: "/help", icon: HelpCircle },
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
    <aside className="flex w-64 flex-col gap-6 rounded-3xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--layer-active)]">
          <div className="text-lg font-bold text-[var(--text-strong)]">S</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[var(--text-strong)]">Script</span>
          <button className="rounded-md p-1 hover:bg-[var(--layer-muted)]">
            <ChevronLeft className="h-4 w-4 text-[var(--text-muted)]" />
          </button>
          <button className="rounded-md p-1 hover:bg-[var(--layer-muted)]">
            <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* Search */}
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

      {/* Main Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[var(--layer-active)] text-[var(--text-strong)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Settings & Help */}
      <div className="border-t border-[var(--line-subtle)] px-2 pt-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Settings & Help
        </div>
        <nav className="flex flex-col gap-1">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--layer-active)] text-[var(--text-strong)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Theme Toggle */}
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

      {/* User Profile */}
      <div className="flex items-center gap-3 rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] text-sm font-semibold text-white">
          EC
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-[var(--text-strong)]">Emilia Caitin</div>
          <div className="text-xs text-[var(--text-muted)]">hey@nuance.agency</div>
        </div>
      </div>
    </aside>
  );
}
