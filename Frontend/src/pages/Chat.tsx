"use client";

import React, {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useStreamingDebate } from "@/hooks/useStreamingDebate";
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

import {
  ChatMessage,
  ChatProvider,
  ChatSession,
  Speed,
  RESPONSE_DELAY_MS,
  autoTitleFromMessages,
  createFreshSession,
  createId,
  safeNow,
  useChatDispatch,
  useChatState,
} from "@/features/chat/context/ChatContext";

const DEFAULT_VIRTUAL_ROW_HEIGHT = 96;

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

const getSpeechRecognitionConstructor = () => {
  if (typeof window === "undefined") return null;
  const win = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
};

const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

const formatPreview = (messages: ChatMessage[]) => {
  const firstUser = messages.find((msg) => msg.role === "user" && msg.content);
  return firstUser
    ? firstUser.content.split("\n")[0].slice(0, 80)
    : "No user messages yet.";
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
      "relative inline-flex h-6 w-11 items-center rounded-full border border-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]",
      checked
        ? "bg-[rgb(var(--brand))]"
        : "bg-[rgba(15,23,42,0.85)]",
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

function ChatInner() {
  const {
    sessions,
    activeSessionId,
    settings,
    inputValue,
    pendingAttachments,
    isCollapsed,
    speed,
    isThinking,
    settingsOpen,
    isRecording,
    voiceSupported,
    voiceWarning,
    searchQuery,
    renamingSessionId,
    renameDraft,
    followMessages,
  } = useChatState();
  const dispatch = useChatDispatch();

  const setInputValue = useCallback(
    (value: string) => dispatch({ type: "setInput", payload: value }),
    [dispatch],
  );

  const setPendingAttachments = useCallback(
    (value: string[]) =>
      dispatch({ type: "setAttachments", payload: value }),
    [dispatch],
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstSettingsSwitchRef = useRef<HTMLButtonElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const followMessagesRef = useRef(followMessages);
  const rowSizeMapRef = useRef(new Map<string, number>());

  const {
    start: startStreamingDebate,
    firstAnswer,
    partialAnswer,
    finalAnswer,
    progress: streamProgress,
    error: streamError,
    isStreaming: isStreamingDebate,
  } = useStreamingDebate();
  const hasStreamingDebate = Boolean(
    firstAnswer || partialAnswer || finalAnswer || streamError || isStreamingDebate,
  );
  const streamProgressPercent = Math.max(
    0,
    Math.min(100, Math.round(streamProgress * 100)),
  );

  const setActiveSessionId = useCallback(
    (value: string) => dispatch({ type: "setActiveSession", payload: value }),
    [dispatch],
  );

  const updateSettings = useCallback(
    (partial: Partial<typeof settings>) =>
      dispatch({ type: "setSettings", payload: partial }),
    [dispatch],
  );

  const setIsCollapsed = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(isCollapsed) : value;
      dispatch({ type: "setCollapsed", payload: next });
    },
    [dispatch, isCollapsed],
  );

  const setSpeed = useCallback(
    (value: Speed | ((prev: Speed) => Speed)) => {
      const next = typeof value === "function" ? value(speed) : value;
      dispatch({ type: "setSpeed", payload: next });
    },
    [dispatch, speed],
  );

  const setIsThinking = useCallback(
    (value: boolean) => dispatch({ type: "setThinking", payload: value }),
    [dispatch],
  );

  const setSettingsOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(settingsOpen) : value;
      dispatch({ type: "setSettingsOpen", payload: next });
    },
    [dispatch, settingsOpen],
  );

  const setIsRecording = useCallback(
    (value: boolean) => dispatch({ type: "setRecording", payload: value }),
    [dispatch],
  );

  const setVoiceSupported = useCallback(
    (value: boolean | null) =>
      dispatch({ type: "setVoiceSupported", payload: value }),
    [dispatch],
  );

  const setVoiceWarning = useCallback(
    (value: string) => dispatch({ type: "setVoiceWarning", payload: value }),
    [dispatch],
  );

  const setSearchQuery = useCallback(
    (value: string) => dispatch({ type: "setSearchQuery", payload: value }),
    [dispatch],
  );

  const setFollowMessages = useCallback(
    (value: boolean) => dispatch({ type: "setFollow", payload: value }),
    [dispatch],
  );

  const setRenameDraft = useCallback(
    (value: string) => dispatch({ type: "setRenameDraft", payload: value }),
    [dispatch],
  );

  const pendingReplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pendingAssistantMessageIdRef = useRef<string | null>(null);
  const pendingAssistantSessionIdRef = useRef<string | null>(null);

  const activeSession = useMemo(() => {
    const found = sessions.find((s) => s.id === activeSessionId);
    return found ?? sessions[0];
  }, [sessions, activeSessionId]);

  const messages = activeSession?.messages ?? [];

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => messagesContainerRef.current,
    estimateSize: (index) => {
      const message = messages[index];
      if (!message) return DEFAULT_VIRTUAL_ROW_HEIGHT;
      return rowSizeMapRef.current.get(message.id) ?? DEFAULT_VIRTUAL_ROW_HEIGHT;
    },
    getItemKey: (index) => messages[index]?.id ?? index,
    overscan: 8,
  });

  useEffect(() => {
    const existingIds = new Set(messages.map((message) => message.id));
    for (const key of rowSizeMapRef.current.keys()) {
      if (!existingIds.has(key)) {
        rowSizeMapRef.current.delete(key);
      }
    }
  }, [messages]);

  const timelineLabel = useMemo(() => {
    if (!messages.length) return null;
    const firstTimestamp = messages[0]?.createdAt;
    if (!firstTimestamp) return null;
    const firstDate = new Date(firstTimestamp);
    const today = new Date();
    const isSameDay = today.toDateString() === firstDate.toDateString();
    const dateFormatter = new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    });
    const timeFormatter = new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    });
    const prefix = isSameDay ? "Today" : dateFormatter.format(firstDate);
    return `${prefix} at ${timeFormatter.format(firstDate)}`;
  }, [messages]);

  /* -------------------------- Persistence --------------------------- */

  useEffect(() => {
    if (!activeSession) return;
    if (activeSessionId && sessions.some((s) => s.id === activeSessionId)) {
      return;
    }
    setActiveSessionId(activeSession.id);
  }, [activeSession, activeSessionId, sessions, setActiveSessionId]);

  /* ---------------------------- Dictation --------------------------- */

  useEffect(() => {
    setVoiceSupported(Boolean(getSpeechRecognitionConstructor()));
  }, [setVoiceSupported]);

  const cleanupRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecording(false);
  }, [setIsRecording]);

  const startDictation = useCallback(() => {
    const SpeechRecognitionImpl = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionImpl) {
      setVoiceWarning("Voice not supported in this browser.");
      setVoiceSupported(false);
      return;
    }
    setVoiceWarning("");
    try {
      const recognition: SpeechRecognitionLike = new SpeechRecognitionImpl();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
      };

      recognition.onerror = (event: any) => {
        setVoiceWarning(
          event?.error ? `Voice error: ${event.error}` : "Voice dictation error.",
        );
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
  }, [
    cleanupRecognition,
    setInputValue,
    setIsRecording,
    setVoiceSupported,
    setVoiceWarning,
  ]);

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
    dispatch({ type: "createSession", payload: fresh });
    setTimeout(() => composerRef.current?.focus(), 0);
  };

  const handleDeleteSession = (id: string) => {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("Delete this chat session?");
    if (!confirmed) return;
    if (activeSession?.id === id) {
      stopPendingReply();
    }
    dispatch({ type: "deleteSession", payload: id });
  };

  const handleClearAllSessions = () => {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("Clear all chat sessions and start fresh?");
    if (!confirmed) return;
    stopPendingReply();
    const sessionIds = sessions.map((session) => session.id);
    sessionIds.forEach((sessionId) => {
      dispatch({ type: "deleteSession", payload: sessionId });
    });
  };

  const togglePinSession = (id: string) => {
    dispatch({ type: "togglePin", payload: id });
  };

  const beginRenameSession = (session: ChatSession) => {
    dispatch({
      type: "startRename",
      payload: { sessionId: session.id, draft: session.title },
    });
  };

  const saveRenameSession = (id: string, value: string) => {
    dispatch({
      type: "commitRename",
      payload: { sessionId: id, title: value },
    });
  };

  const cancelRenameSession = () => {
    dispatch({ type: "cancelRename" });
  };

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const byPinned = [...sessions].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
    if (!query) return byPinned;
    return byPinned.filter((session) =>
      session.title.toLowerCase().includes(query),
    );
  }, [sessions, searchQuery]);

  /* --------------------------- Messaging ----------------------------- */

  const pushMessageToSession = useCallback(
    (sessionId: string, message: ChatMessage) => {
      dispatch({ type: "appendMessage", payload: { sessionId, message } });
    },
    [dispatch],
  );

  const updateMessageInSession = useCallback(
    (sessionId: string, messageId: string, patch: Partial<ChatMessage>) => {
      dispatch({
        type: "updateMessage",
        payload: { sessionId, messageId, patch },
      });
    },
    [dispatch],
  );

  const getMessageFromSession = useCallback(
    (sessionId: string, messageId: string) => {
      const session = sessions.find((item) => item.id === sessionId);
      return session?.messages.find((message) => message.id === messageId);
    },
    [sessions],
  );

  useEffect(() => {
    followMessagesRef.current = followMessages;
  }, [followMessages]);

  const scrollToBottom = useCallback(() => {
    if (messages.length === 0) return;
    virtualizer.scrollToIndex(messages.length - 1, { align: "end" });
  }, [messages.length, virtualizer]);

  const scrollToTop = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    const shouldFollow = distanceFromBottom < 160;
    if (followMessagesRef.current !== shouldFollow) {
      followMessagesRef.current = shouldFollow;
      setFollowMessages(shouldFollow);
    }
  }, [setFollowMessages]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleMessagesScroll);
    return () => el.removeEventListener("scroll", handleMessagesScroll);
  }, [handleMessagesScroll]);

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
    if (
      pendingAssistantMessageIdRef.current &&
      pendingAssistantSessionIdRef.current
    ) {
      const assistantId = pendingAssistantMessageIdRef.current;
      const sessionId = pendingAssistantSessionIdRef.current;
      const existing = getMessageFromSession(sessionId, assistantId);
      const fallbackContent =
        existing?.content && existing.content.trim().length
          ? existing.content
          : "Reply cancelled.";
      updateMessageInSession(sessionId, assistantId, {
        status: "error",
        content: fallbackContent,
      });
    }
    pendingAssistantMessageIdRef.current = null;
    pendingAssistantSessionIdRef.current = null;
    setIsThinking(false);
  }, [getMessageFromSession, updateMessageInSession, setIsThinking]);

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
          const existing = getMessageFromSession(sessionId, assistantId);
          updateMessageInSession(sessionId, assistantId, {
            status: "pending",
            content: "",
            createdAt: existing?.createdAt ?? safeNow(),
            replyTo: userMessage.id,
          });
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

        updateMessageInSession(sessionId, assistantId, {
          status: "sent",
          content: replyText,
          createdAt: safeNow(),
          replyTo: userMessage.id,
        });
        pendingReplyTimeoutRef.current = null;
        pendingAssistantMessageIdRef.current = null;
        pendingAssistantSessionIdRef.current = null;

        setIsThinking(false);
      }, delay);
      pendingReplyTimeoutRef.current = timeoutId;
    },
    [
      getMessageFromSession,
      pushMessageToSession,
      settings.connectedApps,
      settings.jokesEnabled,
      speed,
      updateMessageInSession,
      setIsThinking,
    ],
  );

  const updateActiveSessionTitleIfNeeded = useCallback(
    (sessionId: string) => {
      const session = sessions.find((item) => item.id === sessionId);
      if (!session || session.title !== "New chat") return;
      const nextTitle = autoTitleFromMessages(session.messages);
      dispatch({
        type: "commitRename",
        payload: { sessionId, title: nextTitle },
      });
    },
    [dispatch, sessions],
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

    setTimeout(
      () => updateActiveSessionTitleIfNeeded(activeSession.id),
      0,
    );

    scheduleAssistantReply(activeSession.id, userMessage);
    void startStreamingDebate({ prompt: trimmed });
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
    scheduleAssistantReply(
      activeSession.id,
      sourceUserMessage,
      assistantMessage.id,
    );
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
  }, [settingsOpen, setIsCollapsed, setSettingsOpen]);

  const handleTextareaKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      const hasContent =
        inputValue.trim().length > 0 || pendingAttachments.length > 0;
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
    <section className="flex h-full w-full flex-col">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4 px-3 py-4 md:px-6 md:py-6">
        {/* HEADER BAR */}
        <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_55%),rgba(15,23,42,0.96)] px-4 py-3 shadow-[0_22px_70px_rgba(0,0,0,0.75)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-pressed={!isCollapsed}
              aria-label={isCollapsed ? "Expand chat" : "Collapse chat"}
            >
              {isCollapsed ? (
                <>
                  <ChevronDown className="mr-1 h-3 w-3" /> Expand
                </>
              ) : (
                <>
                  <ChevronUp className="mr-1 h-3 w-3" /> Collapse
                </>
              )}
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-slate-50">
                  Chat Console
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Ask anything — Nexus will route to Workspace, Outbox, or
                Documents when needed.
              </p>
            </div>
          </div>

          <button
            ref={settingsButtonRef}
            type="button"
            onClick={() => setSettingsOpen((value) => !value)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-300 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Chat settings"
            aria-expanded={settingsOpen}
          >
            <Settings className="h-4 w-4" />
          </button>
        </header>

        {isCollapsed ? null : (
          <>
            {/* SEARCH + NEW CHAT */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="flex-1 rounded-full bg-slate-950/80 px-3 py-2 text-xs text-slate-200 ring-1 ring-white/8 shadow-[0_18px_45px_rgba(0,0,0,0.75)] backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <Search
                    className="h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search sessions…"
                    className="h-7 flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    aria-label="Search chat sessions"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={createNewSession}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_18px_55px_rgba(56,189,248,0.6)] transition hover:shadow-[0_18px_65px_rgba(56,189,248,0.9)] focus:outline-none focus:ring-2 focus:ring-sky-400"
                  aria-label="Create new chat session"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-900/90 text-[13px] text-sky-300">
                    +
                  </span>
                  New chat
                </button>
              </div>
            </div>

            {/* SESSIONS STRIP */}
            <div className="flex items-center gap-3 overflow-x-auto rounded-3xl bg-slate-950/75 px-3 py-2 text-xs text-slate-200 ring-1 ring-white/8 shadow-[0_18px_45px_rgba(0,0,0,0.75)] backdrop-blur-xl">
              {filteredSessions.map((session) => {
                const isActive = session.id === activeSession?.id;
                const tooltip = `${session.title}\n${formatPreview(
                  session.messages,
                )}\nCreated ${new Date(
                  session.createdAt,
                ).toLocaleString()}`;
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
                        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-sky-400",
                        isActive
                          ? "bg-slate-800/80 text-slate-50"
                          : "bg-slate-900/70 text-slate-300 hover:bg-slate-800/80",
                      ].join(" ")}
                      aria-pressed={isActive}
                      aria-label={`Open session ${session.title}`}
                    >
                      {renamingSessionId === session.id ? (
                        <input
                          value={renameDraft}
                          onChange={(event) =>
                            setRenameDraft(event.target.value)
                          }
                          onBlur={() =>
                            saveRenameSession(session.id, renameDraft)
                          }
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
                          className="w-32 rounded-full bg-slate-900/90 px-2 py-0.5 text-xs text-slate-50 focus:outline-none"
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
                      <span className="text-[10px] text-slate-400">
                        {formatTime(session.createdAt)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePinSession(session.id)}
                      className={[
                        "rounded-full p-1 text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-sky-400",
                        session.pinned
                          ? "text-sky-400"
                          : "group-hover:text-slate-300",
                      ].join(" ")}
                      aria-label={
                        session.pinned ? "Unpin session" : "Pin session"
                      }
                    >
                      {session.pinned ? (
                        <Star className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <StarOff className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session.id)}
                      className="rounded-full p-1 text-slate-500/70 opacity-0 transition hover:text-rose-400 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-400 group-hover:opacity-100"
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* SETTINGS DRAWER */}
            {settingsOpen && (
              <div className="rounded-3xl bg-slate-950/90 p-4 text-xs text-slate-100 ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Chat settings
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Tune how Nexus responds inside this console.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    Close
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-900/70 px-3 py-3 ring-1 ring-white/10">
                    <div>
                      <p className="text-xs font-medium text-slate-100">
                        Allow NSFW topics
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Disabled by default. Enables more open-ended debates.
                      </p>
                    </div>
                    <IOSSwitch
                      ref={firstSettingsSwitchRef}
                      checked={settings.nsfwEnabled}
                      onChange={(value) =>
                        updateSettings({ nsfwEnabled: value })
                      }
                      label="Allow NSFW topics"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-900/70 px-3 py-3 ring-1 ring-white/10">
                    <div>
                      <p className="text-xs font-medium text-slate-100">
                        Enable light jokes
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        When on, Nexus can be a little playful.
                      </p>
                    </div>
                    <IOSSwitch
                      checked={settings.jokesEnabled}
                      onChange={(value) =>
                        updateSettings({ jokesEnabled: value })
                      }
                      label="Enable light jokes"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-900/70 px-3 py-3 ring-1 ring-white/10">
                    <div>
                      <p className="text-xs font-medium text-slate-100">
                        Technical mode
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Prioritize precise, detailed answers.
                      </p>
                    </div>
                    <IOSSwitch
                      checked={settings.technicalMode}
                      onChange={(value) =>
                        updateSettings({ technicalMode: value })
                      }
                      label="Technical mode"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-900/70 px-3 py-3 ring-1 ring-white/10">
                    <div>
                      <p className="text-xs font-medium text-slate-100">
                        Connected apps
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Integrate Workspace, Outbox, and Documents.
                      </p>
                    </div>
                    <IOSSwitch
                      checked={settings.connectedApps}
                      onChange={(value) =>
                        updateSettings({ connectedApps: value })
                      }
                      label="Connected apps"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-[11px] text-rose-100">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-semibold">Danger zone</span>
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="mb-2">
                    Remove sessions you no longer need. This action cannot be
                    undone.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAllSessions}
                    className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1 text-[11px] font-semibold text-rose-100 ring-1 ring-rose-400/60 transition hover:bg-rose-500/25 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    Clear all sessions
                  </button>
                </div>
              </div>
            )}

            {/* MAIN PANEL: MESSAGES + COMPOSER */}
            <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-3xl bg-slate-950/90 p-4 ring-1 ring-white/10 shadow-[0_26px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
              {/* STREAMING BAR */}
              {hasStreamingDebate && (
                <div
                  className="mb-3 rounded-2xl bg-gradient-to-r from-sky-500/18 via-cyan-400/10 to-transparent p-3 text-xs text-slate-50 ring-1 ring-sky-400/30 shadow-[0_18px_50px_rgba(56,189,248,0.45)]"
                  aria-live="polite"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold">
                        Streaming debate
                      </p>
                      <p className="text-[11px] text-slate-200/80">
                        Live responses with multi-model consensus and
                        verification.
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-200/80">
                      <span className="font-medium">
                        {isStreamingDebate ? "Streaming" : "Complete"}
                      </span>
                      <span className="ml-1 text-slate-400">
                        · {streamProgressPercent}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-200"
                      style={{ width: `${streamProgressPercent}%` }}
                    />
                  </div>

                  {streamError && (
                    <p className="mt-2 text-[11px] text-rose-300">
                      {streamError}
                    </p>
                  )}

                  {firstAnswer && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-200/80">
                        Quick answer
                      </p>
                      <p className="whitespace-pre-wrap text-xs text-slate-50">
                        {firstAnswer.text}
                      </p>
                      {firstAnswer.model && (
                        <p className="text-[10px] text-slate-300">
                          via {firstAnswer.model}
                        </p>
                      )}
                    </div>
                  )}

                  {partialAnswer && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-200/80">
                        Partial consensus
                      </p>
                      <p className="whitespace-pre-wrap text-xs text-slate-50">
                        {partialAnswer.text}
                      </p>
                    </div>
                  )}

                  {finalAnswer && (
                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-200/80">
                        Verified answer
                      </p>
                      <p className="whitespace-pre-wrap text-xs text-slate-50">
                        {finalAnswer.text}
                      </p>
                      {finalAnswer.sources &&
                        finalAnswer.sources.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-[10px] font-semibold text-slate-200/80">
                              Sources
                            </p>
                            <div className="space-y-1">
                              {finalAnswer.sources.map(
                                (source: any, i: number) => (
                                  <a
                                    key={i}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-[11px] text-sky-300 hover:underline"
                                  >
                                    {source.title || source.url}
                                  </a>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}

              {/* MESSAGE LIST */}
              <div className="relative flex min-h-0 flex-1 flex-col rounded-2xl bg-slate-900/70 ring-1 ring-white/8">
                <div
                  ref={messagesContainerRef}
                  className="flex h-full flex-col gap-4 overflow-y-auto px-5 py-5"
                  role="log"
                  aria-live="polite"
                >
                  {timelineLabel && (
                    <span className="mx-auto mb-1 inline-flex items-center rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-white/10 backdrop-blur">
                      {timelineLabel}
                    </span>
                  )}

                  <div
                    style={{
                      height: `${virtualizer.getTotalSize()}px`,
                      width: "100%",
                      position: "relative",
                    }}
                  >
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                      const message = messages[virtualRow.index];
                      if (!message) return null;
                      const isAssistant = message.role === "assistant";
                      const bubbleClasses = [
                        "inline-flex max-w-[min(82%,32rem)] flex-col rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-[0_18px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl ring-1 ring-white/10",
                        isAssistant
                          ? "bg-slate-900/95 text-slate-50"
                          : "bg-gradient-to-br from-sky-500 to-cyan-400 text-slate-950",
                      ];
                      const showThinking =
                        isAssistant && message.status === "pending";
                      return (
                        <div
                          key={virtualRow.key}
                          ref={(node) => {
                            if (node && message.id) {
                              const height =
                                node.getBoundingClientRect().height;
                              if (!Number.isNaN(height)) {
                                rowSizeMapRef.current.set(message.id, height);
                              }
                              virtualizer.measureElement(node);
                            }
                          }}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          className="flex flex-col"
                        >
                          <div
                            className={
                              isAssistant ? "self-start" : "self-end"
                            }
                          >
                            <div className={bubbleClasses.join(" ")}>
                              {showThinking ? (
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px]">
                                    Nexus is thinking…
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {[0, 1, 2].map((dot) => (
                                      <span
                                        key={dot}
                                        className="h-1.5 w-1.5 rounded-full bg-white/40"
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
                                  <p className="whitespace-pre-wrap break-words text-[13px]">
                                    {message.content}
                                  </p>
                                  {message.attachments &&
                                    message.attachments.length > 0 && (
                                      <div className="flex flex-wrap gap-1 text-[10px] text-slate-200/80">
                                        {message.attachments.map((name) => (
                                          <span
                                            key={name}
                                            className="rounded-full bg-black/20 px-2 py-0.5"
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
                                      className="text-[11px] font-medium text-slate-200/80 underline decoration-dotted hover:text-slate-50 hover:decoration-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                                    >
                                      Retry
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="mt-1 text-[10px] text-slate-400">
                            {formatTime(message.createdAt)}
                            {message.status === "error" ? " · Failed" : null}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SCROLL CONTROLS */}
                <div className="pointer-events-none absolute inset-y-4 right-4 flex flex-col justify-between">
                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="pointer-events-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/90 text-slate-300 ring-1 ring-white/10 transition hover:bg-slate-800 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    aria-label="Jump to top"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToBottom();
                      composerRef.current?.focus();
                    }}
                    className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/90 text-slate-300 ring-1 ring-white/10 transition hover:bg-slate-800 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    aria-label="Jump to latest"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                {isThinking && (
                  <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900/95 px-4 py-1.5 text-[11px] text-slate-200 ring-1 ring-white/12 shadow-[0_16px_45px_rgba(0,0,0,0.75)]">
                      <span>Nexus is preparing a reply…</span>
                      <button
                        type="button"
                        onClick={stopPendingReply}
                        className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[11px] font-semibold text-slate-950 shadow-[0_12px_35px_rgba(56,189,248,0.65)] hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                        aria-label="Stop generating reply"
                      >
                        <Square className="h-3 w-3" /> Stop
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* COMPOSER */}
              <form
                onSubmit={handleSubmit}
                className="mt-2 flex flex-col gap-3 rounded-2xl bg-slate-900/80 px-4 py-3 ring-1 ring-white/10 backdrop-blur-xl"
              >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={triggerFilePicker}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/80 text-slate-300 ring-1 ring-white/10 transition hover:bg-slate-800 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
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
                            : "slow",
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-300 ring-1 ring-white/10 transition hover:bg-slate-800 hover:text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      aria-label="Toggle response speed"
                    >
                      <Zap className="h-3 w-3" />
                      {speed === "slow"
                        ? "Slow"
                        : speed === "normal"
                        ? "Normal"
                        : "Fast"}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          isRecording ? stopDictation() : startDictation()
                        }
                        className={[
                          "inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-white/10 transition focus:outline-none focus:ring-2 focus:ring-sky-400",
                          isRecording
                            ? "bg-sky-500/15 text-sky-300"
                            : "bg-slate-950/80 text-slate-300 hover:bg-slate-800 hover:text-slate-50",
                        ].join(" ")}
                        aria-pressed={isRecording}
                        aria-label={
                          isRecording
                            ? "Stop voice dictation"
                            : "Start voice dictation"
                        }
                      >
                        {isRecording ? (
                          <Mic className="h-3.5 w-3.5" />
                        ) : (
                          <MicOff className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Waveform active={isRecording} />
                    </div>

                    {voiceWarning && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-100 ring-1 ring-amber-400/50">
                        <AlertCircle className="h-3 w-3" /> {voiceWarning}
                      </span>
                    )}
                    {voiceSupported === false && !voiceWarning && (
                      <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-400 ring-1 ring-white/10">
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

                {/* Textarea + Send */}
                <div className="flex items-end gap-3 rounded-2xl bg-slate-950/85 px-4 py-2 ring-1 ring-white/10 shadow-[0_16px_45px_rgba(0,0,0,0.65)]">
                  <textarea
                    ref={composerRef}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    rows={2}
                    placeholder="Ask me anything…"
                    className="max-h-32 flex-1 resize-none bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
                    aria-label="Chat composer"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-slate-950 shadow-[0_18px_55px_rgba(56,189,248,0.75)] transition hover:shadow-[0_18px_65px_rgba(56,189,248,0.95)] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-50 disabled:shadow-none"
                    disabled={
                      !inputValue.trim() && pendingAttachments.length === 0
                    }
                    aria-label="Send message"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                {pendingAttachments.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-200">
                    {pendingAttachments.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-slate-900/70 px-2 py-0.5 ring-1 ring-white/10"
                      >
                        {name}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleFileChange(null)}
                      className="ml-1 text-[10px] text-slate-400 underline decoration-dotted hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </form>
            </div>
          </>
        )}
      </div>

      {/* little animation helpers */}
      <style jsx>{`
        .bg-zora-space {
          background: radial-gradient(
              circle at top left,
              rgba(56, 189, 248, 0.16),
              transparent 55%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(129, 140, 248, 0.18),
              transparent 55%
            ),
            #020617;
        }
      `}</style>
    </section>
  );
}

export function Chat() {
  return (
    <ChatProvider>
      <ChatInner />
    </ChatProvider>
  );
}

export default Chat;
