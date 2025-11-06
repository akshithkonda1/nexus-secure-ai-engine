import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Message, OutgoingPayload } from "../../chat/types";

type State = {
  messages: Message[];
  isConnected: boolean;
  isTyping: boolean;
  error: string | null;
  sendMessage: (data: { text: string; attachments?: File[] }) => Promise<void>;
  reconnect: () => void;
};

const WS_PATH = import.meta.env.VITE_WS_PATH ?? "/ws/chat";
const WS_BASE = import.meta.env.VITE_WS_BASE ?? (window.location.origin.replace(/^http/,"ws") as string);
const PING_MS = 25000;
const MAX_BACKOFF_MS = 10000;

export function useChatSession(sessionId: string): State {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(500);
  const pingTimerRef = useRef<number | null>(null);
  const closedByUserRef = useRef(false);

  const url = useMemo(() => {
    const u = new URL(WS_PATH, WS_BASE);
    u.searchParams.set("session", sessionId);
    return u.toString();
  }, [sessionId]);

  const safeClose = () => { closedByUserRef.current = true; wsRef.current?.close(); };

  const connect = useCallback(() => {
    closedByUserRef.current = false; setError(null);
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        backoffRef.current = 500;
        ws.send(JSON.stringify({ type:"join", sessionId }));
        if (pingTimerRef.current) window.clearInterval(pingTimerRef.current);
        pingTimerRef.current = window.setInterval(() => { try { ws.send(JSON.stringify({ type:"ping" })); } catch {} }, PING_MS) as unknown as number;
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          switch (data.type) {
            case "history":
              setMessages(data.messages as Message[]); break;
            case "assistant_message":
              setIsTyping(false);
              setMessages(p => [...p, { id: data.id ?? crypto.randomUUID(), role:"assistant", text:data.text ?? "", createdAt: Date.now() }]);
              break;
            case "user_echo":
              setMessages(p => [...p, { id: data.id ?? crypto.randomUUID(), role:"user", text:data.text ?? "", createdAt: Date.now() }]);
              break;
            case "typing":
              setIsTyping(Boolean(data.value)); break;
            default: break;
          }
        } catch {}
      };

      ws.onerror = () => setError("Connection error");

      ws.onclose = () => {
        setIsConnected(false);
        if (pingTimerRef.current) { window.clearInterval(pingTimerRef.current); pingTimerRef.current = null; }
        if (!closedByUserRef.current) {
          const wait = Math.min(backoffRef.current, MAX_BACKOFF_MS);
          backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
          setTimeout(connect, wait);
        }
      };
    } catch { setError("Failed to initialize WebSocket"); }
  }, [sessionId, url]);

  useEffect(() => {
    connect();
    return () => { safeClose(); if (pingTimerRef.current) window.clearInterval(pingTimerRef.current); };
  }, [connect]);

  const uploadAttachments = async (files: File[]) => {
    try {
      const form = new FormData();
      files.forEach(f => form.append("files", f));
      const res = await fetch("/api/uploads", { method:"POST", body: form });
      if (!res.ok) throw new Error();
      return (await res.json()) as { name:string; type:string; url:string }[];
    } catch {
      return files.map(f => ({ name:f.name, type:f.type, url: undefined }));
    }
  };

  const sendMessage = useCallback(async ({ text, attachments }: { text:string; attachments?: File[] }) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) throw new Error("Socket not connected");
    const uploaded = attachments?.length ? await uploadAttachments(attachments) : undefined;
    const payload: OutgoingPayload = { type:"user_message", sessionId, text, attachments: uploaded };

    setMessages(p => [...p, { id: crypto.randomUUID(), role:"user", text, createdAt: Date.now() }]);
    setIsTyping(true);
    wsRef.current.send(JSON.stringify(payload));
  }, [sessionId]);

  const reconnect = useCallback(() => { safeClose(); backoffRef.current = 500; connect(); }, [connect]);

  return { messages, isConnected, isTyping, error, sendMessage, reconnect };
}
