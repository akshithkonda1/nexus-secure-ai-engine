import React from 'react';
import LiveLogStream from '../components/LiveLogStream.jsx';
import StatusBubbles from '../components/StatusBubbles.jsx';
import TestResultSummary from '../components/TestResultSummary.jsx';
import TestRunCard from '../components/TestRunCard.jsx';
import { useTestRunner } from '../hooks/useTestRunner.js';

const TestDashboard = () => {
  const {
    start,
    runId,
    phase,
    progress,
    statuses,
    logs,
    determinismScore,
    latencyP95,
    warRoomErrors,
    snapshotUrl,
    downloadReport
  } = useTestRunner();

  const disabled = phase === 'running' || phase === 'launching';

  return (
    <div className="dashboard-grid">
      <div className="grid-left">
        <TestRunCard onStart={start} phase={phase} progress={progress} runId={runId} statuses={statuses} disabled={disabled} />
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">SSE · {runId ? `run ${runId}` : 'no run yet'}</p>
              <h3 className="headline">Live log stream</h3>
            </div>
          </div>
          <LiveLogStream logs={logs} />
        </section>
      </div>
      <div className="grid-right">
        <section className="panel secondary-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Subsystem map</p>
              <h3 className="headline">Execution flow</h3>
            </div>
          </div>
          <div className="panel-body">
            <StatusBubbles statuses={statuses} />
          </div>
        </section>
        <TestResultSummary
          determinismScore={determinismScore}
          latencyP95={latencyP95}
          warRoomErrors={warRoomErrors}
          snapshotUrl={snapshotUrl}
          onDownload={downloadReport}
        />
      </div>
    </div>
  );
};

export default TestDashboard;
