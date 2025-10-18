import React, { useEffect, useState } from "react";
import { apiGET } from "../lib/nexusClient";

type StatusData = {
  status: string;
  uptime: string;
  models?: Record<string, unknown>;
};

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    apiGET<StatusData & { models?: Record<string, unknown> }>("/status")
      .then(setData)
      .catch((error) => setErr(error.message));
  }, []);

  if (err) return <div>⚠️ {err}</div>;
  if (!data) return <div>Loading…</div>;

  return (
    <div>
      <h2>System Status {data.status}</h2>
      <div>Uptime: {data.uptime}</div>
      <h3>Models</h3>
      <ul>
        {Object.entries(data.models || {}).map(([key, value]) => (
          <li key={key}>
            <b>{key}</b>: {String(value)}
          </li>
        ))}
      </ul>
    </div>
  );
}
