import React from "react";

export default function ReportViewer({ htmlContent }) {
  if (!htmlContent) {
    return <p className="muted">Report not available yet.</p>;
  }
  return (
    <iframe
      title="HTML Report"
      className="report-frame"
      srcDoc={htmlContent}
      sandbox="allow-same-origin"
    />
  );
}
