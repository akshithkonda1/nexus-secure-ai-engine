import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getReport, getStatus } from '../api/testAPI.js';

const cardStyle = {
  background: '#0f172a',
  border: '1px solid #1f2937',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16
};

const ReportViewer = () => {
  const { runId } = useParams();
  const [html, setHtml] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!runId) return;
      setLoading(true);
      setError(null);
      try {
        const [reportPayload, statusPayload] = await Promise.all([getReport(runId), getStatus(runId)]);
        const reportHtml = reportPayload instanceof Blob ? await reportPayload.text() : reportPayload;
        setHtml(reportHtml);
        setSummary(statusPayload.summary || statusPayload.report_summary || null);
      } catch (err) {
        setError('Unable to load report');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [runId]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Run</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{runId}</div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{loading ? 'Loading…' : 'Report view'}</div>
        </div>
        {error ? <div style={{ color: '#f87171' }}>{error}</div> : null}
      </div>
      <div style={cardStyle}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>JSON Summary</div>
        <pre style={{ background: '#0b1220', padding: 12, borderRadius: 8, overflow: 'auto' }}>
          {summary ? JSON.stringify(summary, null, 2) : 'No summary available.'}
        </pre>
      </div>
      <div style={{ ...cardStyle, minHeight: 240 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>HTML Report</div>
        <div
          style={{ background: '#0b1220', padding: 12, borderRadius: 8, overflow: 'auto' }}
          dangerouslySetInnerHTML={{ __html: html || '<p style="color:#94a3b8">No report available.</p>' }}
        ></div>
      </div>
    </div>
  );
};

export default ReportViewer;
