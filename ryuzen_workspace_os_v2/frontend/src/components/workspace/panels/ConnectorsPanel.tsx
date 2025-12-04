import React, { useState } from "react";

type Connector = {
  id: string;
  name: string;
  status: "Ready" | "Syncing" | "Paused";
  tags: string[];
  syncStatus: "Synced" | "Pending" | "Syncing";
};

const defaultConnectors: Connector[] = [
  { id: "toron", name: "Toron Cloud", status: "Ready", tags: ["api", "primary"], syncStatus: "Synced" },
  { id: "lake", name: "Data Lake", status: "Syncing", tags: ["storage"], syncStatus: "Syncing" },
  { id: "notifications", name: "Notifications", status: "Paused", tags: ["alerts"], syncStatus: "Pending" },
  { id: "bots", name: "Workspace Bots", status: "Ready", tags: ["automation"], syncStatus: "Synced" },
];

const ConnectorsPanel: React.FC = () => {
  const [connectors, setConnectors] = useState<Connector[]>(defaultConnectors);
  const [newConnector, setNewConnector] = useState({ name: "", status: "Ready" as Connector["status"], tags: "" });

  const controlClass =
    "w-full rounded-xl border border-neutral-300/50 dark:border-neutral-700/50 px-3 py-2 leading-relaxed bg-white/85 dark:bg-neutral-900/85 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl";
  const actionButtonClass =
    "rounded-full px-4 py-2 leading-relaxed bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl";
  const compactActionButtonClass =
    "rounded-full px-3 py-1 text-sm leading-relaxed bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl";
  const pillClass = "rounded-full border border-neutral-300/50 dark:border-neutral-700/50 px-3 py-1 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 bg-white/85 dark:bg-neutral-900/85 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl";

  const addConnector = () => {
    if (!newConnector.name.trim()) return;
    setConnectors((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        name: newConnector.name.trim(),
        status: newConnector.status,
        tags: newConnector.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        syncStatus: "Pending",
      },
    ]);
    setNewConnector({ name: "", status: "Ready", tags: "" });
  };

  const updateConnector = (id: string, payload: Partial<Connector> & { tags?: string }) => {
    setConnectors((current) =>
      current.map((connector) =>
        connector.id === id
          ? {
              ...connector,
              ...payload,
              tags: payload.tags !== undefined ? payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : connector.tags,
            }
          : connector
      )
    );
  };

  const deleteConnector = (id: string) => setConnectors((current) => current.filter((connector) => connector.id !== id));

  const reorderConnector = (id: string, direction: -1 | 1) => {
    setConnectors((current) => {
      const index = current.findIndex((connector) => connector.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  return (
    <div className="space-y-4 leading-relaxed text-neutral-800 dark:text-neutral-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Connectors</h2>
          <p>Manage every integration from a fullscreen floating window.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={newConnector.name}
            onChange={(e) => setNewConnector((prev) => ({ ...prev, name: e.target.value }))}
            className={controlClass}
            placeholder="Connector name"
          />
          <input
            value={newConnector.tags}
            onChange={(e) => setNewConnector((prev) => ({ ...prev, tags: e.target.value }))}
            className={controlClass}
            placeholder="Tags"
          />
          <select
            value={newConnector.status}
            onChange={(e) => setNewConnector((prev) => ({ ...prev, status: e.target.value as Connector["status"] }))}
            className={`${controlClass} w-auto`}
          >
            <option value="Ready">Ready</option>
            <option value="Syncing">Syncing</option>
            <option value="Paused">Paused</option>
          </select>
          <button
            type="button"
            className={actionButtonClass}
            onClick={addConnector}
          >
            Add connector
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {connectors.map((connector, index) => (
          <div
            key={connector.id}
              className="
                relative rounded-3xl
                bg-white/85 dark:bg-neutral-900/85
                border border-neutral-300/50 dark:border-neutral-700/50
                text-neutral-800 dark:text-neutral-200
                shadow-[0_4px_20px_rgba(0,0,0,0.12)]
                backdrop-blur-xl
                p-6 md:p-8 z-[10]
              "
          >
            <div className="absolute inset-0 pointer-events-none rounded-3xl backdrop-blur-xl" />
            <div className="grid gap-3 md:grid-cols-4 md:items-center">
              <input
                value={connector.name}
                onChange={(e) => updateConnector(connector.id, { name: e.target.value })}
                className={controlClass}
              />
              <input
                value={connector.tags.join(", ")}
                onChange={(e) => updateConnector(connector.id, { tags: e.target.value })}
                className={controlClass}
              />
              <select
                value={connector.status}
                onChange={(e) => updateConnector(connector.id, { status: e.target.value as Connector["status"] })}
                className={controlClass}
              >
                <option value="Ready">Ready</option>
                <option value="Syncing">Syncing</option>
                <option value="Paused">Paused</option>
              </select>
              <select
                value={connector.syncStatus}
                onChange={(e) => updateConnector(connector.id, { syncStatus: e.target.value as Connector["syncStatus"] })}
                className={controlClass}
              >
                <option value="Synced">Synced</option>
                <option value="Pending">Pending</option>
                <option value="Syncing">Syncing</option>
              </select>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[var(--rz-text)]">
              <span className={pillClass}>
                {connector.tags.length ? connector.tags.join(", ") : "No tags"}
              </span>
              <span className={pillClass}>
                {connector.status}
              </span>
              <span className={pillClass}>
                {connector.syncStatus}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={compactActionButtonClass}
                onClick={() => reorderConnector(connector.id, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className={compactActionButtonClass}
                onClick={() => reorderConnector(connector.id, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className={compactActionButtonClass}
                onClick={() => deleteConnector(connector.id)}
              >
                Delete
              </button>
              <span className="ml-auto text-xs text-[var(--rz-text)]">Connector {index + 1} of {connectors.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectorsPanel;
