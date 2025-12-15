import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Briefcase, Settings } from "lucide-react";

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Toron", to: "/toron", icon: MessageSquare },
  { label: "Workspace", to: "/workspace", icon: Briefcase },
  { label: "Settings", to: "/settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="flex w-64 flex-col gap-8 rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-6 py-8">
      <div className="flex items-center justify-between text-sm font-semibold tracking-tight text-[var(--text-strong)]">
        <span>Ryuzen</span>
        <span className="rounded-full bg-[var(--pill)] px-3 py-1 text-xs text-[var(--text-primary)]">Script</span>
      </div>
      <nav className="flex flex-1 flex-col gap-2 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
              style={{
                backgroundColor: active ? "var(--layer-active)" : "transparent",
                color: active ? "var(--text-strong)" : "var(--text-muted)",
                border: active ? "1px solid var(--line-strong)" : "1px solid transparent",
              }}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-4 text-sm text-[var(--text-muted)]">
        <div className="text-[var(--text-primary)]">Workspace health</div>
        <p className="mt-2 leading-relaxed">All systems nominal. Toron and Workspace are ready.</p>
      </div>
    </aside>
  );
}
