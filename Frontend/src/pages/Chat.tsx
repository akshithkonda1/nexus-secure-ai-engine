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
import { useNavigate } from "react-router-dom";
import { Plus, Mic, Send, Settings, Zap } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: string[];
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
};

type Speed = "slow" | "medium" | "fast";

type SettingsState = {
  nsfwEnabled: boolean;
  humorEnabled: boolean;
  technicalMode: boolean;
  connectedAppsEnabled: boolean;
};

/* ------------------------------------------------------------------ */
/* Constants & Helpers                                                */
/* ------------------------------------------------------------------ */

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to Nexus, an AI Debate Engine.\n\nAsk anything about your projects, documents, or life logistics — I’ll help you reason it out.",
};

const SETTINGS_KEY = "nexusChatSettings";
const SESSIONS_KEY = "nexusChatSessions";

const createEmptySession = (): ChatSession => ({
  id: crypto.randomUUID(),
  title: "New chat",
  messages: [INITIAL_MESSAGE],
});

const loadSettings = (): SettingsState => {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return {
        nsfwEnabled: false,
        humorEnabled: true,
        technicalMode: false,
        connectedAppsEnabled: false,
      };
    }
    return JSON.parse(raw) as SettingsState;
  } catch {
    return {
      nsfwEnabled: false,
      humorEnabled: true,
      technicalMode: false,
      connectedAppsEnabled: false,
    };
  }
};

const saveSettings = (value: SettingsState) => {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
  } catch {
    // non-critical
  }
};

const loadSessions = (): ChatSession[] => {
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (!raw) {
      return [createEmptySession()];
    }
    const sessions = JSON.parse(raw) as ChatSession[];
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return [createEmptySession()];
    }
    return sessions;
  } catch {
    return [createEmptySession()];
  }
};

const saveSessions = (sessions: ChatSession[]) => {
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // non-critical
  }
};

const autoTitleFromMessage = (message: string): string => {
  const trimmed = message.trim();
  if (!trimmed) return "New chat";
  const firstLine = trimmed.split("\n")[0];
  const short = firstLine.slice(0, 40);
  return short.length < firstLine.length ? `${short}…` : short;
};

const speedDelayMs: Record<Speed, number> = {
  slow: 1300,
  medium: 700,
  fast: 300,
};

/* ------------------------------------------------------------------ */
/* Reusable Toggle (iOS-style)                                       */
/* ------------------------------------------------------------------ */

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 text-left hover:bg-[rgba(var(--panel),0.95)] transition-colors"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-[rgb(var(--text))]">{label}</p>
        {description && (
          <p className="mt-1 text-xs text-[rgb(var(--subtle))]">
            {description}
          </p>
        )}
      </div>
      <div
        className={[
          "relative h-6 w-11 rounded-full transition-colors",
          checked
            ? "bg-[rgb(var(--brand))] shadow-[0_0_0_1px_rgba(15,23,42,0.25)]"
            : "bg-[rgba(var(--border),0.9)]",
        ].join(" ")}
      >
        <div
          className={[
            "absolute top-[2px] h-5 w-5 rounded-full bg-[rgb(var(--surface))] shadow-md transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-[2px]",
          ].join(" ")}
        />
      </div>
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Voice Waveform Hook                                                */
/* ------------------------------------------------------------------ */

