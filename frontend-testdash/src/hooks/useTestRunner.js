import { useEffect, useRef, useState } from 'react';
import { downloadBundle, fetchResult, startRun, streamRun } from '../api/testAPI';

const INITIAL_STATUSES = {
  sim: 'pending',
  engine_hardening: 'pending',
  cloud_hardening: 'pending',
  security_hardening: 'pending',
  load_and_chaos: 'pending',
  replay: 'pending',
  beta_readiness: 'pending',
  public_beta: 'pending',
};

export function useTestRunner() {
  const [runId, setRunId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [statuses, setStatuses] = useState(INITIAL_STATUSES);
  const [summary, setSummary] = useState({});
  const sourceRef = useRef(null);

  const begin = async () => {
    const { run_id } = await startRun();
    setRunId(run_id);
    setProgress(0);
    setStatuses(INITIAL_STATUSES);
    setLogs([]);
    const src = streamRun(run_id, (evt) => {
      setProgress(evt.progress);
      setLogs((prev) => [...prev.slice(-500), `${evt.timestamp} [${evt.module}] ${evt.message}`]);
      if (evt.module && evt.module !== 'heartbeat') {
        setStatuses((prev) => ({ ...prev, [evt.module]: evt.status.toLowerCase() }));
      }
    });
    sourceRef.current = src;
  };

  const loadSummary = async () => {
    if (!runId) return;
    const result = await fetchResult(runId);
    setSummary(result);
  };

  const download = () => runId && downloadBundle(runId);

  useEffect(() => {
    return () => {
      if (sourceRef.current) sourceRef.current.close();
    };
  }, []);

  return { runId, progress, logs, statuses, summary, begin, loadSummary, download };
}
