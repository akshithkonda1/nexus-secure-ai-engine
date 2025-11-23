import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

import { getItem, setItem, setItemWithLimit } from "@/lib/storage";

export type ChatRole = "user" | "assistant";
export type MessageStatus = "pending" | "sent" | "error";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  attachments?: string[];
  createdAt: string;
  status?: MessageStatus;
  replyTo?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  pinned?: boolean;
};

export type Speed = "slow" | "normal" | "fast";

export type SettingsState = {
  nsfwEnabled: boolean;
  jokesEnabled: boolean;
  technicalMode: boolean;
  connectedApps: boolean;
};

export type ChatState = {
  sessions: ChatSession[];
  activeSessionId: string;
  settings: SettingsState;
  inputValue: string;
  pendingAttachments: string[];
  isCollapsed: boolean;
  speed: Speed;
  isThinking: boolean;
  settingsOpen: boolean;
  isRecording: boolean;
  voiceSupported: boolean | null;
  voiceWarning: string;
  searchQuery: string;
  renamingSessionId: string | null;
  renameDraft: string;
  followMessages: boolean;
  hydrated: boolean;
};

export type ChatAction =
  | {
      type: "hydrate";
      payload: {
        sessions: ChatSession[];
        activeSessionId: string;
        settings: SettingsState;
      };
    }
  | { type: "setActiveSession"; payload: string }
  | { type: "setSettings"; payload: Partial<SettingsState> }
  | { type: "setInput"; payload: string }
  | { type: "setAttachments"; payload: string[] }
  | { type: "setCollapsed"; payload: boolean }
  | { type: "setSpeed"; payload: Speed }
  | { type: "setThinking"; payload: boolean }
  | { type: "setSettingsOpen"; payload: boolean }
  | { type: "setRecording"; payload: boolean }
  | { type: "setVoiceSupported"; payload: boolean | null }
  | { type: "setVoiceWarning"; payload: string }
  | { type: "setSearchQuery"; payload: string }
  | { type: "startRename"; payload: { sessionId: string; draft: string } }
  | { type: "setRenameDraft"; payload: string }
  | { type: "commitRename"; payload: { sessionId: string; title: string } }
  | { type: "cancelRename" }
  | { type: "appendMessage"; payload: { sessionId: string; message: ChatMessage } }
  | {
      type: "updateMessage";
      payload: { sessionId: string; messageId: string; patch: Partial<ChatMessage> };
    }
  | { type: "removeMessage"; payload: { sessionId: string; messageId: string } }
  | { type: "createSession"; payload: ChatSession }
  | { type: "deleteSession"; payload: string }
  | { type: "togglePin"; payload: string }
  | { type: "setFollow"; payload: boolean };

const STORAGE_KEYS = {
  sessions: "ryuzen.chat.sessions.v1",
  activeSessionId: "ryuzen.chat.activeSessionId.v1",
  settings: "ryuzen.chat.settings.v1",
} as const;

export const RESPONSE_DELAY_MS: Record<Speed, number> = {
  slow: 1800,
  normal: 900,
  fast: 400,
};

export const defaultSettings: SettingsState = {
  nsfwEnabled: false,
  jokesEnabled: true,
  technicalMode: true,
  connectedApps: false,
};

export const safeNow = () => new Date().toISOString();

export const createId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const initialWelcome: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to Toron, an AI Debate Engine.\n\nAsk anything about your projects, documents, or life logistics — I’ll help you reason it out.",
  attachments: [],
  createdAt: safeNow(),
  status: "sent",
};

export const createFreshSession = (): ChatSession => ({
  id: createId(),
  title: "New chat",
  createdAt: safeNow(),
  messages: [initialWelcome],
  pinned: false,
});

const isMessageStatus = (value: unknown): value is MessageStatus =>
  value === "pending" || value === "sent" || value === "error";

