import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import useTestRunner from '../hooks/useTestRunner.js';

function TestRunDetails() {
  const { runId } = useParams();
  const { actions } = useTestRunner();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await actions.getStatus(runId);
        const result = await actions.fetchResult(runId);
        setDetails({ ...res, ...result });
      } catch (err) {
        setError(err.message || 'Unable to load run details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [runId, actions]);

  const download = async () => {
    try {
      await actions.downloadBundle(runId);
      alert('Bundle download requested.');
    } catch (err) {
      alert(err.message || 'Unable to download bundle');
    }
  };

  return (
    <div className="app-shell">
      <HeaderBar />
      <div className="panel">
        <div className="section-title">Test Run Details</div>
        {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
        {details && (
          <div className="card-row">
            <div className="card">
              <h4>Run ID</h4>
              <div>{details.run_id || runId}</div>
            </div>
            <div className="card">
              <h4>Determinism Score</h4>
              <div>{details.determinism_score ?? '—'}</div>
            </div>
            <div className="card">
              <h4>p95 Latency</h4>
              <div>{details.p95_latency ?? '—'}</div>
            </div>
            <div className="card">
              <h4>Status</h4>
              <div>{details.status ?? '—'}</div>
            </div>
          </div>
        )}
        {details && (
          <div className="card-row" style={{ marginTop: '12px' }}>
            <div className="card">
              <h4>Snapshot Links</h4>
              <div>{details.snapshots ? JSON.stringify(details.snapshots) : '—'}</div>
            </div>
            <div className="card">
              <h4>WAR ROOM Logs</h4>
              <div className="war-room">{details.war_room_logs || '—'}</div>
            </div>
          </div>
        )}
        <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn" onClick={download}>Download Report Pack</button>
          <Link className="btn secondary" to={`/report/${runId}`}>
            View Report
          </Link>
          <Link className="btn secondary" to="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </div>
      {loading && <LoadingOverlay message="Loading run details" />}
    </div>
  );
}

export default TestRunDetails;
