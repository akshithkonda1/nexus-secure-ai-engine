import React, { useState } from "react";
import { useConnectorsStore } from "../../state/connectorsStore";
import { useModeStore } from "../../state/modeStore";

export const ConnectorsWidget: React.FC = () => {
  const { connectors, addConnector } = useConnectorsStore();
  const { mode } = useModeStore();
  const [label, setLabel] = useState("");
  const [source, setSource] = useState("");

  return (
    <div className="fade-in rounded-2xl border border-borderStrong bg-bgElevated/70 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textMuted">Connectors</p>
          <p className="text-sm text-textMuted">Consent before linking external content</p>
        </div>
        <span className="text-xs text-textSecondary">{mode === "advanced" ? "Advanced" : "Basic"}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm text-textMuted">
        {connectors.length === 0 && <p className="text-textSecondary">No connectors yet.</p>}
        {connectors.map((connector) => (
          <div key={connector.id} className="rounded-lg bg-bgElevated/60 p-3">
            <div className="font-semibold">{connector.label}</div>
            <p className="text-xs text-textMuted">{connector.source}</p>
            <p className="text-[11px] text-emerald-400">Consent: {connector.consented ? "Granted" : "Pending"}</p>
          </div>
        ))}
      </div>
      {mode === "advanced" && (
        <div className="mt-3 space-y-2 text-sm">
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Connector label"
            className="w-full rounded-lg bg-bgElevated px-3 py-2 text-textMuted outline-none ring-1 ring-transparent focus:ring-emerald-500"
          />
          <input
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="Source location"
            className="w-full rounded-lg bg-bgElevated px-3 py-2 text-textMuted outline-none ring-1 ring-transparent focus:ring-emerald-500"
          />
          <button
            className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-textPrimary transition hover:bg-emerald-500"
            onClick={() => {
              if (!label.trim() || !source.trim()) return;
              void addConnector(label.trim(), source.trim());
              setLabel("");
              setSource("");
            }}
          >
            Link file
          </button>
        </div>
      )}
    </div>
  );
};
