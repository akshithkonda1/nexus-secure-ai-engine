import React from "react";

const statusColor = (status) => {
  if (status === "completed") return "bg-success";
  if (status === "failed") return "bg-danger";
  return "bg-primary";
};

export default function TestRunCard({ title, description, percent, status }) {
  const progress = Math.min(Math.max(percent || 0, 0), 100);
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-1">{title}</h5>
            <p className="text-muted mb-2 small">{description}</p>
          </div>
          <span className={`badge ${statusColor(status)}`}>{status || "pending"}</span>
        </div>
        <div className="progress" style={{ height: "8px" }}>
          <div
            className={`progress-bar ${statusColor(status)}`}
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>
    </div>
  );
}
