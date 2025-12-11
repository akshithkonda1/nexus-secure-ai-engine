import React, { useEffect, useRef } from 'react';

const containerStyle = {
  background: '#0f172a',
  border: '1px solid #1f2937',
  borderRadius: '12px',
  padding: '12px',
  height: '240px',
  overflow: 'auto',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '13px',
  lineHeight: 1.5
};

const LiveLogStream = ({ runId, logs = [], onLog }) => {
  const scrollRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!runId) return undefined;

    const url = `${window.location.origin}/tests/stream/${runId}`;
    const es = new EventSource(url);
    sourceRef.current = es;

    es.onmessage = (event) => {
      const line = event.data;
      if (onLog) onLog(line);
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      sourceRef.current = null;
    };
  }, [runId, onLog]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div style={containerStyle} ref={scrollRef}>
      {logs.length === 0 ? <div style={{ color: '#64748b' }}>Awaiting stream...</div> : null}
      {logs.map((line, idx) => (
        <div key={`${idx}-${line.slice(0, 6)}`} style={{ whiteSpace: 'pre-wrap' }}>
          {line}
        </div>
      ))}
    </div>
  );
};

export default LiveLogStream;
