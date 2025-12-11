import React from 'react';
import StatusBubbles from './StatusBubbles.jsx';

const TestRunCard = ({ onStart, phase, progress, runId, statuses, disabled }) => {
  const headline = {
    idle: 'Wave 2 | Secure AI Engine Bench',
    launching: 'Priming pipelines…',
    running: 'Executing orchestrated suites',
    finished: 'Run complete',
    error: 'Start failed'
  }[phase] || 'Wave 2 | Secure AI Engine Bench';

  return (
    <section className="panel primary-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">TestOps · Ryuzen</p>
          <h2 className="headline">{headline}</h2>
        </div>
        <button className="mega-button" onClick={onStart} disabled={disabled}>
          BEGIN TESTING
        </button>
      </div>
      <div className="panel-body grid-two">
        <div>
          <p className="label">Progress</p>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="progress-meta">{progress}%</div>
        </div>
        <div>
          <p className="label">Run ID</p>
          <div className="runid">{runId || 'awaiting launch'}</div>
        </div>
      </div>
      <div className="bubble-row">
        <StatusBubbles statuses={statuses} />
      </div>
    </section>
  );
};

export default TestRunCard;
