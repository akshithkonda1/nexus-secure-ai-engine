import React from 'react';
import useTestRunner from '../hooks/useTestRunner.js';
import StatusBubbles from '../components/StatusBubbles.jsx';
import LiveLogStream from '../components/LiveLogStream.jsx';
import TestResultSummary from '../components/TestResultSummary.jsx';
import TestRunCard from '../components/TestRunCard.jsx';

const testRuns = [
  { key: 'sim_suite', title: 'SIM Suite' },
  { key: 'engine_validation', title: 'Engine Validation' },
  { key: 'replay_determinism', title: 'Replay Determinism' },
  { key: 'load_test', title: 'Load Test' },
];

const TestDashboard = () => {
  const { runTests, runId, status, logs, results, appendLog, loading: loadingFlags } = useTestRunner();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="glass-panel" style={{ padding: 24, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          <h2 style={{ margin: 0, letterSpacing: '0.06em' }}>Mission Console</h2>
          <p style={{ marginTop: 6, opacity: 0.78 }}>
            Initiate full-suite validation across the Ryuzen epistemic engine. Watch live telemetry and capture contradictions
            in-flight.
          </p>
          <button
            onClick={runTests}
            disabled={loadingFlags.loading}
            style={{
              marginTop: 18,
              padding: '18px 28px',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#0a0f1f',
              background: loadingFlags.loading
                ? 'linear-gradient(135deg, rgba(111,124,255,0.6), rgba(98,0,234,0.5))'
                : 'linear-gradient(135deg, #6f7cff, #62e0ff)',
              border: 'none',
              borderRadius: 14,
              cursor: loadingFlags.loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 12px 40px rgba(111,124,255,0.35), 0 0 20px rgba(98,0,234,0.5)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            className="neon-text"
          >
            {loadingFlags.loading ? 'ARMING...' : 'BEGIN TESTING'}
          </button>
        </div>
        <div>
          <StatusBubbles status={status} />
        </div>
      </div>

      <div className="card-grid">
        {testRuns.map((run) => (
          <TestRunCard
            key={run.key}
            title={run.title}
            status={status[run.key]?.state || 'idle'}
            startedAt={status[run.key]?.startedAt}
            endedAt={status[run.key]?.endedAt}
          />
        ))}
      </div>

      <div className="glass-panel" style={{ padding: 18 }}>
        <LiveLogStream runId={runId} logs={logs} onLog={appendLog} />
      </div>

      <TestResultSummary results={results} />
    </div>
  );
};

export default TestDashboard;
