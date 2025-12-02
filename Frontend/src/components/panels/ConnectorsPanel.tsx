import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsPanelProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  close?: () => void;
}

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
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div
        className="
    w-full max-w-5xl mx-auto
    rounded-3xl
    p-8
    bg-white dark:bg-neutral-900
    border border-black/5 dark:border-white/10
    shadow-xl shadow-black/5 dark:shadow-black/20
    backdrop-blur-2xl
    transition-all duration-300
  "
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-100">
            <PlugZap className="h-4 w-4" /> CONNECTORS PANEL
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium tracking-widest text-neutral-900 dark:bg-white/10 dark:text-neutral-100">
              {connectors.length} integrations
            </span>
            {close && (
              <button
                onClick={close}
                className="rounded-xl border border-black/5 bg-white px-4 py-1 text-[11px] uppercase tracking-wide text-neutral-900 transition hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-100"
              >
                Close
              </button>
            )}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className="
    rounded-2xl
    p-5
    bg-white/60 dark:bg-white/5
    border border-black/5 dark:border-white/10
    backdrop-blur-xl
    shadow-md shadow-black/5 dark:shadow-black/10
    hover:scale-[1.02] transition-all
  "
            >
              <div className="flex items-center justify-between text-sm">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{connector.name}</p>
                {connector.status === "connected" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : connector.status === "warning" ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Last sync {connector.lastSync}</p>
              <div
                className="
    mt-3 inline-flex items-center px-3 py-[2px]
    rounded-full
    bg-emerald-100 text-emerald-700
    dark:bg-emerald-900/40 dark:text-emerald-300
    text-sm font-medium
  "
              >
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300" />
                {connector.status}
              </div>
              {connector.status !== "connected" && (
                <button
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-black/5 bg-white/70 px-3 py-2 text-xs font-semibold text-neutral-900 transition hover:bg-white/90 dark:border-white/10 dark:bg-white/10 dark:text-neutral-100"
                  onClick={() => reconnect(connector.id)}
                >
                  <RefreshCcw className="h-4 w-4" /> Reconnect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectorsPanel;
