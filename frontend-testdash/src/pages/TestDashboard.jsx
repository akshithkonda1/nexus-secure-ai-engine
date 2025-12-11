import React, { useEffect, useState } from 'react';
import { validateEngine, startFullTestSuite, getRunStatus, streamLogs } from '../api/testAPI';
import LiveLogStream from '../components/LiveLogStream';
import ProgressBar from '../components/ProgressBar';
import StatusBubble from '../components/StatusBubble';
import ReportViewer from '../components/ReportViewer';

export default function TestDashboard() {
  const [engineStatus, setEngineStatus] = useState({ loading: true, ok: false, message: '' });
  const [runId, setRunId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function doValidate() {
      try {
        const res = await validateEngine();
        if (res.ok) {
          setEngineStatus({ loading: false, ok: true, message: res.message || 'Engine OK' });
        } else {
          setEngineStatus({
            loading: false,
            ok: false,
            message: res.error || res.warning || 'Engine validation failed',
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

  const canStart = engineStatus.ok && !engineStatus.loading;

  async function handleStart() {
    if (!canStart) return;
    const res = await startFullTestSuite();
    setRunId(res.run_id);
    setLogs((prev) => [...prev, `RUN ${res.run_id} started`]);
  }

  return (
    <div className="testdash-root">
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
        <h2>Launch Suite</h2>
        <p>Engine validation must be green to run the full suite.</p>
        <button disabled={!canStart} onClick={handleStart} aria-label="Run full test suite">
          RUN FULL TEST SUITE
        </button>
      </section>

      <section className="status-section">
        <h2>Execution Status</h2>
        <StatusBubble status={status} />
        <ProgressBar progress={status?.progress ?? 0} />
      </section>

      <section className="grid-2">
        <div className="summary-item">
          <h3>Summary Metrics</h3>
          <div className="summary-grid">
            <div>
              <strong>p95 latency</strong>
              <div>{status?.metrics?.p95_latency ?? '—'} ms</div>
            </div>
            <div>
              <strong>Avg engine latency</strong>
              <div>{status?.metrics?.avg_engine_latency ?? '—'} ms</div>
            </div>
            <div>
              <strong>Determinism score</strong>
              <div>{status?.metrics?.determinism ?? '—'}</div>
            </div>
            <div>
              <strong>Snapshot</strong>
              <div>
                {status?.snapshot ? (
                  <a href={status.snapshot} target="_blank" rel="noreferrer">
                    Download snapshot
                  </a>
                ) : (
                  '—'
                )}
              </div>
            </div>
            <div>
              <strong>HTML Report</strong>
              <div>
                {status?.report ? (
                  <a href={status.report} target="_blank" rel="noreferrer">
                    Open report
                  </a>
                ) : (
                  '—'
                )}
              </div>
            </div>
            <div>
              <strong>Bundle</strong>
              <div>
                {status?.bundle ? (
                  <a href={status.bundle} target="_blank" rel="noreferrer">
                    Download bundle
                  </a>
                ) : (
                  '—'
                )}
              </div>
            </div>
          </div>
        </div>
        <ReportViewer html={status?.report_html} />
      </section>

      <section className="logs-section">
        <h2>Live Logs</h2>
        <LiveLogStream lines={logs} />
      </section>
    </div>
  );
}