const useVoiceWaveform = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    setIsRecording(false);
    if (animationRef.current != null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    if (isRecording) {
      stop();
      return;
    }
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      streamRef.current = stream;

      setIsRecording(true);

      const draw = () => {
        const canvas = canvasRef.current;
        const analyserNode = analyserRef.current;
        const data = dataArrayRef.current;
        if (!canvas || !analyserNode || !data) return;

        const ctx2d = canvas.getContext("2d");
        if (!ctx2d) return;

        analyserNode.getByteTimeDomainData(data);

        const { width, height } = canvas;
        ctx2d.clearRect(0, 0, width, height);

        ctx2d.fillStyle = "rgba(15,23,42,0.03)";
        ctx2d.fillRect(0, 0, width, height);

        ctx2d.lineWidth = 2;
        ctx2d.strokeStyle = "rgba(56,189,248,0.9)";
        ctx2d.beginPath();

        const sliceWidth = (width * 1.0) / data.length;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
          const v = data[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx2d.moveTo(x, y);
          } else {
            ctx2d.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx2d.lineTo(width, height / 2);
        ctx2d.stroke();

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.error(err);
      setError("Microphone permission denied or unavailable.");
      stop();
    }
  }, [isRecording, stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { isRecording, error, start, stop, canvasRef };
};

/* ------------------------------------------------------------------ */
/* Speech-to-Text (Dictation) Hook                                    */
/* ------------------------------------------------------------------ */

type SpeechToTextOptions = {
  onFinal: (text: string) => void;
};

const useSpeechToText = (options: SpeechToTextOptions) => {
  const [isDictating, setIsDictating] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any | null>(null);

  const stop = useCallback(() => {
    setIsDictating(false);
    setInterimTranscript("");
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isDictating) {
      stop();
      return;
    }

    setError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsDictating(true);
      setInterimTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let finalText = "";

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalText += res[0].transcript;
        } else {
          interim += res[0].transcript;
        }
      }

      if (interim) setInterimTranscript(interim.trim());
      if (finalText) {
        setInterimTranscript("");
        options.onFinal(finalText.trim());
      }
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      setError("Speech recognition error.");
      setIsDictating(false);
    };

    recognition.onend = () => {
      setIsDictating(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isDictating, options, stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { isDictating, interimTranscript, error, start, stop };
};

/* ------------------------------------------------------------------ */
/* Typing Indicator (iOS-style bubble)                                */
/* ------------------------------------------------------------------ */

const TypingIndicator: React.FC = () => (
  <div className="mt-4 flex justify-start">
    <div className="inline-flex items-center gap-2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 shadow-sm">
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--subtle))] [animation-delay:-0.2s]" />
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--subtle))] [animation-delay:-0.1s]" />
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--subtle))]" />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Main Chat Component                                                */
/* ------------------------------------------------------------------ */

