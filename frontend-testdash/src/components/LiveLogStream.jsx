import React, { useEffect, useRef } from 'react';

export default function LiveLogStream({ lines = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines]);

  return (
    <div className="live-log" aria-live="polite" aria-label="Live log stream">
      {lines.map((line, idx) => (
        <div key={idx} role="text">
          {line}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
