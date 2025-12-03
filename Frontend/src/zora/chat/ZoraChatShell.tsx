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
import { useVirtualizer } from "@tanstack/react-virtual";
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
  Sparkles,
  Square,
  Star,
  StarOff,
  Trash2,
  Zap,
} from "lucide-react";

import {
  ChatMessage,
  ChatSession,
  RESPONSE_DELAY_MS,
  Speed,
  autoTitleFromMessages,
  createFreshSession,
  createId,
  safeNow,
  useChatDispatch,
  useChatState,
} from "@/features/chat/context/ChatContext";
import type { SettingsState } from "@/features/chat/context/ChatContext";
import { useStreamingDebate } from "@/hooks/useStreamingDebate";

import { createToronShareLink, copyToClipboard } from "@/api/zoraClient";
import { ToronMessageActions } from "./RyuzenMessageActions";
import { ToronMessageBubble } from "./RyuzenMessageBubble";
import { ToronShareModal } from "./RyuzenShareModal";
import { ToronStreamingPanel } from "./RyuzenStreamingPanel";
import { useToronFeedback } from "./useRyuzenFeedback";
import { formatPreview } from "./utils";

const DEFAULT_VIRTUAL_ROW_HEIGHT = 112;
type SettingKey = keyof SettingsState;

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

const getSpeechRecognitionConstructor = () => {
  if (typeof window === "undefined") return null;
  const win = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructorLike;
    webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
};

const Waveform: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="flex items-end gap-1 text-emerald-400">
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
    </div>
  );
};

