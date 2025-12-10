import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchReportHtml, getRunResults, getWarRoom } from "../api/testAPI";
import ReportViewer from "../components/ReportViewer.jsx";
import ErrorList from "../components/ErrorList.jsx";

export default function RunDetails() {
  const { runId } = useParams();
  const [result, setResult] = useState(null);
  const [reportHtml, setReportHtml] = useState("");
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [res, war] = await Promise.all([getRunResults(runId), getWarRoom(runId)]);
        setResult(res.result);
        setEvents(war.events || []);
      } catch (e) {
        console.error(e);
      }
      try {
        const html = await fetchReportHtml(runId);
        setReportHtml(html);
      } catch (e) {
        // report may not be ready
      }
    }
    load();
  }, [runId]);

  const summary = result || {};

  return (
    <div className="page">
      <h1>Run Details</h1>
      <p className="muted">Run ID: {runId}</p>
      <section className="summary-grid">
        <div className="card">
          <h3>p95 latency</h3>
          <p>{summary.load?.p95_latency_ms ?? "—"} ms</p>
        </div>
        <div className="card">
          <h3>p99 latency</h3>
          <p>{summary.load?.p99_latency_ms ?? "—"} ms</p>
        </div>
        <div className="card">
          <h3>Determinism</h3>
          <p>{summary.sim?.determinism_score ?? "—"}</p>
        </div>
        <div className="card">
          <h3>Opus usage</h3>
          <p>{summary.sim?.opus_usage_rate ?? "—"}</p>
        </div>
      </section>
      <section>
        <h2>HTML Report</h2>
        <ReportViewer htmlContent={reportHtml} />
      </section>
      <section>
        <h2>War Room</h2>
        <ErrorList events={events} />
      </section>
    </div>
  );
}
