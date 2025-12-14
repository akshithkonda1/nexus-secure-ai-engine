import React, { useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Edit3,
  FolderGit,
  GitBranch,
  Mic,
  MicOff,
  MoreHorizontal,
  PauseCircle,
  PlayCircle,
  Plus,
  Send,
  Flag,
  Volume2,
} from "lucide-react";

type Role = "assistant" | "user";

interface Message {
  id: string;
  role: Role;
  content: string;
}

interface SessionMeta {
  id: string;
  title: string;
  status: "Alive" | "Quiet" | "Paused";
}

const seedMessages: Message[] = [
  {
    id: "seed-1",
    role: "assistant",
    content: "I'm present. What do you want to move today?",
  },
  {
    id: "seed-2",
    role: "user",
    content: "Reprioritize the Q3 delivery plan and surface risks for transparency.",
  },
  {
    id: "seed-3",
    role: "assistant",
    content: "I'll map milestones, annotate risk vectors, and draft a transparent update.",
  },
];

const sanitizeTitle = (content: string): string => {
  const normalized = content
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return "Focused Toron session";

  const words = normalized.split(" ").filter(Boolean);
  const clipped = words.slice(0, Math.min(8, Math.max(6, words.length)));
  const sentence = clipped.join(" ").toLowerCase();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

const deriveSessionTitle = (messages: Message[]) => {
  const firstUser = messages.find((msg) => msg.role === "user");
  const source = firstUser?.content ?? messages[0]?.content ?? "Focused Toron session";
  return sanitizeTitle(source);
};

const Toron: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sessionTitle = useMemo(() => deriveSessionTitle(messages), [messages]);

  const sessions: SessionMeta[] = useMemo(
    () => [
      { id: "current", title: sessionTitle, status: "Alive" },
      { id: "workspace-sync", title: "Workspace sync signals", status: "Quiet" },
      { id: "docs-review", title: "Docs health and risk review", status: "Paused" },
    ],
    [sessionTitle]
  );

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSending(true);
    const outbound: Message = { id: `user-${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, outbound]);
    setDraft("");

    window.setTimeout(() => {
      const reply: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "Acknowledged. I will process this with context and return a concise plan.",
      };
      setMessages((prev) => [...prev, reply]);
      setSending(false);
    }, 480);
  };

  const toggleMic = () => {
    setMicActive((prev) => !prev);
    if (!micActive) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="toron-shell">
      <aside className={`toron-sessions${sessionsOpen ? "" : " collapsed"}`} aria-label="Toron sessions">
        <div className="toron-sessions-header">
          <div className="toron-sessions-title">Sessions</div>
          <button
            type="button"
            className="toron-toggle"
            aria-expanded={sessionsOpen}
            onClick={() => setSessionsOpen((prev) => !prev)}
          >
            {sessionsOpen ? <PauseCircle size={16} aria-hidden /> : <PlayCircle size={16} aria-hidden />}
          </button>
        </div>
        {sessionsOpen && (
          <div className="toron-sessions-list">
            {sessions.map((session) => (
              <div key={session.id} className={`toron-session-card${session.id === "current" ? " active" : ""}`}>
                <div className="toron-session-row">
                  <span className="toron-session-title">{session.title}</span>
                  <span className={`toron-status-dot ${session.status.toLowerCase()}`} aria-hidden />
                </div>
                <div className="toron-session-status">{session.status}</div>
              </div>
            ))}
          </div>
        )}
      </aside>

      <section className="toron-main" aria-label="Toron conversation">
        <header className="toron-header" aria-label="Toron session header">
          <div className="toron-header-title">
            <span className="toron-name">Toron</span>
            <span className="toron-divider" aria-hidden />
            <span className="toron-session-name" title={sessionTitle}>
              {sessionTitle}
            </span>
          </div>
        </header>

        <div className="toron-conversation">
          {messages.map((message) => (
            <article key={message.id} className={`toron-message ${message.role}`}>
              <div className="toron-message-meta">
                <span className="toron-label" aria-label={message.role === "assistant" ? "Toron" : "User"}>
                  {message.role === "assistant" ? "TORON" : "U"}
                </span>
              </div>
              <div className="toron-message-body">{message.content}</div>
              <div className="toron-actions" aria-label="message actions">
                {message.role === "user" ? (
                  <>
                    <button type="button" className="toron-action" aria-label="Edit message">
                      <Edit3 size={14} strokeWidth={2} aria-hidden />
                    </button>
                    <button type="button" className="toron-action" aria-label="Copy message">
                      <Copy size={14} strokeWidth={2} aria-hidden />
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="toron-action" aria-label="Copy Toron message">
                      <Copy size={14} strokeWidth={2} aria-hidden />
                    </button>
                    <button type="button" className="toron-action" aria-label="Regenerate Toron message">
                      <Check size={14} strokeWidth={2} aria-hidden />
                    </button>
                    <div className="toron-more-group" role="group" aria-label="More message options">
                      <button type="button" className="toron-action" aria-label="More options">
                        <MoreHorizontal size={14} strokeWidth={2} aria-hidden />
                      </button>
                      <div className="toron-more-menu">
                        <button type="button" className="toron-inline" aria-label="Read aloud">
                          <Volume2 size={14} strokeWidth={2} aria-hidden />
                          Read aloud
                        </button>
                        <button type="button" className="toron-inline" aria-label="Branch into new chat">
                          <GitBranch size={14} strokeWidth={2} aria-hidden />
                          Branch into new chat
                        </button>
                        <button type="button" className="toron-inline" aria-label="Report message">
                          <Flag size={14} strokeWidth={2} aria-hidden />
                          Report message
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="toron-input" role="form" aria-label="Toron input">
          <div className="toron-more-group toron-plus" role="group" aria-label="Attachment options">
            <button type="button" className="toron-action" aria-label="Add attachments">
              <Plus size={16} strokeWidth={2} aria-hidden />
            </button>
            <div className="toron-more-menu toron-plus-menu">
              <button type="button" className="toron-inline" aria-label="Attach file">
                <FolderGit size={14} strokeWidth={2} aria-hidden />
                Attach file
              </button>
              <button type="button" className="toron-inline" aria-label="Add from GitHub">
                <GitBranch size={14} strokeWidth={2} aria-hidden />
                Add from GitHub (SVG)
              </button>
              <button type="button" className="toron-inline" aria-label="Add from Google Drive">
                <FolderGit size={14} strokeWidth={2} aria-hidden />
                Add from Google Drive (SVG)
              </button>
            </div>
          </div>
          <button
            type="button"
            className={`toron-action mic${micActive ? " active" : ""}`}
            aria-pressed={micActive}
            aria-label="Toggle microphone"
            onClick={toggleMic}
          >
            {micActive ? <MicOff size={16} strokeWidth={2} aria-hidden /> : <Mic size={16} strokeWidth={2} aria-hidden />}
          </button>
          <div className="toron-input-field">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask me anything."
              aria-label="Ask Toron"
            />
            {micActive && (
              <div className="toron-waveform" aria-label="Voice capture waveform">
                {[1, 2, 3, 4, 5, 6].map((bar) => (
                  <span key={bar} style={{ animationDelay: `${bar * 80}ms` }} />
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className={`toron-send${sending ? " sending" : ""}`}
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            aria-label="Send to Toron"
          >
            <Send size={16} strokeWidth={2} aria-hidden />
            <span>{sending ? "Processing" : "Send"}</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Toron;
