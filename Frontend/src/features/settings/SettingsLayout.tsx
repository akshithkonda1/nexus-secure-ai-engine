import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../../shared/lib/cn";

const settingsNav = [
  { label: "Appearance", to: "/settings/appearance", description: "Theme, density, and brand colors" },
  { label: "Billing", to: "/settings/billing", description: "Plan, invoices, and payment methods" },
];

export function SettingsLayout() {
  return (
    <div className="flex w-full flex-1 bg-app">
      <aside className="hidden w-72 flex-col border-r border-subtle bg-surface/80 p-6 backdrop-blur-lg md:flex">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Workspace settings</h2>
          <p className="text-sm text-muted">Craft a consistent, audit-ready experience.</p>
        </div>
        <nav className="flex flex-col gap-2">
          {settingsNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-xl border border-transparent px-4 py-3 transition",
                  isActive
                    ? "border-indigo-500/60 bg-accent-soft text-white shadow-lg"
                    : "bg-surface/40 text-muted hover:border-subtle hover:bg-slate-900/10",
                )
              }
            >
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-muted">{item.description}</div>
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="flex flex-1 flex-col overflow-y-auto bg-surface/60 p-8">
        <Outlet />
      </section>
    </div>
  );
}
