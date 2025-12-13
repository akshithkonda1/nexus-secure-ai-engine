import { useMemo, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const seedMessages: Message[] = [
  {
    id: "m1",
    role: "assistant",
    content: "Welcome back. I will keep sessions contained and focused. What do you want Toron to tackle?",
  },
  {
    id: "m2",
    role: "user",
    content: "Outline a policy launch brief with clear milestones.",
  },
  {
    id: "m3",
    role: "assistant",
    content: "Drafted. Milestones include discovery, validation, compliance review, and stakeholder rollout. Want me to branch a new chat for execution?",
  },
];

function AssistantControls() {
  return (
    <div className="assistant-controls" role="group" aria-label="Assistant controls">
      <button className="control-button" type="button">
        Copy
      </button>
      <button className="control-button" type="button">
        Regenerate (good)
      </button>
      <button className="control-button" type="button">
        Regenerate (bad)
      </button>
      <div className="more-menu" aria-haspopup="true" aria-expanded="false">
        More
        <div className="more-menu-list" role="menu">
          <button role="menuitem">Read aloud</button>
          <button role="menuitem">Branch new chat</button>
          <button role="menuitem">Report message</button>
        </div>
      </div>
    </div>
  );
}

function Sessions() {
  const [open, setOpen] = useState(true);
  const sessions = useMemo(
    () => [
      { id: "s1", title: "Launch brief" },
      { id: "s2", title: "Risk review" },
      { id: "s3", title: "Ops retro" },
    ],
    []
  );

  return (
    <aside className="sessions" aria-label="Sessions">
      <div className="head" onClick={() => setOpen((prev) => !prev)} role="button" tabIndex={0}>
        <div className="session-title">
          <span className="pulse" aria-hidden="true" />
          <strong>Sessions</strong>
        </div>
        <span aria-hidden="true">{open ? "–" : "+"}</span>
      </div>
      {open && (
        <div className="body">
          {sessions.map((session) => (
            <div key={session.id} className="session-item">
              <strong>{session.title}</strong>
              <p className="section-body">Alive and ready.</p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

function Toron() {
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [draft, setDraft] = useState("");

  const sendMessage = () => {
    if (!draft.trim()) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: draft.trim() };
    const acknowledgement: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Received. I'll respond with clarity and keep this session contained.",
    };
    setMessages((prev) => [...prev, userMessage, acknowledgement]);
    setDraft("");
  };

  return (
    <div className="page toron-layout">
      <Sessions />
      <div className="glass-panel chat-window" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className="message-row">
            <div className={`bubble ${message.role}`}>
              <p className="section-body bubble-text">
                {message.content}
              </p>
              {message.role === "assistant" && <AssistantControls />}
            </div>
          </div>
        ))}
      </div>
      <div className="composer">
        <div className="composer-inner">
          <button className="icon-button" type="button" aria-label="Open plus menu">
            +
          </button>
          <textarea
            rows={1}
            placeholder="Calm, thoughtful prompts only"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button className="icon-button" type="button" aria-label="Mic input">
            🎙️
          </button>
          <button className="send-button" type="button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toron;
