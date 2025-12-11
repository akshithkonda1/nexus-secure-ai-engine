import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import useTestRunner from '../hooks/useTestRunner.js';

function ReportViewer() {
  const { runId } = useParams();
  const { actions } = useTestRunner();
  const [reportHtml, setReportHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await actions.fetchReport(runId);
        setReportHtml(res);
      } catch (err) {
        setError(err.message || 'Unable to load report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [runId, actions]);

  return (
    <div className="app-shell">
      <HeaderBar />
      <div className="panel">
        <div className="section-title">Report Viewer</div>
        {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
        {!error && (
          <div
            style={{ background: '#0b1221', borderRadius: '10px', padding: '12px', minHeight: '200px' }}
            dangerouslySetInnerHTML={{ __html: reportHtml }}
          />
        )}
        <div style={{ marginTop: '12px' }}>
          <Link className="btn secondary" to={`/run/${runId}`}>
            Back to Run Details
          </Link>
        </div>
      </div>
      {loading && <LoadingOverlay message="Loading report" />}
    </div>
  );
}

export default ReportViewer;