export function ToronChatShell() {
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
    (value: string[]) => dispatch({ type: "setAttachments", payload: value }),
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
  const pendingReplyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pendingAssistantMessageIdRef = useRef<string | null>(null);
  const pendingAssistantSessionIdRef = useRef<string | null>(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePreview, setSharePreview] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [feedbackSelections, setFeedbackSelections] = useState<
    Record<string, "up" | "down">
  >({});

  const {
    start: startStreamingDebate,
    firstAnswer,
    partialAnswer,
    finalAnswer,
    progress: streamProgress,
    error: streamError,
    isStreaming: isStreamingDebate,
  } = useStreamingDebate();

  const activeSession = useMemo(() => {
    const found = sessions.find((s) => s.id === activeSessionId);
    return found ?? sessions[0];
  }, [sessions, activeSessionId]);
  const messages = activeSession?.messages ?? [];

  const {
    sendFeedback,
    isSubmitting: isFeedbackSubmitting,
    lastError: feedbackError,
  } = useToronFeedback(
    activeSession?.id,
    finalAnswer?.model ?? partialAnswer?.model ?? firstAnswer?.model,
  );

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
    const existing = new Set(messages.map((message) => message.id));
    for (const key of rowSizeMapRef.current.keys()) {
      if (!existing.has(key)) {
        rowSizeMapRef.current.delete(key);
      }
    }
  }, [messages]);

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
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const shouldFollow = distanceFromBottom < 160;
    if (followMessagesRef.current !== shouldFollow) {
      followMessagesRef.current = shouldFollow;
      dispatch({ type: "setFollow", payload: shouldFollow });
    }
  }, [dispatch]);

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

  useEffect(() => {
    if (!activeSession) return;
    if (activeSessionId && sessions.some((s) => s.id === activeSessionId)) {
      return;
    }
    dispatch({ type: "setActiveSession", payload: activeSession.id });
  }, [activeSession, activeSessionId, sessions, dispatch]);

  useEffect(() => {
    setShareModalOpen(false);
  }, [activeSessionId]);

  useEffect(() => {
    setFeedbackSelections({});
  }, [activeSessionId]);

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
  const setIsRecordingState = useCallback(
    (value: boolean) => dispatch({ type: "setRecording", payload: value }),
    [dispatch],
  );
  const setVoiceSupported = useCallback(
    (value: boolean | null) => dispatch({ type: "setVoiceSupported", payload: value }),
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
  const setRenameDraft = useCallback(
    (value: string) => dispatch({ type: "setRenameDraft", payload: value }),
    [dispatch],
  );

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const byPinned = [...sessions].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    if (!query) return byPinned;
    return byPinned.filter((session) =>
      session.title.toLowerCase().includes(query),
    );
  }, [sessions, searchQuery]);

  const cleanupRecognition = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsRecordingState(false);
  }, [setIsRecordingState]);

  const startDictation = useCallback(() => {
    const SpeechRecognitionImpl = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionImpl) {
      setVoiceWarning("Voice dictation is not available in this browser.");
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
        for (let i = 0; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
      };
      recognition.onerror = (event: any) => {
        setVoiceWarning(
          event?.error ? `Voice error: ${event.error}` : "Dictation error.",
        );
        cleanupRecognition();
      };
      recognition.onend = () => {
        cleanupRecognition();
      };
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecordingState(true);
    } catch {
      setVoiceWarning("Voice dictation could not start.");
    }
  }, [cleanupRecognition, setInputValue, setIsRecordingState, setVoiceSupported, setVoiceWarning]);

  const stopDictation = useCallback(() => {
    cleanupRecognition();
  }, [cleanupRecognition]);

  useEffect(() => {
    setVoiceSupported(Boolean(getSpeechRecognitionConstructor()));
  }, [setVoiceSupported]);

  useEffect(() => () => cleanupRecognition(), [cleanupRecognition]);

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

  const createNewSession = () => {
    const fresh = createFreshSession();
    dispatch({ type: "createSession", payload: fresh });
    setTimeout(() => composerRef.current?.focus(), 0);
  };

  const handleDeleteSession = (id: string) => {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("Delete this chat?");
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
        : window.confirm("Clear all sessions?");
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
          : "Toron reply paused.";
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
          "Aurora weaves this into your thread.",
          settings.connectedApps
            ? "Connected apps are available for deeper recall."
            : "Enable connected apps to let me pull from Workspace and Outbox.",
          settings.jokesEnabled
            ? "\n\nAurora whisper: even stars pause between beats."
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
    setTimeout(() => updateActiveSessionTitleIfNeeded(activeSession.id), 0);
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
    scheduleAssistantReply(activeSession.id, sourceUserMessage, assistantMessage.id);
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      const hasContent = inputValue.trim().length > 0 || pendingAttachments.length > 0;
      if (hasContent) {
        event.preventDefault();
        const form = event.currentTarget.form;
        form?.requestSubmit();
      }
    }
  };

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
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [settingsOpen, setSettingsOpen]);

  const previousSettingsOpen = useRef(settingsOpen);
  useEffect(() => {
    if (settingsOpen) {
      firstSettingsSwitchRef.current?.focus();
    } else if (previousSettingsOpen.current) {
      settingsButtonRef.current?.focus();
    }
    previousSettingsOpen.current = settingsOpen;
  }, [settingsOpen]);

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

  const toronStatus = useMemo(() => {
    if (isRecording) {
      return {
        label: "Listening",
        classes:
          "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200 animate-pulse",
      };
    }
    if (isStreamingDebate) {
      return {
        label: "Streaming",
        classes:
          "bg-sky-100/80 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200 animate-pulse",
      };
    }
    if (isThinking) {
      return {
        label: "Thinking",
        classes:
          "bg-cyan-100/80 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-200 animate-pulse",
      };
    }
    return {
      label: "Online",
      classes: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100",
    };
  }, [isRecording, isStreamingDebate, isThinking]);

  const hasStreamingDebate = Boolean(
    firstAnswer || partialAnswer || finalAnswer || streamError || isStreamingDebate,
  );

  const handleCopyMessage = async (text: string) => {
    if (!text) return;
    await copyToClipboard(text);
  };

  const handleShareMessage = async (messageId: string) => {
    if (!activeSession) return;
    const target = activeSession.messages.find((msg) => msg.id === messageId);
    if (!target) return;
    setShareModalOpen(true);
    setSharePreview(target.content);
    setShareUrl(null);
    setShareError(null);
    setShareLoading(true);
    try {
      const { url } = await createToronShareLink({ messageId });
      setShareUrl(url);
    } catch (error) {
      setShareError(
        error instanceof Error ? error.message : "Unable to create share link",
      );
    } finally {
      setShareLoading(false);
    }
  };

  const handleFeedback = async (
    messageId: string,
    direction: "up" | "down",
  ) => {
    if (!activeSession) return;
    const target = activeSession.messages.find((msg) => msg.id === messageId);
    if (!target) return;
    setFeedbackSelections((prev) => ({ ...prev, [messageId]: direction }));
    await sendFeedback(target, direction);
  };

  const composerPlaceholder = settings.technicalMode
    ? "Ask Toron to reason through complex context…"
    : "Drop a thought and I’ll riff with you…";

  const settingsToggles: Array<{
    key: SettingKey;
    label: string;
    description: string;
    focusRef?: React.RefObject<HTMLButtonElement>;
  }> = [
    {
      key: "nsfwEnabled",
      label: "Allow NSFW",
      description: "Unlock broader discourse when required.",
      focusRef: firstSettingsSwitchRef,
    },
    {
      key: "jokesEnabled",
      label: "Playful tone",
      description: "Light jokes and sparks in replies.",
    },
    {
      key: "technicalMode",
      label: "Technical mode",
      description: "Bias toward structured, precise answers.",
    },
    {
      key: "connectedApps",
      label: "Connected apps",
      description: "Allow pull from Workspace, Outbox, Docs.",
    },
  ];

  return (
    <section className="flex h-full w-full flex-col">
      <div className="flex h-full w-full flex-col px-4 py-4 md:px-8 md:py-6">
        <div className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/10 px-4 py-4 shadow-xl backdrop-blur-2xl dark:border-slate-800/70 dark:bg-slate-950/40 md:px-6 md:py-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-30%] -top-40 h-72 rounded-[999px] bg-gradient-to-r from-sky-500/40 via-cyan-400/40 to-emerald-400/40 blur-3xl"
            style={{ animation: "aurora-sentient 22s ease-in-out infinite" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[-20%] bottom-[-30%] h-72 rounded-[999px] bg-gradient-to-r from-emerald-500/35 via-sky-500/30 to-cyan-400/35 blur-3xl"
            style={{ animation: "aurora-sentient 28s ease-in-out infinite reverse" }}
          />
          <header className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-500" aria-hidden="true" />
                <h1 className="text-base font-semibold text-slate-900 dark:text-white">
                  Toron Prime · Aurora Chat
                </h1>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${toronStatus.classes}`}>
                  {toronStatus.label}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Full-spectrum reasoning with glass-shell focus. Keep it grounded, keep it fast.
              </p>
            </div>
            <button
              ref={settingsButtonRef}
              type="button"
              onClick={() => setSettingsOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/60 text-slate-600 shadow-sm transition hover:bg-white/90 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-200"
              aria-label="Chat settings"
              aria-expanded={settingsOpen}
            >
              <Settings className="h-4 w-4" />
            </button>
          </header>

          {isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="relative z-10 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white/90 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-200"
            >
              <ChevronDown className="h-3 w-3" /> Expand
            </button>
          ) : (
            <>
              <div className="relative z-10 flex flex-col gap-3 border-t border-white/20 pt-3 lg:flex-row lg:items-center">
                <div className="flex-1 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search sessions"
                      className="h-8 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={createNewSession}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20">+</span>
                    New session
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 px-3 py-2 text-xs text-slate-600 transition hover:bg-white/60 dark:border-slate-700/70 dark:text-slate-200"
                  >
                    <ChevronUp className="h-3 w-3" /> Collapse
                  </button>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-3 overflow-x-auto pb-1 text-xs text-slate-700 dark:text-slate-200">
                {filteredSessions.map((session) => {
                  const isActive = session.id === activeSession?.id;
                  const tooltip = `${session.title}\n${formatPreview(session.messages)}\nCreated ${new Date(session.createdAt).toLocaleString()}`;
                  return (
                    <div
                      key={session.id}
                      className="group inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/60 px-3 py-1.5 shadow-sm backdrop-blur dark:border-slate-700/50 dark:bg-slate-900/50"
                      title={tooltip}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSessionId(session.id);
                          setTimeout(() => composerRef.current?.focus(), 0);
                        }}
                        onDoubleClick={() => beginRenameSession(session)}
                        className={`inline-flex items-center gap-2 text-xs font-medium ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-200"}`}
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
                            className="w-32 rounded-full border border-slate-200/80 bg-white/80 px-2 py-0.5 text-xs text-slate-900 focus:outline-none"
                          />
                        ) : (
                          <span className="max-w-[160px] truncate">{session.title}</span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(session.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePinSession(session.id)}
                        className={`rounded-full p-1 text-slate-400 transition hover:text-sky-500 dark:text-slate-500 dark:hover:text-sky-300 ${session.pinned ? "text-sky-500" : ""}`}
                        aria-label={session.pinned ? "Unpin session" : "Pin session"}
                      >
                        {session.pinned ? <Star className="h-3.5 w-3.5 fill-current" /> : <StarOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session.id)}
                        className="rounded-full p-1 text-slate-400 opacity-0 transition hover:text-rose-500 focus:opacity-100 group-hover:opacity-100"
                        aria-label="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {settingsOpen && (
                <div className="relative z-10 rounded-3xl border border-slate-200/60 bg-white/60 p-4 text-sm text-slate-900 shadow-lg backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Personalize
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Align tone, context, and integrations.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(false)}
                      className="rounded-full border border-slate-200/80 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white/70 dark:border-slate-700/70 dark:text-slate-200"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {settingsToggles.map(({ key, label, description, focusRef }) => {
                      const enabled = settings[key];
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/40 px-3 py-3 shadow-sm backdrop-blur dark:border-slate-700/40 dark:bg-slate-900/40"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
                          </div>
                          <button
                            ref={focusRef}
                            type="button"
                            role="switch"
                            aria-checked={enabled}
                            onClick={() =>
                              updateSettings({ [key]: !enabled } as Partial<SettingsState>)
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${enabled ? "border-sky-500 bg-sky-500" : "border-slate-300 bg-slate-200"}`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-5" : "translate-x-1"}`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 rounded-2xl border border-rose-200/70 bg-rose-50/70 p-3 text-xs text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100">
                    <div className="mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-semibold">Danger zone</span>
                    </div>
                    <p>Clear all sessions permanently.</p>
                    <button
                      type="button"
                      onClick={handleClearAllSessions}
                      className="mt-2 rounded-full border border-rose-200/70 px-3 py-1 font-semibold text-rose-700 hover:bg-white/40 dark:border-rose-500/40 dark:text-rose-100"
                    >
                      Clear history
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4">
            {hasStreamingDebate && (
                      <ToronStreamingPanel
                firstAnswer={firstAnswer}
                partialAnswer={partialAnswer}
                finalAnswer={finalAnswer}
                progress={streamProgress}
                isStreaming={isStreamingDebate}
                error={streamError}
              />
            )}
            <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/60 shadow-inner backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/50">
              <div
                ref={messagesContainerRef}
                className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-4"
                role="log"
                aria-live="polite"
              >
                {timelineLabel && (
                  <span className="mx-auto rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-300">
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
                    return (
                      <div
                        key={virtualRow.key}
                        ref={(node) => {
                          if (node && message.id) {
                            const height = node.getBoundingClientRect().height;
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
                          padding: "0 0.5rem",
                        }}
                      >
                        <ToronMessageBubble
                          message={message}
                          isAssistant={isAssistant}
                          onRetry={handleRetry}
                        >
                          {isAssistant && message.status !== "pending" ? (
                            <ToronMessageActions
                              messageId={message.id}
                              messageText={message.content}
                              onCopy={handleCopyMessage}
                              onShare={handleShareMessage}
                              onFeedback={handleFeedback}
                              activeDirection={feedbackSelections[message.id]}
                              disabled={isFeedbackSubmitting}
                            />
                          ) : null}
                        </ToronMessageBubble>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-4 right-4 flex flex-col justify-between gap-2">
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-600 shadow-sm transition hover:bg-white/95 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300"
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
                  className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-600 shadow-sm transition hover:bg-white/95 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300"
                  aria-label="Jump to bottom"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              {isThinking && (
                <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center">
                  <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200">
                    Composing a reply…
                    <button
                      type="button"
                      onClick={stopPendingReply}
                      className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-2 py-0.5 text-white"
                    >
                      <Square className="h-3 w-3" /> Stop
                    </button>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-slate-200/70 bg-white/10 p-4 shadow-xl backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition hover:bg-white/95 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200"
                    title="Add attachment"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSpeed((prev) =>
                        prev === "slow" ? "normal" : prev === "normal" ? "fast" : "slow",
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white/95 hover:text-slate-900 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {speed === "slow" ? "Slow" : speed === "normal" ? "Normal" : "Fast"}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => (isRecording ? stopDictation() : startDictation())}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${isRecording ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-slate-200/80 bg-white/80 text-slate-600"}`}
                    aria-pressed={isRecording}
                    aria-label={isRecording ? "Stop dictation" : "Start dictation"}
                  >
                    {isRecording ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </button>
                  <Waveform active={isRecording} />
                  {voiceWarning && (
                    <span className="flex items-center gap-1 rounded-full border border-amber-200/70 bg-amber-50/70 px-2 py-0.5 text-[11px] text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100">
                      <AlertCircle className="h-3 w-3" /> {voiceWarning}
                    </span>
                  )}
                  {voiceSupported === false && !voiceWarning && (
                    <span className="rounded-full border border-slate-200/70 bg-white/70 px-2 py-0.5 text-[11px] text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/70">
                      Voice capture unavailable
                    </span>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(event) => handleFileChange(event.target.files)}
              />

              <div className="mt-3 flex items-end gap-3 rounded-3xl border border-slate-200/70 bg-white/95 px-4 py-3 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/80">
                <textarea
                  ref={composerRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  rows={2}
                  placeholder={composerPlaceholder}
                  className="max-h-32 flex-1 resize-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!inputValue.trim() && pendingAttachments.length === 0}
                  aria-label="Send"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </button>
              </div>

              {pendingAttachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                  {pendingAttachments.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-slate-200/70 bg-white/80 px-2 py-0.5 dark:border-slate-700/70 dark:bg-slate-900/70"
                    >
                      {name}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="text-[11px] font-semibold text-slate-500 underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {feedbackError && (
                <p className="mt-2 text-xs text-rose-500">{feedbackError}</p>
              )}
            </form>
          </div>
        </div>
      </div>
      <ToronShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareUrl}
        messagePreview={sharePreview}
        loading={shareLoading}
        error={shareError}
      />
      <style>{`
        @keyframes aurora-dot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes aurora-sentient {
          0% { transform: translate3d(-4%, 2%, 0) scale(1); }
          50% { transform: translate3d(4%, -4%, 0) scale(1.08); }
          100% { transform: translate3d(-2%, 2%, 0) scale(1); }
        }
        @keyframes aurora-wave {
          0%, 100% { transform: scaleY(0.6); opacity: 0.7; }
          50% { transform: scaleY(1.3); opacity: 1; }
        }
      `}</style>
    </section>
  );
}
