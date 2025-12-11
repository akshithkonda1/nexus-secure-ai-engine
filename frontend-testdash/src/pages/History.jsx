import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRunStatus } from '../api/testAPI';
import TestRunCard from '../components/TestRunCard';

export default function History() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    // In a real system we'd fetch all runs; here we query a few synthetic ids deterministically.
    const demoRuns = ['latest', 'previous', 'baseline'];
    Promise.all(
      demoRuns.map(async (id) => {
        try {
          const data = await getRunStatus(id);
          return {
            id,
            status: data.status || 'unknown',
            started: data.started || 'n/a',
            duration: data.duration || 'n/a',
            report: data.report,
            snapshot: data.snapshot,
          };
        } catch (e) {
          return { id, status: 'unknown', started: 'n/a', duration: 'n/a' };
        }
      })
    ).then((rows) => setRuns(rows));
  }, []);

  return (
    <div>
      <h2>History</h2>
      <p>Review historical Toron test suite executions. Click a run to view the report or deep dive into details.</p>
      <div className="grid-2">
        {runs.map((run) => (
          <TestRunCard key={run.id} run={run} />
        ))}
      </div>
      <p>
        Need more history? Export logs from <code>backend/logs/master</code> or archive bundles for long-term storage.
        You can also jump directly to <Link to="/">the dashboard</Link> to start a new run.
      </p>
    </div>
  );
}
