import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getReport, getSnapshot, getStatus, startTests, streamLogs } from '../api/testAPI.js';

const bubblesTemplate = {
  simSuite: 'idle',
  loadTest: 'idle',
  replay: 'idle',
  engineValidation: 'idle'
};

const orderedStages = ['simSuite', 'loadTest', 'replay', 'engineValidation'];

export function useTestRunner() {
  const [runId, setRunId] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [statuses, setStatuses] = useState({ ...bubblesTemplate });
  const [logs, setLogs] = useState([]);
  const [warRoomErrors, setWarRoomErrors] = useState([]);
  const [determinismScore, setDeterminismScore] = useState(null);
  const [latencyP95, setLatencyP95] = useState(null);
  const [snapshotUrl, setSnapshotUrl] = useState(null);
  const logSourceRef = useRef(null);
  const pollTimerRef = useRef(null);

  const reset = useCallback(() => {
    setRunId(null);
    setPhase('idle');
    setProgress(0);
    setStatuses({ ...bubblesTemplate });
    setLogs([]);
    setWarRoomErrors([]);
    setDeterminismScore(null);
    setLatencyP95(null);
    setSnapshotUrl(null);
  }, []);

  const deriveProgress = useCallback((payload) => {
    if (typeof payload?.progress === 'number') return Math.min(100, Math.max(0, payload.progress));
    const stageKey = payload?.phase || payload?.stage;
    const idx = orderedStages.findIndex((item) => item === stageKey);
    if (idx === -1) return progress;
    return Math.round(((idx + 1) / orderedStages.length) * 100);
  }, [progress]);

  const deriveBubbles = useCallback((payload) => {
    const next = { ...bubblesTemplate };
    const stageKey = payload?.phase || payload?.stage;
    const terminal = payload?.status === 'failed' ? 'failed' : payload?.status === 'completed' ? 'done' : null;
    orderedStages.forEach((key, index) => {
      if (terminal === 'done') {
        next[key] = 'done';
        return;
      }
      if (terminal === 'failed' && key === stageKey) {
        next[key] = 'failed';
        return;
      }
      if (stageKey && orderedStages.indexOf(stageKey) > index) {
        next[key] = 'done';
      } else if (stageKey === key) {
        next[key] = payload?.status === 'failed' ? 'failed' : 'running';
      }
    });
    const provided = payload?.subsystems || payload?.bubbles;
    if (provided) {
      Object.keys(provided).forEach((k) => {
        if (next[k] !== undefined) next[k] = provided[k];
      });
    }
    return next;
  }, []);

  const updateMetrics = useCallback((payload) => {
    if (!payload) return;
    const metrics = payload.metrics || payload.summary || {};
    if (metrics.determinism_score !== undefined) setDeterminismScore(metrics.determinism_score);
    if (metrics.latency_p95 !== undefined) setLatencyP95(metrics.latency_p95);
    if (metrics.p95_latency !== undefined) setLatencyP95(metrics.p95_latency);
    if (Array.isArray(payload.war_room_errors)) setWarRoomErrors(payload.war_room_errors);
    if (metrics.war_room_errors) setWarRoomErrors(metrics.war_room_errors);
    if (payload.snapshot_url) setSnapshotUrl(payload.snapshot_url);
    if (metrics.snapshot_url) setSnapshotUrl(metrics.snapshot_url);
  }, []);

  const pollStatus = useCallback(
    async (activeRunId) => {
      if (!activeRunId) return;
      try {
        const payload = await getStatus(activeRunId);
        setProgress(deriveProgress(payload));
        setStatuses(deriveBubbles(payload));
        updateMetrics(payload);
        if (payload.status === 'completed' || payload.status === 'failed') {
          setPhase('finished');
          setProgress((prev) => (prev < 100 ? 100 : prev));
          clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
      } catch (error) {
        console.error('Status polling failed', error);
      }
    },
    [deriveBubbles, deriveProgress, updateMetrics]
  );

  const beginPolling = useCallback(
    (activeRunId) => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(() => pollStatus(activeRunId), 3500);
    },
    [pollStatus]
  );

  const start = useCallback(async () => {
    reset();
    setPhase('launching');
    try {
      const payload = await startTests();
      const newRunId = payload.run_id || payload.runId;
      setRunId(newRunId);
      setPhase('running');
      setProgress(5);
      pollStatus(newRunId);
      beginPolling(newRunId);
      window.localStorage.setItem('testops:lastRunId', newRunId);
    } catch (error) {
      console.error('Unable to start tests', error);
      setPhase('error');
    }
  }, [beginPolling, pollStatus, reset]);

  const pushLog = useCallback((line) => {
    setLogs((prev) => [...prev.slice(-999), line]);
  }, []);

  useEffect(() => {
    if (!runId) return undefined;
    const source = streamLogs(runId);
    logSourceRef.current = source;
    source.onmessage = (event) => pushLog(event.data);
    source.onerror = () => source.close();
    return () => {
      source.close();
      logSourceRef.current = null;
    };
  }, [pushLog, runId]);

  useEffect(() => {
    if (phase !== 'finished' || !runId) return;
    const hydrate = async () => {
      try {
        const snapshot = await getSnapshot(runId);
        if (snapshot?.image_url || snapshot?.url) {
          setSnapshotUrl(snapshot.image_url || snapshot.url);
        } else if (snapshot?.data) {
          setSnapshotUrl(snapshot.data);
        }
      } catch (error) {
        console.warn('Unable to fetch snapshot', error);
      }
    };
    hydrate();
  }, [phase, runId]);

  useEffect(() => () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (logSourceRef.current) logSourceRef.current.close();
  }, []);

  const downloadReport = useCallback(
    async () => {
      if (!runId) return;
      const blob = await getReport(runId);
      const fileBlob = blob instanceof Blob ? blob : new Blob([blob], { type: 'text/html' });
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `testops-report-${runId}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    [runId]
  );

  const state = useMemo(
    () => ({
      runId,
      phase,
      progress,
      statuses,
      logs,
      determinismScore,
      latencyP95,
      warRoomErrors,
      snapshotUrl
    }),
    [latencyP95, logs, phase, progress, runId, snapshotUrl, statuses, warRoomErrors, determinismScore]
  );

  return {
    ...state,
    start,
    pushLog,
    reset,
    downloadReport
  };
}
