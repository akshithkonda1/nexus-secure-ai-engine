import React from 'react';

const LiveLogStream = ({ logs }) => {
  return (
    <div className="panel log-stream">
      <header className="panel-header">Live Logs (SSE)</header>
      <div className="log-window">
        {logs.length === 0 && <div className="placeholder">Waiting for events...</div>}
        {logs.map((log, index) => (
          <div key={`${log.run_id}-${index}`} className="log-line">
            <span className="log-run">[{log.run_id}]</span> {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveLogStream;