export const sanitizeMessages = (value: unknown): ChatMessage[] => {
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

export const sanitizeSessions = (value: unknown): ChatSession[] => {
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

export const sanitizeSettings = (value: unknown): SettingsState => {
  if (!value || typeof value !== "object") return { ...defaultSettings };
  const data = value as Partial<SettingsState>;
  return {
    nsfwEnabled: Boolean(data.nsfwEnabled),
    jokesEnabled:
      data.jokesEnabled === undefined ? true : Boolean(data.jokesEnabled),
    technicalMode:
      data.technicalMode === undefined ? true : Boolean(data.technicalMode),
    connectedApps:
      data.connectedApps === undefined ? false : Boolean(data.connectedApps),
  } satisfies SettingsState;
};

const MAX_STORED_SESSIONS = 30;
const MAX_MESSAGES_PER_SESSION = 200;

const pruneSessions = (sessions: ChatSession[]): ChatSession[] => {
  const limited = sessions
    .map((session) => ({
      ...session,
      messages: session.messages.slice(-MAX_MESSAGES_PER_SESSION),
    }))
    .slice(0, MAX_STORED_SESSIONS);
  if (limited.length === 0) {
    return [createFreshSession()];
  }
  return limited;
};

const resolveActiveSessionId = (
  sessions: ChatSession[],
  preferredId: string,
): string => {
  if (sessions.length === 0) {
    return "";
  }
  if (preferredId && sessions.some((session) => session.id === preferredId)) {
    return preferredId;
  }
  return sessions[0].id;
};

const initialState: ChatState = {
  sessions: [createFreshSession()],
  activeSessionId: "",
  settings: { ...defaultSettings },
  inputValue: "",
  pendingAttachments: [],
  isCollapsed: false,
  speed: "normal",
  isThinking: false,
  settingsOpen: false,
  isRecording: false,
  voiceSupported: null,
  voiceWarning: "",
  searchQuery: "",
  renamingSessionId: null,
  renameDraft: "",
  followMessages: true,
  hydrated: false,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "hydrate": {
      const nextSessions = pruneSessions(action.payload.sessions);
      const activeId = resolveActiveSessionId(
        [...nextSessions],
        action.payload.activeSessionId,
      );
      return {
        ...state,
        sessions: nextSessions,
        activeSessionId: activeId,
        settings: { ...action.payload.settings },
        hydrated: true,
      };
    }
    case "setActiveSession": {
      const nextActive = resolveActiveSessionId(
        [...state.sessions],
        action.payload,
      );
      return { ...state, activeSessionId: nextActive };
    }
    case "setSettings": {
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    }
    case "setInput":
      return { ...state, inputValue: action.payload };
    case "setAttachments":
      return { ...state, pendingAttachments: action.payload };
    case "setCollapsed":
      return { ...state, isCollapsed: action.payload };
    case "setSpeed":
      return { ...state, speed: action.payload };
    case "setThinking":
      return { ...state, isThinking: action.payload };
    case "setSettingsOpen":
      return { ...state, settingsOpen: action.payload };
    case "setRecording":
      return { ...state, isRecording: action.payload };
    case "setVoiceSupported":
      return { ...state, voiceSupported: action.payload };
    case "setVoiceWarning":
      return { ...state, voiceWarning: action.payload };
    case "setSearchQuery":
      return { ...state, searchQuery: action.payload };
    case "startRename":
      return {
        ...state,
        renamingSessionId: action.payload.sessionId,
        renameDraft: action.payload.draft,
      };
    case "setRenameDraft":
      return { ...state, renameDraft: action.payload };
    case "commitRename": {
      const trimmed = action.payload.title.trim();
      const nextTitle = trimmed ? trimmed : "New chat";
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.payload.sessionId
            ? { ...session, title: nextTitle }
            : session,
        ),
        renamingSessionId: null,
        renameDraft: "",
      };
    }
    case "cancelRename":
      return { ...state, renamingSessionId: null, renameDraft: "" };
    case "appendMessage":
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.payload.sessionId
            ? {
                ...session,
                messages: [...session.messages, action.payload.message].slice(
                  -MAX_MESSAGES_PER_SESSION,
                ),
              }
            : session,
        ),
      };
    case "updateMessage":
      return {
        ...state,
        sessions: state.sessions.map((session) => {
          if (session.id !== action.payload.sessionId) return session;
          const messages = session.messages.map((message) =>
            message.id === action.payload.messageId
              ? { ...message, ...action.payload.patch }
              : message,
          );
          return { ...session, messages };
        }),
      };
    case "removeMessage":
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.payload.sessionId
            ? {
                ...session,
                messages: session.messages.filter(
                  (message) => message.id !== action.payload.messageId,
                ),
              }
            : session,
        ),
      };
    case "createSession": {
      const nextSessions = pruneSessions([action.payload, ...state.sessions]);
      return {
        ...state,
        sessions: nextSessions,
        activeSessionId: nextSessions[0].id,
      };
    }
    case "deleteSession": {
      const remaining = state.sessions.filter(
        (session) => session.id !== action.payload,
      );
      const nextSessions = pruneSessions(
        remaining.length ? remaining : [createFreshSession()],
      );
      return {
        ...state,
        sessions: nextSessions,
        activeSessionId: resolveActiveSessionId(
          [...nextSessions],
          state.activeSessionId === action.payload
            ? nextSessions[0].id
            : state.activeSessionId,
        ),
      };
    }
    case "togglePin":
      return {
        ...state,
        sessions: state.sessions.map((session) =>
          session.id === action.payload
            ? { ...session, pinned: !session.pinned }
            : session,
        ),
      };
    case "setFollow":
      return { ...state, followMessages: action.payload };
    default:
      return state;
  }
};

