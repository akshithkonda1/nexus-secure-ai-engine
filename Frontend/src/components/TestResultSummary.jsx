import React from "react";

export default function TestResultSummary({ runId, summary }) {
  if (!summary) return null;

  const handleDownload = (type) => {
    if (!runId) return;
    const path = type === "html" ? `/tests/report/${runId}/html` : `/tests/report/${runId}/json`;
    window.open(path, "_blank");
  };

  const handleWarroom = () => {
    if (!runId) return;
    window.open(`/tests/warroom/${runId}`, "_blank");
  };

  return (
    <div className="card shadow-sm mt-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="mb-1">Run Complete</h4>
            <p className="text-muted mb-0">Run ID: {runId}</p>
          </div>
          <div className="btn-group">
            <button className="btn btn-primary" onClick={() => handleDownload("html")}>
              Download Report
            </button>
            <button className="btn btn-outline-secondary" onClick={() => handleDownload("json")}>
              View JSON
            </button>
            <button className="btn btn-outline-danger" onClick={handleWarroom}>
              Open WAR ROOM Logs
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <h6>Determinism Score</h6>
            <p className="fw-bold">{summary?.metrics?.determinism?.score ?? "n/a"}%</p>
          </div>
          <div className="col-md-4">
            <h6>Load Test p95</h6>
            <p className="fw-bold">{summary?.metrics?.load_test?.p95_latency_ms ?? "n/a"} ms</p>
          </div>
          <div className="col-md-4">
            <h6>Tier 1 Stability</h6>
            <p className="fw-bold">{summary?.metrics?.tier_stability?.tier1 ?? "n/a"}</p>
          </div>
        </div>
        <div className="mt-3">
          <h6>Confidence Distribution</h6>
          <pre className="bg-light p-2 border rounded">
            {JSON.stringify(summary?.metrics?.confidence_distribution || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
