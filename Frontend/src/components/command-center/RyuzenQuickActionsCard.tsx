import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Gauge, LayoutDashboard, Settings2 } from "lucide-react";

const actions = [
  { href: "/workspace", label: "Workspace", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/telemetry", label: "Telemetry", icon: <Gauge className="h-4 w-4" /> },
  { href: "/settings?tab=connectors", label: "Connectors", icon: <Settings2 className="h-4 w-4" /> },
];

export function RyuzenQuickActionsCard() {
  return (
    <div className="card-aurora p-4 lg:p-5 text-textPrimary/90">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Navigate</p>
          <h3 className="text-lg font-semibold text-textPrimary">Quick Actions</h3>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="group relative overflow-hidden rounded-2xl border border-borderLight/10 bg-gradient-to-br from-white/5 via-slate-900 to-cyan-500/10 p-4 transition hover:border-cyan-400/50"
          >
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.2),transparent_60%)]" />
            <div className="relative flex items-center justify-between text-textPrimary">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-bgPrimary/10 text-cyan-100 shadow-[0_0_20px_rgba(56,189,248,0.35)]">
                  {action.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-[11px] text-textMuted">Hologram jump</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-cyan-200 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
