import React, { useState, useRef } from "react";
import { apiPOST } from "../lib/nexusClient";
import { renderMarkdown } from "../lib/render";
import { getSessionId } from "../state/session";
import SourcesList from "./SourcesList";

type SourceRef = { url: string; title?: string; snippet?: string };
type CodeBlock = { language?: string | null; code: string };
type DebateResponse = {
  answer: string;
  winner: string;
  participants: string[];
  sources: SourceRef[];
  code: CodeBlock[];
};

type Message = { role: "user" | "assistant"; content: string; meta?: DebateResponse };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function send() {
    const text = (inputRef.current?.value || "").trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    if (inputRef.current) inputRef.current.value = "";
    setBusy(true);
    try {
      const res = await apiPOST<DebateResponse>("/debate", { prompt: text, context: getSessionId() });
      const card = [
        `<div><strong>Winner:</strong> ${res.winner}</div>`,
        `<div><strong>Participants:</strong> ${res.participants.join(", ")}</div>`,
      ].join("");
      const html = renderMarkdown(res.answer);
      setMessages((m) => [...m, { role: "assistant", content: `${card}<hr/>${html}`, meta: res }]);
    } catch (error) {
      const err = error as Error;
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${err?.message || "Request failed"}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-wrap">
      <div className="msgs">
        {messages.map((message, index) => (
          <div key={index} className={`msg ${message.role}`}>
            <div className="bubble" dangerouslySetInnerHTML={{ __html: message.content }} />
            {message.meta?.sources?.length ? <SourcesList sources={message.meta.sources} /> : null}
            {message.meta?.code?.length ? (
              <details>
                <summary>View code blocks ({message.meta.code.length})</summary>
                {message.meta.code.map((code, idx) => (
                  <pre key={idx}>
                    <code className={`language-${code.language || ""}`}>{code.code}</code>
                  </pre>
                ))}
              </details>
            ) : null}
          </div>
        ))}
      </div>

      <div className="composer">
        <textarea
          ref={inputRef}
          placeholder="Ask Nexus…"
          rows={3}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
        />
        <button onClick={send} disabled={busy}>
          {busy ? "Thinking…" : "Send"}
        </button>
      </div>
    </div>
  );
}
