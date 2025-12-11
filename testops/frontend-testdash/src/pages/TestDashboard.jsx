import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar.jsx';
import RunButton from '../components/RunButton.jsx';
import StatusBubbles from '../components/StatusBubbles.jsx';
import LiveLogStream from '../components/LiveLogStream.jsx';
import TestResultSummary from '../components/TestResultSummary.jsx';
import TestHistoryTable from '../components/TestHistoryTable.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import useTestRunner from '../hooks/useTestRunner.js';

function TestDashboard() {
  const { runId, progress, statusMap, logs, summary, loading, actions, statusKeys } =
    useTestRunner();

  useEffect(() => {
    if (!runId) return undefined;
    actions.listenToLogs(runId);
    const interval = setInterval(() => actions.getStatus(runId), 2500);
    return () => {
      actions.stopLogs();
      clearInterval(interval);
    };
  }, [runId, actions]);

  const onRun = async () => {
    const newId = await actions.runAll();
    if (newId) {
      actions.listenToLogs(newId);
      actions.getStatus(newId);
    }
  };

  return (
    <div className="app-shell">
      <HeaderBar />
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
        <div>
          <div className="section-title">Test Control</div>
          <div style={{ color: 'var(--muted)' }}>Initiate and monitor Ryuzen Toron v2.5H+ TestOps runs.</div>
        </div>
        <RunButton onRun={onRun} disabled={loading} />
      </div>

      <div className="panel">
        <div className="section-title">Status</div>
        <StatusBubbles statuses={statusMap} keys={statusKeys} />
      </div>

      <div className="panel">
        <div className="section-title">Progress</div>
        <div className="progress-shell">
          <div className="progress-bar" style={{ width: `${progress || 0}%` }} />
        </div>
        {runId && (
          <div style={{ marginTop: '8px', color: 'var(--muted)' }}>
            Run ID: <strong>{runId}</strong> · <Link to={`/run/${runId}`}>view details</Link>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="section-title">Live Log Stream</div>
        <LiveLogStream logs={logs} />
      </div>

      <div className="panel">
        <div className="section-title">Summary</div>
        <TestResultSummary summary={summary} />
      </div>

      <TestHistoryTable />
      {loading && <LoadingOverlay message="Triggering full suite" />}
    </div>
  );
}

export default TestDashboard;
