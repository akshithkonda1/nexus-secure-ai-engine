import { useEffect, useState } from 'react';
import { streamLogs } from '../api/testAPI';

export default function useLiveLogs(runId) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!runId) return undefined;
    const source = streamLogs(runId, (line) => {
      setLines((prev) => [...prev, line]);
    });
    return () => source.close();
  }, [runId]);

  return lines;
}
