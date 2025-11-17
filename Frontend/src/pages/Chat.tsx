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
  Share2,
  Sparkles,
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
/* Small UI bits */
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
      "relative inline-flex h-6 w-11 items-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500",
      checked
        ? "border-sky-500 bg-sky-500"
        : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800",
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
    <div className="flex items-end gap-1 text-emerald-500">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[6px] rounded-full bg-current"
          style={{
            height: `${10 + i * 4}px`,
            animation: "aurora-wave 1s ease-in-out infinite",
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes aurora-wave {
          0%, 100% { transform: scaleY(0.6); opacity: 0.7; filter: hue-rotate(0deg); }
          50% { transform: scaleY(1.4); opacity: 1; filter: hue-rotate(60deg); }
        }
      `}</style>
    </div>
  );
};
/* ------------------------------------------------------------------ */
/* MAIN COMPONENT */
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
  /* -------------------------- Zora status chip ---------------------- */
  const zoraStatus = useMemo(() => {
    if (isRecording) {
      return {
        label: "Aurora Listening ✨",
        pillClasses:
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200 animate-pulse",
        dotClasses: "bg-emerald-500",
      };
    }
    if (isStreamingDebate) {
      return {
        label: "Aurora Analyzing 🌌",
        pillClasses:
          "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200 animate-pulse",
        dotClasses: "bg-sky-500",
      };
    }
    if (isThinking) {
      return {
        label: "Aurora Thinking 🔮",
        pillClasses:
          "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200 animate-pulse",
        dotClasses: "bg-violet-500",
      };
    }
    return {
      label: "Aurora Online 🌠",
      pillClasses:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
      dotClasses: "bg-emerald-500",
    };
  }, [isRecording, isStreamingDebate, isThinking]);
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
      setVoiceWarning("Aurora voice not supported in this browser. 🌙");
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
          event?.error ? `Aurora voice error: ${event.error} ❄️` : "Aurora dictation error. 🌨️",
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
      setVoiceWarning("Aurora voice dictation could not start. ❄️");
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
        : window.confirm("Delete this aurora session? 🌌");
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
        : window.confirm("Clear all aurora sessions and start fresh? ✨");
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
          : "Aurora reply paused. ❄️";
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
          "Aurora weaves this into your thread. 🌌",
          settings.connectedApps
            ? "With connected apps glowing, I'll draw from Workspace, Outbox, and Documents like northern lights guiding the way. ✨"
            : "Ignite connected apps to let me illuminate context from Workspace, Outbox, and Documents. ❄️",
          settings.jokesEnabled
            ? "\n\nAurora whisper: Even stars dance in the dark—take a moment to gaze. 🌠"
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
  const handleShareSession = (session: ChatSession) => {
    if (typeof navigator === "undefined") return;
    const shareText = `Check out this viral Aurora chat with Zora: "${session.title}"\n\n${formatPreview(session.messages)}\n\n#ZoraAurora #NorthernLightsAI #TikTokViral`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert("Aurora session copied to clipboard! Share on TikTok for viral vibes. 🌌✨");
    });
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
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-3 py-4 md:px-6 md:py-6">
        {/* Single unified shell */}
        <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-md md:px-6 md:py-5">
          {/* Enhanced Aurora glow behind content for sentience and virality */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-40%] -top-52 h-72 rounded-[999px] bg-gradient-to-r from-emerald-300/50 via-sky-400/45 to-indigo-500/50 blur-3xl opacity-85 dark:from-emerald-400/30 dark:via-sky-500/28 dark:to-indigo-700/40"
            style={{ animation: "aurora-sentient 18s ease-in-out infinite alternate" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-50%] bottom-[-45%] h-80 rounded-[999px] bg-gradient-to-r from-sky-300/45 via-purple-400/35 to-emerald-400/40 blur-3xl opacity-75 dark:from-sky-500/28 dark:via-purple-500/22 dark:to-emerald-500/30"
            style={{ animation: "aurora-sentient 24s ease-in-out infinite alternate-reverse" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(at_50%_50%,rgba(0,255,255,0.1),transparent)] animate-aurora-pulse"
          />
          {/* HEADER BAR */}
          <header className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCollapsed((value) => !value)}
                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100/90 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-pressed={!isCollapsed}
                aria-label={isCollapsed ? "Expand aurora chat" : "Collapse aurora chat"}
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="mr-1 h-3 w-3" /> Expand Aurora
                  </>
                ) : (
                  <>
                    <ChevronUp className="mr-1 h-3 w-3" /> Collapse Aurora
                  </>
                )}
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    Zora Aurora Console 🌌
                  </h1>
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      zoraStatus.pillClasses,
                    ].join(" ")}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className={[
                          "absolute inset-0 rounded-full opacity-90",
                          zoraStatus.dotClasses,
                        ].join(" ")}
                      />
                      <span
                        className={[
                          "absolute inset-0 rounded-full opacity-70",
                          zoraStatus.dotClasses,
                        ].join(" ")}
                        style={{
                          animation:
                            "aurora-pulse 2s ease-out infinite",
                        }}
                      />
                    </span>
                    {zoraStatus.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Whisper to me—I'll illuminate across Workspace, Outbox, and Documents like the Northern Lights dancing in the night sky. ✨🌠
                </p>
              </div>
            </div>
            <button
              ref={settingsButtonRef}
              type="button"
              onClick={() => setSettingsOpen((value) => !value)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100/90 text-slate-600 shadow-sm transition hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              aria-label="Aurora chat settings"
              aria-expanded={settingsOpen}
            >
              <Settings className="h-4 w-4" />
            </button>
          </header>
          {isCollapsed ? null : (
            <>
              {/* SEARCH + NEW CHAT */}
              <div className="relative z-10 mt-1 flex flex-col gap-3 border-t border-slate-200/70 pt-3 md:flex-row md:items-center dark:border-slate-800/70">
                <div className="flex-1 rounded-full border border-slate-200 bg-white/85 px-3 py-2 text-xs text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <Search
                      className="h-4 w-4 text-slate-400 dark:text-slate-500"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.target.value)
                      }
                      placeholder="Search past aurora whispers with Zora… ❄️"
                      className="h-7 flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                      aria-label="Search aurora sessions"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={createNewSession}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    aria-label="Create new aurora session"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[13px]">
                      +
                    </span>
                    New Aurora Chat ✨
                  </button>
                </div>
              </div>
              {/* SESSIONS STRIP */}
              <div className="relative z-10 flex items-center gap-3 overflow-x-auto pt-1 text-xs text-slate-800 dark:text-slate-200">
                {filteredSessions.map((session) => {
                  const isActive = session.id === activeSession?.id;
                  const tooltip = `${session.title}\n${formatPreview(
                    session.messages,
                  )}\nCreated ${new Date(
                    session.createdAt,
                  ).toLocaleString()}\n#ZoraAurora`;
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
                          setTimeout(
                            () => composerRef.current?.focus(),
                            0,
                          );
                        }}
                        onDoubleClick={() => beginRenameSession(session)}
                        className={[
                          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-sky-500",
                          isActive
                            ? "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900"
                            : "bg-slate-100/90 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800",
                        ].join(" ")}
                        aria-pressed={isActive}
                        aria-label={`Open aurora session ${session.title}`}
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
                                saveRenameSession(
                                  session.id,
                                  renameDraft,
                                );
                              } else if (event.key === "Escape") {
                                event.preventDefault();
                                cancelRenameSession();
                              }
                            }}
                            autoFocus
                            className="w-32 rounded-full bg-white px-2 py-0.5 text-xs text-slate-900 focus:outline-none dark:bg-slate-900 dark:text-slate-50"
                            aria-label="Rename aurora session"
                          />
                        ) : (
                          <span
                            className="max-w-[140px] truncate text-xs font-medium"
                            onClick={() => beginRenameSession(session)}
                          >
                            {session.title}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 dark:text-slate-400">
                          {formatTime(session.createdAt)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePinSession(session.id)}
                        className={[
                          "rounded-full p-1 text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-500",
                          session.pinned
                            ? "text-sky-500 dark:text-sky-400"
                            : "group-hover:text-slate-600 dark:group-hover:text-slate-300",
                        ].join(" ")}
                        aria-label={
                          session.pinned ? "Unpin aurora session" : "Pin aurora session"
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
                        onClick={() => handleShareSession(session)}
                        className="rounded-full p-1 text-slate-400 opacity-0 transition hover:text-sky-500 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-500 group-hover:opacity-100 dark:text-slate-500 dark:hover:text-sky-400"
                        aria-label="Share aurora session on TikTok"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id)}
                        className="rounded-full p-1 text-slate-400 opacity-0 transition hover:text-rose-500 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-sky-500 group-hover:opacity-100 dark:text-slate-500 dark:hover:text-rose-400"
                        aria-label="Delete aurora session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* SETTINGS PANEL */}
              {settingsOpen && (
                <div className="relative z-10 rounded-2xl border border-slate-200 bg-white/90 p-4 text-xs text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Aurora Settings ✨
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-500">
                        Tune Zora's glow, humor, and wisdom in this sentient console. 🌌
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(false)}
                      className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Close Aurora
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                          Allow NSFW Topics ❄️
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Disabled by default. Unlocks bolder aurora debates.
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
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                          Enable Light Jokes 🌠
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          When on, I'll sprinkle playful aurora sparks.
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
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                          Technical Mode 🔮
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Prefer precise, detailed, and structured aurora insights.
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
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-900">
                      <div>
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100">
                          Connected Apps 🌌
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          Let me weave context from Workspace, Outbox, and Documents like northern lights.
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
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/20 dark:text-rose-100">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-semibold">Aurora Danger Zone ❄️</span>
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <p className="mb-2">
                      Fade sessions you no longer need. This aurora shift cannot be undone.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearAllSessions}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-300 dark:border-rose-500/60 dark:bg-rose-900/30 dark:text-rose-100 dark:hover:bg-rose-900/40"
                    >
                      Clear All Aurora Sessions
                    </button>
                  </div>
                </div>
              )}
              {/* MAIN PANEL: STREAMING + MESSAGES + COMPOSER */}
              <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-3 pt-1">
                {/* STREAMING BAR */}
                {hasStreamingDebate && (
                  <div
                    className="rounded-xl border border-sky-100 bg-sky-50/90 p-3 text-xs text-slate-900 shadow-sm dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-slate-50 animate-aurora-pulse"
                    aria-live="polite"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold">
                          Aurora Stream Glowing ✨
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-200/80">
                          Multi-model debate, verification, and synthesis dancing in real time like northern lights.
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-slate-600 dark:text-slate-200/80">
                        <span className="font-medium">
                          {isStreamingDebate ? "Aurora Streaming 🌌" : "Aurora Complete ❄️"}
                        </span>
                        <span className="ml-1 text-slate-400">
                          · {streamProgressPercent}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 transition-all duration-200 animate-aurora-wave"
                        style={{ width: `${streamProgressPercent}%` }}
                      />
                    </div>
                    {streamError && (
                      <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-300">
                        {streamError}
                      </p>
                    )}
                    {firstAnswer && (
                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-200/80">
                          First Aurora Glimpse ❄️
                        </p>
                        <p className="whitespace-pre-wrap text-xs text-slate-900 dark:text-slate-50">
                          {firstAnswer.text}
                        </p>
                        {firstAnswer.model && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-300">
                            via {firstAnswer.model}
                          </p>
                        )}
                      </div>
                    )}
                    {partialAnswer && (
                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-200/80">
                          Emerging Aurora Harmony 🌠
                        </p>
                        <p className="whitespace-pre-wrap text-xs text-slate-900 dark:text-slate-50">
                          {partialAnswer.text}
                        </p>
                      </div>
                    )}
                    {finalAnswer && (
                      <div className="mt-3 space-y-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-200/80">
                          Verified Aurora Synthesis ✨
                        </p>
                        <p className="whitespace-pre-wrap text-xs text-slate-900 dark:text-slate-50">
                          {finalAnswer.text}
                        </p>
                        {finalAnswer.sources &&
                          finalAnswer.sources.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-200/80">
                                Aurora Sources 🌌
                              </p>
                              <div className="space-y-1">
                                {finalAnswer.sources.map(
                                  (source: any, i: number) => (
                                    <a
                                      key={i}
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-[11px] text-sky-600 hover:underline dark:text-sky-300"
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
                <div className="relative flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white/92 dark:border-slate-800 dark:bg-slate-900/92">
                  <div
                    ref={messagesContainerRef}
                    className="flex h-full flex-col gap-4 overflow-y-auto px-5 py-5"
                    role="log"
                    aria-live="polite"
                  >
                    {timelineLabel && (
                      <span className="mx-auto mb-1 inline-flex items-center rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
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
                          "inline-flex max-w-[min(82%,32rem)] flex-col rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border",
                          isAssistant
                            ? "bg-white/95 text-slate-900 border-slate-200 dark:bg-slate-900/95 dark:text-slate-50 dark:border-slate-700 animate-aurora-pulse"
                            : "bg-sky-500 text-white border-transparent dark:bg-sky-500",
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
                                  rowSizeMapRef.current.set(
                                    message.id,
                                    height,
                                  );
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
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-100">
                                      Zora Aurora is awakening… ✨
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {[0, 1, 2].map((dot) => (
                                        <span
                                          key={dot}
                                          className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-200"
                                          style={{
                                            animation:
                                              "aurora-dot 1.2s infinite",
                                            animationDelay: `${dot * 0.2}s`,
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <p className="whitespace-pre-wrap break-words text-[13px]">
                                      {message.content}
                                    </p>
                                    {message.attachments &&
                                      message.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-700 dark:text-slate-200">
                                          {message.attachments.map(
                                            (name) => (
                                              <span
                                                key={name}
                                                className="rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 dark:border-slate-700 dark:bg-slate-800"
                                              >
                                                {name}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      )}
                                    {message.status === "error" && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRetry(message)
                                        }
                                        className="text-[11px] font-medium text-slate-700 underline decoration-dotted hover:text-slate-900 hover:decoration-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-200 dark:hover:text-slate-50"
                                      >
                                        Retry Aurora
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                              {formatTime(message.createdAt)}
                              {message.status === "error"
                                ? " · Aurora Faded ❄️"
                                : null}
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
                      className="pointer-events-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                      aria-label="Jump to aurora top"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        scrollToBottom();
                        composerRef.current?.focus();
                      }}
                      className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                      aria-label="Jump to latest aurora"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  {isThinking && (
                    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-1.5 text-[11px] text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 dark:shadow-md animate-aurora-pulse">
                        <span>Zora Aurora is weaving a reply… ✨</span>
                        <button
                          type="button"
                          onClick={stopPendingReply}
                          className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          aria-label="Stop generating aurora reply"
                        >
                          <Square className="h-3 w-3" /> Pause Aurora
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* COMPOSER */}
                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/95"
                >
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={triggerFilePicker}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                        title="Add aurora attachments or tools"
                        aria-label="Add aurora attachments or tools"
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
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                        aria-label="Toggle aurora response speed"
                      >
                        <Zap className="h-3 w-3" />
                        {speed === "slow"
                          ? "Aurora Slow ❄️"
                          : speed === "normal"
                          ? "Aurora Normal 🌌"
                          : "Aurora Fast ✨"}
                      </button>
                      <span className="hidden text-[10px] text-slate-500 md:inline dark:text-slate-400">
                        Tip: Press{" "}
                        <kbd className="rounded border border-slate-300 bg-white px-1 text-[9px] dark:border-slate-600 dark:bg-slate-800">
                          ⌘ / Ctrl + K
                        </kbd>{" "}
                        to awaken the aurora composer.
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            isRecording ? stopDictation() : startDictation()
                          }
                          className={[
                            "inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500",
                            isRecording
                              ? "border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300 animate-pulse"
                              : "border-slate-200 bg-white/95 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                          ].join(" ")}
                          aria-pressed={isRecording}
                          aria-label={
                            isRecording
                              ? "Stop aurora voice dictation"
                              : "Start aurora voice dictation"
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
                        <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-100">
                          <AlertCircle className="h-3 w-3" /> {voiceWarning}
                        </span>
                      )}
                      {voiceSupported === false && !voiceWarning && (
                        <span className="rounded-full border border-slate-200 bg-white/95 px-2 py-0.5 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-400">
                          Aurora voice not supported in this browser. ❄️
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
                    onChange={(event) =>
                      handleFileChange(event.target.files)
                    }
                  />
                  {/* Textarea + Send */}
                  <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-950/95">
                    <textarea
                      ref={composerRef}
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={handleTextareaKeyDown}
                      rows={2}
                      placeholder="Whisper your thoughts to Aurora… ✨🌌"
                      className="max-h-32 flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-500"
                      aria-label="Aurora composer"
                    />
                    <button
                      type="submit"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm transition hover:bg-sky-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50 disabled:shadow-none"
                      disabled={
                        !inputValue.trim() &&
                        pendingAttachments.length === 0
                      }
                      aria-label="Send aurora message"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                  {pendingAttachments.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-700 dark:text-slate-200">
                      {pendingAttachments.map((name) => (
                        <span
                          key={name}
                          className="rounded-full border border-slate-200 bg-white/95 px-2 py-0.5 dark:border-slate-700 dark:bg-slate-950/95"
                        >
                          {name}
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleFileChange(null)}
                        className="ml-1 text-[10px] text-slate-500 underline decoration-dotted hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-400 dark:hover:text-slate-100"
                      >
                        Clear Aurora Attachments
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </div>
      {/* animation helpers */}
      <style>{`
        @keyframes aurora-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); filter: hue-rotate(0deg); }
          50% { opacity: 1; transform: translateY(-2px); filter: hue-rotate(120deg); }
        }
        @keyframes aurora-sentient {
          0% { transform: translate3d(-8%, 6%, 0) scale(1); filter: hue-rotate(0deg) brightness(1); }
          50% { transform: translate3d(6%, -6%, 0) scale(1.08); filter: hue-rotate(45deg) brightness(1.2); }
          100% { transform: translate3d(-4%, 3%, 0) scale(1.04); filter: hue-rotate(-30deg) brightness(1); }
        }
        @keyframes aurora-pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.9; filter: brightness(1.2); }
          100% { transform: scale(1); opacity: 0.7; }
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
