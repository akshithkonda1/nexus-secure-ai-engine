import React from 'react';
import { Link } from 'react-router-dom';

export default function TestRunCard({ run }) {
  return (
    <div className="summary-item" aria-label={`Run ${run.id}`}>
      <div className="grid-2">
        <div>
          <strong>Run ID:</strong> {run.id}
        </div>
        <div>
          <strong>Status:</strong>{' '}
          <span className={`badge ${run.status === 'ok' ? 'ok' : run.status === 'failed' ? 'err' : 'warn'}`}>
            {run.status}
          </span>
        </div>
        <div>
          <strong>Started:</strong> {run.started}
        </div>
        <div>
          <strong>Duration:</strong> {run.duration}
        </div>
      </div>
      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Link className="badge ok" to={`/runs/${run.id}`} aria-label={`View details for run ${run.id}`}>
          Details
        </Link>
        {run.report && (
          <a className="badge warn" href={run.report} target="_blank" rel="noreferrer">
            Report
          </a>
        )}
        {run.snapshot && (
          <a className="badge warn" href={run.snapshot} target="_blank" rel="noreferrer">
            Snapshot
          </a>
        )}
      </div>
    </div>
  );
}
