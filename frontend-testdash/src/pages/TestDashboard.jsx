import React, { useEffect, useState } from 'react';
import TestRunCard from '../components/TestRunCard.jsx';
import { useTestRunner } from '../hooks/useTestRunner.js';

export default function TestDashboard() {
  const [phrase, setPhrase] = useState('');
  const { runId, progress, logs, statuses, summary, begin, loadSummary, download } = useTestRunner();

  const canStart = phrase === 'Begin testing';

  useEffect(() => {
    if (runId) {
      const timer = setInterval(loadSummary, 1500);
      return () => clearInterval(timer);
    }
  }, [runId, loadSummary]);

  return (
    <div className="page">
      <div className="hero">
        <div>
          <h1>Ryuzen TestOps</h1>
          <small>Toron v2.5H+ orchestration · SIM · Hardening · Chaos · Readiness</small>
        </div>
        <div className="begin-input">
          <input
            aria-label="Begin testing"
            placeholder="Type: Begin testing"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
          />
          <button onClick={begin} disabled={!canStart}>
            Start
          </button>
        </div>
      </div>

      <TestRunCard
        runId={runId}
        progress={progress}
        statuses={statuses}
        logs={logs}
        summary={summary}
        onDownload={download}
      />
    </div>
  );
}
