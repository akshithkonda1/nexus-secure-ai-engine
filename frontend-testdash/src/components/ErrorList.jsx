import React from 'react';

export default function ErrorList({ errors = [] }) {
  if (!errors.length) {
    return <p role="status">No errors logged.</p>;
  }

  return (
    <div className="summary-item" aria-label="Error list">
      <table className="table">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Timestamp</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((err, idx) => (
            <tr key={idx}>
              <td>
                <span className={`badge ${err.severity === 'critical' ? 'err' : err.severity === 'warning' ? 'warn' : 'ok'}`}>
                  {err.severity}
                </span>
              </td>
              <td>{err.timestamp}</td>
              <td>{err.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
