import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Edit3,
  Archive,
  FilePlus,
  FolderClosed,
  Mic,
  MicOff,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Send,
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

interface DragState {
  active: boolean;
  offsetX: number;
  offsetY: number;
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

const quickActions = [
  {
    label: "Define scope",
    description: "Confirm constraints, signals, and success state.",
    prompt: "Clarify the scope, constraints, success signals, and acceptance criteria before execution.",
  },
  {
    label: "Explore paths",
    description: "Outline options with tradeoffs and effort.",
    prompt: "List structured options with tradeoffs, effort, and expected impact.",
  },
  {
    label: "Make a plan",
    description: "Draft a concise execution path with owners and timing.",
    prompt: "Draft a concise execution plan with owners, timing, and risks.",
  },
  {
    label: "Surface risks",
    description: "Highlight blockers, dependencies, mitigations.",
    prompt: "Surface key risks, dependencies, and mitigations for this track.",
  },
];

const Toron: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });
  const [sessionPosition, setSessionPosition] = useState<{ top: number; left: number }>({ top: 20, left: 20 });
  const [sessionFootprint, setSessionFootprint] = useState(0);
  const [headerTucked, setHeaderTucked] = useState(false);
  const [newResponseHint, setNewResponseHint] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);

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
    if (!trimmed && attachments.length === 0) return;
    setSending(true);
    const content = trimmed || attachments.join(", ");
    const outbound: Message = { id: `user-${Date.now()}`, role: "user", content };
    setMessages((prev) => [...prev, outbound]);
    setDraft("");
    setAttachments([]);
    inputRef.current?.focus();

    window.setTimeout(() => {
      const reply: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "Acknowledged. I will process this with context and return a concise plan.",
      };
      setMessages((prev) => [...prev, reply]);
      setSending(false);
      inputRef.current?.focus();
    }, 480);
  };

  const toggleMic = () => {
    setMicActive((prev) => !prev);
    inputRef.current?.focus();
  };

  const handleAddAttachment = (label: string) => {
    setAttachments((prev) => {
      if (prev.includes(label)) return prev;
      return [...prev, label];
    });
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const clampPosition = (top: number, left: number) => {
    if (typeof window === "undefined") return { top, left };
    const widgetWidth = widgetRef.current?.offsetWidth ?? 320;
    const widgetHeight = widgetRef.current?.offsetHeight ?? 260;
    const maxLeft = Math.max(0, window.innerWidth - widgetWidth - 12);
    const maxTop = Math.max(0, window.innerHeight - widgetHeight - 12);
    return { top: Math.min(Math.max(12, top), maxTop), left: Math.min(Math.max(12, left), maxLeft) };
  };

  const startDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragState({
      active: true,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    });
  };

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!dragState.active) return;
      const nextTop = event.clientY - dragState.offsetY;
      const nextLeft = event.clientX - dragState.offsetX;
      setSessionPosition(clampPosition(nextTop, nextLeft));
    };

    const handleUp = () => {
      if (!dragState.active) return;
      setDragState((prev) => ({ ...prev, active: false }));
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragState]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("toron-session-position");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionPosition(clampPosition(parsed.top, parsed.left));
      } catch {
        setSessionPosition(clampPosition(20, 20));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const clamped = clampPosition(sessionPosition.top, sessionPosition.left);
    if (clamped.top !== sessionPosition.top || clamped.left !== sessionPosition.left) {
      setSessionPosition(clamped);
      return;
    }
    localStorage.setItem("toron-session-position", JSON.stringify(clamped));
  }, [sessionPosition.top, sessionPosition.left]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      setHeaderTucked(viewport.scrollTop > 12);
      const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      if (distanceFromBottom < 120) {
        setNewResponseHint(false);
      }
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    if (distanceFromBottom < 140) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      setNewResponseHint(false);
    } else {
      setNewResponseHint(true);
    }
  }, [messages]);

  useEffect(() => {
    if (!sessionsOpen) {
      setSessionFootprint(0);
      return;
    }

    const width = widgetRef.current?.offsetWidth ?? 320;
    const offset = sessionPosition.left;
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
    const footprint = Math.min(offset + width + 24, Math.max(width + 32, viewportWidth * 0.42));
    setSessionFootprint(sessionsOpen ? Math.max(0, footprint) : 0);
  }, [sessionsOpen, sessionPosition.left, sessionPosition.top]);

  const scrollToLatest = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    setNewResponseHint(false);
  };

  const handleQuickAction = (prompt: string) => {
    setDraft(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="toron-shell" style={{ ["--toron-offset" as string]: `${sessionFootprint}px` }}>
      <aside
        ref={widgetRef}
        className={`toron-sessions${sessionsOpen ? "" : " collapsed"}`}
        aria-label="Toron sessions"
        style={{ top: sessionPosition.top, left: sessionPosition.left }}
        onMouseDown={startDrag}
      >
        <div className="toron-sessions-header">
          <div className="toron-sessions-title">Sessions</div>
          <button
            type="button"
            className="toron-toggle"
            aria-expanded={sessionsOpen}
            onClick={(event) => {
              event.stopPropagation();
              setSessionsOpen((prev) => !prev);
            }}
          >
            {sessionsOpen ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
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

      <section className={`toron-appframe${headerTucked ? " tucked" : ""}`} aria-label="Toron workspace">
        <header className={`toron-header${headerTucked ? " tucked" : ""}`} aria-label="Toron session header">
          <div className="toron-header-title">
            <span className="toron-name">Toron</span>
            <span className="toron-session-name" title={sessionTitle}>
              {sessionTitle}
            </span>
          </div>
        </header>

        <div className="toron-viewport">
          <div className="toron-viewport-scroll" ref={viewportRef}>
            <section className="toron-hero" aria-label="Toron session context">
              <div className="toron-orb" aria-hidden />
              <div className="toron-hero-copy">
                <p className="toron-kicker">Toron — Model B</p>
                <h1 className="toron-headline">Ready to create something new?</h1>
                <p className="toron-subhead">Maintain directive clarity as you think, decide, and execute.</p>
              </div>
              <div className="toron-quick-actions" role="list">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="toron-quick"
                    onClick={() => handleQuickAction(action.prompt)}
                    role="listitem"
                  >
                    <span className="toron-quick-label">{action.label}</span>
                    <span className="toron-quick-description">{action.description}</span>
                  </button>
                ))}
              </div>
            </section>
            <div className="toron-conversation">
              {messages.map((message) => (
                <article key={message.id} className={`toron-message ${message.role}`}>
                  <div className="toron-message-top">
                    <span className="toron-label" aria-label={message.role === "assistant" ? "Toron" : "User"}>
                      {message.role === "assistant" ? "Toron" : "User"}
                    </span>
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
                            <RefreshCw size={14} strokeWidth={2} aria-hidden />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="toron-message-body">{message.content}</div>
                </article>
              ))}
            </div>
            {newResponseHint && (
              <button type="button" className="toron-new-response" onClick={scrollToLatest}>
                New Toron response
              </button>
            )}
          </div>
        </div>

        <div className="toron-directive-shell" aria-label="Toron directive shell">
          <div className="toron-directive" role="form" aria-label="Toron input">
            <div className="toron-input-shell">
              <div className="toron-control">
                <div className="toron-more-group toron-plus" role="group" aria-label="Attachment options">
                  <button type="button" className="toron-action" aria-label="Add attachments">
                    <Plus size={16} strokeWidth={2} aria-hidden />
                  </button>
                  <div className="toron-more-menu toron-plus-menu">
                    <button
                      type="button"
                      className="toron-inline"
                      aria-label="Add file from GitHub"
                      onClick={() => handleAddAttachment("GitHub file")}
                    >
                      <FilePlus size={14} strokeWidth={2} aria-hidden />
                      Add file from GitHub
                    </button>
                    <button
                      type="button"
                      className="toron-inline"
                      aria-label="Add file from Google Drive"
                      onClick={() => handleAddAttachment("Google Drive file")}
                    >
                      <FolderClosed size={14} strokeWidth={2} aria-hidden />
                      Add file from Google Drive
                    </button>
                    <button
                      type="button"
                      className="toron-inline"
                      aria-label="Add file from Dropbox"
                      onClick={() => handleAddAttachment("Dropbox file")}
                    >
                      <Archive size={14} strokeWidth={2} aria-hidden />
                      Add file from Dropbox
                    </button>
                  </div>
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
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Toron anything…"
                  aria-label="Ask Toron"
                  rows={1}
                />
                {attachments.length > 0 && (
                  <div className="toron-attachments" aria-label="Attachments">
                    {attachments.map((item) => (
                      <span key={item} className="toron-attachment">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`toron-send${sending ? " sending" : ""}`}
                onClick={handleSend}
                disabled={(draft.trim().length === 0 && attachments.length === 0) || sending}
                aria-label="Send to Toron"
              >
                <Send size={16} strokeWidth={2} aria-hidden />
                <span>{sending ? "Sending" : "Send"}</span>
                {sending && <span className="toron-thinking" aria-hidden />}
              </button>
            </div>
            <div className="toron-footer">Toron can make mistakes. Please verify important information.</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Toron;
