import React, { useState } from "react";
import { exportForToron } from "../../utils/exportForToron";

const ToronOverlay = ({ open, onClose }) => {
  const [status, setStatus] = useState(null);
  const [lastPayload, setLastPayload] = useState(null);

  if (!open) return null;

  const handleAnalyze = async () => {
    const payload = exportForToron();
    setLastPayload(payload);
    setStatus("Sending to Toron...");
    try {
      await fetch("/api/toron/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus("Data sent to Toron successfully.");
    } catch (error) {
      setStatus("Unable to reach Toron. Data is still ready for analysis.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[var(--glass-blur)]">
      <div className="w-full max-w-3xl rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Toron AI</p>
            <h3 className="text-2xl font-semibold text-[var(--text-primary)]">Analyze workspace</h3>
            <p className="text-sm text-[var(--text-secondary)]">Widgets remain active. Canvas stays untouched.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-[var(--border-card)] bg-[var(--bg-widget)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-4">
            <div className="text-sm font-semibold text-[var(--text-primary)]">Export snapshot</div>
            <p className="text-xs text-[var(--text-secondary)]">Lists, calendar, tasks, and connectors are bundled for Toron.</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-4">
            <div className="text-sm font-semibold text-[var(--text-primary)]">Zero canvas disruption</div>
            <p className="text-xs text-[var(--text-secondary)]">Overlay floats above the workspace and never navigates away.</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-[var(--text-secondary)]">
            {lastPayload ? `Lists: ${lastPayload.lists.categories.length} categories • Tasks: ${lastPayload.tasks.tasks.length}` : "Ready when you are."}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAnalyze}
              className="rounded-xl bg-[var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[var(--btn-text)] shadow"
            >
              Analyze with Toron
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-[var(--border-card)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
            >
              Dismiss
            </button>
          </div>
        </div>

        {status ? <p className="mt-3 text-sm text-[var(--text-secondary)]">{status}</p> : null}
      </div>
    </div>
  );
};

export default ToronOverlay;
