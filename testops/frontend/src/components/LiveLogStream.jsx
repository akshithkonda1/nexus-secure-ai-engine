import React, { useEffect, useRef } from 'react';

const LiveLogStream = ({ logs }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="log-window" ref={scrollRef}>
      {logs.length === 0 ? <div className="placeholder">Awaiting stream…</div> : null}
      {logs.map((line, idx) => (
        <div className="log-line" key={`${idx}-${line.slice(0, 8)}`}>
          {line}
        </div>
      ))}
    </div>
  );
};

export default LiveLogStream;