export function Chat() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string>(
    () => loadSessions()[0]?.id ?? createEmptySession().id
  );

  const [inputValue, setInputValue] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "settings">("chat");
  const [speed, setSpeed] = useState<Speed>("medium");
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings());

  const {
    isRecording,
    error: voiceWaveError,
    start: startWaveform,
    stop: stopWaveform,
    canvasRef,
  } = useVoiceWaveform();

  const {
    isDictating,
    interimTranscript,
    error: dictationError,
    start: startDictation,
    stop: stopDictation,
  } = useSpeechToText({
    onFinal: (text) => {
      setInputValue((prev) => {
        if (!prev) return text;
        const separator = prev.endsWith(" ") ? "" : " ";
        return `${prev}${separator}${text}`;
      });
    },
  });

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const plusMenuRef = useRef<HTMLDivElement | null>(null);
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* Persist settings & sessions */

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  /* Active session helpers */

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? sessions[0],
    [sessions, activeSessionId]
  );

  const messages = activeSession?.messages ?? [];

  /* Auto-scroll */

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, isSending]);

  /* Plus menu outside-click close */

  useEffect(() => {
    if (!plusMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (!plusMenuRef.current) return;
      if (!plusMenuRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [plusMenuOpen]);

  /* Session operations */

  const handleNewSession = () => {
    const next = createEmptySession();
    setSessions((prev) => [...prev, next]);
    setActiveSessionId(next.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      if (prev.length <= 1) {
        // Don't allow deleting the final session
        return prev;
      }

      const next = prev.filter((s) => s.id !== id);
      if (id === activeSessionId && next.length > 0) {
        const fallback = next[next.length - 1] ?? next[0];
        setActiveSessionId(fallback.id);
      }

      return next;
    });
  };

  /* Message & reply logic — FIX: always append using functional setSessions */

  const addUserMessage = (content: string, attachments: string[]) => {
    if (!activeSession) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      attachments: attachments.length ? attachments : undefined,
    };

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;

        const newMessages = [...session.messages, userMsg];
        const newTitle =
          session.title === "New chat"
            ? autoTitleFromMessage(content)
            : session.title;

        return {
          ...session,
          title: newTitle,
          messages: newMessages,
        };
      })
    );
  };

  const addAssistantMessage = (content: string) => {
    if (!activeSession) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
    };

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;
        return {
          ...session,
          messages: [...session.messages, msg],
        };
      })
    );
  };

  const simulateAssistantReply = (userContent: string) => {
    setIsSending(true);

    const preview =
      userContent.length > 200
        ? `${userContent.slice(0, 200)}…`
        : userContent || "your last update";

    const parts: string[] = [];

    if (settings.technicalMode) {
      parts.push(
        "Processing your request with a structured reasoning pass (Nexus technical mode enabled)."
      );
    } else {
      parts.push("Got it. I’ve logged this into your Nexus thread.");
    }

    parts.push("");

    if (settings.connectedAppsEnabled) {
      parts.push(
        "When connected apps are configured, this reply can pull from Workspace, Outbox, and Documents automatically."
      );
    } else {
      parts.push(
        "You can enable Connected Apps in Settings to let Nexus coordinate with Workspace, Outbox, and Documents."
      );
    }

    if (settings.humorEnabled) {
      parts.push("");
      parts.push(
        "Side note: if this feels like a lot, remember — even CPUs throttle sometimes."
      );
    }

    if (settings.nsfwEnabled) {
      parts.push("");
      parts.push(
        "NSFW toggle is ON, but Nexus will still follow global safety rules. It just won’t act shocked by spicy topics."
      );
    }

    parts.push("");
    parts.push(`Preview of what I heard:\n“${preview}”`);

    setTimeout(() => {
      addAssistantMessage(parts.join("\n"));
      setIsSending(false);
    }, speedDelayMs[speed]);
  };

  /* Form handlers */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | { preventDefault: () => void }
  ) => {
    event.preventDefault();
    if (!activeSession) return;

    const trimmed = inputValue.trim();
    if (!trimmed && pendingAttachments.length === 0) return;

    addUserMessage(trimmed, pendingAttachments);

    setInputValue("");
    setPendingAttachments([]);

    simulateAssistantReply(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit({ preventDefault() {} });
    }
  };

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setPendingAttachments([]);
      return;
    }
    const fileNames = Array.from(files).map((file) => file.name);
    setPendingAttachments(fileNames);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  /* Speed control UI */

  const SpeedControl: React.FC = () => (
    <div className="relative">
      <div className="inline-flex items-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-xs overflow-hidden">
        {(["slow", "medium", "fast"] as Speed[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setSpeed(value)}
            className={[
              "px-3 py-1 capitalize transition-colors",
              speed === value
                ? "bg-[rgb(var(--brand))] text-[rgb(var(--on-accent))]"
                : "text-[rgb(var(--subtle))] hover:bg-[rgba(var(--border),0.35)]",
            ].join(" ")}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );

  /* Settings handlers */

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  /* Plus menu actions */

  const handleGoWorkspace = () => navigate("/workspace");
  const handleGoOutbox = () => navigate("/outbox");
  const handleGoDocuments = () => navigate("/documents");

  /* Mic toggle: waveform + dictation together */

  const handleToggleVoice = () => {
    const shouldStop = isRecording || isDictating;

    if (shouldStop) {
      stopWaveform();
      stopDictation();
    } else {
      startDictation();
      startWaveform();
    }
  };

  /* Render */

  return (
    <section className="flex h-full flex-col gap-4">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[rgba(var(--brand),0.15)] text-[rgb(var(--brand))]">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[rgb(var(--text))]">
              Nexus Chat Console
            </h1>
            <p className="text-xs text-[rgb(var(--subtle))]">
              Debate engine · voice dictation · multi-session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="inline-flex rounded-full bg-[rgb(var(--panel))] border border-[rgb(var(--border))] p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={[
                "px-3 py-1 rounded-full",
                activeTab === "chat"
                  ? "bg-[rgb(var(--surface))] text-[rgb(var(--text))] shadow-sm"
                  : "text-[rgb(var(--subtle))]",
              ].join(" ")}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={[
                "px-3 py-1 rounded-full",
                activeTab === "settings"
                  ? "bg-[rgb(var(--surface))] text-[rgb(var(--text))] shadow-sm"
                  : "text-[rgb(var(--subtle))]",
              ].join(" ")}
            >
              Settings
            </button>
          </div>

          {/* Minimize */}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1 text-xs text-[rgb(var(--subtle))] hover:bg-[rgba(var(--panel),0.95)] transition-colors"
          >
            {isCollapsed ? "Expand" : "Minimize"}
          </button>
        </div>
      </header>

      {/* Content */}
      {!isCollapsed && activeTab === "chat" && (
        <>
          {/* Chat panel */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] shadow-sm">
            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto p-6 space-y-4"
            >
              {messages.map((message) => {
                const isAssistant = message.role === "assistant";
                return (
                  <div
                    key={message.id}
                    className={[
                      "flex w-full",
                      isAssistant ? "justify-start" : "justify-end",
                    ].join(" ")}
                  >
                    <article
                      className={[
                        "max-w-xl rounded-2xl px-5 py-4 shadow-sm border transition-colors",
                        isAssistant
                          ? "bg-[rgb(var(--brand))] border-[rgb(var(--brand))] text-[rgb(var(--on-accent))]"
                          : "bg-white dark:bg-[rgb(var(--panel))] border-[rgb(var(--border))] text-[rgb(var(--text))]",
                      ].join(" ")}
                    >
                      <header
                        className={[
                          "mb-2 flex items-center gap-2 text-xs font-medium",
                          isAssistant
                            ? "text-[rgba(255,255,255,0.85)]"
                            : "text-[rgb(var(--subtle))]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                            isAssistant
                              ? "bg-[rgba(255,255,255,0.18)] text-[rgb(var(--on-accent))]"
                              : "bg-brand/10 text-brand",
                          ].join(" ")}
                        >
                          {isAssistant ? "AI" : "You"}
                        </span>
                        <span>{isAssistant ? "Nexus" : "You"}</span>
                      </header>
                      <p
                        className={[
                          "whitespace-pre-wrap leading-relaxed",
                          isAssistant
                            ? "text-[rgb(var(--on-accent))]"
                            : "text-[rgb(var(--text))]",
                        ].join(" ")}
                      >
                        {message.content}
                      </p>
                      {message.attachments &&
                        message.attachments.length > 0 && (
                          <ul className="mt-3 flex flex-wrap gap-2 text-[10px]">
                            {message.attachments.map((attachment) => (
                              <li
                                key={attachment}
                                className={[
                                  "rounded-full px-3 py-1",
                                  isAssistant
                                    ? "bg-[rgba(255,255,255,0.18)] text-[rgb(var(--on-accent))]"
                                    : "border border-brand/30 bg-brand/10 text-brand",
                                ].join(" ")}
                              >
                                {attachment}
                              </li>
                            ))}
                          </ul>
                        )}
                    </article>
                  </div>
                );
              })}

              {isSending && <TypingIndicator />}
            </div>
          </div>

          {/* Sessions row (below chat) */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-3 text-xs shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full">
              <span className="text-[rgb(var(--subtle))] whitespace-nowrap">
                Sessions:
              </span>
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setActiveSessionId(session.id)}
                  className={[
                    "relative mr-1 flex items-center gap-1 rounded-full px-3 py-1 whitespace-nowrap border text-[11px] transition-colors",
                    session.id === activeSessionId
                      ? "border-[rgb(var(--brand))] bg-[rgba(var(--brand),0.18)] text-[rgb(var(--text))]"
                      : "border-[rgba(var(--border),0.9)] text-[rgb(var(--subtle))] hover:bg-[rgba(var(--border),0.35)]",
                  ].join(" ")}
                >
                  <span className="truncate max-w-[120px]">
                    {session.title}
                  </span>
                  {sessions.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-[rgb(var(--subtle))] hover:bg-[rgba(0,0,0,0.08)] hover:text-[rgb(var(--text))]"
                      aria-label="Delete session"
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleNewSession}
              className="flex items-center gap-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1 text-[11px] text-[rgb(var(--text))] hover:bg-[rgba(var(--panel),0.96)]"
            >
              <Plus className="h-3 w-3" />
              New
            </button>
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Left: plus + speed + voice */}
              <div className="flex items-center gap-2">
                {/* Plus menu */}
                <div className="relative" ref={plusMenuRef}>
                  <button
                    type="button"
                    onClick={() => setPlusMenuOpen((v) => !v)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-[rgb(var(--text))] hover:bg-[rgba(var(--panel),0.95)]"
                    aria-label="More actions"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  {plusMenuOpen && (
                    <div className="absolute left-0 top-10 z-20 w-52 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-2 text-xs shadow-md">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[rgb(var(--text))] hover:bg-[rgb(var(--panel))]"
                        onClick={handleGoWorkspace}
                      >
                        Go to Workspace
                        <span className="text-[rgb(var(--subtle))]">↗</span>
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[rgb(var(--text))] hover:bg-[rgb(var(--panel))]"
                        onClick={handleGoOutbox}
                      >
                        Open Outbox
                        <span className="text-[rgb(var(--subtle))]">↗</span>
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[rgb(var(--text))] hover:bg-[rgb(var(--panel))]"
                        onClick={handleGoDocuments}
                      >
                        View Documents
                        <span className="text-[rgb(var(--subtle))]">↗</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Speed control */}
                <SpeedControl />

                {/* Voice button (waveform + dictation) */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border text-[rgb(var(--text))] transition-colors",
                    isRecording || isDictating
                      ? "border-[rgb(var(--brand))] bg-[rgba(var(--brand),0.18)]"
                      : "border-[rgb(var(--border))] bg-[rgb(var(--panel))] hover:bg-[rgba(var(--panel),0.95)]",
                  ].join(" ")}
                  aria-label="Toggle voice dictation"
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>

              {/* Quick Settings shortcut */}
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className="flex items-center gap-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1 text-[10px] text-[rgb(var(--subtle))] hover:bg-[rgba(var(--panel),0.95)]"
              >
                <Settings className="h-3 w-3" />
                Chat settings
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              placeholder="Ask me anything…"
              className="input w-full resize-none rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
            />

            {/* Dictation live transcript */}
            {(isDictating || interimTranscript) && (
              <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2 text-[11px] text-[rgb(var(--subtle))] flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-[rgb(var(--brand))] animate-pulse" />
                <span className="font-medium">Listening:</span>
                <span className="truncate">
                  {interimTranscript || "Say your message…"}
                </span>
              </div>
            )}

            {/* Attachments preview */}
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 text-[10px]">
                {pendingAttachments.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-brand/10 px-3 py-1 text-brand"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {/* Voice waveform + file + send */}
            <div className="flex flex-col gap-3">
              {(isRecording || canvasRef.current) && (
                <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2">
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-medium text-[rgb(var(--subtle))]">
                      Mic input
                    </span>
                    <canvas
                      ref={canvasRef}
                      height={40}
                      className="mt-1 w-full rounded-lg bg-[rgba(var(--surface),0.9)]"
                    />
                  </div>
                </div>
              )}

              {(voiceWaveError || dictationError) && (
                <p className="text-[10px] text-red-500">
                  {dictationError || voiceWaveError}
                </p>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(event) => handleFileChange(event.target.files)}
                  />
                  <button
                    type="button"
                    onClick={triggerFilePicker}
                    className="rounded-full border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-4 py-2 text-xs text-[rgb(var(--text))] transition hover:bg-[rgba(var(--panel),0.95)]"
                  >
                    Attach files
                  </button>
                  {pendingAttachments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleFileChange(null)}
                      className="text-[10px] text-[rgb(var(--subtle))] underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="group relative flex items-center gap-2 rounded-full bg-[rgba(var(--brand),0.98)] px-6 py-2 text-xs font-semibold text-[rgb(var(--on-accent))] shadow-sm transition hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>Send</span>
                  <span className="relative flex h-4 w-4 items-center justify-center overflow-hidden">
                    <Send className="h-3 w-3 transform transition-transform duration-200 group-active:-translate-x-3" />
                  </span>
                </button>
              </div>
            </div>
          </form>
        </>
      )}

      {/* Settings tab content */}
      {!isCollapsed && activeTab === "settings" && (
        <div className="flex flex-col gap-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-5 text-sm shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[rgb(var(--text))]">
                Chat Settings
              </h2>
              <p className="text-xs text-[rgb(var(--subtle))]">
                Tune how Nexus behaves in this console.
              </p>
            </div>
            <Settings className="h-4 w-4 text-[rgb(var(--subtle))]" />
          </div>

          <div className="mt-2 space-y-3">
            <Toggle
              label="NSFW tolerance"
              description="Relaxed filtering language-wise. Nexus will still follow global safety rules."
              checked={settings.nsfwEnabled}
              onChange={(v) => updateSetting("nsfwEnabled", v)}
            />
            <Toggle
              label="Funny mode"
              description="Allow light jokes and playful commentary in responses."
              checked={settings.humorEnabled}
              onChange={(v) => updateSetting("humorEnabled", v)}
            />
            <Toggle
              label="Technical mode"
              description="Bias responses toward structured, technical explanations."
              checked={settings.technicalMode}
              onChange={(v) => updateSetting("technicalMode", v)}
            />
            <Toggle
              label="Connected Apps"
              description="Allow Nexus to reference Workspace, Outbox, and Documents when available."
              checked={settings.connectedAppsEnabled}
              onChange={(v) => updateSetting("connectedAppsEnabled", v)}
            />
          </div>

          <p className="mt-3 text-[10px] text-[rgb(var(--subtle))]">
            These settings apply only to this chat console. Other Nexus tools
            can use their own profiles.
          </p>
        </div>
      )}
    </section>
  );
}

export default Chat;
