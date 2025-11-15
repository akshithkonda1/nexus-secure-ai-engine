import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Message, OutgoingPayload } from "../../chat/types";

type State = {
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
  sendMessage: (data: { text: string; attachments?: File[]; signal?: AbortSignal }) => Promise<void>;
  reconnect: () => void;
};

const WS_PATH = import.meta.env.VITE_WS_PATH ?? "/ws/chat";
const WS_BASE =
  import.meta.env.VITE_WS_BASE ?? window.location.origin.replace(/^http/, "ws");
const PING_MS = 25_000;
const MAX_BACKOFF_MS = 10_000;

const DEFAULT_BACKOFF_MS = 500;

type UploadResponseItem = { name: string; type: string; url?: string };

type IncomingHistory = { type: "history"; messages: Message[] };
type IncomingAssistant = { type: "assistant_message"; id?: string; text?: string };
type IncomingUserEcho = { type: "user_echo"; id?: string; text?: string };
type IncomingTyping = { type: "typing"; value?: unknown };

type IncomingServerMessage =
  | IncomingHistory
  | IncomingAssistant
  | IncomingUserEcho
  | IncomingTyping;

const isMessageArray = (value: unknown): value is Message[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof (item as Message).id === "string" &&
      typeof (item as Message).role === "string" &&
      typeof (item as Message).text === "string" &&
      typeof (item as Message).createdAt === "number",
  );

const isIncomingMessage = (value: unknown): value is IncomingServerMessage => {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  if (message.type === "history") {
    return isMessageArray(message.messages);
  }
  if (message.type === "assistant_message" || message.type === "user_echo") {
    return typeof message.text === "string" || typeof message.id === "string";
  }
  if (message.type === "typing") {
    return true;
  }
  return false;
};

export function useChatSession(sessionId: string): State {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(DEFAULT_BACKOFF_MS);
  const pingTimerRef = useRef<number | null>(null);
  const closedByUserRef = useRef(false);
  const pendingMessageIdsRef = useRef<string[]>([]);

  const url = useMemo(() => {
    const constructed = new URL(WS_PATH, WS_BASE);
    constructed.searchParams.set("session", sessionId);
    return constructed.toString();
  }, [sessionId]);

  const safeClose = useCallback(() => {
    closedByUserRef.current = true;
    wsRef.current?.close();
  }, []);

  const clearPingTimer = useCallback(() => {
    if (pingTimerRef.current) {
      window.clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  const uploadAttachments = useCallback(
    async (files: File[], signal?: AbortSignal): Promise<UploadResponseItem[]> => {
      try {
        const form = new FormData();
        files.forEach((file) => form.append("files", file));
        const res = await fetch("/api/uploads", { method: "POST", body: form, signal });
        if (!res.ok) throw new Error("Upload failed");
        const json = (await res.json()) as UploadResponseItem[];
        return json;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }
        // TODO: surface upload errors to the user
        return files.map((file) => ({ name: file.name, type: file.type }));
      }
    },
    [],
  );

  const connect = useCallback(() => {
    closedByUserRef.current = false;
    setError(null);
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        backoffRef.current = DEFAULT_BACKOFF_MS;
        ws.send(JSON.stringify({ type: "join", sessionId }));
        clearPingTimer();
        pingTimerRef.current = window.setInterval(() => {
          try {
            ws.send(JSON.stringify({ type: "ping" }));
          } catch {
            // TODO: handle ping send failures
          }
        }, PING_MS);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as unknown;
          if (!isIncomingMessage(parsed)) return;

          switch (parsed.type) {
            case "history":
              pendingMessageIdsRef.current = [];
              setMessages(parsed.messages);
              break;
            case "assistant_message":
              setIsTyping(false);
              setMessages((prev) => [
                ...prev,
                {
                  id: parsed.id ?? crypto.randomUUID(),
                  role: "assistant",
                  text: parsed.text ?? "",
                  createdAt: Date.now(),
                },
              ]);
              break;
            case "user_echo":
              setMessages((prev) => {
                const pendingId = pendingMessageIdsRef.current.shift();
                const nextMessage: Message = {
                  id: parsed.id ?? crypto.randomUUID(),
                  role: "user",
                  text: parsed.text ?? "",
                  createdAt: Date.now(),
                };
                if (!pendingId) return [...prev, nextMessage];

                const copy = [...prev];
                const index = copy.findIndex((message) => message.id === pendingId);
                if (index === -1) return [...prev, nextMessage];

                copy[index] = nextMessage;
                return copy;
              });
              break;
            case "typing":
              setIsTyping(Boolean(parsed.value));
              break;
            default:
              break;
          }
        } catch {
          // TODO: surface message parsing errors
        }
      };

      ws.onerror = () => {
        setError("Connection error");
      };

      ws.onclose = () => {
        setIsConnected(false);
        clearPingTimer();
        if (!closedByUserRef.current) {
          const wait = Math.min(backoffRef.current, MAX_BACKOFF_MS);
          backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
          window.setTimeout(connect, wait);
        }
      };
    } catch {
      setError("Failed to initialize WebSocket");
    }
  }, [clearPingTimer, sessionId, url]);

  useEffect(() => {
    connect();
    return () => {
      safeClose();
      clearPingTimer();
    };
  }, [clearPingTimer, connect, safeClose]);

  useEffect(() => {
    setMessages([]);
    pendingMessageIdsRef.current = [];
  }, [sessionId]);

  const sendMessage = useCallback(
    async ({ text, attachments, signal }: { text: string; attachments?: File[]; signal?: AbortSignal }) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error("Socket not connected");
      }

      try {
        const uploaded = attachments?.length
          ? await uploadAttachments(attachments, signal)
          : undefined;
        const payload: OutgoingPayload = {
          type: "user_message",
          sessionId,
          text,
          attachments: uploaded,
        };

        const localId = crypto.randomUUID();
        pendingMessageIdsRef.current.push(localId);
        setMessages((prev) => [
          ...prev,
          { id: localId, role: "user", text, createdAt: Date.now() },
        ]);
        setIsTyping(true);
        wsRef.current.send(JSON.stringify(payload));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        throw error;
      }
    },
    [sessionId, uploadAttachments],
  );

  const reconnect = useCallback(() => {
    safeClose();
    backoffRef.current = DEFAULT_BACKOFF_MS;
    connect();
  }, [connect, safeClose]);

  return { messages, isConnected, isTyping, error, sendMessage, reconnect };
}
