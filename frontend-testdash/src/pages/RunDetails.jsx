import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRunStatus } from '../api/testAPI';
import ProgressBar from '../components/ProgressBar';
import LiveLogStream from '../components/LiveLogStream';
import useLiveLogs from '../hooks/useLiveLogs';

export default function RunDetails() {
  const { runId } = useParams();
  const [status, setStatus] = useState(null);
  const lines = useLiveLogs(runId);

  useEffect(() => {
    if (!runId) return undefined;
    const interval = setInterval(async () => {
      try {
        const s = await getRunStatus(runId);
        setStatus(s);
      } catch (e) {
        console.error(e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [runId]);

  return (
    <div>
      <h2>Run {runId}</h2>
      <section>
        <h3>Progress</h3>
        <ProgressBar progress={status?.progress ?? 0} />
        <p>Status: {status?.status || 'unknown'}</p>
        <p>Started: {status?.started || 'n/a'}</p>
        <p>Duration: {status?.duration || 'n/a'}</p>
      </section>
      <section>
        <h3>Artifacts</h3>
        <ul>
          <li>
            Snapshot: {status?.snapshot ? <a href={status.snapshot}>Download</a> : 'n/a'}
          </li>
          <li>
            HTML report: {status?.report ? <a href={status.report}>Open</a> : 'n/a'}
          </li>
          <li>
            Bundle: {status?.bundle ? <a href={status.bundle}>Download</a> : 'n/a'}
          </li>
        </ul>
      </section>
      <section>
        <h3>Live Logs</h3>
        <LiveLogStream lines={lines} />
      </section>
    </div>
  );
}
