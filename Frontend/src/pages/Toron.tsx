import React, { useMemo, useState } from "react";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "I'm present. What do you want to move today?",
  },
  {
    id: "2",
    role: "user",
    content: "Reprioritize the Q3 delivery plan and surface risks for transparency.",
  },
  {
    id: "3",
    role: "assistant",
    content: "Understood. I'll map current milestones, annotate risk vectors, and draft a transparent update.",
  },
];

const Toron: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sessionsOpen, setSessionsOpen] = useState(true);

  const sessions = useMemo(
    () => [
      { title: "Plan Revamp", detail: "Alive" },
      { title: "Workspace Sync", detail: "Quiet" },
      { title: "Docs Deep Dive", detail: "Paused" },
    ],
    []
  );

  const sendDraft = () => {
    if (!draft.trim()) return;
    const next: Message = { id: Date.now().toString(), role: "user", content: draft };
    setMessages((prev) => [...prev, next, { id: `${next.id}-ack`, role: "assistant", content: "Acknowledged." }]);
    setDraft("");
  };

  return (
    <div className="chat-shell">
      <aside className="sessions">
        <div className="section-header">
          <div>
            <div style={{ fontWeight: 700 }}>Sessions</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Contextual, never a sidebar</div>
          </div>
          <button type="button" className="icon-button" onClick={() => setSessionsOpen((prev) => !prev)} aria-label="Toggle sessions">
            {sessionsOpen ? "−" : "+"}
          </button>
        </div>
        {sessionsOpen && (
          <div style={{ display: "grid", gap: 10 }}>
            <div className="session-status">
              <span aria-hidden>🟢</span>
              Soft green alive pulse
            </div>
            {sessions.map((session) => (
              <div key={session.title} className="mini-card">
                <div style={{ fontWeight: 700 }}>{session.title}</div>
                <div style={{ color: "var(--text-secondary)" }}>{session.detail}</div>
              </div>
            ))}
          </div>
        )}
      </aside>
      <div className="glass-panel" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="section-header">
          <div>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>Toron</p>
            <h2 style={{ margin: 0 }}>Authoritative chat</h2>
          </div>
          <div className="mini-card" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden>🎙️</span>
            Mic ready — speech-to-text only
          </div>
        </div>

        <div className="chat-stream">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="controls" aria-label="Assistant controls">
                {message.role === "assistant" && (
                  <>
                    <span className="control-chip">Copy</span>
                    <span className="control-chip">Regenerate ✓</span>
                    <span className="control-chip">Regenerate ✕</span>
                    <span className="control-chip">Read aloud</span>
                    <span className="control-chip">Branch new chat</span>
                    <span className="control-chip">Report message</span>
                  </>
                )}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{message.role === "assistant" ? "Toron" : "You"}</div>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{message.content}</div>
            </div>
          ))}
        </div>

        <div className="composer" role="form" aria-label="Toron composer">
          <button type="button" className="icon-button" aria-label="Plus actions">
            ＋
          </button>
          <button type="button" className="icon-button" aria-label="Microphone input">
            🎤
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Say it softly — Toron is listening"
            aria-label="Message Toron"
          />
          <button
            type="button"
            className="pill-button"
            onClick={sendDraft}
            style={{ transition: "transform 180ms ease" }}
          >
            Send →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toron;
