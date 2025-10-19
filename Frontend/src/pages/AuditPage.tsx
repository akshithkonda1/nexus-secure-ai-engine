import React, { useEffect, useState } from "react";
import { apiGET } from "../lib/nexusClient";

type AuditLog = { timestamp: string; event: string };

type AuditResponse = { logs: AuditLog[] };

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    apiGET<AuditResponse>("/audit?user_id=*")
      .then((data) => setLogs(data.logs || []))
      .catch((error) => setErr(error.message));
  }, []);

  if (err) return <div>⚠️ {err}</div>;

  return (
    <div>
      <h2>Audit (latest 50)</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>
            <code>{log.timestamp}</code> — {log.event}
          </li>
        ))}
      </ul>
    </div>
  );
}
