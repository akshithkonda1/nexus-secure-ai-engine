import React from 'react';

const TestResultSummary = ({ result, status }) => {
  const assertions = result?.assertions || [];
  const metrics = result?.metrics || {};
  const responses = metrics.responses || [];

  return (
    <div className="panel summary">
      <header className="panel-header">Test Result Summary</header>
      <div className="panel-body">
        <div className="summary-row">
          <span className="label">Current Status:</span> {status}
        </div>
        <div className="summary-row">
          <span className="label">Total Steps:</span> {responses.length}
        </div>
        <div className="summary-row">
          <span className="label">Assertions:</span>
        </div>
        <ul className="assertion-list">
          {assertions.map((assertion) => (
            <li key={assertion.name} className={assertion.status ? 'pass' : 'fail'}>
              <span>{assertion.name}</span>
              <span className="detail">Observed: {assertion.observed_ms} ms</span>
              {assertion.threshold_ms && <span className="detail">Threshold: {assertion.threshold_ms} ms</span>}
            </li>
          ))}
          {assertions.length === 0 && <li className="placeholder">No assertions yet.</li>}
        </ul>
      </div>
    </div>
  );
};

export default TestResultSummary;
