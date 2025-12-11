import React, { useEffect, useRef } from 'react';

function LiveLogStream({ logs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="log-stream" ref={containerRef}>
      {logs.length === 0 ? 'Awaiting logs…' : logs.join('\n')}
    </div>
  );
}

export default LiveLogStream;
