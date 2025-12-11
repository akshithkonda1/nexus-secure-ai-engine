import React from 'react';

export default function ReportViewer({ html }) {
  if (!html) {
    return <p role="note">No report available yet.</p>;
  }

  return (
    <div className="summary-item" aria-label="HTML report preview">
      <div
        style={{
          background: '#0c1018',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px',
          maxHeight: '280px',
          overflow: 'auto',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
