import { NavLink, Outlet, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const sections = [
  { label: "Appearance", to: "/settings/appearance" },
  { label: "Billing", to: "/settings/billing" },
];

export function SettingsLayout(): JSX.Element {
  const location = useLocation();

  return (
    <div className="flex flex-1 overflow-hidden bg-app">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-subtle bg-[var(--app-surface)] px-4 py-6 lg:flex">
        <div>
          <h2 className="text-lg font-semibold">Workspace settings</h2>
          <p className="text-sm text-muted">Fine-tune the adaptive shell around Nexus.</p>
        </div>
        <Separator className="my-4" />
        <nav className="space-y-1">
          {sections.map((section) => {
            const isActive = location.pathname === section.to;
            return (
              <Button
                key={section.to}
                asChild
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <NavLink to={section.to}>{section.label}</NavLink>
              </Button>
            );
          })}
        </nav>
      </aside>
      <section className="flex flex-1 flex-col overflow-y-auto p-6">
        <Outlet />
      </section>
    </div>
  );
}
