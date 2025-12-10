import React, { useEffect, useState } from "react";
import { getHistory } from "../api/testAPI";
import TestRunCard from "../components/TestRunCard.jsx";

export default function History() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await getHistory();
        setRuns(res.runs || []);
      } catch (e) {
        console.error(e);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="page">
      <h1>History</h1>
      <div className="grid">
        {runs.map((run) => (
          <TestRunCard key={run.run_id} run={run} />
        ))}
      </div>
    </div>
  );
}
