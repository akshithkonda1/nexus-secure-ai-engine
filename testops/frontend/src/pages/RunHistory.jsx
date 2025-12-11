import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatus } from '../api/testAPI.js';

const headerStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr',
  padding: '8px 12px',
  color: '#94a3b8',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.08em'
};

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr',
  padding: '10px 12px',
  borderBottom: '1px solid #1f2937'
};

const RunHistory = () => {
  const [runId, setRunId] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('testops:lastRunId');
    if (stored) setRunId(stored);
  }, []);

  const loadStatus = async () => {
    if (!runId) return;
    setLoading(true);
    setError(null);
    try {
      const payload = await getStatus(runId);
      const record = {
        run_id: runId,
        status: payload.status,
        started_at: payload.started_at || payload.created_at,
        finished_at: payload.finished_at || payload.completed_at,
        report_url: payload.report_url || `/report/${runId}`
      };
      setRows((prev) => {
        const existing = prev.filter((r) => r.run_id !== runId);
        return [record, ...existing].slice(0, 20);
      });
      window.localStorage.setItem('testops:lastRunId', runId);
    } catch (err) {
      setError('Unable to load status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1f2937', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Run History</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Lookup run status</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Enter run id"
            value={runId}
            onChange={(e) => setRunId(e.target.value)}
            style={{
              background: '#0b1220',
              border: '1px solid #334155',
              color: '#e2e8f0',
              padding: '10px 12px',
              borderRadius: 8
            }}
          />
          <button
            onClick={loadStatus}
            disabled={!runId}
            style={{
              background: '#0ea5e9',
              border: 'none',
              color: '#0b0d12',
              fontWeight: 700,
              padding: '10px 14px',
              borderRadius: 8,
              cursor: 'pointer',
              opacity: !runId || loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading…' : 'Fetch'}
          </button>
        </div>
      </div>
      {error ? <div style={{ color: '#f87171', marginBottom: 12 }}>{error}</div> : null}
      <div style={{ border: '1px solid #1f2937', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ ...headerStyle, background: '#0b1220' }}>
          <div>Run ID</div>
          <div>Started</div>
          <div>Finished</div>
          <div>Status</div>
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 12, color: '#94a3b8' }}>No runs loaded yet.</div>
        ) : (
          rows.map((row) => (
            <div key={row.run_id} style={rowStyle}>
              <div>
                <Link to={`/report/${row.run_id}`} style={{ color: '#7dd3fc' }}>
                  {row.run_id}
                </Link>
              </div>
              <div>{row.started_at || '—'}</div>
              <div>{row.finished_at || '—'}</div>
              <div style={{ fontWeight: 600 }}>{row.status || 'unknown'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RunHistory;
