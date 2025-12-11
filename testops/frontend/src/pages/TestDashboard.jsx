import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LiveLogStream from '../components/LiveLogStream.jsx';
import StatusBubbles from '../components/StatusBubbles.jsx';
import TestResultSummary from '../components/TestResultSummary.jsx';
import { useTestRunner } from '../hooks/useTestRunner.js';
import { getBundle } from '../api/testOpsAPI.js';

const cardStyle = {
  background: '#0f172a',
  border: '1px solid #1f2937',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px'
};

const TestDashboard = () => {
  const navigate = useNavigate();
  const { start, phase, runId, progress, subsystems, logs, pushLog, summary, reportLink } = useTestRunner();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!runId) return;
    setDownloading(true);
    try {
      const blob = await getBundle(runId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `testops_${runId}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
    } finally {
      setDownloading(false);
    }
  }, [runId]);

  const headline = useMemo(() => {
    if (phase === 'running' || phase === 'streaming') return 'Running test pipeline';
    if (phase === 'finished') return 'Run complete';
    if (phase === 'error') return 'Issue starting run';
    return 'Ready to launch tests';
  }, [phase]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Wave 2 · DevOps</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{headline}</div>
          </div>
          <button
            onClick={start}
            disabled={phase === 'running' || phase === 'streaming'}
            style={{
              background: '#0ea5e9',
              border: 'none',
              color: '#0b0d12',
              fontWeight: 700,
              padding: '12px 18px',
              borderRadius: '10px',
              cursor: 'pointer',
              opacity: phase === 'running' || phase === 'streaming' ? 0.6 : 1
            }}
          >
            BEGIN TESTING
          </button>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>Subsystems</div>
            <StatusBubbles statuses={subsystems} />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8 }}>Progress</div>
            <div style={{ background: '#1f2937', borderRadius: 10, overflow: 'hidden', height: 12 }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #22d3ee, #0ea5e9)',
                  transition: 'width 0.4s ease'
                }}
              ></div>
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#cbd5e1' }}>{progress}%</div>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8' }}>
          Run ID: {runId || 'not started'}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>Live Log Stream</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>SSE · /tests/stream/{runId || '...'}</div>
        </div>
        <LiveLogStream runId={runId} logs={logs} onLog={pushLog} />
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>Outputs</div>
          {runId ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => navigate(`/report/${runId}`)}
                style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #334155',
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                View Report
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  background: '#0f172a',
                  color: '#7dd3fc',
                  border: '1px solid #334155',
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  opacity: downloading ? 0.6 : 1
                }}
              >
                {downloading ? 'Preparing...' : 'Download Bundle'}
              </button>
            </div>
          ) : null}
        </div>
        {reportLink ? (
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            Latest report: <Link to={`/report/${runId || 'latest'}`}>{reportLink}</Link>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>Reports will appear after completion.</div>
        )}
        <TestResultSummary summary={summary} />
      </div>
    </div>
  );
};

export default TestDashboard;
