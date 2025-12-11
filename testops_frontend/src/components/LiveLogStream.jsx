import React from 'react'

export default function LiveLogStream({ logs }) {
  return (
    <div className="log-stream">
      <div className="log-header">Live Log Console</div>
      <pre className="log-body">
        {logs.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </pre>
    </div>
  )
}
