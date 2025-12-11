import React from 'react';
import LiveLogStream from '../components/LiveLogStream.jsx';
import StatusBubbles from '../components/StatusBubbles.jsx';
import TestResultSummary from '../components/TestResultSummary.jsx';
import useTestRunner from '../hooks/useTestRunner.js';

const TestDashboard = () => {
  const { runId, status, logs, result, beginTests, isRunning } = useTestRunner();

  return (
    <section className="dashboard">
      <div className="controls">
        <button className="primary" onClick={beginTests} disabled={isRunning}>
          BEGIN TESTING
        </button>
        <div className="run-meta">
          <span className="label">Run ID:</span> {runId || 'None'}
        </div>
      </div>

      <StatusBubbles status={status} />

      <div className="panels">
        <LiveLogStream logs={logs} />
        <TestResultSummary result={result} status={status} />
      </div>
    </section>
  );
};

export default TestDashboard;
