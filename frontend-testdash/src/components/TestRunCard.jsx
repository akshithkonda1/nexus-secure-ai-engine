import React from "react";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar.jsx";

export default function TestRunCard({ run }) {
  return (
    <div className="card" aria-label={`Run ${run.run_id}`}>
      <div className="card-header">
        <h3>{run.run_id}</h3>
        <span className={`pill pill-${run.status}`}>{run.status}</span>
      </div>
      <p>Phase: {run.phase}</p>
      <p>Updated: {run.updated_at}</p>
      <ProgressBar progress={run.progress || 0} />
      <Link to={`/runs/${run.run_id}`} className="button-link">
        View Details
      </Link>
    </div>
  );
}
