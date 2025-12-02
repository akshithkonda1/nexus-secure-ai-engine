import React, { useState } from "react";
import { validatePAT } from "../../utils/validators";

const ConnectorPanel = ({ service, connector, onSetToken, onStartOAuth, onConfigure, onManualSync }) => {
  const [token, setToken] = useState(connector.token || "");
  const [error, setError] = useState(null);

  const handleTokenSave = () => {
    if (!validatePAT(token)) {
      setError("Token must contain letters and numbers and be at least 12 characters.");
      return;
    }
    setError(null);
    onSetToken(token);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">{service}</p>
          <p className="text-lg font-semibold text-[var(--text-primary)]">{connector.mode === "PAT" ? "Access Token" : "OAuth"}</p>
        </div>
        <div className="flex gap-2">
          {connector.mode === "PAT" ? (
            <button
              onClick={handleTokenSave}
              className="rounded-xl bg-[var(--btn-bg)] px-3 py-2 text-xs font-semibold text-[var(--btn-text)]"
            >
              Save Token
            </button>
          ) : (
            <button
              onClick={onStartOAuth}
              className="rounded-xl bg-[var(--btn-bg)] px-3 py-2 text-xs font-semibold text-[var(--btn-text)]"
            >
              Connect
            </button>
          )}
          <button
            onClick={onConfigure}
            className="rounded-xl border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-white/10"
          >
            Configure
          </button>
        </div>
      </div>

      {connector.mode === "PAT" ? (
        <div className="space-y-2">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter Personal Access Token"
            className="w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border-card)] bg-[var(--bg-widget)] p-3 text-sm text-[var(--text-secondary)]">
          Launch the OAuth flow to connect your {service} account securely.
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>Status: {connector.status}</span>
        <span>Last sync: {connector.lastSync ? new Date(connector.lastSync).toLocaleString() : "Never"}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onManualSync}
          className="flex-1 rounded-lg border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-white/10"
        >
          Manual Sync
        </button>
        <button
          onClick={onStartOAuth}
          className="flex-1 rounded-lg border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-white/10"
        >
          Re-auth
        </button>
      </div>
      {connector.error ? <p className="text-xs text-red-400">{connector.error}</p> : null}
    </div>
  );
};

export default ConnectorPanel;
