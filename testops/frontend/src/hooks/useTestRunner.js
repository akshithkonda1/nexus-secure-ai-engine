import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getStatus, startTest } from '../api/testOpsAPI.js';

const defaultSubsystems = () => ({
  sim: 'idle',
  engine: 'idle',
  load: 'idle',
  replay: 'idle'
});

export function useTestRunner() {
  const [phase, setPhase] = useState('idle');
  const [runId, setRunId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [subsystems, setSubsystems] = useState(defaultSubsystems);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [reportLink, setReportLink] = useState(null);
  const pollTimer = useRef(null);

  const reset = () => {
    setPhase('idle');
    setRunId(null);
    setProgress(0);
    setSubsystems(defaultSubsystems());
    setLogs([]);
    setSummary(null);
    setReportLink(null);
  };

  const updateFromStatus = useCallback((payload) => {
    const { status, subsystems: subs = {}, progress: pct, summary: sum, report_url: reportUrl } = payload || {};
    setSubsystems((prev) => ({ ...prev, ...subs }));
    if (typeof pct === 'number') setProgress(Math.min(100, Math.max(0, pct)));
    if (sum) setSummary(sum);
    if (reportUrl) setReportLink(reportUrl);
    if (status === 'completed' || status === 'failed') {
      setPhase('finished');
      setProgress((prev) => (prev < 100 ? 100 : prev));
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    }
  }, []);

  const pollStatus = useCallback(
    async (activeRunId) => {
      try {
        const payload = await getStatus(activeRunId);
        updateFromStatus(payload);
      } catch (error) {
        console.error('Status polling failed', error);
      }
    },
    [updateFromStatus]
  );

  const startPolling = useCallback(
    (activeRunId) => {
      if (pollTimer.current) clearInterval(pollTimer.current);
      pollTimer.current = setInterval(() => pollStatus(activeRunId), 4000);
    },
    [pollStatus]
  );

  const start = useCallback(async () => {
    reset();
    setPhase('running');
    try {
      const payload = await startTest();
      const newRunId = payload.run_id || payload.runId;
      setRunId(newRunId);
      setPhase('streaming');
      setProgress(5);
      pollStatus(newRunId);
      startPolling(newRunId);
    } catch (error) {
      console.error('Unable to start tests', error);
      setPhase('error');
    }
  }, [pollStatus, startPolling]);

  const pushLog = useCallback((entry) => {
    setLogs((prev) => [...prev.slice(-999), entry]);
  }, []);

  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    };
  }, []);

  const state = useMemo(
    () => ({
      phase,
      runId,
      progress,
      subsystems,
      logs,
      summary,
      reportLink
    }),
    [logs, phase, progress, reportLink, runId, subsystems, summary]
  );

  return {
    ...state,
    start,
    pushLog,
    reset,
    pollStatus
  };
}
