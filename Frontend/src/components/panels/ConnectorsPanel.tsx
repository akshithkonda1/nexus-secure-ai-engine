import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsPanelProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  close?: () => void;
}

const glassPanelClass =
  "relative bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.01]";

const ConnectorsPanel: React.FC<ConnectorsPanelProps> = ({ connectors, onChange, close }) => {
  const reconnect = (id: string) => {
    const updated = connectors.map((connector) =>
      connector.id === id
        ? { ...connector, status: "connected", lastSync: "Just now" }
        : connector,
    );
    onChange(updated);
  };

  return (
    <div className={`${glassPanelClass} flex h-full flex-col gap-4`}>

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm uppercase tracking-[0.2em]">
        <h2 className="flex items-center gap-2 font-semibold text-textPrimary">
          <PlugZap className="h-4 w-4" /> Connectors Control
        </h2>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-glassBorder bg-glassHeavy px-3 py-1 text-xs font-semibold text-textSecondary">
            {connectors.length} integrations
          </span>

          {close && (
            <button
              onClick={close}
              className="rounded-full border border-glassBorder bg-glassHeavy px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-glassBorderStrong"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* CONNECTOR LIST */}
      <div className="grid gap-3 md:grid-cols-2">
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="
              rounded-2xl 
              border 
              border-glassBorder 
              bg-glassHeavy 
              px-4 
              py-4 
              shadow-glass 
              transition 
              hover:shadow-glassStrong
            "
          >
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-textPrimary">{connector.name}</p>

              {connector.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : connector.status === "warning" ? (
                <AlertTriangle className="h-4 w-4 t
