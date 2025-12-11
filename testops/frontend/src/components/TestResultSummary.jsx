import React from 'react';

const TestResultSummary = ({ determinismScore, latencyP95, warRoomErrors = [], snapshotUrl, onDownload }) => {
  return (
    <section className="panel result-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Post-run analytics</p>
          <h3 className="headline">Signal summary</h3>
        </div>
        <button className="ghost-button" onClick={onDownload} disabled={!onDownload}>
          Download Report Pack
        </button>
      </div>
      <div className="panel-body grid-two">
        <div>
          <p className="label">Determinism score</p>
          <div className="metric">{determinismScore ?? 'pending'}</div>
        </div>
        <div>
          <p className="label">p95 latency</p>
          <div className="metric">{latencyP95 ?? 'pending'}</div>
        </div>
      </div>
      <div className="panel-body grid-two">
        <div>
          <p className="label">WAR ROOM errors</p>
          {warRoomErrors.length === 0 ? (
            <div className="placeholder">No escalations captured.</div>
          ) : (
            <ul className="error-list">
              {warRoomErrors.map((item, idx) => (
                <li key={`${idx}-${item.slice(0, 10)}`}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="label">Snapshot viewer</p>
          {snapshotUrl ? (
            <div className="snapshot-frame">
              <img src={snapshotUrl} alt="snapshot" />
            </div>
          ) : (
            <div className="placeholder">Snapshot will appear after completion.</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestResultSummary;
