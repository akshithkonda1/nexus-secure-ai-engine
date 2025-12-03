import React from "react";
import { Check, Loader2, WifiOff } from "lucide-react";

const connectors = [
  { name: "Google Drive", status: "connected", lastSync: "2m ago" },
  { name: "Google Calendar", status: "syncing", lastSync: "Live" },
  { name: "Microsoft Outlook", status: "connected", lastSync: "5m ago" },
  { name: "Microsoft Calendar", status: "connected", lastSync: "8m ago" },
  { name: "Apple iCloud", status: "connected", lastSync: "12m ago" },
  { name: "Notion", status: "syncing", lastSync: "Live" },
  { name: "GitHub", status: "connected", lastSync: "1m ago" },
  { name: "OneDrive", status: "error", lastSync: "Retrying" },
] as const;

type Connector = (typeof connectors)[number];

function statusIcon(status: Connector["status"]) {
  if (status === "connected") return <Check className="h-4 w-4 text-emerald-300" />;
  if (status === "syncing") return <Loader2 className="h-4 w-4 animate-spin text-cyan-200" />;
  return <WifiOff className="h-4 w-4 text-rose-300" />;
}

function statusBar(status: Connector["status"]) {
  if (status === "error") return "w-2/5 bg-rose-400";
  if (status === "syncing") return "w-3/4 bg-cyan-300";
  return "w-full bg-emerald-300";
}

export function ConnectorEcosystemsCard() {
  return (
    <div className="card-aurora p-4 lg:p-5 text-white/90">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-indigo-300">Ecosystems</p>
          <h3 className="text-lg font-semibold text-white">Connectors</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] text-slate-200">8 linked</span>
      </div>

      <div className="space-y-2">
        {connectors.map((connector) => (
          <div
            key={connector.name}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition hover:border-cyan-400/40 hover:bg-white/10"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-white/15 to-cyan-500/20 text-sm font-semibold uppercase text-white/90">
              {connector.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-white">
                <span className="font-medium">{connector.name}</span>
                <span className="flex items-center gap-1 text-xs text-slate-200">
                  {statusIcon(connector.status)}
                  <span className="capitalize">{connector.status}</span>
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${statusBar(connector.status)} shadow-[0_0_18px_rgba(56,189,248,0.35)]`} />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Last sync: {connector.lastSync}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
