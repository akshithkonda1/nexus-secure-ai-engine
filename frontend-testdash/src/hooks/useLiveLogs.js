import { useEffect, useRef } from "react";
import { streamLogs } from "../api/testAPI";

export default function useLiveLogs(runId, onMessage) {
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!runId) return undefined;
    sourceRef.current = streamLogs(runId, onMessage);
    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
      }
    };
  }, [runId, onMessage]);
}