const ChatStateContext = createContext<ChatState | undefined>(undefined);
const ChatDispatchContext =
  createContext<React.Dispatch<ChatAction> | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const [storedSessions, storedActiveId, storedSettings] =
          await Promise.all([
            getItem<ChatSession[]>(STORAGE_KEYS.sessions),
            getItem<string>(STORAGE_KEYS.activeSessionId),
            getItem<SettingsState>(STORAGE_KEYS.settings),
          ]);
        if (cancelled) return;
        dispatch({
          type: "hydrate",
          payload: {
            sessions: sanitizeSessions(storedSessions ?? []),
            activeSessionId:
              typeof storedActiveId === "string" ? storedActiveId : "",
            settings: sanitizeSettings(storedSettings ?? defaultSettings),
          },
        });
      } catch {
        dispatch({
          type: "hydrate",
          payload: {
            sessions: [createFreshSession()],
            activeSessionId: "",
            settings: { ...defaultSettings },
          },
        });
      } finally {
        hydratedRef.current = true;
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current || !state.hydrated) return;
    void setItemWithLimit(
      STORAGE_KEYS.sessions,
      pruneSessions(state.sessions),
      { maxEntries: MAX_STORED_SESSIONS },
    );
  }, [state.sessions, state.hydrated]);

  useEffect(() => {
    if (!hydratedRef.current || !state.hydrated) return;
    void setItem(STORAGE_KEYS.activeSessionId, state.activeSessionId);
  }, [state.activeSessionId, state.hydrated]);

  useEffect(() => {
    if (!hydratedRef.current || !state.hydrated) return;
    void setItem(STORAGE_KEYS.settings, state.settings);
  }, [state.settings, state.hydrated]);

  const memoizedState = useMemo(() => state, [state]);

  return (
    <ChatDispatchContext.Provider value={dispatch}>
      <ChatStateContext.Provider value={memoizedState}>
        {children}
      </ChatStateContext.Provider>
    </ChatDispatchContext.Provider>
  );
};

export const useChatState = () => {
  const context = useContext(ChatStateContext);
  if (!context) {
    throw new Error("useChatState must be used within a ChatProvider");
  }
  return context;
};

export const useChatDispatch = () => {
  const context = useContext(ChatDispatchContext);
  if (!context) {
    throw new Error("useChatDispatch must be used within a ChatProvider");
  }
  return context;
};

export const autoTitleFromMessages = (messages: ChatMessage[]): string => {
  const firstUser = messages.find((m) => m.role === "user" && m.content.trim());
  if (!firstUser) return "New chat";
  const trimmed = firstUser.content.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 42) return trimmed;
  return `${trimmed.slice(0, 39)}…`;
};
