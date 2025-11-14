"use client";

import React, {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  MoreHorizontal,
  Search,
  Settings,
  Square,
  Star,
  StarOff,
  Trash2,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type ChatRole = "user" | "assistant";

type MessageStatus = "pending" | "sent" | "error";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: string[];
  createdAt: string;
  status?: MessageStatus;
  replyTo?: string;
};

type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  pinned?: boolean;
};

type Speed = "slow" | "normal" | "fast";

type SettingsState = {
  nsfwEnabled: boolean;
  jokesEnabled: boolean;
  technicalMode: boolean;
  connectedApps: boolean;
};

/* ------------------------------------------------------------------ */
/* Storage & helpers                                                   */
/* ------------------------------------------------------------------ */

const STORAGE_KEYS = {
  sessions: "nexus.chat.sessions.v1",
  activeSessionId: "nexus.chat.activeSessionId.v1",
  settings: "nexus.chat.settings.v1",
} as const;

const RESPONSE_DELAY_MS: Record<Speed, number> = {
  slow: 1800,
  normal: 900,
  fast: 400,
};

const defaultSettings: SettingsState = {
  nsfwEnabled: false,
  jokesEnabled: true,
  technicalMode: true,
  connectedApps: false,
};

const safeNow = () => new Date().toISOString();

const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const initialWelcome: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to Nexus, an AI Debate Engine.\n\nAsk anything about your projects, documents, or life logistics — I’ll help you reason it out.",
  attachments: [],
  createdAt: safeNow(),
  status: "sent",
};

const createFreshSession = (): ChatSession => ({
  id: createId(),
  title: "New chat",
  createdAt: safeNow(),
  messages: [initialWelcome],
  pinned: false,
});

const isMessageStatus = (value: unknown): value is MessageStatus =>
  value === "pending" || value === "sent" || value === "error";

const sanitizeMessages = (value: unknown): ChatMessage[] => {
  if (!Array.isArray(value)) return [initialWelcome];
  return value
    .map((msg) => {
      if (!msg || typeof msg !== "object") return null;
      const { id, role, content, attachments, createdAt, status, replyTo } =
        msg as Partial<ChatMessage>;
      if (role !== "user" && role !== "assistant") return null;
      if (typeof id !== "string" || typeof content !== "string") return null;
      return {
        id,
        role,
        content,
        attachments: Array.isArray(attachments)
          ? attachments.filter((att): att is string => typeof att === "string")
          : undefined,
        createdAt: typeof createdAt === "string" ? createdAt : safeNow(),
        status: isMessageStatus(status) ? status : undefined,
        replyTo: typeof replyTo === "string" ? replyTo : undefined,
      } satisfies ChatMessage;
    })
    .filter(Boolean) as ChatMessage[];
};

const sanitizeSessions = (value: unknown): ChatSession[] => {
  if (!Array.isArray(value)) return [createFreshSession()];
  const parsed = value
    .map((session) => {
      if (!session || typeof session !== "object") return null;
      const { id, title, createdAt, messages, pinned } =
        session as Partial<ChatSession>;
      if (typeof id !== "string") return null;
      return {
        id,
        title: typeof title === "string" && title.trim() ? title : "New chat",
        createdAt: typeof createdAt === "string" ? createdAt : safeNow(),
        messages: sanitizeMessages(messages),
        pinned: Boolean(pinned),
      } satisfies ChatSession;
    })
    .filter(Boolean) as ChatSession[];
  return parsed.length ? parsed : [createFreshSession()];
};

const sanitizeSettings = (value: unknown): SettingsState => {
  if (!value || typeof value !== "object") return { ...defaultSettings };
  const data = value as Partial<SettingsState>;
  return {
    nsfwEnabled: Boolean(data.nsfwEnabled),
    jokesEnabled: data.jokesEnabled === undefined ? true : Boolean(data.jokesEnabled),
    technicalMode:
      data.technicalMode === undefined ? true : Boolean(data.technicalMode),
    connectedApps:
      data.connectedApps === undefined ? false : Boolean(data.connectedApps),
  } satisfies SettingsState;
};

const safeReadStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const safeWriteStorage = (key: string, value: unknown) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* no-op */
  }
};

const autoTitleFromMessages = (messages: ChatMessage[]): string => {
  const firstUser = messages.find((m) => m.role === "user" && m.content.trim());
  if (!firstUser) return "New chat";
  const trimmed = firstUser.content.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 42) return trimmed;
  return `${trimmed.slice(0, 39)}…`;
};

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

const formatPreview = (messages: ChatMessage[]) => {
  const firstUser = messages.find((msg) => msg.role === "user" && msg.content);
  return firstUser ? firstUser.content.split("\n")[0].slice(0, 80) : "No user messages yet.";
};

/* ------------------------------------------------------------------ */
/* Small UI bits                                                      */
/* ------------------------------------------------------------------ */

const IOSSwitch = React.forwardRef<
  HTMLButtonElement,
  {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
  }
>(({ checked, onChange, label }, ref) => (
  <button
    ref={ref}
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={[
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]",
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
));
IOSSwitch.displayName = "IOSSwitch";

const Waveform: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="flex items-end gap-1 text-[rgb(var(--brand))]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[6px] rounded-full bg-current"
          style={{
            height: `${10 + i * 4}px`,
            animation: "nexus-wave 1s ease-in-out infinite",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes nexus-wave {
          0%, 100% { transform: scaleY(0.6); opacity: 0.7; }
          50% { transform: scaleY(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function Chat() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const stored = safeReadStorage(STORAGE_KEYS.sessions);
    return sanitizeSessions(stored);
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const stored = safeReadStorage(STORAGE_KEYS.activeSessionId);
    return typeof stored === "string" ? stored : "";
  });
  const [settings, setSettings] = useState<SettingsState>(() => {
    const stored = safeReadStorage(STORAGE_KEYS.settings);
    return sanitizeSettings(stored);
  });

  const [inputValue, setInputValue] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [isThinking, setIsThinking] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstSettingsSwitchRef = useRef<HTMLButtonElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean | null>(null);
  const [voiceWarning, setVoiceWarning] = useState<string>("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const followMessagesRef = useRef(true);

  const pendingReplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const pendingAssistantMessageIdRef = useRef<string | null>(null);
  const pendingAssistantSessionIdRef = useRef<string | null>(null);

  const activeSession = useMemo(() => {
    const found = sessions.find((s) => s.id === activeSessionId);
    return found ?? sessions[0];
  }, [sessions, activeSessionId]);

  const messages = activeSession?.messages ?? [];

  /* -------------------------- Persistence --------------------------- */

  useEffect(() => {
    if (!activeSession) return;
    if (activeSessionId && sessions.some((s) => s.id === activeSessionId)) {
      return;
    }
    setActiveSessionId(activeSession.id);
  }, [activeSession, activeSessionId, sessions]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.sessions, sessions);
  }, [sessions]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.activeSessionId, activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.settings, settings);
  }, [settings]);

  /* ---------------------------- Dictation --------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionImpl =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(Boolean(SpeechRecognitionImpl));
  }, []);

  const cleanupRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }, []);

  const startDictation = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionImpl =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      setVoiceWarning("Voice not supported in this browser.");
      setVoiceSupported(false);
      return;
    }
    setVoiceWarning("");
    try {
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

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setVoiceWarning(event.error ? `Voice error: ${event.error}` : "Voice dictation error.");
        cleanupRecognition();
      };

      recognition.onend = () => {
        cleanupRecognition();
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch {
      setVoiceWarning("Voice dictation could not start.");
    }
  }, [cleanupRecognition]);

  const stopDictation = useCallback(() => {
    cleanupRecognition();
  }, [cleanupRecognition]);

  useEffect(() => () => cleanupRecognition(), [cleanupRecognition]);

  /* --------------------------- Attachments --------------------------- */

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setPendingAttachments([]);
      return;
    }
    const names = Array.from(files)
      .map((file) => file.name)
      .filter(Boolean);
    setPendingAttachments(names);
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  /* ---------------------------- Sessions ----------------------------- */

  const createNewSession = () => {
    const fresh = createFreshSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setTimeout(() => composerRef.current?.focus(), 0);
  };

  const handleDeleteSession = (id: string) => {
    const confirmed = typeof window === "undefined" ? true : window.confirm("Delete this chat session?");
    if (!confirmed) return;
    if (activeSession?.id === id) {
      stopPendingReply();
    }
    setSessions((prev) => {
      const filtered = prev.filter((session) => session.id !== id);
      if (!filtered.length) {
        const fresh = createFreshSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearAllSessions = () => {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("Clear all chat sessions and start fresh?");
    if (!confirmed) return;
    stopPendingReply();
    const fresh = createFreshSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
  };

  const togglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, pinned: !session.pinned } : session
      )
    );
  };

  const beginRenameSession = (session: ChatSession) => {
    setRenamingSessionId(session.id);
    setRenameDraft(session.title);
  };

  const saveRenameSession = (id: string, value: string) => {
    const trimmed = value.trim();
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? { ...session, title: trimmed ? trimmed : "New chat" }
          : session
      )
    );
    setRenamingSessionId(null);
    setRenameDraft("");
  };

  const cancelRenameSession = () => {
    setRenamingSessionId(null);
    setRenameDraft("");
  };

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const byPinned = [...sessions].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    if (!query) return byPinned;
    return byPinned.filter((session) =>
      session.title.toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  /* --------------------------- Messaging ----------------------------- */

  const updateSessionMessages = useCallback(
    (sessionId: string, updater: (messages: ChatMessage[]) => ChatMessage[]) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? { ...session, messages: updater(session.messages) }
            : session
        )
      );
    },
    []
  );

  const pushMessageToSession = useCallback(
    (sessionId: string, message: ChatMessage) => {
      updateSessionMessages(sessionId, (messages) => [...messages, message]);
    },
    [updateSessionMessages]
  );

  const updateMessageInSession = useCallback(
    (sessionId: string, messageId: string, updater: (message: ChatMessage) => ChatMessage) => {
      updateSessionMessages(sessionId, (messages) =>
        messages.map((message) =>
          message.id === messageId ? updater(message) : message
        )
      );
    },
    [updateSessionMessages]
  );

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    followMessagesRef.current = distanceFromBottom < 160;
  }, []);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleMessagesScroll);
    return () => el.removeEventListener("scroll", handleMessagesScroll);
  }, [handleMessagesScroll, messagesContainerRef]);

  useEffect(() => {
    if (followMessagesRef.current) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const stopPendingReply = useCallback(() => {
    if (pendingReplyTimeoutRef.current) {
      clearTimeout(pendingReplyTimeoutRef.current);
      pendingReplyTimeoutRef.current = null;
    }
    if (pendingAssistantMessageIdRef.current && pendingAssistantSessionIdRef.current) {
      const assistantId = pendingAssistantMessageIdRef.current;
      const sessionId = pendingAssistantSessionIdRef.current;
      updateMessageInSession(sessionId, assistantId, (msg) => ({
        ...msg,
        status: "error",
        content: msg.content && msg.content.trim().length
          ? msg.content
          : "Reply cancelled.",
      }));
    }
    pendingAssistantMessageIdRef.current = null;
    pendingAssistantSessionIdRef.current = null;
    setIsThinking(false);
  }, [updateMessageInSession]);

  useEffect(() => () => stopPendingReply(), [stopPendingReply]);

  const scheduleAssistantReply = useCallback(
    (sessionId: string, userMessage: ChatMessage, reuseAssistantId?: string) => {
      if (pendingReplyTimeoutRef.current) {
        clearTimeout(pendingReplyTimeoutRef.current);
        pendingReplyTimeoutRef.current = null;
      }
      const assistantId = reuseAssistantId ?? createId();
      pendingAssistantMessageIdRef.current = assistantId;
      pendingAssistantSessionIdRef.current = sessionId;
      const ensurePlaceholder = () => {
        if (reuseAssistantId) {
          updateMessageInSession(sessionId, assistantId, (message) => ({
            ...message,
            status: "pending",
            content: "",
            createdAt: message.createdAt ?? safeNow(),
            replyTo: userMessage.id,
          }));
        } else {
          const placeholder: ChatMessage = {
            id: assistantId,
            role: "assistant",
            content: "",
            createdAt: safeNow(),
            status: "pending",
            replyTo: userMessage.id,
          };
          pushMessageToSession(sessionId, placeholder);
        }
      };
      ensurePlaceholder();
      setIsThinking(true);

      const delay = RESPONSE_DELAY_MS[speed];
      const timeoutId = setTimeout(() => {
        const replyText = [
          "Got it. I’ve logged this into your Nexus thread.",
          settings.connectedApps
            ? "Because connected apps are enabled, I’ll pull context from Workspace, Outbox, and Documents when needed."
            : "Enable connected apps to let me pull context from Workspace, Outbox, and Documents automatically.",
          settings.jokesEnabled
            ? "\n\nSide note: even CPUs throttle sometimes. You’re allowed to as well."
            : "",
        ]
          .filter(Boolean)
          .join(" ");

        updateMessageInSession(sessionId, assistantId, (message) => ({
          ...message,
          status: "sent",
          content: replyText,
          createdAt: safeNow(),
          replyTo: userMessage.id,
        }));
        pendingReplyTimeoutRef.current = null;
        pendingAssistantMessageIdRef.current = null;
        pendingAssistantSessionIdRef.current = null;

        setIsThinking(false);
      }, delay);
      pendingReplyTimeoutRef.current = timeoutId;
    },
    [pushMessageToSession, settings.connectedApps, settings.jokesEnabled, speed, updateMessageInSession]
  );

  const updateActiveSessionTitleIfNeeded = useCallback(
    (sessionId: string) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) return session;
          if (session.title !== "New chat") return session;
          const nextTitle = autoTitleFromMessages(session.messages);
          return { ...session, title: nextTitle };
        })
      );
    },
    []
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeSession) return;

    if (isRecording) {
      stopDictation();
    }

    const trimmed = inputValue.trim();
    if (!trimmed && pendingAttachments.length === 0) return;

    const now = safeNow();

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      attachments: pendingAttachments,
      createdAt: now,
      status: "sent",
    };

    pushMessageToSession(activeSession.id, userMessage);
    setInputValue("");
    setPendingAttachments([]);

    setTimeout(() => updateActiveSessionTitleIfNeeded(activeSession.id), 0);

    scheduleAssistantReply(activeSession.id, userMessage);
  };

  const handleRetry = (assistantMessage: ChatMessage) => {
    if (!activeSession) return;
    const replyToId = assistantMessage.replyTo;
    const sourceUserMessage = replyToId
      ? activeSession.messages.find((msg) => msg.id === replyToId)
      : [...activeSession.messages]
          .slice(0, activeSession.messages.indexOf(assistantMessage))
          .reverse()
          .find((msg) => msg.role === "user");
    if (!sourceUserMessage) return;
    scheduleAssistantReply(activeSession.id, sourceUserMessage, assistantMessage.id);
  };

  /* -------------------------- Keyboard/A11y ------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        composerRef.current?.focus();
      }
      if (event.key === "Escape") {
        if (settingsOpen) {
          setSettingsOpen(false);
          settingsButtonRef.current?.focus();
        } else {
          setIsCollapsed(true);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [settingsOpen]);

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      const hasContent = inputValue.trim().length > 0 || pendingAttachments.length > 0;
      if (hasContent) {
        event.preventDefault();
        const form = event.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  const previousSettingsOpen = useRef(settingsOpen);

  useEffect(() => {
    if (settingsOpen) {
      firstSettingsSwitchRef.current?.focus();
    } else if (previousSettingsOpen.current) {
      settingsButtonRef.current?.focus();
    }
    previousSettingsOpen.current = settingsOpen;
  }, [settingsOpen]);

  /* ------------------------------ Render ----------------------------- */

  return (
    <section className="flex h-full flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCollapsed((value) => !value)}
            className="inline-flex items-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] px-3 py-1 text-xs font-medium text-[rgb(var(--subtle))] transition hover:bg-[rgba(var(--panel),0.92)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
            aria-pressed={!isCollapsed}
            aria-label={isCollapsed ? "Expand chat" : "Collapse chat"}
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
            <h1 className="text-sm font-semibold text-[rgb(var(--text))]">Chat Console</h1>
            <p className="text-xs text-[rgb(var(--subtle))]">
              Ask anything — Nexus will route to Workspace, Outbox, or Documents when needed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            ref={settingsButtonRef}
            type="button"
            onClick={() => setSettingsOpen((value) => !value)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(var(--border),0.8)] bg-[rgb(var(--panel))] text-[rgb(var(--subtle))] transition hover:text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
            aria-label="Chat settings"
            aria-expanded={settingsOpen}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {isCollapsed ? null : (
        <>
          {/* Search */}
          <div className="flex items-center gap-2 rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-[rgb(var(--subtle))]" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search sessions…"
              className="w-full bg-transparent text-xs text-[rgb(var(--text))] outline-none placeholder:text-[rgba(var(--subtle),0.8)]"
              aria-label="Search chat sessions"
            />
          </div>

          {/* Sessions strip */}
          <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] px-3 py-2 text-xs shadow-sm">
            <button
              type="button"
              onClick={createNewSession}
              className="inline-flex items-center rounded-full bg-[rgba(var(--brand),0.12)] px-3 py-1 font-medium text-[rgb(var(--brand))] transition hover:bg-[rgba(var(--brand),0.2)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
              aria-label="Create new chat session"
            >
              +<span className="ml-1">New chat</span>
            </button>
            {filteredSessions.map((session) => {
              const isActive = session.id === activeSession?.id;
              const tooltip = `${session.title}\n${formatPreview(session.messages)}\nCreated ${new Date(session.createdAt).toLocaleString()}`;
              return (
                <div
                  key={session.id}
                  className="group relative inline-flex items-center gap-1"
                  title={tooltip}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setTimeout(() => composerRef.current?.focus(), 0);
                    }}
                    onDoubleClick={() => beginRenameSession(session)}
                    className={[
                      "inline-flex items-center gap-2 rounded-full px-3 py-1 transition focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]",
                      isActive
                        ? "bg-[rgb(var(--panel))] text-[rgb(var(--text))]"
                        : "bg-[rgba(var(--panel),0.85)] text-[rgb(var(--subtle))] hover:bg-[rgb(var(--panel))]",
                    ].join(" ")}
                    aria-pressed={isActive}
                    aria-label={`Open session ${session.title}`}
                  >
                    {renamingSessionId === session.id ? (
                      <input
                        value={renameDraft}
                        onChange={(event) => setRenameDraft(event.target.value)}
                        onBlur={() => saveRenameSession(session.id, renameDraft)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            saveRenameSession(session.id, renameDraft);
                          } else if (event.key === "Escape") {
                            event.preventDefault();
                            cancelRenameSession();
                          }
                        }}
                        autoFocus
                        className="w-32 rounded-full bg-[rgb(var(--panel))] px-2 py-0.5 text-xs text-[rgb(var(--text))] focus:outline-none"
                        aria-label="Rename session"
                      />
                    ) : (
                      <span
                        className="max-w-[140px] truncate text-xs font-medium"
                        onClick={() => beginRenameSession(session)}
                      >
                        {session.title}
                      </span>
                    )}
                    <span className="text-[10px] text-[rgba(var(--subtle),0.8)]">
                      {formatTime(session.createdAt)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePinSession(session.id)}
                    className={[
                      "rounded-full p-1 text-[rgba(var(--subtle),0.8)] transition focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]",
                      session.pinned
                        ? "text-[rgb(var(--brand))]"
                        : "group-hover:text-[rgb(var(--subtle))]",
                    ].join(" ")}
                    aria-label={session.pinned ? "Unpin session" : "Pin session"}
                  >
                    {session.pinned ? <Star className="h-3.5 w-3.5 fill-current" /> : <StarOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(session.id)}
                    className="rounded-full p-1 text-[rgba(var(--subtle),0.7)] opacity-0 transition hover:text-red-500 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))] group-hover:opacity-100"
                    aria-label="Delete session"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
                  className="text-[11px] text-[rgb(var(--subtle))] transition hover:text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[rgb(var(--text))]">Allow NSFW topics</p>
                    <p className="text-[11px] text-[rgb(var(--subtle))]">
                      Disabled by default. Enables more open-ended debates.
                    </p>
                  </div>
                  <IOSSwitch
                    ref={firstSettingsSwitchRef}
                    checked={settings.nsfwEnabled}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, nsfwEnabled: value }))
                    }
                    label="Allow NSFW topics"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[rgb(var(--text))]">Enable light jokes</p>
                    <p className="text-[11px] text-[rgb(var(--subtle))]">
                      When on, Nexus can be a little playful.
                    </p>
                  </div>
                  <IOSSwitch
                    checked={settings.jokesEnabled}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, jokesEnabled: value }))
                    }
                    label="Enable light jokes"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[rgb(var(--text))]">Technical mode</p>
                    <p className="text-[11px] text-[rgb(var(--subtle))]">
                      Prioritize precise, detailed answers.
                    </p>
                  </div>
                  <IOSSwitch
                    checked={settings.technicalMode}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, technicalMode: value }))
                    }
                    label="Technical mode"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-[rgb(var(--text))]">Connected apps</p>
                    <p className="text-[11px] text-[rgb(var(--subtle))]">
                      Toggle integrations with Workspace, Outbox, and Documents.
                    </p>
                  </div>
                  <IOSSwitch
                    checked={settings.connectedApps}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, connectedApps: value }))
                    }
                    label="Connected apps"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[11px] text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Danger zone</span>
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                </div>
                <p>Remove sessions you no longer need. This action cannot be undone.</p>
                <button
                  type="button"
                  onClick={handleClearAllSessions}
                  className="inline-flex items-center gap-1 rounded-full border border-red-300 px-3 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 dark:border-red-700 dark:text-red-100 dark:hover:bg-red-900"
                >
                  Clear all sessions
                </button>
              </div>
            </div>
          )}

          {/* Messages & Composer */}
          <div className="grid flex-1 grid-rows-[1fr_auto] gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] shadow-sm">
              <div
                ref={messagesContainerRef}
                className="flex h-full flex-col gap-3 overflow-y-auto px-4 py-4"
                role="log"
                aria-live="polite"
              >
                {messages.map((message) => {
                  const isAssistant = message.role === "assistant";
                  const bubbleClasses = [
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm", // base
                    isAssistant
                      ? "self-start bg-[rgb(var(--brand))] text-white"
                      : "self-end border border-[rgba(var(--border),0.6)] bg-[rgb(var(--panel))] text-[rgb(var(--text))]",
                  ];

                  const showThinking = isAssistant && message.status === "pending";

                  return (
                    <div key={message.id} className="flex flex-col">
                      <div className={isAssistant ? "self-start" : "self-end"}>
                        <div className={bubbleClasses.join(" ")}>
                          {showThinking ? (
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-[rgba(255,255,255,0.2)] px-3 py-1 text-xs">
                                Nexus is thinking…
                              </span>
                              <div className="flex items-center gap-1">
                                {[0, 1, 2].map((dot) => (
                                  <span
                                    key={dot}
                                    className="h-2 w-2 rounded-full bg-white/80"
                                    style={{
                                      animation: "nexus-dot 1.2s infinite",
                                      animationDelay: `${dot * 0.2}s`,
                                    }}
                                  />
                                ))}
                              </div>
                              <style>{`
                                @keyframes nexus-dot {
                                  0%, 100% { opacity: 0.3; transform: translateY(0); }
                                  50% { opacity: 1; transform: translateY(-2px); }
                                }
                              `}</style>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="whitespace-pre-wrap break-words text-sm">
                                {message.content}
                              </p>
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="flex flex-wrap gap-1 text-[11px] opacity-90">
                                  {message.attachments.map((name) => (
                                    <span
                                      key={name}
                                      className="rounded-full bg-white/20 px-2 py-0.5"
                                    >
                                      {name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {message.status === "error" && (
                                <button
                                  type="button"
                                  onClick={() => handleRetry(message)}
                                  className="text-xs font-medium underline decoration-dotted hover:decoration-solid focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                                >
                                  Retry
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className="mt-1 text-[10px] text-[rgba(var(--subtle),0.8)]"
                        aria-hidden="true"
                      >
                        {formatTime(message.createdAt)}
                        {message.status === "error" ? " · Failed" : null}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pointer-events-none absolute inset-y-0 right-3 flex flex-col justify-between py-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] text-[rgb(var(--subtle))] transition hover:text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                    aria-label="Jump to top"
                    title="Jump to top"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      scrollToBottom();
                      composerRef.current?.focus();
                    }}
                    className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] text-[rgb(var(--subtle))] transition hover:text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                    aria-label="Jump to latest"
                    title="Jump to latest"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isThinking && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 rounded-full border border-[rgba(var(--border),0.6)] bg-[rgb(var(--panel))] px-3 py-1 text-xs text-[rgb(var(--subtle))] shadow-sm">
                    <span>Nexus is preparing a reply…</span>
                    <button
                      type="button"
                      onClick={stopPendingReply}
                      className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--brand))] px-2 py-0.5 text-[11px] text-[rgb(var(--on-accent))] transition hover:bg-[rgba(var(--brand),0.85)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                      aria-label="Stop generating reply"
                    >
                      <Square className="h-3 w-3" /> Stop
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgb(var(--surface))] p-3 shadow-sm"
            >
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] text-[rgb(var(--subtle))] transition hover:text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                    title="Add attachments or tools"
                    aria-label="Add attachments or tools"
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
                    className="inline-flex items-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] px-2.5 py-1 text-[11px] text-[rgb(var(--subtle))] transition hover:text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                    aria-label="Toggle response speed"
                  >
                    <Zap className="mr-1 h-3 w-3" />
                    {speed === "slow" ? "Slow" : speed === "normal" ? "Normal" : "Fast"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => (isRecording ? stopDictation() : startDictation())}
                      className={[
                        "inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] transition focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]",
                        isRecording
                          ? "text-[rgb(var(--brand))]"
                          : "text-[rgb(var(--subtle))] hover:text-[rgb(var(--text))]",
                      ].join(" ")}
                      aria-pressed={isRecording}
                      aria-label={isRecording ? "Stop voice dictation" : "Start voice dictation"}
                    >
                      {isRecording ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                    </button>
                    <Waveform active={isRecording} />
                  </div>
                  {voiceWarning && (
                    <span className="flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100">
                      <AlertCircle className="h-3 w-3" /> {voiceWarning}
                    </span>
                  )}
                  {voiceSupported === false && !voiceWarning && (
                    <span className="rounded-full bg-[rgba(var(--border),0.3)] px-2 py-0.5 text-[10px] text-[rgb(var(--subtle))]">
                      Voice not supported in this browser.
                    </span>
                  )}
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
                  ref={composerRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  rows={2}
                  placeholder="Ask me anything…"
                  className="input w-full resize-none rounded-2xl border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] px-3 py-2 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--brand))] focus:ring-1 focus:ring-[rgb(var(--brand))]"
                  aria-label="Chat composer"
                />

                <button
                  type="submit"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(var(--brand))] text-[rgb(var(--on-accent))] shadow-sm transition hover:bg-[rgba(var(--brand),0.9)] hover:shadow-md disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                  disabled={!inputValue.trim() && pendingAttachments.length === 0}
                  aria-label="Send message"
                >
                  <ArrowUpRight className="h-4 w-4 transform transition-transform group-active:translate-x-0.5 group-active:-translate-y-0.5" />
                </button>
              </div>

              {pendingAttachments.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                  {pendingAttachments.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-[rgba(var(--border),0.6)] bg-[rgb(var(--panel))] px-2 py-0.5 text-[rgb(var(--subtle))]"
                    >
                      {name}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="ml-1 text-[10px] text-[rgb(var(--subtle))] underline hover:text-[rgb(var(--text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]"
                  >
                    Clear
                  </button>
                </div>
              )}
            </form>
          </div>
        </>
      )}
    </section>
  );
}

export default Chat;
