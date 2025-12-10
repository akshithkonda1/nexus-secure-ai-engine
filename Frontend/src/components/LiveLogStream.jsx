import React, { useEffect, useRef, useState } from "react";

export default function LiveLogStream({ runId, onProgress, onComplete }) {
  const [logs, setLogs] = useState([]);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (!runId) return () => {};

    const source = new EventSource(`/tests/status/${runId}`);
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.summary) {
          onComplete && onComplete(payload.summary);
        }
        if (payload?.message || payload?.details) {
          const logLine = payload.message || JSON.stringify(payload.details);
          setLogs((current) => [...current, logLine]);
        }
        if (onProgress) {
          onProgress(payload);
        }
      } catch (err) {
        setLogs((current) => [...current, event.data]);
      }
    };

    source.onerror = () => {
      setLogs((current) => [...current, "Connection lost"]);
      source.close();
    };

    return () => {
      source.close();
    };
  }, [runId, onProgress, onComplete]);

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title">Live WAR ROOM Console</h5>
        <div
          className="bg-dark text-success p-2"
          style={{ height: "220px", overflowY: "auto", fontFamily: "monospace" }}
        >
          {logs.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
