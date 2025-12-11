import React, { useEffect, useRef, useState } from 'react';
import { getStreamURL } from '../api/testAPI.js';

const LiveLogStream = ({ runId, logs = [], onLog }) => {
  const [streamLogs, setStreamLogs] = useState(logs);
  const logRef = useRef(null);

  useEffect(() => {
    setStreamLogs(logs);
  }, [logs]);

  useEffect(() => {
    if (!runId) return undefined;
    const source = new EventSource(getStreamURL(runId));

    source.onmessage = (event) => {
      setStreamLogs((prev) => [...prev, event.data]);
      if (onLog) onLog(event.data);
    };

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [runId, onLog]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [streamLogs]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 600 }}>Live Log Stream</div>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>{runId ? `Run: ${runId}` : 'Awaiting launch'}</span>
      </div>
      <div
        ref={logRef}
        style={{
          background: '#050816',
          borderRadius: 12,
          border: '1px solid rgba(111,124,255,0.2)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35), 0 0 12px rgba(111,124,255,0.25)',
          minHeight: 200,
          maxHeight: 320,
          overflowY: 'auto',
          padding: 12,
          fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          color: '#5cffb7',
          textShadow: '0 0 8px rgba(92,255,183,0.4)',
        }}
      >
        {streamLogs.length === 0 && <div style={{ opacity: 0.6 }}>No telemetry yet. Ignite the suite.</div>}
        {streamLogs.map((line, idx) => (
          <div key={`${idx}-${line.slice(0, 8)}`}>{line}</div>
        ))}
      </div>
    </div>
  );
};

export default LiveLogStream;
