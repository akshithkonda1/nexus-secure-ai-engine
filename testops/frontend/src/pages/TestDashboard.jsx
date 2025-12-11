import useTestRunner from "../hooks/useTestRunner";
import TestResultSummary from "../components/TestResultSummary";
import LiveLogStream from "../components/LiveLogStream";
import StatusBubbles from "../components/StatusBubbles";

export default function TestDashboard() {
  const { runId, status, logs, result, begin } = useTestRunner();

  return (
    <div className="testdash-container">
      <h1>Ryuzen TestOps</h1>

      {status === "idle" && (
        <button className="begin-btn" onClick={begin}>
          Begin Testing
        </button>
      )}

      {status !== "idle" && <StatusBubbles status={status} />}

      <LiveLogStream logs={logs} />

      {result && <TestResultSummary result={result} />}
    </div>
  );
}
