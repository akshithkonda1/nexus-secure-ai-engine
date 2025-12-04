import React, { useState } from "react";
import { useConnectorsStore } from "../../state/connectorsStore";
import { useModeStore } from "../../state/modeStore";

export const ConnectorsWidget: React.FC = () => {
  const { connectors, addConnector } = useConnectorsStore();
  const { mode } = useModeStore();
  const [label, setLabel] = useState("");
  const [source, setSource] = useState("");

  const tilePanel =
    "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl px-6 py-5 transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)]";
  const innerTile = "rounded-xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 px-4 py-3 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl";

  return (
    <div className={`${tilePanel} fade-in`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">Connectors</p>
          <p className="text-sm text-textMuted">Consent before linking external content</p>
        </div>
        <span className="text-xs text-textSecondary">{mode === "advanced" ? "Advanced" : "Basic"}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm text-neutral-800 dark:text-neutral-200">
        {connectors.length === 0 && <p className="text-neutral-700 dark:text-neutral-300">No connectors yet.</p>}
        {connectors.map((connector) => (
          <div key={connector.id} className={innerTile}>
            <div className="font-semibold text-neutral-800 dark:text-neutral-100">{connector.label}</div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300">{connector.source}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Consent: {connector.consented ? "Granted" : "Pending"}</p>
          </div>
        ))}
      </div>
      {mode === "advanced" && (
        <div className="mt-3 space-y-2 text-sm">
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Connector label"
            className="w-full rounded-xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 px-4 py-3 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl outline-none focus:border-neutral-400/70 focus:shadow-[0_6px_24px_rgba(0,0,0,0.2)] dark:focus:border-neutral-500/70"
          />
          <input
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="Source location"
            className="w-full rounded-xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 px-4 py-3 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl outline-none focus:border-neutral-400/70 focus:shadow-[0_6px_24px_rgba(0,0,0,0.2)] dark:focus:border-neutral-500/70"
          />
          <button
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-textPrimary shadow-tile transition hover:bg-emerald-500"
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
