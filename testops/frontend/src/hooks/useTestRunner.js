import { useEffect, useRef, useState } from 'react';
import { createLogStream, fetchStatus, runAllTests, validateEngine } from '../api/testOpsAPI.js';

const useTestRunner = () => {
  const [runId, setRunId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!runId) return;
    const interval = setInterval(async () => {
      try {
        const latest = await fetchStatus(runId);
        setStatus(latest.status);
        setResult(latest.result);
        if (latest.status === 'completed' || latest.status === 'failed') {
          clearInterval(interval);
          setIsRunning(false);
        }
      } catch (error) {
        console.error(error);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [runId]);

  const beginTests = async () => {
    setLogs([]);
    setStatus('pending');
    setResult(null);
    setIsRunning(true);
    try {
      await validateEngine();
      const response = await runAllTests();
      setRunId(response.run_id);
      setStatus('running');
      const stream = createLogStream(response.run_id);
      stream.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.message) {
            setLogs((prev) => [...prev, payload]);
          }
        } catch (err) {
          console.error('Failed to parse log event', err);
        }
      };
      stream.onerror = () => {
        stream.close();
      };
      streamRef.current = stream;
    } catch (error) {
      console.error(error);
      setStatus('failed');
      setIsRunning(false);
    }
  };

  return { runId, status, logs, result, beginTests, isRunning };
};

export default useTestRunner;
