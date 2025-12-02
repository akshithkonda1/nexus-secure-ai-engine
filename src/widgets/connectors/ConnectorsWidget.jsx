import React, { useEffect, useState } from "react";
import ConnectorPanel from "./ConnectorPanel";
import { ConnectorsStore, exportConnectorState } from "./ConnectorsStore";

const services = ["google", "microsoft", "apple", "meta", "notion", "canvas", "email"];

const ConnectorsWidget = () => {
  const [state, setState] = useState(ConnectorsStore.getState());
  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setState(ConnectorsStore.getState());
  }, []);

  const handleSetToken = async (service, token) => {
    await ConnectorsStore.setPersonalToken(service, token);
    setState(ConnectorsStore.getState());
    setLogs((prev) => [...prev, `${service} token updated`]);
  };

  const handleStartOAuth = async (service) => {
    const response = await ConnectorsStore.startOAuthFlow(service, {
      clientId: `${service}-client`,
      redirectUri: `/oauth/${service}/callback`,
    });
    if (response) {
      setLogs((prev) => [...prev, `${service} OAuth initiated`]);
      await ConnectorsStore.completeOAuthFlow(service, { code: "demo-code" });
      setState(ConnectorsStore.getState());
    }
  };

  const handleManualSync = async (service) => {
    await ConnectorsStore.sync(service);
    setState(ConnectorsStore.getState());
    setLogs((prev) => [...prev, `${service} synced`]);
  };

  const handleExport = () => {
    const payload = exportConnectorState();
    setLogs((prev) => [...prev, `Exported state for Toron (${Object.keys(payload).length} services)`]);
  };

  return (
    <div className="ryuzen-card flex h-full w-full flex-col rounded-3xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-4 text-[var(--text-primary)] shadow-xl backdrop-blur-[var(--glass-blur)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Connectors Widget</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">OAuth + PAT manager</h2>
          <p className="text-sm text-[var(--text-secondary)]">Manage cloud integrations safely</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="rounded-xl border border-[var(--border-card)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
          >
            Export
          </button>
          <button
            onClick={() => setLogsOpen(true)}
            className="rounded-xl bg-[var(--btn-bg)] px-3 py-2 text-sm font-semibold text-[var(--btn-text)] shadow"
          >
            Error Logs
          </button>
        </div>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-white/20 grid flex-1 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
        {services.map((service) => (
          <ConnectorPanel
            key={service}
            service={service}
            connector={state[service]}
            onSetToken={(token) => handleSetToken(service, token)}
            onStartOAuth={() => handleStartOAuth(service)}
            onConfigure={() => setLogs((prev) => [...prev, `${service} configuration opened`])}
            onManualSync={() => handleManualSync(service)}
          />
        ))}
      </div>

      {logsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[var(--glass-blur)]">
          <div className="w-full max-w-2xl rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Connector Activity</h3>
              <button
                onClick={() => setLogsOpen(false)}
                className="rounded-full border border-[var(--border-card)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1 text-sm text-[var(--text-secondary)]">
              {logs.length === 0 ? <p className="text-[var(--text-secondary)]">No activity yet.</p> : null}
              {logs.map((log, idx) => (
                <div key={`${log}-${idx}`} className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-3">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ConnectorsWidget;
