import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  beginSession,
  checkEngineHealth,
  downloadBundle,
  fetchReport,
  fetchResult,
  fetchStatus,
  startRunAll,
  streamLogs,
} from '../api/testAPI.js';

const STATUS_KEYS = ['SIM', 'ENGINE', 'REPLAY', 'LOAD'];

export default function useTestRunner() {
  const [runId, setRunId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMap, setStatusMap] = useState({});
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const logStream = useRef(null);

  const updateHistory = useCallback((entry) => {
    const current = JSON.parse(localStorage.getItem('testRunHistory') || '[]');
    const next = [entry, ...current].slice(0, 20);
    localStorage.setItem('testRunHistory', JSON.stringify(next));
  }, []);

  const begin = useCallback(async () => {
    setLoading(true);
    try {
      await checkEngineHealth();
      await beginSession();
    } finally {
      setLoading(false);
    }
  }, []);

  const runAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await startRunAll();
      const newRunId = res.run_id || res.id || res.runId;
      setRunId(newRunId);
      setProgress(0);
      setStatusMap({});
      setLogs([]);
      updateHistory({
        run_id: newRunId,
        timestamp: new Date().toISOString(),
        status: 'pending',
      });
      return newRunId;
    } finally {
      setLoading(false);
    }
  }, [updateHistory]);

  const getStatus = useCallback(
    async (id) => {
      const targetId = id || runId;
      if (!targetId) return null;
      const res = await fetchStatus(targetId);
      if (res.progress !== undefined) setProgress(res.progress);
      if (res.statuses) setStatusMap(res.statuses);
      if (res.summary) setSummary(res.summary);
      if (res.run_id) setRunId(res.run_id);
      if (res.status) {
        updateHistory({
          run_id: targetId,
          timestamp: new Date().toISOString(),
          status: res.status,
        });
      }
      return res;
    },
    [runId, updateHistory]
  );

  const listenToLogs = useCallback(
    (id) => {
      const targetId = id || runId;
      if (!targetId) return null;
      if (logStream.current) {
        logStream.current.close();
      }
      const source = streamLogs(targetId);
      logStream.current = source;
      source.onmessage = (event) => {
        setLogs((prev) => [...prev, event.data]);
      };
      source.onerror = () => {
        source.close();
      };
      return source;
    },
    [runId]
  );

  const stopLogs = useCallback(() => {
    if (logStream.current) {
      logStream.current.close();
      logStream.current = null;
    }
  }, []);

  const actions = useMemo(
    () => ({ begin, runAll, getStatus, listenToLogs, stopLogs, fetchResult, fetchReport, downloadBundle }),
    [begin, runAll, getStatus, listenToLogs, stopLogs]
  );

  useEffect(() => () => stopLogs(), [stopLogs]);

  return {
    runId,
    progress,
    statusMap,
    logs,
    summary,
    loading,
    actions,
    statusKeys: STATUS_KEYS,
  };
}
