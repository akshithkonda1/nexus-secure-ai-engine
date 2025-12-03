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
    <div className="space-y-4 text-[var(--rz-text)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--rz-text)]">Connectors</h2>
          <p className="text-[var(--rz-text)]">Manage every integration from a fullscreen floating window.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={newConnector.name}
            onChange={(e) => setNewConnector((prev) => ({ ...prev, name: e.target.value }))}
            className="rounded-xl border px-3 py-2 text-[var(--rz-text)]"
            style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
            placeholder="Connector name"
          />
          <input
            value={newConnector.tags}
            onChange={(e) => setNewConnector((prev) => ({ ...prev, tags: e.target.value }))}
            className="rounded-xl border px-3 py-2 text-[var(--rz-text)]"
            style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
            placeholder="Tags"
          />
          <select
            value={newConnector.status}
            onChange={(e) => setNewConnector((prev) => ({ ...prev, status: e.target.value as Connector["status"] }))}
            className="rounded-xl border px-3 py-2 text-[var(--rz-text)]"
            style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
          >
            <option value="Ready">Ready</option>
            <option value="Syncing">Syncing</option>
            <option value="Paused">Paused</option>
          </select>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-[var(--rz-text)]"
            style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
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
            className="rounded-2xl border p-4 text-[var(--rz-text)]"
            style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface)" }}
          >
            <div className="grid gap-3 md:grid-cols-4 md:items-center">
              <input
                value={connector.name}
                onChange={(e) => updateConnector(connector.id, { name: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              />
              <input
                value={connector.tags.join(", ")}
                onChange={(e) => updateConnector(connector.id, { tags: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              />
              <select
                value={connector.status}
                onChange={(e) => updateConnector(connector.id, { status: e.target.value as Connector["status"] })}
                className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              >
                <option value="Ready">Ready</option>
                <option value="Syncing">Syncing</option>
                <option value="Paused">Paused</option>
              </select>
              <select
                value={connector.syncStatus}
                onChange={(e) => updateConnector(connector.id, { syncStatus: e.target.value as Connector["syncStatus"] })}
                className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              >
                <option value="Synced">Synced</option>
                <option value="Pending">Pending</option>
                <option value="Syncing">Syncing</option>
              </select>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[var(--rz-text)]">
              <span className="rounded-full border px-3 py-1 text-xs text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)" }}>
                {connector.tags.length ? connector.tags.join(", ") : "No tags"}
              </span>
              <span className="rounded-full border px-3 py-1 text-xs text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)" }}>
                {connector.status}
              </span>
              <span className="rounded-full border px-3 py-1 text-xs text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)" }}>
                {connector.syncStatus}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm text-[var(--rz-text)]"
                style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
                onClick={() => reorderConnector(connector.id, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm text-[var(--rz-text)]"
                style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
                onClick={() => reorderConnector(connector.id, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm text-[var(--rz-text)]"
                style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
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
