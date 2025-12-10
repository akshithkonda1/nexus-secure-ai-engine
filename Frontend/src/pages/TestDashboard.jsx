import React, { useCallback, useMemo, useState } from "react";
import LiveLogStream from "../components/LiveLogStream";
import TestResultSummary from "../components/TestResultSummary";
import TestRunCard from "../components/TestRunCard";

const initialProgress = {
  sim_batch: { percent: 0, status: "pending" },
  engine_check: { percent: 0, status: "pending" },
  replay: { percent: 0, status: "pending" },
  load_test: { percent: 0, status: "pending" },
};

export default function TestDashboard() {
  const [runId, setRunId] = useState(null);
  const [progress, setProgress] = useState(initialProgress);
  const [summary, setSummary] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const updateProgress = useCallback((payload) => {
    if (!payload) return;
    setProgress((current) => {
      const next = { ...current };
      const msg = (payload.message || "").toLowerCase();
      if (msg.includes("sim batch")) {
        next.sim_batch = { percent: payload.percent, status: "running" };
      } else if (msg.includes("engine check")) {
        next.engine_check = { percent: payload.percent, status: "running" };
      } else if (msg.includes("replay")) {
        next.replay = { percent: payload.percent, status: "running" };
      } else if (msg.includes("load test")) {
        next.load_test = { percent: payload.percent, status: "running" };
      }
      if (payload.percent >= 100) {
        Object.keys(next).forEach((key) => {
          next[key] = { percent: 100, status: "completed" };
        });
      }
      return next;
    });
  }, []);

  const handleRunAll = async () => {
    setSummary(null);
    setProgress(initialProgress);
    setIsRunning(true);
    try {
      const response = await fetch("/tests/run_all", { method: "POST" });
      const data = await response.json();
      setRunId(data.run_id);
    } catch (err) {
      console.error(err);
      setIsRunning(false);
    }
  };

  const overallPercent = useMemo(() => {
    const values = Object.values(progress).map((p) => p.percent || 0);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }, [progress]);

  const handleComplete = (result) => {
    setIsRunning(false);
    setSummary(result);
    setProgress((current) => {
      const finished = {};
      Object.keys(current).forEach((key) => {
        finished[key] = { percent: 100, status: "completed" };
      });
      return finished;
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Master Test Dashboard</h2>
          <p className="text-muted">Trigger the full RUN EVERYTHING suite for Ryuzen Toron v2.5H+</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={handleRunAll} disabled={isRunning}>
          RUN COMPLETE TEST SUITE
        </button>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <h5 className="card-title">Overall Progress</h5>
          <div className="progress" style={{ height: "12px" }}>
            <div
              className="progress-bar bg-info"
              role="progressbar"
              style={{ width: `${overallPercent}%` }}
              aria-valuenow={overallPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
          {runId && <p className="text-muted small mt-2">Run ID: {runId}</p>}
        </div>
      </div>

      <TestRunCard
        title="SIM Batch"
        description="20 prompt simulation batch"
        percent={progress.sim_batch.percent}
        status={progress.sim_batch.status}
      />
      <TestRunCard
        title="Full Engine Check"
        description="Pipeline path + tier-by-tier diagnostics"
        percent={progress.engine_check.percent}
        status={progress.engine_check.status}
      />
      <TestRunCard
        title="Snapshot Determinism Replay"
        description="Replay verification and determinism delta"
        percent={progress.replay.percent}
        status={progress.replay.status}
      />
      <TestRunCard
        title="Load Test (k6)"
        description="1500 users, 30 RPS, 2 minutes"
        percent={progress.load_test.percent}
        status={progress.load_test.status}
      />

      {runId && (
        <div className="row mt-3">
          <div className="col-md-6">
            <LiveLogStream runId={runId} onProgress={updateProgress} onComplete={handleComplete} />
          </div>
          <div className="col-md-6">
            <TestResultSummary runId={runId} summary={summary} />
          </div>
        </div>
      )}
    </div>
  );
}
