"use client";

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  MoreHorizontal,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: string[];
  createdAt: string;
};

type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
};

type Speed = "slow" | "normal" | "fast";

type SettingsState = {
  nsfwEnabled: boolean;
  jokesEnabled: boolean;
  technicalMode: boolean;
  connectedApps: boolean;
};

/* ------------------------------------------------------------------ */
/* Initial State                                                      */
/* ------------------------------------------------------------------ */

const initialWelcome: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to Nexus, an AI Debate Engine.\n\nAsk anything about your projects, documents, or life logistics — I’ll help you reason it out.",
  attachments: [],
  createdAt: new Date().toISOString(),
};

const createFreshSession = (): ChatSession => ({
  id: crypto.randomUUID(),
  title: "New chat",
  createdAt: new Date().toISOString(),
  messages: [initialWelcome],
});

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const RESPONSE_DELAY_MS: Record<Speed, number> = {
  slow: 1800,
  normal: 900,
  fast: 400,
};

const autoTitleFromMessages = (messages: ChatMessage[]): string => {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser || !firstUser.content.trim()) return "New chat";

  const trimmed = firstUser.content.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 42) return trimmed;
  return trimmed.slice(0, 39) + "…";
};

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

/* ------------------------------------------------------------------ */
/* Small UI bits                                                      */
/* ------------------------------------------------------------------ */

const IOSSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={[
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
      checked
        ? "bg-[rgb(var(--brand))]"
        : "bg-[rgba(var(--border),0.9)] dark:bg-slate-600",
    ].join(" ")}
  >
    <span
      className={[
        "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-5" : "translate-x-1",
      ].join(" ")}
  />
  </button>
);

