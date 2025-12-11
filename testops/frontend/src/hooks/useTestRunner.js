import { useState } from "react";
import { runAllTests, fetchStatus, streamLogs, fetchResult } from "../api/testOpsAPI";

export default function useTestRunner() {
  const [runId, setRunId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const begin = async () => {
    const data = await runAllTests();
    setRunId(data.run_id);
    setStatus("running");

    const evt = streamLogs(data.run_id, (line) =>
      setLogs((prev) => [...prev, line])
    );

    const poll = setInterval(async () => {
      const s = await fetchStatus(data.run_id);
      setStatus(s.status);

      if (s.status === "complete") {
        clearInterval(poll);
        evt.close();
        const final = await fetchResult(data.run_id);
        setResult(final);
      }
    }, 750);
  };

  return { runId, status, logs, result, begin };
}
