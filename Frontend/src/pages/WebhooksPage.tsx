import React, { useState } from "react";
import { apiPOST } from "../lib/nexusClient";

type WebhookResponse = { event: string };

export default function WebhooksPage() {
  const [url, setUrl] = useState("");
  const [event, setEvent] = useState("debate");
  const [msg, setMsg] = useState("");

  async function register() {
    try {
      const response = await apiPOST<WebhookResponse>("/webhooks/register", { url, event });
      setMsg(`✅ Registered: ${response.event}`);
    } catch (error) {
      const err = error as Error;
      setMsg(`⚠️ ${err.message}`);
    }
  }

  return (
    <div>
      <h2>Webhooks</h2>
      <input placeholder="https://..." value={url} onChange={(event) => setUrl(event.target.value)} />
      <input placeholder="event" value={event} onChange={(event) => setEvent(event.target.value)} />
      <button onClick={register}>Register</button>
      <div>{msg}</div>
    </div>
  );
}
