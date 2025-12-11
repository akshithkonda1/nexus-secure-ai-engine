import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getResult, getStatus, runAllTests } from '../api/testAPI.js';

const initialStatus = {
  sim_suite: { state: 'pending' },
  engine_validation: { state: 'pending' },
  replay_determinism: { state: 'pending' },
  load_test: { state: 'pending' },
};

const useTestRunner = () => {
  const [runId, setRunId] = useState(null);
  const [status, setStatus] = useState(initialStatus);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const resetState = useCallback(() => {
    setStatus(initialStatus);
    setLogs([]);
    setResults({});
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const hydrateStatus = useCallback((payload) => {
    if (!payload) return;
    setStatus((prev) => ({
      ...prev,
      ...Object.keys(initialStatus).reduce((acc, key) => {
        acc[key] = payload[key] || prev[key] || { state: 'pending' };
        return acc;
      }, {}),
    }));
  }, []);

  const pollStatuses = useCallback(
    (id) => {
      if (!id) return;
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const next = await getStatus(id);
          hydrateStatus(next?.status || next);
          if (next?.completed) {
            clearInterval(pollRef.current);
            pollRef.current = null;
            const finalResult = await getResult(id);
            setResults(finalResult || {});
          }
        } catch (err) {
          console.error('Status polling error', err);
        }
      }, 2500);
    },
    [hydrateStatus]
  );

  const runTests = useCallback(async () => {
    try {
      setLoading(true);
      resetState();
      const response = await runAllTests();
      const newRunId = response.run_id || response.id || response.runId;
      setRunId(newRunId);
      hydrateStatus({
        sim_suite: { state: 'running', startedAt: new Date().toISOString() },
        engine_validation: { state: 'running', startedAt: new Date().toISOString() },
        replay_determinism: { state: 'running', startedAt: new Date().toISOString() },
        load_test: { state: 'running', startedAt: new Date().toISOString() },
      });
      pollStatuses(newRunId);
    } catch (err) {
      console.error('Failed to start tests', err);
      setStatus((prev) => ({
        ...prev,
        sim_suite: { state: 'error' },
        engine_validation: { state: 'error' },
        replay_determinism: { state: 'error' },
        load_test: { state: 'error' },
      }));
    } finally {
      setLoading(false);
    }
  }, [hydrateStatus, pollStatuses, resetState]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const appendLog = useCallback((entry) => {
    setLogs((prev) => [...prev, entry]);
  }, []);

  const loadingFlags = useMemo(
    () => ({
      loading,
      hasRun: Boolean(runId),
    }),
    [loading, runId]
  );

  return {
    runId,
    runTests,
    status,
    logs,
    results,
    appendLog,
    loading: loadingFlags,
  };
};

export default useTestRunner;
