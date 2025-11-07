import { Fragment } from "react";
import { Clock, MessageCircle, Settings, X } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

const NAV_ITEMS = [
  { icon: MessageCircle, label: "Telemetry" },
  { icon: Clock, label: "History" },
  { icon: Settings, label: "Settings" },
] as const;

export function Sidebar({ variant = "desktop", onNavigate }: SidebarProps) {
  const content = (
    <Fragment>
      <div className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className="group flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onNavigate}
          >
            <item.icon className="h-5 w-5 text-muted transition group-hover:text-primary" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="space-y-4 border-t border-white/5 pt-4">
        <ThemeToggle />
      </div>
    </Fragment>
  );

  if (variant === "mobile") {
    return (
      <aside className="flex h-full w-72 max-w-full flex-col bg-elevated px-4 pb-6 pt-6 text-white shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide text-muted">Navigation</span>
          <button
            type="button"
            onClick={onNavigate}
            className="inline-flex items-center justify-center rounded-lg border border-white/10 p-2 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {content}
      </aside>
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/10 bg-elevated px-4 pb-8 pt-20 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] md:flex">
      {content}
    </aside>
  );
}

export default Sidebar;
