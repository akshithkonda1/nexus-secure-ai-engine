import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus } from "lucide-react";

const initialMessages = [
  { role: "assistant" as const, content: "Toron is active. State the objective." },
  { role: "user" as const, content: "Summarize yesterday's workspace updates." },
  {
    role: "assistant" as const,
    content:
      "Review complete. Yesterday's workspace highlights:\n\n• Research outline refined with 3 new sections\n• Notifications system reviewed and optimized\n• Team collaboration features enhanced\n\nSpecify where you want to dive deeper.",
  },
];

export default function ToronPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

const sanitizeTitle = (text: string) => {
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
  const [attachments, setAttachments] = useState<string[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });
  const [sessionPosition, setSessionPosition] = useState<{ top: number; left: number }>({ top: 20, left: 20 });
  const [headerTucked, setHeaderTucked] = useState(false);
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

  const handleAddAttachment = (label: string) => {
    setAttachments((prev) => {
      if (prev.includes(label)) return prev;
      return [...prev, label];
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const clampPosition = (top: number, left: number) => {
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

  const scrollToLatest = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    setNewResponseHint(false);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = input.trim();
    if (!next) return;

    setMessages((prev) => [...prev, { role: "user" as const, content: next }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "I understand your request. I'm processing this information and will provide a detailed response shortly.",
        },
      ]);
      setIsTyping(false);
      scrollToBottom();
    }, 1500);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      scrollToBottom();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <section className="flex flex-1 flex-col">
      <motion.header
        className="mb-8 space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
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

      <section className={`toron-main${headerTucked ? " tucked" : ""}`} aria-label="Toron conversation">
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
                          <div className="toron-more-group" role="group" aria-label="More message options">
                            <button type="button" className="toron-action" aria-label="More options">
                              <MoreHorizontal size={14} strokeWidth={2} aria-hidden />
                            </button>
                            <div className="toron-more-menu">
                              <button type="button" className="toron-inline" aria-label="Read aloud">
                                Read aloud
                              </button>
                              <button type="button" className="toron-inline" aria-label="Branch into new chat">
                                <GitBranch size={14} strokeWidth={2} aria-hidden />
                                Branch new chat
                              </button>
                              <button type="button" className="toron-inline" aria-label="Report message">
                                <Flag size={14} strokeWidth={2} aria-hidden />
                                Report output
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="toron-message-body">{message.content}</div>
                </article>
              ))}
            </div>
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--text-strong)]">Toron</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Precision dialogue for decisive action.</p>
          </div>
        </div>
      </motion.header>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-y-auto pb-6 pr-2">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
                const glassTone =
                  message.role === "user"
                    ? "border-white/40 bg-white/75 text-[var(--text-strong)] shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5"
                    : "border-white/30 bg-white/65 text-[var(--text-primary)] shadow-[0_12px_32px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/5";

                const textTone = message.role === "user" ? "text-[var(--text-strong)]" : "text-[var(--text-primary)]";

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <motion.div
                    className={`group relative w-full max-w-2xl rounded-2xl border px-5 py-4 backdrop-blur-md transition-all duration-200 ${glassTone}`}
                  >
                    <p className={`whitespace-pre-wrap text-base leading-relaxed ${textTone}`}>{message.content}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/65 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                <motion.div
                  className="flex gap-1"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                >
                  <div className="h-2 w-2 rounded-full bg-[var(--ryuzen-dodger)]" />
                  <div className="h-2 w-2 rounded-full bg-[var(--ryuzen-azure)]" />
                  <div className="h-2 w-2 rounded-full bg-[var(--ryuzen-purple)]" />
                </motion.div>
                <span className="text-xs text-[var(--text-muted)]">Toron is processing</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-white/30 bg-white/70 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.12)] backdrop-blur-lg transition-all focus-within:border-[var(--accent)] focus-within:shadow-[0_18px_52px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/50 text-[var(--text-primary)] shadow-[0_8px_24px_rgba(15,23,42,0.1)] backdrop-blur-md transition-colors hover:border-white/50 dark:border-white/10 dark:bg-white/10"
              aria-label="Add context"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <label className="sr-only" htmlFor="toron-input">
                Toron prompt
              </label>
              <textarea
                id="toron-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=" Ask me anything.... "
                className="w-full resize-none rounded-xl border border-transparent bg-white/50 px-4 py-3 text-base leading-relaxed text-[var(--text-primary)] outline-none backdrop-blur-sm placeholder:text-[var(--text-muted)] focus:border-white/40 dark:bg-white/10"
                rows={4}
              />
            </div>
            <motion.button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--color-accent-foreground)] transition-all hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={{ scale: input.trim() ? 1.03 : 1 }}
              whileTap={{ scale: input.trim() ? 0.97 : 1 }}
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="toron-footer">Toron can make mistakes. Please verify important information.</div>
        </div>
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
                          <div className="toron-more-group" role="group" aria-label="More message options">
                            <button type="button" className="toron-action" aria-label="More options">
                              <MoreHorizontal size={14} strokeWidth={2} aria-hidden />
                            </button>
                            <div className="toron-more-menu">
                              <button type="button" className="toron-inline" aria-label="Read aloud">
                                Read aloud
                              </button>
                              <button type="button" className="toron-inline" aria-label="Branch into new chat">
                                <GitBranch size={14} strokeWidth={2} aria-hidden />
                                Branch new chat
                              </button>
                              <button type="button" className="toron-inline" aria-label="Report message">
                                <Flag size={14} strokeWidth={2} aria-hidden />
                                Report output
                              </button>
                            </div>
                          </div>
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
                      <GitBranch size={14} strokeWidth={2} aria-hidden />
                      Add file from GitHub
                    </button>
                    <button
                      type="button"
                      className="toron-inline"
                      aria-label="Add file from Google Drive"
                      onClick={() => handleAddAttachment("Google Drive file")}
                    >
                      <FilePlus size={14} strokeWidth={2} aria-hidden />
                      Add file from Google Drive
                    </button>
                    <button
                      type="button"
                      className="toron-inline"
                      aria-label="Add file from Dropbox"
                      onClick={() => handleAddAttachment("Dropbox file")}
                    >
                      <FilePlus size={14} strokeWidth={2} aria-hidden />
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
                  placeholder="Ask Toron anything"
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
        </motion.form>
      </div>
    </section>
  );
}