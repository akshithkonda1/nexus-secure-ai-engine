import React, { useState } from "react";
import { apiPOST } from "../lib/nexusClient";

type ApiResponse = { status: string; timestamp: string };

type LogResponse = { status?: string };

export default function AdminPage() {
  const [msg, setMsg] = useState<string>("");

  async function runBackup() {
    try {
      const response = await apiPOST<ApiResponse>("/backup", {});
      setMsg(`✅ ${response.status} @ ${response.timestamp}`);
    } catch (error) {
      const err = error as Error;
      setMsg(`⚠️ ${err.message}`);
    }
  }

  async function sendLog() {
    try {
      await apiPOST<LogResponse>("/log", { event: "frontend_action", details: "clicked test" });
      setMsg("Logged");
    } catch (error) {
      const err = error as Error;
      setMsg(`⚠️ ${err.message}`);
    }
  }

  return (
    <div>
      <h2>Admin</h2>
      <button onClick={runBackup}>Run Backup</button>
      <button onClick={sendLog}>Send Test Log</button>
      <div>{msg}</div>
    </div>
  );
}