const Waveform: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="flex items-end gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-[rgb(var(--brand))]"
          style={{
            height: `${6 + (i % 3) * 4}px`,
            animation: "nexus-wave 0.9s ease-in-out infinite",
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes nexus-wave {
          0%, 100% { transform: scaleY(0.6); opacity: 0.7; }
          50% { transform: scaleY(1.5); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function Chat() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [
    createFreshSession(),
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>(
    () => sessions[0]?.id ?? ""
  );

  const [inputValue, setInputValue] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [isThinking, setIsThinking] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    nsfwEnabled: false,
    jokesEnabled: true,
    technicalMode: true,
    connectedApps: false,
  });

  // Voice / dictation
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? sessions[0],
    [sessions, activeSessionId]
  );
  const messages = activeSession?.messages ?? [];

  /* ---------------------------- Dictation ---------------------------- */

  const startDictation = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionImpl =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      alert("Voice dictation is not supported in this browser (yet).");
      return;
    }

    const recognition: SpeechRecognition = new SpeechRecognitionImpl();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputValue(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopDictation = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  /* --------------------------- Attachments --------------------------- */

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setPendingAttachments([]);
      return;
    }
    const names = Array.from(files).map((f) => f.name);
    setPendingAttachments(names);
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  /* ---------------------------- Sessions ----------------------------- */

  const createNewSession = () => {
    const fresh = createFreshSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length === 1) {
      // Don’t let them delete the only session; just reset it.
      const fresh = createFreshSession();
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
      return;
    }

    const confirmed = window.confirm(
      "Delete this chat session? This cannot be undone."
    );
    if (!confirmed) return;

    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (!filtered.length) {
        const fresh = createFreshSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (id === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearAllSessions = () => {
    const confirmed = window.confirm(
      "Clear all chat sessions and start fresh? This cannot be undone."
    );
    if (!confirmed) return;

    const fresh = createFreshSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  };

  /* --------------------------- Messaging ----------------------------- */

  const pushMessageToActiveSession = (message: ChatMessage) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSessionId
          ? {
              ...session,
              messages: [...session.messages, message],
            }
          : session
      )
    );
  };

  const updateActiveSessionTitleIfNeeded = () => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;
        if (session.title !== "New chat") return session;

        const nextTitle = autoTitleFromMessages(session.messages);
        return { ...session, title: nextTitle };
      })
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = inputValue.trim();

    if (!trimmed && pendingAttachments.length === 0) return;

    const now = new Date().toISOString();

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      attachments: pendingAttachments,
      createdAt: now,
    };

    pushMessageToActiveSession(userMessage);
    setInputValue("");
    setPendingAttachments([]);
    setIsThinking(true);

    // Update title after user message
    setTimeout(updateActiveSessionTitleIfNeeded, 0);

    // Fake Nexus reply (replace with real API)
    const delay = RESPONSE_DELAY_MS[speed];

    setTimeout(() => {
      const replyText = [
        "Got it. I’ve logged this into your Nexus thread.",
        settings.connectedApps
          ? "Because connected apps are enabled, I’ll pull context from Workspace, Outbox, and Documents when needed."
          : "When connected apps are enabled, I’ll be able to pull context from Workspace, Outbox, and Documents automatically.",
        settings.jokesEnabled
          ? "\n\nSide note: even CPUs throttle sometimes. You’re allowed to as well."
          : "",
      ].join(" ");

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: replyText,
        createdAt: new Date().toISOString(),
      };

      pushMessageToActiveSession(assistantMessage);
      setIsThinking(false);
    }, delay);
  };

  /* ------------------------------ Render ----------------------------- */

  return (
    <section className="flex h-full flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCollapsed((v) => !v)}
            className="inline-flex items-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] px-3 py-1 text-xs font-medium text-[rgb(var(--subtle))] hover:bg-[rgba(var(--panel),0.9)]"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="mr-1 h-3 w-3" /> Expand chat
              </>
            ) : (
              <>
                <ChevronUp className="mr-1 h-3 w-3" /> Collapse chat
              </>
            )}
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-[rgb(var(--text))]">
              Chat Console
            </h1>
            <p className="text-xs text-[rgb(var(--subtle))]">
              Ask anything — Nexus will route to Workspace, Outbox, or Documents
              when needed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(var(--border),0.8)] bg-[rgb(var(--panel))] text-[rgb(var(--subtle))] hover:text-[rgb(var(--text))]"
            aria-label="Chat settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Sessions strip */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] px-3 py-2 text-xs shadow-sm">
        <button
          type="button"
          onClick={createNewSession}
          className="inline-flex items-center rounded-full bg-[rgba(var(--brand),0.12)] px-3 py-1 font-medium text-[rgb(var(--brand))] hover:bg-[rgba(var(--brand),0.2)]"
        >
          +
          <span className="ml-1">New chat</span>
        </button>
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              type="button"
              onClick={() => setActiveSessionId(session.id)}
              className={[
                "group inline-flex items-center rounded-full px-3 py-1",
                isActive
                  ? "bg-[rgb(var(--panel))] text-[rgb(var(--text))]"
                  : "bg-[rgba(var(--panel),0.8)] text-[rgb(var(--subtle))] hover:bg-[rgb(var(--panel))]",
              ].join(" ")}
            >
              <span className="max-w-[150px] truncate text-xs font-medium">
                {session.title}
              </span>
              <span className="ml-2 text-[10px] text-[rgba(var(--subtle),0.8)]">
                {formatTime(session.createdAt)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(session.id);
                }}
                className="ml-2 hidden rounded-full p-0.5 text-[rgba(var(--subtle),0.7)] hover:text-red-500 group-hover:inline-flex"
                aria-label="Delete session"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </button>
          );
        })}
      </div>

      {/* Settings Drawer */}
      {settingsOpen && (
        <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] px-4 py-3 text-xs shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--subtle))]">
              Chat settings
            </span>
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="text-[11px] text-[rgb(var(--subtle))] hover:text-[rgb(var(--text))]"
            >
              Close
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-[rgb(var(--text))]">
                  Allow NSFW topics
                </p>
                <p className="text-[11px] text-[rgb(var(--subtle))]">
                  Disabled by default. Enables more open-ended debates.
                </p>
              </div>
              <IOSSwitch
                checked={settings.nsfwEnabled}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, nsfwEnabled: v }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-[rgb(var(--text))]">
                  Enable light jokes
                </p>
                <p className="text-[11px] text-[rgb(var(--subtle))]">
                  When on, Nexus can be a little playful.
                </p>
              </div>
              <IOSSwitch
                checked={settings.jokesEnabled}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, jokesEnabled: v }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-[rgb(var(--text))]">
                  Technical mode
                </p>
                <p className="text-[11px] text-[rgb(var(--subtle))]">
                  Prioritize precise, detailed answers.
                </p>
              </div>
              <IOSSwitch
                checked={settings.technicalMode}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, technicalMode: v }))
                }
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-[rgb(var(--text))]">
                  Connected apps
                </p>
                <p className="text-[11px] text-[rgb(var(--subtle))]">
                  Allow Nexus to pull context from Workspace, Outbox, and
                  Documents.
                </p>
              </div>
              <IOSSwitch
                checked={settings.connectedApps}
                onChange={(v) =>
                  setSettings((s) => ({ ...s, connectedApps: v }))
                }
              />
            </div>

            <div className="mt-4 rounded-2xl border border-red-200/70 bg-red-50/80 px-3 py-2 text-[11px] dark:border-red-900/70 dark:bg-red-950/40">
              <p className="mb-2 font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                Danger zone
              </p>
              <p className="mb-2 text-[11px] text-red-700 dark:text-red-300">
                Clear every chat session and start from a clean slate. This
                cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleClearAllSessions}
                className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-red-600"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear all sessions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed state just stops here */}
      {isCollapsed ? null : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] shadow-sm">
            <div className="flex h-full flex-col overflow-y-auto px-4 py-4">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                {messages.map((message) => {
                  const isAssistant = message.role === "assistant";
                  return (
                    <article
                      key={message.id}
                      className={[
                        "max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        isAssistant
                          ? "self-start bg-[rgb(var(--brand))] text-white"
                          : "self-end border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] text-[rgb(var(--text))]",
                      ].join(" ")}
                    >
                      <header className="mb-1 flex items-center gap-2 text-[11px] font-medium opacity-80">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px]">
                          {isAssistant ? "AI" : "You"}
                        </span>
                        <span>{isAssistant ? "Nexus" : "You"}</span>
                        <span className="ml-auto text-[10px]">
                          {formatTime(message.createdAt)}
                        </span>
                      </header>
                      <p className="whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <ul className="mt-2 flex flex-wrap gap-2 text-[10px]">
                            {message.attachments.map((name) => (
                              <li
                                key={name}
                                className="rounded-full bg-black/10 px-2 py-1"
                              >
                                {name}
                              </li>
                            ))}
                          </ul>
                        )}
                    </article>
                  );
                })}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-[rgb(var(--panel))] px-3 py-2 text-xs text-[rgb(var(--subtle))] shadow-sm">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px]">
                        AI
                      </span>
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--subtle))]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--subtle))] delay-150" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--subtle))] delay-300" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] p-3 shadow-sm"
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] text-[rgb(var(--subtle))] hover:text-[rgb(var(--text))]"
                  title="Add attachments or tools"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSpeed((prev) =>
                      prev === "slow"
                        ? "normal"
                        : prev === "normal"
                        ? "fast"
                        : "slow"
                    )
                  }
                  className="inline-flex items-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] px-2.5 py-1 text-[11px] text-[rgb(var(--subtle))] hover:text-[rgb(var(--text))]"
                >
                  <Zap className="mr-1 h-3 w-3" />
                  {speed === "slow"
                    ? "Slow"
                    : speed === "normal"
                    ? "Normal"
                    : "Fast"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isRecording ? stopDictation : startDictation}
                  className={[
                    "inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))]",
                    isRecording
                      ? "text-[rgb(var(--brand))]"
                      : "text-[rgb(var(--subtle))] hover:text-[rgb(var(--text))]",
                  ].join(" ")}
                  title="Voice dictation"
                >
                  {isRecording ? (
                    <Mic className="h-3.5 w-3.5" />
                  ) : (
                    <MicOff className="h-3.5 w-3.5" />
                  )}
                </button>
                <Waveform active={isRecording} />
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={(event) => handleFileChange(event.target.files)}
            />

            {/* Textarea */}
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                rows={2}
                placeholder="Ask me anything…"
                className="input w-full resize-none rounded-2xl border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))]"
              />

              <button
                type="submit"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(var(--brand))] text-[rgb(var(--on-accent))] shadow-sm transition hover:bg-[rgba(var(--brand),0.9)] hover:shadow-md disabled:opacity-60"
                disabled={!inputValue.trim() && pendingAttachments.length === 0}
              >
                <ArrowUpRight className="h-4 w-4 transform transition-transform group-active:translate-x-0.5 group-active:-translate-y-0.5" />
              </button>
            </div>

            {pendingAttachments.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                {pendingAttachments.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-[rgba(var(--border),0.2)] px-2 py-0.5 text-[rgb(var(--subtle))]"
                  >
                    {name}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => handleFileChange(null)}
                  className="ml-1 text-[10px] text-[rgb(var(--subtle))] underline"
                >
                  Clear
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </section>
  );
}

export default Chat;
