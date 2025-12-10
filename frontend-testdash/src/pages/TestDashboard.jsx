import React, { useEffect, useMemo, useState } from "react";
import {
  validateEngine,
  startFullTestSuite,
  getRunStatus,
  streamLogs,
} from "../api/testAPI";
import LiveLogStream from "../components/LiveLogStream.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import StatusBubble from "../components/StatusBubble.jsx";

export default function TestDashboard() {
  const [engineStatus, setEngineStatus] = useState({ loading: true, ok: false, message: "" });
  const [confirmation, setConfirmation] = useState("");
  const [runId, setRunId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function doValidate() {
      try {
        const res = await validateEngine();
        if (res.ok) {
          setEngineStatus({ loading: false, ok: true, message: res.message || "Engine OK" });
        } else {
          setEngineStatus({
            loading: false,
            ok: false,
            message: res.error || res.warning || "Engine validation failed",
          });
        }
      } catch (e) {
        setEngineStatus({ loading: false, ok: false, message: String(e) });
      }
    }
    doValidate();
  }, []);

  useEffect(() => {
    if (!runId) return undefined;
    const src = streamLogs(runId, (line) => {
      setLogs((prev) => [...prev, line]);
    });

    const interval = setInterval(async () => {
      try {
        const s = await getRunStatus(runId);
        setStatus(s);
      } catch (e) {
        console.error(e);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      if (src) src.close();
    };
  }, [runId]);

  const canStart = useMemo(
    () => engineStatus.ok && !engineStatus.loading && confirmation.trim() === "Begin testing",
    [confirmation, engineStatus]
  );

  async function handleStart() {
    if (!canStart) return;
    const res = await startFullTestSuite();
    setRunId(res.run_id);
    setLogs((prev) => [...prev, `RUN ${res.run_id} started`]);
  }

  const summary = status?.result || {};

  return (
    <div className="page">
      <h1>Ryuzen TestOps — Toron v2.5H+</h1>

      <section className="engine-status" aria-live="polite">
        {engineStatus.loading && <p>Validating engine…</p>}
        {!engineStatus.loading && engineStatus.ok && (
          <p className="ok">✅ Engine validated: {engineStatus.message}</p>
        )}
        {!engineStatus.loading && !engineStatus.ok && (
          <p className="error">❌ Engine validation failed: {engineStatus.message}</p>
        )}
      </section>

      <section className="gate">
        <label htmlFor="begin-input">
          Type <code>Begin testing</code> to unlock the test suite:
        </label>
        <input
          id="begin-input"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Begin testing"
          aria-required="true"
        />
        <button disabled={!canStart} onClick={handleStart} className="primary">
          RUN FULL TEST SUITE
        </button>
      </section>

      <section className="status-section">
        <StatusBubble status={status} />
        <ProgressBar progress={status?.status?.progress ?? 0} />
      </section>

      <section className="summary-grid">
        <div className="card">
          <h3>p95 latency (k6)</h3>
          <p>{summary.load?.p95_latency_ms ?? "—"} ms</p>
        </div>
        <div className="card">
          <h3>Avg engine latency (SIM)</h3>
          <p>{summary.sim?.latencies?.average_ms ?? "—"} ms</p>
        </div>
        <div className="card">
          <h3>Determinism score</h3>
          <p>{summary.sim?.determinism_score ?? "—"}</p>
        </div>
        <div className="card">
          <h3>Snapshot</h3>
          <p>{summary.snapshot?.snapshot_path ?? "—"}</p>
        </div>
        <div className="card">
          <h3>HTML Report</h3>
          <p>{summary.report?.path ?? "pending"}</p>
        </div>
        <div className="card">
          <h3>Bundle Download</h3>
          <p>{summary.snapshot?.bundle_path ?? "pending"}</p>
        </div>
      </section>

      <section className="logs-section">
        <h2>Live Console</h2>
        <LiveLogStream lines={logs} />
      </section>
    </div>
  );
}
