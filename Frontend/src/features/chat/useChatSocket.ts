import { useEffect, useRef, useState } from "react";
export function useChatSocket(sessionId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [stream, setStream] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${location.host}/ws/chat`);
    wsRef.current = ws;
    ws.onopen = () => setReady(true);
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === "token") setStream((s) => s + msg.value);
      if (msg.type === "done") setReady(true);
    };
    ws.onclose = () => setReady(false);
    return () => ws.close();
  }, [sessionId]);
  function send(message: string) {
    setStream("");
    setReady(false);
    wsRef.current?.send(JSON.stringify({ sessionId, message }));
  }
  return { stream, send, ready };
}
