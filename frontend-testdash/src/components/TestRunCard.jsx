import React from 'react';
import StatusBubbles from './StatusBubbles.jsx';
import LiveLogStream from './LiveLogStream.jsx';
import TestResultSummary from './TestResultSummary.jsx';

export default function TestRunCard({
  runId,
  progress,
  statuses,
  logs,
  summary,
  onDownload,
}) {
  return (
    <div className="card">
      <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, color: '#475569' }}>Run ID</p>
          <strong>{runId || 'Not started'}</strong>
        </div>
        <button className="download-btn" onClick={onDownload} disabled={!runId}>
          Download bundle
        </button>
      </div>
      <div className="progress" aria-label="overall progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <StatusBubbles statuses={statuses} />
      <LiveLogStream logs={logs} />
      <TestResultSummary summary={summary} />
    </div>
  );
}
