import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStatus } from '../api/testAPI.js';

function TestHistoryTable() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('testRunHistory') || '[]');
    setHistory(stored);
  }, []);

  const refreshStatus = async (runId) => {
    try {
      const res = await fetchStatus(runId);
      setHistory((prev) => {
        const next = prev.map((item) =>
          item.run_id === runId ? { ...item, status: res.status || item.status } : item
        );
        localStorage.setItem('testRunHistory', JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="panel">
      <div className="section-title">Recent Test Runs</div>
      <table className="table-shell">
        <thead>
          <tr>
            <th>Run ID</th>
            <th>Timestamp</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {history.length === 0 && (
            <tr>
              <td colSpan="4">No history available.</td>
            </tr>
          )}
          {history.map((row) => (
            <tr key={row.run_id}>
              <td>{row.run_id}</td>
              <td>{new Date(row.timestamp).toLocaleString()}</td>
              <td>
                <span
                  className={`badge ${
                    row.status === 'pass'
                      ? 'success'
                      : row.status === 'fail'
                      ? 'error'
                      : 'pending'
                  }`}
                >
                  {row.status || 'pending'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link to={`/run/${row.run_id}`}>Details</Link>
                  <button className="btn secondary" onClick={() => refreshStatus(row.run_id)}>
                    refresh
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TestHistoryTable;
